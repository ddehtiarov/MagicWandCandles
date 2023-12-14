let lastX;
let rotation = 0;


function checkCollisionAndAddFlame() {
    const cap = document.querySelector('.cap'); // Get the cap element
    const candles = document.querySelectorAll('.candle-body');

    candles.forEach(candle => {
        if (!candle.querySelector('.candle-flames')) { // Check if the candle has no flame
            const capRect = cap.getBoundingClientRect();
            const candleRect = candle.getBoundingClientRect();

            // Check for collision
            if (capRect.left < candleRect.right &&
                capRect.right > candleRect.left &&
                capRect.top < candleRect.bottom &&
                capRect.bottom > candleRect.top) {

                // Collision detected, add a flame
                const flame = document.createElement('div');
                flame.className = 'candle-flames';
                candle.appendChild(flame);
            }
        }
    });
}


document.addEventListener('mousemove', function (e) {
    const wand = document.getElementById('wand');

    // Calculate the direction of movement
    if (lastX !== undefined) {
        const deltaX = e.pageX - lastX;
        rotation += deltaX * 0.05; // Adjust the 0.1 value to control the rotation sensitivity
    }
    lastX = e.pageX;

    // Update the position of the wand
    wand.style.left = e.pageX + 'px';
    wand.style.top = e.pageY + 'px';

    // Rotate the wand
    wand.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

    checkCollisionAndAddFlame();
});

function removeCandleIfColliding(cap, candle) {
    const capRect = cap.getBoundingClientRect();
    const candleRect = candle.getBoundingClientRect();

    if (capRect.left < candleRect.right &&
        capRect.right > candleRect.left &&
        capRect.top < candleRect.bottom &&
        capRect.bottom > candleRect.top) {

        candle.remove();
        return true;
    }
    return false;
}

document.addEventListener('click', function (e) {
    const cap = document.querySelector('.cap'); // Get the cap element
    const candles = document.querySelectorAll('.candle-body');
    let removed = false;

    candles.forEach(candle => {
        if (removeCandleIfColliding(cap, candle)) {
            removed = true;
        }
    });

    if (removed) {
        return;
    }

    const capRect = cap.getBoundingClientRect(); // Get the position of the cap

    const candle = document.createElement('div');
    candle.className = 'candle-body';
    candle.innerHTML = '<div class="candle-stick"></div><div class="candle-flames"></div>';

    // Position the candle where the cap is
    candle.style.left = (window.scrollX + capRect.left) + 'px';
    candle.style.top = (window.scrollY + capRect.top) + 'px';

    document.body.appendChild(candle);


});

function removeRandomCandleFlame() {
    const candles = document.querySelectorAll('.candle-body');
    if (candles.length > 0) {
        const randomIndex = Math.floor(Math.random() * candles.length);
        const selectedCandle = candles[randomIndex];
        const flame = selectedCandle.querySelector('.candle-flames');
        if (flame) {
            selectedCandle.removeChild(flame);
        }
    }
}

function handleAudioStream(stream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let blowingThreshold = 10;
    let maxBlowingThreshold = 15;
    let thresholdDuration = 1500;
    let blowStartTime = null;

    function analyze() {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        let count = 0;
        const lowFreqRange = {start: 0, end: bufferLength * 0.15};

        for (let i = lowFreqRange.start; i < lowFreqRange.end; i++) {
            sum += dataArray[i];
            count++;
        }

        let average = sum / count;

        if (average > blowingThreshold && blowingThreshold < maxBlowingThreshold) {
            if (!blowStartTime) {
                blowStartTime = new Date().getTime();
            } else {
                let blowDuration = new Date().getTime() - blowStartTime;
                if (blowDuration > thresholdDuration) {
                    removeHalfCandles(blowDuration);
                    blowStartTime = null;
                }
            }
        } else {
            blowStartTime = null;
        }
    }

    setInterval(analyze, 100);
}

function blowCandles() {
    // Logic to 'blow out' candles
    // For example, hide the candle flames or change their appearance
    const candles = document.querySelectorAll('.candle');
    candles.forEach(candle => {
        // Example: Hide the candle flame
        candle.style.backgroundColor = 'grey'; // Change as needed
    });
}

function removeHalfCandles(duration) {
    const candles = document.querySelectorAll('.candle-body');

    let count = candles.length;

    if (duration < 2000) {
        count = Math.floor(count * 0.25);
    } else if (duration < 3000) {
        count = Math.floor(count * 0.5);
    } else if (duration < 4000) {
        count = Math.floor(count * 0.75);
    }
    for (let i = 0; i < count; i++) {
        removeRandomCandleFlame();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // setInterval(removeRandomCandleFlame, 10000);
    navigator.mediaDevices.getUserMedia({audio: true, video: false})
        .then(handleAudioStream)
        .catch(error => {
            console.error('Microphone access denied:', error);
        });
});