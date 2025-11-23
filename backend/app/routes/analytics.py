from fastapi import APIRouter, Query
from app.database import execute_query
from typing import Optional

router = APIRouter()

@router.get("/top-games")    
def get_top_rated_games(
    genre: Optional[str] = None,
    year: Optional[int] = None,
    rating_type: str = Query("critics", regex="^(critics|players)$"),
    limit: int = Query(10, ge=1, le=50)
):
    """
    View the top rated games by the critics and players in each genre / year
    SQL: Complex query with JOIN, GROUP BY, ORDER BY
    """
    if rating_type == "critics":
        score_field = "g.overallCriticsScore"
        count_field = "g.overallCriticsCount"
    else:
        score_field = "g.overallPlayersScore"
        count_field = "g.overallPlayersCount"
    
    query = f"""
        SELECT DISTINCT
            g.GameID,
            g.Title,
            g.CoverPhoto,
            {score_field} as Score,
            {count_field} as RatingCount
        FROM Game g
    """
    
    joins = []
    conditions = [f"{score_field} IS NOT NULL"]
    params = []
    
    if genre:
        joins.append("""
            JOIN GameAttributes ga ON g.GameID = ga.GameID
        """)
        conditions.append("ga.AttributeType = 'Genre' AND ga.AttributeName = %s")
        params.append(genre)
    
    if year:
        joins.append("""
            JOIN `Release` r ON g.GameID = r.GameID
        """)
        conditions.append("YEAR(r.ReleaseDate) = %s")
        params.append(year)
    
    query += " ".join(joins)
    query += " WHERE " + " AND ".join(conditions)
    query += f" ORDER BY {score_field} DESC, {count_field} DESC"
    query += " LIMIT %s"
    params.append(limit)
    
    games = execute_query(query, tuple(params))
    
    return {
        "games": games,
        "rating_type": rating_type,
        "genre": genre,
        "year": year,
        "count": len(games)
    }


@router.get("/top-games-by-moby")
def get_top_games_by_moby_score(
    genre: Optional[str] = None,
    setting: Optional[str] = None,
    limit: int = Query(5, ge=1, le=20)
):
    """
    Show the top 5 video games in each genre / setting by moby score
    SQL: SELECT with JOIN on GameAttributes, ORDER BY overallMobyScore
    """
    query = """
        SELECT DISTINCT
            g.GameID,
            g.Title,
            g.Description,
            g.CoverPhoto,
            g.overallMobyScore
        FROM Game g
    """
    
    joins = []
    conditions = ["g.overallMobyScore IS NOT NULL"]
    params = []
    
    if genre:
        joins.append("""
            JOIN GameAttributes ga_genre ON g.GameID = ga_genre.GameID
        """)
        conditions.append("ga_genre.AttributeType = 'Genre' AND ga_genre.AttributeName = %s")
        params.append(genre)
    
    if setting:
        joins.append("""
            JOIN GameAttributes ga_setting ON g.GameID = ga_setting.GameID
        """)
        conditions.append("ga_setting.AttributeType = 'Setting' AND ga_setting.AttributeName = %s")
        params.append(setting)
    
    query += " ".join(joins)
    query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY g.overallMobyScore DESC"
    query += " LIMIT %s"
    params.append(limit)
    
    games = execute_query(query, tuple(params))
    
    return {
        "games": games,
        "genre": genre,
        "setting": setting,
        "count": len(games)
    }


@router.get("/top-developers")
def get_top_developers(
    genre: Optional[str] = None,
    limit: int = Query(5, ge=1, le=20)
):
    """
    Show the top development companies by critics rating in each genre
    SQL: Complex JOIN with GROUP BY and AVG aggregation using subquery to avoid duplicates
    """
    if genre:
        query = """
            SELECT
                c.CompanyName,
                c.Country,
                SUM(g.overallCriticsScore*g.overallCriticsCount)/SUM(g.overallCriticsCount) AS AvgCriticsScore,
                COUNT(DISTINCT g.GameID) AS GameCount
            FROM Game g
            JOIN GameAttributes ga ON g.GameID = ga.GameID
            JOIN (
                SELECT DISTINCT GameID, DeveloperCompanyID FROM `Release`
            ) r ON g.GameID = r.GameID
            JOIN Company c ON r.DeveloperCompanyID = c.CompanyID
            WHERE ga.AttributeType = 'Genre' AND ga.AttributeName = %s
            GROUP BY c.CompanyName, c.Country
            ORDER BY AvgCriticsScore DESC, GameCount DESC
            LIMIT %s
        """ #I used subquery just to ensure that there will be no duplicates as Release table can have multiple releases for the same game.
        params = (genre, limit)
    else:
        query = """
            SELECT
                c.CompanyName,
                c.Country,
                SUM(g.overallCriticsScore*g.overallCriticsCount)/SUM(g.overallCriticsCount) AS AvgCriticsScore,
                COUNT(DISTINCT g.GameID) AS GameCount
            FROM Game g
            JOIN (
                SELECT DISTINCT GameID, DeveloperCompanyID FROM `Release`
            ) r ON g.GameID = r.GameID
            JOIN Company c ON r.DeveloperCompanyID = c.CompanyID
            GROUP BY c.CompanyName, c.Country
            ORDER BY AvgCriticsScore DESC, GameCount DESC
            LIMIT %s
        """#I used subquery just to ensure that there will be no duplicates as Release table can have multiple releases for the same game.
        params = (limit,)
    
    developers = execute_query(query, params)
    
    return {
        "developers": developers,
        "genre": genre,
        "count": len(developers)
    }


