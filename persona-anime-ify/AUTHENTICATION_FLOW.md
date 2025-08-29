# Authentication Flow

This document explains how the authentication system works in the AnimeMe application.

## Overview

The app uses Clerk for authentication and implements a protected route system that automatically redirects users based on their authentication status.

## How It Works

### 1. Unauthenticated Users
- **Landing Page (`/`)**: Users see the main landing page with hero section, character grid, and features
- **Sign In/Sign Up**: Users can authenticate using Clerk's modal components
- **After Sign In**: Automatically redirected to `/transform` page

### 2. Authenticated Users
- **Landing Page (`/`)**: Automatically redirected to `/transform` page
- **Transform Page (`/transform`)**: Main application page where users can:
  - Upload photos
  - Select anime characters
  - Transform their photos
  - Download results

### 3. Route Protection

The app uses a `ProtectedRoute` component that handles authentication logic:

- **Public Routes** (like landing page): Redirect authenticated users to transform page
- **Protected Routes** (like transform page): Redirect unauthenticated users to landing page

## Key Components

### ProtectedRoute.tsx
- Handles authentication state checking
- Manages redirects based on user authentication status
- Shows loading spinner while checking authentication

### App.tsx
- Wraps routes with appropriate protection
- Landing page: `requireAuth={false}` (redirects authenticated users)
- Transform page: `requireAuth={true}` (requires authentication)

### Header.tsx
- Shows different navigation based on authentication status
- Authenticated users see user profile button
- Unauthenticated users see sign in/sign up buttons

## Authentication Flow Diagram

```
User visits app
       ↓
   Check auth status
       ↓
   ┌─────────────┐    ┌─────────────┐
   │ Unauthenticated │    │ Authenticated │
   └─────────────┘    └─────────────┘
       ↓                    ↓
   Show landing page    Redirect to
   (Index.tsx)         /transform
       ↓                    ↓
   User can sign in    User sees transform
   or sign up          page (Transform.tsx)
       ↓                    ↓
   After sign in →     User can upload
   Redirect to          photos and transform
   /transform          them into anime style
```

## Configuration

The authentication flow is configured in:

- **main.tsx**: Clerk provider with `afterSignInUrl="/transform"`
- **App.tsx**: Route protection with ProtectedRoute components
- **ProtectedRoute.tsx**: Authentication logic and redirects

## Benefits

1. **Seamless UX**: Users are automatically taken to the right page
2. **Security**: Transform page is protected from unauthorized access
3. **Consistent**: All authenticated users start at the main app page
4. **Simple**: No manual navigation needed after authentication
