#!/bin/bash
# Lighthouse CI Setup and Testing Script

set -e

echo "🔍 Lighthouse CI Setup"
echo "======================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo " Installing dependencies..."
  npm install
fi
# Check for Chrome/Chromium and install if needed
echo "🔍 Checking for Chrome/Chromium..."
if ! command -v google-chrome &> /dev/null && ! command -v chromium &> /dev/null; then
  echo "Installing Chromium..."
  sudo apt-get update && sudo apt-get install -y chromium-browser || apt-get install -y chromium || true
fi
# Install Lighthouse CI globally
echo " Installing Lighthouse CI..."
npm install --save-dev @lhci/cli@^0.12.0 lighthouse

# Build the production app
echo " Building production app..."
npm run build

# Start the preview server in the background
echo "Starting preview server..."
npm run preview > /dev/null 2>&1 &
PREVIEW_PID=$!

# Wait for server to start
echo " Waiting for server to start..."
sleep 5

# Check if server is actually running
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "  Server failed to start, retrying..."
  sleep 3
fi

# Run Lighthouse CI
echo "🔬 Running Lighthouse CI..."
echo "Note: This may take a few minutes on first run while downloading Chrome..."
npx lhci autorun 2>&1 || LHCI_EXIT=$?

# Kill the preview server
kill $PREVIEW_PID 2>/dev/null || true

# Display results
if [ -z "$LHCI_EXIT" ] || [ $LHCI_EXIT -eq 0 ]; then
  echo ""
  echo "✅ Lighthouse CI completed successfully!"
  echo "📊 Results saved in ./lhci_reports/"
  echo ""
  echo "📈 To view results:"
  echo "   1. Open ./lhci_reports/index.html in your browser"
  echo "   2. Check individual page reports for detailed metrics"
  echo "   3. Results summary: see 'lighthouse-results.json'"
  exit 0
else
  echo ""
  echo "⚠️  Lighthouse CI encountered an issue"
  echo "This may be due to Chrome/Chromium not being installed"
  echo ""
  echo "📋 To fix:"
  echo "  Ubuntu/Debian:"
  echo "    sudo apt-get update && sudo apt-get install -y chromium-browser"
  echo "  Fedora/RHEL:"
  echo "    sudo dnf install chromium"
  echo "  macOS:"
  echo "    brew install chromium"
  echo ""
  echo "Then run: ./run-lighthouse.sh again"
  exit 1
fi
