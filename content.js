/**
 * Content script for detecting and capturing prompts from LLM platforms
 */

// Inline the classes to avoid ES6 module issues in browser extensions
class PromptData {
  constructor(prompt, platform, context = {}) {
    this.id = this.generateId();
    this.prompt = prompt;
    this.platform = platform; // 'gpt', 'claude', 'grok', 'gemini'
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.metrics = new PromptMetrics();
    this.optimizedVersion = null;
    this.response = null;
    this.userRating = null;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  setResponse(response) {
    this.response = response;
    this.metrics.calculateMetrics(this.prompt, response);
  }

  setUserRating(rating) {
    this.userRating = rating;
    this.metrics.userSatisfaction = rating;
  }

  setOptimizedVersion(optimizedPrompt) {
    this.optimizedVersion = optimizedPrompt;
  }
}

class PromptMetrics {
  constructor() {
    this.clarity = 0;
    this.specificity = 0;
    this.completeness = 0;
    this.relevance = 0;
    this.userSatisfaction = 0;
    this.responseTime = 0;
    this.tokenCount = 0;
    this.overallScore = 0;
  }

  calculateMetrics(prompt, response) {
    this.clarity = this.calculateClarity(prompt);
    this.specificity = this.calculateSpecificity(prompt);
    this.completeness = this.calculateCompleteness(prompt);
    this.relevance = this.calculateRelevance(prompt, response);
    this.tokenCount = this.estimateTokenCount(prompt);
    this.calculateOverallScore();
  }

  calculateClarity(prompt) {
    // Simple clarity scoring based on sentence structure and readability
    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    // Shorter sentences generally indicate clearer communication
    if (avgSentenceLength <= 15) return 0.9;
    if (avgSentenceLength <= 20) return 0.7;
    if (avgSentenceLength <= 25) return 0.5;
    return 0.3;
  }

  calculateSpecificity(prompt) {
    // Check for specific details, numbers, examples
    const specificIndicators = [
      /\d+/, // numbers
      /example/i,
      /specific/i,
      /detailed/i,
      /concrete/i
    ];
    
    const matches = specificIndicators.filter(regex => regex.test(prompt)).length;
    return Math.min(1.0, matches * 0.2);
  }

  calculateCompleteness(prompt) {
    // Check for essential prompt elements
    const completenessIndicators = [
      /what/i,
      /how/i,
      /why/i,
      /when/i,
      /where/i,
      /who/i,
      /please/i,
      /explain/i,
      /describe/i,
      /analyze/i
    ];
    
    const matches = completenessIndicators.filter(regex => regex.test(prompt)).length;
    return Math.min(1.0, matches * 0.15);
  }

  calculateRelevance(prompt, response) {
    // Simple relevance check - can be enhanced with more sophisticated NLP
    if (!response) return 0.5;
    
    const promptWords = new Set(prompt.toLowerCase().split(/\s+/));
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    
    const commonWords = [...promptWords].filter(word => responseWords.has(word));
    return Math.min(1.0, commonWords.length / Math.max(promptWords.size, 1) * 2);
  }

  estimateTokenCount(text) {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  calculateOverallScore() {
    // Enhanced scoring with more sophisticated weighting
    const baseScore = (
      this.clarity * 0.25 +
      this.specificity * 0.25 +
      this.completeness * 0.2 +
      this.relevance * 0.2 +
      this.userSatisfaction * 0.1
    );

    // Bonus points for well-structured prompts
    let bonus = 0;
    if (this.clarity > 0.8 && this.specificity > 0.7) bonus += 0.1;
    if (this.completeness > 0.8) bonus += 0.05;
    if (this.tokenCount > 50 && this.tokenCount < 200) bonus += 0.05; // Optimal length

    this.overallScore = Math.min(1.0, baseScore + bonus);
  }
}

class PromptOptimizer {
  constructor() {
    this.optimizationRules = this.initializeOptimizationRules();
  }

  initializeOptimizationRules() {
    return {
      clarity: {
        name: "Improve Clarity",
        patterns: [
          {
            issue: "Run-on sentences",
            pattern: /[^.!?]{100,}/,
            suggestion: "Break into shorter, focused sentences"
          },
          {
            issue: "Vague language",
            pattern: /\b(good|bad|nice|interesting|stuff|things)\b/gi,
            suggestion: "Use more specific and descriptive language"
          },
          {
            issue: "Ambiguous pronouns",
            pattern: /\b(it|this|that|these|those)\b/gi,
            suggestion: "Replace pronouns with specific nouns for clarity"
          }
        ]
      },
      specificity: {
        name: "Add Specificity",
        patterns: [
          {
            issue: "Missing context",
            pattern: /\b(explain|describe|analyze)\b/gi,
            suggestion: "Add specific context, examples, or constraints"
          },
          {
            issue: "No target audience",
            pattern: /^(?!.*\b(for|to|as|like)\b)/i,
            suggestion: "Specify your target audience or expertise level"
          },
          {
            issue: "No constraints or limitations",
            pattern: /^(?!.*\b(within|limit|only|max|min)\b)/i,
            suggestion: "Add constraints or limitations to focus the response"
          }
        ]
      },
      structure: {
        name: "Improve Structure",
        patterns: [
          {
            issue: "No clear objective",
            pattern: /^(?!.*\b(goal|objective|purpose|aim)\b)/i,
            suggestion: "Start with a clear objective or goal"
          },
          {
            issue: "Missing format specification",
            pattern: /^(?!.*\b(format|output|response|answer)\b)/i,
            suggestion: "Specify desired output format or structure"
          },
          {
            issue: "No step-by-step guidance",
            pattern: /^(?!.*\b(step|first|then|finally|process)\b)/i,
            suggestion: "Request step-by-step guidance for complex tasks"
          }
        ]
      },
      engagement: {
        name: "Enhance Engagement",
        patterns: [
          {
            issue: "No examples requested",
            pattern: /^(?!.*\b(example|instance|case|scenario)\b)/i,
            suggestion: "Request specific examples or case studies"
          },
          {
            issue: "No comparison requested",
            pattern: /^(?!.*\b(compare|versus|vs|difference|similar)\b)/i,
            suggestion: "Ask for comparisons to provide better context"
          },
          {
            issue: "No practical application",
            pattern: /^(?!.*\b(apply|practice|real-world|practical)\b)/i,
            suggestion: "Request practical applications or real-world examples"
          }
        ]
      }
    };
  }

