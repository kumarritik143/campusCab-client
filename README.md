# CampusCab Frontend

This is the frontend for the CampusCab project, built with [Next.js](https://nextjs.org) and [React](https://react.dev).

## Getting Started

### Prerequisites

- Node.js (v18 or above recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd campus-cab
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and set the backend API URL:
   ```
   NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
   ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Building for Production

```bash
npm run build
npm start
```

### Project Structure

- `src/app/` - Next.js app directory (pages, layouts, etc.)
- `src/components/` - React components (map, ride, panels, etc.)
- `src/context/` - React context providers for user and socket state
- `public/` - Static assets

### Features

- User registration and login
- Live location tracking with OpenStreetMap
- Location autocomplete and suggestions
- Ride booking and fare calculation
- Real-time ride updates via Socket.io
- Twilio integration for driver calls

### Environment Variables

- `NEXT_PUBLIC_API_URL` - URL of the backend API (e.g., `http://127.0.0.1:4000`)

### Useful Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start the production server

### Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Leaflet Documentation](https://leafletjs.com/)
- [Socket.io Documentation](https://socket.io/)
- [Twilio Documentation](https://www.twilio.com/docs/)

---
