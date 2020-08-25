
let errorMessageShown = false;

// -------------------- MODEL -------------------------------------

// ------------- Constructor function for Question -------
function Question(id) {
  this.id = id;
  this.correctAnswer = '';
  this.selectedAnswer = '';
}

Question.prototype.answerIsCorrect = function() {
  if(this.selectedAnswer === this.correctAnswer) {
    return true;
  }
  else {
    return false;
  }
};

// ---------- Creating 10 question objects -----------------

let questionObjects = [];

for(let i = 0; i < 10; i++) {
  questionObjects[i] = new Question;
}

// ------------- Function parsing JSON ------------------
function parseJSON(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
    return parsed;
  }
  catch {
    console.error('Invalid JSON string.');
  }
}

function decodeHTML(html) {
  var txt = document.createElement('textarea');
	txt.innerHTML = html;
	return txt.value;
}

// -------------------- Function shuffling array ---------------------------
function shuffle(array) {

	let currentIndex = array.length;
	let temporaryValue;
  let randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex > 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
};

// ------ Function checking which answer that was selected ------------------
function getSelectedAnswer(questionId) {
  let querySelector = '#' + questionId + ' input';
  let arrayOfInputs = document.querySelectorAll(querySelector);
  for(let input of arrayOfInputs) {
    if(input.checked) {
      return input.value;
    }
  }
  return false;
}

// -------- Function checking how many answers that were correct -----------
// ---- *Showing an error message if all questions were not answered* -----------
function checkAnswers() {

  let countCorrectAnswers = 0;

  //Fetching the selected answers
  for(let i = 0; i < 10; i++) {

    //Creating variables
    let questionId = 'question' + (i + 1);
    let selectedAnswer = getSelectedAnswer(questionId);

    //If no radio button was chosen, show an error message and throw an error
    if(selectedAnswer === false) {
      if(errorMessageShown === false) {
        showErrorMessage();
        errorMessageShown = true;
      }
      throw new Error('All questions are not answered.');
      break;
    }

    //Adding the selected answer to the question object
    questionObjects[i].selectedAnswer = selectedAnswer;
  }

  //If there is an error text, but the user has now answered all questions...
  //...Remove the error message
  if(errorMessageShown) {
    removeErrorMessage();
    errorMessageShown = false;
  }

  //Checking how many answers that were correct
  for(let i = 0; i < questionObjects.length; i++) {
    let questionObject = questionObjects[i];
    //console.log('questionObject: ', questionObject);
    let correct = questionObject.answerIsCorrect();
    if (correct) {
      countCorrectAnswers++;
    }
  }

  return countCorrectAnswers;
}

// ------------ Function disabling all input elements + submit button ------
function disableFormElements() {
  //Making all input elements disabled
  let inputArray = document.querySelectorAll('form input'); // *All input elements in the form
  for(let input of inputArray) {
    input.setAttribute('disabled', true);
  }

  //Making the submit button disabled
  let submitButton = document.querySelector('#submit-button');
  submitButton.setAttribute('disabled', true);
}

// ------------ Function reactivating all input elements + submit button ------
function reactivateFormElements() {
  //Removing 'disabled' attribute from all input elements
  let inputArray = document.querySelectorAll('form input');
  for(let input of inputArray) {
    input.removeAttribute('disabled');
  }

  //Removing 'disabled' attribute from the submit button
  let submitButton = document.querySelector('#submit-button');
  submitButton.removeAttribute('disabled', 'false');
}

// -------------------------- VIEW ------------------------------------------

//Finding elements
let main = document.querySelector('main');

// --------------------- Function clearing main --------------------------------
function clearView() {
  while(main.firstChild){
    main.removeChild(main.firstChild);
  }
}

// ------------------- Function rendering start page ------------------------
function renderIndexPage() {
  //Styling content in main
  main.style.justifyContent = 'center';
  main.style.alignItems = 'center';

  //Creating button
  let button = document.createElement('button');
  button.classList.add('mdc-button');
  button.id = 'start-button';
  main.appendChild(button);

  //Creating span element in the button
  let span = document.createElement('span');
  span.textContent = 'Start quiz';
  span.classList.add('mdc-button__label');
  button.appendChild(span);

  //Listening to the button
  button.addEventListener('click', onClickStartQuiz);
}

