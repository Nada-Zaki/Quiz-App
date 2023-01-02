// Select Elements
let startContainer = document.querySelector(".start");
let quizAppContainer = document.querySelector(".quiz-app");
let categoryBtn = document.querySelector(".category-btn");
let categorySpan = document.querySelector(".quiz-info .category span");
let countSpan = document.querySelector(".quiz-info .count span");
let bulletsSpans = document.querySelector(".bullets .spans");
let bulletsContainer = document.querySelector(".bullets");
let quizArea = document.querySelector(".quiz-area");
let answersArea = document.querySelector(".answers-area");
let submitBtn = document.querySelector(".submit-btn");
let resultContainer = document.querySelector(".results");
let countDownDiv = document.querySelector(".countdown");


// Set Initial Values
let currentIndex = 0;
let rightAnswers = 0;
let answersNumber = 4;
let duration = 5;
let questionsCount;
let category;
let countDownInterval;
let data = [];

quizAppContainer.style.display="none";

categoryBtn.addEventListener("click", () => {
  let categoryAnswers = document.getElementsByName("category");
  for(let answer of categoryAnswers) {
    answer.checked ? category = answer.dataset.answer: null;
  }
  
  // Get The Questions Data
  let myRequest = new XMLHttpRequest();
  myRequest.onreadystatechange = () => {
    if (myRequest.readyState === 4 && myRequest.status === 200) {  
        let questionsObj = JSON.parse(myRequest.responseText);
        for(let key in questionsObj) {
          data.push({
            id:key,
            title:questionsObj[key].title,
            answer_1:questionsObj[key].answer_1,
            answer_2:questionsObj[key].answer_2,
            answer_3:questionsObj[key].answer_3,
            answer_4:questionsObj[key].answer_4,
            right_answer:questionsObj[key].right_answer
          })
        }
        questionsCount = data.length;

        startContainer.remove();
        quizAppContainer.style.display="block";
        resultContainer.style.display="none";
        
        createBullets();
        addQuestions(data[currentIndex]);
        handleCountDown(duration);

        submitBtn.addEventListener("click", () => {
          let rightAnswer = data[currentIndex].right_answer;
          checkAnswer(rightAnswer);

          // Remove Previous Question And Answer
          quizArea.innerHTML = "";
          answersArea.innerHTML = "";

          // Increase Questions Index
          currentIndex++;

          addQuestions(data[currentIndex]);
          handleBullets();

          // Restart Count Down
          clearInterval(countDownInterval);
          handleCountDown(duration);

          // Show The Result When The Quiz Is Finished
          showResult();
        })
    }  
  }
  myRequest.open("GET", `https://quiz-app-js-84cf7-default-rtdb.europe-west1.firebasedatabase.app/${category}.json`);
  myRequest.send();
});



const createBullets = () => {
  countSpan.innerHTML = questionsCount;
  categorySpan.innerHTML = category;

  for(let i=0; i<questionsCount; i++) {
    let bullet = document.createElement("span");
    i===0 ? bullet.className = "on" : null;
    bulletsSpans.appendChild(bullet);
  }
}

const addQuestions = (obj) => {
  if(currentIndex < questionsCount) {
    let questionTitle = document.createElement("h2");
    let questionText = document.createTextNode(obj.title);

    questionTitle.appendChild(questionText);
    quizArea.appendChild(questionTitle);

    // Shuffle The Answers
    shuffledIndices = [1,2,3,4].sort(() => Math.random()-0.5);
    
    // Render The Shuffled Answers 
    for(let i of shuffledIndices) {
      let mainDiv = document.createElement("div");
      mainDiv.className = "answer";
      radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.id = `answer_${i}`;
      radioInput.name = "answer";
      radioInput.dataset.answer = obj[`answer_${i}`];
      
      // Make First Option Selected
      shuffledIndices.indexOf(i)===0 ? radioInput.checked = true : null;
      
      label = document.createElement("label");
      label.htmlFor = `answer_${i}`;
      labelText = document.createTextNode(obj[`answer_${i}`]);
      label.appendChild(labelText);
      mainDiv.appendChild(radioInput);
      mainDiv.appendChild(label);
      answersArea.appendChild(mainDiv);
    }
  }
}

const checkAnswer = (rightAnswer) => {
  let answers = document.getElementsByName("answer");
  let chosenAnswer;
  for(let answer of answers) {
    answer.checked ? chosenAnswer = answer.dataset.answer : null;
  }
  chosenAnswer === rightAnswer ? rightAnswers++ : null;
}

const handleBullets = () => {
  let bullets = Array.from(document.querySelectorAll(".bullets .spans span"));
  for(let i=0;i<bullets.length;i++) {
    i === currentIndex ? bullets[i].className = "on" : null;
  }
}

const showResult = () => {
  let span = document.createElement("span");
  let textSpan;
  if(currentIndex === questionsCount) {
    resultContainer.style.display="block";
    quizArea.remove();
    answersArea.remove();
    submitBtn.remove();
    bulletsContainer.remove();
    
    if(rightAnswers===questionsCount) {
      span.className = "excellent";
      textSpan = document.createTextNode("Excellent");
    }
    else if(rightAnswers > questionsCount/2 && rightAnswers < questionsCount) {
      span.className = "good";
      textSpan = document.createTextNode("Good");
    }
    else {
      span.className = "bad";
      textSpan = document.createTextNode("Bad");
    }

    let textContainer = document.createElement("div");
    span.appendChild(textSpan)
    textContainer.appendChild(span);
    textContainer.append(`! You Answered ${rightAnswers} from ${questionsCount}`);
    resultContainer.appendChild(textContainer);

    let restartBtn = document.createElement("button");
    restartBtn.innerHTML = "Restart";
    restartBtn.className = "category-btn";
    resultContainer.appendChild(restartBtn);

    restartBtn.addEventListener("click", () => {
      location.reload();
    })
  }
}

const handleCountDown = (duration) => {
  if(currentIndex < questionsCount) {
    let minutes,seconds;
    countDownInterval = setInterval(() => {
      minutes = parseInt(duration / 60);
      seconds = parseInt(duration % 60);

      minutes = minutes<10 ? `0${minutes}` : minutes;
      seconds = seconds<10 ? `0${seconds}` : seconds;

      countDownDiv.innerHTML = `${minutes}:${seconds}`;

      if(--duration < 0) {
        clearInterval(countDownInterval);
        submitBtn.click();
      }
    },1000)
  }
}