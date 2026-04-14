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
        console.log('Model loaded. Classes:', model.getTotalClasses());
    } catch (error) {
        console.error('Error loading model:', error);
        labelPrediction.innerText = "Erro ao carregar o modelo TM";
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

    // Show preview
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
    if (!model) {
        alert("O modelo ainda está carregando.");
        return;
    }

    loadingOverlay.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        // Teachable Machine Prediction
        const predictions = await model.predict(previewImg);
        
        // Find the class with the highest probability
        let topResult = predictions[0];
        for (let i = 1; i < predictions.length; i++) {
            if (predictions[i].probability > topResult.probability) {
                topResult = predictions[i];
            }
        }

        const probability = (topResult.probability * 100).toFixed(1);
        let className = topResult.className;

        // Mapeamento das classes do Teachable Machine (Normalizado)
        const classMap = {
            "class 1": "Cachorro",
            "class 2": "Gato",
            "class1": "Cachorro",
            "class2": "Gato",
            "cachorro": "Cachorro",
            "gato": "Gato"
        };

        // Normalização simples: remove espaços extras e passa para minúsculo
        let normalizedKey = className.trim().toLowerCase();
        let displayName = classMap[normalizedKey] || className;

        // Emoji mapping
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
        alert("Erro ao analisar imagem.");
    }
}

// User Feedback
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
    
    // Animação simples no placar
    totalScoreEl.style.transform = "scale(1.2)";
    setTimeout(() => {
        totalScoreEl.style.transform = "scale(1)";
    }, 200);
}

function resetUI() {
    // Pequeno delay para o usuário ver o resultado antes de limpar
    setTimeout(() => {
        previewImg.hidden = true;
        uploadContent.hidden = false;
        resultArea.classList.add('hidden');
        previewImg.src = "";
    }, 1500); // Aumentado para 1.5s para facilitar a visualização do acerto/erro
}
