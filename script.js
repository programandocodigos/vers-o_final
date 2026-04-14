let model;
let correctCount = 0;
let wrongCount = 0;
let totalScore = 0;

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/oMDLwvijt/";

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewImg = document.getElementById('preview-image');
const resultArea = document.getElementById('result-area');
const labelPrediction = document.getElementById('label-prediction');
const confidenceBar = document.getElementById('confidence-bar');
const loadingOverlay = document.getElementById('loading-overlay');
const uploadContent = document.querySelector('.upload-content');

const btnCorrect = document.getElementById('btn-correct');
const btnWrong = document.getElementById('btn-wrong');
const countCorrectEl = document.getElementById('count-correct');
const countWrongEl = document.getElementById('count-wrong');
const totalScoreEl = document.getElementById('total-score');

// Load the Teachable Machine model
async function loadModel() {
    try {
        console.log('Loading Teachable Machine model...');
        const checkpointURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(checkpointURL, metadataURL);
        console.log('Model loaded.');
    } catch (error) {
        console.error('Error loading model:', error);
        labelPrediction.innerText = "Erro ao carregar IA";
    }
}

loadModel();

// Handle clicks and drag/drop
dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = 'var(--primary)';
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = 'var(--glass-border)';
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

async function handleFile(file) {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        previewImg.src = e.target.result;
        previewImg.hidden = false;
        uploadContent.hidden = true;
        await classifyImage();
    };
    reader.readAsDataURL(file);
}

async function classifyImage() {
    if (!model) return;

    loadingOverlay.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        const predictions = await model.predict(previewImg);
        
        let topResult = predictions[0];
        for (let i = 1; i < predictions.length; i++) {
            if (predictions[i].probability > topResult.probability) {
                topResult = predictions[i];
            }
        }

        const probability = (topResult.probability * 100).toFixed(1);
        let className = topResult.className;

        // Mapeamento das classes do Teachable Machine
        const classMap = {
            "Class 1": "Cachorro",
            "Class 2": "Gato",
            "class 1": "Cachorro",
            "class 2": "Gato",
            "cachorro": "Cachorro",
            "gato": "Gato"
        };

        let displayName = classMap[className] || className;

        let icon = "🧐";
        if (displayName.toLowerCase().includes("gato")) icon = "🐾";
        if (displayName.toLowerCase().includes("cachorro")) icon = "🐶";

        labelPrediction.innerText = `${icon} ${displayName}`;
        confidenceBar.style.width = `${probability}%`;
        
        loadingOverlay.classList.add('hidden');
        resultArea.classList.remove('hidden');

    } catch (error) {
        console.error("Erro na classificação:", error);
        loadingOverlay.classList.add('hidden');
    }
}

// User Feedback (Restaurado para +10 e -10)
btnCorrect.addEventListener('click', () => {
    correctCount++;
    totalScore += 10;
    updateStats();
    resetUI();
});

btnWrong.addEventListener('click', () => {
    wrongCount++;
    totalScore -= 10;
    updateStats();
    resetUI();
});

function updateStats() {
    countCorrectEl.innerText = correctCount;
    countWrongEl.innerText = wrongCount;
    totalScoreEl.innerText = totalScore;
    
    totalScoreEl.style.transform = "scale(1.2)";
    setTimeout(() => {
        totalScoreEl.style.transform = "scale(1)";
    }, 200);
}

function resetUI() {
    setTimeout(() => {
        previewImg.hidden = true;
        uploadContent.hidden = false;
        resultArea.classList.add('hidden');
        previewImg.src = "";
    }, 1500);
}
