let ftr = "";
var condition_to_stop_synthesis = false;
var spr = new webkitSpeechRecognition() || SpeechRecognition();
var synth = window.speechSynthesis;
var sendButton;
let without_speech = "";
const chatbox = document.querySelector(".chatbox");
const centerpart = document.getElementById("centerpart");
var r = document.getElementById("result");
const inputbox = document.getElementById("inputbox");
const fline = document.getElementById("fline");
const sline = document.getElementById("sline");
const speakimg = document.getElementById("speakimg");
const getidname=document.getElementById("chaticon");
const getidname2=document.getElementById("guideicon");
let firstSpeechrecog = false;
inputbox.style.display = "none";

const createchatli = (message, className) => {
  if (className == "incoming") {
    const chatli = document.createElement("li"); // Use createElement instead of createDocumentFragment
    chatli.classList.add("chat", className);
    chatli.id="incoming";
    let chatcontent =
      className == "outgoing"
        ? `<p>${message}</p>`
        : ` <img src="../../static/images/User-60.png" alt="" id="speechecenterimg" class="speechecenterimg"><p>${message}</p>`;
    chatli.innerHTML = chatcontent;
    
   
    return chatli;
  } 
  else if (className == "outgoing") {
    const chatli = document.createElement("li"); // Use createElement instead of createDocumentFragment
    chatli.classList.add("chat", className);
    let chatcontent =
      className == "incoming"
        ? `<p>${message}</p>`
        : ` <img src="../../static/images/chatrobo.png" alt="" id="speechecenterimg" class="speechecenterimg"><p>${message}</p>`;
    chatli.innerHTML = chatcontent;
    
    // document.getElementById("chat-bar-bottom").scrollIntoView(true);
    return chatli;
  }
};

//start speech listening
function initial_call(event) {
  if (event == "Stop Responding") {
    // console.log("Stop Responding",event)
    Stop_Response();
  } else if (event == "Tap the button to speak") {
    // console.log("Tap to Speak",event);
    startConverting();
  }
}

