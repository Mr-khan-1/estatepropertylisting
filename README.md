# EstateHub 2.0 — Real Estate Property Listing System

A full-stack real estate listing platform built with **Node.js + Express + MongoDB**, now upgraded with **React** components on the frontend.

## What's New in 2.0 (React Integration)

| React Component | Location | What It Replaces |
|---|---|---|
| `SearchBar` | Homepage hero | Static HTML form |
| `PropertyFilters` | Properties listing | jQuery-based filters |
| `CompareBar` | Properties listing | jQuery + localStorage compare bar |
| `FavoriteButton` | Property detail | Plain JS fetch toggle |
| `ImageGallery` | Property detail | Bootstrap carousel |
| `ReviewForm` | Property detail | Static HTML form (now has star rating UI) |
| `ImagePreview` | Agent add/edit property | jQuery file preview |
| `AdminChart` | Admin dashboard | Vanilla Chart.js |

React is loaded via **CDN (no build step)** using React 18 + Babel Standalone. Components live in `/public/js/react-components/` and mount into `<div id="react-...">` containers in the EJS views.

## Tech Stack

- **Backend**: Node.js, Express.js, EJS templating
- **Database**: MongoDB (Mongoose)
- **Auth**: Passport.js (local strategy), bcryptjs, express-session
- **Frontend**: Bootstrap 5, React 18 (CDN), Babel Standalone
- **Maps**: Leaflet + OpenStreetMap
- **File uploads**: Multer

## Setup

1. **Clone / unzip** the project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev    # development (nodemon)
   npm start      # production
   ```

## User Roles

| Role | Capabilities |
|---|---|
| **User** | Browse, search, filter, compare, favorite, review, inquire |
| **Agent** | All user features + list/edit/delete properties, view inquiries & notifications |
| **Admin** | All features + approve/reject listings, manage users, view flagged properties |

> To create an admin account: register normally then manually set `role: "admin"` in MongoDB.

## Project Structure

```
estate2.0/
├── app.js                          # Express app entry point
├── config/
│   ├── db.js                       # MongoDB connection
│   └── passport.js                 # Passport local strategy
├── controllers/                    # Route logic
├── middleware/
│   ├── auth.js                     # Role guards
│   └── upload.js                   # Multer config
├── models/                         # Mongoose schemas
├── routes/                         # Express routers
├── views/                          # EJS templates
│   ├── partials/header.ejs         # Includes React + Babel CDN
│   ├── partials/footer.ejs         # Loads React component scripts
│   └── ...
├── public/
│   ├── css/style.css
│   └── js/
│       ├── main.js                 # jQuery utilities
│       └── react-components/       # React JSX components (Babel transforms at runtime)
│           ├── SearchBar.js
│           ├── PropertyFilters.js
│           ├── CompareBar.js
│           ├── FavoriteButton.js
│           ├── ImageGallery.js
│           ├── ReviewForm.js
│           ├── ImagePreview.js
│           └── AdminChart.js
└── uploads/                        # Property images (auto-created)
```

## Testing

The application includes comprehensive testing strategies to ensure stability and performance:
- **API and Unit Tests**: Powered by Jest & Supertest to ensure the backend logic and routes are solid.
- **UI and Screenshot Tests**: Automated UI validation and full-page screenshots using Playwright.
- **Load and Stress Testing**: Configured using Artillery (`tests/load_test.yml`, `tests/stress_test.yml`) to evaluate the backend's stability under high concurrent traffic.

## Collaborators and Team

This project is brought to life through the collaborative efforts of our team:

- **Abdullah** ([@abdullahkhalidawan05](https://github.com/abdullahkhalidawan05))
  - **Role**: UI Development & Manual Testing
 
- **Asif** ([@masif078](https://github.com/masif078))
  - **Role**: UI Development & Manual Testing
 
- **Rana Hammad** ([@RanaHammadMushtaq](https://github.com/RanaHammadMushtaq))
  - **Role**: Backend Development & Automated Testing
  -
- **Muhammad** ([@Mr-khan-1](https://github.com/Mr-khan-1))
  - **Role**: Backend Development, Automated Testing, & Load Testing
 
