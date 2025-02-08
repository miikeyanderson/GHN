import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import engine, Base, AsyncSessionLocal, init_models
from app.models.user import User
from app.models.patient import Patient
from app.models.health_record import HealthRecord
from app.models.treatment import Treatment
from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

async def init_db() -> None:
    """Initialize database with tables and initial data"""
    try:
        # Initialize database models
        await init_models()

        # Create initial superuser if needed
        async with AsyncSessionLocal() as session:
            async with session.begin():
                # Check if superuser exists
                result = await session.execute(
                    select(User).where(User.email == "admin@example.com")
                )
                user = result.scalar_one_or_none()
                
                if not user:
                    # Create superuser
                    superuser = User(
                        email="admin@example.com",
                        full_name="System Administrator",
                        is_superuser=True,
                        is_active=True,
                    )
                    superuser.password = "changeme123"  # This will be hashed
                    session.add(superuser)
                    await session.flush()
                    logger.info("Created initial superuser")

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

async def main() -> None:
    """Main function to initialize database"""
    await init_db()
    print("Database initialized successfully!")

if __name__ == "__main__":
    asyncio.run(main())
