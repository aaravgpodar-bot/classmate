import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_FILES = {
    "app.final.js",
    "app.js",
    "app.v18.js",
    "app.v19.js",
    "app.v20.js",
    "app.v21.js",
    "app.v22.js",
    "app.v13.js",
    "index.html",
    "index.v18.html",
    "index.v19.html",
    "index.v20.html",
    "index.v21.html",
    "index.v22.html",
    "manifest.json",
    "manifest.v21.json",
    "manifest.v22.json",
    "service-worker.js",
    "service-worker.v21.js",
    "service-worker.v22.js",
    "styles.final.css",
    "styles.css",
    "styles.v18.css",
    "styles.v19.css",
    "styles.v20.css",
    "styles.v21.css",
    "styles.v22.css",
    "styles.v13.css",
}

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/health")
def health():
    return jsonify({"status": "ok", "app": "ClassMate"})


@app.get("/api/config")
def config():
    return jsonify({"googleClientId": os.environ.get("GOOGLE_CLIENT_ID", "")})


@app.post("/api/google-login")
def google_login():
    body = request.get_json(silent=True) or {}
    credential = str(body.get("credential", "")).strip()
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
    if not client_id:
        return jsonify({"error": "GOOGLE_CLIENT_ID is not configured on the server."}), 503
    if not credential:
        return jsonify({"error": "Google credential is required."}), 400
    try:
        user = verify_google_credential(credential, client_id)
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 401
    return jsonify({"user": user})


@app.post("/api/generate-game")
def generate_game():
    body = request.get_json(silent=True) or {}
    subject = str(body.get("subject", "")).strip()[:80] or "General Knowledge"
    try:
        questions = ai_game_questions(subject)
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503
    return jsonify({"subject": subject, "source": "openai", "questions": questions})


@app.post("/api/generate-presentation")
def generate_presentation():
    body = request.get_json(silent=True) or {}
    topic = str(body.get("topic", "")).strip()[:120] or "Untitled presentation"
    grade = str(body.get("grade", "")).strip()[:60] or "student"
    style = str(body.get("style", "")).strip()[:80] or "creative but school-ready"
    try:
        plan = ai_presentation_plan(topic, grade, style)
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503
    return jsonify({"topic": topic, "source": "openai", "plan": plan})


@app.post("/api/paraphrase")
def paraphrase():
    body = request.get_json(silent=True) or {}
    text = str(body.get("text", "")).strip()[:5000]
    tone = str(body.get("tone", "")).strip()[:80] or "clear student submission"
    if not text:
        return jsonify({"error": "Text is required for paraphrasing."}), 400
    try:
        result = ai_paraphrase(text, tone)
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503
    return jsonify({"source": "openai", "result": result})


@app.post("/api/extract-timetable")
def extract_timetable():
    body = request.get_json(silent=True) or {}
    image = str(body.get("image", "")).strip()
    if not image.startswith("data:image/"):
        return jsonify({"error": "A timetable image is required."}), 400
    try:
        result = ai_extract_timetable(image[:8_000_000])
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503
    return jsonify({"source": "openai", "timetable": result})


@app.get("/<path:filename>")
def static_files(filename):
    if filename not in PUBLIC_FILES:
        return jsonify({"error": "not found"}), 404
    return send_from_directory(BASE_DIR, filename)


def verify_google_credential(credential, client_id):
    url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + urllib.parse.quote(credential)
    try:
      with urllib.request.urlopen(url, timeout=10) as response:
          payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError) as error:
      raise RuntimeError("Could not verify Google sign-in.") from error
    if payload.get("aud") != client_id:
      raise RuntimeError("Google sign-in was not issued for this ClassMate app.")
    if payload.get("email_verified") not in (True, "true", "True"):
      raise RuntimeError("Google email is not verified.")
    return {
      "name": payload.get("name") or payload.get("email", "").split("@")[0] or "Student",
      "email": payload.get("email", ""),
      "picture": payload.get("picture", ""),
    }


