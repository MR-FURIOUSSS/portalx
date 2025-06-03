# SRM Academia API Documentation

## Overview
This API provides access to SRM Academia student data including attendance, marks, timetable, and more. It includes user authentication with token management via Supabase.

## Authentication Flow

### 1. Login
**POST** `/api/login`

\`\`\`json
{
  "username": "student@srmist.edu.in",
  "password": "your_password"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "name": "John Doe",
    "regNumber": "RA2011003010001",
    "mobile": "9876543210",
    "department": "Computer Science",
    "program": "B.Tech",
    "section": "A",
    "semester": "6",
    "batch": "1"
  },
  "token": "session_token_here"
}
\`\`\`

**Response (CAPTCHA Required):**
\`\`\`json
{
  "success": false,
  "requiresCaptcha": true,
  "captcha": {
    "digest": "captcha_digest",
    "image": "base64_image_data"
  }
}
\`\`\`

**Login with CAPTCHA:**
\`\`\`json
{
  "username": "student@srmist.edu.in",
  "password": "your_password",
  "captcha": "CAPTCHA_SOLUTION",
  "captchaDigest": "captcha_digest_from_previous_response"
}
\`\`\`

### 2. Check Token Validity
**POST** `/api/refresh-token`

\`\`\`json
{
  "username": "student@srmist.edu.in"
}
\`\`\`

### 3. Logout
**POST** `/api/logout`

Headers: `Authorization: Bearer your_token`

## Protected Endpoints

All endpoints below require authentication token in header:
`Authorization: Bearer your_token` or `Token: your_token`

### Get Attendance
**GET** `/api/attendance`

### Get Marks
**GET** `/api/marks`

### Get Course Details
**GET** `/api/course`

### Get Timetable
**GET** `/api/timetable`

### Get Calendar
**GET** `/api/calendar`

### Get User Info
**GET** `/api/userinfo`

## Error Responses

**401 Unauthorized:**
\`\`\`json
{
  "error": "Authentication token required"
}
\`\`\`

**401 Token Expired:**
\`\`\`json
{
  "error": "Token expired",
  "message": "Please login again",
  "expired": true
}
\`\`\`

## Token Management

- Tokens are valid for 24 hours
- Tokens are automatically stored in Supabase
- Expired tokens are cleared automatically
- Users need to re-authenticate when tokens expire
