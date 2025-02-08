from fastapi import FastAPI
from prometheus_client import Counter, Histogram, Info, generate_latest, CONTENT_TYPE_LATEST
from prometheus_client.multiprocess import MultiProcessCollector
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
from typing import Callable
import psutil
import os

# Metrics
REQUEST_COUNT = Counter(
    'http_request_count',
    'HTTP Request Count',
    ['method', 'endpoint', 'status_code']
)

REQUEST_LATENCY = Histogram(
    'http_request_latency_seconds',
    'HTTP Request Latency',
    ['method', 'endpoint']
)

SYSTEM_INFO = Info('system_info', 'System information')

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        method = request.method
        path = request.url.path
        
        # Record request latency
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Update metrics
        status_code = response.status_code
        REQUEST_COUNT.labels(method=method, endpoint=path, status_code=status_code).inc()
        REQUEST_LATENCY.labels(method=method, endpoint=path).observe(duration)
        
        return response

def init_monitoring(app: FastAPI):
    """Initialize monitoring for the application."""
    
    # Add Prometheus middleware
    app.add_middleware(PrometheusMiddleware)
    
    # System metrics endpoint
    @app.get("/metrics")
    async def metrics():
        # Update system info
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        SYSTEM_INFO.info({
            'cpu_percent': str(cpu_percent),
            'memory_percent': str(memory.percent),
            'disk_percent': str(disk.percent),
            'python_version': os.sys.version,
        })
        
        # Generate metrics
        return Response(
            generate_latest(),
            media_type=CONTENT_TYPE_LATEST
        )

    # Health check endpoint with detailed status
    @app.get("/health/detailed")
    async def detailed_health():
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "system": {
                "cpu": {
                    "percent": cpu_percent,
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                },
                "disk": {
                    "total": disk.total,
                    "free": disk.free,
                    "percent": disk.percent,
                },
            },
            "python": {
                "version": os.sys.version,
            },
        }
