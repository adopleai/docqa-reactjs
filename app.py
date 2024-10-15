from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from langchain_openai import AzureChatOpenAI
from pdf_qa import Docqa

class MultiDocQA:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.UPLOAD_FOLDER = './uploads'
        self.app.config['UPLOAD_FOLDER'] = self.UPLOAD_FOLDER

        # Ensure the upload folder exists
        os.makedirs(self.UPLOAD_FOLDER, exist_ok=True)

        self.docqa = None  # Docqa object to be initialized after file upload
        self.setup_routes()

    def setup_routes(self):
        @self.app.route('/api/upload', methods=['POST'])
        def upload_file():
            file = request.files.get('file')

            if not file or file.filename == '':
                return jsonify({'error': 'No file selected'}), 400

            # Save the uploaded file
            file_path = os.path.join(self.app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)

            # Create the Docqa object using the uploaded file
            try:
                self.docqa = Docqa([file_path])
                os.remove(file_path)  # Delete the file after Docqa object is created
                return jsonify({'message': 'File uploaded and processed successfully', 'filename': file.filename}), 200
            except Exception as e:
                print(f"Error initializing Docqa: {e}")
                return jsonify({'error': 'File processing failed'}), 500

        @self.app.route('/api/get-response', methods=['POST'])
        def get_response():
            if not self.docqa:
                return jsonify({"message": "No document uploaded. Please upload a file first."}), 400

            prompt = request.json.get('prompt', '')

            if not prompt:
                return jsonify({"message": "No prompt provided."}), 400

            # Get the response from Docqa
            try:
                response = self.docqa.main(prompt)
                answer = response.get('answer', 'No answer found.')
                return jsonify({"message": answer})
            except Exception as e:
                print(f"Error during Docqa response generation: {e}")
                return jsonify({"message": "Error processing the request."}), 500

    def run(self):
        self.app.run(debug=False, port=3000)

if __name__ == "__main__":
    app = MultiDocQA()
    app.run()
