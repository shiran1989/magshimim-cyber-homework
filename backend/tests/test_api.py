"""
API endpoint tests for the cybersecurity intelligence app
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from app.main import app


class TestHealthEndpoint:
    """Test cases for health check endpoint"""
    
    def test_health_check(self, client: TestClient):
        """Test the health check endpoint"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data


class TestAttackPatternsEndpoints:
    """Test cases for attack patterns endpoints"""
    
    @pytest.mark.database
    async def test_get_attack_patterns_success(self, client: TestClient, sample_attack_patterns):
        """Test getting attack patterns successfully"""
        response = client.get("/api/v1/attack-patterns?limit=10&offset=0")
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert "limit" in data
        assert "offset" in data
        assert len(data["results"]) <= 10
        assert data["total"] >= 0
    
    @pytest.mark.database
    async def test_get_attack_patterns_pagination(self, client: TestClient, sample_attack_patterns):
        """Test attack patterns pagination"""
        # First page
        response1 = client.get("/api/v1/attack-patterns?limit=2&offset=0")
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Second page
        response2 = client.get("/api/v1/attack-patterns?limit=2&offset=2")
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Results should be different
        if len(data1["results"]) > 0 and len(data2["results"]) > 0:
            assert data1["results"][0]["id"] != data2["results"][0]["id"]
    
    @pytest.mark.database
    async def test_get_attack_pattern_by_id_success(self, client: TestClient, sample_attack_patterns):
        """Test getting a specific attack pattern by ID"""
        response = client.get("/api/v1/attack-patterns/T1001")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == "T1001"
        assert data["name"] == "Data Exfiltration"
        assert "description" in data
    
    def test_get_attack_pattern_by_id_not_found(self, client: TestClient):
        """Test getting a non-existent attack pattern by ID"""
        response = client.get("/api/v1/attack-patterns/T9999")
        assert response.status_code == 404
        
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    @pytest.mark.database
    async def test_search_attack_patterns_success(self, client: TestClient, sample_attack_patterns):
        """Test searching attack patterns successfully"""
        response = client.post(
            "/api/v1/attack-patterns/search",
            json={"query": "injection", "limit": 10, "offset": 0}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert isinstance(data["results"], list)
    
    def test_search_attack_patterns_invalid_request(self, client: TestClient):
        """Test search with invalid request"""
        response = client.post(
            "/api/v1/attack-patterns/search",
            json={"invalid": "data"}
        )
        assert response.status_code == 422  # Validation error
    
    def test_search_attack_patterns_empty_query(self, client: TestClient):
        """Test search with empty query"""
        response = client.post(
            "/api/v1/attack-patterns/search",
            json={"query": "", "limit": 10, "offset": 0}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 0
        assert len(data["results"]) == 0


class TestStatsEndpoint:
    """Test cases for statistics endpoint"""
    
    @pytest.mark.database
    async def test_get_stats_success(self, client: TestClient, sample_attack_patterns):
        """Test getting statistics successfully"""
        response = client.get("/api/v1/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_patterns" in data
        assert "phase_distribution" in data
        assert "platform_distribution" in data
        assert isinstance(data["phase_distribution"], list)
        assert isinstance(data["platform_distribution"], list)
        assert data["total_patterns"] >= 0


class TestErrorHandling:
    """Test cases for error handling"""
    
    def test_invalid_endpoint(self, client: TestClient):
        """Test accessing non-existent endpoint"""
        response = client.get("/api/v1/invalid-endpoint")
        assert response.status_code == 404
    
    def test_invalid_method(self, client: TestClient):
        """Test using invalid HTTP method"""
        response = client.delete("/api/v1/attack-patterns")
        assert response.status_code == 405  # Method not allowed
    
    def test_malformed_json(self, client: TestClient):
        """Test sending malformed JSON"""
        response = client.post(
            "/api/v1/attack-patterns/search",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422


class TestCORS:
    """Test cases for CORS configuration"""
    
    def test_cors_headers(self, client: TestClient):
        """Test CORS headers are present"""
        response = client.options("/api/v1/health")
        assert response.status_code == 200
        assert "Access-Control-Allow-Origin" in response.headers
        assert "Access-Control-Allow-Methods" in response.headers
        assert "Access-Control-Allow-Headers" in response.headers
