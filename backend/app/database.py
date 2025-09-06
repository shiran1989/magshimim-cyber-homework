import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None


db = Database()


async def get_database() -> AsyncIOMotorClient:
    """Get database connection"""
    return db.database


async def connect_to_mongo():
    """Create database connection"""
    try:
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        database_name = os.getenv("DATABASE_NAME", "cybersecurity_intelligence")
        
        db.client = AsyncIOMotorClient(mongodb_url)
        db.database = db.client[database_name]
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info(f"Connected to MongoDB at {mongodb_url}")
        logger.info(f"Using database: {database_name}")
        
        # Create indexes for better search performance
        await create_search_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")


async def create_search_indexes():
    """Create indexes for better search performance"""
    try:
        collection = db.database.attack_patterns
        
        # Create text index for full-text search on main searchable fields
        await collection.create_index([
            ("name", "text"),
            ("description", "text"),
            ("x_mitre_platforms", "text"),
            ("x_mitre_detection", "text"),
            ("phase_name", "text"),
            ("external_id", "text")
        ])
        
        # Create individual indexes for regex searches and filtering
        await collection.create_index("name")
        await collection.create_index("description")
        await collection.create_index("x_mitre_platforms")
        await collection.create_index("x_mitre_detection")
        await collection.create_index("phase_name")
        await collection.create_index("external_id")
        await collection.create_index("kill_chain_phases.phase_name")
        await collection.create_index("external_references.source_name")
        await collection.create_index("external_references.external_id")
        
        # Create indexes for additional MITRE fields
        await collection.create_index("x_mitre_domains")
        await collection.create_index("x_mitre_data_sources")
        await collection.create_index("x_mitre_version")
        await collection.create_index("x_mitre_is_subtechnique")
        await collection.create_index("x_mitre_deprecated")
        await collection.create_index("created")
        await collection.create_index("modified")
        
        # Create compound indexes for common queries
        await collection.create_index([("x_mitre_platforms", 1), ("phase_name", 1)])
        await collection.create_index([("x_mitre_domains", 1), ("x_mitre_platforms", 1)])
        await collection.create_index([("x_mitre_is_subtechnique", 1), ("x_mitre_deprecated", 1)])
        
        logger.info("Search indexes created successfully")
    except Exception as e:
        logger.warning(f"Failed to create search indexes: {e}")


def get_sync_database():
    """Get synchronous database connection for data ingestion"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "cybersecurity_intelligence")
    
    client = MongoClient(mongodb_url)
    return client[database_name]
