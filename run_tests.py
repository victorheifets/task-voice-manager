#!/usr/bin/env python3
"""
Easy test runner with web server for online HTML report access
"""
import subprocess
import http.server
import socketserver
import webbrowser
import threading
import time
import os
import sys

def run_tests():
    """Run the comprehensive test suite"""
    print("🧪 Running comprehensive API test suite...")
    print("=" * 60)
    
    # Activate virtual environment and run tests
    cmd = [
        "source test_env/bin/activate && "
        "pytest --html=report.html --self-contained-html --css=custom_report.css tests/ -v"
    ]
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    print("📊 Test Results:")
    print(result.stdout)
    if result.stderr:
        print("⚠️ Warnings/Errors:")
        print(result.stderr)
    
    return result.returncode == 0

def start_web_server(port=8080):
    """Start a simple HTTP server to serve the HTML report"""
    
    class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            # Add CORS headers for better accessibility
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
        
        def log_message(self, format, *args):
            # Custom logging
            print(f"📡 {self.address_string()} - {format % args}")
    
    try:
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            print(f"🌐 Starting web server at http://localhost:{port}")
            print(f"📋 Test report available at: http://localhost:{port}/report.html")
            print(f"🔗 Direct link: http://localhost:{port}/report.html")
            print("=" * 60)
            print("🎯 INSTRUCTIONS:")
            print(f"   1. Open browser and go to: http://localhost:{port}/report.html")
            print(f"   2. Or access from network: http://{get_local_ip()}:{port}/report.html")
            print("   3. Press Ctrl+C to stop the server")
            print("=" * 60)
            
            # Auto-open browser
            threading.Timer(2, lambda: webbrowser.open(f"http://localhost:{port}/report.html")).start()
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use. Trying port {port + 1}...")
            start_web_server(port + 1)
        else:
            print(f"❌ Error starting server: {e}")

def get_local_ip():
    """Get local IP address for network access"""
    import socket
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except:
        return "localhost"

def main():
    """Main function"""
    print("🔬 API Test Suite & Web Server")
    print("=" * 60)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--server-only":
        print("🌐 Starting web server only (skipping tests)...")
        start_web_server()
        return
    
    # Run tests first
    success = run_tests()
    
    if success:
        print("✅ Tests completed successfully!")
    else:
        print("⚠️ Some tests failed, but report is still generated")
    
    print("\n🌐 Starting web server to serve the HTML report...")
    time.sleep(2)
    start_web_server()

if __name__ == "__main__":
    main()