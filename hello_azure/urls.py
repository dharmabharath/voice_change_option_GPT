from django.urls import path
from . import views

urlpatterns = [
    path("",views.one,name="one"),
    path("audio_data/",views.ask_openai,name="ask_openai"),
    path("signal_stop_speech/",views.signal_stop_speech,name="signal_stop_speech")
]