# Trading Behavior Platform

A React-based trading behavioral analysis platform built for the NevUp Hackathon 2026.

## Setup

1. **Start the mock API server:**
   ```bash
   npx @stoplight/prism-cli mock nevup_openapi.yaml --port 4010
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Set JWT token in browser:**
   Open http://localhost:5173 and run this in the browser console:
   ```javascript
   localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNDEyZjIzNi00ZWRjLTQ3YTItOGY1NC04NzYzYTZlZDJjZTgiLCJpYXQiOjE3NzcyODgwOTQsImV4cCI6MTc3NzM3NDQ5NCwicm9sZSI6InRyYWRlciIsIm5hbWUiOiJBbGV4IE1lcmNlciJ9.jaocuOfDvZXcpNHI9_jnFQ4ezJCuxlAk9TsWD0YiOEk')
   ```

   This token is for Alex Mercer (userId: f412f236-4edc-47a2-8f54-8763a6ed2ce8).

## Features

- **Dashboard**: Behavioral heatmap and session overview
- **Debrief Flow**: 6-step post-session analysis
  - Trade replay
  - Emotional tagging per trade
  - Plan adherence rating
  - AI coaching stream
  - Overall mood selection
  - Key takeaway submission
- **Real-time SSE**: Live AI coaching with reconnection logic
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile-first**: Responsive design for all screen sizes

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Server-Sent Events for real-time coaching
- Custom SVG heatmap component

## API Integration

The app integrates with the NevUp API spec:
- `/users/{userId}/profile` - User behavioral profile
- `/users/{userId}/metrics` - Behavioral metrics timeseries
- `/sessions/{sessionId}` - Session details with trades
- `/sessions/{sessionId}/debrief` - Submit debrief data
- `/sessions/{sessionId}/coaching` - SSE stream for AI coaching

## Development

- `npm run build` - Production build
- `npm run dev` - Development server
- All components are fully typed with TypeScript
- CSS modules for component-scoped styling