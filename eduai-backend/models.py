from typing import Optional, List
from datetime import date, datetime
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # Firebase UID is the bridge between Auth and your DB
    firebase_uid: str = Field(index=True, unique=True, nullable=False)
    email: str = Field(index=True)
    
    # Business Logic Fields
    tokens_remaining: int = Field(default=5, nullable=False)
    streak_count: int = Field(default=0, nullable=False)
    
    # Track the date (YYYY-MM-DD) of the last successful generation
    last_activity_date: Optional[date] = Field(default=None, nullable=True)

    # Relationship to images
    images: List["ImageGeneration"] = Relationship(back_populates="user")
    
    # Timestamps (Good practice)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ImageGeneration(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # The actual image URL (e.g., from Firebase Storage or S3)
    image_url: str = Field(nullable=False)
    
    # Metadata about the generation
    prompt: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Foreign Key
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="images")