// ------------------- Function rendering quiz page ----------------------
function renderQuizPage() {
  //Styling content in main
  main.style.justifyContent = 'flex-start';
  main.style.alignItems = 'flex-start';

  //Creating header
  let h2 = document.createElement('h2');
  h2.textContent = 'Quiz ' + quizNr;
  main.appendChild(h2);

  // Making GET request
  let request = new XMLHttpRequest();
  request.addEventListener('load', function() {
    new Promise((resolve, reject) => {
      if(this.status >= 200 && this.status < 300) {
        resolve(this.responseText);
      }
    })
    //Parsing JSON
    .then(parseJSON)
    .then(function(data){
      //Creating variables
      let question = '';
      let questionNr = 1;
      let parsedQuestion = '';
      let choiceNr;
      let object;
      let radioButtonId;
      let parser = new DOMParser();

      //Finding the array with question objects
      let questionData = data.results;

      //Creating a form element
      //Also, listening to submit event
      let form = document.createElement('form');
      form.addEventListener('submit', onSubmitCheckAnswers);
      main.appendChild(form);

      for (let i = 0; i < questionData.length; i++) {
        //Re-naming questionData[i]
        object = questionData[i];

        //Setting choiceNr to 1
        choiceNr = 1;

        //Creating an object of the question
        //Adding correct answer
        questionObjects[i].correctAnswer = questionData[i].correct_answer;
        questionObjects[i].id = questionNr;

        //Creating a container for the question and answers
        let container = document.createElement('div');
        container.id = 'question' + questionNr;
        container.classList.add('question-container');
        form.appendChild(container);

        //Creating a container for the question header (the question number and the question itself)
        let questionHeader = document.createElement('div');
        questionHeader.classList.add('question-header');
        container.appendChild(questionHeader);

        //Adding question number
        let numberParagraph = document.createElement('p');
        numberParagraph.textContent = questionNr;
        questionHeader.appendChild(numberParagraph);

        //Adding the question itself
        let questionParagraph = document.createElement('p');
        questionParagraph.innerHTML = object.question;
        questionHeader.appendChild(questionParagraph);

        //Creating an array to contain all answers
        let answers = [];

        //Adding the correct answer to the array
        answers.push(object.correct_answer);

        //Adding the wrong answers to the array
        for (let answer of object.incorrect_answers) {
          answers.push(answer);
        }

        //Shuffling the answers
        let shuffledAnswers = shuffle(answers.slice());

        //Creating radio buttons
        for(let answer of shuffledAnswers) {

          let formField = document.createElement('div');
          formField.classList.add('mdc-form-field');
          container.appendChild(formField);

          let radioButton = document.createElement('div');
          radioButton.classList.add('mdc-radio');
          formField.appendChild(radioButton);

          let input = document.createElement('input');
          input.classList.add('mdc-radio__native-control');
          input.setAttribute('type', 'radio');
          input.setAttribute('name', 'question ' + questionNr);
          input.setAttribute('value', answer);
          inputId = 'question' + questionNr + '_choice' + choiceNr;
          input.setAttribute('id', inputId);
          radioButton.appendChild(input);

          let background = document.createElement('div');
          background.classList.add('mdc-radio__background');
          radioButton.appendChild(background);

          let outerCircle = document.createElement('div');
          outerCircle.classList.add('mdc-radio__outer-circle');
          background.appendChild(outerCircle);

          let innerCircle = document.createElement('div');
          innerCircle.classList.add('mdc-radio__inner-circle');
          background.appendChild(innerCircle);

          let label = document.createElement('label');
          label.setAttribute('for', inputId);
          label.innerHTML = answer;
          formField.appendChild(label);

          let lineBreak = document.createElement('br');
          container.appendChild(lineBreak);

          choiceNr++;
        }

        //Updating question number
        questionNr++;
      }

      //Creating a submit button
      let submitButton = document.createElement('button');
      submitButton.setAttribute('type', 'submit');
      submitButton.classList.add('mdc-button');
      submitButton.classList.add('mdc-button--raised');
      submitButton.id = 'submit-button';
      form.appendChild(submitButton);

      let span = document.createElement('span');
      span.textContent = 'Submit';
      span.classList.add('mdc-button__label');
      submitButton.appendChild(span);
    })
  });
  request.open('GET', 'https://opentdb.com/api.php?amount=10&type=multiple');
  request.send();
}

// ------------------ Function showing error message ------------------------
function showErrorMessage() {

  //Finding elements
  let form = document.querySelector('form');

  //Creating error message
  let errorMessage = document.createElement('p');
  errorMessage.classList.add('error-message');
  errorMessage.textContent = 'You have not answered all questions.';
  form.appendChild(errorMessage);

  //Scrolling down
  errorMessage.scrollIntoView(false);
}

// ------------ Function removing error message -----------------------------
function removeErrorMessage() {
  let form = document.querySelector('form');
  let errorMessage = document.querySelector('.error-message');
  form.removeChild(errorMessage);
}

function showCorrectAnswers() {
  for(let i = 0; i < 10; i++) {
    //Creating variables
    let questionObject = questionObjects[i];
    let querySelector = '#question' + questionObject.id + ' label';
    let arrayOfLabels = document.querySelectorAll(querySelector);
    let correctAnswer = decodeHTML(questionObject.correctAnswer); // Decode to avoid things like &quote in string
    for(let label of arrayOfLabels) {
      console.log(label.textContent);
      if(label.textContent === correctAnswer) {
        label.classList.add('correct');
        break;
      }
    }
  }
}

// -------------------------- CONTROLLER ------------------------------------------

//Setting quiz nr to 1
let quizNr = 1;

// ----------------  Calling renderIndexPage -----------------------------
renderIndexPage();

// -------------- Function clearing view and rendering quiz page -----------
function onClickStartQuiz() {
  clearView();
  renderQuizPage();
}

// ------------------ Listening to buttons in the dialog --------------------

  //Scrolling to the top
  //html.scrollTop = 0;

  //Making form elements interactable again
  //reactivateFormElements();

  //If yes was chosen
  // if(event.detail.action === 'new-quiz') {
  //   quizNr++;
  //   clearView();
  //   renderQuizPage();
  // }
  //If no was chosen
  // else {
  //   quizNr = 1;
  //   clearView();
  //   renderIndexPage();
  // }

// ---- Function checking answers and showing dialog -------
function onSubmitCheckAnswers(event) {

  //Preventing the form being sent
  event.preventDefault();

  //Counting correct answers
  let countCorrectAnswers = checkAnswers();

  //Highlight the correct answers
  showCorrectAnswers();

  //Making it impossible to interact with any element in the form
  //disableFormElements();

  //Disable submit button
  let submitButton = document.querySelector('#submit-button');
  submitButton.disabled = true;

  // Showing result message
  let resultMessage = document.querySelector('#result-message');
  let resultMessageContainer = document.querySelector('#result-message__container');
  resultMessage.textContent = 'You answered ' + countCorrectAnswers + ' of 10 questions correctly. Play again?';
  resultMessageContainer.classList.remove('hidden');
  resultMessageContainer.scrollIntoView(false);
}
