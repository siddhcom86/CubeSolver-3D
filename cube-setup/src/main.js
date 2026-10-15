
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#191e2b');

// Camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(5, 5, 7);

const container = document.querySelector('#app');

container.innerHTML = `
    <header>
        <h1>CubeSolver 3D</h1>
        <p>Interactive Rubik's Cube</p>
    </header>

    <section id="cube-view"></section>

    
    <section class="controls">
        <h2>Rotate a Face</h2>

        <div class="buttons">
            <button data-move="R">R</button>
            <button data-move="R'">R'</button>
            <button data-move="R2">R2</button>

            <button data-move="L">L</button>
            <button data-move="L'">L'</button>
            <button data-move="L2">L2</button>

            <button data-move="U">U</button>
            <button data-move="U'">U'</button>
            <button data-move="U2">U2</button>

            <button data-move="D">D</button>
            <button data-move="D'">D'</button>
            <button data-move="D2">D2</button>

            <button data-move="F">F</button>
            <button data-move="F'">F'</button>
            <button data-move="F2">F2</button>

            <button data-move="B">B</button>
            <button data-move="B'">B'</button>
            <button data-move="B2">B2</button>
        </div>

        <p id="status">Select a move to rotate a face.</p>

<div class="timer-panel">
    <h2>⏱ Solve Timer</h2>

    <p id="timer-display">00:00.00</p>

    <div class="timer-buttons">
        <button id="timer-start-btn">Start</button>
        <button id="timer-stop-btn">Stop</button>
        <button id="timer-reset-btn">Reset Timer</button>
    </div>
</div>

        <div class="history-panel">
            <h2>Move History</h2>
            <p id="history">No moves yet</p>

            <button id="undo-btn">Undo Last Move</button>
            <button id="reset-history-btn">Clear History</button>
            <button id="reset-cube-btn">Reset Cube</button>
            <button id="scramble-btn">Scramble Cube</button>
        </div>
    </section>
<section class="notation-panel">
    <h2>📘 Move Notation Guide</h2>
    <p class="section-description">
        Learn how each button rotates the Rubik's Cube.
    </p>

    <div class="notation-grid">
        <div class="notation-card">
            <span class="notation-symbol">R</span>
            <h3>Right</h3>
            <p>Rotate the right face clockwise.</p>
        </div>

        <div class="notation-card">
            <span class="notation-symbol">L</span>
            <h3>Left</h3>
            <p>Rotate the left face clockwise.</p>
        </div>

        <div class="notation-card">
            <span class="notation-symbol">U</span>
            <h3>Up</h3>
            <p>Rotate the upper face clockwise.</p>
        </div>

        <div class="notation-card">
            <span class="notation-symbol">D</span>
            <h3>Down</h3>
            <p>Rotate the bottom face clockwise.</p>
        </div>

        <div class="notation-card">
            <span class="notation-symbol">F</span>
            <h3>Front</h3>
            <p>Rotate the front face clockwise.</p>
        </div>

        <div class="notation-card">
            <span class="notation-symbol">B</span>
            <h3>Back</h3>
            <p>Rotate the back face clockwise.</p>
        </div>
    </div>

    <div class="notation-notes">
        <p><strong>R'</strong> means an inverse (counterclockwise) turn.</p>
        <p><strong>R2</strong> means a half-turn (180 degrees).</p>
        <p>Clockwise is viewed while looking directly at the face being turned.</p>
    </div>
</section>

<section class="features-panel">
    <h2>✨ CubeSolver Features</h2>

    <div class="features-grid">
        <article class="feature-card">
            <span class="feature-icon">🧊</span>
            <h3>Interactive 3D</h3>
            <p>Rotate and explore your cube in a 3D environment.</p>
        </article>

        <article class="feature-card">
            <span class="feature-icon">↩️</span>
            <h3>Undo Moves</h3>
            <p>Reverse your latest move and review your history.</p>
        </article>

        <article class="feature-card">
            <span class="feature-icon">🔀</span>
            <h3>Random Scramble</h3>
            <p>Mix the cube with a sequence of random turns.</p>
        </article>

        <article class="feature-card">
            <span class="feature-icon">⏱️</span>
            <h3>Solve Timer</h3>
            <p>Track your solve practice with the built-in timer.</p>
        </article>
    </div>
</section>


`;

const cubeView = document.querySelector('#cube-view');
const status = document.querySelector('#status');
const historyElement = document.querySelector('#history');

