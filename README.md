# Hemsworth Miners Welfare FC — Official Club App

**The Wells** club hub — built with React.

## Features
- Club News
- League Table (with zone colouring)
- Fixtures & Results
- Squad
- Merch / Club Shop
- Photo Gallery
- Password-protected Admin Panel

## Admin Access
Click the **⚙ ADMIN** button in the top-right corner.  
Default password: `wells2026`

To change the password, open `src/App.jsx` and find the line:
```
const ADMIN_PASSWORD = "wells2026";
```

## Running Locally
```bash
npm install
npm start
```
Then open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel
1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **Add New Project** and select this repo
4. Click **Deploy** — done!

## Built With
- React 18
- Barlow / Barlow Condensed fonts
- Persistent storage via Artifact Storage API
