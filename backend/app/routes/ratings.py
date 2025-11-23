from fastapi import APIRouter, HTTPException, status
from app.models import RatingCreate, RatingResponse
from app.database import execute_query
from typing import List
router = APIRouter()
@router.post("/", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
def add_rating(rating: RatingCreate):
    """
    Add a new user rating for an existing video game
    SQL: INSERT INTO UserGamePlatform (User_Email_Address, GameID, PlatformName, Rating)
    """
    user_check = """
        SELECT EmailAddress FROM `User` WHERE EmailAddress = %s 
    """
    user = execute_query(user_check, (rating.user_email,), fetch_one=True) 
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
    game_check = """
        SELECT GameID, PlatformName 
        FROM GamePlatform 
        WHERE GameID = %s AND PlatformName = %s
    """
    game_platform = execute_query(
        game_check, 
        (rating.game_id, rating.platform_name), 
        fetch_one=True
    )
    if not game_platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game-Platform combination not found"
        )
    existing_check = """
        SELECT * FROM UserGamePlatform 
        WHERE User_Email_Address = %s 
        AND GameID = %s 
        AND PlatformName = %s
    """
    existing = execute_query(
        existing_check,
        (rating.user_email, rating.game_id, rating.platform_name),
        fetch_one=True
    )
    if existing:
        update_query = """
            UPDATE UserGamePlatform 
            SET Rating = %s 
            WHERE User_Email_Address = %s 
            AND GameID = %s 
            AND PlatformName = %s
        """
        execute_query(
            update_query,
            (rating.rating, rating.user_email, rating.game_id, rating.platform_name),
            commit=True
        )
    else:
        insert_query = """
            INSERT INTO UserGamePlatform 
            (User_Email_Address, GameID, PlatformName, Rating)
            VALUES (%s, %s, %s, %s)
        """
        execute_query(
            insert_query,
            (rating.user_email, rating.game_id, rating.platform_name, rating.rating),
            commit=True
        )
    game_title_query = "SELECT Title FROM Game WHERE GameID = %s"
    game_title = execute_query(game_title_query, (rating.game_id,), fetch_one=True)
    return RatingResponse(
        user_email=rating.user_email,
        game_id=rating.game_id,
        game_title=game_title['Title'],
        platform_name=rating.platform_name,
        rating=rating.rating
    )
@router.get("/user/{email}", response_model=List[RatingResponse])
def get_user_ratings(email: str):
    """
    View existing ratings for the user
    SQL: SELECT ugp.*, g.Title FROM UserGamePlatform ugp JOIN Game g ON ugp.GameID = g.GameID WHERE ugp.User_Email_Address = %s
    """
    query = """
        SELECT 
            ugp.User_Email_Address,
            ugp.GameID,
            g.Title,
            ugp.PlatformName,
            ugp.Rating
        FROM UserGamePlatform ugp
        JOIN Game g ON ugp.GameID = g.GameID
        WHERE ugp.User_Email_Address = %s
        ORDER BY g.Title
    """
    ratings = execute_query(query, (email,))
    return [
        RatingResponse(
            user_email=r['User_Email_Address'],
            game_id=r['GameID'],
            game_title=r['Title'],
            platform_name=r['PlatformName'],
            rating=r['Rating']
        )
        for r in ratings
    ]
@router.delete("/")
def delete_rating(user_email: str, game_id: int, platform_name: str):
    """
    Delete a user rating
    SQL: DELETE FROM UserGamePlatform WHERE User_Email_Address = %s AND GameID = %s AND PlatformName = %s
    """
    delete_query = """
        DELETE FROM UserGamePlatform 
        WHERE User_Email_Address = %s 
        AND GameID = %s 
        AND PlatformName = %s
    """
    try:
        execute_query(
            delete_query,
            (user_email, game_id, platform_name),
            commit=True
        )
        return {"message": "Rating deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete rating: {str(e)}"
        )