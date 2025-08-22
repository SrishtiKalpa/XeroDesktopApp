import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Home, ExternalLink } from 'lucide-react';
import './WebView.css';

const WebView = ({ url, onUrlChange }) => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);
  const webviewRef = useRef(null);

  // Load URL changes
  useEffect(() => {
    if (!url) return;
    if (url !== currentUrl) {
      setCurrentUrl(url);
      if (webviewRef.current) {
        webviewRef.current.loadURL(url);
      }
    }
  }, [url]);

  // Attach webview event listeners
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleDomReady = () => {
      try {
        setCanGoBack(webview.canGoBack());
        setCanGoForward(webview.canGoForward());
      } catch (_) {}
      setIsLoading(false);
    };

    const handleDidStartLoading = () => {
      setIsLoading(true);
    };

    const handleDidStopLoading = () => {
      setIsLoading(false);
      try {
        setCanGoBack(webview.canGoBack());
        setCanGoForward(webview.canGoForward());
      } catch (_) {}
    };

    const handleDidNavigate = (e) => {
      const newUrl = e.url || (webview.getURL && webview.getURL());
      if (newUrl) {
        setCurrentUrl(newUrl);
        onUrlChange && onUrlChange(newUrl);
      }
      try {
        setCanGoBack(webview.canGoBack());
        setCanGoForward(webview.canGoForward());
      } catch (_) {}
    };

    const handleDidNavigateInPage = (e) => {
      const newUrl = e.url || (webview.getURL && webview.getURL());
      if (newUrl) {
        setCurrentUrl(newUrl);
        onUrlChange && onUrlChange(newUrl);
      }
    };

    const handleNewWindow = (e) => {
      e.preventDefault();
      if (e.url) {
        window.electronAPI.openExternal(e.url);
      }
    };

    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('did-start-loading', handleDidStartLoading);
    webview.addEventListener('did-stop-loading', handleDidStopLoading);
    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage);
    webview.addEventListener('new-window', handleNewWindow);

    return () => {
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('did-start-loading', handleDidStartLoading);
      webview.removeEventListener('did-stop-loading', handleDidStopLoading);
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener('did-navigate-in-page', handleDidNavigateInPage);
      webview.removeEventListener('new-window', handleNewWindow);
    };
  }, [webviewRef.current]);

  const handleGoBack = () => {
    const webview = webviewRef.current;
    if (webview && webview.canGoBack && webview.canGoBack()) {
      webview.goBack();
    }
  };

  const handleGoForward = () => {
    const webview = webviewRef.current;
    if (webview && webview.canGoForward && webview.canGoForward()) {
      webview.goForward();
    }
  };

  const handleRefresh = () => {
    const webview = webviewRef.current;
    if (webview) {
      webview.reload();
    }
  };

  const handleGoHome = () => {
    const homeUrl = 'https://go.xero.com/Dashboard/';
    setCurrentUrl(homeUrl);
    onUrlChange && onUrlChange(homeUrl);
    const webview = webviewRef.current;
    if (webview) {
      webview.loadURL(homeUrl);
    }
  };

  const handleOpenExternal = () => {
    if (currentUrl) {
      window.electronAPI.openExternal(currentUrl);
    }
  };

  return (
    <div className="webview-container">
      <div className="webview-navbar">
        <div className="nav-controls">
          <button 
            className="nav-btn" 
            onClick={handleGoBack}
            disabled={!canGoBack}
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          
          <button 
            className="nav-btn" 
            onClick={handleGoForward}
            disabled={!canGoForward}
            title="Go Forward"
          >
            <ArrowRight size={16} />
          </button>
          
          <button 
            className="nav-btn" 
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          </button>
          
          <button 
            className="nav-btn" 
            onClick={handleGoHome}
            title="Go to Dashboard"
          >
            <Home size={16} />
          </button>
        </div>
        
        <div className="nav-url">
          <span className="url-text" title={currentUrl}>
            {currentUrl}
          </span>
        </div>
        
        <div className="nav-actions">
          <button 
            className="nav-btn" 
            onClick={handleOpenExternal}
            title="Open in Browser"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="webview-loading">
          <div className="loading-spinner"></div>
          <span>Loading...</span>
        </div>
      )}

      <webview
        ref={webviewRef}
        src={currentUrl}
        className="webview"
        webpreferences="contextIsolation=false, nodeIntegration=false"
        allowpopups="true"
      />
    </div>
  );
};

export default WebView;
