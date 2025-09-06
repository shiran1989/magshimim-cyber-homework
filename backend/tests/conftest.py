"""
Pytest configuration and fixtures for the cybersecurity intelligence app
"""
import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
from app.main import app
from app.database import get_database, connect_to_mongo, close_mongo_connection
from app.services import MITREAttackService, AttackPatternService


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Create a test client for the FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
async def test_db() -> AsyncGenerator[AsyncIOMotorClient, None]:
    """Create a test database connection."""
    # Use a test database
    test_client = AsyncIOMotorClient("mongodb://localhost:27017")
    test_db = test_client.cybersecurity_intelligence_test
    
    # Override the database dependency
    app.dependency_overrides[get_database] = lambda: test_db
    
    yield test_db
    
    # Clean up
    await test_client.drop_database("cybersecurity_intelligence_test")
    test_client.close()
    app.dependency_overrides.clear()


@pytest.fixture
async def sample_attack_patterns(test_db) -> list[dict]:
    """Create sample attack patterns for testing."""
    sample_patterns = [
        {
            "id": "T1001",
            "name": "Data Exfiltration",
            "description": "Adversaries may steal data from compromised systems",
            "x_mitre_platforms": ["Windows", "Linux"],
            "x_mitre_detection": "Monitor network traffic for unusual data transfers",
            "phase_name": "Exfiltration",
            "external_id": "T1001",
            "kill_chain_phases": ["Exfiltration"],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "T1055",
            "name": "Process Injection",
            "description": "Adversaries may inject code into processes to evade detection",
            "x_mitre_platforms": ["Windows"],
            "x_mitre_detection": "Monitor for process injection techniques",
            "phase_name": "Defense Evasion",
            "external_id": "T1055",
            "kill_chain_phases": ["Defense Evasion"],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        },
        {
            "id": "T1027",
            "name": "Obfuscated Files or Information",
            "description": "Adversaries may attempt to make an executable or file difficult to discover or analyze",
            "x_mitre_platforms": ["Windows", "Linux", "macOS"],
            "x_mitre_detection": "Monitor for obfuscated files and unusual file extensions",
            "phase_name": "Defense Evasion",
            "external_id": "T1027",
            "kill_chain_phases": ["Defense Evasion"],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
    
    await test_db.attack_patterns.insert_many(sample_patterns)
    return sample_patterns


@pytest.fixture
def mitre_service() -> MITREAttackService:
    """Create a MITRE attack service instance for testing."""
    return MITREAttackService()


@pytest.fixture
def attack_pattern_service(test_db) -> AttackPatternService:
    """Create an attack pattern service instance for testing."""
    return AttackPatternService(test_db)


@pytest.fixture(autouse=True)
async def setup_test_environment():
    """Setup test environment before each test."""
    # This runs before each test
    pass


@pytest.fixture(autouse=True)
async def cleanup_test_environment():
    """Cleanup test environment after each test."""
    # This runs after each test
    pass
