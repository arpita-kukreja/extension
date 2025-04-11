// Utility functions
function getTitle(element) {
  const titleEl = element.querySelector('#video-title, .ytd-video-name, h1.title') || 
                 element.querySelector('meta[name="title"]');
  return titleEl ? (titleEl.textContent || titleEl.content || '').toLowerCase() : '';
}

// Check if a title matches any keywords
function matchesKeywords(title, keywords) {
  return keywords.some(keyword => title.includes(keyword.toLowerCase()));
}

// Blur and block thumbnails
function blurThumbnail(element) {
  // Add blur effect
  element.style.filter = 'blur(10px)';
  
  // Add blocked overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  `;
  overlay.innerHTML = `<span style="color: white; font-family: sans-serif;">🔒 Blocked Content</span>`;
  
  // Make sure we only add overlay once
  if (!element.querySelector('.blocked-overlay')) {
    overlay.className = 'blocked-overlay';
    element.style.position = 'relative';
    element.appendChild(overlay);
  }
}

// Block an entire video page
function blockPage() {
  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #f9f9f9;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      z-index: 9999;
    ">
      <h1 style="color: red; font-family: sans-serif;">🔒 Blocked by Deretention Extension</h1>
      <p style="font-family: sans-serif;">This content contains blocked keywords.</p>
    </div>
  `;
}

// Process video elements and their containers
function processVideoElements(keywords) {
  // Handle video thumbnails on homepage, search, and recommendations
  const thumbnailContainers = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer');
  thumbnailContainers.forEach(container => {
    const title = getTitle(container);
    if (matchesKeywords(title, keywords)) {
      const thumbnail = container.querySelector('#thumbnail');
      if (thumbnail) {
        blurThumbnail(thumbnail);
      }
    }
  });

  // Handle current video page
  if (location.pathname === '/watch') {
    const mainTitle = getTitle(document);
    if (matchesKeywords(mainTitle, keywords)) {
      blockPage();
    }
  }

  // Handle Shorts
  if (location.pathname.startsWith('/shorts')) {
    const shortsTitle = document.title.toLowerCase();
    if (matchesKeywords(shortsTitle, keywords)) {
      blockPage();
    }
  }
}

// Main function to check and block content
function checkAndBlockContent() {
  chrome.storage.sync.get(['keywords', 'blockShorts', 'blockTitles'], (data) => {
    const { keywords = [], blockShorts = true, blockTitles = true } = data;
    if (!keywords.length) return;
    
    processVideoElements(keywords);
  });
}

// Initial check
checkAndBlockContent();

// Create a mutation observer to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  checkAndBlockContent();
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Recheck when navigation occurs (for YouTube's SPA navigation)
window.addEventListener('yt-navigate-finish', checkAndBlockContent);
