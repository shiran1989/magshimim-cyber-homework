import httpx
import json
import logging
from typing import List, Dict, Any
from app.database import get_sync_database
from app.models import AttackPattern

logger = logging.getLogger(__name__)


class MITREAttackService:
    """Service for fetching and processing MITRE ATT&CK data"""
    
    BASE_URL = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack"
    
    async def fetch_attack_patterns(self) -> List[Dict[str, Any]]:
        """Fetch attack patterns from MITRE ATT&CK repository"""
        try:
            # Get list of all attack pattern files
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.github.com/repos/mitre/cti/contents/enterprise-attack/attack-pattern"
                )
                response.raise_for_status()
                files = response.json()
                
                attack_patterns = []
                total_files = len([f for f in files if f["name"].endswith(".json")])
                processed_files = 0
                
                logger.info(f"Found {total_files} JSON files to process")
                
                # Process files in batches to manage memory
                batch_size = 100
                json_files = [f for f in files if f["name"].endswith(".json")]
                
                for i in range(0, len(json_files), batch_size):
                    batch = json_files[i:i + batch_size]
                    logger.info(f"Processing batch {i//batch_size + 1}/{(len(json_files) + batch_size - 1)//batch_size} ({len(batch)} files)")
                    
                    for file_info in batch:
                        if file_info["name"].endswith(".json"):
                            try:
                                file_response = await client.get(file_info["download_url"])
                                file_response.raise_for_status()
                                file_data = file_response.json()
                                
                                # Extract attack pattern from bundle
                                if "objects" in file_data:
                                    for obj in file_data["objects"]:
                                        if obj.get("type") == "attack-pattern":
                                            # Extract external ID from references
                                            external_id = "N/A"
                                            for ref in obj.get("external_references", []):
                                                if ref.get("source_name") == "mitre-attack":
                                                    external_id = ref.get("external_id", "N/A")
                                                    break
                                            
                                            # Extract platforms
                                            platforms = obj.get("x_mitre_platforms", [])
                                            
                                            # Extract kill chain phases
                                            kill_chain_phases = []
                                            for phase in obj.get("kill_chain_phases", []):
                                                kill_chain_phases.append({
                                                    "phase_name": phase.get("phase_name", "N/A")
                                                })
                                            
                                            attack_pattern = {
                                                "id": external_id,
                                                "name": obj.get("name", "N/A"),
                                                "description": obj.get("description", "N/A"),
                                                "x_mitre_platforms": platforms,
                                                "x_mitre_detection": obj.get("x_mitre_detection", "N/A"),
                                                "kill_chain_phases": kill_chain_phases,
                                                "external_references": obj.get("external_references", []),
                                                "created_at": obj.get("created", "N/A"),
                                                "modified_at": obj.get("modified", "N/A"),
                                                # Additional MITRE fields
                                                "x_mitre_domains": obj.get("x_mitre_domains", []),
                                                "x_mitre_data_sources": obj.get("x_mitre_data_sources", []),
                                                "x_mitre_version": obj.get("x_mitre_version", "N/A"),
                                                "x_mitre_is_subtechnique": obj.get("x_mitre_is_subtechnique", False),
                                                "x_mitre_deprecated": obj.get("x_mitre_deprecated", False),
                                                "x_mitre_attack_spec_version": obj.get("x_mitre_attack_spec_version", "N/A"),
                                                "created": obj.get("created", "N/A"),
                                                "modified": obj.get("modified", "N/A"),
                                                "phase_name": kill_chain_phases[0]["phase_name"] if kill_chain_phases else "N/A"
                                            }
                                            attack_patterns.append(attack_pattern)
                            except Exception as e:
                                logger.warning(f"Failed to process file {file_info['name']}: {e}")
                                continue
                            finally:
                                processed_files += 1
                                if processed_files % 50 == 0:  # Log every 50 files
                                    logger.info(f"Processed {processed_files}/{total_files} files, found {len(attack_patterns)} attack patterns")
                
                logger.info(f"Successfully fetched {len(attack_patterns)} attack patterns")
                return attack_patterns
                
        except Exception as e:
            logger.error(f"Failed to fetch attack patterns: {e}")
            # Fallback to sample data if API fails
            return [
                {
                    "id": "T1001",
                    "name": "Data Exfiltration",
                    "description": "Adversaries may steal data from compromised systems",
                    "x_mitre_platforms": ["Windows", "Linux"],
                    "x_mitre_detection": "Monitor network traffic for unusual data transfers",
                    "kill_chain_phases": [{"phase_name": "Exfiltration"}],
                    "external_references": [{"external_id": "T1001"}],
                    "created_at": "2020-01-01T00:00:00.000Z",
                    "modified_at": "2020-01-01T00:00:00.000Z"
                }
            ]
    
    def process_attack_pattern(self, pattern: Dict[str, Any]) -> AttackPattern:
        """Process a single attack pattern from MITRE data"""
        try:
            # Extract kill chain phases
            kill_chain_phases = pattern.get("kill_chain_phases", [])
            
            # Extract platforms
            platforms = pattern.get("x_mitre_platforms", [])
            if not platforms:
                platforms = ["NA"]
            
            # Extract detection methods
            detection = pattern.get("x_mitre_detection", "NA")
            if not detection:
                detection = "NA"
            
            # Get phase name (first kill chain phase or NA)
            phase_name = "NA"
            if kill_chain_phases and len(kill_chain_phases) > 0:
                phase_name = kill_chain_phases[0].get("phase_name", "NA")
            
            return AttackPattern(
                id=pattern.get("id", ""),
                name=pattern.get("name", "Unknown Attack"),
                description=pattern.get("description", "No description available"),
                x_mitre_platforms=platforms,
                x_mitre_detection=detection,
                phase_name=phase_name,
                external_id=pattern.get("id", "NA"),
                kill_chain_phases=kill_chain_phases,
                external_references=pattern.get("external_references", []),
                created_at=pattern.get("created_at", "N/A"),
                modified_at=pattern.get("modified_at", "N/A")
            )
        except Exception as e:
            logger.error(f"Failed to process attack pattern {pattern.get('id', 'unknown')}: {e}")
            raise
    
    async def ingest_data(self) -> int:
        """Ingest MITRE ATT&CK data into MongoDB"""
        try:
            # Fetch data from MITRE
            patterns_data = await self.fetch_attack_patterns()
            logger.info(f"Fetched {len(patterns_data)} attack patterns from MITRE")
            
            # Get database connection
            db = get_sync_database()
            collection = db.attack_patterns
            
            # Clear existing data
            collection.delete_many({})
            logger.info("Cleared existing attack patterns")
            
            # Process and insert data
            processed_patterns = []
            for pattern_data in patterns_data:
                try:
                    processed_pattern = self.process_attack_pattern(pattern_data)
                    processed_patterns.append(processed_pattern.dict())
                except Exception as e:
                    logger.warning(f"Skipping pattern due to processing error: {e}")
                    continue
            
            # Insert all patterns
            if processed_patterns:
                result = collection.insert_many(processed_patterns)
                logger.info(f"Inserted {len(result.inserted_ids)} attack patterns")
                return len(result.inserted_ids)
            else:
                logger.warning("No patterns were processed successfully")
                return 0
                
        except Exception as e:
            logger.error(f"Failed to ingest data: {e}")
            raise


