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
        updateAnalytics(history);
        updateAchievements(history);
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

// Enhanced Analytics Functions
function updateAnalytics(history) {
    if (!history || history.length === 0) {
        showEmptyAnalytics();
        return;
    }

    // Initialize chart library
    const charts = new PromptTracerCharts();
    
    // Update trend chart
    updateTrendChart(charts, history);
    
    // Update platform chart
    updatePlatformChart(charts, history);
    
    // Update score distribution chart
    updateScoreDistributionChart(charts, history);
}

function updateTrendChart(charts, history) {
    // Get last 10 prompts for trend
    const recentPrompts = history.slice(-10);
    const trendData = recentPrompts.map((prompt, index) => ({
        score: Math.round((prompt.metrics?.overallScore || 0) * 100),
        timestamp: prompt.timestamp,
        platform: prompt.platform
    }));
    
    charts.createTrendChart('trend-chart', trendData);
    document.getElementById('trend-chart').classList.add('loaded');
}

function updatePlatformChart(charts, history) {
    const platformData = {};
    history.forEach(prompt => {
        const platform = prompt.platform || 'unknown';
        platformData[platform] = (platformData[platform] || 0) + 1;
    });
    
    charts.createPlatformChart('platform-chart', platformData);
    document.getElementById('platform-chart').classList.add('loaded');
}

function updateScoreDistributionChart(charts, history) {
    const scoreRanges = {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0
    };
    
    history.forEach(prompt => {
        const score = Math.round((prompt.metrics?.overallScore || 0) * 100);
        if (score <= 20) scoreRanges['0-20']++;
        else if (score <= 40) scoreRanges['21-40']++;
        else if (score <= 60) scoreRanges['41-60']++;
        else if (score <= 80) scoreRanges['61-80']++;
        else scoreRanges['81-100']++;
    });
    
    const distributionData = Object.entries(scoreRanges).map(([range, count]) => ({
        range,
        count
    })).filter(item => item.count > 0);
    
    charts.createScoreDistributionChart('score-chart', distributionData);
    document.getElementById('score-chart').classList.add('loaded');
}

function showEmptyAnalytics() {
    const containers = ['trend-chart', 'platform-chart', 'score-chart'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.6;">📊</div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Analytics Yet</div>
                    <div style="font-size: 14px; opacity: 0.8;">Start using prompts to see your analytics</div>
                </div>
            `;
            container.classList.add('loaded');
        }
    });
}

function updateAchievements(history) {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    const achievements = calculateAchievements(history);
    
    if (achievements.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #666; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.6;">🏆</div>
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Achievements Yet</div>
                <div style="font-size: 14px; opacity: 0.8;">Keep improving your prompts to unlock achievements!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = achievements.map(achievement => `
        <div class="achievement ${achievement.unlocked ? 'unlocked' : ''}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                ${achievement.progress !== undefined ? `
                    <div class="achievement-progress">${achievement.progressText}</div>
                    <div class="achievement-progress-bar">
                        <div class="achievement-progress-fill" style="width: ${achievement.progress}%"></div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function calculateAchievements(history) {
    const achievements = [];
    const totalPrompts = history.length;
    const avgScore = totalPrompts > 0 ? 
        history.reduce((sum, p) => sum + (p.metrics?.overallScore || 0), 0) / totalPrompts * 100 : 0;
    
    // First Prompt Achievement
    achievements.push({
        icon: '🎉',
        title: 'Getting Started',
        description: 'Analyze your first prompt',
        unlocked: totalPrompts >= 1,
        progress: Math.min(totalPrompts, 1) * 100,
        progressText: `${Math.min(totalPrompts, 1)}/1 prompts analyzed`
    });
    
    // Prompt Explorer Achievement
    achievements.push({
        icon: '🚀',
        title: 'Prompt Explorer',
        description: 'Analyze 10 prompts',
        unlocked: totalPrompts >= 10,
        progress: Math.min(totalPrompts, 10) * 10,
        progressText: `${Math.min(totalPrompts, 10)}/10 prompts analyzed`
    });
    
    // Prompt Master Achievement
    achievements.push({
        icon: '👑',
        title: 'Prompt Master',
        description: 'Analyze 50 prompts',
        unlocked: totalPrompts >= 50,
        progress: Math.min(totalPrompts, 50) * 2,
        progressText: `${Math.min(totalPrompts, 50)}/50 prompts analyzed`
    });
    
    // Quality Seeker Achievement
    achievements.push({
        icon: '⭐',
        title: 'Quality Seeker',
        description: 'Achieve 80% average score',
        unlocked: avgScore >= 80,
        progress: Math.min(avgScore, 80),
        progressText: `${Math.round(avgScore)}% average score (target: 80%)`
    });
    
    // Platform Explorer Achievement
    const platforms = new Set(history.map(p => p.platform)).size;
    achievements.push({
        icon: '🌐',
        title: 'Platform Explorer',
        description: 'Use 3 different AI platforms',
        unlocked: platforms >= 3,
        progress: Math.min(platforms, 3) * 33.33,
        progressText: `${platforms}/3 platforms used`
    });
    
    // Consistency Champion Achievement
    const highQualityPrompts = history.filter(p => (p.metrics?.overallScore || 0) * 100 >= 70).length;
    achievements.push({
        icon: '🏆',
        title: 'Consistency Champion',
        description: 'Get 70%+ score on 10 prompts',
        unlocked: highQualityPrompts >= 10,
        progress: Math.min(highQualityPrompts, 10) * 10,
        progressText: `${highQualityPrompts}/10 high-quality prompts`
    });
    
    return achievements;
} 