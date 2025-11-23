from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date
from decimal import Decimal
class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    birthdate: Optional[date] = None
    country: Optional[str] = None
class UserResponse(BaseModel):
    email: str
    username: str
    birthdate: Optional[date]
    country: Optional[str]
class RatingCreate(BaseModel):
    user_email: EmailStr
    game_id: int
    platform_name: str
    rating: float = Field(..., ge=0.0, le=5.0)
class RatingResponse(BaseModel):
    user_email: str
    game_id: int
    game_title: str
    platform_name: str
    rating: Decimal
class GameBasic(BaseModel):
    game_id: int
    title: str
    description: Optional[str]
    cover_photo: Optional[str]
    overall_moby_score: Optional[Decimal]
class GameFilter(BaseModel):
    genre: Optional[str] = None
    platform: Optional[str] = None
    publisher: Optional[str] = None
    developer: Optional[str] = None
    year: Optional[int] = None