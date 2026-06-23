from flask import send_from_directory

from classmate_server_v13 import BASE_DIR, app


def clean_index():
    return send_from_directory(BASE_DIR, "index.v13.html")


app.view_functions["index"] = clean_index
