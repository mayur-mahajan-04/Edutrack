import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/attendance/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/toggle-status`);
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
        setOpenUserDialog(false);
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const Dashboard = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">
                {stats.totalStudents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Teachers
              </Typography>
              <Typography variant="h4">
                {stats.totalTeachers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Attendance
              </Typography>
              <Typography variant="h4">
                {stats.todayAttendance || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {users.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/admin/reports')}
              >
                View Reports
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Attendance by Subject Chart */}
        {stats.attendanceBySubject && stats.attendanceBySubject.length > 0 && (
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Attendance by Subject
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.attendanceBySubject}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Active Students
                </Typography>
                <Typography variant="h6">
                  {users.filter(u => u.role === 'student' && u.isActive).length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Active Teachers
                </Typography>
                <Typography variant="h6">
                  {users.filter(u => u.role === 'teacher' && u.isActive).length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );

  const UsersManagement = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={user.role === 'admin' ? 'error' : user.role === 'teacher' ? 'warning' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.isActive ? 'Active' : 'Inactive'} 
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenUserDialog(true);
                      }}
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </Box>

      {/* User Management Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>Manage User: {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Email: {selectedUser?.email}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Role: {selectedUser?.role}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Status: {selectedUser?.isActive ? 'Active' : 'Inactive'}
          </Typography>
          {selectedUser?.studentId && (
            <Typography variant="body2" gutterBottom>
              Student ID: {selectedUser.studentId}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => toggleUserStatus(selectedUser?._id)}
            color="warning"
          >
            {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button 
            onClick={() => deleteUser(selectedUser?._id)}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );

  const Reports = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Monthly Attendance Chart */}
        {stats.attendanceByMonth && stats.attendanceByMonth.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Attendance Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.attendanceByMonth.map(item => ({
                  month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                  count: item.count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Subject-wise Attendance */}
        {stats.attendanceBySubject && stats.attendanceBySubject.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Subject-wise Attendance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Total Attendance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.attendanceBySubject.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item._id}</TableCell>
                        <TableCell>{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/users" element={<UsersManagement />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
};

export default AdminDashboard;