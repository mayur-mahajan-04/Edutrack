const express = require('express');
const Attendance = require('../models/Attendance');
const QRCodeModel = require('../models/QRCode');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Calculate distance between two GPS coordinates
 * using the Haversine formula.
 *
 * @returns distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const coordinates = [lat1, lon1, lat2, lon2].map(Number);

  // Validate coordinates
  if (coordinates.some((value) => !Number.isFinite(value))) {
    console.error('Invalid coordinates for distance calculation:', {
      lat1,
      lon1,
      lat2,
      lon2
    });

    return Infinity;
  }

  const [
    latitude1,
    longitude1,
    latitude2,
    longitude2
  ] = coordinates;

  // Earth's radius in meters
  const R = 6371e3;

  const φ1 = latitude1 * Math.PI / 180;
  const φ2 = latitude2 * Math.PI / 180;

  const Δφ = (latitude2 - latitude1) * Math.PI / 180;
  const Δλ = (longitude2 - longitude1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) *
    Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return R * c;
};


// ============================================================
// MARK ATTENDANCE VIA QR CODE
// ============================================================

router.post(
  '/mark',
  auth,
  authorize('student'),
  async (req, res) => {
    try {
      const {
        qrCodeId,
        latitude,
        longitude,
        faceVerified = false
      } = req.body;

      // --------------------------------------------------------
      // Validate QR Code ID
      // --------------------------------------------------------

      if (!qrCodeId) {
        return res.status(400).json({
          message: 'QR code ID is required'
        });
      }

      // --------------------------------------------------------
      // Validate location presence
      // --------------------------------------------------------

      if (
        latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null
      ) {
        return res.status(400).json({
          message: 'Location is required for attendance marking'
        });
      }

      // Convert coordinates to numbers
      const studentLatitude = Number(latitude);
      const studentLongitude = Number(longitude);

      // --------------------------------------------------------
      // Validate coordinate values
      // --------------------------------------------------------

      if (
        !Number.isFinite(studentLatitude) ||
        !Number.isFinite(studentLongitude)
      ) {
        return res.status(400).json({
          message: 'Invalid location coordinates'
        });
      }

      // Validate latitude range
      if (
        studentLatitude < -90 ||
        studentLatitude > 90
      ) {
        return res.status(400).json({
          message: 'Invalid latitude value'
        });
      }

      // Validate longitude range
      if (
        studentLongitude < -180 ||
        studentLongitude > 180
      ) {
        return res.status(400).json({
          message: 'Invalid longitude value'
        });
      }

      console.log(
        'Received student location:',
        {
          latitude: studentLatitude,
          longitude: studentLongitude,
          type: typeof studentLatitude,
          type2: typeof studentLongitude
        }
      );


      // ========================================================
      // FIND QR CODE
      // ========================================================

      const qrCode = await QRCodeModel
        .findById(qrCodeId)
        .populate('teacher', 'name')
        .lean();

      // QR code does not exist
      if (!qrCode) {
        return res.status(400).json({
          message: 'Invalid QR code'
        });
      }

      // QR code inactive
      if (!qrCode.isActive) {
        return res.status(400).json({
          message: 'Invalid or inactive QR code'
        });
      }

      // --------------------------------------------------------
      // Check QR expiration
      // --------------------------------------------------------

      if (new Date() > qrCode.expiresAt) {
        await QRCodeModel.findByIdAndUpdate(
          qrCodeId,
          {
            isActive: false
          }
        );

        return res.status(400).json({
          message: 'QR code has expired'
        });
      }


      // ========================================================
      // LOCATION VALIDATION
      // ========================================================

      if (
        qrCode.location &&
        qrCode.location.latitude !== undefined &&
        qrCode.location.latitude !== null &&
        qrCode.location.longitude !== undefined &&
        qrCode.location.longitude !== null
      ) {
        // Convert QR coordinates
        const qrLatitude = Number(
          qrCode.location.latitude
        );

        const qrLongitude = Number(
          qrCode.location.longitude
        );

        // Validate QR coordinates
        if (
          !Number.isFinite(qrLatitude) ||
          !Number.isFinite(qrLongitude)
        ) {
          console.error(
            'Invalid QR location:',
            qrCode.location
          );

          return res.status(500).json({
            message: 'Invalid QR code location configuration'
          });
        }

        // ------------------------------------------------------
        // Validate QR latitude/longitude ranges
        // ------------------------------------------------------

        if (
          qrLatitude < -90 ||
          qrLatitude > 90 ||
          qrLongitude < -180 ||
          qrLongitude > 180
        ) {
          console.error(
            'QR location out of range:',
            {
              qrLatitude,
              qrLongitude
            }
          );

          return res.status(500).json({
            message: 'Invalid QR code location configuration'
          });
        }

        // ------------------------------------------------------
        // Get allowed radius
        //
        // QR-specific radius is preferred.
        // Default = 50 meters.
        // ------------------------------------------------------

        const allowedRadius =
          Number(qrCode.location.radius) || 50;

        // ------------------------------------------------------
        // Calculate distance
        // ------------------------------------------------------

        const distance = calculateDistance(
          studentLatitude,
          studentLongitude,
          qrLatitude,
          qrLongitude
        );

        console.log(
          `Attendance location validation: ` +
          `Student(${studentLatitude}, ${studentLongitude}) ` +
          `vs QR(${qrLatitude}, ${qrLongitude}) ` +
          `= ${distance.toFixed(2)}m ` +
          `(limit: ${allowedRadius}m)`
        );

        // ------------------------------------------------------
        // Reject if outside allowed radius
        // ------------------------------------------------------

        if (distance > allowedRadius) {
          return res.status(400).json({
            message:
              `You must be within ${allowedRadius} meters ` +
              `of the classroom to mark attendance. ` +
              `You are ${Math.round(distance)} meters away.`,

            distance: Math.round(distance),

            allowedRadius
          });
        }

        console.log(
          `Location validation successful. ` +
          `Student is ${distance.toFixed(2)}m away ` +
          `(allowed: ${allowedRadius}m)`
        );
      }


      // ========================================================
      // CHECK DUPLICATE ATTENDANCE
      // ========================================================

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const tomorrow = new Date(
        today.getTime() +
        24 * 60 * 60 * 1000
      );

      const existingAttendance =
        await Attendance.findOne({
          student: req.user._id,

          subject: qrCode.subject,

          date: {
            $gte: today,
            $lt: tomorrow
          }
        }).lean();

      if (existingAttendance) {
        return res.status(400).json({
          message:
            'Attendance already marked for this subject today'
        });
      }


      // ========================================================
      // CREATE ATTENDANCE
      // ========================================================

      const attendance = new Attendance({
        student: req.user._id,

        teacher: qrCode.teacher._id,

        subject: qrCode.subject,

        location: {
          latitude: studentLatitude,
          longitude: studentLongitude
        },

        verificationMethod: 'qr',

        qrCodeId,

        faceVerified,

        status: 'present'
      });


      // ========================================================
      // SAVE ATTENDANCE
      // ========================================================

      const savedAttendance =
        await attendance.save();


      // ========================================================
      // RESPONSE
      // ========================================================

      return res.json({
        message:
          'Attendance marked successfully',

        attendance: {
          id: savedAttendance._id,

          subject:
            savedAttendance.subject,

          date:
            savedAttendance.date,

          status:
            savedAttendance.status
        }
      });

    } catch (error) {
      console.error(
        'Mark attendance error:',
        error
      );

      return res.status(500).json({
        message: 'Server error'
      });
    }
  }
);


// ============================================================
// GET STUDENT ATTENDANCE HISTORY
// ============================================================

router.get(
  '/student',
  auth,
  async (req, res) => {
    try {
      const attendance =
        await Attendance.find({
          student: req.user._id
        })
        .populate('teacher', 'name')
        .sort({
          date: -1
        });

      return res.json(attendance);

    } catch (error) {
      console.error(
        'Fetch attendance error:',
        error.message
      );

      return res.status(500).json({
        message: 'Server error'
      });
    }
  }
);


// ============================================================
// GET STUDENT ATTENDANCE BY STUDENT ID
// Teachers/Admins
// ============================================================

router.get(
  '/student/:studentId',
  auth,
  authorize('teacher', 'admin'),
  async (req, res) => {
    try {
      const {
        studentId
      } = req.params;

      const attendance =
        await Attendance.find({
          student: studentId
        })
        .populate('teacher', 'name')
        .sort({
          date: -1
        });

      return res.json(attendance);

    } catch (error) {
      console.error(
        'Fetch student attendance error:',
        error.message
      );

      return res.status(500).json({
        message: 'Server error'
      });
    }
  }
);


// ============================================================
// GET CLASS ATTENDANCE
// Teachers and Admins
// ============================================================

router.get(
  '/class',
  auth,
  authorize('teacher', 'admin'),
  async (req, res) => {
    try {
      const {
        subject,
        date
      } = req.query;

      // --------------------------------------------------------
      // Validate subject
      // --------------------------------------------------------

      if (
        !subject ||
        typeof subject !== 'string'
      ) {
        return res.status(400).json({
          message: 'Valid subject is required'
        });
      }


      // --------------------------------------------------------
      // Escape regex characters
      // --------------------------------------------------------

      const esc = (s) =>
        s.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );

      const subjectFilter = {
        $regex: new RegExp(
          `^${esc(subject.trim())}$`,
          'i'
        )
      };


      // --------------------------------------------------------
      // Date helper
      // --------------------------------------------------------

      const dayBoundsLocal = (
        dateStr
      ) => {
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(
            dateStr
          )
        ) {
          return null;
        }

        const [
          y,
          m,
          d
        ] = dateStr
          .split('-')
          .map(Number);

        const start = new Date(
          y,
          m - 1,
          d,
          0,
          0,
          0,
          0
        );

        const end = new Date(
          y,
          m - 1,
          d + 1,
          0,
          0,
          0,
          0
        );

        return {
          start,
          end
        };
      };


      // --------------------------------------------------------
      // Date filter
      // --------------------------------------------------------

      let dateFilter = {};

      if (
        req.query.startDate &&
        req.query.endDate
      ) {
        const startBounds =
          dayBoundsLocal(
            req.query.startDate
          );

        const endBounds =
          dayBoundsLocal(
            req.query.endDate
          );

        if (
          !startBounds ||
          !endBounds
        ) {
          return res.status(400).json({
            message:
              'Invalid date format'
          });
        }

        dateFilter = {
          date: {
            $gte: startBounds.start,
            $lt: endBounds.end
          }
        };

      } else if (date) {

        const bounds =
          dayBoundsLocal(date);

        if (!bounds) {
          return res.status(400).json({
            message:
              'Invalid date format'
          });
        }

        dateFilter = {
          date: {
            $gte: bounds.start,
            $lt: bounds.end
          }
        };
      }


      // --------------------------------------------------------
      // Query attendance
      // --------------------------------------------------------

      const attendance =
        await Attendance.find({
          subject: subjectFilter,

          ...dateFilter,

          ...(req.user.role === 'teacher'
            ? {
                teacher: req.user._id
              }
            : {})
        })
        .populate(
          'student',
          'name studentId department semester'
        )
        .populate(
          'teacher',
          'name'
        )
        .sort({
          date: -1
        });


      return res.json(
        attendance
      );

    } catch (error) {

      console.error(
        'Fetch class attendance error:',
        error.message
      );

      return res.status(500).json({
        message: 'Server error'
      });
    }
  }
);


