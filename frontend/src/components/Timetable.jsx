import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[100],
  border: '1px solid #ddd',
  textAlign: 'center',
  padding: '8px'
}));

const TimeSlotCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  border: '1px solid #ddd',
  textAlign: 'center',
  minWidth: '100px'
}));

const SubjectCell = styled(TableCell)(({ type, theme }) => ({
  border: '1px solid #ddd',
  textAlign: 'center',
  padding: '12px 8px',
  backgroundColor: 
    type === 'lecture' ? theme.palette.info.light :
    type === 'practical' ? theme.palette.success.light :
    type === 'break' ? theme.palette.grey[200] : 'white',
  color: 
    type === 'break' ? theme.palette.text.secondary : theme.palette.text.primary,
  fontStyle: type === 'break' ? 'italic' : 'normal'
}));

const Timetable = ({ userRole = 'student' }) => {
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState({});
  const [selectedClass, setSelectedClass] = useState({
    year: '',
    division: '',
    department: ''
  });
  const [showDialog, setShowDialog] = useState(true);

  const timeSlots = [
    '9:00-10:00',
    '10:00-11:00', 
    '11:00-11:15',
    '11:15-12:15',
    '12:15-13:15',
    '13:15-16:15'
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

      console.log('Fetching timetable with params:', params.toString());
      const response = await apiClient.get(`/api/timetable?${params}`);
      console.log('Timetable response:', response.data);
      
      if (response.data && response.data.timetable) {
        setTimetableData(response.data.timetable);
        setShowDialog(false);
        toast.success('Timetable loaded successfully!');
      } else {
        toast.error('No timetable data found');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch timetable');
      console.error('Error fetching timetable:', error);
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
    <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                              {subject.teacher}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {subject.room}
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
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {days.map(day => {
        const daySchedule = timetableData[day] || [];
        return (
          <Grid item xs={12} md={6} lg={4} key={day}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {day}
                </Typography>
                {daySchedule.length > 0 ? (
                  daySchedule.map((item, index) => (
                    <Box key={index} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {item.timeSlot}
                        </Typography>
                        <Chip 
                          label={item.type} 
                          size="small" 
                          color={getTypeColor(item.type)}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {item.subject}
                      </Typography>
                      {item.type !== 'break' && (
                        <>
                          <Typography variant="caption" display="block" color="textSecondary">
                            👨‍🏫 {item.teacher}
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

  const [viewMode, setViewMode] = useState('grid');

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        📅 Class Timetable
      </Typography>

      {/* Class Selection */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedClass.year}
                onChange={(e) => setSelectedClass({...selectedClass, year: e.target.value})}
                label="Year"
              >
                {availableClasses.years?.map(year => (
                  <MenuItem key={year} value={year}>
                    {year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : '4th Year'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Division</InputLabel>
              <Select
                value={selectedClass.division}
                onChange={(e) => setSelectedClass({...selectedClass, division: e.target.value})}
                label="Division"
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
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedClass.department}
                onChange={(e) => setSelectedClass({...selectedClass, department: e.target.value})}
                label="Department"
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
            >
              {loading ? 'Loading...' : 'View Timetable'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* View Mode Toggle */}
      {Object.keys(timetableData).length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button 
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button 
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('cards')}
          >
            Day-wise Cards
          </Button>
          <Button 
            variant="outlined"
            onClick={() => setShowDialog(true)}
          >
            Change Class
          </Button>
        </Box>
      )}

      {/* Timetable Display */}
      {Object.keys(timetableData).length > 0 ? (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedClass.year && selectedClass.division && 
                `${selectedClass.year === 1 ? '1st' : selectedClass.year === 2 ? '2nd' : selectedClass.year === 3 ? '3rd' : '4th'} Year - Division ${selectedClass.division}`
              }
              {selectedClass.department && ` - ${selectedClass.department} Department`}
            </Typography>
            
            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Lecture" color="primary" size="small" />
                <Chip label="Practical" color="success" size="small" />
                <Chip label="Break" color="default" size="small" />
              </Box>
            </Box>
          </Paper>

          {viewMode === 'grid' ? renderTimetableGrid() : renderDayWiseView()}
        </>
      ) : !loading && (
        <Alert severity="info">
          Select a class to view the timetable
        </Alert>
      )}

      {/* Class Selection Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Class for Timetable</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedClass.year}
                  onChange={(e) => setSelectedClass({...selectedClass, year: e.target.value})}
                  label="Year"
                >
                  {availableClasses.years?.map(year => (
                    <MenuItem key={year} value={year}>
                      {year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : '4th Year'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Division</InputLabel>
                <Select
                  value={selectedClass.division}
                  onChange={(e) => setSelectedClass({...selectedClass, division: e.target.value})}
                  label="Division"
                >
                  {availableClasses.divisions?.map(division => (
                    <MenuItem key={division} value={division}>
                      Division {division}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Department (Optional)</InputLabel>
                <Select
                  value={selectedClass.department}
                  onChange={(e) => setSelectedClass({...selectedClass, department: e.target.value})}
                  label="Department (Optional)"
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
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                onClick={fetchTimetable}
                disabled={loading || !selectedClass.year || !selectedClass.division}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loading ? 'Loading...' : 'View Timetable'}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Timetable;