#!/bin/bash
# Diagnostic script to verify Lighthouse CI setup

echo "🔍 Lighthouse CI Diagnostic"
echo "============================"
echo ""

echo "📋 System Info:"
echo "  OS: $(uname -s)"
echo "  Node: $(node --version)"
echo "  npm: $(npm --version)"
echo ""

echo "🔍 Checking dependencies..."
if command -v google-chrome &> /dev/null; then
  echo "  ✅ Google Chrome: $(google-chrome --version)"
elif command -v chromium &> /dev/null; then
  echo "  ✅ Chromium: $(chromium --version)"
else
  echo "  ❌ Chrome/Chromium NOT FOUND"
  echo "     Install with:"
  echo "     - Ubuntu/Debian: sudo apt-get install -y chromium-browser"
  echo "     - Fedora/RHEL: sudo dnf install chromium"
  echo "     - macOS: brew install chromium"
fi

echo ""
echo "📦 Checking npm packages..."
if [ -d "node_modules" ]; then
  echo "  ✅ node_modules exists"
  
  if [ -d "node_modules/@lhci/cli" ]; then
    echo "  ✅ @lhci/cli installed"
  else
    echo "  ⚠️  @lhci/cli not installed (will be installed on run)"
  fi
  
  if [ -d "node_modules/lighthouse" ]; then
    echo "  ✅ lighthouse installed"
  else
    echo "  ⚠️  lighthouse not installed (will be installed on run)"
  fi
else
  echo "  ⚠️  node_modules not found (will be created on run)"
fi

echo ""
echo "📁 Checking configuration files..."
[ -f "lighthouserc.json" ] && echo "  ✅ lighthouserc.json" || echo "  ❌ lighthouserc.json"
[ -f "lighthouse-config.js" ] && echo "  ✅ lighthouse-config.js" || echo "  ❌ lighthouse-config.js"
[ -f "run-lighthouse.sh" ] && echo "  ✅ run-lighthouse.sh" || echo "  ❌ run-lighthouse.sh"

echo ""
echo "🚀 Port availability:"
if command -v lsof &> /dev/null; then
  if ! lsof -i :5173 &> /dev/null; then
    echo "  ✅ Port 5173 is available"
  else
    echo "  ⚠️  Port 5173 is in use"
    echo "     Kill with: lsof -i :5173 | grep LISTEN | awk '{print \$2}' | xargs kill -9"
  fi
else
  echo "  ℹ️  lsof not available (port check skipped)"
fi

echo ""
echo "📊 App status:"
if [ -f "package.json" ]; then
  echo "  ✅ package.json found"
else
  echo "  ❌ package.json not found"
fi

if [ -d "src" ]; then
  echo "  ✅ src directory found"
else
  echo "  ❌ src directory not found"
fi

if [ -f "vite.config.ts" ]; then
  echo "  ✅ vite.config.ts found"
else
  echo "  ❌ vite.config.ts not found"
fi

echo ""
echo "✅ Diagnostic complete!"
echo ""
echo "Next step: ./run-lighthouse.sh"