  analyzePrompt(prompt) {
    const analysis = {
      metrics: {},
      insights: [],
      suggestions: [],
      quality: 'developing'
    };
    
    // Dynamic metrics that develop as user writes
    const metrics = this.calculateDynamicMetrics(prompt);
    const insights = this.generateInsights(prompt, metrics);
    const suggestions = this.generateSuggestions(prompt, metrics);
    const quality = this.determineQuality(metrics);
    
    analysis.metrics = metrics;
    analysis.insights = insights;
    analysis.suggestions = suggestions;
    analysis.quality = quality;
    
    return analysis;
  }
  
  calculateDynamicMetrics(promptText) {
    const metrics = {
      clarity: 0,
      specificity: 0,
      structure: 0,
      context: 0,
      intent: 0,
      completeness: 0
    };
    
    const words = promptText.split(' ').filter(word => word.length > 0);
    const sentences = promptText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = promptText.split('\n\n').filter(p => p.trim().length > 0);
    
    // Clarity Score (0-100)
    metrics.clarity = this.calculateClarityScore(promptText, words, sentences);
    
    // Specificity Score (0-100)
    metrics.specificity = this.calculateSpecificityScore(promptText, words);
    
    // Structure Score (0-100)
    metrics.structure = this.calculateStructureScore(promptText, sentences, paragraphs);
    
    // Context Score (0-100)
    metrics.context = this.calculateContextScore(promptText, words);
    
    // Intent Score (0-100)
    metrics.intent = this.calculateIntentScore(promptText, words);
    
    // Completeness Score (0-100)
    metrics.completeness = this.calculateCompletenessScore(promptText, words, sentences);
    
    return metrics;
  }
  
  calculateClarityScore(text, words, sentences) {
    let score = 50; // Base score
    
    // Length analysis
    if (words.length < 5) score -= 30;
    else if (words.length < 15) score -= 15;
    else if (words.length > 100) score -= 10;
    else score += 10;
    
    // Sentence structure
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    if (avgSentenceLength < 5) score -= 10;
    else if (avgSentenceLength > 25) score -= 15;
    else score += 10;
    
    // Readability indicators
    if (text.includes('?')) score += 10;
    if (text.includes('!')) score += 5;
    if (text.includes(':')) score += 5;
    
    // Clarity words
    const clarityWords = ['explain', 'describe', 'show', 'demonstrate', 'illustrate'];
    clarityWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 5;
    });
    
    return Math.max(0, Math.min(100, score));
  }
  
