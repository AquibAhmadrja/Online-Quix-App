// script.js

// Hardcoded Password 
const TEACHER_PASSWORD = "capstone"; 

// 1. HardCoded Questions
const DEFAULT_QUESTIONS = [
    {
        q: "What is the capital of France?",
        a: ["London", "Berlin", "Paris", "Madrid"],
        c: 2 
    },
    {
        q: "The currency of Japan is the &yen;?",
        a: ["Dollar", "Yen", "Euro", "Pound"],
        c: 1
    },
    {
        q: "Which element is the standard for web page structure?",
        a: ["CSS", "JavaScript", "HTML5", "Python"],
        c: 2
    }
];

let QUIZ_QUESTIONS = [...DEFAULT_QUESTIONS];

let currentQuestionIndex = 0;
let scoreCount = 0;
let isQuestionAnswered = false;

const elements = {
    questionArea: document.getElementById('questionArea'),
    resultScreen: document.getElementById('resultScreen'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    nextBtn: document.getElementById('nextBtn'),
    finalScore: document.getElementById('finalScore'),
    totalQuestions: document.getElementById('totalQuestions'),
    quizContainer: document.getElementById('quizContainer'),
    
    // New Elements for Teacher Control
    jsonFileInput: document.getElementById('jsonFile'),
    questionCountDisplay: document.getElementById('questionCountDisplay'),
    teacherLoginBtn: document.getElementById('teacherLoginBtn'),
    teacherPanel: document.getElementById('teacherPanel'),
    loginFeedback: document.getElementById('loginFeedback')
};

// *** Utility Function for Data Cleaning ***
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// 4. Core Logic Functions

function updateQuestionCountDisplay(count) {
    elements.questionCountDisplay.textContent = `Questions loaded: ${count}`;
}

function startQuiz() {
    // Reset State
    currentQuestionIndex = 0;
    scoreCount = 0;
    isQuestionAnswered = false;

    elements.totalQuestions.textContent = QUIZ_QUESTIONS.length;

    elements.questionArea.classList.remove('screen--hidden');
    elements.resultScreen.classList.add('screen--hidden');
    elements.nextBtn.classList.add('btn--hidden');
    
    if (QUIZ_QUESTIONS.length > 0) {
        loadQuestion();
    } else {
        elements.questionText.textContent = "No questions loaded. Please ask an instructor to upload a JSON file.";
        elements.optionsContainer.innerHTML = '';
    }
}

function loadQuestion() {
    const currentQ = QUIZ_QUESTIONS[currentQuestionIndex];
    isQuestionAnswered = false;
    elements.nextBtn.classList.add('btn--hidden');
    elements.optionsContainer.innerHTML = ''; 
    
    elements.questionText.textContent = `Question ${currentQuestionIndex + 1}: ${decodeHTML(currentQ.q)}`;
    
    currentQ.a.forEach((optionText, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = decodeHTML(optionText);
        button.dataset.index = index;
        elements.optionsContainer.appendChild(button);
    });
}

function handleOptionSelect(event) {
    if (!event.target.classList.contains('option-btn') || isQuestionAnswered) {
        return;
    }
    
    isQuestionAnswered = true;
    const selectedBtn = event.target;
    const selectedIndex = parseInt(selectedBtn.dataset.index);
    const correctIndex = QUIZ_QUESTIONS[currentQuestionIndex].c;
    const isCorrect = (selectedIndex === correctIndex);

    if (isCorrect) {
        scoreCount++;
    }

    selectedBtn.classList.add(isCorrect ? 'option-btn--correct' : 'option-btn--incorrect');
    
    if (!isCorrect) {
        const correctButton = elements.optionsContainer.querySelector(`[data-index="${correctIndex}"]`);
        if (correctButton) {
            correctButton.classList.add('option-btn--correct');
        }
    }
    
    elements.optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.add('option-btn--disabled');
    });

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
        elements.nextBtn.classList.remove('btn--hidden');
    } else {
        setTimeout(endQuiz, 1000);
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

function endQuiz() {
    const totalQ = QUIZ_QUESTIONS.length;
    
    elements.finalScore.textContent = scoreCount;
    elements.totalQuestions.textContent = totalQ;
    
    elements.questionArea.classList.add('screen--hidden');
    elements.nextBtn.classList.add('btn--hidden');
    elements.resultScreen.classList.remove('screen--hidden');
}


// 5. Teacher Control Logic

function handleTeacherLogin() {
    const enteredPassword = prompt("Enter Teacher Password to access controls:");
    
    if (enteredPassword === TEACHER_PASSWORD) {
        // Success: Show controls
        elements.teacherPanel.style.display = 'block';
        elements.teacherLoginBtn.style.display = 'none';
        elements.loginFeedback.textContent = "Controls unlocked.";
        elements.loginFeedback.style.color = 'var(--color-success)';
    } else if (enteredPassword !== null) {
        // Failure: Show student message
        elements.loginFeedback.textContent = "Incorrect Password. Students are not permitted here.";
        elements.loginFeedback.style.color = 'var(--color-error)';
        elements.teacherPanel.style.display = 'none';
    }
    // If enteredPassword is null (user clicked Cancel), do nothing.
}

function importQuestions(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (Array.isArray(importedData) && importedData.length > 0 && importedData[0].q && importedData[0].a && typeof importedData[0].c === 'number') {
                QUIZ_QUESTIONS = importedData;
                updateQuestionCountDisplay(QUIZ_QUESTIONS.length);
                alert(`Successfully loaded ${QUIZ_QUESTIONS.length} questions! Click 'Start New Quiz' to begin.`);
                
                // Automatically restart to load new questions
                startQuiz();
            } else {
                alert('Invalid JSON format. Please ensure the format is an array of objects with "q", "a", and "c" properties.');
            }
        } catch (error) {
            alert('Error parsing JSON file. Please check the file contents.');
            console.error('JSON Import Error:', error);
        }
    };

    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial display update
    updateQuestionCountDisplay(QUIZ_QUESTIONS.length);
    startQuiz();
});

elements.optionsContainer.addEventListener('click', handleOptionSelect);

elements.quizContainer.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (action === 'next') {
        nextQuestion();
    } else if (action === 'restart') {
        startQuiz();
    } else if (action === 'login') {
        handleTeacherLogin();
    }
});

elements.jsonFileInput.addEventListener('change', importQuestions);