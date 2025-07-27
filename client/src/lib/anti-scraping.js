// Client-side anti-scraping protection
class AntiScrapingProtection {
  constructor() {
    this.suspiciousPatterns = [
      'selenium',
      'puppeteer',
      'playwright',
      'headless',
      'automated',
      'bot',
      'crawler',
      'scraper',
      'python',
      'curl',
      'wget'
    ];
    
    // Only enable in production or when explicitly enabled
    this.isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('localhost');
    
    if (!this.isDevelopment) {
      this.init();
    } else {
      console.log('🛡️ Anti-scraping protection disabled for development');
    }
  }

  init() {
    this.detectAutomation();
    this.monitorUserBehavior();
    this.addProtectionHeaders();
    this.detectDevTools();
  }

  // Detect automation tools
  detectAutomation() {
    // Check for automation indicators
    const automationIndicators = [
      'webdriver' in navigator,
      'selenium' in window,
      'callSelenium' in window,
      'domAutomation' in window,
      'domAutomationController' in window,
      'webdriver' in window,
      'chrome' in window && 'webdriver' in window.chrome,
      'navigator.webdriver' === true
    ];

    if (automationIndicators.some(indicator => indicator)) {
      this.blockAccess('Automation detected');
    }

    // Check for headless browser indicators (more lenient)
    const headlessIndicators = [
      navigator.webdriver,
      !window.chrome,
      !window.chrome.runtime,
      !window.chrome.loadTimes,
      !window.chrome.csi,
      !window.chrome.app
    ];

    // Require more indicators to trigger in development
    const requiredIndicators = this.isDevelopment ? 5 : 3;
    if (headlessIndicators.filter(Boolean).length >= requiredIndicators) {
      this.blockAccess('Headless browser detected');
    }
  }

  // Monitor user behavior patterns (more lenient)
  monitorUserBehavior() {
    let mouseMovements = 0;
    let keyPresses = 0;
    let scrollEvents = 0;
    let lastActivity = Date.now();

    // Track mouse movements
    document.addEventListener('mousemove', () => {
      mouseMovements++;
      lastActivity = Date.now();
    });

    // Track key presses
    document.addEventListener('keydown', () => {
      keyPresses++;
      lastActivity = Date.now();
    });

    // Track scrolling
    document.addEventListener('scroll', () => {
      scrollEvents++;
      lastActivity = Date.now();
    });

    // Check for suspicious behavior every 30 seconds
    setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      
      // More lenient thresholds for development
      const inactivityThreshold = this.isDevelopment ? 300000 : 120000; // 5 min vs 2 min
      const minMouseMovements = this.isDevelopment ? 1 : 5;
      const minKeyPresses = this.isDevelopment ? 0 : 2;
      
      if (timeSinceActivity > inactivityThreshold && (mouseMovements < minMouseMovements || keyPresses < minKeyPresses)) {
        this.blockAccess('Suspicious user behavior detected');
      }

      // Reset counters every 5 minutes
      if (timeSinceActivity > 300000) {
        mouseMovements = 0;
        keyPresses = 0;
        scrollEvents = 0;
      }
    }, 30000);
  }

  // Add protection headers to requests
  addProtectionHeaders() {
    // Override fetch to add protection headers
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      options.headers = {
        ...options.headers,
        'X-Protection-Token': this.generateProtectionToken(),
        'X-User-Agent': navigator.userAgent,
        'X-Timestamp': Date.now().toString()
      };
      return originalFetch(url, options);
    }.bind(this);

    // Override XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this.addEventListener('readystatechange', () => {
        if (this.readyState === 1) {
          this.setRequestHeader('X-Protection-Token', this.generateProtectionToken());
          this.setRequestHeader('X-User-Agent', navigator.userAgent);
          this.setRequestHeader('X-Timestamp', Date.now().toString());
        }
      });
      return originalXHROpen.call(this, method, url, ...args);
    };
  }

  // Generate protection token
  generateProtectionToken() {
    const timestamp = Date.now();
    const userAgent = navigator.userAgent;
    const screenRes = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Simple hash-like token
    const data = `${timestamp}-${userAgent}-${screenRes}-${timezone}`;
    return btoa(data).substring(0, 32);
  }

  // Detect developer tools (disabled in development)
  detectDevTools() {
    if (this.isDevelopment) return; // Skip in development
    
    let devtools = false;
    
    const threshold = 160;
    
    const checkDevTools = () => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools) {
          devtools = true;
          this.blockAccess('Developer tools detected');
        }
      } else {
        devtools = false;
      }
    };

    setInterval(checkDevTools, 1000);
  }

  // Block access
  blockAccess(reason) {
    console.warn(`🚨 Access blocked: ${reason}`);
    
    // Clear the page content
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: Arial, sans-serif;
        background: #f5f5f5;
      ">
        <div style="
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
          <h1 style="color: #e74c3c; margin-bottom: 20px;">Access Denied</h1>
          <p style="color: #666; margin-bottom: 20px;">
            Automated access is not allowed on this website.
          </p>
          <p style="color: #999; font-size: 14px;">
            Reason: ${reason}
          </p>
        </div>
      </div>
    `;
    
    // Prevent further JavaScript execution
    throw new Error('Access blocked by anti-scraping protection');
  }
}

// Initialize protection when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AntiScrapingProtection();
  });
} else {
  new AntiScrapingProtection();
}

export default AntiScrapingProtection; 