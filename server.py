import eventlet
eventlet.monkey_patch()
from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit
import eventlet.wsgi
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True, max_http_buffer_size=2 * 1024 * 1024 + (10 * 1024))

@app.route('/')
def index():
  return render_template('index.html')

@socketio.on('connect') 
def on_connect():
  print(f'Client Connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    
@socketio.on('audio')
def handle_audio(data):
  audio = data.get("audio")
  code = data.get("code")
  print(code)
  print('Starting audio transcribing')
  with open('./test.wav', 'wb') as f:
      f.write(audio)
  print('Finish audio transcribing')

if __name__ == '__main__':
  socketio.run(app, debug=False, use_reloader=False, host='0.0.0.0', port=5000)