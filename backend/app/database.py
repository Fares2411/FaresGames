import pymysql
from pymysql.cursors import DictCursor
from contextlib import contextmanager
from app.config import settings
def get_db_connection():
    """
    Create a database connection to Aiven MySQL.
    Returns a connection object with dictionary cursor.
    """
    try:
        connection = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            charset='utf8mb4',
            cursorclass=DictCursor,
            connect_timeout=30,
            autocommit=False  
        )
        return connection
    except Exception as e:
        print(f"Database connection error: {str(e)}")
        raise
@contextmanager
def get_db_cursor(commit=False):
    """
    Context manager for database operations.
    Usage:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute("INSERT ...")
    """
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        yield cursor
        if commit:
            connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()
def execute_query(query, params=None, fetch_one=False, commit=False):
    """
    Execute a SQL query and return results.
    Args:
        query: SQL query string
        params: Query parameters (tuple or dict)
        fetch_one: If True, return single row; else return all rows
        commit: If True, commit the transaction
    Returns:
        Query results as dictionary or list of dictionaries
    """
    with get_db_cursor(commit=commit) as cursor:
        cursor.execute(query, params or ())
        if commit:
            return cursor.lastrowid 
        if fetch_one:
            return cursor.fetchone()
        else:
            return cursor.fetchall()