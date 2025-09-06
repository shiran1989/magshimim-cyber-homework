from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List
import logging
from app.models import AttackPatternResponse, SearchRequest, SearchResponse
from app.database import get_database
from app.services import AttackPatternService

logger = logging.getLogger(__name__)

router = APIRouter()


async def get_attack_service():
    """Dependency to get attack pattern service"""
    database = await get_database()
    return AttackPatternService(database)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Cybersecurity Intelligence API is running"}


@router.get("/attack-patterns", response_model=SearchResponse)
async def get_attack_patterns(
    limit: int = Query(10, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    service: AttackPatternService = Depends(get_attack_service)
):
    """Get all attack patterns with pagination"""
    try:
        patterns, total = await service.get_all_patterns(limit=limit, offset=offset)
        
        # Convert to response format
        response_patterns = []
        for pattern in patterns:
            response_patterns.append(AttackPatternResponse(
                id=pattern["id"],
                name=pattern["name"],
                description=pattern["description"],
                x_mitre_platforms=pattern["x_mitre_platforms"],
                x_mitre_detection=pattern["x_mitre_detection"],
                phase_name=pattern["phase_name"],
                external_id=pattern["external_id"],
                kill_chain_phases=pattern["kill_chain_phases"],
                external_references=pattern.get("external_references", []),
                created_at=pattern.get("created_at", ""),
                modified_at=pattern.get("modified_at", "")
            ))
        
        return SearchResponse(
            results=response_patterns,
            total=total,
            limit=limit,
            offset=offset
        )
    except Exception as e:
        logger.error(f"Failed to get attack patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/attack-patterns/search", response_model=SearchResponse)
async def search_attack_patterns(
    request: SearchRequest,
    service: AttackPatternService = Depends(get_attack_service)
):
    """Search attack patterns by description"""
    try:
        patterns, total = await service.search_patterns(
            query=request.query,
            limit=request.limit,
            offset=request.offset
        )
        
        # Convert to response format
        response_patterns = []
        for pattern in patterns:
            response_patterns.append(AttackPatternResponse(
                id=pattern["id"],
                name=pattern["name"],
                description=pattern["description"],
                x_mitre_platforms=pattern["x_mitre_platforms"],
                x_mitre_detection=pattern["x_mitre_detection"],
                phase_name=pattern["phase_name"],
                external_id=pattern["external_id"],
                kill_chain_phases=pattern["kill_chain_phases"],
                external_references=pattern.get("external_references", []),
                created_at=pattern.get("created_at", ""),
                modified_at=pattern.get("modified_at", "")
            ))
        
        return SearchResponse(
            results=response_patterns,
            total=total,
            limit=request.limit,
            offset=request.offset
        )
    except Exception as e:
        logger.error(f"Failed to search attack patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/attack-patterns/{pattern_id}", response_model=AttackPatternResponse)
async def get_attack_pattern(
    pattern_id: str,
    service: AttackPatternService = Depends(get_attack_service)
):
    """Get a specific attack pattern by ID"""
    try:
        pattern = await service.get_pattern_by_id(pattern_id)
        
        return AttackPatternResponse(
            id=pattern["id"],
            name=pattern["name"],
            description=pattern["description"],
            x_mitre_platforms=pattern["x_mitre_platforms"],
            x_mitre_detection=pattern["x_mitre_detection"],
            phase_name=pattern["phase_name"],
            external_id=pattern["external_id"],
            kill_chain_phases=pattern["kill_chain_phases"],
            created_at=pattern.get("created_at", ""),
            updated_at=pattern.get("updated_at", "")
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get attack pattern {pattern_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_stats(service: AttackPatternService = Depends(get_attack_service)):
    """Get statistics about attack patterns"""
    try:
        patterns, total = await service.get_all_patterns(limit=1, offset=0)
        
        # Get phase statistics
        database = await get_database()
        phase_stats = await database.attack_patterns.aggregate([
            {"$group": {"_id": "$phase_name", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(length=None)
        
        # Get platform statistics
        platform_stats = await database.attack_patterns.aggregate([
            {"$unwind": "$x_mitre_platforms"},
            {"$group": {"_id": "$x_mitre_platforms", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(length=None)
        
        return {
            "total_patterns": total,
            "phase_distribution": phase_stats,
            "platform_distribution": platform_stats
        }
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard-data", response_model=SearchResponse)
async def get_dashboard_data(
    service: AttackPatternService = Depends(get_attack_service)
):
    """Get all attack patterns for dashboard (no pagination)"""
    try:
        # Get all patterns without pagination for dashboard
        patterns, total = await service.get_all_patterns(limit=10000, offset=0)
        
        # Convert to response format
        response_patterns = []
        for pattern in patterns:
            response_patterns.append(AttackPatternResponse(
                id=pattern["id"],
                name=pattern["name"],
                description=pattern["description"],
                x_mitre_platforms=pattern["x_mitre_platforms"],
                x_mitre_detection=pattern["x_mitre_detection"],
                phase_name=pattern["phase_name"],
                external_id=pattern["external_id"],
                kill_chain_phases=pattern["kill_chain_phases"],
                external_references=pattern.get("external_references", []),
                created_at=pattern.get("created_at", ""),
                modified_at=pattern.get("modified_at", "")
            ))
        
        return SearchResponse(
            results=response_patterns,
            total=total,
            limit=total,
            offset=0
        )
    except Exception as e:
        logger.error(f"Failed to get dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
