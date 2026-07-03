const soundSelect = document.getElementById("soundSelect");
const audioPlayer = document.getElementById("audioPlayer");
const statusText = document.getElementById("status");
const permissionButton = document.getElementById("permissionButton");

const soundDirectory = "sounds/";
const threshold = 15; // 振ったときの加速度閾値
const cooldownMs = 700;
let lastShakeTime = 0;
let listening = false;

function updateAudioSource() {
  const selectedFile = soundSelect.value;
  audioPlayer.src = soundDirectory + encodeURIComponent(selectedFile);
}

function setStatus(message) {
  statusText.textContent = message;
}

function handleMotion(event) {
  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) {
    return;
  }

  const x = acceleration.x || 0;
  const y = acceleration.y || 0;
  const z = acceleration.z || 0;
  const magnitude = Math.sqrt(x * x + y * y + z * z);

  if (magnitude > threshold) {
    const now = Date.now();
    if (now - lastShakeTime < cooldownMs) {
      return;
    }
    lastShakeTime = now;
    playSound();
  }
}

function playSound() {
  if (!audioPlayer.src) {
    updateAudioSource();
  }
  audioPlayer.currentTime = 0;
  audioPlayer.play().catch(() => {
    setStatus("音声再生を許可してください。画面をタップしてみてください。");
  });
}

function startListening() {
  if (listening) {
    return;
  }
  if (typeof DeviceMotionEvent === "undefined") {
    setStatus("この端末では振動検出が利用できません。");
    return;
  }

  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("devicemotion", handleMotion);
          listening = true;
          setStatus("振動検出が有効になりました。スマホを振ってください。");
        } else {
          setStatus("振動許可が拒否されました。");
        }
      })
      .catch(() => {
        setStatus("振動許可の取得に失敗しました。");
      });
  } else {
    window.addEventListener("devicemotion", handleMotion);
    listening = true;
    setStatus("振動検出が有効になりました。スマホを振ってください。");
  }
}

soundSelect.addEventListener("change", () => {
  updateAudioSource();
  setStatus(`${soundSelect.options[soundSelect.selectedIndex].text} を選択しました。スマホを振ると再生されます。');
});

permissionButton.addEventListener("click", () => {
  startListening();
});

updateAudioSource();
