from flask import Flask, jsonify, send_from_directory, make_response
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configurations
IMAGE_FOLDER = os.path.join(app.root_path, 'static/images/boat')
ATTACHMENT_FOLDER = os.path.join(app.root_path, 'static/attachments/boat')
JSON_FOLDER = os.path.join(app.root_path, 'data/boat')


@app.route('/')
def home():
    return jsonify({"message": "Mock server is running."})


@app.route('/boats')
def get_boats():
    all_data = {}
    for filename in os.listdir(JSON_FOLDER):
        if filename.endswith('.json'):
            filepath = os.path.join(JSON_FOLDER, filename)
            with open(filepath, 'r', encoding='utf-8') as f:  # ✅ lecture en UTF-8
                try:
                    data = json.load(f)
                    all_data[filename] = data
                except json.JSONDecodeError:
                    all_data[filename] = {"error": "Invalid JSON format"}

    print(all_data)

    response = make_response(jsonify(all_data))
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response


@app.route('/images/<id>/<image_name>')
def get_image(id, image_name):
    image_path = os.path.join(IMAGE_FOLDER, id, image_name)
    if os.path.exists(image_path):
        return send_from_directory(os.path.dirname(image_path), os.path.basename(image_path))
    else:
        return jsonify({"error": "Image not found"}), 404


@app.route('/attachments/<id>/<attachment_name>')
def get_attachment(id, attachment_name):
    attachment_path = os.path.join(ATTACHMENT_FOLDER, id, attachment_name)
    print(attachment_path)
    if os.path.exists(attachment_path):
        return send_from_directory(os.path.dirname(attachment_path), os.path.basename(attachment_path))
    else:
        return jsonify({"error": "Attachment not found"}), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "7001"))
    app.run(host="0.0.0.0", port=port, debug=True)