// ============================================================
// SUBMIT FINAL ATTENDANCE
// Teachers
// ============================================================

router.post(
  '/submit',
  auth,
  authorize('teacher'),
  async (req, res) => {
    try {

      const {
        qrCodeId,
        attendanceList
      } = req.body;

      // --------------------------------------------------------
      // Validate QR code ID
      // --------------------------------------------------------

      if (!qrCodeId) {
        return res.status(400).json({
          message:
            'QR code ID is required'
        });
      }

      // --------------------------------------------------------
      // Validate attendance list
      // --------------------------------------------------------

      if (
        !Array.isArray(
          attendanceList
        )
      ) {
        return res.status(400).json({
          message:
            'Attendance list must be an array'
        });
      }


      // --------------------------------------------------------
      // Deactivate QR code
      // --------------------------------------------------------

      await QRCodeModel.findByIdAndUpdate(
        qrCodeId,
        {
          isActive: false
        }
      );


      return res.json({
        message:
          'Attendance submitted successfully',

        count:
          attendanceList.length
      });

    } catch (error) {

      console.error(
        'Submit attendance error:',
        error.message
      );

      return res.status(500).json({
        message: 'Server error'
      });
    }
  }
);


// ============================================================
// GET ATTENDANCE STATISTICS
// Admin only
// ============================================================

router.get(
  '/stats',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {

      // --------------------------------------------------------
      // Total students
      // --------------------------------------------------------

      const totalStudents =
        await User.countDocuments({
          role: 'student'
        });


      // --------------------------------------------------------
      // Total teachers
      // --------------------------------------------------------

      const totalTeachers =
        await User.countDocuments({
          role: 'teacher'
        });


      // --------------------------------------------------------
      // Today's attendance
      // --------------------------------------------------------

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const todayAttendance =
        await Attendance.countDocuments({
          date: {
            $gte: today
          }
        });


      // --------------------------------------------------------
      // Attendance by subject
      // --------------------------------------------------------

      const attendanceBySubject =
        await Attendance.aggregate([
          {
            $group: {
              _id: '$subject',

              count: {
                $sum: 1
              }
            }
          },

          {
            $sort: {
              count: -1
            }
          }
        ]);


      return res.json({
        totalStudents,

        totalTeachers,

        todayAttendance,

        attendanceBySubject
      });

    } catch (error) {

      console.error(
        'Fetch stats error:',
        error.message
      );

      return res.status(500).json({
        message: 'Server error'
      });
    }
  }
);


module.exports = router;
