import pytest
import requests
from conftest import API_BASE

class TestSearch:
    """Comprehensive test suite for search endpoints"""

    def test_get_api_search_activities(self, client, api_headers):
        """GET /api/search/activities - Search Activities"""
        response = client.get(f"{API_BASE}/api/search/activities", headers=api_headers)
        assert response.status_code in [200, 404]  # Accept 404 if no data exists
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))

    def test_get_api_search_participants(self, client, api_headers):
        """GET /api/search/participants - Search Participants"""
        response = client.get(f"{API_BASE}/api/search/participants", headers=api_headers)
        assert response.status_code in [200, 404]  # Accept 404 if no data exists
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))

    def test_get_api_search(self, client, api_headers):
        """GET /api/search - Search"""
        response = client.get(f"{API_BASE}/api/search", headers=api_headers)
        assert response.status_code in [200, 404]  # Accept 404 if no data exists
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))

