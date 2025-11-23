from fastapi import APIRouter, HTTPException, status
from app.models import UserRegister, UserResponse
from app.database import execute_query
router = APIRouter()
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegister):
    """
    Register a new user
    SQL: INSERT INTO User (EmailAddress, UserName, Birthdate, Country, Password)
    """
    check_query = """
        SELECT EmailAddress FROM `User` 
        WHERE EmailAddress = %s OR UserName = %s
    """
    existing = execute_query(check_query, (user.email, user.username), fetch_one=True)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    insert_query = """
        INSERT INTO `User` (EmailAddress, UserName, Birthdate, Country, Password)
        VALUES (%s, %s, %s, %s, %s)
    """
    try:
        execute_query(
            insert_query,
            (user.email, user.username, user.birthdate, user.country, user.password),
            commit=True
        )
        return UserResponse(
            email=user.email,
            username=user.username,
            birthdate=user.birthdate,
            country=user.country
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )
@router.get("/{email}", response_model=UserResponse)
def get_user(email: str):
    """
    Get user by email
    SQL: SELECT * FROM User WHERE EmailAddress = %s
    """
    query = """
        SELECT EmailAddress, UserName, Birthdate, Country 
        FROM `User` 
        WHERE EmailAddress = %s
    """
    user = execute_query(query, (email,), fetch_one=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse(
        email=user['EmailAddress'],
        username=user['UserName'],
        birthdate=user['Birthdate'],
        country=user['Country']
    )
@router.post("/verify-password")
def verify_password(email: str, password: str):
    """
    Verify user email and password
    SQL: SELECT with password verification
    """
    query = """
        SELECT EmailAddress, Password, UserName
        FROM `User`
        WHERE EmailAddress = %s
    """
    user = execute_query(query, (email,), fetch_one=True)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user['Password'] != password:
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {
        "email": user['EmailAddress'],
        "username": user['UserName'],
        "message": "Authentication successful"
    }