@router.get("/dream-game")
def get_dream_game():
    """
    Dream Game - Create the perfect game specs based on Players ratings
    Analyzes ALL attribute types to find the optimal combination
    SQL: Multiple complex queries with GROUP BY and AVG aggregation
    """
    
    def get_best_attribute(attribute_type):
        query = """
            SELECT 
                ga.AttributeName,
                SUM(g.overallPlayersScore*g.overallPlayersCount)/SUM(g.overallPlayersCount) as AvgRating,
                COUNT(DISTINCT g.GameID) as GameCount
            FROM GameAttributes ga
            JOIN Game g ON ga.GameID = g.GameID
            WHERE ga.AttributeType = %s
            GROUP BY ga.AttributeName
            ORDER BY AvgRating DESC, GameCount DESC
            LIMIT 1
        """ 
        result = execute_query(query, (attribute_type,), fetch_one=True)
        return result if result else None
    
    def get_best_platform_attribute(attribute_type):
        query = """
            SELECT 
                gpa.AttributeName,
                SUM(g.overallPlayersScore*g.overallPlayersCount)/SUM(g.overallPlayersCount) as AvgRating,
                COUNT(DISTINCT g.GameID) as GameCount
            FROM GamePlatformAttributes_specs gpa
            JOIN Game g ON gpa.GameID = g.GameID
            WHERE gpa.AttributeType LIKE %s
            GROUP BY gpa.AttributeName
            ORDER BY AvgRating DESC, GameCount DESC
            LIMIT 1
        """
        result = execute_query(query, (attribute_type,), fetch_one=True)
        return result if result else None
    
    genre_result = get_best_attribute('Genre')
    gameplay_result = get_best_attribute('Gameplay')
    setting_result = get_best_attribute('Setting')
    narrative_result = get_best_attribute('Narrative')
    perspective_result = get_best_attribute('Perspective')
    visual_result = get_best_attribute('Visual')
    interface_result = get_best_attribute('Interface')
    pacing_result = get_best_attribute('Pacing')
    art_result = get_best_attribute('Art')
    sport_result = get_best_attribute('Sport')
    vehicular_result = get_best_attribute('Vehicular')
    educational_result = get_best_attribute('Educational')
    misc_result = get_best_attribute('Misc')
    addon_result = get_best_attribute('Add-on')
    special_edition_result = get_best_attribute('Special Edition')
    
    business_model_result = get_best_platform_attribute('Business Model')
    media_type_result = get_best_platform_attribute('Media Type')
    input_devices_result = get_best_platform_attribute('Input Devices%')
    
    platform_query = """
        SELECT 
            gp.PlatformName,
            SUM(g.overallPlayersScore*g.overallPlayersCount)/SUM(g.overallPlayersCount) as AvgRating,
            COUNT(DISTINCT g.GameID) as GamesCount
        FROM GamePlatform gp
        JOIN Game g ON gp.GameID = g.GameID
        GROUP BY gp.PlatformName
        ORDER BY AvgRating DESC, GamesCount DESC
        LIMIT 1
    """
    best_platform = execute_query(platform_query, fetch_one=True)
    
    developer_query = """
        SELECT
            c.CompanyName AS Developer,
            SUM(g.overallPlayersScore*g.overallPlayersCount)/SUM(g.overallPlayersCount) AS AvgRating,
            COUNT(DISTINCT g.GameID) AS GameCount
        FROM Game g
        JOIN (
            SELECT DISTINCT GameID, DeveloperCompanyID FROM `Release`
        ) r ON g.GameID = r.GameID
        JOIN Company c ON r.DeveloperCompanyID = c.CompanyID
        GROUP BY c.CompanyName
        ORDER BY AvgRating DESC, GameCount DESC
        LIMIT 1
    """#I used subquery just to ensure that there will be no duplicates as Release table can have multiple releases for the same game.
    best_developer = execute_query(developer_query, fetch_one=True)
    
    publisher_query = """
        SELECT
            c.CompanyName AS Publisher,
            SUM(g.overallPlayersScore*g.overallPlayersCount)/SUM(g.overallPlayersCount) AS AvgRating,
            COUNT(DISTINCT g.GameID) AS GameCount
        FROM Game g
        JOIN (
            SELECT DISTINCT GameID, PublisherCompanyID FROM `Release`
        ) r ON g.GameID = r.GameID
        JOIN Company c ON r.PublisherCompanyID = c.CompanyID
        GROUP BY c.CompanyName
        ORDER BY AvgRating DESC, GameCount DESC
        LIMIT 1
    """#I used subquery just to ensure that there will be no duplicates as Release table can have multiple releases for the same game.
    best_publisher = execute_query(publisher_query, fetch_one=True)
    
    director_query = """
        SELECT 
            p.Name as DirectorName,
            SUM(g.overallPlayersScore*g.overallPlayersCount)/SUM(g.overallPlayersCount) as AvgRating,
            COUNT(DISTINCT g.GameID) as GameCount
        FROM Person p
        JOIN GamePersonCredits gpc ON p.PersonID = gpc.PersonID
        JOIN Game g ON gpc.GameID = g.GameID
        GROUP BY p.Name
        ORDER BY AvgRating DESC, GameCount DESC
        LIMIT 1
    """
    best_director = execute_query(director_query, fetch_one=True)
    
    maturity_query = """
        SELECT 
            sub.Label,
            sub.MaturityRatingOrganization,
            AVG(sub.PlayerScore) AS AvgRating,
            COUNT(*) AS GameCount
        FROM (
            SELECT DISTINCT
                mr.Label,
                mr.MaturityRatingOrganization,
                g.GameID,
                g.overallPlayersScore AS PlayerScore
            FROM MaturityRating_GamePlatform mr
            JOIN Game g ON mr.GameID = g.GameID
        ) sub
        GROUP BY sub.Label, sub.MaturityRatingOrganization
        ORDER BY AvgRating DESC, GameCount DESC
        LIMIT 1
    """#I used subquery just to ensure that there will be no duplicates as MaturityRating_GamePlatform table can have multiple releases for the same game.
    best_maturity = execute_query(maturity_query, fetch_one=True)
    
    dream_game = {
        "genre": genre_result['AttributeName'] if genre_result else "N/A",
        "gameplay": gameplay_result['AttributeName'] if gameplay_result else "N/A",
        "setting": setting_result['AttributeName'] if setting_result else "N/A",
        "narrative": narrative_result['AttributeName'] if narrative_result else "N/A",
        "perspective": perspective_result['AttributeName'] if perspective_result else "N/A",
        "visual_style": visual_result['AttributeName'] if visual_result else "N/A",
        "art_style": art_result['AttributeName'] if art_result else "N/A",   
        "interface": interface_result['AttributeName'] if interface_result else "N/A",
        "pacing": pacing_result['AttributeName'] if pacing_result else "N/A",
        "platform": best_platform['PlatformName'] if best_platform else "N/A",
        "business_model": business_model_result['AttributeName'] if business_model_result else "N/A",
        "media_type": media_type_result['AttributeName'] if media_type_result else "N/A",
        "developer": best_developer['Developer'] if best_developer else "N/A",
        "publisher": best_publisher['Publisher'] if best_publisher else "N/A",
        "director": best_director['DirectorName'] if best_director else "N/A",
        "sport_type": sport_result['AttributeName'] if sport_result else None,
        "vehicular_type": vehicular_result['AttributeName'] if vehicular_result else None,
        "educational_focus": educational_result['AttributeName'] if educational_result else None,
        "misc_features": misc_result['AttributeName'] if misc_result else None,
        "addon_type": addon_result['AttributeName'] if addon_result else None,
        "input_device_supported": input_devices_result['AttributeName'] if input_devices_result else None,
        "special_edition_features": special_edition_result['AttributeName'] if special_edition_result else None,
        "maturity_rating": best_maturity['Label'] if best_maturity else "N/A",
        "maturity_organization": best_maturity['MaturityRatingOrganization'] if best_maturity else "N/A"
    }
    
    stats = {
        "genre_rating": float(genre_result['AvgRating']) if genre_result else 0,
        "gameplay_rating": float(gameplay_result['AvgRating']) if gameplay_result else 0,
        "setting_rating": float(setting_result['AvgRating']) if setting_result else 0,
        "narrative_rating": float(narrative_result['AvgRating']) if narrative_result else 0,
        "perspective_rating": float(perspective_result['AvgRating']) if perspective_result else 0,
        "visual_rating": float(visual_result['AvgRating']) if visual_result else 0,
        "art_rating": float(art_result['AvgRating']) if art_result else 0,
        "interface_rating": float(interface_result['AvgRating']) if interface_result else 0,
        "pacing_rating": float(pacing_result['AvgRating']) if pacing_result else 0,
        "platform_rating": float(best_platform['AvgRating']) if best_platform else 0,
        "developer_rating": float(best_developer['AvgRating']) if best_developer else 0,
        "publisher_rating": float(best_publisher['AvgRating']) if best_publisher else 0,
        "director_rating": float(best_director['AvgRating']) if best_director else 0,
        "maturity_rating": float(best_maturity['AvgRating']) if best_maturity else 0,
        "business_model_rating": float(business_model_result['AvgRating']) if business_model_result else 0,
        "media_type_rating": float(media_type_result['AvgRating']) if media_type_result else 0,
        "input_supported_rating": float(input_devices_result['AvgRating']) if input_devices_result else 0,
        "special_edition_rating": float(special_edition_result['AvgRating']) if special_edition_result else 0,
        "sport_rating": float(sport_result['AvgRating']) if sport_result else 0,
        "vehicular_rating": float(vehicular_result['AvgRating']) if vehicular_result else 0,
        "educational_rating": float(educational_result['AvgRating']) if educational_result else 0,
        "misc_rating": float(misc_result['AvgRating']) if misc_result else 0,
        "addon_rating": float(addon_result['AvgRating']) if addon_result else 0
    }
    
    return {
        "dream_game": dream_game,
        "stats": stats,
        "note": "Dream game based on highest average player ratings across all game attributes"
    }
