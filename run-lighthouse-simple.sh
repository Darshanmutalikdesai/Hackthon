#!/bin/bash
# Simple Lighthouse Testing (without CI infrastructure)
# Use this as a fallback if Lighthouse CI is not available

echo "🔍 Lighthouse Testing (Simple Mode)"
echo "===================================="
echo ""

# Check for Chrome
if ! command -v google-chrome &> /dev/null && ! command -v chromium &> /dev/null; then
  echo "❌ Chrome/Chromium not found"
  echo ""
  echo "Install Chrome:"
  echo "  Ubuntu/Debian: sudo apt-get install -y chromium-browser"
  echo "  Fedora/RHEL: sudo dnf install chromium"
  echo "  macOS: brew install chromium"
  exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Install Lighthouse if not present
if ! npm list lighthouse > /dev/null 2>&1; then
  echo "📦 Installing Lighthouse..."
  npm install --save-dev lighthouse
fi

# Build the production app
echo "🔨 Building production app..."
npm run build

# Start the preview server in the background
echo "🚀 Starting preview server..."
npm run preview > /dev/null 2>&1 &
PREVIEW_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Create results directory
mkdir -p lighthouse-results

# Run Lighthouse on dashboard
echo "🔬 Auditing dashboard page..."
npx lighthouse http://localhost:5173/ \
  --chrome-flags="--headless --no-sandbox" \
  --output-path=./lighthouse-results/dashboard.json \
  --output=json \
  2>/dev/null || true

# Run Lighthouse on debrief page
echo "🔬 Auditing debrief page..."
npx lighthouse http://localhost:5173/debrief/b2c3d4e5-f6a7-8901-bcde-f12345678901 \
  --chrome-flags="--headless --no-sandbox" \
  --output-path=./lighthouse-results/debrief.json \
  --output=json \
  2>/dev/null || true

# Kill the preview server
kill $PREVIEW_PID 2>/dev/null || true

echo ""
echo "✅ Lighthouse audit complete!"
echo "📊 Results saved in ./lighthouse-results/"
echo ""
echo "📈 To view results:"
echo "   npx lighthouse-ci --view-upload-results=./lighthouse-results/"
echo ""
echo "Or convert to HTML:"
echo "   npx lighthouse-ci --convert-assets=./lighthouse-results/*.json"
