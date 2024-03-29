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
  const [gameOver, setGameOver] = useState(true);
  const [systemResponse, setSystemResponse] = useState("");

  const systemMessage = {
    role: "system",
    content:
      "Lets play a game where you will randomly choose a celeb name and then i will ask few yes/no questions as i am that celebrity. If i say the celeb name or am i this celeb then responsd with you have won the game. If the answer is yes then respond with yes , if no say no then you will respond with no. If i say the celeb name or my repsonse contains celeb name then respond with you have won the game. Resposnd with you have won the game if i have guessed the celeb name and not with yes or any other ways. So you choose a celebrity and let start the game.",
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
    } catch (error) {
      console.log(error);
    }
  };

  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const restartGame = () => {
    setScore(0);
    startGame();
    setMessages([]);
    setGameOver(false);
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
        if (
          (data.choices[0].message.content as String).includes("won the game")
        ) {
          setScore(score + 1);
          startGame();
          setMessages([]);
          setGameOver(false);
        }
        setIsTyping(false);
      });
  }

  return (
    <div className="App">
      <h1>Guess Who Am I</h1>
      <p>
        Ask true or false questions about the celebrity. Ex: Am i male?, am i
        actor? And finally write the name if you have guessed the celebrity by
        the clues. Ex: Taylor swift
      </p>
      {gameOver ? (
        <div>
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : (
        <div>
          <h2>Score: {score}</h2>
          <div
            style={{ position: "relative", height: "500px", width: "700px" }}
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
            <button onClick={restartGame}>Restart Game</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
