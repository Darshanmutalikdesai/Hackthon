# Trading Behavior Platform

A React-based trading behavioral analysis platform built for the NevUp Hackathon 2026.

## 🚀 Quick Start

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

4. **JWT token (auto-set on app load):**
   Token is automatically set for Alex Mercer (userId: f412f236-4edc-47a2-8f54-8763a6ed2ce8) on app startup.
   
   To manually set in console:
   ```javascript
   localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNDEyZjIzNi00ZWRjLTQ3YTItOGY1NC04NzYzYTZlZDJjZTgiLCJpYXQiOjE3NzcyODgwOTQsImV4cCI6MTc3NzM3NDQ5NCwicm9sZSI6InRyYWRlciIsIm5hbWUiOiJBbGV4IE1lcmNlciJ9.jaocuOfDvZXcpNHI9_jnFQ4ezJCuxlAk9TsWD0YiOEk')
   ```

## 🌍 Vercel Deployment

The repo includes Vercel serverless API routes under `/api`, so the frontend can talk to the backend on the same deployment.

No extra API host is required in production. The app will use `/api` on Vercel and `http://localhost:4010` in local development.

The `vercel.json` file keeps React Router refreshes working on direct page loads.

## ✨ Features

### Dashboard & Analytics
- **Custom SVG Heatmap**: 90-day behavioral heatmap showing daily trade quality scores
  - Fully custom implementation (no charting libraries)
  - Hover tooltips with session details
  - Click to navigate to session debrief
  - Keyboard accessible (Tab + Enter)

### Post-Session Debrief Flow (5 Steps)
1. **Trade Replay** - Describe trade execution (min 10 chars)
2. **Emotional Feedback** - Capture emotional state during trade (min 10 chars)
3. **Plan Adherence** - Rate adherence to trading plan (1-5 scale)
4. **Overall Mood** - Select session mood (Calm, Anxious, Greedy, Fearful, Neutral)
5. **Key Takeaway** - Summarize main lesson learned (min 10 chars)

Each step has:
- Smooth transition animations
- Validation feedback
- Clear progress indication
- Mobile-responsive design (375px+)

### Real-Time AI Coaching
- Server-Sent Events (SSE) integration
- Token-by-token streaming
- Graceful reconnection with exponential backoff
- "Reconnecting..." state on connection loss
- Resilient error handling

### Accessibility & Keyboard Navigation
- **Full keyboard support**: Tab navigation, arrow keys, Enter to submit
- **Screen reader compatible**: ARIA labels, roles, live regions
- **Mobile accessible**: Responsive at 375px viewport
- **WCAG 2.1 AA compliant**
- See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for full details

### Security & Authentication
- JWT-based authentication (HS256)
- **Row-level tenancy enforcement**: User can only access their own data
- Token validation on every API call
- Automatic 403 response on cross-tenant access attempts
- See [TENANCY.md](./TENANCY.md) for implementation details

## 📊 Lighthouse CI

Target metrics: **Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 96**

### Prerequisites
You need Chrome or Chromium installed. Install with your package manager:

```bash
# Ubuntu/Debian
sudo apt-get install -y chromium-browser

# Fedora/RHEL
sudo dnf install chromium

# macOS
brew install chromium

# Windows
# Download from: https://www.google.com/chrome/
```

### Setup & Run Locally
```bash
# Automated setup and testing
chmod +x run-lighthouse.sh
./run-lighthouse.sh
```

**First run may take a few minutes while downloading dependencies.**

### Alternative: Simple Testing
If the full CI doesn't work, use the simple version:
```bash
chmod +x run-lighthouse-simple.sh
./run-lighthouse-simple.sh
```

Results location:
- HTML reports: `./lhci_reports/` or `./lighthouse-results/`
- Summary: `./lighthouse-results.json`

### Configuration Files
- `lighthouserc.json` - Lighthouse CI assertions and thresholds
- `lighthouse-config.js` - Advanced configuration (mobile 375px, Chrome path detection)

See [LIGHTHOUSE_SETUP.md](./LIGHTHOUSE_SETUP.md) for troubleshooting and CI/CD integration.

## 📱 Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds (< 2s)
- **CSS Modules** for component isolation
- **Server-Sent Events** for real-time updates
- **No UI frameworks** - custom components only
- **Mobile-first** responsive design

## 📚 Documentation

- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** - Keyboard navigation, ARIA, testing
- **[TENANCY.md](./TENANCY.md)** - JWT validation, row-level tenancy
- **[lighthouserc.json](./lighthouserc.json)** - Lighthouse CI config
- **[lighthouse-config.js](./lighthouse-config.js)** - Advanced Lighthouse settings

## 🔌 API Integration

All endpoints consumed exactly as specified in `nevup_openapi.yaml`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users/{userId}/profile` | GET | User behavioral profile |
| `/users/{userId}/metrics` | GET | Daily metrics timeseries |
| `/sessions/{sessionId}` | GET | Session data with trades |
| `/sessions/{sessionId}/coaching` | GET (SSE) | AI coaching stream |
| `/sessions/{sessionId}/debrief` | POST | Submit debrief data |

All user endpoints enforce row-level tenancy validation.

## 🎨 Component Structure

```
src/
├── components/
│   ├── Heatmap.tsx              # Custom SVG heatmap
│   ├── CoachingStream.tsx        # SSE integration
│   ├── DebriefFlowController.tsx # 5-step debrief
│   ├── DashboardCoaching.tsx     # Coaching panel
│   └── ...
├── hooks/
│   └── useSSE.ts                 # EventSource management
├── services/
│   └── api.ts                    # API + tenancy validation
├── utils/
│   └── auth.ts                   # JWT decoding & validation
└── pages/
    ├── DashboardPage.tsx         # Main dashboard
    └── DebriefPage.tsx           # Debrief flow page
```

## 🧪 Testing

### Manual Testing Checklist

**Keyboard Navigation:**
- [ ] Tab through all form fields
- [ ] Arrow keys navigate debrief steps
- [ ] Enter/Space activate buttons
- [ ] Ctrl+Enter submits final step
- [ ] Focus visible on all elements

**Row-Level Tenancy:**
- [ ] Can access own user data
- [ ] Cannot access other user data
- [ ] 403 error on cross-tenant attempt
- [ ] Session expired shows appropriate error

**Heatmap:**
- [ ] Hover shows tooltip
- [ ] Click navigates to debrief
- [ ] Keyboard accessible (Tab + Enter)
- [ ] Mobile responsive (375px)

**SSE Coaching:**
- [ ] Tokens stream and appear
- [ ] Reconnect on disconnect
- [ ] Exponential backoff working
- [ ] No frozen/blank screen

## 📦 Build & Production

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run Lighthouse CI
./run-lighthouse.sh
```

The build is optimized for:
- Minimal JavaScript bundle
- Tree-shaking unused code
- CSS module scoping
- SVG inlining for heatmap

## 🔐 Security Notes

1. **JWT Token**: Auto-set in App.tsx for development. In production, require proper login.
2. **CORS**: Mock API allows requests from localhost:5173
3. **Tenancy**: Every data request is validated server-side (Prism enforces via OpenAPI)
4. **Token Expiry**: 24-hour validity, checked on every API call
5. **EventSource**: Token passed as query parameter (acceptable for mock/dev)

## 📄 License

Built for NevUp Hackathon 2026