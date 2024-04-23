var ftr = "";

var condition_to_stop_synthesis = false;
var spr = new webkitSpeechRecognition() || SpeechRecognition();
var synth = window.speechSynthesis;
var sendButton;
var r = document.getElementById("result");
let without_speech = "";
let audioUrlLink = "";
let nospeechlisten=document.getElementById("nospeechlisten")
let img = document.getElementById('imgwidhei');
let speechenter=document.getElementById("speechenter")
let reponseenter=document.getElementById("reponseenter")
let inputbox=document.getElementById("responsecenter")
let speechecenter=document.getElementById("speechecenter")
nospeechlisten.style.visibility = "hidden";
inputbox.style.visibility = "hidden";
speechecenter.style.visibility = "hidden";

//start speech listening

function initial_call(event){
  if (event=="Stop Responding"){
    // console.log("Stop Responding",event)
    Stop_Response()  
  }
  else if (event=="Tap to Speak"){

    // console.log("Tap to Speak",event);
    startConverting()
   
  }
}

function startConverting() {
  inputbox.style.visibility="hidden"

   
  // console.log("eveents",event.srcElement.innerText);
  nospeechlisten.style.visibility = "hidden";
  synth.cancel();
  ftr = "";
  // console.log("enter");
  without_speech = "";
  // console.log("enter log speech ", without_speech);
  // var sendButtons = document.getElementById("stop_Response");
  // sendButtons.style.visibility = "hidden";
  var button = document.getElementById("re");

  // sendButton = document.getElementById("send");
  

  button.disabled = true;
  // sendButton.style.visibility = "visible";

  r.innerHTML = "Listening ......";
  speechenter.innerHTML="..."
  speechecenter.style.visibility="visible"
  spr.continuous = false; //True if continous conversion is needed, false to stop transalation when paused
  spr.interimResults = true;
  spr.lang = "en-IN"; // Set Input language
  spr.start(); //Start Recording the voice
  // r.innerHTML = "Listening....";
  audiodetectionanimation(0.9,0.2,0.4)
  // console.log("Start Recording the voice ");
  spr.onresult = function (event) {
    speechenter.innerHTML="..."
    // console.log("contain voive");

    without_speech = "nospeech";
    var interimTranscripts = "";
    for (var i = event.resultIndex; i < event.results.length; i++) {
      var transcript = event.results[i][0].transcript;
      transcript.replace("\n", "<br>");
      if (event.results[i].isFinal) {
        ftr += transcript;
      } else interimTranscripts += transcript;
    }

    // console.log("interimTranscripts", interimTranscripts);
    // reponseenter.innerHTML=ftr+interimTranscripts
    // r.innerHTML = ftr + interimTranscripts;
  };
  spr.onerror = function (event) {};

  spr.onend = function (event) {
    speechenter.innerHTML=ftr
    audiodetectionanimation(0,0,0)
    button.disabled = false;
    // var sendButtons = document.getElementById("send");
    // sendButtons.style.visibility = "hidden";
    // console.log("Speech recognition stopped");
    // console.log("ftr", ftr);
    if (ftr) {
      // img.style.visibility="hidden"
      img.src = "../../static/images/rollinganimae.gif";
      r.innerHTML = "Response Loading";
      // console.log("ftrrrrrrrrrrrrrrrrr", ftr);
      $.ajax({
        type: "POST",
        url: "/audio_data/",
        data: {
          send: ftr,
        },
        
        success: function (res) {
          inputbox.style.visibility="visible"
          reponseenter.innerHTML=res.message;
        
          
          // alert(res.message);
          var utterance = new SpeechSynthesisUtterance(res.message);
          // console.log("utterance",utterance);
          if (utterance){
            img.src = "../../static/images/Stop.png";
            img.style.visibility="visible"
              r.innerHTML = "Stop Responding";
            audiodetectionanimation(0.9,0.2,0.4)
            synth.speak(utterance);
          }

        
          utterance.onend = function () {
            img.src = "../../static/images/micimage.png";
            r.innerHTML = "Tap to Speak";
            // var Stop_Response = document.getElementById("stop_Response");
            // Stop_Response.style.visibility = "hidden";
            audiodetectionanimation(0,0,0)
          
          };
          
        },
      });
      ftr = "";
      // var sendButtons = document.getElementById("stop_Response");
      // sendButtons.style.visibility = "visible";
    }
    // console.log("without_speech", without_speech);
    if (!without_speech) {
      // console.log("ente condition");
      r.innerHTML = "Tap to Speak";
      speechecenter.style.visibility="hidden"
 
      nospeechlisten.style.visibility="visible"
      // const audio = new Audio("/static/images/outputaudio1.mp3");
      // audio.play();
      without_speech = "";
    } 
    // else {
    //   var resultbutton = document.getElementById("result");
    //   resultbutton.style.visibility = "visible";
    // }
  };
}




function toggleSpeechSynthesis() {
  without_speech = "nospeech";
  r.innerHTML = " Ask Something ?";

  spr.stop();

  // sendButton.style.visibility = "hidden";
}




// stop reading
function Stop_Response() {
  synth.cancel();
  audiodetectionanimation(0,0,0)
  r.innerHTML = "Tap to Speak";
  img.src = "../../static/images/micimage.png";
}




function playAudioAndRemoveAfterPlayback(audioUrl) {
  let audio = new Audio(audioUrl);

  function handlePlaybackEnd() {
    // var sendButtons = document.getElementById("stop_Response");
    // sendButtons.style.visibility = "hidden";
    // Remove event listener
    audio.removeEventListener("ended", handlePlaybackEnd);
    // console.log("audio", audio);

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




function audiodetectionanimation(min,max,minmax){
  // console.log(min,max,minmax);

  const bar = document.querySelectorAll(".bar");
  for (let i = 0; i < bar.length; i++) {
    bar.forEach((item, j) => {
      // Random move
      item.style.animationDuration = `${Math.random() * (min - max) + minmax}s`; // 0.9   0.2   0.4 Change the numbers for speed / ( max - min ) + min / ex. ( 0.5 - 0.1 ) + 0.1
    });
  }
}


function changelogoQ(checked){
  let logoquadra=document.getElementById("logoquadra")

  // console.log(checked);
  if(checked){
    logoquadra.src = "../../static/images/quadranlogo.png";
  }
  else{
    logoquadra.src = "../../static/images/quadralogo.png";
  }
 
}

$(document).ready(function(){
  $(".checkbox").change(function(){
    if($(this).is(":checked")) {
      $("body").css("background-color", "#1E1E1E");
      // $(".mainhead,.subhead,#nospeechlisten").css("color"," #fff");
      // $(".wavelength").css("background"," #1E1E1E");
      // $(".checkbox-label").css("background-color"," rgba(255, 255, 255, 0.28)");
      // $(".imgwidth").css({"border":" #1E1E1E","z-index":"-7"});
      // $(".textareafield").css({"border":" 1px solid rgb(62 157 252)"," background-color":"rgba(255, 255, 255, 0.28)"});
    } else {
      $("body").css("background-color", "");

    }
  });
});