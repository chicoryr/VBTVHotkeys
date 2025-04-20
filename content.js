function getVideoElement() {
    const videoContainer = document.querySelector('.video-js');
    if (!videoContainer) return null;
    return videoContainer.querySelector('video');
}
let hidden = false;


function createToggleButton() {
    if (document.getElementById('hide-ui-btn')) return;
    const container = document.querySelector('.video-js');
    if (!container) return;

    const button = document.createElement('button');
    button.id = 'hide-ui-btn';
    button.textContent = '🧹';
    button.title = 'Toggle progress/time display (or press H)';
    Object.assign(button.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        fontSize: '16px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 8px',
        cursor: 'pointer',
    });

    let hidden = false;

    const toggle = () => {
        hidden = !hidden;
        togglePlayerUI(hidden);
        button.style.opacity = hidden ? 0.4 : 1;
    };

    button.onclick = toggle;
    container.style.position = 'relative';
    container.appendChild(button);
}


function togglePlayerUI(hidden) {
    const selectors = [
        '.vjs-progress-control',
        '.vjs-time-control',
        '.vjs-remaining-time',
    ];

    selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
            el.style.display = hidden ? 'none' : '';
        });
    });
}


function handleKeydown(event) {
    const video = getVideoElement();
    if (!video) return;

    const tag = document.activeElement.tagName.toLowerCase();
    const isTyping = tag === 'input' || tag === 'textarea' || document.activeElement.isContentEditable;
    if (isTyping) return;

    const step = 1 / 50; // For 50fps frame stepping

    switch (event.code) {
        case "KeyK":
        case "Space":
            event.preventDefault();
            event.stopPropagation();
            video.paused ? video.play() : video.pause();
            break;

        case "KeyJ":
        case "ArrowLeft":
            event.preventDefault();
            event.stopPropagation();
            video.currentTime -= (event.code === "KeyJ" ? 10 : 5);
            break;

        case "KeyL":
        case "ArrowRight":
            event.preventDefault();
            event.stopPropagation();
            video.currentTime += (event.code === "KeyL" ? 10 : 5);
            break;

        case "KeyM":
            event.preventDefault();
            event.stopPropagation();
            video.muted = !video.muted;
            break;

        case "KeyF":
            event.preventDefault();
            event.stopPropagation();
            const videoWrapper = video.closest('.video-js');
            if (!document.fullscreenElement) {
                videoWrapper?.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
            break;

        case "Comma": // Slow down
            event.preventDefault();
            video.playbackRate = Math.max(0.1, video.playbackRate - 0.1);
            break;

        case "Period": // Speed up
            event.preventDefault();
            video.playbackRate = Math.min(4, video.playbackRate + 0.1);
            break;

        case "Digit0": case "Digit1": case "Digit2": case "Digit3": case "Digit4":
        case "Digit5": case "Digit6": case "Digit7": case "Digit8": case "Digit9":
            const percent = parseInt(event.code.replace("Digit", ""), 10);
            video.currentTime = video.duration * (percent / 10);
            break;

        case "KeyN": // Frame-by-frame (only when paused)
            if (video.paused) {
                video.currentTime += step;
            }
            break;

        case "KeyC": // Captions toggle
            const player = video?.player || videoContainer?.player;
            if (player && player.textTracks && player.textTracks.length) {
                const track = player.textTracks[0];
                track.mode = track.mode === "showing" ? "hidden" : "showing";
            }
            break;
        case "KeyH":
            event.preventDefault();
            hidden = !hidden;
            togglePlayerUI(hidden);
            break;

    }
}

window.addEventListener("keydown", handleKeydown, true);
createToggleButton();

function refocusVideo() {
    const video = getVideoElement();
    if (video) video.focus();
}

document.addEventListener("fullscreenchange", () => {
    setTimeout(refocusVideo, 100);
});

document.addEventListener("click", (e) => {
    if (e.target.closest("button")) {
        setTimeout(refocusVideo, 100);
    }
});

window.addEventListener("load", () => {
    setTimeout(refocusVideo, 500);
});


