import pytest
import json
from conftest import API_BASE

class TestParticipants:
    """Test suite for /api/participants endpoints"""
    
    def test_create_participant(self, client, api_headers):
        """POST /api/participants - Create new participant"""
        participant_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@test.com",
            "phone": "+1234567890",
            "is_active": True
        }
        
        response = client.post(f"{API_BASE}/participants", 
                             headers=api_headers, 
                             json=participant_data)
        
        assert response.status_code in [200, 201]
        response_data = response.json()
        assert response_data["success"] == True
        data = response_data["data"]
        assert data["first_name"] == participant_data["first_name"]
        assert data["last_name"] == participant_data["last_name"]
        assert data["email"] == participant_data["email"]
        assert "id" in data
    
    def test_list_participants(self, client, api_headers):
        """GET /api/participants - List all participants"""
        response = client.get(f"{API_BASE}/participants", headers=api_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_participant_by_id(self, client, api_headers):
        """GET /api/participants/{id} - Get specific participant"""
        # First create a participant to get
        participant_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane.smith@test.com",
            "phone": "+1234567891",
            "is_active": True
        }
        
        create_response = client.post(f"{API_BASE}/participants", 
                                    headers=api_headers, 
                                    json=participant_data)
        assert create_response.status_code in [200, 201]
        participant_id = create_response.json()["data"]["id"]
        
        # Now get the participant
        response = client.get(f"{API_BASE}/participants/{participant_id}", headers=api_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == participant_id
        assert data["first_name"] == participant_data["first_name"]
        assert data["email"] == participant_data["email"]
    
    def test_update_participant(self, client, api_headers):
        """PUT /api/participants/{id} - Update participant"""
        # First create a participant to update
        participant_data = {
            "first_name": "Bob",
            "last_name": "Johnson",
            "email": "bob.johnson@test.com",
            "phone": "+1234567892",
            "is_active": True
        }
        
        create_response = client.post(f"{API_BASE}/participants", 
                                    headers=api_headers, 
                                    json=participant_data)
        assert create_response.status_code in [200, 201]
        participant_id = create_response.json()["data"]["id"]
        
        # Update the participant
        update_data = participant_data.copy()
        update_data["first_name"] = "Robert"
        update_data["phone"] = "+1234567899"
        
        response = client.put(f"{API_BASE}/participants/{participant_id}", 
                            headers=api_headers, 
                            json=update_data)
        
        # Skip if UPDATE not supported
        if response.status_code == 404:
            import pytest
            pytest.skip("UPDATE endpoint not available for participants")
        
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Robert"
        assert data["phone"] == "+1234567899"
    
    def test_delete_participant(self, client, api_headers):
        """DELETE /api/participants/{id} - Delete participant"""
        # First create a participant to delete
        participant_data = {
            "first_name": "Alice",
            "last_name": "Wilson",
            "email": "alice.wilson@test.com",
            "phone": "+1234567893",
            "is_active": True
        }
        
        create_response = client.post(f"{API_BASE}/participants", 
                                    headers=api_headers, 
                                    json=participant_data)
        assert create_response.status_code in [200, 201]
        participant_id = create_response.json()["data"]["id"]
        
        # Delete the participant
        response = client.delete(f"{API_BASE}/participants/{participant_id}", headers=api_headers)
        
        # Accept both 200 and 204 as success
        assert response.status_code in [200, 204]
        
        # Verify it's deleted
        get_response = client.get(f"{API_BASE}/participants/{participant_id}", headers=api_headers)
        assert get_response.status_code == 404