const undoButton = document.querySelector('#undo-btn');
const clearHistoryButton = document.querySelector('#reset-history-btn');
const resetCubeButton = document.querySelector('#reset-cube-btn');
const scrambleButton = document.querySelector('#scramble-btn');
// Timer elements
const timerDisplay = document.querySelector('#timer-display');
const timerStartButton = document.querySelector('#timer-start-btn');
const timerStopButton = document.querySelector('#timer-stop-btn');
const timerResetButton = document.querySelector('#timer-reset-btn');

// Timer state
let timerInterval = null;
let elapsedMilliseconds = 0;
let timerStartedAt = 0;
let timerRunning = false;

const moveHistory = [];

let busy = false;
let sequenceRunning = false;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(cubeView.clientWidth, cubeView.clientHeight);
cubeView.appendChild(renderer.domElement);

// Mouse controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 2));

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 8, 10);
scene.add(light);

// Cube colors
const colors = {
    right: 0xff0000,
    left: 0xff8800,
    top: 0xffffff,
    bottom: 0xffff00,
    front: 0x00aa00,
    back: 0x0000ff
};

const cubelets = [];
const dark = 0x222222;

// Create each small cube
function createCubelet(x, y, z) {
    const materials = [
        new THREE.MeshStandardMaterial({
            color: x === 1 ? colors.right : dark
        }),
        new THREE.MeshStandardMaterial({
            color: x === -1 ? colors.left : dark
        }),
        new THREE.MeshStandardMaterial({
            color: y === 1 ? colors.top : dark
        }),
        new THREE.MeshStandardMaterial({
            color: y === -1 ? colors.bottom : dark
        }),
        new THREE.MeshStandardMaterial({
            color: z === 1 ? colors.front : dark
        }),
        new THREE.MeshStandardMaterial({
            color: z === -1 ? colors.back : dark
        })
    ];

    const cubelet = new THREE.Mesh(
        new THREE.BoxGeometry(0.96, 0.96, 0.96),
        materials
    );

    cubelet.position.set(x, y, z);
    cubelet.userData.home = { x, y, z };

    scene.add(cubelet);
    cubelets.push(cubelet);
}

// Build the 3 x 3 x 3 cube
for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            createCubelet(x, y, z);
        }
    }
}

// Face rotation definitions
const baseMoves = {
    R: { axis: 'x', layer: 1, angle: -Math.PI / 2 },
    L: { axis: 'x', layer: -1, angle: Math.PI / 2 },
    U: { axis: 'y', layer: 1, angle: -Math.PI / 2 },
    D: { axis: 'y', layer: -1, angle: Math.PI / 2 },
    F: { axis: 'z', layer: 1, angle: -Math.PI / 2 },
    B: { axis: 'z', layer: -1, angle: Math.PI / 2 }
};

// Update move history
function updateHistory() {
    historyElement.textContent = moveHistory.length
        ? moveHistory.join(' ')
        : 'No moves yet';

    undoButton.disabled =
        moveHistory.length === 0 || busy || sequenceRunning;
}

// Get inverse of a move
function inverseMove(move) {
    if (move.endsWith('2')) return move;
    if (move.endsWith("'")) return move[0];
    return move + "'";
}

// Rotate a face
function rotateFace(notation, recordMove = true) {
    if (busy) return Promise.resolve(false);

    const face = notation[0];
    const base = baseMoves[face];

    if (!base) return Promise.resolve(false);

    const multiplier = notation.endsWith('2')
        ? 2
        : notation.endsWith("'")
            ? -1
            : 1;

    const angle = base.angle * multiplier;

    busy = true;
    updateHistory();
    status.textContent = `Rotating ${notation}...`;

    const pivot = new THREE.Group();
    scene.add(pivot);

    const selected = cubelets.filter(cubelet =>
        Math.round(cubelet.position[base.axis]) === base.layer
    );

    selected.forEach(cubelet => pivot.attach(cubelet));

    const start = performance.now();
    const duration = 300;

    return new Promise(resolve => {
        function animateTurn(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            pivot.rotation[base.axis] = angle * eased;

            if (progress < 1) {
                requestAnimationFrame(animateTurn);
                return;
            }

            selected.forEach(cubelet => {
                scene.attach(cubelet);

                cubelet.position.set(
                    Math.round(cubelet.position.x),
                    Math.round(cubelet.position.y),
                    Math.round(cubelet.position.z)
                );

                cubelet.rotation.set(
                    Math.round(cubelet.rotation.x / (Math.PI / 2)) *
                        Math.PI / 2,
                    Math.round(cubelet.rotation.y / (Math.PI / 2)) *
                        Math.PI / 2,
                    Math.round(cubelet.rotation.z / (Math.PI / 2)) *
                        Math.PI / 2
                );
            });

            scene.remove(pivot);

            if (recordMove) {
                moveHistory.push(notation);
            }

            busy = false;
            updateHistory();
            status.textContent = `Move ${notation} completed!`;

            resolve(true);
        }

        requestAnimationFrame(animateTurn);
    });
}

