from flask import send_from_directory

from classmate_server_v13 import BASE_DIR, app


def clean_index():
    return send_from_directory(BASE_DIR, "index.v14.html")


def app_v14():
    return send_from_directory(BASE_DIR, "app.v14.js")


def styles_v14():
    return send_from_directory(BASE_DIR, "styles.v14.css")


app.view_functions["index"] = clean_index
app.add_url_rule("/app.v14.js", "app_v14", app_v14)
app.add_url_rule("/styles.v14.css", "styles_v14", styles_v14)
