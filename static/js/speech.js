let ftr = "";
let spr = new webkitSpeechRecognition() || SpeechRecognition();
let synth = window.speechSynthesis;
let without_speech = "";
const chatbox = document.querySelector(".chatbox");
const centerpart = document.getElementById("centerpart");
let r = document.getElementById("result");
const inputbox = document.getElementById("inputbox");
const fline = document.getElementById("fline");
const sline = document.getElementById("sline");
const speakimg = document.getElementById("speakimg");
const getidname = document.getElementById("chaticon");
const getidname2 = document.getElementById("guideicon");
inputbox.style.display = "none";
let voices = [];
const voiceSelect = document.querySelector("select");

(function () {
  synth.addEventListener('voiceschanged', populateVoiceList);
})();


let selectedOption2=""
voiceSelect.addEventListener('change', () => {
  selectedOption2 = voiceSelect.selectedOptions[0].getAttribute('data-name');
  // console.log("change");
  // console.log("selectedOption2",selectedOption2);
  localStorage.setItem('selectvoice', selectedOption2);
});


function populateVoiceList() {
  voices = synth.getVoices();
  // console.log(voices)
  for (const voice of voices) {
    if (voice.lang=="en-US"){
    // console.log("voices",voice);
    const option = document.createElement("option");
    option.textContent = `${voice.name.split('(')[0]}`;
    if (voice.default) {
      option.textContent += " — DEFAULT";
    }
    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    voiceSelect.appendChild(option);
  }
  }
}


const createchatli = (message, className) => {
  if (className == "incoming") {
    const chatli = document.createElement("li"); // Use createElement instead of createDocumentFragment
    chatli.classList.add("chat", className);
    chatli.id = "incoming";
    let chatcontent =
      className == "outgoing"
        ? `<p>${message}</p>`
        : ` <img src="../../static/images/User-60.png" alt="" id="speechecenterimg" class="speechecenterimg"><p>${message}</p>`;
    chatli.innerHTML = chatcontent;
    return chatli;
  } else if (className == "outgoing") {
    const chatli = document.createElement("div"); // Use createElement instead of createDocumentFragment
    chatli.classList.add("outgoingchat", className);
    let chatcontent =
      className == "incoming"
        ? `<p>${message}</p>`
        : `<img src="../../static/images/chatrobo.png" alt="Chat Robot" id="speechecenterimg" class="speechecenterimg"><div><p>${message}</p></div>`;
    chatli.innerHTML = marked.parse(chatcontent);
    return chatli;
  }
};

//start speech listening
function initial_call(event) {
  if (event == "Stop Responding") {
    Stop_Response();
  } else if (event == "Tap the button to speak") {
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
  without_speech = "";
  spr.continuous = false; //True if continous conversion is needed, false to stop transalation when paused
  spr.interimResults = true;
  spr.lang = "en-IN"; // Set Input language
  spr.start(); //Start Recording the voice

  spr.onresult = function (event) {
    without_speech = "nospeech";
    let interimTranscripts = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      let transcript = event.results[i][0].transcript;
      transcript.replace("\n", "<br>");
      if (event.results[i].isFinal) {
        ftr += transcript;
      } else interimTranscripts += transcript;
    }
    secondpage();
  };
  spr.onerror = function (event) {};
  function secondpage() {
    spr.onend = function (event) {
      fline.style.height = "1px";
      fline.src = "../../static/images/Line.png";
      sline.style.height = "1px";
      sline.src = "../../static/images/Line.png";
      centerpart.style.display = "none";
      inputbox.style.display = "flex";
      const lastMessage = chatbox.lastElementChild;
      chatbox.insertBefore(createchatli(ftr, "incoming"), lastMessage);
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
            chatbox.insertBefore(
              createchatli(res.message, "outgoing"),
              lastMessage
            );
            document.getElementById("chat-bar-bottom").scrollIntoView(true);
            let cleanedMessage = stripMarkdown(res.message);
            let utterance = new SpeechSynthesisUtterance(cleanedMessage);
  
            speakimg.src = "../../static/images/Stop1.png";
            r.innerHTML = "Stop Responding";
            // speakimg;
            if (utterance) {
              fline.style.height = "80px";
              fline.src = "../../static/images/soundwave.gif";
              sline.style.height = "80px";
              sline.src = "../../static/images/soundwave.gif";
              const selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');

              // console.log("Selectedoption",selectedOption);
              // console.log("Selectedoption2",selectedOption2);
              for (let voice of voices) {
     
                // if (voice.name === selectedOption ) {
                //   // localStorage.setItem("selectvoice",selectedOption);
                //   utterance.voice = voice;
                //   break;
                // }
                if (localStorage.getItem("selectvoice")){
                  if (voice.name==localStorage.getItem("selectvoice")){
                    utterance.voice = voice;
                    break;
                  }
                }
            }
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
      }
      if (!without_speech) {
        nospeechlisten.style.visibility = "visible";
        without_speech = "";
      }
    };
  }

  spr.onend = function () {
    fline.style.height = "1px";
    fline.src = "../../static/images/Line.png";
    sline.style.height = "1px";
    sline.src = "../../static/images/Line.png";
  };
}

function toggleSpeechSynthesis() {
  without_speech = "nospeech";
  r.innerHTML = " Ask Something ?";

  spr.stop();
}

function stripMarkdown(text) {
  // Remove Markdown headings
  text = text.replace(/#/g, "");

  // Remove bold/italic formatting
  text = text.replace(/\*\*|__/g, "");

  // Remove list item symbols
  text = text.replace(/- /g, "");

  // Remove extra whitespace
  text = text.replace(/\n+/g, " ").trim();

  return text;
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

function audiodetectionanimation(min, max, minmax) {
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
    } else {
      $("body").css("background-color", "");
      $(".checkbox-label").css("background-color", "#1970db");
    }
  });
});

function scrollToBottom() {
  let chatbox = document.getElementById("chatbox");
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Event listener for scroll indicator
document.getElementById("chatbox").addEventListener("wheel", function (event) {
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
  if (tabName == "nav1") {
    getidname.src = "../../static/images/chatIcon.png";
    getidname2.src = "../../static/images/guideIcon.png";
  } else if (tabName == "nav2") {
    getidname.src = "../../static/images/chatIconunactive.png";
    getidname2.src = "../../static/images/guideIconactive.png";
  }
  let i, tabcontent, tablinks;
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
let defaultTab = document.getElementById("defaultOpen");
defaultTab.classList.add("active");
document.getElementById(
  defaultTab.getAttribute("href").substring(1)
).style.display = "block";
