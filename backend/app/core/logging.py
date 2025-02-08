"""
Core logging configuration for the GHN backend application.
Implements a comprehensive logging system with Sentry integration.
"""
import logging
import os
from functools import wraps
from typing import Any, Callable, Optional, TypeVar

import sentry_sdk
from fastapi import Request
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.logging import LoggingIntegration

# Type variable for decorator
F = TypeVar("F", bound=Callable[..., Any])

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def setup_sentry() -> None:
    """Initialize Sentry SDK with proper configuration and integrations."""
    from app.config import get_settings
    settings = get_settings()
    
    if not settings.sentry_dsn:
        logger.warning("SENTRY_DSN not found. Sentry integration disabled.")
        return

    # Configure Sentry SDK with optimized settings
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.sentry_environment,
        traces_sample_rate=settings.sentry_traces_sample_rate,
        integrations=[
            FastApiIntegration(transaction_style='url'),
            LoggingIntegration(
                level=logging.INFO,
                event_level=logging.ERROR
            ),
        ],
        before_send=before_send,
        send_default_pii=False,
        max_breadcrumbs=30,
        debug=False,
        shutdown_timeout=5,
        auto_enabling_integrations=False,
        auto_session_tracking=True,
        enable_tracing=True,
        profiles_sample_rate=0.1
    )
    logger.info(f"Sentry initialized for environment: {settings.sentry_environment}")

def before_send(event: dict, hint: dict) -> Optional[dict]:
    """Process and sanitize the event before sending to Sentry."""
    # Don't send events in test environment
    if os.getenv("TESTING"):
        return None
    
    try:
        # Sanitize sensitive data
        if "request" in event:
            if "headers" in event["request"]:
                # Remove sensitive headers
                sensitive_headers = {"authorization", "cookie", "x-api-key"}
                event["request"]["headers"] = {
                    k: v for k, v in event["request"]["headers"].items()
                    if k.lower() not in sensitive_headers
                }
        
        # Remove potentially problematic data
        if "extra" in event:
            event["extra"] = {
                k: str(v) if not isinstance(v, (str, int, float, bool, type(None))) else v
                for k, v in event["extra"].items()
            }
    except Exception as e:
        logger.error(f"Error processing Sentry event: {e}")
        return None
    
    return event

def capture_error(func: F) -> F:
    """
    Decorator to capture and log errors with additional context.
    
    Usage:
        @capture_error
        async def my_endpoint():
            ...
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            # Extract request object if present
            request = next((arg for arg in args if isinstance(arg, Request)), None)
            
            # Add additional context
            with sentry_sdk.push_scope() as scope:
                if request:
                    scope.set_context("request_info", {
                        "method": request.method,
                        "url": str(request.url),
                        "client_host": request.client.host if request.client else None,
                    })
                
                # Log the error
                logger.exception(f"Error in {func.__name__}: {str(e)}")
                sentry_sdk.capture_exception(e)
            
            # Re-raise the exception
            raise
    
    return wrapper  # type: ignore

def set_user_context(user_id: str, email: Optional[str] = None) -> None:
    """Set user context for Sentry events."""
    sentry_sdk.set_user({
        "id": user_id,
        "email": email,
    })

def clear_user_context() -> None:
    """Clear user context from Sentry."""
    sentry_sdk.set_user(None)