  calculateSpecificityScore(text, words) {
    let score = 30; // Base score
    
    // Specific words
    const specificWords = ['specific', 'detailed', 'concrete', 'particular', 'exact'];
    specificWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 10;
    });
    
    // Numbers and measurements
    const numbers = text.match(/\d+/g);
    if (numbers) score += numbers.length * 5;
    
    // Named entities
    const namedEntities = text.match(/[A-Z][a-z]+/g);
    if (namedEntities) score += Math.min(namedEntities.length * 3, 20);
    
    // Technical terms
    const technicalTerms = text.match(/\b[A-Z]{2,}\b/g);
    if (technicalTerms) score += Math.min(technicalTerms.length * 2, 15);
    
    // Context words
    const contextWords = ['for', 'about', 'regarding', 'concerning', 'related to'];
    contextWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 5;
    });
    
    return Math.max(0, Math.min(100, score));
  }
  
  calculateStructureScore(text, sentences, paragraphs) {
    let score = 40; // Base score
    
    // Paragraph structure
    if (paragraphs.length > 1) score += 15;
    
    // Sentence variety
    const questionSentences = sentences.filter(s => s.includes('?'));
    const commandSentences = sentences.filter(s => s.includes('!'));
    const declarativeSentences = sentences.filter(s => !s.includes('?') && !s.includes('!'));
    
    if (questionSentences.length > 0) score += 10;
    if (commandSentences.length > 0) score += 5;
    if (declarativeSentences.length > 0) score += 10;
    
    // Formatting indicators
    if (text.includes('\n')) score += 10;
    if (text.includes('-')) score += 5;
    if (text.includes('•')) score += 5;
    
    // Structure words
    const structureWords = ['first', 'second', 'finally', 'next', 'then', 'also', 'however'];
    structureWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 3;
    });
    
    return Math.max(0, Math.min(100, score));
  }
  
  calculateContextScore(text, words) {
    let score = 25; // Base score
    
    // Domain indicators
    const domains = {
      business: ['business', 'professional', 'company', 'industry', 'market'],
      technical: ['code', 'programming', 'software', 'technical', 'algorithm'],
      academic: ['research', 'study', 'analysis', 'academic', 'theoretical'],
      creative: ['creative', 'story', 'art', 'design', 'imaginative']
    };
    
    Object.entries(domains).forEach(([domain, keywords]) => {
      keywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword)) score += 8;
      });
    });
    
    // Audience indicators
    const audienceWords = ['beginner', 'expert', 'professional', 'student', 'user'];
    audienceWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 10;
    });
    
    // Purpose indicators
    const purposeWords = ['goal', 'objective', 'purpose', 'aim', 'target'];
    purposeWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 8;
    });
    
    return Math.max(0, Math.min(100, score));
  }
  
  calculateIntentScore(text, words) {
    let score = 35; // Base score
    
    // Action words
    const actionWords = ['write', 'create', 'explain', 'analyze', 'compare', 'evaluate'];
    actionWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 12;
    });
    
    // Request indicators
    if (text.includes('please') || text.includes('can you') || text.includes('could you')) {
      score += 10;
    }
    
    // Question indicators
    if (text.includes('?')) score += 15;
    
    // Command indicators
    if (text.includes('!')) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  calculateCompletenessScore(text, words, sentences) {
    let score = 30; // Base score
    
    // Length completeness
    if (words.length > 20) score += 15;
    if (sentences.length > 2) score += 10;
    
    // Detail indicators
    const detailWords = ['detailed', 'comprehensive', 'complete', 'thorough', 'extensive'];
    detailWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 8;
    });
    
    // Example indicators
    if (text.toLowerCase().includes('example') || text.toLowerCase().includes('instance')) {
      score += 10;
    }
    
    // Format indicators
    if (text.toLowerCase().includes('format') || text.toLowerCase().includes('style')) {
      score += 8;
    }
    
    // Constraint indicators
    if (text.toLowerCase().includes('limit') || text.toLowerCase().includes('maximum')) {
      score += 8;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  generateInsights(text, metrics) {
    const insights = [];
    
    // Overall quality insight
    const avgScore = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;
    if (avgScore < 30) {
      insights.push({
        type: 'improvement',
        message: 'Your prompt is quite basic. Consider adding more details and context.',
        icon: '📝'
      });
    } else if (avgScore < 60) {
      insights.push({
        type: 'development',
        message: 'Good start! Your prompt could benefit from more structure and specificity.',
        icon: '🚀'
      });
    } else {
      insights.push({
        type: 'excellent',
        message: 'Well-crafted prompt! You\'re using effective prompt engineering techniques.',
        icon: '✨'
      });
    }
    
    // Specific insights based on metrics
    if (metrics.clarity < 40) {
      insights.push({
        type: 'clarity',
        message: 'Try to be more clear and direct in your request.',
        icon: '🎯'
      });
    }
    
    if (metrics.specificity < 40) {
      insights.push({
        type: 'specificity',
        message: 'Add more specific details to get better results.',
        icon: '📊'
      });
    }
    
    if (metrics.structure < 40) {
      insights.push({
        type: 'structure',
        message: 'Organize your prompt with clear sections or bullet points.',
        icon: '📋'
      });
    }
    
    return insights;
  }
  
  generateSuggestions(text, metrics) {
    const suggestions = [];
    
    // Context suggestions
    if (metrics.context < 50) {
      suggestions.push('Add context about your audience or domain');
    }
    
    // Specificity suggestions
    if (metrics.specificity < 50) {
      suggestions.push('Include specific examples or constraints');
    }
    
    // Structure suggestions
    if (metrics.structure < 50) {
      suggestions.push('Use bullet points or numbered lists for clarity');
    }
    
    // Completeness suggestions
    if (metrics.completeness < 50) {
      suggestions.push('Specify the desired format or length');
    }
    
    return suggestions;
  }
  
  determineQuality(metrics) {
    const avgScore = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;
    
    if (avgScore < 30) return 'basic';
    if (avgScore < 50) return 'developing';
    if (avgScore < 70) return 'good';
    if (avgScore < 85) return 'excellent';
    return 'masterful';
  }

  generateOptimizedVersion(originalPrompt, issues) {
    let optimized = originalPrompt;
    const improvements = [];

    // Only apply improvements if there are actual issues
    if (issues.length === 0) {
      return {
        prompt: originalPrompt,
        improvements: ["No improvements needed - prompt is well-structured!"]
      };
    }

    // Apply improvements based on identified issues
    issues.forEach(issue => {
      switch (issue.category) {
        case "Improve Clarity":
          if (issue.issue === "Run-on sentences") {
            optimized = this.breakLongSentences(optimized);
            improvements.push("Broke long sentences into shorter ones");
          }
          if (issue.issue === "Vague language") {
            optimized = this.replaceVagueLanguage(optimized);
            improvements.push("Replaced vague terms with specific language");
          }
          break;

        case "Add Specificity":
          if (issue.issue === "Missing context") {
            optimized = this.addContext(optimized);
            improvements.push("Added specific context and examples");
          }
          if (issue.issue === "No target audience") {
            optimized = this.addTargetAudience(optimized);
            improvements.push("Specified target audience");
          }
          break;

        case "Improve Structure":
          if (issue.issue === "No clear objective") {
            optimized = this.addObjective(optimized);
            improvements.push("Added clear objective");
          }
          if (issue.issue === "Missing format specification") {
            optimized = this.addFormatSpecification(optimized);
            improvements.push("Specified output format");
          }
          break;
      }
    });

    // Only return the optimized version if it's actually different
    if (optimized.trim() === originalPrompt.trim()) {
      return {
        prompt: originalPrompt,
        improvements: ["Prompt is already well-optimized!"]
      };
    }

    return {
      prompt: optimized,
      improvements: improvements
    };
  }

  breakLongSentences(prompt) {
    // Simple sentence breaking logic
    return prompt.replace(/([.!?])\s+/g, '$1\n\n');
  }

  replaceVagueLanguage(prompt) {
    const vagueReplacements = {
      'good': 'effective',
      'bad': 'ineffective',
      'nice': 'well-designed',
      'interesting': 'noteworthy',
      'stuff': 'elements',
      'things': 'components'
    };

    let result = prompt;
    Object.entries(vagueReplacements).forEach(([vague, specific]) => {
      const regex = new RegExp(`\\b${vague}\\b`, 'gi');
      result = result.replace(regex, specific);
    });

    return result;
  }

  addContext(prompt) {
    // Only add context for very generic requests
    const lowerPrompt = prompt.toLowerCase();
    if ((lowerPrompt.includes('explain') || lowerPrompt.includes('describe')) && 
        prompt.split(' ').length < 8) {
      return `Please provide a detailed explanation with specific examples and practical applications. ${prompt}`;
    }
    return prompt;
  }

  addTargetAudience(prompt) {
    // Only add target audience for very generic requests
    const lowerPrompt = prompt.toLowerCase();
    if (!lowerPrompt.includes('for') && !lowerPrompt.includes('to') && 
        !lowerPrompt.includes('as a') && !lowerPrompt.includes('from') &&
        prompt.split(' ').length < 10) {
      return `For someone with intermediate knowledge in this field, ${prompt}`;
    }
    return prompt;
  }

  addObjective(prompt) {
    // Only add objective for very generic requests
    const lowerPrompt = prompt.toLowerCase();
    if (!lowerPrompt.includes('goal') && !lowerPrompt.includes('objective') && 
        !lowerPrompt.includes('help me') && !lowerPrompt.includes('i need') &&
        !lowerPrompt.includes('can you') && !lowerPrompt.includes('please') &&
        prompt.split(' ').length < 8) {
      return `My goal is to ${prompt}`;
    }
    return prompt;
  }

  addFormatSpecification(prompt) {
    // Only add format for complex requests that would benefit from structure
    const lowerPrompt = prompt.toLowerCase();
    if (!lowerPrompt.includes('format') && !lowerPrompt.includes('output') && 
        !lowerPrompt.includes('list') && !lowerPrompt.includes('steps') &&
        (lowerPrompt.includes('explain') || lowerPrompt.includes('describe') || 
         lowerPrompt.includes('analyze') || lowerPrompt.includes('compare'))) {
      return `${prompt}\n\nPlease provide your response in a clear, structured format with bullet points or numbered lists where appropriate.`;
    }
    return prompt;
  }

  getPromptTemplates() {
    return {
      analysis: "Analyze [topic/subject] by examining [specific aspects]. Focus on [key points] and provide [type of insights].",
      explanation: "Explain [concept] to someone with [expertise level] background. Include [specific examples] and [practical applications].",
      comparison: "Compare [item A] and [item B] based on [criteria]. Highlight [key differences] and [similarities].",
      recommendation: "Based on [context/situation], recommend [type of solution] that considers [constraints/requirements]."
    };
  }
}

