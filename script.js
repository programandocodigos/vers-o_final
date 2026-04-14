let model;
let correctCount = 0;
let wrongCount = 0;
let totalScore = 0;

// LINK FINAL DO USUÁRIO
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/oMDLwvijt/";

const previewImg = document.getElementById('preview-image');
const labelPrediction = document.getElementById('label-prediction');
const confidenceBar = document.getElementById('confidence-bar');
const loadingOverlay = document.getElementById('loading-overlay');
const resultArea = document.getElementById('result-area');
const totalScoreEl = document.getElementById('total-score');
const countCorrectEl = document.getElementById('count-correct');
const countWrongEl = document.getElementById('count-wrong');

// Carrega o modelo
async function init() {
    try {
        const checkpointURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";
        model = await tmImage.load(checkpointURL, metadataURL);
        console.log("IA PRONTA (v5.0)");
    } catch (e) {
        console.error(e);
        labelPrediction.innerText = "Erro ao carregar IA";
    }
}
init();

// Upload e Drag-and-Drop
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const uploadContent = document.querySelector('.upload-content');

dropArea.onclick = () => fileInput.click();
fileInput.onchange = (e) => handleFile(e.target.files[0]);
dropArea.ondragover = (e) => { e.preventDefault(); dropArea.style.borderColor = "#6366f1"; };
dropArea.ondragleave = () => { dropArea.style.borderColor = "rgba(255,255,255,0.1)"; };
dropArea.ondrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        previewImg.src = e.target.result;
        previewImg.hidden = false;
        uploadContent.hidden = true;
        await classify();
    };
    reader.readAsDataURL(file);
}

// O JULGAMENTO (Função Corrigida)
async function classify() {
    if (!model) return;
    loadingOverlay.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        const predictions = await model.predict(previewImg);
        console.log("Previsões brutas da IA:", predictions);

        // Encontra o vencedor real comparando as probabilidades
        let winner = predictions[0];
        for (let i = 1; i < predictions.length; i++) {
            if (predictions[i].probability > winner.probability) {
                winner = predictions[i];
            }
        }

        const name = winner.className.toLowerCase();
        const score = (winner.probability * 100).toFixed(0);

        // Mapeamento à prova de falhas
        let display = "Desconhecido";
        let icon = "🧐";

        // Se o nome contiver 'gato', 'cat' ou 'class 2', é Gato
        if (name.includes("gato") || name.includes("cat") || name.includes("2")) {
            display = "Gato";
            icon = "🐾";
        } 
        // Se o nome contiver 'cacho', 'dog' ou 'class 1', é Cachorro
        else if (name.includes("cacho") || name.includes("dog") || name.includes("1")) {
            display = "Cachorro";
            icon = "🐶";
        } else {
            // Se não bater com nada, usa o nome original que você deu no TM
            display = winner.className;
        }

        labelPrediction.innerText = `${icon} ${display} (${score}%)`;
        confidenceBar.style.width = score + "%";
        
        loadingOverlay.classList.add('hidden');
        resultArea.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        loadingOverlay.classList.add('hidden');
    }
}

// FEEDBACK E PONTOS (+1 e -1)
document.getElementById('btn-correct').onclick = () => {
    correctCount++;
    totalScore += 1;
    refreshUI();
};

document.getElementById('btn-wrong').onclick = () => {
    wrongCount++;
    totalScore -= 1;
    refreshUI();
};

function refreshUI() {
    countCorrectEl.innerText = correctCount;
    countWrongEl.innerText = wrongCount;
    totalScoreEl.innerText = totalScore;
    
    // Reset para próxima foto
    setTimeout(() => {
        previewImg.hidden = true;
        uploadContent.hidden = false;
        resultArea.classList.add('hidden');
    }, 1000);
}
