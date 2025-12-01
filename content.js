function getVideoElement() {
    const videoContainer = document.querySelector('.video-js');
    if (!videoContainer) return null;
    return videoContainer.querySelector('video');
}

let hidden = false;
let overlayVisible = false;
let contentData = [];

fetch(chrome.runtime.getURL('keymap_overlay.json'))
    .then(response => response.json())
    .then(data => contentData = data)
    .catch(console.error);

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

function toggleOverlay() {
    overlayVisible = !overlayVisible;
    let overlay = document.getElementById('vbtv-custom-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'vbtv-custom-overlay';
        
        const dataToRender = contentData.length > 0 ? contentData : [{ key: "Loading...", action: "Data not yet loaded." }];

        let htmlContent = `
            <div style="display: grid; grid-template-columns: auto auto; column-gap: 20px; row-gap: 10px; align-items: baseline;">
        `;

        dataToRender.forEach(item => {
            htmlContent += `
                <div style="text-align: right; font-weight: bold; color: #FFD700;">${item.key}</div>
                <div style="text-align: left;">${item.action}</div>
            `;
        });

        htmlContent += `</div>`;
        overlay.innerHTML = htmlContent;
        
        overlay.style.position = 'absolute';
        overlay.style.top = '20%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, 0)';
        overlay.style.color = 'white';
        overlay.style.fontSize = '1.2em';
        overlay.style.zIndex = '9999';
        overlay.style.textShadow = '1px 1px 2px black';
        overlay.style.pointerEvents = 'none';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        overlay.style.padding = '20px';
        overlay.style.borderRadius = '8px';
        overlay.style.display = 'none';
        
        const videoContainer = document.querySelector('.video-js');
        if (videoContainer) videoContainer.appendChild(overlay);
        else document.body.appendChild(overlay);
    }
    overlay.style.display = overlayVisible ? 'block' : 'none';
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

        case "Backquote": // The ` key
            event.preventDefault();
            toggleOverlay();
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
