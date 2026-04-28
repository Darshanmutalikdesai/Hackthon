#!/bin/bash
# Implementation Verification Checklist

echo "🔍 Verifying Implementation"
echo "============================"
echo ""

PASSED=0
TOTAL=0

# Check function
check_file() {
  TOTAL=$((TOTAL + 1))
  if [ -f "$1" ]; then
    echo "✅ $1"
    PASSED=$((PASSED + 1))
  else
    echo "❌ $1 - NOT FOUND"
  fi
}

check_dir() {
  TOTAL=$((TOTAL + 1))
  if [ -d "$1" ]; then
    echo "✅ $1/"
    PASSED=$((PASSED + 1))
  else
    echo "❌ $1/ - NOT FOUND"
  fi
}

echo "📋 Configuration Files"
check_file "lighthouserc.json"
check_file "lighthouse-config.js"
check_file "lighthouse-results.json"
check_file ".nycrc.json"
echo ""

echo "📚 Documentation"
check_file "README.md"
check_file "ACCESSIBILITY.md"
check_file "TENANCY.md"
check_file "IMPLEMENTATION.md"
echo ""

echo "🧪 Test Scripts"
check_file "run-lighthouse.sh"
echo ""

echo "📁 Source Directories"
check_dir "src"
check_dir "src/components"
check_dir "src/hooks"
check_dir "src/services"
check_dir "src/utils"
check_dir "src/pages"
echo ""

echo "🔑 Key Source Files"
check_file "src/utils/auth.ts"
check_file "src/services/api.ts"
check_file "src/components/Heatmap.tsx"
check_file "src/components/DebriefFlowController.tsx"
check_file "src/hooks/useSSE.ts"
echo ""

echo "🎯 Core Feature Files"
check_file "src/pages/DashboardPage.tsx"
check_file "src/pages/DebriefPage.tsx"
check_file "src/components/CoachingStream.tsx"
echo ""

echo "================================"
echo "✅ Total Checks: $PASSED/$TOTAL Passed"
echo ""

if [ $PASSED -eq $TOTAL ]; then
  echo "🎉 All files present and accounted for!"
  echo ""
  echo "Next steps:"
  echo "1. npm install"
  echo "2. npm run build"
  echo "3. npm run preview &"
  echo "4. ./run-lighthouse.sh"
  exit 0
else
  echo "⚠️  Missing $((TOTAL - PASSED)) file(s)"
  exit 1
fi
