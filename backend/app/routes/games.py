from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.database import execute_query
router = APIRouter()
@router.get("/")
def get_all_games(
    limit: int = Query(252, ge=1, le=500)
):
    """
    Get all games
    SQL: SELECT * FROM Game LIMIT %s 
    """
    query = """
        SELECT 
            GameID,
            Title,
            Description,
            CoverPhoto,
            overallCriticsCount,
            overallCriticsScore,
            overallPlayersCount,
            overallPlayersScore,
            overallMobyScore
        FROM Game
        ORDER BY Title
        LIMIT %s 
    """
    games = execute_query(query, (limit,))
    count_query = "SELECT COUNT(*) as total FROM Game"
    total = execute_query(count_query, fetch_one=True)
    return {
        "games": games,
        "total": total['total'], 
        "limit": limit,
    }
@router.get("/search")
def search_games(q: str = Query(..., min_length=1)):
    """
    Search games by title
    SQL: SELECT * FROM Game WHERE Title LIKE %s
    """
    query = """
        SELECT 
            GameID,
            Title,
            Description,
            CoverPhoto,
            overallMobyScore
        FROM Game
        WHERE Title LIKE %s
        ORDER BY Title
        LIMIT 50
    """
    games = execute_query(query, (f"%{q}%",))
    return {
        "games": games,
        "count": len(games)
    }
@router.get("/{game_id}")
def get_game_details(game_id: int):
    """
    Get detailed game information
    SQL: Multiple queries to get game, platforms, attributes, etc.
    """
    game_query = """
        SELECT 
            GameID,
            Title,
            Description,
            CoverPhoto,
            overallCriticsCount,
            overallCriticsScore,
            overallPlayersCount,
            overallPlayersScore,
            overallMobyScore
        FROM Game
        WHERE GameID = %s
    """
    game = execute_query(game_query, (game_id,), fetch_one=True)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    platforms_query = """
        SELECT 
            PlatformName,
            CriticsScore,
            PlayersScore,
            MobyScore
        FROM GamePlatform
        WHERE GameID = %s
    """
    platforms = execute_query(platforms_query, (game_id,))
    attributes_query = """
        SELECT 
            AttributeType,
            AttributeName
        FROM GameAttributes
        WHERE GameID = %s
    """
    attributes = execute_query(attributes_query, (game_id,))
    release_query = """
        SELECT DISTINCT
            dc.CompanyName as Developer,
            pc.CompanyName as Publisher,
            r.ReleaseDate,
            r.PlatformName
        FROM `Release` r
        JOIN Company dc ON r.DeveloperCompanyID = dc.CompanyID
        JOIN Company pc ON r.PublisherCompanyID = pc.CompanyID
        WHERE r.GameID = %s
    """
    releases = execute_query(release_query, (game_id,))
    return {
        "game": game,
        "platforms": platforms,
        "attributes": attributes,
        "releases": releases
    }
@router.get("/filter/by-criteria")
def get_games_by_filter(
    genre: Optional[str] = None,
    platform: Optional[str] = None,
    publisher: Optional[str] = None,
    developer: Optional[str] = None,
    year: Optional[int] = None,
    sort_by: Optional[str] = Query("moby_score", regex="^(moby_score|title|critics_score|players_score)$"),
    limit: Optional[int] = Query(None, ge=1, le=1000)
):
    """
    Show all the games for a specific genre / platform / publisher / developer
    SQL: Complex JOIN query with WHERE conditions
    """
    query = """
        SELECT DISTINCT
            g.GameID,
            g.Title,
            g.Description,
            g.CoverPhoto,
            g.overallMobyScore,
            g.overallCriticsScore,
            g.overallPlayersScore
        FROM Game g
    """
    joins = []
    conditions = []
    params = []
    if genre:
        joins.append("""
            JOIN GameAttributes ga ON g.GameID = ga.GameID
        """)
        conditions.append("ga.AttributeType = 'Genre' AND ga.AttributeName = %s")
        params.append(genre)
    if platform:
        joins.append("""
            JOIN GamePlatform gp ON g.GameID = gp.GameID
        """)
        conditions.append("gp.PlatformName = %s")
        params.append(platform)
    if publisher or developer:
        joins.append("""
            JOIN `Release` r ON g.GameID = r.GameID
            JOIN Company dc ON r.DeveloperCompanyID = dc.CompanyID
            JOIN Company pc ON r.PublisherCompanyID = pc.CompanyID
        """)
        if developer:
            conditions.append("dc.CompanyName = %s")
            params.append(developer)
        if publisher:
            conditions.append("pc.CompanyName = %s")
            params.append(publisher)
    if year:
        if "Release" not in " ".join(joins): 
            joins.append("""
                JOIN `Release` r ON g.GameID = r.GameID
            """)
        conditions.append("YEAR(r.ReleaseDate) = %s")
        params.append(year)
    query += " ".join(joins)
    if conditions:
        query += " WHERE " + " AND ".join(conditions)    
    sort_mapping = {
        "moby_score": "g.overallMobyScore DESC",
        "title": "g.Title ASC",
        "critics_score": "g.overallCriticsScore DESC",
        "players_score": "g.overallPlayersScore DESC"
    }
    query += f" ORDER BY {sort_mapping.get(sort_by, 'g.overallMobyScore DESC')}"
    if limit:
        query += f" LIMIT {limit}"
    games = execute_query(query, tuple(params) if params else None)
    return {
        "games": games,
        "count": len(games),
        "filters": {
            "genre": genre,
            "platform": platform,
            "publisher": publisher,
            "developer": developer,
            "year": year,
            "sort_by": sort_by,
            "limit": limit
        }
    }
@router.get("/{game_id}/platforms")
def get_game_platforms(game_id: int):
    """
    Get all platforms where a specific game is available
    SQL: SELECT PlatformName FROM GamePlatform WHERE GameID = %s
    """
    query = """
        SELECT DISTINCT PlatformName
        FROM GamePlatform
        WHERE GameID = %s
        ORDER BY PlatformName
    """
    platforms = execute_query(query, (game_id,))
    if not platforms:
        raise HTTPException(
            status_code=404, 
            detail="No platforms found for this game"
        )
    return {
        "game_id": game_id,
        "platforms": [p['PlatformName'] for p in platforms],
        "count": len(platforms)
    }