function getVideoElement() {
    const videoContainer = document.querySelector('.video-js');
    if (!videoContainer) return null;
    return videoContainer.querySelector('video');
}

let hidden = false;

function togglePlayerUI() {
    hidden = !hidden;

    // Inject blur style if not already injected
    const style = document.createElement('style');
    style.textContent = `.blurred { filter: blur(6px); cursor: default; }`;
    document.head.appendChild(style);

    // Apply or remove blur effect
    document.querySelectorAll('span.leading-runtime-line-height.tracking-runtime-letter-spacing')
      .forEach(el => {
        if (hidden) {
          el.classList.add('blurred');
        } else {
          el.classList.remove('blurred');
        }
      });

    // Hide or show UI elements based on 'hidden' state
    const selectors = [
        '.vjs-progress-control',
        '.vjs-time-control',
        '.vjs-remaining-time',
    ];

    selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
            console.log(hidden)
            el.style.display = hidden ? 'none' : '';
        });
    });
}

function changeVideoTime(seconds, event) {
    const video = getVideoElement();
    if (!video) return;

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    video.currentTime += seconds;
    refocusVideo(); 
}

// MutationObserver to check if the player and its elements are fully loaded
const observer = new MutationObserver((mutationsList, observer) => {
    const videoElement = getVideoElement();
    const progressControl = document.querySelector('.vjs-progress-control');

    // Check if both the video element and progress control are present
    if (videoElement && progressControl) {
        console.log('Player and UI elements are ready');
        observer.disconnect(); // Stop observing once the elements are ready
        togglePlayerUI(); // Call your toggle function when the elements are loaded
    }
});

// Start observing the body for changes
observer.observe(document.body, {
    childList: true,
    subtree: true
});


// This ensures that the player UI elements will be hidden/blurred when the page is fully loaded
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
            changeVideoTime(-10, event);
            break;
        case "ArrowLeft":
            changeVideoTime(-5, event);
            break;

        case "KeyL":
            changeVideoTime(10, event);
            break;
        case "ArrowRight":
            changeVideoTime(5, event);
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
            togglePlayerUI();
            break;
    }
}

window.addEventListener("keydown", handleKeydown, true);

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

// Add a listener for the page load event to ensure everything is ready
window.addEventListener("load", () => {
    setTimeout(() => {
        refocusVideo();
        togglePlayerUI();
    }, 500);
});
