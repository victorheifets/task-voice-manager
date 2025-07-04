#!/usr/bin/env python3
"""Test script to discover API response formats"""

import requests
import json

API_BASE = "http://localhost:8082/api"
PROVIDER_ID = "ffa6c96f-e4a2-4df2-8298-415daa45d23c"
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json", 
    "X-Provider-ID": PROVIDER_ID
}

def test_endpoint_format(endpoint, data=None, method="GET"):
    """Test an endpoint and show response format"""
    print(f"\n=== Testing {method} {endpoint} ===")
    
    try:
        if method == "POST":
            response = requests.post(f"{API_BASE}{endpoint}", headers=headers, json=data)
        else:
            response = requests.get(f"{API_BASE}{endpoint}", headers=headers)
        
        print(f"Status: {response.status_code}")
        if response.status_code < 400:
            resp_data = response.json()
            print(f"Response structure: {list(resp_data.keys()) if isinstance(resp_data, dict) else 'List'}")
            if isinstance(resp_data, dict) and len(str(resp_data)) < 500:
                print(f"Sample: {resp_data}")
            elif isinstance(resp_data, list) and resp_data and len(str(resp_data[0])) < 500:
                print(f"First item: {resp_data[0]}")
            
            return resp_data
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    return None

# Test different endpoints
test_endpoint_format("/participants")
test_endpoint_format("/participants", {
    "first_name": "Test", 
    "last_name": "User", 
    "email": "test@example.com", 
    "is_active": True
}, "POST")

test_endpoint_format("/activities")
test_endpoint_format("/activities", {
    "name": "Test Activity",
    "description": "Test description", 
    "activity_type": "course",
    "status": "draft",
    "start_date": "2025-08-03",
    "end_date": "2025-09-02", 
    "capacity": 25
}, "POST")

test_endpoint_format("/marketing/leads")
test_endpoint_format("/marketing/leads", {
    "first_name": "Test",
    "last_name": "Lead",
    "email": "test@lead.com",
    "source": "website",
    "status": "new"
}, "POST")

test_endpoint_format("/enrollments")