def ai_game_questions(subject):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for AI game generation.")

    prompt = (
        "Create exactly 10 fun, school-safe rounds for a student learning game. "
        f"Subject: {subject}. "
        "Use a varied mix of modes: multiple_choice, true_false, type_answer, and best_move. "
        "Return only JSON with this shape: "
        '{"questions":[{"mode":"multiple_choice|true_false|type_answer|best_move","type":"string","q":"string","answer":"string","options":["string","string","string","string"]}]}. '
        "Rules: multiple_choice and best_move need exactly four options; true_false needs options ['True','False']; "
        "type_answer should have an empty options array and a short answer. "
        "The answer must be copied exactly into options whenever options are used. "
        "Make the round labels playful and make the modes feel different."
    )
    payload = {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": "You are ClassMate, a playful educational game question generator."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.9,
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return normalize_questions(parsed.get("questions", []), subject)
    except (KeyError, ValueError, urllib.error.URLError, urllib.error.HTTPError):
        raise RuntimeError("OpenAI game generation failed.")


def normalize_questions(raw_questions, subject):
    questions = []
    for index, item in enumerate(raw_questions[:10]):
        answer = str(item.get("answer", "")).strip()
        mode = str(item.get("mode", "multiple_choice")).strip()
        if mode not in {"multiple_choice", "true_false", "type_answer", "best_move"}:
            mode = "multiple_choice"
        options = [str(option).strip() for option in item.get("options", []) if str(option).strip()]
        if mode == "type_answer":
            options = []
        elif mode == "true_false":
            options = ["True", "False"]
            if answer.lower() not in {"true", "false"}:
                answer = "True"
        else:
            if answer and answer not in options:
                options.append(answer)
            options = options[:4]
            while len(options) < 4:
                options.append(f"{subject} clue {len(options) + 1}")
        questions.append({
            "id": f"ai-{index}",
            "mode": mode,
            "type": str(item.get("type", "AI Round")).strip() or "AI Round",
            "q": str(item.get("q", f"What is important in {subject}?")).strip(),
            "answer": answer or (options[0] if options else subject),
            "options": options,
        })
    if len(questions) < 10:
        raise RuntimeError("OpenAI returned too few questions.")
    return questions[:10]


def ai_presentation_plan(topic, grade, style):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for AI presentation generation.")

    prompt = (
        "Create a creative school presentation plan and template concept. "
        f"Topic: {topic}. Grade/class level: {grade}. Style: {style}. "
        "Return only JSON with this shape: "
        '{"title":"string","hook":"string","template":{"name":"string","colors":["string"],"fontPair":"string","visualStyle":"string"},'
        '"slides":[{"title":"string","purpose":"string","creativeIdea":"string","speakerNote":"string"}],'
        '"extras":["string","string","string"],"docxOutline":["string","string","string"]}. '
        "Make 6 to 8 slides. Give practical creative ways to include props, mini-interactions, diagrams, comparisons, or story moments. "
        "Keep it school-safe, useful, and easy for a student to turn into PPTX or DOCX."
    )
    payload = {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": "You are ClassMate, a creative presentation coach for students."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.85,
    }
    req = openai_request(payload, api_key)
    try:
        with urllib.request.urlopen(req, timeout=35) as response:
            data = json.loads(response.read().decode("utf-8"))
        return normalize_presentation_plan(json.loads(data["choices"][0]["message"]["content"]))
    except (KeyError, ValueError, urllib.error.URLError, urllib.error.HTTPError):
        raise RuntimeError("OpenAI presentation generation failed.")


def ai_paraphrase(text, tone):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for AI paraphrasing.")

    prompt = (
        "Paraphrase the student's text for a school submission. "
        f"Tone: {tone}. Keep the meaning accurate, do not add invented facts, and keep it appropriate for a student. "
        "Return only JSON with this shape: "
        '{"paraphrased":"string","improvements":["string"],"titleSuggestion":"string"}. '
        f"Text: {text}"
    )
    payload = {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": "You are ClassMate, a careful writing helper for student submissions."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.65,
    }
    req = openai_request(payload, api_key)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
        parsed = json.loads(data["choices"][0]["message"]["content"])
        return {
            "paraphrased": str(parsed.get("paraphrased", "")).strip(),
            "improvements": [str(item).strip() for item in parsed.get("improvements", [])[:5] if str(item).strip()],
            "titleSuggestion": str(parsed.get("titleSuggestion", "Submission draft")).strip(),
        }
    except (KeyError, ValueError, urllib.error.URLError, urllib.error.HTTPError):
        raise RuntimeError("OpenAI paraphrasing failed.")


def ai_extract_timetable(image_data_url):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for timetable photo extraction.")

    payload = {
        "model": os.environ.get("OPENAI_VISION_MODEL", os.environ.get("OPENAI_MODEL", "gpt-4o-mini")),
        "messages": [
            {
                "role": "system",
                "content": "You are ClassMate, an accurate timetable extraction assistant. Extract only what is visible.",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Read this school timetable photo. Return only JSON with this shape: "
                            '{"name":"Photo timetable","classes":[{"day":"Mon|Tue|Wed|Thu|Fri","period":"string","time":"string","subject":"string","color":"#3157d5"}],'
                            '"materials":{"Subject":["notebook"]},"notes":["string"]}. '
                            "Use blank time when no time is visible. Include only weekdays and classes you can read."
                        ),
                    },
                    {"type": "image_url", "image_url": {"url": image_data_url}},
                ],
            },
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
    }
    req = openai_request(payload, api_key)
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            data = json.loads(response.read().decode("utf-8"))
        return normalize_timetable(json.loads(data["choices"][0]["message"]["content"]))
    except (KeyError, ValueError, urllib.error.URLError, urllib.error.HTTPError):
        raise RuntimeError("OpenAI timetable extraction failed.")


