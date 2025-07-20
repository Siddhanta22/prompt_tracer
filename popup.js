/**
 * Popup script for Prompt Tracer extension
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    initializeTabs();
    
    // Load data
    loadData();
    
    // Set up event listeners
    setupEventListeners();
});

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

function setupEventListeners() {
    // Export data button
    document.getElementById('export-data').addEventListener('click', exportData);
    
    // Clear data button
    document.getElementById('clear-data').addEventListener('click', clearData);
    
    // Settings toggles
    document.getElementById('auto-analysis-toggle').addEventListener('click', toggleSetting);
    document.getElementById('show-panel-toggle').addEventListener('click', toggleSetting);
    document.getElementById('save-history-toggle').addEventListener('click', toggleSetting);
    document.getElementById('llm-optimization-toggle').addEventListener('click', toggleSetting);
    
    // API key input
    document.getElementById('openai-api-key').addEventListener('input', saveApiKey);
}

function loadData() {
    chrome.storage.local.get(['promptHistory'], function(result) {
        const history = result.promptHistory || [];
        updateDashboard(history);
    });
}

function updateDashboard(history) {
    // Update stats
    const totalPrompts = history.length;
    const avgScore = history.length > 0 
        ? Math.round(history.reduce((sum, prompt) => sum + (prompt.metrics?.overallScore || 0), 0) / history.length * 100)
        : 0;
    
    document.getElementById('total-prompts').textContent = totalPrompts;
    document.getElementById('avg-score').textContent = avgScore + '%';
    
    // Update platform tags
    updatePlatformTags(history);
    
    // Update recent prompts
    updateRecentPrompts(history);
}

function updatePlatformTags(history) {
    const platformCounts = {};
    history.forEach(prompt => {
        const platform = prompt.platform || 'unknown';
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });
    
    const platformTagsContainer = document.getElementById('platform-tags');
    platformTagsContainer.innerHTML = '';
    
    if (Object.keys(platformCounts).length === 0) {
        platformTagsContainer.innerHTML = '<div style="color: #666; font-style: italic;">No platforms used yet</div>';
        return;
    }
    
    Object.entries(platformCounts).forEach(([platform, count]) => {
        const tag = document.createElement('div');
        tag.className = 'platform-tag';
        tag.innerHTML = `
            <span>${getPlatformIcon(platform)}</span>
            <span>${getPlatformName(platform)}</span>
            <span class="platform-count">${count}</span>
        `;
        platformTagsContainer.appendChild(tag);
    });
}

function updateRecentPrompts(history) {
    const promptList = document.getElementById('prompt-list');
    promptList.innerHTML = '';
    
    if (history.length === 0) {
        promptList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-text">No prompts yet</div>
                <div class="empty-subtext">Start typing in your AI platform to see analysis</div>
            </div>
        `;
        return;
    }
    
    // Show last 5 prompts
    const recentPrompts = history.slice(-5).reverse();
    
    recentPrompts.forEach(prompt => {
        const promptItem = document.createElement('div');
        promptItem.className = 'prompt-item';
        
        const score = Math.round((prompt.metrics?.overallScore || 0) * 100);
        const scoreClass = getScoreClass(score);
        
        promptItem.innerHTML = `
            <div class="prompt-text">${truncateText(prompt.prompt, 80)}</div>
            <div class="prompt-meta">
                <div class="prompt-platform">
                    <span>${getPlatformIcon(prompt.platform)}</span>
                    <span>${getPlatformName(prompt.platform)} • ${formatDate(prompt.timestamp)}</span>
                </div>
                <div class="score-badge ${scoreClass}">${score}%</div>
            </div>
        `;
        
        promptList.appendChild(promptItem);
    });
}

function getPlatformIcon(platform) {
    const icons = {
        'gpt': '🤖',
        'claude': '🧠',
        'grok': '🚀',
        'gemini': '💎',
        'unknown': '❓'
    };
    return icons[platform] || icons.unknown;
}

function getPlatformName(platform) {
    const names = {
        'gpt': 'ChatGPT',
        'claude': 'Claude',
        'grok': 'Grok',
        'gemini': 'Gemini',
        'unknown': 'Unknown'
    };
    return names[platform] || names.unknown;
}

function getScoreClass(score) {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString();
}

function exportData() {
    chrome.storage.local.get(['promptHistory'], function(result) {
        const history = result.promptHistory || [];
        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prompt-tracer-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    });
}

function clearData() {
    if (confirm('Are you sure you want to clear all prompt history? This action cannot be undone.')) {
        chrome.storage.local.remove(['promptHistory'], function() {
            loadData(); // Reload to show empty state
        });
    }
}

function toggleSetting(event) {
    const toggle = event.currentTarget;
    toggle.classList.toggle('active');
    
    // Save setting to storage
    const settingName = toggle.id.replace('-toggle', '');
    const isActive = toggle.classList.contains('active');
    
    chrome.storage.local.set({ [settingName]: isActive });
}

function saveApiKey(event) {
    const apiKey = event.target.value;
    chrome.storage.local.set({ 'openai-api-key': apiKey });
    
    // Update API status
    updateApiStatus(apiKey);
}

function updateApiStatus(apiKey) {
    const statusIndicator = document.getElementById('api-status-indicator');
    const statusText = document.getElementById('api-status-text');
    
    if (!apiKey || apiKey.trim() === '') {
        statusIndicator.textContent = '🆓';
        statusIndicator.style.color = '#4caf50';
        statusText.textContent = 'Using free optimization';
        statusText.style.color = '#4caf50';
        return;
    }
    
    if (!apiKey.startsWith('sk-')) {
        statusIndicator.textContent = '⚠️';
        statusIndicator.style.color = '#ff9800';
        statusText.textContent = 'Invalid format';
        statusText.style.color = '#ff9800';
        return;
    }
    
    // Test API key by making a simple call
    statusIndicator.textContent = '⏳';
    statusIndicator.style.color = '#ff9800';
    statusText.textContent = 'Testing premium...';
    statusText.style.color = '#ff9800';
    
    // Send test message to background script
    chrome.runtime.sendMessage({
        action: 'testApiKey',
        apiKey: apiKey
    }, function(response) {
        if (response && response.success) {
            statusIndicator.textContent = '⭐';
            statusIndicator.style.color = '#ff9800';
            statusText.textContent = 'Premium active';
            statusText.style.color = '#ff9800';
        } else {
            statusIndicator.textContent = '❌';
            statusIndicator.style.color = '#f44336';
            statusText.textContent = response?.error || 'Premium failed';
            statusText.style.color = '#f44336';
        }
    });
}

// Load settings on startup
chrome.storage.local.get(['auto-analysis', 'show-panel', 'save-history', 'llm-optimization', 'openai-api-key'], function(result) {
    if (result['auto-analysis'] !== undefined) {
        const toggle = document.getElementById('auto-analysis-toggle');
        if (result['auto-analysis']) toggle.classList.add('active');
        else toggle.classList.remove('active');
    }
    
    if (result['show-panel'] !== undefined) {
        const toggle = document.getElementById('show-panel-toggle');
        if (result['show-panel']) toggle.classList.add('active');
        else toggle.classList.remove('active');
    }
    
    if (result['save-history'] !== undefined) {
        const toggle = document.getElementById('save-history-toggle');
        if (result['save-history']) toggle.classList.add('active');
        else toggle.classList.remove('active');
    }
    
    if (result['llm-optimization'] !== undefined) {
        const toggle = document.getElementById('llm-optimization-toggle');
        if (result['llm-optimization']) toggle.classList.add('active');
        else toggle.classList.remove('active');
    }
    
    if (result['openai-api-key']) {
        document.getElementById('openai-api-key').value = result['openai-api-key'];
        updateApiStatus(result['openai-api-key']);
    }
});

// Setup tutorial button functionality
function setupTutorialButton() {
    const tutorialBtn = document.getElementById('start-tutorial');
    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', function() {
            // Send message to content script to start tutorial
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'startTutorial'
                });
            });
            
            // Close popup
            window.close();
        });
        
        // Add hover effect
        tutorialBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        tutorialBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
}

// Initialize tutorial button
setupTutorialButton(); 