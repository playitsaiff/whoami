import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import { request } from "./openAICallHelper";

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState("");
  const [gameOver, setGameOver] = useState(true);
  const [answer, setAnswer] = useState("");
  const startPrompt =
    "Lets play a game where you will randomly choose a celeb name and then i will ask few yes/no questions . If the answer is yes then respond with yes , if no say no then you will respond with no. If i guess the celeb name then respond with you have won the game";
  const startGame = () => {
    request(startPrompt).then((response) => {
      setGameOver(false);
      console.log(response);
    });
  };

  const askQuestion = async () => {
    request(question).then((response) => {
      if (response && response.toLowerCase() === "yes") {
        setScore(score + 1);
        setGameOver(true);
        setQuestion("");
      }
    });
  };

  const restartGame = () => {
    setScore(0);
    setGameOver(true);
    setQuestion("");
  };

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
          <input
            type="text"
            value={question}
            placeholder="Ask a yes/no question"
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button onClick={askQuestion}>Ask</button>
          <p>Answer: {answer}</p>
          <button onClick={restartGame}>Restart Game</button>
        </div>
      )}
    </div>
  );
};

export default App;