def openai_request(payload, api_key):
    return urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )


def normalize_timetable(raw):
    valid_days = {"Mon", "Tue", "Wed", "Thu", "Fri"}
    classes = []
    for item in (raw.get("classes", []) if isinstance(raw.get("classes"), list) else [])[:60]:
        day = str(item.get("day", "")).strip().title()[:3]
        subject = str(item.get("subject", "")).strip()
        if day not in valid_days or not subject:
            continue
        classes.append({
            "day": day,
            "period": str(item.get("period", "")).strip() or str(len(classes) + 1),
            "time": str(item.get("time", "")).strip(),
            "subject": subject[:80],
            "color": str(item.get("color", "#3157d5")).strip()[:20] or "#3157d5",
        })
    materials = {}
    raw_materials = raw.get("materials", {}) if isinstance(raw.get("materials"), dict) else {}
    for subject, items in raw_materials.items():
        materials[str(subject).strip()[:80]] = [str(item).strip() for item in items[:8] if str(item).strip()] if isinstance(items, list) else []
    if not classes:
        raise RuntimeError("OpenAI could not read timetable classes from that image.")
    return {
        "name": str(raw.get("name", "Photo timetable")).strip() or "Photo timetable",
        "classes": classes,
        "materials": materials,
        "notes": [str(note).strip() for note in raw.get("notes", [])[:5] if str(note).strip()] if isinstance(raw.get("notes"), list) else [],
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=35) as response:
            data = json.loads(response.read().decode("utf-8"))
        return normalize_presentation_plan(json.loads(data["choices"][0]["message"]["content"]))
    except (KeyError, ValueError, urllib.error.URLError, urllib.error.HTTPError):
        raise RuntimeError("OpenAI presentation generation failed.")


def normalize_presentation_plan(plan):
    template = plan.get("template", {}) if isinstance(plan.get("template"), dict) else {}
    slides = plan.get("slides", []) if isinstance(plan.get("slides"), list) else []
    return {
        "title": str(plan.get("title", "Presentation plan")).strip() or "Presentation plan",
        "hook": str(plan.get("hook", "Open with a quick question.")).strip(),
        "template": {
            "name": str(template.get("name", "Clean student deck")).strip(),
            "colors": [str(color).strip() for color in template.get("colors", [])[:5] if str(color).strip()],
            "fontPair": str(template.get("fontPair", "Bold heading + readable body")).strip(),
            "visualStyle": str(template.get("visualStyle", "Simple visuals with strong contrast")).strip(),
        },
        "slides": [
            {
                "title": str(slide.get("title", f"Slide {index + 1}")).strip(),
                "purpose": str(slide.get("purpose", "Explain one key idea.")).strip(),
                "creativeIdea": str(slide.get("creativeIdea", "Use a simple visual.")).strip(),
                "speakerNote": str(slide.get("speakerNote", "Keep it clear and short.")).strip(),
            }
            for index, slide in enumerate(slides[:8])
        ],
        "extras": [str(item).strip() for item in plan.get("extras", [])[:5] if str(item).strip()],
        "docxOutline": [str(item).strip() for item in plan.get("docxOutline", [])[:6] if str(item).strip()],
    }


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5177, debug=True)