function startConverting() {
  fline.style.height = "80px";
  fline.src = "../../static/images/soundwave.gif";
  sline.style.height = "80px";
  sline.src = "../../static/images/soundwave.gif";
  synth.cancel();
  ftr = "";
  // console.log("enter");
  without_speech = "";

  var button = document.getElementById("re");

  spr.continuous = false; //True if continous conversion is needed, false to stop transalation when paused
  spr.interimResults = true;
  spr.lang = "en-IN"; // Set Input language
  spr.start(); //Start Recording the voice

  spr.onresult = function (event) {
    firstSpeechrecog=true;
    // console.log(firstSpeechrecog);
    without_speech = "nospeech";
    var interimTranscripts = "";
    for (var i = event.resultIndex; i < event.results.length; i++) {
      var transcript = event.results[i][0].transcript;
      transcript.replace("\n", "<br>");
      if (event.results[i].isFinal) {
        ftr += transcript;
      } else interimTranscripts += transcript;
    }
  secondpage()
  };
  spr.onerror = function (event) {};
  function secondpage(){
    spr.onend = function (event) {
      
      fline.style.height = "1px";
      fline.src = "../../static/images/Line.png";
      sline.style.height = "1px";
      sline.src = "../../static/images/Line.png";
      centerpart.style.display = "none";
      inputbox.style.display = "flex";
      const lastMessage = chatbox.lastElementChild;
      chatbox.insertBefore(createchatli(ftr, "incoming"),lastMessage);
      document.getElementById("chat-bar-bottom").scrollIntoView(true);
      if (ftr) {
        $.ajax({
          type: "POST",
          url: "/audio_data/",
          data: {
            send: ftr,
          },

          success: function (res) {
            const lastMessage = chatbox.lastElementChild;
            chatbox.insertBefore(createchatli(res.message, "outgoing"),lastMessage);
            document.getElementById("chat-bar-bottom").scrollIntoView(true);
            var utterance = new SpeechSynthesisUtterance(res.message);
            speakimg.src = "../../static/images/Stop1.png";
            r.innerHTML = "Stop Responding";
            // speakimg;
            if (utterance) {
              fline.style.height = "80px";
              fline.src = "../../static/images/soundwave.gif";
              sline.style.height = "80px";
              sline.src = "../../static/images/soundwave.gif";

              synth.speak(utterance);
            }
            utterance.onend = function () {
              r.innerHTML = "Tap the button to speak";
              fline.style.height = "1px";
              fline.src = "../../static/images/Line.png";
              sline.style.height = "1px";
              sline.src = "../../static/images/Line.png";
              speakimg.src = "../../static/images/newmic.png";
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

        // speechecenter.style.visibility="hidden"

        nospeechlisten.style.visibility = "visible";
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
  
  spr.onend=function(){
    fline.style.height = "1px";
    fline.src = "../../static/images/Line.png";
    sline.style.height = "1px";
    sline.src = "../../static/images/Line.png";
  }
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
  speakimg.src = "../../static/images/newmic.png";
  r.innerHTML = "Tap the button to speak";
  fline.style.height = "1px";
  fline.src = "../../static/images/Line.png";
  sline.style.height = "1px";
  sline.src = "../../static/images/Line.png";
  speakimg.src = "../../static/images/newmic.png";
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

function audiodetectionanimation(min, max, minmax) {
  // console.log(min,max,minmax);

  const bar = document.querySelectorAll(".bar");
  for (let i = 0; i < bar.length; i++) {
    bar.forEach((item, j) => {
      // Random move
      item.style.animationDuration = `${Math.random() * (min - max) + minmax}s`; // 0.9   0.2   0.4 Change the numbers for speed / ( max - min ) + min / ex. ( 0.5 - 0.1 ) + 0.1
    });
  }
}

function changelogoQ(checked) {
  let logoquadra = document.getElementById("logoquadra");
  let imgwidth = document.getElementById("imgwidth");
  // console.log(checked);
  if (checked) {
    nightmodelogo.src = "../../static/images/quadranightlogo.png";
    imgwidth.src = "../../static/images/wavenight.png";
    logoquadra.src = "../../static/images/quadranlogo.png";
  } else {
    nightmodelogo.src = "../../static/images/quadraresponselogo.png";
    imgwidth.src = "../../static/images/wave.png";
    logoquadra.src = "../../static/images/quadralogo.png";
  }
}

$(document).ready(function () {
  $(".checkbox").change(function () {
    if ($(this).is(":checked")) {
      $("body").css("background-color", "#1E1E1E");
      $(".checkbox-label").css("background-color", "#606871");
      // $(".mainhead,.subhead,#nospeechlisten").css("color"," #fff");
      // $(".wavelength").css("background"," #1E1E1E");
      // $(".checkbox-label").css("background-color"," rgba(255, 255, 255, 0.28)");
      // $(".imgwidth").css({"border":" #1E1E1E","z-index":"-7"});
      // $(".textareafield").css({"border":" 1px solid rgb(62 157 252)"," background-color":"rgba(255, 255, 255, 0.28)"});
    } else {
      $("body").css("background-color", "");
      $(".checkbox-label").css("background-color", "#1970db");
    }
  });
});



function scrollToBottom() {
  var chatbox = document.getElementById('chatbox');
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Event listener for scroll indicator
document.getElementById('chatbox').addEventListener('wheel', function(event) {
  // Check if scrolling down
  if (event.deltaY > 0) {
    // Scroll down
    chatbox.scrollTop += 50; // Increase or decrease the scroll speed as needed
} else {
    // Scroll up
    chatbox.scrollTop -= 50; // Increase or decrease the scroll speed as needed
}
});

// Call scrollToBottom function initially to scroll to the bottom
scrollToBottom();


 
// Function to open tabs using side Navbar
function openTab(evt, tabName) {
  if(tabName=="nav1"){
    getidname.src="../../static/images/chatIcon.png";
    getidname2.src="../../static/images/guideIcon.png";
  }
  else if(tabName=="nav2"){
    getidname.src="../../static/images/chatIconunactive.png";
    getidname2.src="../../static/images/guideIconactive.png";;
  }
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByTagName("a");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
}
 
// Open the default tab and apply active class to nav1 div
var defaultTab = document.getElementById("defaultOpen");
defaultTab.classList.add("active");
document.getElementById(
  defaultTab.getAttribute("href").substring(1)
).style.display = "block";