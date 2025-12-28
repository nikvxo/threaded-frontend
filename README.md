# FitPlanner - Virtual Wardrobe Manager

A full-stack web application for tracking outfits and managing your virtual closet.

## Features

- **Outfit Management**: Create, edit, and delete outfit entries with photos
- **Virtual Closet**: Automatically builds a closet from your outfit items
- **Usage Tracking**: See how often you wear each clothing item
- **Search & Filter**: Find outfits by title or clothing items
- **Image Upload**: AWS S3 integration for photo storage
- **Authentication**: Secure JWT-based user authentication

## Tech Stack

**Frontend:**
- React 19 with Vite
- React Router for navigation
- Context API for state management

**Backend:**
- Node.js + Express
- PostgreSQL database with Prisma ORM
- AWS S3 for image storage
- JWT authentication

## Setup

```bash
npm install
npm run dev
```

Set environment variable:
```
VITE_API_URL=http://localhost:3000
```

## Live Demo

🔗 [View Live Application](your-deployed-url-here)
