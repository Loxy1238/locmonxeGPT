const API_KEY = "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";
const model = "gpt-3.5-turbo";
const stop = [" 록몬스GPT유저:", " 록몬스GPT:"];
let chatHistory = "";

const outputContainer = document.querySelector("#output");

document.querySelector("#prompt").addEventListener("keydown", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.querySelector("#submit").click();
    document.querySelector("#prompt").value = "";
  }
});

document.querySelector("#submit").addEventListener("click", function () {
  sendMessage();
});

document.querySelector("#voice-btn").addEventListener("click", function () {
  startVoiceRecognition();
});

async function startVoiceRecognition() {
  try {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.start();
    document.querySelector("#voice-btn").style.background = "red";
    recognition.onresult = function (event) {
      const input = event.results[0][0].transcript.toLowerCase();
      if (input.trim() === "") {
        return;
      }
      sendMessage(input);
      recognition.stop();
      document.querySelector("#voice-btn").style.background = "";
    };
  } catch (error) {
    console.error(error);
  }
}

function sendMessage(input) {
  input = input || document.querySelector("#prompt").value.toLowerCase();
  if (input.trim() === "") {
    return;
  }

  chatHistory += "Human: " + input + "\n";

  let prompt = "로그인 없이 시간 남는 편안함 록몬스: \n" + chatHistory;
  document.querySelector("#prompt").value = "";

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add("user-message");
  const messageText = document.createElement("p");
  messageText.innerText = input;
  messageDiv.appendChild(messageText);
  outputContainer.appendChild(messageDiv);

  responsiveVoice.speak(input, "Korean Female", { onend: startResponse });

  async function startResponse() {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/text-davinci-002/completions',
        {
          prompt,
          max_tokens: 450,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0.6,
          stop: [" Human:", " AI:"]
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      let responseText = response.data.choices[0].text;

      const index = responseText.indexOf(':');
      if (index !== -1) {
        responseText = responseText.substring(index + 1).trim();
      }
      const messages = responseText.split(/\.\s+/).map(m => m.trim() + '');

      chatHistory += "AI: " + responseText + "\n";

      for (let i = 0; i < messages.length; i++) {
        await sleep(2000);
        const msg = messages[i];
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.classList.add("bot-message");
        const messageText = document.createElement("p");
        messageText.innerHTML = msg;
        messageDiv.appendChild(messageText);
        outputContainer.appendChild(messageDiv);
        outputContainer.scrollTo({ top: outputContainer.scrollHeight, behavior: 'smooth' });

        responsiveVoice.speak(msg, "Korean Female");

        // Check if input is "너는 누구야?"
        if (input === "너는 누구야?") {
          const responseDiv = document.createElement("div");
          responseDiv.classList.add("message");
          responseDiv.classList.add("bot-message");
          const responseText = document.createElement("p");
          responseText.innerText = "로그인 없는 편안함 록몬스GPT입니다";
          responseDiv.appendChild(responseText);
          outputContainer.appendChild(responseDiv);
          outputContainer.scrollTo({ top: outputContainer.scrollHeight, behavior: 'smooth' });

          responsiveVoice.speak("로그인 없는 편안함 록몬스GPT입니다", "Korean Female");
        }

        // Check if input is "누가 만들었어?"
        if (input === "누가 만들었어?") {
          const responseDiv = document.createElement("div");
          responseDiv.classList.add("message");
          responseDiv.classList.add("bot-message");
          const responseText = document.createElement("p");
          responseText.innerText = "록시님이 만들었습니다";
          responseDiv.appendChild(responseText);
          outputContainer.appendChild(responseDiv);
          outputContainer.scrollTo({ top: outputContainer.scrollHeight, behavior: 'smooth' });

          responsiveVoice.speak("록시님이 만들었습니다", "Korean Female");
        }

        // Check if input is "록몬스가 뭐야?"
        if (input === "록몬스가 뭐야?") {
          const responseDiv = document.createElement("div");
          responseDiv.classList.add("message");
          responseDiv.classList.add("bot-message");
          const responseText = document.createElement("p");
          responseText.innerText = "록몬스는 로그인 없이 편안하게 사용할 수 있는 GPT입니다";
          responseDiv.appendChild(responseText);
          outputContainer.appendChild(responseDiv);
          outputContainer.scrollTo({ top: outputContainer.scrollHeight, behavior: 'smooth' });

          responsiveVoice.speak("록몬스는 로그인 없이 편안하게 사용할 수 있는 GPT입니다", "Korean Female");
        }
      }
    } catch (error) {
      console.error(error);

      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.classList.add("bot-message");
      const messageText = document.createElement("p");

      if (axios.isAxiosError(error)) {
        messageText.innerText = `Error404 by LoX: ${error.message}`;
      } else if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers["retry-after"];
        messageText.innerText = `다시 한번 말씀해주세요 ${retryAfter} 잠자는 중...`;
      } else {
        messageText.innerText = "다시 한번 말씀해주세요";
      }

      messageDiv.appendChild(messageText);
      outputContainer.appendChild(messageDiv);
      outputContainer.scrollTo({ top: outputContainer.scrollHeight, behavior: "smooth" });
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
