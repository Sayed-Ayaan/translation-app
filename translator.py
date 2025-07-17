from transformers import AutoProcessor, SeamlessM4Tv2Model
import torchaudio
import subprocess

PROCESSOR = AutoProcessor.from_pretrained("facebook/seamless-m4t-v2-large")
MODEL = SeamlessM4Tv2Model.from_pretrained("facebook/seamless-m4t-v2-large")

AVAILABLE_CODE = ['arb','ben','cat','ces','cmn','cmn_hant','cym','dan','deu','eng','est','fin','fra','hin','ind','ita','jpn','kor','mlt',
                  'nld','pes','pol','por','ron','rus','slk', 'spa','swe','swh','tel','tgl','tha','tur','ukr','urd','uzn','vie']

def convert_to_wav(input_path, output_path):
    cmd = [
        'ffmpeg',
        '-y', 
        '-i', input_path,
        '-vn',  
        '-acodec', 'pcm_s16le',  
        '-ar', '16000',  
        '-ac', '1',      
        output_path
    ]
    subprocess.run(cmd, check=True)

class Translate:
  def __init__(self, audio_data, code):
    self.audio, self.freq = torchaudio.load(audio_data)
    self.code = code
    self.audio =  torchaudio.functional.resample(self.audio, orig_freq=self.freq, new_freq=16_000) 
    self.audio_inputs = PROCESSOR(audios=self.audio, sampling_rate=16000, return_tensors="pt")

  def __is_speech_available(self):
    return self.code in AVAILABLE_CODE

  def transcribe(self):
    output_tokens = MODEL.generate(**self.audio_inputs, tgt_lang=self.code, generate_speech=False)
    translated_text = PROCESSOR.decode(output_tokens[0].tolist()[0], skip_special_tokens=True)
    return translated_text

  def translate(self):
    if self.__is_speech_available():
      translated_audio = MODEL.generate(**self.audio_inputs, tgt_lang=self.code)[0].cpu().numpy().squeeze()
      return translated_audio
