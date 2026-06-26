import json
import os
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class ClassMateHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path not in {"/api/generate-game", "/api/generate-presentation", "/api/paraphrase", "/api/extract-timetable"}:
            self.send_error(404)
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode("utf-8")
        payload = {}
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            pass

        if self.path == "/api/generate-presentation":
            topic = str(payload.get("topic", "")).strip()[:120] or "Untitled presentation"
            grade = str(payload.get("grade", "")).strip()[:60] or "student"
            style = str(payload.get("style", "")).strip()[:80] or "creative but school-ready"
            try:
                plan = ai_presentation_plan(topic, grade, style)
            except RuntimeError as error:
                self.send_json({"error": str(error)}, status=503)
                return
            self.send_json({"topic": topic, "source": "openai", "plan": plan})
            return

        if self.path == "/api/paraphrase":
            text = str(payload.get("text", "")).strip()[:5000]
            tone = str(payload.get("tone", "")).strip()[:80] or "clear student submission"
            if not text:
                self.send_json({"error": "Text is required for paraphrasing."}, status=400)
                return
            try:
                result = ai_paraphrase(text, tone)
            except RuntimeError as error:
                self.send_json({"error": str(error)}, status=503)
                return
            self.send_json({"source": "openai", "result": result})
            return

        if self.path == "/api/extract-timetable":
            image = str(payload.get("image", "")).strip()
            if not image.startswith("data:image/"):
                self.send_json({"error": "A timetable image is required."}, status=400)
                return
            try:
                result = ai_extract_timetable(image[:8_000_000])
            except RuntimeError as error:
                self.send_json({"error": str(error)}, status=503)
                return
            self.send_json({"source": "openai", "timetable": result})
            return

        subject = str(payload.get("subject", "")).strip()[:80] or "General Knowledge"
        try:
            questions = ai_game_questions(subject)
        except RuntimeError as error:
            self.send_json({"error": str(error)}, status=503)
            return
        self.send_json({"subject": subject, "source": "openai", "questions": questions})

    def send_json(self, payload, status=200):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
from ai_helpers import ai_extract_timetable, ai_game_questions, ai_paraphrase, ai_presentation_plan


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 5177), ClassMateHandler).serve_forever()

