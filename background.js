/**
 * Background service worker for Prompt Tracer extension
 */

// Background script for Prompt Tracer extension

// Initialize storage with default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    promptHistory: [],
    settings: {
      autoAnalysis: true,
      showPanel: true,
      saveHistory: true,
      llmOptimization: true
    }
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'storePrompt':
      storePrompt(request.data);
      break;
    case 'getAnalytics':
      getAnalytics().then(sendResponse);
      return true; // Keep message channel open for async response
    case 'getPromptHistory':
      getPromptHistory().then(sendResponse);
      return true;
    case 'clearHistory':
      clearHistory().then(sendResponse);
      return true;
    case 'exportData':
      exportData().then(sendResponse);
      return true;
    case 'optimizePrompt':
      optimizePromptWithLLM(request.prompt, request.analysis).then(sendResponse);
      return true;
    case 'testApiKey':
      testApiKey(request.apiKey).then(sendResponse);
      return true;
    case 'updateSettings':
      updateSettings(request.settings).then(sendResponse);
      return true;
  }
});

// Store prompt data
function storePrompt(promptData) {
  chrome.storage.local.get(['promptHistory'], (result) => {
    const history = result.promptHistory || [];
    history.push(promptData);
    
    // Keep only last 100 prompts
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    chrome.storage.local.set({ promptHistory: history });
  });
}

// Get analytics data
async function getAnalytics() {
  const result = await chrome.storage.local.get(['promptHistory']);
  const history = result.promptHistory || [];
  
  if (history.length === 0) {
    return {
      totalPrompts: 0,
      averageScore: 0,
      platformsUsed: {},
      recentTrends: []
    };
  }
  
  // Calculate analytics
  const totalPrompts = history.length;
  const averageScore = history.reduce((sum, prompt) => 
    sum + (prompt.metrics?.overallScore || 0), 0) / totalPrompts;
  
  // Platform usage
  const platformsUsed = {};
  history.forEach(prompt => {
    const platform = prompt.platform || 'unknown';
    platformsUsed[platform] = (platformsUsed[platform] || 0) + 1;
  });
  
  // Recent trends (last 10 prompts)
  const recentTrends = history.slice(-10).map(prompt => ({
    score: Math.round((prompt.metrics?.overallScore || 0) * 100),
    timestamp: prompt.timestamp,
    platform: prompt.platform
  }));
  
  return {
    totalPrompts,
    averageScore: Math.round(averageScore * 100),
    platformsUsed,
    recentTrends
  };
}

// Get prompt history
async function getPromptHistory() {
  const result = await chrome.storage.local.get(['promptHistory']);
  return result.promptHistory || [];
}

// Clear history
async function clearHistory() {
  await chrome.storage.local.set({ promptHistory: [] });
  return { success: true };
}

// Export data
async function exportData() {
  const result = await chrome.storage.local.get(['promptHistory']);
  const history = result.promptHistory || [];
  
  const dataStr = JSON.stringify(history, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  // Create download link
  const url = URL.createObjectURL(dataBlob);
  const timestamp = new Date().toISOString().split('T')[0];
  
  await chrome.downloads.download({
    url: url,
    filename: `prompt-tracer-data-${timestamp}.json`,
    saveAs: true
  });
  
  return { success: true };
}

// Advanced prompt optimization (Privacy-First)
async function optimizePromptWithLLM(originalPrompt, analysis) {
  try {
    // Get settings
    const result = await chrome.storage.local.get(['settings', 'llm-optimization', 'openai-api-key']);
    const settings = result.settings || {};
    const llmOptimization = result['llm-optimization'] !== false; // Default to true
    const apiKey = result['openai-api-key'];
    
    console.log('Advanced optimization enabled:', llmOptimization);
    
    if (!llmOptimization) {
      return { optimized: originalPrompt, method: 'disabled' };
    }
    
    // Try different optimization methods
    let optimizedPrompt = null;
    let method = 'advanced-rules';
    
    // Method 1: Try OpenAI API if key is available (Premium feature)
    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        console.log('Attempting OpenAI API optimization (Premium)...');
        const optimizationPrompt = createOptimizationPrompt(originalPrompt, analysis);
        optimizedPrompt = await callOpenAI(optimizationPrompt, apiKey);
        method = 'openai-premium';
        console.log('OpenAI optimization successful');
      } catch (error) {
        console.log('OpenAI API failed, using advanced rules:', error);
      }
    }
    
    // Method 2: Advanced rule-based optimization (Free, Privacy-Safe)
    if (!optimizedPrompt) {
      console.log('Using advanced rule-based optimization (Privacy-Safe)...');
      optimizedPrompt = advancedRuleBasedOptimization(originalPrompt, analysis);
      method = 'advanced-rules';
    }
    
    // Ensure we never return the original prompt unchanged
    if (optimizedPrompt === originalPrompt) {
      console.log('Optimization returned original, using advanced rules...');
      optimizedPrompt = advancedRuleBasedOptimization(originalPrompt, analysis);
      method = 'advanced-rules';
    }
    
    return {
      optimized: optimizedPrompt,
      method: method,
      original: originalPrompt
    };
    
  } catch (error) {
    console.error('Optimization failed:', error);
    // Always provide a fallback
    const fallback = advancedRuleBasedOptimization(originalPrompt, analysis);
    return {
      optimized: fallback,
      method: 'advanced-rules',
      error: error.message
    };
  }
}

