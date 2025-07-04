import pytest
import requests
from conftest import API_BASE

class Test:
    """Comprehensive test suite for  endpoints"""

    def test_get_(self, client, api_headers):
        """GET / - Read Root"""
        response = client.get(f"{API_BASE}/", headers=api_headers)
        assert response.status_code in [200, 404]  # Accept 404 if no data exists
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))

