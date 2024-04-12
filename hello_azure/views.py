from django.http import HttpResponse
from django.shortcuts import render
from django.http import JsonResponse
import azure.cognitiveservices.speech as speechsdk
from openai import AzureOpenAI
from django.views.decorators.csrf import csrf_exempt 
from django.views.decorators.http import require_http_methods
import os
# import pyaudio
# import wave

# output_directory =r"static/audio"
# os.makedirs(output_directory, exist_ok=True)

# stop_speech_synthesis = False
# speech_config = speechsdk.SpeechConfig(subscription="49a5b50e9b5d435eab3fbc6ffb1d11fe", region="eastus")
# file_name = "outputaudio5.mp3"
# full_file_path = os.path.join(output_directory, file_name)

# audio_output_config = speechsdk.audio.AudioOutputConfig(filename=full_file_path)
# speech_config.speech_synthesis_voice_name='en-US-JennyMultilingualNeural'
# speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_output_config)
# stop_playback = False




stop_speech_synthesis = False
speech_config = speechsdk.SpeechConfig(subscription="49a5b50e9b5d435eab3fbc6ffb1d11fe", region="eastus")


audio_output_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
speech_config.speech_synthesis_voice_name='en-US-JennyMultilingualNeural'
speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_output_config)
stop_playback = False

def one(request):
    print("start")
    return render(request,'index.html')

@csrf_exempt
def ask_openai(request):
    global stop_playback
    stop_playback = False
    audio_data_list = []
    print("saghd",request.POST['send'])
    if request.method=='POST':
        client = AzureOpenAI(
                azure_endpoint="https://casggpt-4.openai.azure.com/",
                api_key="62f99aff986e40a1918058887856b41d",
                api_version="2023-05-15"
                )
        deployment_id="gpt-35-turbo-16k"
        tts_sentence_end = [ ".", "!", "?", ";", "。", "！", "？", "；", "\n" ]
 
      
        # Ask Azure OpenAI in streaming way
        response = client.chat.completions.create(model=deployment_id, max_tokens=200, stream=True, messages=[
            {"role": "user", "content": request.POST['send']}
        ])
        collected_messages = []
        last_tts_request = None

        # iterate through the stream response stream
        try:
            for chunk in response:                
                if len(chunk.choices) > 0:
                    chunk_message = chunk.choices[0].delta.content  # extract the message
                    if chunk_message is not None:
                        collected_messages.append(chunk_message)  # save the message
                        if chunk_message in tts_sentence_end: # sentence end found
                            text = ''.join(collected_messages).strip() # join the recieved message together to build a sentence
                            if text != '' and stop_speech_synthesis!=True: # if sentence only have \n or space, we could skip
                                print(f"Speech synthesized to speaker for: {text}")     
                                last_tts_request = speech_synthesizer.speak_text_async(text)                            
                                # result = speech_synthesizer.speak_text(text)                                
                                collected_messages.clear()
            
                                
        except Exception as e:
            print("Erroe",e)
        if last_tts_request:       
            last_tts_request.get()     

        # print("setseteeste",audio_data_list)
        return JsonResponse({'message':"success"}, status=200)

    return JsonResponse({'error': 'Invalid request method'}, status=400)




















# def ask_openai(request):
#     global stop_playback
#     stop_playback = False
#     audio_data_list = []
#     print("saghd",request.POST['send'])
#     if request.method=='POST':
#         client = AzureOpenAI(
#                 azure_endpoint="https://casggpt-4.openai.azure.com/",
#                 api_key="62f99aff986e40a1918058887856b41d",
#                 api_version="2023-05-15"
#                 )
#         deployment_id="gpt-35-turbo-16k"
#         tts_sentence_end = [ ".", "!", "?", ";", "。", "！", "？", "；", "\n" ]
 
      
#         # Ask Azure OpenAI in streaming way
#         response = client.chat.completions.create(model=deployment_id, max_tokens=200, stream=True, messages=[
#             {"role": "user", "content": request.POST['send']}
#         ])
#         collected_messages = []
#         last_tts_request = ""
#         last_tts_Response=None
#         # iterate through the stream response stream
#         try:
#             for chunk in response:                
#                 if len(chunk.choices) > 0:
#                     chunk_message = chunk.choices[0].delta.content  # extract the message
#                     if chunk_message is not None:
#                         collected_messages.append(chunk_message)  # save the message
#                         if chunk_message in tts_sentence_end: # sentence end found
#                             text = ''.join(collected_messages).strip() # join the recieved message together to build a sentence
#                             if text != '' and stop_speech_synthesis!=True: # if sentence only have \n or space, we could skip
#                                 print(f"Speech synthesized to speaker for: {text}")
                                
#                                 # result = speech_synthesizer.speak_text(text)
#                                 last_tts_request +=text
                                
#                                 collected_messages.clear()
#             last_tts_Response = speech_synthesizer.speak_text_async(last_tts_request) 
                                
#         except Exception as e:
#             print("Erroe",e)
#         if last_tts_Response:            
#             with open(full_file_path, 'wb') as file:
#                 file.write(last_tts_Response.get().audio_data)
#         # print("setseteeste",audio_data_list)
#         return JsonResponse({'message':"success"}, status=200)

#     return JsonResponse({'error': 'Invalid request method'}, status=400)


#stop speech listening
@csrf_exempt
def signal_stop_speech(request):
    print("enter stop")
    global stop_speech_synthesis
    stop_speech_synthesis = True
    if stop_speech_synthesis==True:
            speech_synthesizer.stop_speaking_async()
            stop_speech_synthesis = False
            return JsonResponse({'status': 'success'}) 






# def play_wav_file(file_path):
#     global stop_playback
#     s=file_path
#     chunk = 1024
#     wf = wave.open(file_path, 'rb')
#     p = pyaudio.PyAudio()

#     # Open stream
#     stream = p.open(format=p.get_format_from_width(wf.getsampwidth()),
#                     channels=wf.getnchannels(),
#                     rate=wf.getframerate(),
#                     output=True)

#     # Read data
#     data = wf.readframes(chunk)

#     # Play stream
#     while data and not stop_playback:
#         stream.write(data)
#         data = wf.readframes(chunk)

#     # Stop stream
#     stream.stop_stream()
#     stream.close()

#     # Close PyAudio
#     p.terminate()
#     empty_wav_file(s)



# #after new response received the file to remove any existing data
# def empty_wav_file(file_path):
#     with open(file_path, 'wb') as wf:
#         wf.truncate()



@csrf_exempt
@require_http_methods(["POST"])
def stop_playback_handler(data):
    return None
