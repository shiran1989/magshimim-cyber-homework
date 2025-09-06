from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class AttackPattern(BaseModel):
    """Model for MITRE ATT&CK attack patterns"""
    id: str = Field(..., description="Unique identifier for the attack")
    name: str = Field(..., description="Name of the attack")
    description: str = Field(..., description="Description of the attack")
    x_mitre_platforms: List[str] = Field(default_factory=list, description="Vulnerable platforms")
    x_mitre_detection: str = Field(default="NA", description="Detection methods")
    phase_name: str = Field(default="NA", description="Attack phase")
    external_id: str = Field(..., description="External ID from MITRE")
    kill_chain_phases: List[dict] = Field(default_factory=list, description="Kill chain phases")
    external_references: List[dict] = Field(default_factory=list, description="External references")
    created_at: str = Field(default="N/A", description="Creation date")
    modified_at: str = Field(default="N/A", description="Last modification date")

    class Config:
        pass


class AttackPatternResponse(BaseModel):
    """Response model for attack patterns"""
    id: str
    name: str
    description: str
    x_mitre_platforms: List[str]
    x_mitre_detection: str
    phase_name: str
    external_id: str
    kill_chain_phases: List[dict]
    external_references: List[dict]
    created_at: str
    modified_at: str


class SearchRequest(BaseModel):
    """Request model for search functionality"""
    query: str = Field(..., description="Search query")
    limit: int = Field(default=50, description="Maximum number of results")
    offset: int = Field(default=0, description="Number of results to skip")


class SearchResponse(BaseModel):
    """Response model for search results"""
    results: List[AttackPatternResponse]
    total: int
    limit: int
    offset: int
