from flask import send_from_directory

from classmate_server_v13 import BASE_DIR, app


def clean_index():
    return send_from_directory(BASE_DIR, "index.v15.html")


def app_v15():
    return send_from_directory(BASE_DIR, "app.v15.js")


def styles_v15():
    return send_from_directory(BASE_DIR, "styles.v15.css")


app.view_functions["index"] = clean_index
app.add_url_rule("/app.v15.js", "app_v15", app_v15)
app.add_url_rule("/styles.v15.css", "styles_v15", styles_v15)
