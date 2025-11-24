from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import users, games, ratings, analytics, metadata
app = FastAPI(
    title="FaresGames API",
    description="Video Games Database Application",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Deployed (Netlify)
        "https://thunderous-dasik-8f57c9.netlify.app",
        "https://*.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(games.router, prefix="/api/games", tags=["Games"])
app.include_router(ratings.router, prefix="/api/ratings", tags=["Ratings"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(metadata.router, prefix="/api/metadata", tags=["Metadata"])
@app.get("/")
def read_root():
    return {
        "message": "FaresGames API",
        "database": settings.DB_NAME,
        "host": settings.DB_HOST,
        "status": "running"
    }
@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    from app.database import execute_query
    try:
        result = execute_query("SELECT COUNT(*) as count FROM Game", fetch_one=True)
        return {
            "status": "healthy",
            "database": "connected",
            "games_count": result['count']
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }