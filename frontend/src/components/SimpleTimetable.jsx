import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: '#f0f8ff',
  border: '1px solid #60b5ff',
  textAlign: 'center',
  padding: '8px',
  color: '#60b5ff'
}));

const TimeSlotCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#60b5ff',
  color: 'white',
  fontWeight: 'bold',
  border: '1px solid #60b5ff',
  textAlign: 'center',
  minWidth: '100px'
}));

const SubjectCell = styled(TableCell)(({ type }) => ({
  border: '1px solid #ddd',
  textAlign: 'center',
  padding: '12px 8px',
  backgroundColor: 
    type === 'lecture' ? '#e3f2fd' :
    type === 'practical' ? '#e8f5e8' :
    type === 'break' ? '#f5f5f5' : 'white',
  fontStyle: type === 'break' ? 'italic' : 'normal'
}));

const SimpleTimetable = () => {
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState({});
  const [selectedClass, setSelectedClass] = useState({ year: '', division: '', department: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [timetableLoaded, setTimetableLoaded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const timeSlots = [
    '9:00-10:00', '10:00-11:00', '11:00-11:15',
    '11:15-12:15', '12:15-13:15', '13:15-16:15'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchAvailableClasses();
  }, []);

  const fetchAvailableClasses = async () => {
    try {
      const response = await apiClient.get('/api/timetable/classes');
      setAvailableClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedClass.year || !selectedClass.division) {
      toast.error('Please select year and division');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        year: selectedClass.year,
        division: selectedClass.division
      });
      
      if (selectedClass.department) {
        params.append('department', selectedClass.department);
      }

      const response = await apiClient.get(`/api/timetable?${params}`);
      
      if (response.data && response.data.timetable) {
        setTimetableData(response.data.timetable);
        setTimetableLoaded(true);
        toast.success('Timetable loaded successfully!');
      } else {
        setTimetableData({});
        setTimetableLoaded(false);
        toast.error('No timetable data found');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectForSlot = (day, timeSlot) => {
    const daySchedule = timetableData[day] || [];
    return daySchedule.find(item => item.timeSlot === timeSlot);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'lecture': return 'primary';
      case 'practical': return 'success';
      case 'break': return 'default';
      default: return 'primary';
    }
  };

  const renderTimetableGrid = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell>Time</StyledTableCell>
            {days.map(day => (
              <StyledTableCell key={day}>{day}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map(timeSlot => (
            <TableRow key={timeSlot}>
              <TimeSlotCell>{timeSlot}</TimeSlotCell>
              {days.map(day => {
                const subject = getSubjectForSlot(day, timeSlot);
                return (
                  <SubjectCell key={`${day}-${timeSlot}`} type={subject?.type}>
                    {subject ? (
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {subject.subject}
                        </Typography>
                        {subject.type !== 'break' && (
                          <>
                            <Typography variant="caption" display="block">
                              👨🏫 {subject.teacher}
                            </Typography>
                            <Typography variant="caption" display="block">
                              🏢 {subject.room}
                            </Typography>
                            <Chip 
                              label={subject.type.toUpperCase()} 
                              size="small" 
                              color={getTypeColor(subject.type)}
                              sx={{ mt: 0.5, fontSize: '0.6rem', height: '16px' }}
                            />
                          </>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Free
                      </Typography>
                    )}
                  </SubjectCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDayWiseView = () => (
    <Grid container spacing={2}>
      {days.map(day => {
        const daySchedule = timetableData[day] || [];
        return (
          <Grid item xs={12} md={6} lg={4} key={day}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
                  {day}
                </Typography>
                {daySchedule.length > 0 ? (
                  daySchedule.map((item, index) => (
                    <Box key={index} sx={{ mb: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e0e7ff' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#60b5ff' }}>
                          {item.timeSlot}
                        </Typography>
                        <Chip 
                          label={item.type} 
                          size="small" 
                          color={getTypeColor(item.type)}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.subject}
                      </Typography>
                      {item.type !== 'break' && (
                        <>
                          <Typography variant="caption" display="block" color="textSecondary">
                            👨🏫 {item.teacher}
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            🏢 {item.room}
                          </Typography>
                        </>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No classes scheduled
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 1 }}>
            📅 My Class Timetable
          </Typography>
          <Typography variant="body1" color="textSecondary">
            View your weekly class schedule and timings
          </Typography>
        </Box>

        {/* Class Selection */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
          <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
            🎯 Select Your Class
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Academic Year</InputLabel>
                <Select
                  value={selectedClass.year}
                  onChange={(e) => setSelectedClass({...selectedClass, year: e.target.value})}
                  label="Academic Year"
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                  }}
                >
                  {availableClasses.years?.map(year => (
                    <MenuItem key={year} value={year}>
                      {year === 1 ? '1st Year (FE)' : year === 2 ? '2nd Year (SE)' : year === 3 ? '3rd Year (TE)' : '4th Year (BE)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Division</InputLabel>
                <Select
                  value={selectedClass.division}
                  onChange={(e) => setSelectedClass({...selectedClass, division: e.target.value})}
                  label="Division"
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                  }}
                >
                  {availableClasses.divisions?.map(division => (
                    <MenuItem key={division} value={division}>
                      Division {division}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ '&.Mui-focused': { color: '#60b5ff' } }}>Department</InputLabel>
                <Select
                  value={selectedClass.department}
                  onChange={(e) => setSelectedClass({...selectedClass, department: e.target.value})}
                  label="Department"
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60b5ff' }
                  }}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {availableClasses.departments?.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button 
                variant="contained" 
                onClick={fetchTimetable}
                disabled={loading || !selectedClass.year || !selectedClass.division}
                fullWidth
                sx={{
                  bgcolor: '#60b5ff',
                  py: 1.5,
                  '&:hover': { bgcolor: '#4a9eff' }
                }}
              >
                {loading ? '⏳ Loading...' : '📋 View Timetable'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* View Mode Toggle */}
        {timetableLoaded && Object.keys(timetableData).length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('grid')}
              sx={{
                borderColor: '#60b5ff',
                color: viewMode === 'grid' ? 'white' : '#60b5ff',
                bgcolor: viewMode === 'grid' ? '#60b5ff' : 'transparent',
                '&:hover': { bgcolor: viewMode === 'grid' ? '#4a9eff' : 'rgba(96, 181, 255, 0.1)' }
              }}
            >
              📊 Grid View
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('cards')}
              sx={{
                borderColor: '#60b5ff',
                color: viewMode === 'cards' ? 'white' : '#60b5ff',
                bgcolor: viewMode === 'cards' ? '#60b5ff' : 'transparent',
                '&:hover': { bgcolor: viewMode === 'cards' ? '#4a9eff' : 'rgba(96, 181, 255, 0.1)' }
              }}
            >
              📱 Card View
            </Button>
          </Box>
        )}

        {/* Timetable Display */}
        {timetableLoaded && Object.keys(timetableData).length > 0 ? (
          <>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#60b5ff', fontWeight: 'bold' }}>
                📚 {selectedClass.year && selectedClass.division && 
                  `${selectedClass.year === 1 ? '1st' : selectedClass.year === 2 ? '2nd' : selectedClass.year === 3 ? '3rd' : '4th'} Year - Division ${selectedClass.division}`
                }
                {selectedClass.department && ` - ${selectedClass.department} Department`}
              </Typography>
              
              {/* Legend */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="📖 Lecture" color="primary" size="small" />
                  <Chip label="🔬 Practical" color="success" size="small" />
                  <Chip label="☕ Break" color="default" size="small" />
                </Box>
              </Box>
            </Paper>

            {viewMode === 'grid' ? renderTimetableGrid() : renderDayWiseView()}
          </>
        ) : !loading && (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 3, 
              textAlign: 'center',
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>📋 No Timetable Selected</Typography>
            <Typography variant="body2">
              Select your academic year and division above to view your class timetable
            </Typography>
          </Alert>
        )}

        {/* Back Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="outlined"
            onClick={() => navigate('/student')}
            sx={{ 
              borderColor: '#60b5ff', 
              color: '#60b5ff',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': { 
                bgcolor: 'rgba(96, 181, 255, 0.1)',
                borderColor: '#4a9eff'
              }
            }}
          >
            ← Back to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SimpleTimetable;