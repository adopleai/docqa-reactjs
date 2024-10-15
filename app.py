from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from langchain_openai import AzureChatOpenAI
from pdf_qa import Docqa
import time
class MultiDocQA:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.UPLOAD_FOLDER = './uploads'
        self.app.config['UPLOAD_FOLDER'] = self.UPLOAD_FOLDER

        # Ensure the upload folder exists
        if not os.path.exists(self.UPLOAD_FOLDER):
            os.makedirs(self.UPLOAD_FOLDER)

        self.docqa = None  # Initialize the Docqa object
        self.file_path = None
        self.setup_routes()

    def setup_routes(self):
        @self.app.route('/api/upload', methods=['POST'])
        def upload_file():
            if 'file' not in request.files:
                return jsonify({'error': 'No file part'}), 400

            file = request.files['file']

            if file.filename == '':
                return jsonify({'error': 'No selected file'}), 400

            if file:
                # Save the file to the upload folder
                file.save(os.path.join(self.app.config['UPLOAD_FOLDER'], file.filename))
                self.file_path = os.path.join(self.app.config['UPLOAD_FOLDER'], file.filename)
                print(f"File uploaded: {self.file_path}")

                # Create the Docqa object with the uploaded file
                self.docqa = Docqa([self.file_path])
                # time.sleep(50)  # Wait for the Docqa object to be initialized
                return jsonify({'message': 'File uploaded successfully', 'filename': file.filename}), 200

            return jsonify({'error': 'File upload failed'}), 500

        @self.app.route('/api/get-response', methods=['POST'])
        def get_response():
            if not self.docqa:
                return jsonify({"message": "No document uploaded. Please upload a file first."}), 400

            try:
                data = request.json
                prompt = data.get('prompt')

                # Use the existing Docqa object for question answering
                response = self.docqa.main(prompt)
                print("response", response.get('answer'))
                result = response.get('answer')

                return jsonify({"message": result})
            except Exception as e:
                print(f"Error: {e}")
                return jsonify({"message": "Error processing the request."})

    def run(self):
        self.app.run(debug=False, port=3000)

if __name__ == "__main__":
    app = MultiDocQA()
    app.run()
