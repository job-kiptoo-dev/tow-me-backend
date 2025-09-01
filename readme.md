# Routes Documentation

This document provides an overview of the available routes in the **tow-me-backend** project.

## Table of Contents

- [Authentication](#authentication)
- [Towing Requests](#towing-requests)
- [Location](#location)

---

## Authentication

| Method | Endpoint         | Description           |
|--------|-----------------|-----------------------|
| POST   | `/api/auth/login`   | User login            |
| POST   | `/api/auth/register`| User registration     |
| POST   | `/api/auth/verify`  | Verify OTP      |
| POST   | `/api/auth/resend-otp` | Resend OTP    |



## Towing Requests

| Method | Endpoint               | Description                  |
|--------|-----------------------|------------------------------|
| GET    | `/api/tow-requests/provider` | List all pending towing requests     |
| POST   | `/api/tow-requests`           | Create a new request         |
| PATCH    | `/api/tow-requests/id/complete`       | Mark towing request status as complete              |
| PATCH | `/api/tow-requests/id/accept`       | Mark towing request status as accepted        |
| GET  | `/api/tow-request/all` | 

## Location

| Method | Endpoint               | Description                  |
|--------|-----------------------|------------------------------|
| POST    | `/api/location/update-location` | Update user current location     |
| POST   | `/api/location/nearby-provider`           | Find nearby towing providers         |



