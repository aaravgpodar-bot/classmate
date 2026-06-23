import sys
from pathlib import Path


# PythonAnywhere copies this file into /var/www, so prefer the project directory
# in the account home folder when it exists.
PROJECT_DIR = Path.home() / "classmate"
if not PROJECT_DIR.exists():
    PROJECT_DIR = Path(__file__).resolve().parent

if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

from server import app as application  # noqa: E402