class AttackPatternService:
    """Service for querying attack patterns"""
    
    def __init__(self, database):
        self.database = database
        self.collection = database.attack_patterns
    
    async def get_all_patterns(self, limit: int = 10, offset: int = 0) -> tuple[List[Dict], int]:
        """Get all attack patterns with pagination"""
        try:
            cursor = self.collection.find().skip(offset).limit(limit)
            patterns = await cursor.to_list(length=limit)
            total = await self.collection.count_documents({})
            return patterns, total
        except Exception as e:
            logger.error(f"Failed to get attack patterns: {e}")
            raise
    
    async def search_patterns(self, query: str, limit: int = 10, offset: int = 0) -> tuple[List[Dict], int]:
        """Search attack patterns across all fields (case-insensitive)"""
        try:
            # If query is empty, return all patterns
            if not query or not query.strip():
                cursor = self.collection.find().skip(offset).limit(limit)
                patterns = await cursor.to_list(length=limit)
                total = await self.collection.count_documents({})
                return patterns, total
            
            # Try full-text search first (faster for longer queries)
            if len(query.strip()) > 2:
                try:
                    text_search_filter = {"$text": {"$search": query}}
                    cursor = self.collection.find(text_search_filter).skip(offset).limit(limit)
                    patterns = await cursor.to_list(length=limit)
                    total = await self.collection.count_documents(text_search_filter)
                    if patterns:  # If we found results with text search, return them
                        return patterns, total
                except Exception:
                    # Fall back to regex search if text search fails
                    pass
            
            # Fallback to case-insensitive regex search across multiple fields
            search_filter = {
                "$or": [
                    {"name": {"$regex": query, "$options": "i"}},
                    {"description": {"$regex": query, "$options": "i"}},
                    {"x_mitre_platforms": {"$regex": query, "$options": "i"}},
                    {"x_mitre_detection": {"$regex": query, "$options": "i"}},
                    {"phase_name": {"$regex": query, "$options": "i"}},
                    {"external_id": {"$regex": query, "$options": "i"}},
                    {"kill_chain_phases.phase_name": {"$regex": query, "$options": "i"}},
                    {"external_references.source_name": {"$regex": query, "$options": "i"}},
                    {"external_references.external_id": {"$regex": query, "$options": "i"}},
                    # Additional MITRE fields
                    {"x_mitre_domains": {"$regex": query, "$options": "i"}},
                    {"x_mitre_data_sources": {"$regex": query, "$options": "i"}},
                    {"x_mitre_version": {"$regex": query, "$options": "i"}},
                    {"x_mitre_attack_spec_version": {"$regex": query, "$options": "i"}}
                ]
            }
            
            cursor = self.collection.find(search_filter).skip(offset).limit(limit)
            patterns = await cursor.to_list(length=limit)
            total = await self.collection.count_documents(search_filter)
            return patterns, total
        except Exception as e:
            logger.error(f"Failed to search attack patterns: {e}")
            raise
    
    async def get_pattern_by_id(self, pattern_id: str) -> Dict:
        """Get a specific attack pattern by ID"""
        try:
            pattern = await self.collection.find_one({"id": pattern_id})
            if not pattern:
                raise ValueError(f"Attack pattern with ID {pattern_id} not found")
            return pattern
        except Exception as e:
            logger.error(f"Failed to get attack pattern {pattern_id}: {e}")
            raise
