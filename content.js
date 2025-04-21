function getVideoElement() {
    const videoContainer = document.querySelector('.video-js');
    if (!videoContainer) return null;
    return videoContainer.querySelector('video');
}
let hidden = false;

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

function changeVideoTime(amount, event) {
    event.preventDefault();
    event.stopPropagation();
    video.currentTime += amount;
}
function handleKeydown(event) {
    const video = getVideoElement();
    if (!video) return;

    const tag = document.activeElement.tagName.toLowerCase();
    const isTyping = tag === 'input' || tag === 'textarea' || document.activeElement.isContentEditable;
    if (isTyping) return;

    const step = 1 / 50;

    switch (event.code) {
        case "KeyK":
        case "Space":
            event.preventDefault();
            event.stopPropagation();
            video.paused ? video.play() : video.pause();
            break;

        case "KeyJ":
            changeVideoTime(-10)
            break;
        case "ArrowLeft":
            changeVideoTime(-5)
            break;

        case "KeyL":
            changeVideoTime(10)
            break;
        case "ArrowRight":
            changeVideoTime(5)
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

        case "Comma":
            event.preventDefault();
            video.playbackRate = Math.max(0.1, video.playbackRate - 0.1);
            break;

        case "Period":
            event.preventDefault();
            video.playbackRate = Math.min(4, video.playbackRate + 0.1);
            break;
        case "Slash":
            event.preventDefault();
            video.playbackRate = 1;
            break;
        case "KeyB":
            if (video.paused) {
                video.currentTime -= step;
            }
            break;
        case "KeyN":
            if (video.paused) {
                video.currentTime += step;
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


