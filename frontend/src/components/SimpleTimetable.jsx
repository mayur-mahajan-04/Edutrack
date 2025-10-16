import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SimpleTimetable = () => {
  // Mock timetable data - replace with actual API call
  const timetable = [
    { day: 'Monday', periods: ['Math', 'Physics', 'Chemistry', 'English', 'CS'] },
    { day: 'Tuesday', periods: ['Physics', 'Math', 'English', 'CS', 'Chemistry'] },
    { day: 'Wednesday', periods: ['Chemistry', 'English', 'Math', 'Physics', 'CS'] },
    { day: 'Thursday', periods: ['CS', 'Chemistry', 'Physics', 'Math', 'English'] },
    { day: 'Friday', periods: ['English', 'CS', 'Math', 'Chemistry', 'Physics'] }
  ];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        <Typography variant="h4" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          📅 Class Timetable
        </Typography>
        
        {timetable.map((day, index) => (
          <Paper key={day.day} sx={{ mb: 2, p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(96, 181, 255, 0.15)' }}>
            <Typography variant="h6" sx={{ color: '#60b5ff', fontWeight: 'bold', mb: 2 }}>
              {day.day}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {day.periods.map((subject, periodIndex) => (
                <Box
                  key={periodIndex}
                  sx={{
                    bgcolor: '#f0f8ff',
                    border: '1px solid #60b5ff',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    minWidth: 80,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Period {periodIndex + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#60b5ff' }}>
                    {subject}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default SimpleTimetable;