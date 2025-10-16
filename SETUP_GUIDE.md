# Quick Setup Guide

## Prerequisites
- Node.js (v16+)
- MongoDB
- Git

## Installation Steps

### 1. Install Dependencies
```bash
# From project root
npm run install-deps
```

### 2. Setup Environment
Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_attendance
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Download Face Recognition Models
Download these files to `frontend/public/models/`:
- [ssd_mobilenetv1_model-weights_manifest.json](https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-weights_manifest.json)
- [ssd_mobilenetv1_model-shard1](https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard1)
- [face_landmark_68_model-weights_manifest.json](https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json)
- [face_landmark_68_model-shard1](https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1)
- [face_recognition_model-weights_manifest.json](https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-weights_manifest.json)
- [face_recognition_model-shard1](https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard1)

### 4. Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 5. Run Application
```bash
npm run dev
```

## Default Test Accounts

### Admin Account
- Email: admin@test.com
- Password: admin123
- Role: Admin

### Teacher Account
- Email: teacher@test.com
- Password: teacher123
- Role: Teacher

### Student Account
- Email: student@test.com
- Password: student123
- Role: Student

## Quick Test Flow

1. **Register as Student**: 
   - Go to http://localhost:3000/register
   - Fill details and capture face
   
2. **Login as Teacher**:
   - Generate QR code for a subject
   - Note the location requirement
   
3. **Mark Attendance**:
   - Login as student
   - Scan the QR code (ensure you're in the same location)
   - Attendance will be marked

4. **View Reports**:
   - Login as admin to see system statistics
   - Login as teacher to see class attendance

## Troubleshooting

### Camera Issues
- Ensure HTTPS in production
- Check browser permissions
- Use Chrome/Firefox for best compatibility

### Location Issues
- Enable location services
- Check browser permissions
- Ensure GPS is available

### Database Issues
- Verify MongoDB is running
- Check connection string
- Ensure proper permissions

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance
JWT_SECRET=your_production_secret_key_very_long_and_secure
FRONTEND_URL=https://yourdomain.com
```

### Build Commands
```bash
# Build frontend
cd frontend && npm run build

# Start production server
cd backend && npm start
```

### HTTPS Requirement
- Camera and location APIs require HTTPS in production
- Use SSL certificates (Let's Encrypt recommended)
- Configure reverse proxy (Nginx/Apache)

## Features Overview

✅ **Student Features**:
- Face registration during signup
- QR code scanning for attendance
- GPS verification
- Attendance history and statistics

✅ **Teacher Features**:
- Dynamic QR code generation
- Location-based QR codes
- Class attendance management
- Student list management

✅ **Admin Features**:
- User management (CRUD operations)
- System analytics and reports
- Attendance statistics
- User activity monitoring

✅ **Security Features**:
- JWT authentication
- Role-based access control
- Password hashing
- Rate limiting
- Input validation
- CORS protection

## API Testing

Use tools like Postman or curl to test APIs:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check server logs
4. Ensure all dependencies are installed
5. Verify environment variables are set correctly