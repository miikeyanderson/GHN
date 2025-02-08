"""
Health check system for the GHN backend application.
Provides comprehensive system health monitoring with caching and failure tolerance.
"""
import asyncio
import time
import psutil
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from functools import lru_cache
import logging

from fastapi import Request, HTTPException
from pydantic import BaseModel

from app.config import get_settings
from app.core.logging import logger, capture_error

# Constants
CACHE_TTL = 30  # seconds
COMPONENT_TIMEOUT = 5  # seconds

class ComponentStatus(BaseModel):
    """Status information for a single system component."""
    status: str
    latency_ms: float
    last_checked: datetime
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class HealthStatus(BaseModel):
    """Complete system health status information."""
    status: str
    version: str
    environment: str
    timestamp: datetime
    uptime_seconds: float
    components: Dict[str, ComponentStatus]

# Track application start time
START_TIME = time.time()

@lru_cache(maxsize=1)
def get_cached_health(ttl_hash: int) -> HealthStatus:
    """Get cached health status. TTL hash changes every CACHE_TTL seconds."""
    return _get_health()

async def check_component(name: str, check_func: callable) -> ComponentStatus:
    """Run a component check with timeout."""
    start_time = time.time()
    try:
        # Run the check with timeout
        if asyncio.iscoroutinefunction(check_func):
            result = await asyncio.wait_for(check_func(), timeout=COMPONENT_TIMEOUT)
        else:
            result = await asyncio.get_event_loop().run_in_executor(
                None, check_func
            )
        
        latency = (time.time() - start_time) * 1000
        return ComponentStatus(
            status="healthy",
            latency_ms=latency,
            last_checked=datetime.now(timezone.utc),
            details=result
        )
    except asyncio.TimeoutError:
        return ComponentStatus(
            status="unhealthy",
            latency_ms=COMPONENT_TIMEOUT * 1000,
            last_checked=datetime.now(timezone.utc),
            error="Component check timed out"
        )
    except Exception as e:
        latency = (time.time() - start_time) * 1000
        return ComponentStatus(
            status="unhealthy",
            latency_ms=latency,
            last_checked=datetime.now(timezone.utc),
            error=str(e)
        )

def check_system_resources() -> Dict[str, Any]:
    """Check system resource usage."""
    memory = psutil.virtual_memory()
    return {
        "memory_used_percent": memory.percent,
        "cpu_percent": psutil.cpu_percent(interval=1),
        "disk_usage_percent": psutil.disk_usage("/").percent
    }

def _get_health() -> HealthStatus:
    """Generate complete health status."""
    settings = get_settings()
    
    # Get system resources
    try:
        resources = check_system_resources()
        system_status = ComponentStatus(
            status="healthy",
            latency_ms=0,
            last_checked=datetime.now(timezone.utc),
            details=resources
        )
    except Exception as e:
        logger.error(f"Error checking system resources: {e}")
        system_status = ComponentStatus(
            status="degraded",
            latency_ms=0,
            last_checked=datetime.now(timezone.utc),
            error=str(e)
        )
    
    # Compile all component statuses
    components = {
        "system": system_status
    }
    
    # Determine overall status
    if any(c.status == "unhealthy" for c in components.values()):
        overall_status = "unhealthy"
    elif any(c.status == "degraded" for c in components.values()):
        overall_status = "degraded"
    else:
        overall_status = "healthy"
    
    return HealthStatus(
        status=overall_status,
        version=settings.api_version,
        environment=settings.api_env,
        timestamp=datetime.now(timezone.utc),
        uptime_seconds=time.time() - START_TIME,
        components=components
    )

@capture_error
async def get_health_status(request: Request) -> Dict[str, Any]:
    """
    Get system health status with caching.
    
    Returns a comprehensive health check including:
    - Overall system status
    - Application version and environment
    - System uptime
    - Component-specific health information
    - System resource usage
    
    The health check is cached for CACHE_TTL seconds to prevent
    excessive resource usage from frequent monitoring calls.
    """
    # Simple time-based cache key
    cache_key = int(time.time() / CACHE_TTL)
    
    # Get cached or fresh health status
    health = get_cached_health(cache_key)
    
    # Convert to dict for response
    return health.model_dump()
