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

// Carrega o modelo com sistema anti-cache
async function loadModel() {
    try {
        console.log('Iniciando o carregamento do modelo TM...');
        const timestamp = new Date().getTime();
        const checkpointURL = MODEL_URL + "model.json?v=" + timestamp;
        const metadataURL = MODEL_URL + "metadata.json?v=" + timestamp;

        model = await tmImage.load(checkpointURL, metadataURL);
        console.log('Modelo carregado com sucesso!');
    } catch (error) {
        console.error('Erro ao carregar o modelo:', error);
        labelPrediction.innerText = "Erro na conexão com Teachable Machine";
    }
}

loadModel();

// Eventos de Upload
dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.style.borderColor = 'var(--primary)'; });
dropArea.addEventListener('dragleave', () => { dropArea.style.borderColor = 'var(--glass-border)'; });
dropArea.addEventListener('drop', (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });

async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
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
    if (!model) return alert("IA carregando...");
    
    loadingOverlay.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        const predictions = await model.predict(previewImg);
        
        // Encontra o melhor resultado
        let topIndex = 0;
        let highestProb = 0;
        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i].probability > highestProb) {
                highestProb = predictions[i].probability;
                topIndex = i;
            }
        }

        const topResult = predictions[topIndex];
        const probPct = (topResult.probability * 100).toFixed(0);
        const rawName = topResult.className.toLowerCase();

        // LÓGICA INFALÍVEL: Tenta por Nome, se falhar usa o Index (0=Cachorro, 1=Gato)
        let displayName = "Desconhecido";
        let icon = "🧐";

        if (rawName.includes("gato") || topIndex === 1) {
            displayName = "Gato";
            icon = "🐾";
        } else if (rawName.includes("cacho") || topIndex === 0) {
            displayName = "Cachorro";
            icon = "🐶";
        }

        labelPrediction.innerText = `${icon} ${displayName} (${probPct}%)`;
        confidenceBar.style.width = `${probPct}%`;
        
        loadingOverlay.classList.add('hidden');
        resultArea.classList.remove('hidden');
        console.log("Resultado final:", displayName, probPct + "%");

    } catch (error) {
        console.error("Erro na classificação:", error);
        loadingOverlay.classList.add('hidden');
    }
}

// Sistema de Pontuação atualizado para +1 e -1
btnCorrect.addEventListener('click', () => {
    correctCount++;
    totalScore += 1;
    updateStats();
    resetUI();
});

btnWrong.addEventListener('click', () => {
    wrongCount++;
    totalScore -= 1;
    updateStats();
    resetUI();
});

function updateStats() {
    countCorrectEl.innerText = correctCount;
    countWrongEl.innerText = wrongCount;
    totalScoreEl.innerText = totalScore;
    totalScoreEl.style.transform = "scale(1.3)";
    setTimeout(() => { totalScoreEl.style.transform = "scale(1)"; }, 200);
}

function resetUI() {
    setTimeout(() => {
        previewImg.hidden = true;
        uploadContent.hidden = false;
        resultArea.classList.add('hidden');
    }, 1200);
}
