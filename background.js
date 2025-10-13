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
  const metrics = analysis.metrics || {};
  const issues = analysis.issues ? analysis.issues.map(issue => `- ${issue.issue}`).join('\n') : '';
  const score = analysis.overallScore || 0;
  
  return `You are an expert prompt engineer specializing in AI interaction optimization. Your task is to transform the following prompt into a highly effective, professional-grade prompt that will generate superior AI responses.

ORIGINAL PROMPT:
"${originalPrompt}"

DETAILED ANALYSIS:
- Overall Quality Score: ${score}/100
- Clarity: ${Math.round((metrics.clarity || 0) * 100)}%
- Specificity: ${Math.round((metrics.specificity || 0) * 100)}%
- Structure: ${Math.round((metrics.structure || 0) * 100)}%
- Context: ${Math.round((metrics.context || 0) * 100)}%
- Intent: ${Math.round((metrics.intent || 0) * 100)}%
- Completeness: ${Math.round((metrics.completeness || 0) * 100)}%
- Creativity: ${Math.round((metrics.creativity || 0) * 100)}%
- Precision: ${Math.round((metrics.precision || 0) * 100)}%
- Engagement: ${Math.round((metrics.engagement || 0) * 100)}%

OPTIMIZATION REQUIREMENTS:
Transform this prompt into a masterful prompt that excels in ALL these areas:

1. **CLARITY & PRECISION**: Use crystal-clear language with specific, actionable instructions
2. **COMPREHENSIVE CONTEXT**: Provide rich background information and domain context
3. **STRUCTURED FORMAT**: Organize with clear sections, bullet points, or numbered steps
4. **SPECIFIC OUTPUT FORMAT**: Define exactly what format, length, and style you want
5. **ENGAGING TONE**: Make it compelling and interesting for the AI to respond to
6. **TECHNICAL EXCELLENCE**: Use precise terminology and professional language
7. **CREATIVE ELEMENTS**: Include innovative approaches or unique perspectives
8. **ADAPTABILITY**: Allow for flexibility while maintaining focus

ADVANCED TECHNIQUES TO APPLY:
- Use role-playing ("Act as a...", "You are a...")
- Include examples and templates when helpful
- Specify the audience or expertise level
- Add constraints and requirements
- Use progressive disclosure ("First... then... finally...")
- Include quality criteria ("Ensure that...", "Make sure to...")
- Add creative constraints ("Think outside the box...", "Consider unconventional approaches...")

OUTPUT FORMAT:
Provide ONLY the optimized prompt. No explanations, no meta-commentary. The optimized prompt should be significantly better than the original and ready to use immediately.

OPTIMIZED PROMPT:

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
  const metrics = analysis.metrics || {};
  
  // Analyze prompt intent and context
  const intent = analyzePromptIntent(lowerPrompt);
  const context = analyzePromptContext(lowerPrompt);
  const issues = analysis.issues || [];
  
  // Enhanced optimization based on metrics
  optimized = applyMetricBasedOptimization(optimized, metrics, intent, context);
  
  // Apply context-aware optimizations
  optimized = applyContextOptimizations(optimized, intent, context, issues);
  
  // Apply structure improvements
  optimized = applyStructureImprovements(optimized, intent, context);
  
  // Apply specificity enhancements
  optimized = applySpecificityEnhancements(optimized, intent, context);
  
  // Apply creativity and engagement improvements
  optimized = applyCreativityEnhancements(optimized, metrics);
  
  // Apply technical quality improvements
  optimized = applyTechnicalQualityImprovements(optimized, metrics);
  
  // Apply output potential improvements
  optimized = applyOutputPotentialImprovements(optimized, metrics);
  
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

// Enhanced optimization functions for better prompt quality

// Apply metric-based optimization
function applyMetricBasedOptimization(prompt, metrics, intent, context) {
  let optimized = prompt;
  
  // Improve clarity if score is low
  if (metrics.clarity < 0.6) {
    optimized = improveClarity(optimized);
  }
  
  // Improve specificity if score is low
  if (metrics.specificity < 0.6) {
    optimized = improveSpecificity(optimized, context);
  }
  
  // Improve structure if score is low
  if (metrics.structure < 0.6) {
    optimized = improveStructure(optimized, intent);
  }
  
  // Improve context if score is low
  if (metrics.context < 0.6) {
    optimized = improveContext(optimized, context);
  }
  
  // Improve creativity if score is low
  if (metrics.creativity < 0.5) {
    optimized = improveCreativity(optimized, intent);
  }
  
  // Improve engagement if score is low
  if (metrics.engagement < 0.5) {
    optimized = improveEngagement(optimized);
  }
  
  return optimized;
}

// Improve prompt clarity
function improveClarity(prompt) {
  let improved = prompt;
  
  // Add clear action verbs
  if (!improved.toLowerCase().includes('please') && !improved.toLowerCase().includes('create') && 
      !improved.toLowerCase().includes('write') && !improved.toLowerCase().includes('generate')) {
    improved = `Please ${improved.toLowerCase()}`;
  }
  
  // Break down complex sentences
  if (improved.includes(' and ') && improved.length > 100) {
    improved = improved.replace(/ and /g, '.\n\nAdditionally, ');
  }
  
  // Add specific instructions
  if (!improved.includes(':')) {
    improved = improved.replace(/^(.+?)(\.|$)/, '$1:\n\n');
  }
  
  return improved;
}

// Improve prompt specificity
function improveSpecificity(prompt, context) {
  let improved = prompt;
  
  // Add domain-specific context
  if (context === 'technical' && !improved.toLowerCase().includes('technical')) {
    improved = `In a technical context, ${improved.toLowerCase()}`;
  } else if (context === 'business' && !improved.toLowerCase().includes('business')) {
    improved = `From a business perspective, ${improved.toLowerCase()}`;
  } else if (context === 'creative' && !improved.toLowerCase().includes('creative')) {
    improved = `With a creative approach, ${improved.toLowerCase()}`;
  }
  
  // Add specific examples if missing
  if (!improved.toLowerCase().includes('example') && !improved.toLowerCase().includes('for instance')) {
    improved += '\n\nPlease provide specific examples to illustrate your points.';
  }
  
  // Add measurable criteria
  if (!improved.toLowerCase().includes('length') && !improved.toLowerCase().includes('words')) {
    improved += '\n\nSpecify the desired length and format of the response.';
  }
  
  return improved;
}

// Improve prompt structure
function improveStructure(prompt, intent) {
  let improved = prompt;
  
  // Add structured format for complex requests
  if (intent === 'analysis' || intent === 'comparison') {
    if (!improved.includes('1.') && !improved.includes('•')) {
      improved = improved.replace(/^(.+?)(\.|$)/, '$1:\n\n1. \n2. \n3. ');
    }
  }
  
  // Add clear sections
  if (improved.length > 150 && !improved.includes('\n\n')) {
    improved = improved.replace(/([.!?])\s+/g, '$1\n\n');
  }
  
  return improved;
}

// Improve prompt context
function improveContext(prompt, context) {
  let improved = prompt;
  
  // Add background information
  if (context === 'technical' && !improved.toLowerCase().includes('background')) {
    improved = `Background: Provide relevant technical context.\n\n${improved}`;
  } else if (context === 'business' && !improved.toLowerCase().includes('background')) {
    improved = `Background: Consider business implications and market context.\n\n${improved}`;
  }
  
  // Add target audience
  if (!improved.toLowerCase().includes('audience') && !improved.toLowerCase().includes('reader')) {
    improved += '\n\nPlease tailor your response for a general audience.';
  }
  
  return improved;
}

// Improve prompt creativity
function improveCreativity(prompt, intent) {
  let improved = prompt;
  
  // Add creative constraints
  if (!improved.toLowerCase().includes('innovative') && !improved.toLowerCase().includes('creative')) {
    improved = improved.replace(/^(.+?)(\.|$)/, '$1 using innovative and creative approaches.');
  }
  
  // Add brainstorming elements
  if (intent === 'generation' || intent === 'creation') {
    improved += '\n\nConsider multiple perspectives and think outside the box.';
  }
  
  return improved;
}

// Improve prompt engagement
function improveEngagement(prompt) {
  let improved = prompt;
  
  // Add interactive elements
  if (!improved.toLowerCase().includes('you') && !improved.toLowerCase().includes('your')) {
    improved = improved.replace(/^(.+?)(\.|$)/, 'You are an expert in this field. $1');
  }
  
  // Add collaborative tone
  if (!improved.toLowerCase().includes('together') && !improved.toLowerCase().includes('collaborate')) {
    improved += '\n\nLet\'s work together to create something exceptional.';
  }
  
  return improved;
}

// Apply creativity enhancements
function applyCreativityEnhancements(prompt, metrics) {
  if (metrics.creativity < 0.6) {
    return improveCreativity(prompt, 'general');
  }
  return prompt;
}

// Apply technical quality improvements
function applyTechnicalQualityImprovements(prompt, metrics) {
  if (metrics.technical_quality < 0.6) {
    let improved = prompt;
    
    // Add technical precision
    if (!improved.toLowerCase().includes('precise') && !improved.toLowerCase().includes('accurate')) {
      improved += '\n\nPlease ensure technical accuracy and precision in your response.';
    }
    
    // Add methodology
    if (!improved.toLowerCase().includes('method') && !improved.toLowerCase().includes('approach')) {
      improved += '\n\nExplain your methodology and reasoning process.';
    }
    
    return improved;
  }
  return prompt;
}

// Apply output potential improvements
function applyOutputPotentialImprovements(prompt, metrics) {
  if (metrics.output_potential < 0.6) {
    let improved = prompt;
    
    // Add comprehensive requirements
    if (!improved.toLowerCase().includes('comprehensive') && !improved.toLowerCase().includes('thorough')) {
      improved = improved.replace(/^(.+?)(\.|$)/, '$1 in a comprehensive and thorough manner.');
    }
    
    // Add quality standards
    if (!improved.toLowerCase().includes('quality') && !improved.toLowerCase().includes('professional')) {
      improved += '\n\nEnsure high-quality, professional-level output.';
    }
    
    // Add specific deliverables
    if (!improved.toLowerCase().includes('include') && !improved.toLowerCase().includes('provide')) {
      improved += '\n\nInclude actionable insights and practical recommendations.';
    }
    
    return improved;
  }
  return prompt;
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