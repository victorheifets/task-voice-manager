#!/bin/bash

# Create simple PWA icons using ImageMagick or similar
# This script creates basic icons for testing - replace with actual design assets

# Create a simple colored square as base icon
echo "Creating basic PWA icons..."

# For development, create simple SVG icons that can be converted
cat > icon-base.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#3f51b5"/>
  <circle cx="256" cy="256" r="100" fill="white"/>
  <path d="M256 180c-20 0-36 16-36 36v60c0 20 16 36 36 36s36-16 36-36v-60c0-20-16-36-36-36z" fill="#3f51b5"/>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle">Task</text>
</svg>
EOF

# If you have ImageMagick installed, uncomment these lines:
# convert icon-base.svg -resize 192x192 icon-192x192.png
# convert icon-base.svg -resize 512x512 icon-512x512.png

echo "Created icon-base.svg"
echo "To create PNG icons, install ImageMagick and run:"
echo "convert icon-base.svg -resize 192x192 icon-192x192.png"
echo "convert icon-base.svg -resize 512x512 icon-512x512.png"