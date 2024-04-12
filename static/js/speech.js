var ftr = "";

var condition_to_stop_synthesis = false;
var spr = new webkitSpeechRecognition() || SpeechRecognition();
var sendButton;
var r = document.getElementById("result");
let without_speech = "";
let audioUrlLink = "";

//start speech listening
function startConverting() {
  ftr = "";
  console.log("enter");
  without_speech = "";
  console.log("enter log speech ", without_speech);
  var sendButtons = document.getElementById("stop_Response");
  sendButtons.style.visibility = "hidden";
  var button = document.getElementById("re");
  sendButton = document.getElementById("send");

  button.disabled = true;
  sendButton.style.visibility = "visible";

  r.innerHTML = "Listening ......";
  spr.continuous = false; //True if continous conversion is needed, false to stop transalation when paused
  spr.interimResults = true;
  spr.lang = "en-IN"; // Set Input language
  spr.start(); //Start Recording the voice

  console.log("Start Recording the voice ");
  spr.onresult = function (event) {
    console.log("contain voive");

    without_speech = "nospeech";
    var interimTranscripts = "";
    for (var i = event.resultIndex; i < event.results.length; i++) {
      var transcript = event.results[i][0].transcript;
      transcript.replace("\n", "<br>");
      if (event.results[i].isFinal) {
        ftr += transcript;
      } else interimTranscripts += transcript;
    }

    console.log("interimTranscripts", interimTranscripts);
    r.innerHTML = ftr + interimTranscripts;
  };
  spr.onerror = function (event) {};

  spr.onend = function (event) {
    button.disabled = false;
    var sendButtons = document.getElementById("send");
    sendButtons.style.visibility = "hidden";
    console.log("Speech recognition stopped");
    console.log("ftr", ftr);
    if (ftr) {
      $.ajax({
        type: "POST",
        url: "/audio_data/",
        data: {
          send: ftr,
        },
        success: function (res) {
          alert(res.message);
          console.log("Audio data:", res.message);
          const audioFileName = "outputaudio5.mp3";
          const audioUrl = `/static/audio/${audioFileName}?t=${new Date(
            new Date().getTime()
          ).toUTCString()}`;






          console.log("audiourl", audioUrl, new Date().getTime());
          const audioFile = "static/audio/outputaudio5.mp3";
          const audioElement = document.createElement("audio");
          audioElement.src = audioFile;
          audioElement.addEventListener("loadedmetadata", function () {
            const duration = audioElement.duration;
            console.log("Duration:", duration, "seconds");
          });





          audioUrlLink = audioUrl;
          playAudioAndRemoveAfterPlayback(audioUrl);
        },
      });
      ftr = "";
      var sendButtons = document.getElementById("stop_Response");
      sendButtons.style.visibility = "visible";
    }
    console.log("without_speech", without_speech);
    if (!without_speech) {
      console.log("ente condition");
      r.innerHTML = "No speech could be recognized";
      const audio = new Audio("/static/images/outputaudio1.mp3");
      audio.play();
      without_speech = "";
    } else {
      var resultbutton = document.getElementById("result");
      resultbutton.style.visibility = "visible";
    }
  };
}

function handleAudioData(audioDataList) {
  // Process the audio data (e.g., play it using Web Audio API)
  audioDataList.message.forEach((audioData) => {
    // Your code to process and play the audio data
    console.log("Audio data:", audioData);
  });
}

function toggleSpeechSynthesis() {
  without_speech = "nospeech";
  r.innerHTML = " Ask Something ?";

  spr.stop();

  sendButton.style.visibility = "hidden";
}

// stop reading
function Stop_Response() {
  // $.ajax({
  //   type: "POST",
  //   url: "/signal_stop_speech/", // This URL needs to be handled in your Django views.
  //   data: {
  //     stop_speech: true,
  //   },
  //   success: function (response) {
  //     console.log("Requested to stop speech synthesis.");
  //   },
  // });
  var Stop_Response = document.getElementById("stop_Response");
  Stop_Response.style.visibility = "hidden";
  const audio = new Audio(audioUrlLink);
  audio.pause();
}

function playAudioAndRemoveAfterPlayback(audioUrl) {
  let audio = new Audio(audioUrl);

  function handlePlaybackEnd() {
    var sendButtons = document.getElementById("stop_Response");
    sendButtons.style.visibility = "hidden";
    // Remove event listener
    audio.removeEventListener("ended", handlePlaybackEnd);
    console.log("audio", audio);

    // Pause audio to ensure it's not playing anymore
    audio.pause();

    // Clear the src attribute to release the memory
    audio.src = "";

    // Nullify the reference to the audio element
    // audio = null;
  }
  audio.play();
  audio.addEventListener("ended", handlePlaybackEnd);
}
