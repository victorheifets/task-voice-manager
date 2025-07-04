#!/bin/bash
# Simple script to run tests and start web server

echo "🔬 API Test Suite & Web Server"
echo "=============================="

# Run tests
echo "🧪 Running tests..."
source test_env/bin/activate
pytest --html=report.html --self-contained-html --css=custom_report.css tests/ -q

echo ""
echo "🌐 Starting web server..."
echo "📋 Report will be available at: http://localhost:8080/report.html"
echo "🔗 Network access: http://$(hostname -I | awk '{print $1}'):8080/report.html"
echo ""
echo "Press Ctrl+C to stop server"
echo "=============================="

# Start simple Python web server
python3 -m http.server 8080