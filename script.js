//
// Utils
//

/*
 * Randomize array in-place using Durstenfeld shuffle algorithm
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function setVisibility(el, isVisible) {
  if (isVisible)
    el.classList.remove("hidden")
  else
    el.classList.add("hidden")
}

function setDisabled(el, isDisabled) {
  if (isDisabled)
    el.classList.add("disabled")
  else
    el.classList.remove("disabled")
}

//
// General usage globals
//

const homeScreen = document.querySelector("#homeScreen")
const quizScreen = document.querySelector("#quizScreen")
const resultScreen = document.querySelector("#resultScreen")

const questionDb = []

var questionsSession = []

var currentQuestion = 0
var score = 0

//
// Homescreen
//

const btnStart = document.querySelector("#btnStart")

function onClickSelQuestions(numberOfQuestions) {
  btnStart.innerText = `Iniciar (${numberOfQuestions} perguntas)`
  shuffleArray(questionDb)
  questionsSession = []
  for (let i = 0; i < numberOfQuestions; i++) {
    questionsSession.push(questionDb[i])
  }
}

function onClickStart(el) {
  onClickSelQuestions(30)
  btnStart.innerText = "Iniciar"
  setVisibility(homeScreen, false)
  setVisibility(quizScreen, true)
  currentQuestion = 0
  newQuestion()
}

//
// Quiz section
//

var currQuestion = null
var selectedOption = null

const btnCheckAnswer = document.querySelector("#btnCheckAnswer")
const btnNextQuestion = document.querySelector("#btnNextQuestion")

const quizTitle = document.querySelector("#quizTitle")
const quizQuestion = document.querySelector("#quizQuestion")
const quizImage = document.querySelector("#quizImage")

const optA = document.querySelector("#optionA")
const optB = document.querySelector("#optionB")
const optC = document.querySelector("#optionC")
const optD = document.querySelector("#optionD")

const quizResult = document.querySelector("#quizResult")

function newQuestion() {
  currQuestion = questionsSession[currentQuestion]
  quizTitle.innerText = `Questão ${currentQuestion + 1}/${questionsSession.length}`
  quizQuestion.innerText = currQuestion.question
  setVisibility(quizImage, false)

  shuffleArray(currQuestion.options)

  optA.answer = currQuestion.options[0]
  optA.innerText = optA.answer.text

  optB.answer = currQuestion.options[1]
  optB.innerText = optB.answer.text

  optC.answer = currQuestion.options[2]
  optC.innerText = optC.answer.text

  optD.answer = currQuestion.options[3]
  optD.innerText = optD.answer.text

  if (currQuestion.image == null)
    return

  setVisibility(quizImage, true)
  quizImage.src = currQuestion.image
  quizImage.setAttribute('onclick', `window.open("${currQuestion.image}")`)
}

function onSubmitQuestion(el) {
  for (opt of document.querySelectorAll(".option")) {
    if (opt.answer.correct === true) {
      opt.classList.add('right')
      opt.innerText = "✅ " + opt.innerText
      if (opt.classList.value.includes("selected")) {
        questionsSession[currentQuestion].hasAnsweredCorrectly = true
      }
    } else {
      opt.innerText = "❌ " + opt.innerText
      opt.style.opacity = 0.4
    }
    setDisabled(opt, true)
    opt.disabled = true
  }

  setVisibility(btnCheckAnswer, false)
  setVisibility(btnNextQuestion, true)

  if (questionsSession[currentQuestion].hasAnsweredCorrectly != true) {
    quizResult.innerText = "Errou, mais sorte na próxima."
    return
  }

  quizResult.innerText = "Acertou, parabéns!"
}

function onClickNextQuestion(el) {
  currentQuestion += 1
  for (opt of document.querySelectorAll(".option")) {
    opt.classList.remove('selected');
    opt.classList.remove('wrong');
    opt.classList.remove('right');
    opt.style.opacity = 1
    setDisabled(opt, false)
  }
  setVisibility(btnNextQuestion, false)
  quizResult.innerText = ""
  if (questionsSession.length == currentQuestion) {
    onDone()
    return
  }
  newQuestion()
}

function onClickOption(el, selected) {
  for (opt of document.querySelectorAll(".option"))
    opt.classList.remove('selected');
  el.classList.add('selected');
  setVisibility(btnCheckAnswer, true)
  selectedOption = selected
}

//
// Result section
//

const resultTitle = document.querySelector("#resultTitle")
const resultDesc = document.querySelector("#resultDesc")
const btnReset = document.querySelector("#btnReset")

function onDone() {
  setVisibility(quizScreen, false)
  setVisibility(resultScreen, true)
  resultTitle.innerText = "Questionário finalizado"
  const correctAnswers =
    questionsSession.flatMap((q) => (q.hasAnsweredCorrectly == null ? [] : 1))
      .reduce((a, i) => a + i, 0)
  resultDesc.innerText =
    `Você acertou ${correctAnswers} de ${questionsSession.length} perguntas.`
  setVisibility(btnReset, true)
}

function onClickReset() {
  setVisibility(btnReset, false)
  setVisibility(quizScreen, false)
  setVisibility(resultScreen, false)
  setVisibility(homeScreen, true)
}

//

async function getQuestions() {
  const url = "./questions.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    for (item of json.questions) {
      questionDb.push(item)
    }
  } catch (error) {
    console.error(error.message);
  }
}

getQuestions()
