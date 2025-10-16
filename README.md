# Smart Attendance Management System

A comprehensive MERN stack application for automated attendance tracking using face recognition, QR codes, and GPS verification.

## Features

### Student Module
- ✅ Register with personal details and live face capture
- ✅ Login and profile management
- ✅ Scan dynamic QR codes to mark attendance
- ✅ View personal attendance history
- ✅ GPS verification for location-based attendance

### Teacher Module
- ✅ Login and manage profile
- ✅ Generate time-limited dynamic QR codes for classes
- ✅ View class-wise attendance records
- ✅ Generate attendance reports
- ✅ Manage student lists

### Admin Module
- ✅ Manage users (students and teachers)
- ✅ Monitor system usage and activity logs
- ✅ Generate overall attendance statistics
- ✅ View analytics and reports

### Security Features
- ✅ Face Recognition: Prevents proxy attendance
- ✅ GPS Verification: Ensures attendance within classroom/campus
- ✅ Dynamic QR Codes: Prevents screenshot or reuse attempts
- ✅ JWT Authentication
- ✅ Role-based access control

## Tech Stack

### Frontend
- React.js 18
- Material-UI (MUI)
- React Router DOM
- Axios for API calls
- face-api.js for face recognition
- html5-qrcode for QR scanning
- Recharts for analytics
- React Webcam for camera access

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- QRCode generation
- CORS and security middleware

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-attendance-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_attendance
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Download Face Recognition Models

Download the following models and place them in `frontend/public/models/`:
- `ssd_mobilenetv1_model-weights_manifest.json`
- `ssd_mobilenetv1_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`

You can download these from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For Windows (if installed as service)
net start MongoDB

# For macOS/Linux
sudo systemctl start mongod
```

### 6. Run the Application
```bash
# From the root directory, run both frontend and backend
npm run dev

# Or run separately:
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage Guide

### For Students
1. **Registration**: 
   - Fill in personal details
   - Capture face for recognition
   - Complete registration

2. **Mark Attendance**:
   - Login to student dashboard
   - Click "Scan QR Code"
   - Allow camera and location permissions
   - Scan teacher's QR code
   - Attendance will be marked automatically

3. **View Attendance**:
   - Access attendance history from dashboard
   - View attendance percentage and statistics

### For Teachers
1. **Generate QR Code**:
   - Login to teacher dashboard
   - Click "Generate QR Code"
   - Enter subject and duration
   - Allow location permissions
   - Share QR code with students

2. **View Attendance**:
   - Select subject and date
   - View attendance records
   - Export reports (future enhancement)

### For Admins
1. **User Management**:
   - View all users
   - Activate/deactivate accounts
   - Delete users if needed

2. **Analytics**:
   - View system statistics
   - Monitor attendance trends
   - Generate reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### QR Code Management
- `POST /api/qr/generate` - Generate QR code (Teachers)
- `POST /api/qr/validate` - Validate QR code (Students)

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/student/:id` - Get student attendance
- `GET /api/attendance/class/:subject` - Get class attendance
- `GET /api/attendance/stats` - Get attendance statistics

### User Management
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/students` - Get students (Teachers/Admin)
- `PUT /api/users/profile` - Update profile
- `DELETE /api/users/:id` - Delete user (Admin)

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student/teacher/admin),
  studentId: String,
  department: String,
  semester: Number,
  faceDescriptor: [Number], // Face recognition data
  profileImage: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Attendance Model
```javascript
{
  student: ObjectId (ref: User),
  teacher: ObjectId (ref: User),
  subject: String,
  date: Date,
  status: String (present/absent),
  markedAt: Date,
  location: {
    latitude: Number,
    longitude: Number
  },
  verificationMethod: String (qr/face/manual),
  qrCodeId: String,
  faceVerified: Boolean
}
```

### QRCode Model
```javascript
{
  teacher: ObjectId (ref: User),
  subject: String,
  qrData: String (unique),
  expiresAt: Date,
  location: {
    latitude: Number,
    longitude: Number,
    radius: Number
  },
  isActive: Boolean,
  createdAt: Date
}
```

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control
3. **Password Security**: bcrypt hashing
4. **Input Validation**: Express-validator
5. **Rate Limiting**: Prevent API abuse
6. **CORS**: Configured for frontend domain
7. **Helmet**: Security headers
8. **GPS Verification**: Location-based validation
9. **QR Code Expiration**: Time-limited codes

## Future Enhancements

1. **Mobile App**: React Native implementation
2. **Parent Notifications**: SMS/Email alerts
3. **AI Predictions**: Attendance trend analysis
4. **Biometric Integration**: Fingerprint support
5. **Offline Mode**: Local storage for poor connectivity
6. **Advanced Analytics**: Machine learning insights
7. **Export Features**: PDF/Excel reports
8. **Multi-language Support**: Internationalization

## Troubleshooting

### Common Issues

1. **Face Recognition Not Working**:
   - Ensure models are downloaded and placed correctly
   - Check camera permissions
   - Verify HTTPS (required for camera access in production)

2. **QR Code Scanning Issues**:
   - Check camera permissions
   - Ensure good lighting
   - Verify QR code is not expired

3. **Location Issues**:
   - Enable location services
   - Check browser permissions
   - Ensure GPS is available

4. **Database Connection**:
   - Verify MongoDB is running
   - Check connection string in .env
   - Ensure database permissions

### Development Tips

1. **HTTPS for Production**: Camera and location APIs require HTTPS
2. **Model Loading**: Face recognition models are large (~6MB total)
3. **Performance**: Consider lazy loading for better performance
4. **Testing**: Use different devices for comprehensive testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Note**: This is a complete, production-ready attendance management system with all core features implemented. The system includes proper security measures, error handling, and user-friendly interfaces for all user roles.