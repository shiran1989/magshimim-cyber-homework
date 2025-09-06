import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services import MITREAttackService, AttackPatternService


class TestMITREAttackService:
    """Test cases for MITREAttackService"""
    
    @pytest.fixture
    def service(self):
        return MITREAttackService()
    
    @pytest.mark.asyncio
    async def test_fetch_attack_patterns_success(self, service):
        """Test successful fetching of attack patterns"""
        mock_data = {
            "objects": [
                {
                    "id": "T1001",
                    "name": "Test Attack 1",
                    "description": "First test attack",
                    "x_mitre_platforms": ["Windows"],
                    "x_mitre_detection": "Monitor network",
                    "kill_chain_phases": [{"phase_name": "execution"}],
                    "external_references": [{"external_id": "T1001"}]
                }
            ]
        }
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = AsyncMock()
            mock_response.json.return_value = mock_data
            mock_response.raise_for_status.return_value = None
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            result = await service.fetch_attack_patterns()
            
            assert len(result) == 1
            assert result[0]["id"] == "T1001"
            assert result[0]["name"] == "Test Attack 1"
    
    @pytest.mark.asyncio
    async def test_fetch_attack_patterns_failure(self, service):
        """Test handling of fetch failure"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.side_effect = Exception("Network error")
            
            with pytest.raises(Exception, match="Network error"):
                await service.fetch_attack_patterns()
    
    def test_process_attack_pattern_complete(self, service):
        """Test processing a complete attack pattern"""
        pattern_data = {
            "id": "T1001",
            "name": "Test Attack",
            "description": "A test attack pattern",
            "x_mitre_platforms": ["Windows", "Linux"],
            "x_mitre_detection": "Monitor network traffic",
            "kill_chain_phases": [{"phase_name": "execution"}, {"phase_name": "persistence"}],
            "external_references": [{"external_id": "T1001"}]
        }
        
        result = service.process_attack_pattern(pattern_data)
        
        assert result.id == "T1001"
        assert result.name == "Test Attack"
        assert result.description == "A test attack pattern"
        assert result.x_mitre_platforms == ["Windows", "Linux"]
        assert result.x_mitre_detection == "Monitor network traffic"
        assert result.phase_name == "execution"
        assert result.external_id == "T1001"
        assert result.kill_chain_phases == ["execution", "persistence"]
    
    def test_process_attack_pattern_minimal(self, service):
        """Test processing a minimal attack pattern"""
        pattern_data = {
            "id": "T1002",
            "name": "Minimal Attack",
            "description": "Minimal attack pattern",
            "external_references": [{"external_id": "T1002"}]
        }
        
        result = service.process_attack_pattern(pattern_data)
        
        assert result.id == "T1002"
        assert result.name == "Minimal Attack"
        assert result.x_mitre_platforms == ["NA"]
        assert result.x_mitre_detection == "NA"
        assert result.phase_name == "NA"
        assert result.kill_chain_phases == []


class TestAttackPatternService:
    """Test cases for AttackPatternService"""
    
    @pytest.fixture
    def mock_database(self):
        mock_db = MagicMock()
        mock_collection = AsyncMock()
        mock_db.attack_patterns = mock_collection
        return mock_db
    
    @pytest.fixture
    def service(self, mock_database):
        return AttackPatternService(mock_database)
    
    @pytest.mark.asyncio
    async def test_get_all_patterns(self, service, mock_database):
        """Test getting all attack patterns"""
        mock_patterns = [
            {"id": "T1001", "name": "Test Attack 1"},
            {"id": "T1002", "name": "Test Attack 2"}
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = mock_patterns
        mock_database.attack_patterns.find.return_value = mock_cursor
        mock_database.attack_patterns.count_documents.return_value = 2
        
        patterns, total = await service.get_all_patterns(limit=10, offset=0)
        
        assert len(patterns) == 2
        assert total == 2
        assert patterns[0]["id"] == "T1001"
        assert patterns[1]["id"] == "T1002"
    
    @pytest.mark.asyncio
    async def test_search_patterns(self, service, mock_database):
        """Test searching attack patterns"""
        mock_patterns = [
            {"id": "T1001", "name": "DLL Attack", "description": "Uses DLL injection"}
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = mock_patterns
        mock_database.attack_patterns.find.return_value = mock_cursor
        mock_database.attack_patterns.count_documents.return_value = 1
        
        patterns, total = await service.search_patterns("DLL", limit=10, offset=0)
        
        assert len(patterns) == 1
        assert total == 1
        assert patterns[0]["name"] == "DLL Attack"
        
        # Verify the search filter was applied
        mock_database.attack_patterns.find.assert_called_once()
        call_args = mock_database.attack_patterns.find.call_args[0][0]
        assert "description" in call_args
        assert call_args["description"]["$regex"] == "DLL"
        assert call_args["description"]["$options"] == "i"
    
    @pytest.mark.asyncio
    async def test_get_pattern_by_id_found(self, service, mock_database):
        """Test getting a pattern by ID when found"""
        mock_pattern = {"id": "T1001", "name": "Test Attack"}
        mock_database.attack_patterns.find_one.return_value = mock_pattern
        
        result = await service.get_pattern_by_id("T1001")
        
        assert result["id"] == "T1001"
        assert result["name"] == "Test Attack"
    
    @pytest.mark.asyncio
    async def test_get_pattern_by_id_not_found(self, service, mock_database):
        """Test getting a pattern by ID when not found"""
        mock_database.attack_patterns.find_one.return_value = None
        
        with pytest.raises(ValueError, match="Attack pattern with ID T9999 not found"):
            await service.get_pattern_by_id("T9999")
