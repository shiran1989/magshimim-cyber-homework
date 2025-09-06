#!/usr/bin/env python3
"""
Data ingestion script for MITRE ATT&CK attack patterns
Run this script to populate the database with attack pattern data
"""

import asyncio
import logging
import os
from dotenv import load_dotenv
from app.services import MITREAttackService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def main():
    """Main function to ingest MITRE ATT&CK data"""
    try:
        logger.info("Starting MITRE ATT&CK data ingestion...")
        
        # Create service instance
        service = MITREAttackService()
        
        # Ingest data
        count = await service.ingest_data()
        
        logger.info(f"Data ingestion completed successfully. Inserted {count} attack patterns.")
        
    except Exception as e:
        logger.error(f"Data ingestion failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
