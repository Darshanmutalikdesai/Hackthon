# Lighthouse CI Setup Guide

## Quick Setup

### For Ubuntu/Debian (Recommended)
```bash
# Install Chrome
sudo apt-get update
sudo apt-get install -y chromium-browser

# Run Lighthouse CI
./run-lighthouse.sh
```

### For Fedora/RHEL
```bash
# Install Chrome
sudo dnf install chromium

# Run Lighthouse CI
./run-lighthouse.sh
```

### For macOS
```bash
# Install Chrome using Homebrew
brew install chromium

# Run Lighthouse CI
./run-lighthouse.sh
```

### For Windows
1. Download Chrome from: https://www.google.com/chrome/
2. Install normally
3. Run: `./run-lighthouse.sh` (Git Bash or WSL)

---

## Troubleshooting

### "Chrome installation not found"
**Solution:** Install Chrome/Chromium using the commands above for your OS.

### "GitHub token not set"
**This is OK** - The GitHub token is only needed if you want to upload results to GitHub. For local testing, you can ignore this warning.

### Port 5173 already in use
```bash
# Kill the existing process
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Then try again
./run-lighthouse.sh
```

### Server failed to start
```bash
# Try increasing the wait time in the script, or run manually:
npm run preview &
sleep 10
npx lhci autorun
```

---

## Alternative: Simple Lighthouse Testing

If Lighthouse CI doesn't work, use the simple version:
```bash
chmod +x run-lighthouse-simple.sh
./run-lighthouse-simple.sh
```

This runs individual Lighthouse audits without CI infrastructure.

---

## Expected Results

Target metrics (all ≥ 90):
- **Performance**: 92+
- **Accessibility**: 95+
- **Best Practices**: 96+

Sample output:
```
✅ Lighthouse CI completed successfully!
📊 Results saved in ./lhci_reports/

📈 To view results:
   1. Open ./lhci_reports/index.html in your browser
   2. Check individual page reports for detailed metrics
```

---

## Manual Testing (No Automation)

If you just want to test without running scripts:

```bash
# 1. Build app
npm run build

# 2. Start preview
npm run preview

# 3. Open in another terminal
npx lighthouse http://localhost:5173 --view

# 4. Open debrief page
npx lighthouse http://localhost:5173/debrief/b2c3d4e5-f6a7-8901-bcde-f12345678901 --view
```

---

## CI/CD Integration

### For GitHub Actions
Create `.github/workflows/lighthouse.yml`:
```yaml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm install -g @lhci/cli@latest
      - run: lhci autorun
```

### For GitLab CI
Create `.gitlab-ci.yml`:
```yaml
lighthouse:
  image: node:18-chrome
  script:
    - npm install
    - npm run build
    - npm install -g @lhci/cli@latest
    - lhci autorun
  artifacts:
    paths:
      - lhci_reports/
```

---

## Docker-Based Testing

If you prefer isolated testing:

```bash
# Run in Docker
docker run -it --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  node:18-chrome \
  bash -c "npm install && npm run build && npm install -g @lhci/cli && lhci autorun"
```

---

## Configuration Reference

### lighthouserc.json
Main configuration file with:
- URLs to audit (dashboard + debrief)
- Number of runs (3 for averaging)
- Performance thresholds (≥ 0.9 for all categories)
- Upload settings

### lighthouse-config.js
Advanced settings including:
- Mobile form factor (375×667)
- Emulated user agent
- Categories to audit
- Chrome path detection

---

## Interpreting Results

### Performance Score
- **90+**: Excellent (< 2.7s LCP)
- **80-89**: Good (2.8-4.2s LCP)
- **50-79**: Needs improvement
- **< 50**: Poor

### Accessibility Score
- **90+**: Excellent (WCAG AA compliant)
- **80-89**: Good
- **< 80**: Missing critical accessibility features

### Best Practices Score
- **90+**: Modern browser patterns
- **80-89**: Some deprecations
- **< 80**: Security/modernization issues

---

## Key Metrics

| Metric | Target | Good | Poor |
|--------|--------|------|------|
| FCP (First Contentful Paint) | < 1.8s | < 2.0s | > 3.0s |
| LCP (Largest Contentful Paint) | < 2.5s | < 4.0s | > 4.0s |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.1 | > 0.25 |
| TBT (Total Blocking Time) | < 150ms | < 200ms | > 600ms |

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Chrome not found | Not installed | Install Chrome/Chromium |
| Port 5173 in use | Server already running | Kill existing process |
| Timeout error | Server slow to start | Increase sleep duration |
| Permission denied | Script not executable | `chmod +x *.sh` |
| No results | Server not responding | Check `npm run preview` works |

---

## Additional Resources

- [Lighthouse Docs](https://developers.google.com/web/tools/lighthouse)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
