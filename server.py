import eventlet
eventlet.monkey_patch()
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import eventlet.wsgi
import os
from translator import Translate, convert_to_wav

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
socketio = SocketIO(app, cors_allowed_origins="*", max_http_buffer_size=2 * 1024 * 1024 + (10 * 1024))

@app.route('/')
def index():
  return render_template('index.html')

@socketio.on('connect') 
def on_connect():
  print(f'Client Connected: {request.sid}')

@socketio.on('disconnect')
def on_disconnect():
    print(f'Client disconnected: {request.sid}')

@socketio.on('audio')
def handle_audio(data):
  audio_data = data.get('audio')
  code = data.get('code')
  speech = data.get('speech')
  text = data.get('text')

  with open('temp.webm', 'wb') as f:
      f.write(audio_data)

  convert_to_wav('temp.webm', 'temp.wav')
  if speech:
    translated_audio = Translate('temp.wav', code).translate()
    emit('translated', translated_audio.tobytes())
  translated_text = Translate('temp.wav', code).transcribe() if text else None
  print(translated_text)
  os.remove('temp.wav')
  os.remove('temp.webm')
  emit('translated', translated_text)

if __name__ == '__main__':  
  socketio.run(app, debug=True, use_reloader=False, host='0.0.0.0', port=5000)