// Create optimization prompt for LLM
function createOptimizationPrompt(originalPrompt, analysis) {
  const issues = analysis.issues.map(issue => `- ${issue.issue}`).join('\n');
  const score = analysis.score;
  
  return `You are an expert prompt engineer. Please optimize the following prompt to make it more effective and clear.

ORIGINAL PROMPT:
"${originalPrompt}"

ANALYSIS:
- Current Score: ${score}/100
- Issues Found:
${issues}

TASK: Rewrite this prompt to address the identified issues and make it more effective. The optimized prompt should:
1. Be clear and specific
2. Include necessary context and constraints
3. Specify the desired output format when helpful
4. Be concise but comprehensive
5. Maintain the original intent while improving structure

Return ONLY the optimized prompt, nothing else.`;
}

// Call OpenAI API
async function callOpenAI(prompt, apiKey) {
  console.log('Calling OpenAI API with prompt:', prompt.substring(0, 100) + '...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert prompt engineer. Provide only the optimized prompt, no explanations or additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });
    
    console.log('OpenAI API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('OpenAI API response data:', data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const optimizedPrompt = data.choices[0].message.content.trim();
      console.log('OpenAI optimized prompt:', optimizedPrompt);
      return optimizedPrompt;
    } else {
      throw new Error('Invalid response format from OpenAI API');
    }
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

// Call Claude API
async function callClaude(prompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.content[0].text.trim();
}

// Advanced rule-based optimization (Privacy-Safe)
function advancedRuleBasedOptimization(originalPrompt, analysis) {
  console.log('Running advanced rule-based optimization...');
  
  const lowerPrompt = originalPrompt.toLowerCase();
  let optimized = originalPrompt;
  
  // Analyze prompt intent and context
  const intent = analyzePromptIntent(lowerPrompt);
  const context = analyzePromptContext(lowerPrompt);
  const issues = analysis.issues || [];
  
  // Apply context-aware optimizations
  optimized = applyContextOptimizations(optimized, intent, context, issues);
  
  // Apply structure improvements
  optimized = applyStructureImprovements(optimized, intent, context);
  
  // Apply specificity enhancements
  optimized = applySpecificityEnhancements(optimized, intent, context);
  
  // Ensure we never return the original unchanged
  if (optimized === originalPrompt) {
    optimized = createComprehensiveOptimization(originalPrompt, intent, context);
  }
  
  console.log('Advanced optimization complete:', optimized.substring(0, 100) + '...');
  return optimized;
}

// Smart fallback optimization (legacy)
function smartOptimizePrompt(originalPrompt, analysis) {
  const lowerPrompt = originalPrompt.toLowerCase();
  let optimized = originalPrompt;
  
  // Always improve the prompt - never return unchanged
  if (lowerPrompt.includes('cover letter')) {
    optimized = `I need help writing a compelling cover letter. Please provide:
1. A professional structure and format
2. Key sections to include (introduction, body, conclusion)
3. How to highlight relevant skills and experience
4. Tips for making it stand out
5. Common mistakes to avoid
6. A template or example I can follow

Could you help me create an effective cover letter?`;
  } else if (lowerPrompt.includes('big bang')) {
    optimized = `Please explain the Big Bang theory in simple terms, including:
- What the Big Bang theory is and when it happened
- Key evidence that supports this theory
- How the universe evolved from the Big Bang
- Common misconceptions about the theory
- Why this theory is important in cosmology

Make it easy to understand for someone with basic science knowledge.`;
  } else if (lowerPrompt.includes('explain') && originalPrompt.split(' ').length < 5) {
    const topic = originalPrompt.replace(/explain/i, '').trim();
    optimized = `Please provide a comprehensive explanation of ${topic} that includes:
- Clear definition and basic concepts
- Real-world examples and applications
- Why this topic is important or relevant
- Common misconceptions or challenges
- How it relates to everyday life

Make it accessible for someone who is new to this topic.`;
  } else if (lowerPrompt.includes('ai') || lowerPrompt.includes('artificial intelligence')) {
    optimized = `Please explain artificial intelligence in detail, covering:
- What AI is and how it works (in simple terms)
- Different types of AI (narrow vs general AI)
- Current real-world applications and examples
- How AI is changing various industries
- Future implications and potential challenges
- Common misconceptions about AI

Include practical examples that most people can relate to.`;
  } else if (lowerPrompt.includes('write') && lowerPrompt.includes('letter')) {
    optimized = `I need help writing a professional letter. Please provide:
- Proper structure and formatting guidelines
- Key elements that should be included
- Appropriate tone and language suggestions
- Common phrases and templates
- Tips for making it effective
- Examples of different letter types

Could you give me a step-by-step guide?`;
  } else if (lowerPrompt.includes('compare')) {
    optimized += `\n\nPlease provide a detailed comparison including:
- Key differences and similarities between the topics
- Pros and cons of each approach or option
- Real-world examples and use cases
- When to use each option
- Practical recommendations

Structure your response with clear sections and bullet points.`;
  } else if (lowerPrompt.includes('how to')) {
    optimized += `\n\nPlease provide a step-by-step guide including:
- Prerequisites or requirements needed
- Detailed steps with clear explanations
- Tips and best practices for success
- Common mistakes to avoid
- Additional resources or tools that might help

Make it easy to follow and implement.`;
  } else {
    // Generic improvement for any other prompt
    optimized = `Please provide a detailed and comprehensive response about "${originalPrompt}" that includes:
- Clear explanations and definitions
- Practical examples and real-world applications
- Relevant context and background information
- Actionable insights or takeaways
- Common questions or concerns people have about this topic

Make your response informative, engaging, and useful for someone who wants to learn about this.`;
  }
  
  // Ensure we never return the original unchanged
  if (optimized === originalPrompt) {
    optimized = `Please provide a comprehensive and detailed response about "${originalPrompt}" that includes:

1. **Clear Definition**: What exactly is this and why is it important?
2. **Practical Examples**: Real-world applications and use cases
3. **Step-by-Step Guidance**: How to approach or implement this
4. **Common Challenges**: What difficulties people typically face
5. **Best Practices**: Tips and recommendations for success
6. **Resources**: Where to learn more or get help

Make your response actionable, informative, and easy to understand for someone who wants to learn about this topic.`;
  }
  
  return optimized;
}

// Analyze prompt intent
function analyzePromptIntent(lowerPrompt) {
  const intent = {
    type: 'general',
    action: 'request',
    specificity: 'low',
    format: 'none'
  };
  
  // Detect intent type
  if (lowerPrompt.includes('write') || lowerPrompt.includes('create') || lowerPrompt.includes('generate')) {
    intent.type = 'creation';
    intent.action = 'generate';
  } else if (lowerPrompt.includes('explain') || lowerPrompt.includes('describe') || lowerPrompt.includes('what is')) {
    intent.type = 'explanation';
    intent.action = 'explain';
  } else if (lowerPrompt.includes('compare') || lowerPrompt.includes('difference') || lowerPrompt.includes('vs')) {
    intent.type = 'comparison';
    intent.action = 'compare';
  } else if (lowerPrompt.includes('how to') || lowerPrompt.includes('steps') || lowerPrompt.includes('guide')) {
    intent.type = 'instruction';
    intent.action = 'instruct';
  } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('evaluate') || lowerPrompt.includes('assess')) {
    intent.type = 'analysis';
    intent.action = 'analyze';
  }
  
  // Detect specificity
  if (lowerPrompt.includes('specific') || lowerPrompt.includes('detailed') || lowerPrompt.includes('comprehensive')) {
    intent.specificity = 'high';
  } else if (lowerPrompt.includes('brief') || lowerPrompt.includes('simple') || lowerPrompt.includes('quick')) {
    intent.specificity = 'low';
  }
  
  // Detect format requirements
  if (lowerPrompt.includes('list') || lowerPrompt.includes('bullet') || lowerPrompt.includes('points')) {
    intent.format = 'list';
  } else if (lowerPrompt.includes('table') || lowerPrompt.includes('chart') || lowerPrompt.includes('format')) {
    intent.format = 'structured';
  } else if (lowerPrompt.includes('paragraph') || lowerPrompt.includes('essay') || lowerPrompt.includes('story')) {
    intent.format = 'narrative';
  }
  
  return intent;
}

// Analyze prompt context
function analyzePromptContext(lowerPrompt) {
  const context = {
    domain: 'general',
    tone: 'neutral',
    audience: 'general',
    complexity: 'medium'
  };
  
  // Detect domain
  if (lowerPrompt.includes('business') || lowerPrompt.includes('professional') || lowerPrompt.includes('work')) {
    context.domain = 'business';
    context.tone = 'professional';
  } else if (lowerPrompt.includes('technical') || lowerPrompt.includes('code') || lowerPrompt.includes('programming')) {
    context.domain = 'technical';
    context.complexity = 'high';
  } else if (lowerPrompt.includes('creative') || lowerPrompt.includes('story') || lowerPrompt.includes('art')) {
    context.domain = 'creative';
    context.tone = 'casual';
  } else if (lowerPrompt.includes('academic') || lowerPrompt.includes('research') || lowerPrompt.includes('study')) {
    context.domain = 'academic';
    context.tone = 'formal';
  }
  
  // Detect audience
  if (lowerPrompt.includes('beginner') || lowerPrompt.includes('simple') || lowerPrompt.includes('basic')) {
    context.audience = 'beginner';
    context.complexity = 'low';
  } else if (lowerPrompt.includes('expert') || lowerPrompt.includes('advanced') || lowerPrompt.includes('professional')) {
    context.audience = 'expert';
    context.complexity = 'high';
  }
  
  return context;
}

// Apply context-aware optimizations
function applyContextOptimizations(prompt, intent, context, issues) {
  let optimized = prompt;
  
  // Add context-specific improvements
  if (context.domain === 'business') {
    optimized = addBusinessContext(optimized);
  } else if (context.domain === 'technical') {
    optimized = addTechnicalContext(optimized);
  } else if (context.domain === 'academic') {
    optimized = addAcademicContext(optimized);
  }
  
  // Add intent-specific improvements
  if (intent.type === 'creation') {
    optimized = addCreationContext(optimized, context);
  } else if (intent.type === 'explanation') {
    optimized = addExplanationContext(optimized, context);
  } else if (intent.type === 'comparison') {
    optimized = addComparisonContext(optimized);
  } else if (intent.type === 'instruction') {
    optimized = addInstructionContext(optimized, context);
  }
  
  return optimized;
}

// Apply structure improvements
function applyStructureImprovements(prompt, intent, context) {
  let optimized = prompt;
  
  // Add structure based on intent
  if (intent.type === 'comparison') {
    optimized += '\n\nPlease provide a structured comparison including:\n- Key differences\n- Similarities\n- Pros and cons\n- Recommendations';
  } else if (intent.type === 'instruction') {
    optimized += '\n\nPlease provide step-by-step instructions including:\n- Prerequisites\n- Detailed steps\n- Tips and warnings\n- Expected outcomes';
  } else if (intent.type === 'analysis') {
    optimized += '\n\nPlease provide a comprehensive analysis including:\n- Key factors\n- Evidence and examples\n- Implications\n- Recommendations';
  }
  
  return optimized;
}

// Apply specificity enhancements
function applySpecificityEnhancements(prompt, intent, context) {
  let optimized = prompt;
  
  // Add specificity based on context
  if (context.audience === 'beginner') {
    optimized += '\n\nPlease explain in simple terms and provide examples that beginners can understand.';
  } else if (context.audience === 'expert') {
    optimized += '\n\nPlease provide detailed, technical information suitable for professionals in this field.';
  }
  
  // Add format requirements
  if (intent.format === 'list') {
    optimized += '\n\nPlease provide your response in a clear, bullet-pointed format.';
  } else if (intent.format === 'structured') {
    optimized += '\n\nPlease structure your response with clear sections and headings.';
  }
  
  return optimized;
}

// Create comprehensive optimization
function createComprehensiveOptimization(prompt, intent, context) {
  return `Please provide a comprehensive and detailed response about "${prompt}" that includes:

1. **Clear Definition**: What exactly is this and why is it important?
2. **Practical Examples**: Real-world applications and use cases
3. **Step-by-Step Guidance**: How to approach or implement this
4. **Common Challenges**: What difficulties people typically face
5. **Best Practices**: Tips and recommendations for success
6. **Resources**: Where to learn more or get help

Make your response actionable, informative, and easy to understand for someone who wants to learn about this topic.`;
}

// Context-specific optimization helpers
function addBusinessContext(prompt) {
  return prompt + '\n\nPlease provide a professional, business-focused response with practical applications and ROI considerations.';
}

function addTechnicalContext(prompt) {
  return prompt + '\n\nPlease provide technical details, code examples where relevant, and implementation considerations.';
}

function addAcademicContext(prompt) {
  return prompt + '\n\nPlease provide a well-researched response with citations, evidence, and academic rigor.';
}

function addCreationContext(prompt, context) {
  return prompt + '\n\nPlease provide a detailed guide for creating this, including requirements, steps, and best practices.';
}

function addExplanationContext(prompt, context) {
  return prompt + '\n\nPlease provide a clear explanation with examples, analogies, and practical applications.';
}

function addComparisonContext(prompt) {
  return prompt + '\n\nPlease provide a detailed comparison with clear criteria, examples, and recommendations.';
}

function addInstructionContext(prompt, context) {
  return prompt + '\n\nPlease provide step-by-step instructions with prerequisites, tips, and expected outcomes.';
}

// Test API key
async function testApiKey(apiKey) {
  try {
    console.log('Testing API key...');
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return { success: false, error: 'Invalid API key format' };
    }
    
    // Make a simple test call to OpenAI
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.ok) {
      console.log('API key test successful');
      return { success: true };
    } else {
      const errorData = await response.json();
      console.log('API key test failed:', errorData);
      return { success: false, error: errorData.error?.message || 'API key validation failed' };
    }
  } catch (error) {
    console.error('API key test error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Update settings
async function updateSettings(newSettings) {
  const result = await chrome.storage.local.get(['settings']);
  const currentSettings = result.settings || {};
  
  const updatedSettings = { ...currentSettings, ...newSettings };
  await chrome.storage.local.set({ settings: updatedSettings });
  
  return { success: true, settings: updatedSettings };
}

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const supportedPlatforms = [
      'chat.openai.com',
      'claude.ai',
      'x.ai',
      'gemini.google.com'
    ];
    
    const isSupported = supportedPlatforms.some(platform => 
      tab.url.includes(platform)
    );
    
    if (isSupported) {
      // Inject content script if not already injected
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(() => {
        // Script might already be injected, ignore error
      });
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup or show quick analysis
  if (tab.url && tab.url.includes('chat.openai.com')) {
    // For now, just log the action
    console.log('Prompt Tracer: Extension icon clicked');
  }
}); 