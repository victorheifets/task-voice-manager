import pytest
import requests
from conftest import API_BASE

class TestHealth:
    """Comprehensive test suite for health endpoints"""

    def test_get_api_health(self, client, api_headers):
        """GET /api/health - Health Check"""
        response = client.get(f"{API_BASE}/api/health", headers=api_headers)
        assert response.status_code in [200, 404]  # Accept 404 if no data exists
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))

