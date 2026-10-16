/* =========================================================
   Student Guide — interactivity
   Reuses the real frame images from ../assets/img/<prompt>/
   File names look like:  <seed>_<guidance>_<step>.jpg
   e.g. 1_7.0_30.jpg  = seed 1, guidance 7.0, cleanup step 30
   ========================================================= */

const TOTAL_STEPS = 50;
const FIXED_SEED = 1;
const FIXED_GUIDANCE = "7.0";

/* Build the path to one frame. Folder names contain spaces,
   so we URL-encode the prompt for the browser. */
function frameUrl(promptText, guidance, stepNumber) {
    const folder = encodeURIComponent(promptText);
    return `assets/img/${folder}/${FIXED_SEED}_${guidance}_${stepNumber}.jpg`;
}

/* ---------- The star interactive: static → picture ---------- */

const denoiseImage = document.getElementById("denoise-img");
const denoiseSlider = document.getElementById("denoise-slider");
const denoiseCaption = document.getElementById("denoise-caption");
const stepBadge = document.getElementById("step-badge");
const playButton = document.getElementById("play-btn");
const promptButtons = document.querySelectorAll(".chip-btn");

let currentPrompt = "a cute panda playing the guitar";
let currentSubject = "cute panda playing the guitar";

/* A friendly caption for roughly where we are in the cleanup. */
function captionForStep(stepNumber) {
    const percent = stepNumber / TOTAL_STEPS;
    if (stepNumber === 0) {
        return "Pure random static — the AI hasn't done anything yet.";
    } else if (percent < 0.25) {
        return "Just getting started. Faint blobs of color are appearing out of the noise.";
    } else if (percent < 0.55) {
        return "Shapes are forming! You can start to guess what it's becoming.";
    } else if (percent < 0.85) {
        return `Almost there — a ${currentSubject} is clearly taking shape.`;
    } else if (stepNumber < TOTAL_STEPS) {
        return "Final touches: sharpening the details and cleaning up the last bits of noise.";
    }
    return `Done! A finished ${currentSubject}, cleaned up from pure static. 🎉`;
}

function showStep(stepNumber) {
    denoiseImage.src = frameUrl(currentPrompt, FIXED_GUIDANCE, stepNumber);
    stepBadge.textContent = `Step ${stepNumber} of ${TOTAL_STEPS}`;
    denoiseCaption.textContent = captionForStep(stepNumber);
}

/* Preload every frame for the current prompt so dragging is smooth. */
function preloadCurrentPrompt() {
    for (let stepNumber = 0; stepNumber <= TOTAL_STEPS; stepNumber++) {
        const preloader = new Image();
        preloader.src = frameUrl(currentPrompt, FIXED_GUIDANCE, stepNumber);
    }
}

denoiseSlider.addEventListener("input", () => {
    stopPlaying();
    showStep(Number(denoiseSlider.value));
});

/* ---------- Play / pause animation ---------- */

let playTimer = null;

function stopPlaying() {
    if (playTimer !== null) {
        clearInterval(playTimer);
        playTimer = null;
        playButton.textContent = "▶ Play";
    }
}

function startPlaying() {
    // If we're already at the end, rewind before playing.
    if (Number(denoiseSlider.value) >= TOTAL_STEPS) {
        denoiseSlider.value = 0;
        showStep(0);
    }
    playButton.textContent = "❚❚ Pause";
    playTimer = setInterval(() => {
        let nextStep = Number(denoiseSlider.value) + 1;
        if (nextStep > TOTAL_STEPS) {
            stopPlaying();
            return;
        }
        denoiseSlider.value = nextStep;
        showStep(nextStep);
    }, 90);
}

playButton.addEventListener("click", () => {
    if (playTimer !== null) {
        stopPlaying();
    } else {
        startPlaying();
    }
});

/* ---------- Prompt picker ---------- */

promptButtons.forEach((button) => {
    button.addEventListener("click", () => {
        stopPlaying();
        promptButtons.forEach((other) => other.classList.remove("is-active"));
        button.classList.add("is-active");

        currentPrompt = button.dataset.prompt;
        currentSubject = button.dataset.label;

        denoiseSlider.value = 0;
        showStep(0);
        preloadCurrentPrompt();
    });
});

/* ---------- Guidance comparison (same panda, different "listening") ---------- */

const GUIDANCE_PROMPT = "a cute panda playing the guitar";
document.querySelectorAll(".gs-img").forEach((image) => {
    const guidanceValue = image.dataset.gs;
    image.src = frameUrl(GUIDANCE_PROMPT, guidanceValue, TOTAL_STEPS);
});

/* ---------- Tokenizing demo ---------- */

const tokenInput = document.getElementById("token-input");
const tokenButton = document.getElementById("token-btn");
const tokenOutput = document.getElementById("token-output");

function chopIntoTokens() {
    const words = tokenInput.value.trim().split(/\s+/).filter(Boolean);
    const pieces = ["<start>", ...words, "<end>"];

    const chips = pieces.map((piece, index) => {
        const chip = document.createElement("span");
        chip.className = "token-chip";
        if (piece === "<start>" || piece === "<end>") {
            chip.classList.add("marker");
        }
        chip.textContent = piece;
        chip.style.animationDelay = `${index * 0.05}s`;
        return chip;
    });

    tokenOutput.replaceChildren(...chips);
}

tokenButton.addEventListener("click", chopIntoTokens);
tokenInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") chopIntoTokens();
});

/* ---------- Kick everything off ---------- */

showStep(0);
preloadCurrentPrompt();
chopIntoTokens();
