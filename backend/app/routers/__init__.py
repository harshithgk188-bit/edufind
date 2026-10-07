from .auth import router as auth_router
from .districts import router as districts_router
from .courses import router as courses_router
from .colleges import router as colleges_router
from .ratings import router as ratings_router
from .favorites import router as favorites_router
from .recommendations import router as recommendations_router
from .ai import router as ai_router
from .admin import router as admin_router

__all__ = [
    "auth_router",
    "districts_router",
    "courses_router",
    "colleges_router",
    "ratings_router",
    "favorites_router",
    "recommendations_router",
    "ai_router",
    "admin_router"
]
