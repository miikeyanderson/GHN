from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base, TimestampMixin):
    """User model for authentication and profile management"""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Create an index on email for faster lookups
    __table_args__ = (Index("ix_users_email", "email"),)

    @property
    def password(self) -> str:
        """Password getter - raises error as password should not be readable"""
        raise AttributeError("password is not a readable attribute")

    @password.setter
    def password(self, password: str) -> None:
        """Hash and set the password"""
        self.hashed_password = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        """Verify password against hashed password"""
        return pwd_context.verify(password, self.hashed_password)

    def update_last_login(self) -> None:
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()

    def __repr__(self) -> str:
        """String representation of the user"""
        return f"<User {self.email}>"

