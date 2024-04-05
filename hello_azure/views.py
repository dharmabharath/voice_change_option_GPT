from django.http import HttpResponse
from django.shortcuts import render
from django.http import JsonResponse
import os
import azure.cognitiveservices.speech as speechsdk
from openai import AzureOpenAI
from django.views.decorators.csrf import csrf_exempt 
from django.views.decorators.http import require_http_methods


os.system('sudo apt-get install libasound2-dev')
stop_speech_synthesis = False
speech_config = speechsdk.SpeechConfig(subscription="d1cca89c7c0b4bb3ad3826708743a035", region="eastus")
file_name = "outputaudio.wav"
audio_output_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_output_config)
stopResponseButton=True

def one(request):
    print("start")
    return render(request,'index.html')

@csrf_exempt
def ask_openai(request):
    condition_to_stop_synthesis=False
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
                                print("stopResponseButton",stopResponseButton)
                                last_tts_request = speech_synthesizer.speak_text_async(text)
                               
                                collected_messages.clear()
                                print("stopResponseButton",stopResponseButton)
            sendhidebuttoncommand(request)  

        except Exception as e:
            print("Erroe",e)
        if last_tts_request:
            last_tts_request.get()
        return JsonResponse({'message': 'Speech synthesis completed'}, status=200)

    return JsonResponse({'error': 'Invalid request method'}, status=400)



@csrf_exempt
@require_http_methods(["POST"])
def signal_stop_speech(request):
    print("enter stop")
    global stop_speech_synthesis
    stop_speech_synthesis = True
    if stop_speech_synthesis==True:
            speech_synthesizer.stop_speaking_async()
            stop_speech_synthesis = False
            return JsonResponse({'status': 'success'}) 
   


def sendhidebuttoncommand(request):
    
    condition_to_call_js_function = True  # Set the condition to call the JavaScript function

    return render(request, 'index.html', {'condition_to_call_js_function': condition_to_call_js_function})    
