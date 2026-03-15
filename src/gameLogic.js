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
      await showMainMenu(gameState);
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
//quiz starter
export async function startQuiz(gameState) {
    gameState.currentQuestionIndex = 0;
    gameState.score = 0;
    gameState.answers = [];
//timer while block
    const quizStartTime = Date.now();

    while (gameState.currentQuestionIndex < questions.length) {
        const elapsedTime = Date.now() - quizStartTime;
        const remainingQuizTime = 150000 - elapsedTime;

        if (elapsedTime >= 150000) {
            console.log(chalk.red("Time's up for the quiz!"));
            break;
        }
        const currentQuestion = questions[gameState.currentQuestionIndex];
        const userChoice = await askQuestion(
            currentQuestion,
            gameState.currentQuestionIndex + 1,
            30000,
            remainingQuizTime
        );
//timeout block
        if (userChoice === "quizTimeout") {
            console.log(chalk.red("Time's up for the quiz!"));
            break;
        }

        if (userChoice === "questionTimeout") {
            console.log(chalk.red("Time's up for this question."));
            gameState.answers.push({
            question: currentQuestion.question,
            userAnswer: "Timed out",
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: false,
        });
        gameState.currentQuestionIndex++;
        continue;
    }

        const isCorrect = userChoice === currentQuestion.correctAnswer;

        if (isCorrect) {
            gameState.score++;
            console.log(chalk.green("Correct!"));
        } else {
            console.log(chalk.red("Incorrect"));
        }
        gameState.answers.push({
            question: currentQuestion.question,
            userAnswer: userChoice,
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: isCorrect,
        });
        gameState.currentQuestionIndex++;
    }
    showFinalResults(gameState);
}
//question structure setup
export async function askQuestion(question, questionNumber, timeLimit, remainingQuizTime) {
    const effectiveTimeLimit = Math.min(timeLimit, remainingQuizTime);
    const questionPrompt = select({
        message: `Question ${questionNumber}: ${question.question}`,
        choices: question.choices.map((choice) => ({
            name: choice,
            value: choice,
        })),
    });
//timeout block
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            if (remainingQuizTime <= timeLimit) {
            resolve("quizTimeout");
            } else {
            resolve("questionTimeout");
            }
        }, effectiveTimeLimit);
    });

    const userChoice = await Promise.race([questionPrompt, timeoutPromise]);

    return userChoice;
}
//shows final results of quiz
export function showFinalResults(gameState) {
    console.log("");
    console.log("Quiz Complete!");
    console.log("");
    console.log(`Final Score: ${gameState.score} / ${questions.length}`);

    for (const answer of gameState.answers) {
        console.log(chalk.blue(`Question: ${answer.question}`));
        console.log("");
        console.log(`Your answer: ${answer.userAnswer}`);

        if (!answer.isCorrect) {
            console.log(chalk.green(`Correct answer: ${answer.correctAnswer}`));
            console.log("");
        }
    }
}
//displays current score
export function showScore(gameState) {
    console.log(`Current Score: ${gameState.score} / ${questions.length}`);
}
//allows for quiz mem to be reset manually by user
export function resetQuiz(gameState) {
    gameState.currentQuestionIndex = 0;
    gameState.score = 0;
    gameState.answers = [];
}