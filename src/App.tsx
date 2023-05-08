import React, { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  MessageModel,
} from "@chatscope/chat-ui-kit-react";

const API_KEY = "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";

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState("");
  const [gameOver, setGameOver] = useState(true);
  const [answer, setAnswer] = useState("");
  const [systemResponse, setSystemResponse] = useState("");

  const systemMessage = {
    //  Explain things like you're talking to a software professional with 5 years of experience.
    role: "system",
    content:
      "Lets play a game where you will randomly choose a celeb name and then i will ask few yes/no questions as i am that celebrity. If the answer is yes then respond with yes , if no say no then you will respond with no. If i guess the celeb name then respond with you have won the game. So you choose a celebrity and let start the game.",
  };

  const startGame = async () => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              systemMessage, // The system message DEFINES the logic of our chatGPT
            ],
          }),
        }
      );
      const responseData = await response.json();
      setGameOver(false);
      setSystemResponse(responseData.choices[0].message.content);
      console.log("areee", responseData);
    } catch (error) {
      console.log(error);
    }
  };

  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // const askQuestion = async () => {
  //   request(question).then((response) => {
  //     if (response && response.toLowerCase() === "yes") {
  //       setScore(score + 1);
  //       setGameOver(true);
  //       setQuestion("");
  //     }
  //   });
  // };

  const restartGame = () => {
    setScore(0);
    setGameOver(true);
    setQuestion("");
  };
  const handleSend = async (message: string) => {
    const newMessage: MessageModel = {
      message,
      direction: "outgoing",
      sender: "user",
      position: "normal",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages: MessageModel[]) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage, // The system message DEFINES the logic of our chatGPT
        { role: "assistant", content: systemResponse },
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
            direction: "incoming",
            position: "normal",
          },
        ]);
        setIsTyping(false);
      });
  }

  return (
    <div className="App">
      <h1>Guess Who Am I</h1>
      {gameOver ? (
        <div>
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : (
        <div>
          <h2>Score: {score}</h2>
          <div
            style={{ position: "relative", height: "800px", width: "700px" }}
          >
            <MainContainer>
              <ChatContainer>
                <MessageList
                  scrollBehavior="smooth"
                  typingIndicator={
                    isTyping ? (
                      <TypingIndicator content="ChatGPT is typing" />
                    ) : null
                  }
                >
                  {messages.map((message, i) => {
                    console.log(message);
                    return <Message key={i} model={message} />;
                  })}
                </MessageList>
                <MessageInput
                  placeholder="Type message here"
                  onSend={handleSend}
                />
              </ChatContainer>
            </MainContainer>
            <p>Answer: {answer}</p>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