class PromptTracer {
  constructor() {
    this.platform = this.detectPlatform();
    this.optimizer = new PromptOptimizer();
    this.isCapturing = false;
    this.currentPrompt = null;
    this.init();
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('openai.com') || hostname.includes('chat.openai.com') || hostname.includes('chatgpt.com')) {
      return 'gpt';
    } else if (hostname.includes('claude.ai')) {
      return 'claude';
    } else if (hostname.includes('x.ai') || hostname.includes('grok')) {
      return 'grok';
    } else if (hostname.includes('gemini.google.com')) {
      return 'gemini';
    }
    return 'unknown';
  }

  init() {
    try {
      console.log('Prompt Tracer: init() called');
      if (this.platform === 'unknown') {
        console.log('Prompt Tracer: Platform not supported');
        return;
      }

      console.log(`Prompt Tracer: Initialized for ${this.platform}`);
      this.setupEventListeners();
      this.setupMutationObserver();
      this.injectUI();
      this.startAutoMonitoring();
      
      // Check if tutorial should be shown
      this.checkTutorial();
      
      console.log('Prompt Tracer: init() completed');
    } catch (error) {
      console.error('Prompt Tracer: Initialization failed:', error);
      this.showErrorNotification('Failed to initialize Prompt Tracer. Please refresh the page.');
    }
  }

  async checkTutorial() {
    try {
      // Mark as first install if not already marked
      chrome.storage.local.get(['firstInstall'], (result) => {
        if (!result.firstInstall) {
          InteractiveTutorial.markFirstInstall();
        }
      });

      // Check if tutorial should be shown
      const shouldShow = await InteractiveTutorial.shouldShowTutorial();
      if (shouldShow) {
        // Wait a bit for page to load, then show tutorial
        setTimeout(() => {
          const tutorial = new InteractiveTutorial();
          tutorial.start();
        }, 2000);
      }
    } catch (error) {
      console.error('Tutorial check failed:', error);
    }
  }

  setupEventListeners() {
    // Listen for form submissions and button clicks
    document.addEventListener('submit', this.handleSubmit.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
    
    // Listen for keyboard events to detect when user is typing
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  setupMutationObserver() {
    // Watch for DOM changes to detect new messages
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.detectNewMessages();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  handleSubmit(event) {
    // Capture form submissions that might contain prompts
    const form = event.target;
    const textarea = form.querySelector('textarea');
    if (textarea && textarea.value.trim()) {
      this.capturePrompt(textarea.value.trim());
    }
  }

  handleClick(event) {
    // Capture button clicks that might send prompts
    const button = event.target;
    if (button.textContent.toLowerCase().includes('send') || 
        button.textContent.toLowerCase().includes('submit')) {
      this.findAndCapturePrompt();
    }
  }

  handleKeydown(event) {
    // Detect Ctrl+Enter or Cmd+Enter for sending messages
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      setTimeout(() => this.findAndCapturePrompt(), 100);
    }
  }

  findAndCapturePrompt() {
    console.log('findAndCapturePrompt called, platform:', this.platform);
    // Platform-specific prompt detection
    switch (this.platform) {
      case 'gpt':
        console.log('Capturing GPT prompt...');
        this.captureGPTPrompt();
        break;
      case 'claude':
        console.log('Capturing Claude prompt...');
        this.captureClaudePrompt();
        break;
      case 'grok':
        console.log('Capturing Grok prompt...');
        this.captureGrokPrompt();
        break;
      case 'gemini':
        console.log('Capturing Gemini prompt...');
        this.captureGeminiPrompt();
        break;
    }
  }

  captureGPTPrompt() {
    // ChatGPT specific selectors - prioritize contenteditable div
    const selectors = [
      'div[contenteditable="true"]',
      'textarea[data-id="root"]',
      'textarea[placeholder*="Message"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Get value from either value property or textContent
        const value = element.value || element.textContent || '';
        if (value.trim()) {
          console.log('Found prompt in', selector, ':', value.trim());
          this.capturePrompt(value.trim());
          break;
        }
      }
    }
  }

  captureClaudePrompt() {
    // Claude specific selectors
    const selectors = [
      'div[contenteditable="true"]',
      'textarea[placeholder*="Message"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.value && element.value.trim()) {
        this.capturePrompt(element.value.trim());
        break;
      }
    }
  }

  captureGrokPrompt() {
    // Grok specific selectors
    const selectors = [
      'textarea[placeholder*="Message"]',
      'div[contenteditable="true"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.value && element.value.trim()) {
        this.capturePrompt(element.value.trim());
        break;
      }
    }
  }

  captureGeminiPrompt() {
    // Gemini specific selectors
    const selectors = [
      'textarea[placeholder*="Message"]',
      'div[contenteditable="true"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.value && element.value.trim()) {
        this.capturePrompt(element.value.trim());
        break;
      }
    }
  }

  capturePrompt(promptText) {
    if (!promptText || this.isCapturing) return;

    this.isCapturing = true;
    console.log('Prompt Tracer: Capturing prompt:', promptText.substring(0, 50) + '...');

    const promptData = new PromptData(promptText, this.platform);
    const analysis = this.optimizer.analyzePrompt(promptText);
    
    // ALWAYS use LLM optimization, never rule-based
    this.getLLMOptimizedPrompt(promptText, analysis).then(optimizedPrompt => {
      console.log('Got LLM optimized prompt, showing analysis panel...');
      promptData.setOptimizedVersion(optimizedPrompt);
      
      // Store the prompt data
      this.storePromptData(promptData);
      
      // Show analysis in UI with ONLY LLM optimization
      this.showAnalysis(promptData, analysis, optimizedPrompt);
      console.log('Analysis panel should now be visible with LLM optimization');
    }).catch(error => {
      console.error('Error in LLM optimization flow:', error);
      // Even on error, don't show rule-based suggestions
      this.showAnalysis(promptData, analysis, promptText);
    });

    setTimeout(() => {
      this.isCapturing = false;
    }, 1000);
  }

  detectNewMessages() {
    // Detect when AI responses are received
    setTimeout(() => {
      this.captureAIResponse();
    }, 500);
  }

  captureAIResponse() {
    // Platform-specific response detection
    const responseSelectors = {
      gpt: '.markdown, .prose, [data-message-author-role="assistant"]',
      claude: '.claude-message, .prose',
      grok: '.message-content, .response',
      gemini: '.response-content, .message'
    };

    const selector = responseSelectors[this.platform];
    if (!selector) return;

    const responseElements = document.querySelectorAll(selector);
    if (responseElements.length > 0) {
      const latestResponse = responseElements[responseElements.length - 1];
      const responseText = latestResponse.textContent.trim();
      
      if (responseText && this.currentPrompt) {
        this.currentPrompt.setResponse(responseText);
        this.updatePromptData(this.currentPrompt);
      }
    }
  }

  storePromptData(promptData) {
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

  updatePromptData(promptData) {
    chrome.storage.local.get(['promptHistory'], (result) => {
      const history = result.promptHistory || [];
      const index = history.findIndex(p => p.id === promptData.id);
      
      if (index !== -1) {
        history[index] = promptData;
        chrome.storage.local.set({ promptHistory: history });
      }
    });
  }

  showAnalysis(promptData, analysis, llmOptimizedPrompt = null) {
    // Remove existing panel
    const existingPanel = document.getElementById('prompt-tracer-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    // Create floating analysis panel
    const panel = document.createElement('div');
    panel.id = 'prompt-tracer-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 450px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      pointer-events: auto;
      max-height: 85vh;
      overflow-y: auto;
    `;

    // Get quality level and color
    const quality = analysis.quality;
    const qualityConfig = {
      basic: { color: '#f44336', label: 'Basic', icon: '🌱' },
      developing: { color: '#ff9800', label: 'Developing', icon: '🚀' },
      good: { color: '#4caf50', label: 'Good', icon: '✨' },
      excellent: { color: '#2196f3', label: 'Excellent', icon: '🌟' },
      masterful: { color: '#9c27b0', label: 'Masterful', icon: '👑' }
    };
    
    const config = qualityConfig[quality] || qualityConfig.developing;

    panel.innerHTML = `
      <div style="padding: 24px; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #333; font-size: 20px; font-weight: 700;">🔍 Prompt Analysis</h3>
          <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; font-size: 24px; color: #666; padding: 4px;">×</button>
        </div>
        
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 36px; margin-bottom: 12px;">${config.icon}</div>
          <div style="font-size: 22px; font-weight: bold; color: ${config.color}; margin-bottom: 8px;">
            ${config.label} Quality
          </div>
          <div style="font-size: 14px; color: #666; line-height: 1.4;">
            ${this.getQualityDescription(quality)}
          </div>
          <div style="margin-top: 12px; padding: 8px 16px; background: ${config.color}15; border-radius: 20px; display: inline-block;">
            <span style="font-size: 12px; font-weight: 600; color: ${config.color};">
              ${this.getQualityEmoji(quality)} ${this.getQualityAction(quality)}
            </span>
          </div>
        </div>
      </div>

      <div style="padding: 24px;">
        <!-- Optimized Version Section (Priority 1) -->
        ${llmOptimizedPrompt ? `
          <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <h4 style="margin: 0; color: #333; font-size: 18px; font-weight: 700;">🚀 Ready-to-Use Version</h4>
              <div style="margin-left: auto;">
                <button id="copy-optimized" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">Copy & Use</button>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%); border: 2px solid #e1e5ff; border-radius: 12px; padding: 20px; font-size: 14px; line-height: 1.6; color: #333; position: relative;">
              <div id="optimized-text" style="margin-right: 0;">${llmOptimizedPrompt}</div>
            </div>
            <p style="font-size: 12px; color: #667eea; margin: 8px 0 0 0; font-weight: 500;">
              ✨ Enhanced for maximum effectiveness
            </p>
          </div>
        ` : ''}

        <!-- Quick Action Section -->
        <div style="margin-bottom: 24px;">
          <h4 style="margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: 600;">⚡ Quick Actions</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; border: 1px solid #e9ecef; transition: all 0.2s ease;" onclick="this.style.transform='scale(0.98)'">
              <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
              <div style="font-size: 12px; font-weight: 600; color: #333;">View Metrics</div>
            </div>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; border: 1px solid #e9ecef; transition: all 0.2s ease;" onclick="this.style.transform='scale(0.98)'">
              <div style="font-size: 24px; margin-bottom: 8px;">💡</div>
              <div style="font-size: 12px; font-weight: 600; color: #333;">Get Tips</div>
            </div>
          </div>
        </div>

        <!-- Insights Section (Priority 2) -->
        <div style="margin-bottom: 24px;">
          <h4 style="margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: 600;">💡 Key Insights</h4>
          ${this.renderInsights(analysis.insights)}
        </div>

        <!-- Metrics Section (Priority 3) -->
        <div style="margin-bottom: 24px;">
          <h4 style="margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: 600;">📊 Performance Breakdown</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${this.renderMetrics(analysis.metrics)}
          </div>
        </div>

        <!-- Suggestions Section (Priority 4) -->
        ${analysis.suggestions.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 16px 0; color: #333; font-size: 16px; font-weight: 600;">🎯 Improvement Ideas</h4>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 16px;">
              <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.5;">
                ${analysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
              </ul>
            </div>
          </div>
        ` : ''}

        <!-- Pro Tip Section (Priority 5) -->
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; padding: 16px; color: white;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 18px; margin-right: 10px;">💡</span>
            <strong style="font-size: 14px;">Pro Tip:</strong>
          </div>
          <p style="margin: 0; font-size: 13px; line-height: 1.4; opacity: 0.9;">
            ${this.getProTip(quality, llmOptimizedPrompt)}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Add copy functionality
    const copyButton = panel.querySelector('#copy-optimized');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        const text = panel.querySelector('#optimized-text').textContent;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = copyButton.textContent;
          copyButton.textContent = '✅ Copied!';
          copyButton.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
          copyButton.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
          
          setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            copyButton.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
          }, 2000);
        }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          copyButton.textContent = '✅ Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy & Use';
          }, 2000);
        });
      });
    }

    // Auto-remove after 20 seconds
    setTimeout(() => {
      if (panel.parentElement) {
        panel.remove();
      }
    }, 20000);
  }

  renderMetrics(metrics) {
    const metricConfigs = {
      clarity: { icon: '🎯', label: 'Clarity', color: '#4caf50' },
      specificity: { icon: '📊', label: 'Specificity', color: '#2196f3' },
      structure: { icon: '📋', label: 'Structure', color: '#ff9800' },
      context: { icon: '🌍', label: 'Context', color: '#9c27b0' },
      intent: { icon: '🎯', label: 'Intent', color: '#f44336' },
      completeness: { icon: '✅', label: 'Completeness', color: '#00bcd4' }
    };

    return Object.entries(metrics).map(([key, value]) => {
      const config = metricConfigs[key];
      const percentage = Math.round(value);
      const color = percentage >= 70 ? '#4caf50' : percentage >= 50 ? '#ff9800' : '#f44336';
      
      return `
        <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; border-left: 4px solid ${color};">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 16px; margin-right: 8px;">${config.icon}</span>
            <span style="font-size: 12px; font-weight: 600; color: #333;">${config.label}</span>
          </div>
          <div style="font-size: 18px; font-weight: bold; color: ${color};">${percentage}%</div>
        </div>
      `;
    }).join('');
  }

  renderInsights(insights) {
    if (insights.length === 0) {
      return '<p style="color: #666; font-style: italic; margin: 0;">No specific insights for this prompt.</p>';
    }

    return insights.map(insight => `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin-bottom: 8px; border-left: 4px solid #667eea;">
        <div style="display: flex; align-items: flex-start;">
          <span style="font-size: 16px; margin-right: 8px; margin-top: 2px;">${insight.icon}</span>
          <span style="font-size: 13px; color: #333; line-height: 1.4;">${insight.message}</span>
        </div>
      </div>
    `).join('');
  }

  getQualityDescription(quality) {
    const descriptions = {
      basic: 'Your prompt needs more structure and detail',
      developing: 'Good foundation, ready for enhancement',
      good: 'Well-crafted with room for improvement',
      excellent: 'Strong prompt engineering skills',
      masterful: 'Exceptional prompt design'
    };
    return descriptions[quality] || descriptions.developing;
  }

  getProTip(quality, hasOptimization) {
    const tips = {
      basic: 'Start by adding specific details and context to your prompt',
      developing: 'Try using bullet points and clear action words',
      good: 'Consider adding constraints and format specifications',
      excellent: 'Experiment with different prompt structures and styles',
      masterful: 'Share your techniques with others!'
    };
    
    const baseTip = tips[quality] || tips.developing;
    return hasOptimization ? 
      `${baseTip} Use the optimized version above for even better results.` : 
      baseTip;
  }

  getQualityEmoji(quality) {
    const emojis = {
      basic: '🌱',
      developing: '🚀',
      good: '✨',
      excellent: '🌟',
      masterful: '👑'
    };
    return emojis[quality] || emojis.developing;
  }

  getQualityAction(quality) {
    const actions = {
      basic: 'Add more detail',
      developing: 'Enhance structure',
      good: 'Fine-tune',
      excellent: 'Optimize further',
      masterful: 'Perfect!'
    };
    return actions[quality] || actions.developing;
  }

  showErrorNotification(message) {
    try {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f44336;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 1000000;
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        max-width: 400px;
        text-align: center;
      `;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    } catch (error) {
      console.error('Failed to show error notification:', error);
    }
  }

  injectUI() {
    // Add a floating button to manually trigger analysis
    const button = document.createElement('div');
    button.id = 'prompt-tracer-button';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      pointer-events: auto;
    `;
    button.innerHTML = '🔍';
    button.title = 'Analyze Current Prompt';

    // Use a more isolated event listener
    const clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Button clicked!');
      this.findAndCapturePrompt();
    };
    
    button.addEventListener('click', clickHandler, true);

    // Append to body with a delay to avoid React conflicts
    setTimeout(() => {
      if (!document.getElementById('prompt-tracer-button')) {
        document.body.appendChild(button);
        console.log('Prompt Tracer button injected');
      }
    }, 1000);
    
    // Listen for tutorial messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'startTutorial') {
        const tutorial = new InteractiveTutorial();
        tutorial.start();
        sendResponse({success: true});
      }
    });
  }

  startAutoMonitoring() {
    // Monitor input field changes automatically
    setInterval(() => {
      this.monitorInputField();
    }, 2000); // Check every 2 seconds
  }

  monitorInputField() {
    // Platform-specific input field monitoring
    const selectors = {
      gpt: ['div[contenteditable="true"]', 'textarea[data-id="root"]', 'textarea[placeholder*="Message"]'],
      claude: ['div[contenteditable="true"]', 'textarea[placeholder*="Message"]'],
      grok: ['textarea[placeholder*="Message"]', 'div[contenteditable="true"]'],
      gemini: ['textarea[placeholder*="Message"]', 'div[contenteditable="true"]']
    };

    const platformSelectors = selectors[this.platform] || selectors.gpt;
    
    for (const selector of platformSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const currentValue = element.value || element.textContent || '';
        if (currentValue.trim() && currentValue !== this.lastMonitoredValue) {
          this.lastMonitoredValue = currentValue;
          console.log('Auto-detected prompt change:', currentValue.substring(0, 50) + '...');
          this.capturePrompt(currentValue.trim());
          break;
        }
      }
    }
  }

  async getLLMOptimizedPrompt(originalPrompt, analysis) {
    try {
      console.log('Starting LLM optimization for prompt:', originalPrompt.substring(0, 50) + '...');
      
      // Send request to background script for LLM optimization
      const response = await chrome.runtime.sendMessage({
        action: 'optimizePrompt',
        prompt: originalPrompt,
        analysis: analysis
      });
      
      console.log('Background script response:', response);
      
      if (response && response.optimized) {
        console.log('LLM optimization successful using:', response.method);
        console.log('Original prompt:', originalPrompt);
        console.log('Optimized prompt:', response.optimized);
        console.log('Are they the same?', originalPrompt === response.optimized);
        return response.optimized;
      } else {
        console.log('LLM optimization failed, using fallback');
        return this.smartFallbackOptimization(originalPrompt, analysis);
      }
    } catch (error) {
      console.log('LLM optimization failed, using fallback:', error);
      // Use smart fallback as backup
      return this.smartFallbackOptimization(originalPrompt, analysis);
    }
  }

  smartFallbackOptimization(originalPrompt, analysis) {
    console.log('Using smart fallback optimization');
    const lowerPrompt = originalPrompt.toLowerCase();
    let optimized = originalPrompt;
    
    // Context-aware optimization based on prompt content
    if (lowerPrompt.includes('cover letter')) {
      optimized = `Please help me write a compelling cover letter. I need guidance on:
1. How to structure it effectively
2. What key points to include
3. How to make it stand out
4. Common mistakes to avoid

Could you provide a template or example?`;
    } else if (lowerPrompt.includes('explain') && originalPrompt.split(' ').length < 5) {
      const topic = originalPrompt.replace(/explain/i, '').trim();
      optimized = `Please provide a comprehensive explanation of ${topic} that includes:
- Clear definition and key concepts
- Real-world examples and applications
- Why it's important or relevant
- Common misconceptions or challenges`;
    } else if (lowerPrompt.includes('write') && lowerPrompt.includes('letter')) {
      optimized = `I need help writing a professional letter. Please provide:
- Proper structure and formatting
- Key elements to include
- Tone and language suggestions
- Common phrases and templates`;
    } else if (lowerPrompt.includes('big bang')) {
      optimized = `Please explain the Big Bang theory in a way that's easy to understand, including:
- What it is and when it happened
- Key evidence supporting it
- How the universe evolved from it
- Common misconceptions about it`;
    } else if (lowerPrompt.includes('ai') || lowerPrompt.includes('artificial intelligence')) {
      optimized = `Please explain artificial intelligence in detail, covering:
- What AI is and how it works
- Different types of AI (narrow vs general)
- Current applications and examples
- Future implications and challenges`;
    } else if (lowerPrompt.includes('compare')) {
      optimized += `\n\nPlease provide a detailed comparison including:
- Key differences and similarities
- Pros and cons of each
- Real-world examples
- When to use each approach`;
    } else if (lowerPrompt.includes('how to')) {
      optimized += `\n\nPlease provide a step-by-step guide including:
- Prerequisites or requirements
- Detailed steps with explanations
- Tips and best practices
- Common mistakes to avoid`;
    } else {
      // Generic improvement for other prompts
      optimized = `Please provide a detailed and comprehensive response about ${originalPrompt} that includes:
- Clear explanations and definitions
- Practical examples and applications
- Relevant context and background
- Actionable insights or takeaways`;
    }
    
    return optimized;
  }


}

// Initialize the prompt tracer
console.log('Prompt Tracer: Starting initialization...');
try {
    // Check if already initialized to prevent duplicates
    if (!window.promptTracerInstance) {
        window.promptTracerInstance = new PromptTracer();
        console.log('Prompt Tracer: Initialization completed successfully');
    } else {
        console.log('Prompt Tracer: Already initialized, skipping...');
    }
} catch (error) {
    console.error('Prompt Tracer: Initialization failed:', error);
} 