# Secret Santa Name Selection App

A simple web application for Secret Santa name selection that prevents duplicate selections and tracks who selected which name.

## Features

- ✅ Prevents duplicate selections (each name can only be selected once)
- ✅ Highlights selected names with a visual indicator
- ✅ Shows selection count badge for each name
- ✅ Displays who selected each name
- ✅ Real-time statistics (total, selected, remaining)
- ✅ Auto-refreshes every 10 seconds to show updates from other users

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Deployment

### Option 1: Deploy to Heroku

1. Create a Heroku account and install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`
5. Open: `heroku open`

### Option 2: Deploy to Railway

1. Create a Railway account
2. Connect your GitHub repository
3. Railway will auto-detect Node.js and deploy
4. Your app will be live at a Railway-provided URL

### Option 3: Deploy to Render

1. Create a Render account
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy!

### Option 4: Deploy to VPS (DigitalOcean, AWS, etc.)

1. SSH into your server
2. Install Node.js (v14 or higher)
3. Clone this repository
4. Run `npm install`
5. Use PM2 to keep it running: `pm2 start server.js`
6. Set up nginx as reverse proxy (optional)

## Database

The app uses SQLite, which creates a local database file (`secret_santa.db`) automatically. No additional database setup is required!

## Reset Selections

If you need to reset all selections, you can use the API endpoint:
```bash
curl -X POST http://localhost:3000/api/reset
```

Or add a reset button to the UI if needed.

## Notes

- The database file (`secret_santa.db`) is created automatically on first run
- All 14 names are pre-loaded into the database
- The app prevents selecting a name that's already been selected
- Each selection is timestamped and records who made the selection

