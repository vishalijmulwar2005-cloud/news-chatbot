import sys
import os

# Ensure backend directory is in sys.path in all environments (Vercel serverless and local)
current_dir = os.path.dirname(os.path.abspath(__file__))
possible_backend_paths = [
    os.path.abspath(os.path.join(current_dir, "..", "backend")),
    os.path.abspath(os.path.join(current_dir, "backend")),
    os.path.abspath(os.path.join(os.getcwd(), "backend")),
]

for p in possible_backend_paths:
    if os.path.isdir(p) and p not in sys.path:
        sys.path.insert(0, p)
        break

from app.main import app
