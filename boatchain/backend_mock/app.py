from flask import Flask, jsonify, send_from_directory, make_response, request
from flask_cors import CORS
import os
import json
from uuid import uuid4

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

@app.route('/save-boat', methods=['POST'])
def save_json():
    try:
        # Vérifie que le corps de la requête contient du JSON
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Aucun JSON reçu'}), 400

        file_name = str(uuid4()) + ".json"
        file_path = os.path.join(JSON_FOLDER, file_name)

        # Sauvegarde le JSON dans un fichier
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        return jsonify({'message': 'JSON sauvegardé avec succès'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
