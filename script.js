let gazePointer;
let inputField;
let messages;
let sendBtn;
let cameraStatus;
let calibrationTab;
let chatTab;
let calibrationMode;
let chatMode;
let lastWinkTime = 0;
const winkThreshold = 500; // ウィンクの閾値（ミリ秒）

window.onload = function() {
    gazePointer = document.getElementById('gazePointer');
    inputField = document.getElementById('inputField');
    messages = document.getElementById('messages');
    sendBtn = document.getElementById('sendBtn');
    cameraStatus = document.getElementById('cameraStatus');
    calibrationTab = document.getElementById('calibrationTab');
    chatTab = document.getElementById('chatTab');
    yesNoTab=document.getElementById('yesNoTab');
    calibrationMode = document.getElementById('calibrationMode');
    chatMode = document.getElementById('chatMode');
    yesNoMode=document.getElementById('yesNoMode');

    setupTabs();
    setupWebGazer();
    setupKanaButtons();
    setupSendButton();
};

function setupTabs() {
    calibrationTab.addEventListener('click', () => switchMode('calibration'));
    chatTab.addEventListener('click', () => switchMode('chat'));
    yesNoTab.addEventListener('click', () => switchMode('yesno'));
}

function switchMode(mode) {
    if (mode === 'calibration') {
        calibrationTab.classList.add('active');
        chatTab.classList.remove('active');
        yesNoTab.classList.remove('active');
        calibrationMode.classList.add('active');
        chatMode.classList.remove('active');
        yesNoMode.classList.remove('active');
        webgazer.showVideoPreview(true).showPredictionPoints(true);
    } else if (mode ==="chat") {
        calibrationTab.classList.remove('active');
        chatTab.classList.add('active');
        yesNoTab.classList.remove('active');
        calibrationMode.classList.remove('active');
        chatMode.classList.add('active');
        yesNoMode.classList.remove('active');
        webgazer.showVideoPreview(false).showPredictionPoints(false);
    }else if(mode === "yesno"){
        calibrationTab.classList.remove('active');
        chatTab.classList.remove('active');
        yesNoTab.classList.add('active');
        calibrationMode.classList.add('active');
        chatMode.classList.remove('active');
        yesNoMode.classList.add('active');
        webgazer.showVideoPreview(false).showPredictionPoints(false);
    }
}

function setupWebGazer() {
    cameraStatus.textContent = "カメラ起動中...";
    
    webgazer.params.showVideo = true;
    webgazer.params.showFaceOverlay = true;
    webgazer.params.showFaceFeedbackBox = true;
    
    webgazer.setGazeListener(handleGaze)
        .begin()
        .then(() => {
            cameraStatus.textContent = "カメラ起動成功";
            webgazer.showVideoPreview(true).showPredictionPoints(true);
            const video = document.querySelector('#webgazerVideoFeed');
            if (video) {
                video.style.display = 'block';
                video.style.position = 'absolute';
                video.style.top = '0px';
                video.style.left = '0px';
                video.style.width = '100%';
                video.style.height = '100%';
                document.querySelector('#cameraFeed').appendChild(video);
            }
        })
        .catch(error => {
            console.error("WebGazer初期化エラー:", error);
            cameraStatus.textContent = "カメラ起動失敗";
        });
}

function handleGaze(data, elapsedTime) {
    if (data == null) return;
    
    gazePointer.style.left = data.x + 'px';
    gazePointer.style.top = data.y + 'px';

    // ウィンク検出
    if (data.eyeFeatures && (data.eyeFeatures.left.blink === 1 || data.eyeFeatures.right.blink === 1)) {
        const currentTime = new Date().getTime();
        if (currentTime - lastWinkTime > winkThreshold) {
            handleWink(data.x, data.y);
            lastWinkTime = currentTime;
        }
    }
}

function handleWink(x, y) {
    const element = document.elementFromPoint(x, y);
    if (element && element.classList.contains('kana-btn')) {
        inputField.value += element.textContent;
    }
}

function setupKanaButtons() {
    const buttons = document.querySelectorAll('.kana-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            inputField.value += btn.textContent;
        });
    });
}

function setupSendButton() {
    sendBtn.addEventListener('click', () => {
        if (inputField.value.trim() !== '') {
            const message = document.createElement('p');
            message.textContent = inputField.value;
            messages.appendChild(message);
            inputField.value = '';
            messages.scrollTop = messages.scrollHeight;
        }
    });
}