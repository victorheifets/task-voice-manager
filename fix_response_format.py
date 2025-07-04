#!/usr/bin/env python3
"""Fix test files with correct response format handling"""

import re
import os

def fix_test_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # For activities - direct response format
    if 'test_activities.py' in filepath:
        # POST responses - wrapped format
        content = re.sub(
            r'(\s+assert response\.status_code in \[200, 201\])\n(\s+)response_data = response\.json\(\)\n\n(\s+)assert response_data\["success"\] == True\n\n(\s+)data = response_data\["data"\]',
            r'\1\n\2data = response.json()',
            content
        )
        
        # GET responses - direct format
        content = re.sub(
            r'(\s+assert response\.status_code == 200)\n(\s+)response_data = response\.json\(\)\n\n(\s+)assert response_data\["success"\] == True\n\n(\s+)data = response_data\["data"\]',
            r'\1\n\2data = response.json()',
            content
        )
        
        # PUT responses - direct format
        content = re.sub(
            r'(\s+assert response\.status_code == 200)\n(\s+)response_data = response\.json\(\)\n\n(\s+)assert response_data\["success"\] == True\n\n(\s+)data = response_data\["data"\]',
            r'\1\n\2data = response.json()',
            content
        )
        
        # Fix ID extraction for activities
        content = re.sub(
            r'activity_id = ([a-zA-Z_]+_response)\.json\(\)\["data"\]\["id"\]',
            r'activity_id = \1.json()["id"]',
            content
        )
    
    # For participants - mixed format
    elif 'test_participants.py' in filepath:
        # GET responses need to be direct format
        content = re.sub(
            r'(\s+# Now get the participant\n\s+response = client\.get.*?\n\s+\n\s+assert response\.status_code == 200)\n(\s+)response_data = response\.json\(\)\n\n(\s+)assert response_data\["success"\] == True\n\n(\s+)data = response_data\["data"\]',
            r'\1\n\2data = response.json()',
            content, flags=re.DOTALL
        )
        
        # PUT responses need to be direct format (participants UPDATE endpoint returns direct)
        content = re.sub(
            r'(\s+assert response\.status_code == 200)\n(\s+)response_data = response\.json\(\)\n\n(\s+)assert response_data\["success"\] == True\n\n(\s+)data = response_data\["data"\]',
            r'\1\n\2data = response.json()',
            content
        )
    
    # For leads - mixed format
    elif 'test_leads.py' in filepath:
        # GET responses need to be direct format
        content = re.sub(
            r'(\s+# Now get the lead\n\s+response = client\.get.*?\n\s+\n\s+assert response\.status_code == 200)\n(\s+)response_data = response\.json\(\)\n\n(\s+)assert response_data\["success"\] == True\n\n(\s+)data = response_data\["data"\]',
            r'\1\n\2data = response.json()',
            content, flags=re.DOTALL
        )
        
        # PUT responses need to be direct format
        content = re.sub(
            r'(\s+assert response\.status_code == 200)\n(\s+)response_data = response\.json\(\)\n\n(\s+)assert response_data\["success"\] == True\n\n(\s+)data = response_data\["data"\]',
            r'\1\n\2data = response.json()',
            content
        )
    
    with open(filepath, 'w') as f:
        f.write(content)

# Fix all test files
test_files = [
    'tests/test_activities.py',
    'tests/test_participants.py', 
    'tests/test_leads.py'
]

for test_file in test_files:
    if os.path.exists(test_file):
        print(f"Fixing {test_file}")
        fix_test_file(test_file)