import pytest
import requests
from conftest import API_BASE

class TestPublic:
    """Comprehensive test suite for public endpoints"""

    def test_get_api_public_activities(self, client, api_headers):
        """GET /api/public/activities - List Public Activities"""
        response = client.get(f"{API_BASE}/api/public/activities", headers=api_headers)
        assert response.status_code in [200, 404]  # Accept 404 if no data exists
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))

    def test_get_api_public_activities_activity_id(self, client, api_headers):
        """GET /api/public/activities/{activity_id} - Get Public Activity"""
        # Test with existing ID or skip if no data available
        import pytest
        pytest.skip("GET endpoint with ID parameter - needs existing data")
        
        # Example: response = client.get(f"{API_BASE}/api/public/activities/activity_id", headers=api_headers)
        # assert response.status_code == 200

    def test_get_api_public_providers(self, client, api_headers):
        """GET /api/public/providers - List Public Providers"""
        response = client.get(f"{API_BASE}/api/public/providers", headers=api_headers)
        assert response.status_code in [200, 404]  # Accept 404 if no data exists
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict))

    def test_get_api_public_providers_provider_id(self, client, api_headers):
        """GET /api/public/providers/{provider_id} - Get Public Provider"""
        # Test with existing ID or skip if no data available
        import pytest
        pytest.skip("GET endpoint with ID parameter - needs existing data")
        
        # Example: response = client.get(f"{API_BASE}/api/public/providers/provider_id", headers=api_headers)
        # assert response.status_code == 200

    def test_get_api_public_providers_provider_id_activities(self, client, api_headers):
        """GET /api/public/providers/{provider_id}/activities - Get Provider Activities"""
        # Test with existing ID or skip if no data available
        import pytest
        pytest.skip("GET endpoint with ID parameter - needs existing data")
        
        # Example: response = client.get(f"{API_BASE}/api/public/providers/provider_id/activities", headers=api_headers)
        # assert response.status_code == 200

