const loginSection = document.getElementById("loginSection");
const sosSection = document.getElementById("sosSection");
const sosBtn = document.getElementById("sosBtn");
const stopBtn = document.getElementById("stopBtn");
const alertBox = document.getElementById("alertBox");
const callButtons = document.querySelectorAll(".callBtn");

let watchID = null;
let sosActive = false;

// ============ Login Logic ============
document.getElementById("loginBtn").addEventListener("click", () => {
    const user = document.getElementById("username").value;
    const pin = document.getElementById("passcode").value;

    if (user && pin) {
        loginSection.style.display = "none";
        sosSection.style.display = "block";
        sendSOS(`System activated for ${user}`);
        startVoiceRecognition(); // Start listening after login
    } else {
        alert("Enter Name and PIN to continue");
    }
});

// ============ SOS Logic ============
function sendSOS(message, lat = null, lon = null) {
    let locationLink = "";
    if (lat && lon) {
        locationLink = `<br><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" style="color: #00ff00;">📍 View Location</a>`;
    }
    const time = new Date().toLocaleTimeString();
    alertBox.innerHTML = `<div>[${time}] 🚨 ${message}${locationLink}</div>` + alertBox.innerHTML;
}

function startLocationTracking(message) {
    if (sosActive) return;
    sosActive = true;

    if (!navigator.geolocation) {
        sendSOS("Location not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        sendSOS(message, pos.coords.latitude, pos.coords.longitude);
        watchID = navigator.geolocation.watchPosition(p => {
            sendSOS("Location Updated", p.coords.latitude, p.coords.longitude);
        });
    });
}

sosBtn.addEventListener("click", () => {
    startLocationTracking("SOS Button Pressed");
    triggerEmergencyCall();
});

stopBtn.addEventListener("click", () => {
    if (watchID) navigator.geolocation.clearWatch(watchID);
    sosActive = false;
    sendSOS("SOS Stopped by User");
});

function triggerEmergencyCall() {
    const number = callButtons[0].dataset.number;
    window.location.href = `tel:${number}`;
}

callButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.href = `tel:${btn.dataset.number}`;
    });
});

// ============ Voice Detection ============
function startVoiceRecognition() {
    if ("webkitSpeechRecognition" in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.onresult = e => {
            const text = e.results[e.results.length - 1][0].transcript.toLowerCase();
            if (text.includes("help")) {
                startLocationTracking("Voice: HELP Detected");
                triggerEmergencyCall();
            }
        };
        recognition.start();
    }
}

// ============ Shake Detection ============
let lastShake = 0;
window.addEventListener("devicemotion", e => {
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);

    if (mag > 25 && Date.now() - lastShake > 5000) {
        lastShake = Date.now();
        startLocationTracking("Shake Detected");
        triggerEmergencyCall();
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => location.reload());
