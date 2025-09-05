/**
 * StockGuru AI Chatbot Widget
 * Version: 1.0.0
 * 
 * This widget allows easy integration of the StockGuru AI chatbot into any website.
 * Supports both embedded and floating button modes.
 */

(function() {
  'use strict';

  // Configuration defaults
  const DEFAULT_CONFIG = {
    theme: 'dark',
    width: '400px',
    height: '600px',
    defaultStock: 'RELIANCE',
    userId: 'anonymous-' + Math.random().toString(36).substr(2, 9),
    position: 'bottom-right',
    buttonColor: '#3B82F6',
    borderRadius: '12px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    debug: false
  };

  // Get the current script's src to determine the base URL
  const getCurrentScript = () => {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('chatbot-widget.js')) {
        return scripts[i];
      }
    }
    return null;
  };

  const getBaseURL = () => {
    const script = getCurrentScript();
    if (script && script.src) {
      const url = new URL(script.src);
      return `${url.protocol}//${url.host}`;
    }
    // Fallback for local development
    return window.location.protocol + '//' + window.location.host;
  };

  const BASE_URL = getBaseURL();

  // Utility functions
  const log = (message, ...args) => {
    if (window.StockGuruChatbot && window.StockGuruChatbot._config && window.StockGuruChatbot._config.debug) {
      console.log('[StockGuru Chatbot]', message, ...args);
    }
  };

  const createIframe = (config) => {
    const iframe = document.createElement('iframe');
    const params = new URLSearchParams({
      theme: config.theme,
      stock: config.defaultStock,
      userId: config.userId,
      embedded: 'true'
    });

    iframe.src = `${BASE_URL}/chatbot?${params.toString()}`;
    iframe.style.cssText = `
      width: ${config.width};
      height: ${config.height};
      border: none;
      border-radius: ${config.borderRadius};
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      background: transparent;
    `;
    iframe.title = 'StockGuru AI Chatbot';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'lazy');

    return iframe;
  };

  const createFloatingButton = (config) => {
    const button = document.createElement('button');
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 14.97 3.01 16.26L2 22L7.74 20.99C9.03 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C10.76 20 9.57 19.68 8.54 19.11L8.2 18.9L4.85 19.75L5.7 16.4L5.49 16.06C4.82 14.97 4.5 13.72 4.5 12.38C4.5 7.93 8.05 4.38 12.5 4.38C16.95 4.38 20.5 7.93 20.5 12.38C20.5 16.83 16.95 20.38 12.5 20.38H12Z" fill="currentColor"/>
        <path d="M16.5 13.5C16.28 13.39 15.29 12.9 15.09 12.82C14.89 12.75 14.74 12.71 14.59 12.93C14.44 13.15 14.06 13.61 13.93 13.76C13.8 13.91 13.67 13.93 13.45 13.82C13.23 13.71 12.5 13.47 11.64 12.7C10.97 12.1 10.5 11.37 10.37 11.15C10.24 10.93 10.35 10.81 10.46 10.7C10.56 10.6 10.68 10.44 10.79 10.31C10.9 10.18 10.94 10.09 11.01 9.94C11.08 9.79 11.04 9.66 10.99 9.55C10.94 9.44 10.5 8.45 10.32 7.95C10.15 7.47 9.97 7.53 9.84 7.52H9.5C9.35 7.52 9.11 7.57 8.91 7.79C8.71 8.01 8.19 8.5 8.19 9.49C8.19 10.48 8.93 11.44 9.04 11.59C9.15 11.74 10.48 13.94 12.58 14.82C13.95 15.4 14.95 15.33 15.95 15.18C16.54 15.08 17.34 14.65 17.52 14.18C17.7 13.71 17.7 13.31 17.65 13.22C17.6 13.13 17.45 13.08 17.23 12.97L16.5 13.5Z" fill="currentColor"/>
      </svg>
    `;

    button.style.cssText = `
      position: fixed;
      ${getPositionStyles(config.position)}
      width: 60px;
      height: 60px;
      background: ${config.buttonColor};
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 9999;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${config.fontFamily};
    `;

    button.onmouseenter = () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 6px 25px rgba(0,0,0,0.3)';
    };

    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    };

    return button;
  };

  const getPositionStyles = (position) => {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;'
    };
    return positions[position] || positions['bottom-right'];
  };

  const createFloatingWindow = (config) => {
    const window = document.createElement('div');
    window.style.cssText = `
      position: fixed;
      ${getWindowPositionStyles(config.position)}
      width: ${config.width};
      height: ${config.height};
      z-index: 9998;
      background: white;
      border-radius: ${config.borderRadius};
      box-shadow: 0 8px 40px rgba(0,0,0,0.25);
      display: none;
      transition: all 0.3s ease;
      overflow: hidden;
    `;

    const iframe = createIframe(config);
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.borderRadius = config.borderRadius;

    window.appendChild(iframe);
    return window;
  };

  const getWindowPositionStyles = (position) => {
    const styles = {
      'bottom-right': 'bottom: 90px; right: 20px;',
      'bottom-left': 'bottom: 90px; left: 20px;',
      'top-right': 'top: 90px; right: 20px;',
      'top-left': 'top: 90px; left: 20px;'
    };
    return styles[position] || styles['bottom-right'];
  };

  // Main StockGuru Chatbot object
  window.StockGuruChatbot = {
    _config: null,
    _instances: [],

    // Initialize embedded chatbot
    init: function(config) {
      const mergedConfig = { ...DEFAULT_CONFIG, ...config };
      this._config = mergedConfig;

      log('Initializing chatbot with config:', mergedConfig);

      if (!config.containerId) {
        console.error('[StockGuru Chatbot] containerId is required for init()');
        return;
      }

      const container = document.getElementById(config.containerId);
      if (!container) {
        console.error('[StockGuru Chatbot] Container element not found:', config.containerId);
        return;
      }

      const iframe = createIframe(mergedConfig);
      container.appendChild(iframe);

      // Set up event listeners for iframe communication
      this._setupMessageHandling(iframe, mergedConfig);

      const instance = {
        type: 'embedded',
        container: container,
        iframe: iframe,
        config: mergedConfig
      };

      this._instances.push(instance);
      log('Chatbot initialized successfully');

      return instance;
    },

    // Initialize floating button chatbot
    initFloating: function(config) {
      const mergedConfig = { ...DEFAULT_CONFIG, ...config };
      this._config = mergedConfig;

      log('Initializing floating chatbot with config:', mergedConfig);

      const button = createFloatingButton(mergedConfig);
      const window = createFloatingWindow(mergedConfig);

      let isOpen = false;

      button.onclick = () => {
        isOpen = !isOpen;
        window.style.display = isOpen ? 'block' : 'none';
        
        if (isOpen) {
          window.style.transform = 'scale(0.95)';
          setTimeout(() => {
            window.style.transform = 'scale(1)';
          }, 10);
        }

        log('Floating window toggled:', isOpen ? 'opened' : 'closed');
      };

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (isOpen && !window.contains(e.target) && !button.contains(e.target)) {
          isOpen = false;
          window.style.display = 'none';
          log('Floating window closed by outside click');
        }
      });

      document.body.appendChild(button);
      document.body.appendChild(window);

      // Set up event listeners for iframe communication
      const iframe = window.querySelector('iframe');
      this._setupMessageHandling(iframe, mergedConfig);

      const instance = {
        type: 'floating',
        button: button,
        window: window,
        iframe: iframe,
        config: mergedConfig,
        isOpen: () => isOpen,
        toggle: () => button.onclick(),
        open: () => {
          if (!isOpen) button.onclick();
        },
        close: () => {
          if (isOpen) button.onclick();
        }
      };

      this._instances.push(instance);
      log('Floating chatbot initialized successfully');

      return instance;
    },

    // Set up communication with iframe
    _setupMessageHandling: function(iframe, config) {
      window.addEventListener('message', (event) => {
        // Verify origin for security
        if (event.origin !== BASE_URL) return;

        const data = event.data;
        log('Received message from iframe:', data);

        // Handle different message types
        switch (data.type) {
          case 'stockSelected':
            if (config.onStockSelected) {
              config.onStockSelected(data.symbol);
            }
            break;
          case 'messageSent':
            if (config.onMessageSent) {
              config.onMessageSent(data.message);
            }
            break;
          case 'responseReceived':
            if (config.onResponseReceived) {
              config.onResponseReceived(data.response);
            }
            break;
          case 'error':
            console.error('[StockGuru Chatbot] Error from iframe:', data.error);
            break;
          case 'resize':
            // Handle dynamic resizing if needed
            if (data.height && iframe) {
              iframe.style.height = data.height + 'px';
            }
            break;
        }
      });
    },

    // Get all active instances
    getInstances: function() {
      return this._instances;
    },

    // Destroy specific instance
    destroy: function(instance) {
      const index = this._instances.indexOf(instance);
      if (index > -1) {
        if (instance.type === 'embedded') {
          instance.container.removeChild(instance.iframe);
        } else if (instance.type === 'floating') {
          document.body.removeChild(instance.button);
          document.body.removeChild(instance.window);
        }
        this._instances.splice(index, 1);
        log('Instance destroyed');
      }
    },

    // Destroy all instances
    destroyAll: function() {
      this._instances.forEach(instance => this.destroy(instance));
      log('All instances destroyed');
    },

    // Send message to specific instance (for programmatic control)
    sendMessage: function(instance, message) {
      if (instance && instance.iframe) {
        instance.iframe.contentWindow.postMessage({
          type: 'sendMessage',
          message: message
        }, BASE_URL);
        log('Message sent to instance:', message);
      }
    },

    // Update stock for specific instance
    updateStock: function(instance, symbol) {
      if (instance && instance.iframe) {
        instance.iframe.contentWindow.postMessage({
          type: 'updateStock',
          symbol: symbol
        }, BASE_URL);
        log('Stock updated for instance:', symbol);
      }
    },

    // Get current configuration
    getConfig: function() {
      return this._config;
    },

    // Update theme for all instances
    updateTheme: function(theme) {
      this._instances.forEach(instance => {
        if (instance.iframe) {
          instance.iframe.contentWindow.postMessage({
            type: 'updateTheme',
            theme: theme
          }, BASE_URL);
        }
      });
      log('Theme updated for all instances:', theme);
    }
  };

  // Auto-initialize if data attributes are present
  document.addEventListener('DOMContentLoaded', () => {
    // Look for auto-init containers
    const autoContainers = document.querySelectorAll('[data-stockguru-chatbot]');
    autoContainers.forEach(container => {
      const config = {
        containerId: container.id,
        theme: container.dataset.theme || 'dark',
        width: container.dataset.width || '400px',
        height: container.dataset.height || '600px',
        defaultStock: container.dataset.defaultStock || 'RELIANCE',
        userId: container.dataset.userId || undefined
      };

      window.StockGuruChatbot.init(config);
      log('Auto-initialized chatbot for container:', container.id);
    });

    // Look for auto-init floating button
    if (document.querySelector('[data-stockguru-floating]')) {
      const floatingEl = document.querySelector('[data-stockguru-floating]');
      const config = {
        theme: floatingEl.dataset.theme || 'dark',
        position: floatingEl.dataset.position || 'bottom-right',
        buttonColor: floatingEl.dataset.buttonColor || '#3B82F6',
        defaultStock: floatingEl.dataset.defaultStock || 'RELIANCE',
        userId: floatingEl.dataset.userId || undefined
      };

      window.StockGuruChatbot.initFloating(config);
      log('Auto-initialized floating chatbot');
    }
  });

  log('StockGuru Chatbot Widget loaded successfully');
})();