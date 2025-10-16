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
  Alert,
  Grid,
  Chip
} from '@mui/material';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';

const SimpleTimetable = () => {
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState({
    year: 2,
    division: 'A',
    department: 'Computer'
  });

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        year: selectedClass.year,
        division: selectedClass.division,
        department: selectedClass.department
      });

      const url = `/api/timetable?${params}`;
      console.log('🔍 Fetching timetable with URL:', url);
      console.log('📋 Selected class:', selectedClass);
      
      const response = await apiClient.get(url);
      console.log('✅ Response received:', response);
      console.log('📊 Response data:', response.data);
      
      if (response.data) {
        if (response.data.raw && response.data.raw.length > 0) {
          setTimetableData(response.data.raw);
          toast.success(`Timetable loaded! Found ${response.data.raw.length} entries`);
        } else if (response.data.timetable) {
          // Flatten the grouped timetable
          const flatData = [];
          Object.values(response.data.timetable).forEach(dayEntries => {
            flatData.push(...dayEntries);
          });
          setTimetableData(flatData);
          toast.success(`Timetable loaded! Found ${flatData.length} entries`);
        } else {
          console.log('❌ No timetable data in response');
          toast.error('No timetable data found in response');
        }
      } else {
        console.log('❌ Empty response');
        toast.error('Empty response from server');
      }
    } catch (error) {
      console.error('❌ Error fetching timetable:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'lecture': return 'primary';
      case 'practical': return 'success';
      case 'break': return 'default';
      default: return 'primary';
    }
  };

  const groupedByDay = timetableData.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = [];
    }
    acc[item.day].push(item);
    return acc;
  }, {});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
                <MenuItem value={1}>1st Year</MenuItem>
                <MenuItem value={2}>2nd Year</MenuItem>
                <MenuItem value={3}>3rd Year</MenuItem>
                <MenuItem value={4}>4th Year</MenuItem>
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
                <MenuItem value="A">Division A</MenuItem>
                <MenuItem value="B">Division B</MenuItem>
                <MenuItem value="C">Division C</MenuItem>
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
                <MenuItem value="Computer">Computer</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Mechanical">Mechanical</MenuItem>
                <MenuItem value="Civil">Civil</MenuItem>
                <MenuItem value="Electrical">Electrical</MenuItem>
                <MenuItem value="Electronics and Telecommunication">Electronics & Telecom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              variant="contained" 
              onClick={fetchTimetable}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Loading...' : 'Load Timetable'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Current Selection Info */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">
          {selectedClass.year === 1 ? '1st' : selectedClass.year === 2 ? '2nd' : selectedClass.year === 3 ? '3rd' : '4th'} Year - 
          Division {selectedClass.division} - {selectedClass.department} Department
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          📊 Total entries loaded: {timetableData.length}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Chip label="Lecture" color="primary" size="small" />
          <Chip label="Practical" color="success" size="small" />
          <Chip label="Break" color="default" size="small" />
        </Box>
      </Paper>

      {/* Timetable Display */}
      {timetableData.length > 0 ? (
        <Grid container spacing={2}>
          {days.map(day => {
            const daySchedule = groupedByDay[day] || [];
            return (
              <Grid item xs={12} md={6} lg={4} key={day}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    {day}
                  </Typography>
                  {daySchedule.length > 0 ? (
                    daySchedule
                      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                      .map((item, index) => (
                        <Box key={index} sx={{ 
                          mb: 1, 
                          p: 1, 
                          border: '1px solid #eee', 
                          borderRadius: 1,
                          backgroundColor: item.type === 'break' ? '#f5f5f5' : 'white'
                        }}>
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
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : !loading ? (
        <Alert severity="info">
          No timetable data available. Click "Load Timetable" to fetch data.
        </Alert>
      ) : (
        <Alert severity="info">
          Loading timetable data...
        </Alert>
      )}
    </Container>
  );
};

export default SimpleTimetable;