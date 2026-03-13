import chalk from "chalk";
import questions from "./quizData.js";
import { select } from "@inquirer/prompts";

//Main Menu
export async function showMainMenu(gameState) {
  const action = await select({
    message: "Main Menu",
    choices: [
      { name: "Start Quiz", value: "start" },
      { name: "See Score", value: "stats" },
      { name: "Reset Score", value: "reset" },
      { name: "Quit", value: "quit" },
    ],
  });

  switch (action) {
    case "start":
      await startQuiz(gameState);
      break;
    case "stats":
      showScore(gameState);
      await select({
        message: "Press Enter to go back",
        choices: [{ name: "Back", value: "back" }],
      });
      await showMainMenu(gameState);
      break;
    case "reset":
      resetQuiz(gameState);
      console.log(chalk.blue("Score has been reset."));
      await showMainMenu(gameState);
      break;
    case "quit":
      console.log("Goodbye!");
      process.exit(0);
  }
}

export async function startQuiz(gameState) {
    gameState.currentQuestionIndex = 0;
    gameState.score = 0;
    gameState.answers = [];

    while (gameState.currentQuestionIndex < questions.length) {
        const currentQuestion = questions[gameState.currentQuestionIndex];
        const userChoice = await askQuestion(currentQuestion, gameState.currentQuestionIndex + 1);
        const isCorrect = userChoice === currentQuestion.correctAnswer;

        if (isCorrect) {
            gameState.score++;
            console.log(chalk.green("Correct!"));
        } else {
            console.log(chalk.red("Incorrect"));
        }
        gameState.currentQuestionIndex++;
    }
    //show final results of the quiz
}

export async function askQuestion(question, questionNumber) {
    const userChoice = await select({
        message: `Question ${questionNumber}: ${question.question}`,
        choices: question.choices.map((choice) => ({
            name: choice,
            value: choice,
        })),
    });

    return userChoice;
}