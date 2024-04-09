from django.urls import path
from . import views

urlpatterns = [
    path("",views.one,name="one"),
    path("audio_data/",views.ask_openai,name="ask_openai"),
    path("signal_stop_speech/",views.stop_playback_handler,name="stop_playback_handler")
]