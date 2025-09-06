import pytest
from datetime import datetime
from app.models import AttackPattern, AttackPatternResponse, SearchRequest, SearchResponse


class TestAttackPattern:
    """Test cases for AttackPattern model"""
    
    def test_attack_pattern_creation(self):
        """Test creating an attack pattern with all fields"""
        pattern = AttackPattern(
            id="T1001",
            name="Test Attack",
            description="A test attack pattern",
            x_mitre_platforms=["Windows", "Linux"],
            x_mitre_detection="Monitor network traffic",
            phase_name="Command and Control",
            external_id="T1001"
        )
        
        assert pattern.id == "T1001"
        assert pattern.name == "Test Attack"
        assert pattern.description == "A test attack pattern"
        assert pattern.x_mitre_platforms == ["Windows", "Linux"]
        assert pattern.x_mitre_detection == "Monitor network traffic"
        assert pattern.phase_name == "Command and Control"
        assert pattern.external_id == "T1001"
        assert isinstance(pattern.created_at, datetime)
        assert isinstance(pattern.updated_at, datetime)
    
    def test_attack_pattern_defaults(self):
        """Test creating an attack pattern with default values"""
        pattern = AttackPattern(
            id="T1002",
            name="Minimal Attack",
            description="Minimal attack pattern",
            external_id="T1002"
        )
        
        assert pattern.x_mitre_platforms == []
        assert pattern.x_mitre_detection == "NA"
        assert pattern.phase_name == "NA"
        assert pattern.kill_chain_phases == []
    
    def test_attack_pattern_json_serialization(self):
        """Test JSON serialization of attack pattern"""
        pattern = AttackPattern(
            id="T1003",
            name="JSON Test",
            description="Test JSON serialization",
            external_id="T1003"
        )
        
        json_data = pattern.json()
        assert "T1003" in json_data
        assert "JSON Test" in json_data
        assert "created_at" in json_data


class TestSearchRequest:
    """Test cases for SearchRequest model"""
    
    def test_search_request_creation(self):
        """Test creating a search request"""
        request = SearchRequest(query="test query", limit=25, offset=10)
        
        assert request.query == "test query"
        assert request.limit == 25
        assert request.offset == 10
    
    def test_search_request_defaults(self):
        """Test search request with default values"""
        request = SearchRequest(query="test")
        
        assert request.query == "test"
        assert request.limit == 50
        assert request.offset == 0


class TestSearchResponse:
    """Test cases for SearchResponse model"""
    
    def test_search_response_creation(self):
        """Test creating a search response"""
        patterns = [
            AttackPatternResponse(
                id="T1001",
                name="Test Attack 1",
                description="First test attack",
                x_mitre_platforms=["Windows"],
                x_mitre_detection="Monitor",
                phase_name="Execution",
                external_id="T1001",
                kill_chain_phases=["execution"],
                created_at="2023-01-01T00:00:00",
                updated_at="2023-01-01T00:00:00"
            )
        ]
        
        response = SearchResponse(
            results=patterns,
            total=1,
            limit=50,
            offset=0
        )
        
        assert len(response.results) == 1
        assert response.total == 1
        assert response.limit == 50
        assert response.offset == 0
        assert response.results[0].name == "Test Attack 1"
