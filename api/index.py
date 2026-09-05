import sys
from pathlib import Path

# Add project root to sys.path so backend module can be imported
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.main import app