@router.get("/top-directors")
def get_top_directors(limit: int = Query(5, ge=1, le=20)):
    """
    Show the best 5 game directors based on the volume of games
    SQL: SELECT with GROUP BY, COUNT, ORDER BY
    """
    query = """
        SELECT 
            p.PersonID,
            p.Name as DirectorName,
            COUNT(DISTINCT gpc.GameID) as GameCount,
            GROUP_CONCAT(DISTINCT g.Title SEPARATOR ', ') as Games
        FROM Person p
        JOIN GamePersonCredits gpc ON p.PersonID = gpc.PersonID
        JOIN Game g ON gpc.GameID = g.GameID
        GROUP BY p.PersonID, DirectorName
        ORDER BY GameCount DESC
        LIMIT %s
    """
    directors = execute_query(query, (limit,))
    return {
        "directors": directors,
        "count": len(directors)
    }
@router.get("/top-collaborations")
def get_top_collaborations(limit: int = Query(5, ge=1, le=20)):
    """
    Show the top 5 collaborations between directors and development companies
    based on the number of games they worked on together
    SQL: Complex JOIN with GROUP BY on multiple tables
    """
    query = """
        SELECT 
            p.Name as DirectorName,
            dc.CompanyName as DeveloperName,
            COUNT(DISTINCT g.GameID) as CollaborationCount,
            GROUP_CONCAT(DISTINCT g.Title SEPARATOR ', ') as Games
        FROM Person p
        JOIN GamePersonCredits gpc ON p.PersonID = gpc.PersonID
        JOIN Game g ON gpc.GameID = g.GameID
        JOIN (
            SELECT DISTINCT GameID, DeveloperCompanyID
            FROM `Release`
        ) r ON g.GameID = r.GameID
        JOIN Company dc ON r.DeveloperCompanyID = dc.CompanyID
        GROUP BY DirectorName, DeveloperName
        ORDER BY CollaborationCount DESC
        LIMIT %s
    """#I used subquery just to ensure that there will be no duplicates as Release table can have multiple releases for the same game.
    collaborations = execute_query(query, (limit,))
    return {
        "collaborations": collaborations,
        "count": len(collaborations)
    }
@router.get("/platform-stats")
def get_platform_statistics():
    """
    Number of games available on each platform and their average critics and player ratings
    SQL: SELECT with GROUP BY and AVG aggregation
    """
    query = """
        SELECT 
            gp.PlatformName,
            COUNT(DISTINCT gp.GameID) as GameCount,
            SUM(g.overallCriticsScore*g.overallCriticsCount)/SUM(g.overallCriticsCount) as AvgCriticsScore,
            SUM(g.overallPlayersScore*g.overallPlayersCount)/SUM(g.overallPlayersCount) as AvgPlayersScore,
            AVG(g.overallMobyScore) as AvgMobyScore
        FROM GamePlatform gp
        Join Game g ON gp.GameID = g.GameID
        GROUP BY gp.PlatformName
        ORDER BY GameCount DESC, gp.PlatformName
    """
    platforms = execute_query(query)
    return {
        "platforms": platforms,
        "count": len(platforms)
    }