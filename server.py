from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import eventlet
import eventlet.wsgi
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect') 
def on_connect():
    print("Client connected")

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)