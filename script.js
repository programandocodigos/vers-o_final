let model;
let correctCount = 0;
let wrongCount = 0;

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

// Load the model on start
async function loadModel() {
    try {
        console.log('Loading model...');
        model = await mobilenet.load();
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
        alert("A IA ainda está carregando, por favor aguarde um segundo.");
        return;
    }

    loadingOverlay.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        // AI Prediction
        const predictions = await model.classify(previewImg);
        
        // MobileNet returns multiple results. We look for the top one.
        const topResult = predictions[0];
        const label = topResult.className.toLowerCase();
        const probability = (topResult.probability * 100).toFixed(1);

        // Simple check to identify if it's a cat or dog (MobileNet labels are specific breeds)
        let displayLabel = "Não identifiquei gato ou cachorro";
        if (label.includes('cat') || label.includes('kitten')) {
            displayLabel = "🐾 É um Gato!";
        } else if (label.includes('dog') || label.includes('puppy') || label.includes('terrier') || label.includes('retriever')) {
            displayLabel = "🐶 É um Cachorro!";
        } else {
            // Fallback to the top object identified
            displayLabel = `Parece ser: ${topResult.className.split(',')[0]}`;
        }

        labelPrediction.innerText = displayLabel;
        confidenceBar.style.width = `${probability}%`;
        
        loadingOverlay.classList.add('hidden');
        resultArea.classList.remove('hidden');

    } catch (error) {
        console.error("Erro na classificação:", error);
        loadingOverlay.classList.add('hidden');
        alert("Houve um erro ao analisar a imagem.");
    }
}

// User Feedback
btnCorrect.addEventListener('click', () => {
    correctCount++;
    updateStats();
    resetUI();
});

btnWrong.addEventListener('click', () => {
    wrongCount++;
    updateStats();
    resetUI();
});

function updateStats() {
    countCorrectEl.innerText = correctCount;
    countWrongEl.innerText = wrongCount;
}

function resetUI() {
    setTimeout(() => {
        previewImg.hidden = true;
        uploadContent.hidden = false;
        resultArea.classList.add('hidden');
        previewImg.src = "";
    }, 500);
}
