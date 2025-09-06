"""
Database integration tests for the cybersecurity intelligence app
"""
import pytest
from motor.motor_asyncio import AsyncIOMotorClient
from app.database import connect_to_mongo, close_mongo_connection, get_database
from app.services import MITREAttackService, AttackPatternService


class TestDatabaseConnection:
    """Test cases for database connection"""
    
    @pytest.mark.asyncio
    async def test_database_connection(self, test_db):
        """Test database connection is working"""
        # Test basic database operations
        collection = test_db.test_collection
        
        # Insert a test document
        result = await collection.insert_one({"test": "data"})
        assert result.inserted_id is not None
        
        # Find the document
        document = await collection.find_one({"_id": result.inserted_id})
        assert document is not None
        assert document["test"] == "data"
        
        # Clean up
        await collection.delete_one({"_id": result.inserted_id})
    
    @pytest.mark.asyncio
    async def test_database_indexes(self, test_db):
        """Test database indexes are created properly"""
        collection = test_db.attack_patterns
        
        # Check if indexes exist
        indexes = await collection.list_indexes().to_list(length=None)
        index_names = [index["name"] for index in indexes]
        
        # Should have at least the default _id index
        assert "_id_" in index_names


class TestAttackPatternServiceIntegration:
    """Integration tests for AttackPatternService with real database"""
    
    @pytest.mark.database
    @pytest.mark.asyncio
    async def test_attack_pattern_crud_operations(self, test_db, sample_attack_patterns):
        """Test CRUD operations on attack patterns"""
        service = AttackPatternService(test_db)
        
        # Test getting all patterns
        patterns, total = await service.get_all_patterns(limit=10, offset=0)
        assert len(patterns) >= 3  # We have 3 sample patterns
        assert total >= 3
        
        # Test searching patterns
        search_patterns, search_total = await service.search_patterns("injection", limit=10, offset=0)
        assert isinstance(search_patterns, list)
        assert search_total >= 0
        
        # Test getting specific pattern
        pattern = await service.get_pattern_by_id("T1001")
        assert pattern["id"] == "T1001"
        assert pattern["name"] == "Data Exfiltration"
    
    @pytest.mark.database
    @pytest.mark.asyncio
    async def test_search_case_insensitive(self, test_db, sample_attack_patterns):
        """Test that search is case-insensitive"""
        service = AttackPatternService(test_db)
        
        # Search with different cases
        results1, _ = await service.search_patterns("INJECTION", limit=10, offset=0)
        results2, _ = await service.search_patterns("injection", limit=10, offset=0)
        results3, _ = await service.search_patterns("Injection", limit=10, offset=0)
        
        # All should return the same results
        assert len(results1) == len(results2) == len(results3)
    
    @pytest.mark.database
    @pytest.mark.asyncio
    async def test_pagination_consistency(self, test_db, sample_attack_patterns):
        """Test that pagination works consistently"""
        service = AttackPatternService(test_db)
        
        # Get first page
        page1, total1 = await service.get_all_patterns(limit=2, offset=0)
        
        # Get second page
        page2, total2 = await service.get_all_patterns(limit=2, offset=2)
        
        # Total should be the same
        assert total1 == total2
        
        # Pages should not overlap
        if page1 and page2:
            page1_ids = {p["id"] for p in page1}
            page2_ids = {p["id"] for p in page2}
            assert page1_ids.isdisjoint(page2_ids)


class TestMITREAttackServiceIntegration:
    """Integration tests for MITREAttackService"""
    
    @pytest.mark.slow
    @pytest.mark.asyncio
    async def test_fetch_real_mitre_data(self):
        """Test fetching real data from MITRE (slow test)"""
        service = MITREAttackService()
        
        try:
            patterns = await service.fetch_attack_patterns()
            assert len(patterns) > 0
            
            # Check that patterns have expected structure
            first_pattern = patterns[0]
            assert "id" in first_pattern
            assert "name" in first_pattern
            assert "description" in first_pattern
            
        except Exception as e:
            pytest.skip(f"Could not fetch MITRE data: {e}")
    
    @pytest.mark.asyncio
    async def test_process_mitre_data(self, test_db):
        """Test processing MITRE data into database"""
        service = MITREAttackService()
        
        # Mock MITRE data
        mock_patterns = [
            {
                "id": "T1001",
                "name": "Test Attack 1",
                "description": "Test attack pattern 1",
                "x_mitre_platforms": ["Windows"],
                "x_mitre_detection": "Monitor network",
                "kill_chain_phases": [{"phase_name": "execution"}],
                "external_references": [{"external_id": "T1001"}]
            },
            {
                "id": "T1002",
                "name": "Test Attack 2",
                "description": "Test attack pattern 2",
                "x_mitre_platforms": ["Linux"],
                "x_mitre_detection": "Monitor processes",
                "kill_chain_phases": [{"phase_name": "persistence"}],
                "external_references": [{"external_id": "T1002"}]
            }
        ]
        
        # Process patterns
        processed_patterns = []
        for pattern_data in mock_patterns:
            processed = service.process_attack_pattern(pattern_data)
            processed_patterns.append(processed.dict())
        
        # Insert into database
        result = await test_db.attack_patterns.insert_many(processed_patterns)
        assert len(result.inserted_ids) == 2
        
        # Verify data was inserted correctly
        patterns = await test_db.attack_patterns.find().to_list(length=None)
        assert len(patterns) == 2
        
        # Check specific pattern
        pattern1 = await test_db.attack_patterns.find_one({"id": "T1001"})
        assert pattern1["name"] == "Test Attack 1"
        assert pattern1["x_mitre_platforms"] == ["Windows"]
        assert pattern1["phase_name"] == "execution"


class TestDataConsistency:
    """Test cases for data consistency"""
    
    @pytest.mark.database
    @pytest.mark.asyncio
    async def test_attack_pattern_data_integrity(self, test_db, sample_attack_patterns):
        """Test that attack pattern data maintains integrity"""
        service = AttackPatternService(test_db)
        
        # Get all patterns
        patterns, _ = await service.get_all_patterns(limit=100, offset=0)
        
        for pattern in patterns:
            # Check required fields
            assert "id" in pattern
            assert "name" in pattern
            assert "description" in pattern
            assert "x_mitre_platforms" in pattern
            assert "x_mitre_detection" in pattern
            assert "phase_name" in pattern
            assert "external_id" in pattern
            assert "kill_chain_phases" in pattern
            assert "created_at" in pattern
            assert "updated_at" in pattern
            
            # Check data types
            assert isinstance(pattern["x_mitre_platforms"], list)
            assert isinstance(pattern["kill_chain_phases"], list)
            assert isinstance(pattern["name"], str)
            assert isinstance(pattern["description"], str)
    
    @pytest.mark.database
    @pytest.mark.asyncio
    async def test_unique_ids(self, test_db, sample_attack_patterns):
        """Test that all attack pattern IDs are unique"""
        service = AttackPatternService(test_db)
        
        patterns, _ = await service.get_all_patterns(limit=100, offset=0)
        ids = [pattern["id"] for pattern in patterns]
        
        # All IDs should be unique
        assert len(ids) == len(set(ids))

