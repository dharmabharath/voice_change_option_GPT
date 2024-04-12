var ftr = "";

var condition_to_stop_synthesis = false;
var spr = new webkitSpeechRecognition() || SpeechRecognition();
var sendButton;
var r = document.getElementById("result");
let without_speech = "";
var audio=document.getElementById("myAudio")


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

function base64ToArrayBuffer(base64) {
  var binaryString = window.atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Function to play audio data from ArrayBuffer
function pplayAudioData(audioDataList) {
  // Get the audio data from the response

  // Convert binary data to a Blob
  audioDataList.forEach(function (audioData) {
    // Create a Blob from the audio data string
    var blob = new Blob([audioData], { type: "audio/wav" });

    // Create a URL for the Blob
    var url = URL.createObjectURL(blob);

    // Create an audio element
    var audio = new Audio(url);

    // Play the audio
    audio
      .play()
      .then(() => {
        console.log("Audio playback started successfully");
      })
      .catch((error) => {
        console.error("Error playing audio:", error);
      });
  });
  // // Create a new AudioContext
  // var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // // Decode the audio data
  // audioContext.decodeAudioData(audioDataArrayBuffer, function(buffer) {
  //   // Create a new AudioBufferSourceNode
  //   var source = audioContext.createBufferSource();
  //   // Set the buffer to the decoded audio data
  //   source.buffer = buffer;
  //   // Connect the source to the destination (speakers)
  //   source.connect(audioContext.destination);
  //   // Start playing the audio
  //   source.start(0);
  // });
}

function playAudio(audioFileUrl) {

 
  console.log("enter playaudio", audioFileUrl);
  for (let i = 0; i < audioFileUrl.length; i++) {
    try {
      console.log("enter playaudio", audioFileUrl[i]);
      one(audioFileUrl[i]);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }

  //   audioFileUrl.forEach(function(base64AudioData) {

  //     try {
  //       playAudioData(base64AudioData);
  //     } catch (error) {
  //       console.error('Error playing audio:', error);
  //     }
  // });
}

// Function to decode and play audio data
function playAudioData(s) {
  console.log(("secon dsecond",typeof s));
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const encoder = new TextEncoder();

// Convert the string to bytes
const binaryAudioData = encoder.encode(s);
console.log(("secon dsecond",typeof binaryAudioData));

  // Convert binary string to ArrayBuffer
  var uint8Array = new Uint8Array(binaryAudioData);

  // Convert Uint8Array to ArrayBuffer
  var arrayBuffer = uint8Array.buffer;

  // Decode the audio data
  audioContext.decodeAudioData(arrayBuffer, function(buffer) {
      // Create an AudioBufferSourceNode
      var source = audioContext.createBufferSource();
      source.buffer = buffer;

      // Connect the AudioBufferSourceNode to the audioContext destination (speakers)
      source.connect(audioContext.destination);

      // Play the audio
      source.start(0);
    },
    function (err) {
      console.error("Failed to decode audio: " + err);
    }
  );
}


function one(audioDataList){
  audioDataList.forEach(audioData => {
    // Convert binary data to base64 string
    const base64Data = btoa(String.fromCharCode.apply(null, audioData));

    // Create data URI
    const dataURI = `data:audio/mpeg;base64,${base64Data}`;

    // Create audio element
    const audio = new Audio();
    audio.src = dataURI;

    // Append audio element to the document body or any other container
    document.body.appendChild(audio);

    // Optionally, play the audio
    audio.play();
});
}
