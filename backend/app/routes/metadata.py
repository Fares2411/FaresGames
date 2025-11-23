from fastapi import APIRouter
from app.database import execute_query
router = APIRouter()
@router.get("/platforms")
def get_all_platforms():
    """
    Get all available platforms from database
    SQL: SELECT DISTINCT PlatformName FROM Platform
    """
    query = """
        SELECT DISTINCT PlatformName
        FROM Platform
        ORDER BY PlatformName
    """
    platforms = execute_query(query)
    return {
        "platforms": [p['PlatformName'] for p in platforms],
        "count": len(platforms)
    }
@router.get("/genres")
def get_all_genres():
    """
    Get all available genres from database
    SQL: SELECT DISTINCT Name FROM Attribute WHERE Type = 'Genre'
    """
    query = """
        SELECT DISTINCT Name
        FROM Attribute
        WHERE Type = 'Genre'
        ORDER BY Name
    """
    genres = execute_query(query)
    return {
        "genres": [g['Name'] for g in genres],
        "count": len(genres)
    }
@router.get("/settings")
def get_all_settings():
    """
    Get all available settings from database
    SQL: SELECT DISTINCT Name FROM Attribute WHERE Type = 'Setting'
    """
    query = """
        SELECT DISTINCT Name
        FROM Attribute
        WHERE Type = 'Setting'
        ORDER BY Name
    """
    settings = execute_query(query)
    return {
        "settings": [s['Name'] for s in settings],
        "count": len(settings)
    }
@router.get("/developers")
def get_all_developers():
    """
    Get all development companies from database
    SQL: SELECT DISTINCT CompanyName FROM Company JOIN Release WHERE DeveloperCompanyID
    """
    query = """
        SELECT DISTINCT c.CompanyName
        FROM Company c
        JOIN `Release` r ON c.CompanyID = r.DeveloperCompanyID
        ORDER BY c.CompanyName
    """
    developers = execute_query(query)
    return {
        "developers": [d['CompanyName'] for d in developers],
        "count": len(developers)
    }
@router.get("/publishers")
def get_all_publishers():
    """
    Get all publishing companies from database
    SQL: SELECT DISTINCT CompanyName FROM Company JOIN Release WHERE PublisherCompanyID
    """
    query = """
        SELECT DISTINCT c.CompanyName
        FROM Company c
        JOIN `Release` r ON c.CompanyID = r.PublisherCompanyID
        ORDER BY c.CompanyName
    """
    publishers = execute_query(query)
    return {
        "publishers": [p['CompanyName'] for p in publishers],
        "count": len(publishers)
    }
@router.get("/games")
def get_all_games_list():
    """
    Get all games (simplified list for dropdowns)
    SQL: SELECT GameID, Title FROM Game ORDER BY Title
    """
    query = """
        SELECT GameID, Title
        FROM Game
        ORDER BY Title
        LIMIT 1000
    """
    games = execute_query(query)
    return {
        "games": games,
        "count": len(games)
    }
@router.get("/years")
def get_release_years():
    """
    Get all available release years
    SQL: SELECT DISTINCT YEAR(ReleaseDate) FROM Release
    """
    query = """
        SELECT DISTINCT YEAR(ReleaseDate) as Year
        FROM `Release`
        WHERE ReleaseDate IS NOT NULL
        ORDER BY Year DESC
    """
    years = execute_query(query)
    return {
        "years": [y['Year'] for y in years if y['Year']],
        "count": len(years)
    }