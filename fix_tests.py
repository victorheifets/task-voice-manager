#!/usr/bin/env python3
"""Fix test files to handle API response format"""

import re
import os

def fix_test_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix response data access patterns
    content = re.sub(
        r'(\s+)data = response\.json\(\)\n(\s+)assert data\[',
        r'\1response_data = response.json()\n\1assert response_data["success"] == True\n\1data = response_data["data"]\n\2assert data[',
        content
    )
    
    # Fix ID extraction patterns
    content = re.sub(
        r'([a-zA-Z_]+_id) = ([a-zA-Z_]+_response)\.json\(\)\["id"\]',
        r'\1 = \2.json()["data"]["id"]',
        content
    )
    
    # Fix activity-specific patterns
    content = re.sub(
        r'pytest\.created_activity_id = data\["id"\]',
        r'pytest.created_activity_id = data["id"]',
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)

# Fix all test files
test_files = [
    'tests/test_activities.py',
    'tests/test_participants.py', 
    'tests/test_enrollments.py',
    'tests/test_leads.py'
]

for test_file in test_files:
    if os.path.exists(test_file):
        print(f"Fixing {test_file}")
        fix_test_file(test_file)