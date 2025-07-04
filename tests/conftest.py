import pytest
import requests
import json

# API Configuration
BASE_URL = "http://localhost:8082"
API_BASE = f"{BASE_URL}/api"

# Default Provider ID for testing
PROVIDER_ID = "ffa6c96f-e4a2-4df2-8298-415daa45d23c"

@pytest.fixture
def api_headers():
    """Standard headers for API requests"""
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Provider-ID": PROVIDER_ID
    }

@pytest.fixture
def client():
    """HTTP client session"""
    session = requests.Session()
    return session

@pytest.fixture
def swagger_spec():
    """Fetch OpenAPI specification"""
    response = requests.get(f"{BASE_URL}/openapi.json")
    return response.json()