// Format time as MM:SS.CC
function formatTime(milliseconds) {
    const totalCentiseconds = Math.floor(milliseconds / 10);

    const minutes = Math.floor(totalCentiseconds / 6000);
    const seconds = Math.floor((totalCentiseconds % 6000) / 100);
    const centiseconds = totalCentiseconds % 100;

    return (
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0') + '.' +
        String(centiseconds).padStart(2, '0')
    );
}

// Update timer display
function updateTimerDisplay() {
    let currentTime = elapsedMilliseconds;

    if (timerRunning) {
        currentTime += performance.now() - timerStartedAt;
    }

    timerDisplay.textContent = formatTime(currentTime);
}

// Start timer
function startTimer() {
    if (timerRunning) return;

    timerStartedAt = performance.now();
    timerRunning = true;

    timerInterval = setInterval(updateTimerDisplay, 10);
    updateTimerDisplay();

    status.textContent = 'Solve timer started!';
}

// Stop timer
function stopTimer() {
    if (!timerRunning) return;

    elapsedMilliseconds += performance.now() - timerStartedAt;
    timerRunning = false;

    clearInterval(timerInterval);
    timerInterval = null;

    updateTimerDisplay();
    status.textContent = 'Timer stopped!';
}

// Reset timer
function resetTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }

    timerInterval = null;
    timerRunning = false;
    elapsedMilliseconds = 0;
    timerStartedAt = 0;

    updateTimerDisplay();
    status.textContent = 'Timer reset to zero.';
}

// Timer button events
timerStartButton.addEventListener('click', startTimer);
timerStopButton.addEventListener('click', stopTimer);
timerResetButton.addEventListener('click', resetTimer);

// Manual move buttons
document.querySelectorAll('[data-move]').forEach(button => {
    button.addEventListener('click', () => {
        if (sequenceRunning) return;
        rotateFace(button.dataset.move);
    });
});

// Undo last move
undoButton.addEventListener('click', async () => {
    if (busy || sequenceRunning || moveHistory.length === 0) return;

    const lastMove = moveHistory.pop();
    updateHistory();

    await rotateFace(inverseMove(lastMove), false);
});

// Clear history
clearHistoryButton.addEventListener('click', () => {
    if (busy || sequenceRunning) return;

    moveHistory.length = 0;
    updateHistory();
    status.textContent = 'Move history cleared.';
});

// Reset cube
resetCubeButton.addEventListener('click', () => {
    if (busy || sequenceRunning) return;

    cubelets.forEach(cubelet => {
        const home = cubelet.userData.home;

        cubelet.position.set(home.x, home.y, home.z);
        cubelet.rotation.set(0, 0, 0);
    });

    moveHistory.length = 0;

    updateHistory();
    status.textContent = 'Cube reset to solved position!';
});

// Scramble cube with 15 random moves
async function scrambleCube() {
    if (busy || sequenceRunning) return;

    sequenceRunning = true;
    updateHistory();

    const moves = [
        'R', "R'", 'L', "L'",
        'U', "U'", 'D', "D'",
        'F', "F'", 'B', "B'"
    ];

    status.textContent = 'Scrambling cube...';

    try {
        for (let i = 0; i < 15; i++) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            await rotateFace(move);
        }

        status.textContent = 'Cube scrambled successfully!';
    } catch (error) {
        console.error(error);
        status.textContent = 'Scramble failed. Check the console.';
    } finally {
        sequenceRunning = false;
        updateHistory();
    }
}

scrambleButton.addEventListener('click', scrambleCube);

// Resize renderer
window.addEventListener('resize', () => {
    const width = cubeView.clientWidth;
    const height = cubeView.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

updateHistory();
animate();
