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
      completeness: 0,
      creativity: 0,
      precision: 0,
      engagement: 0,
      adaptability: 0,
      technical_quality: 0,
      output_potential: 0
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
    
    // Enhanced metrics for better analysis
    metrics.creativity = this.calculateCreativityScore(promptText, words);
    metrics.precision = this.calculatePrecisionScore(promptText, words);
    metrics.engagement = this.calculateEngagementScore(promptText, words);
    metrics.adaptability = this.calculateAdaptabilityScore(promptText, words);
    metrics.technical_quality = this.calculateTechnicalQualityScore(promptText, words);
    metrics.output_potential = this.calculateOutputPotentialScore(promptText, words, sentences);
    
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
    // Calculate average score from the core metrics
    // Metrics are already in 0-100 range, so no need to multiply
    const coreMetrics = ['clarity', 'specificity', 'structure', 'context', 'intent', 'completeness'];
    const coreScores = coreMetrics.map(key => Math.max(0, Math.min(100, metrics[key] || 0)));
    const avgScore = coreScores.reduce((a, b) => a + b, 0) / coreScores.length;
    const percentage = Math.max(0, Math.min(100, avgScore)); // Clamp to 0-100
    
    if (percentage < 30) return 'basic';
    if (percentage < 50) return 'developing';
    if (percentage < 70) return 'good';
    if (percentage < 85) return 'excellent';
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

  // Simple rule-based optimization for fallback
  optimizePrompt(promptText, analysis) {
    let optimized = promptText;
    
    // Basic improvements
    if (!optimized.toLowerCase().startsWith('please')) {
      optimized = 'Please ' + optimized.toLowerCase();
    }
    
    // Add specificity if missing
    if (optimized.length < 50) {
      optimized += '\n\nPlease provide specific examples and detailed explanations.';
    }
    
    // Add structure if missing
    if (!optimized.includes(':') && optimized.length > 100) {
      optimized = optimized.replace(/^(.+?)(\.|$)/, '$1:\n\n');
    }
    
    // Ensure it's different from original
    if (optimized === promptText) {
      optimized = 'Please provide a comprehensive response about: ' + promptText.toLowerCase();
    }
    
    return optimized;
  }

  // Enhanced calculation methods for better prompt analysis
  
  calculateCreativityScore(text, words) {
    let score = 30; // Base score
    
    // Creative language indicators
    const creativeWords = [
      'innovative', 'creative', 'unique', 'original', 'imaginative', 'inspiring',
      'breakthrough', 'revolutionary', 'cutting-edge', 'state-of-the-art',
      'novel', 'fresh', 'dynamic', 'vibrant', 'compelling', 'engaging'
    ];
    
    const creativeCount = words.filter(word => 
      creativeWords.some(creative => word.toLowerCase().includes(creative))
    ).length;
    
    score += Math.min(creativeCount * 8, 40);
    
    // Metaphors and analogies
    const metaphorIndicators = ['like', 'as', 'similar to', 'reminds me of', 'imagine', 'picture'];
    const metaphorCount = metaphorIndicators.filter(indicator => 
      text.toLowerCase().includes(indicator)
    ).length;
    
    score += Math.min(metaphorCount * 5, 20);
    
    // Questions that spark creativity
    const creativeQuestions = ['what if', 'how might', 'imagine if', 'suppose', 'consider'];
    const questionCount = creativeQuestions.filter(question => 
      text.toLowerCase().includes(question)
    ).length;
    
    score += Math.min(questionCount * 5, 10);
    
    return Math.min(score, 100);
  }

  calculatePrecisionScore(text, words) {
    let score = 40; // Base score
    
    // Specific numbers and measurements
    const numberPattern = /\d+(\.\d+)?/g;
    const numbers = text.match(numberPattern);
    if (numbers) {
      score += Math.min(numbers.length * 5, 25);
    }
    
    // Specific time references
    const timeIndicators = ['today', 'yesterday', 'tomorrow', 'this week', 'next month', 'by', 'until', 'before', 'after'];
    const timeCount = timeIndicators.filter(indicator => 
      text.toLowerCase().includes(indicator)
    ).length;
    
    score += Math.min(timeCount * 4, 15);
    
    // Specific locations and proper nouns
    const properNounPattern = /[A-Z][a-z]+/g;
    const properNouns = text.match(properNounPattern);
    if (properNouns) {
      score += Math.min(properNouns.length * 2, 10);
    }
    
    // Technical terms and jargon (domain-specific precision)
    const technicalTerms = ['algorithm', 'methodology', 'framework', 'protocol', 'specification', 'requirement'];
    const technicalCount = technicalTerms.filter(term => 
      text.toLowerCase().includes(term)
    ).length;
    
    score += Math.min(technicalCount * 3, 10);
    
    return Math.min(score, 100);
  }

  calculateEngagementScore(text, words) {
    let score = 35; // Base score
    
    // Interactive elements
    const interactiveWords = ['you', 'your', 'we', 'our', 'let\'s', 'together', 'collaborate'];
    const interactiveCount = interactiveWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(interactiveCount * 4, 25);
    
    // Emotional language
    const emotionalWords = [
      'excited', 'thrilled', 'amazing', 'incredible', 'fantastic', 'wonderful',
      'concerned', 'worried', 'important', 'crucial', 'critical', 'urgent',
      'love', 'passionate', 'dedicated', 'committed', 'motivated'
    ];
    
    const emotionalCount = words.filter(word => 
      emotionalWords.some(emotional => word.toLowerCase().includes(emotional))
    ).length;
    
    score += Math.min(emotionalCount * 5, 20);
    
    // Action-oriented language
    const actionWords = ['create', 'build', 'develop', 'implement', 'execute', 'launch', 'achieve', 'accomplish'];
    const actionCount = actionWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(actionCount * 3, 15);
    
    // Questions that engage
    const questionCount = (text.match(/\?/g) || []).length;
    score += Math.min(questionCount * 3, 5);
    
    return Math.min(score, 100);
  }

  calculateAdaptabilityScore(text, words) {
    let score = 30; // Base score
    
    // Flexible language
    const flexibleWords = ['could', 'might', 'possibly', 'perhaps', 'maybe', 'potentially', 'alternatively'];
    const flexibleCount = flexibleWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(flexibleCount * 5, 25);
    
    // Multiple options presented
    const optionIndicators = ['or', 'either', 'alternatively', 'option 1', 'option 2', 'choice'];
    const optionCount = optionIndicators.filter(indicator => 
      text.toLowerCase().includes(indicator)
    ).length;
    
    score += Math.min(optionCount * 4, 20);
    
    // Conditional language
    const conditionalWords = ['if', 'when', 'unless', 'provided that', 'assuming'];
    const conditionalCount = conditionalWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(conditionalCount * 3, 15);
    
    // Scalable language
    const scalableWords = ['scale', 'expand', 'adjust', 'modify', 'customize', 'adapt'];
    const scalableCount = scalableWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(scalableCount * 4, 10);
    
    return Math.min(score, 100);
  }

  calculateTechnicalQualityScore(text, words) {
    let score = 40; // Base score
    
    // Technical terminology
    const technicalTerms = [
      'algorithm', 'database', 'API', 'framework', 'architecture', 'optimization',
      'performance', 'scalability', 'security', 'authentication', 'encryption',
      'integration', 'deployment', 'configuration', 'implementation'
    ];
    
    const technicalCount = technicalTerms.filter(term => 
      text.toLowerCase().includes(term)
    ).length;
    
    score += Math.min(technicalCount * 4, 30);
    
    // Code-related terms
    const codeTerms = ['function', 'variable', 'class', 'method', 'parameter', 'syntax', 'debug'];
    const codeCount = codeTerms.filter(term => 
      text.toLowerCase().includes(term)
    ).length;
    
    score += Math.min(codeCount * 3, 15);
    
    // Structured language
    const structureWords = ['step', 'process', 'procedure', 'workflow', 'sequence', 'order'];
    const structureCount = structureWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(structureCount * 2, 10);
    
    // Problem-solving language
    const problemSolvingWords = ['analyze', 'diagnose', 'troubleshoot', 'resolve', 'fix', 'debug'];
    const problemSolvingCount = problemSolvingWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(problemSolvingCount * 3, 5);
    
    return Math.min(score, 100);
  }

  calculateOutputPotentialScore(text, words, sentences) {
    let score = 35; // Base score
    
    // Comprehensive request indicators
    const comprehensiveWords = ['detailed', 'comprehensive', 'thorough', 'complete', 'extensive', 'in-depth'];
    const comprehensiveCount = comprehensiveWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(comprehensiveCount * 8, 25);
    
    // Output format specification
    const formatWords = ['format', 'structure', 'template', 'outline', 'list', 'table', 'chart', 'diagram'];
    const formatCount = formatWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(formatCount * 4, 15);
    
    // Quality expectations
    const qualityWords = ['high-quality', 'professional', 'expert', 'advanced', 'sophisticated', 'polished'];
    const qualityCount = qualityWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(qualityCount * 5, 15);
    
    // Length and depth indicators
    if (words.length > 50) score += 10;
    if (sentences.length > 3) score += 5;
    if (text.includes(':')) score += 5; // Colon indicates structured request
    if (text.includes('\n')) score += 5; // Line breaks indicate structure
    
    // Specificity for better output
    const specificWords = ['specific', 'exact', 'precise', 'particular', 'detailed'];
    const specificCount = specificWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(specificCount * 4, 10);
    
    return Math.min(score, 100);
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
        this.showPlatformNotSupported();
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
      this.reportError('initialization', error);
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
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
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

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Only trigger shortcuts if not typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || 
          event.target.contentEditable === 'true') {
        return;
      }

      // Ctrl+Shift+P: Quick prompt analysis
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        this.findAndCapturePrompt();
        this.showShortcutNotification('🔍 Analyzing current prompt...');
      }

      // Ctrl+Shift+O: Copy optimized version (if available)
      if (event.ctrlKey && event.shiftKey && event.key === 'O') {
        event.preventDefault();
        this.copyLastOptimizedPrompt();
      }

      // Ctrl+Shift+D: Open dashboard
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        this.openDashboard();
      }

      // Ctrl+Shift+H: Show help
      if (event.ctrlKey && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        this.showKeyboardShortcutsHelp();
      }
    });
  }

  showShortcutNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 1000000;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      max-width: 400px;
      text-align: center;
      font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }

  copyLastOptimizedPrompt() {
    // Try to find the last analysis panel
    const panel = document.getElementById('prompt-tracer-panel');
    if (panel) {
      const optimizedText = panel.querySelector('#optimized-text');
      if (optimizedText) {
        const text = optimizedText.textContent;
        navigator.clipboard.writeText(text).then(() => {
          this.showShortcutNotification('✅ Optimized prompt copied to clipboard!');
        }).catch(() => {
          this.showShortcutNotification('❌ Failed to copy prompt');
        });
        return;
      }
    }
    
    this.showShortcutNotification('ℹ️ No optimized prompt available. Analyze a prompt first.');
  }

  openDashboard() {
    // Open extension popup
    chrome.runtime.sendMessage({ action: 'openDashboard' });
    this.showShortcutNotification('📊 Opening dashboard...');
  }

  showKeyboardShortcutsHelp() {
    const helpModal = document.createElement('div');
    helpModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      position: relative;
    `;

    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="margin: 0; color: #333; font-size: 24px; font-weight: 600;">⌨️ Keyboard Shortcuts</h2>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; font-size: 24px; color: #666; padding: 4px;">×</button>
      </div>
      
      <div style="space-y: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 600; color: #333;">Quick Analysis</div>
            <div style="font-size: 14px; color: #666;">Analyze current prompt</div>
          </div>
          <kbd style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">Ctrl+Shift+P</kbd>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 600; color: #333;">Copy Optimized</div>
            <div style="font-size: 14px; color: #666;">Copy last optimized prompt</div>
          </div>
          <kbd style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">Ctrl+Shift+O</kbd>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 600; color: #333;">Open Dashboard</div>
            <div style="font-size: 14px; color: #666;">View analytics and settings</div>
          </div>
          <kbd style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">Ctrl+Shift+D</kbd>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 600; color: #333;">Show Help</div>
            <div style="font-size: 14px; color: #666;">Display this shortcuts guide</div>
          </div>
          <kbd style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">Ctrl+Shift+H</kbd>
        </div>
      </div>
      
      <div style="margin-top: 24px; padding: 16px; background: linear-gradient(135deg, #f8f9ff, #e8ecff); border-radius: 8px;">
        <div style="font-size: 14px; color: #666; text-align: center;">
          <strong>💡 Pro Tip:</strong> These shortcuts work on any AI platform where Prompt Tracer is active
        </div>
      </div>
    `;

    helpModal.appendChild(modal);
    document.body.appendChild(helpModal);

    // Close on escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        helpModal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Auto-close after 10 seconds
    setTimeout(() => {
      if (helpModal.parentElement) {
        helpModal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    }, 10000);
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
    // Don't analyze empty or very short prompts
    if (!promptText || promptText.trim().length < 3 || this.isCapturing) return;

    this.isCapturing = true;
    console.log('Prompt Tracer: Capturing prompt:', promptText.substring(0, 50) + '...');

    const promptData = new PromptData(promptText, this.platform);
    const analysis = this.optimizer.analyzePrompt(promptText);
    
    // Show analysis immediately with rule-based optimization (fast, always works)
    if (!analysis.quality) {
      analysis.quality = this.optimizer.determineQuality(analysis.metrics || {});
    }
    
    // Always show rule-based optimization immediately (no waiting)
    const immediateOptimization = this.optimizer.optimizePrompt(promptText, analysis);
    promptData.setOptimizedVersion(immediateOptimization);
    this.showAnalysis(promptData, analysis, immediateOptimization); // Show panel immediately with rule-based
    
    // Try AI optimization in background if API key exists (non-blocking)
    this.checkApiKeyStatus().then(hasApiKey => {
      if (!hasApiKey) {
        // No API key - already showing rule-based, done
        this.storePromptData(promptData);
        return;
      }
      
      // Has API key - try LLM optimization in background (updates panel when ready)
      // Check if extension context is valid first
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        console.warn('Extension context invalidated - using rule-based optimization');
        this.storePromptData(promptData);
        return; // Already showing rule-based, no need to update
      }
      
      // Try AI optimization with shorter timeout
      const optimizationPromise = this.getLLMOptimizedPrompt(promptText, analysis);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Optimization timeout')), 5000) // 5 second timeout
      );
      
      Promise.race([optimizationPromise, timeoutPromise])
        .then(optimizedPrompt => {
          console.log('Got LLM optimized prompt, updating panel...', optimizedPrompt);
          console.log('Original:', promptText);
          console.log('Rule-based:', immediateOptimization);
          console.log('AI optimized:', optimizedPrompt);
          
          // Update if we got a valid AI optimization (always update if AI succeeded)
          if (optimizedPrompt && optimizedPrompt.trim()) {
            console.log('Updating panel with AI optimization');
            promptData.setOptimizedVersion(optimizedPrompt);
            this.storePromptData(promptData);
            this.updateOptimizedPrompt(optimizedPrompt);
          } else {
            console.log('AI optimization returned empty, keeping rule-based');
            this.storePromptData(promptData);
          }
        })
        .catch(error => {
          console.log('AI optimization failed or timed out, keeping rule-based:', error.message);
          // Keep the rule-based optimization that's already showing
          this.storePromptData(promptData);
        });
    }).catch(error => {
      console.log('Error checking API key status, using rule-based:', error);
      // Already showing rule-based, just store the data
      this.storePromptData(promptData);
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
    try {
      if (!chrome || !chrome.storage || !chrome.storage.local) {
        console.warn('Extension context invalidated - cannot store prompt');
        return;
      }
      
      chrome.storage.local.get(['promptHistory'], (result) => {
        try {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.warn('Extension context invalidated:', chrome.runtime.lastError.message);
            return;
          }
          
          const history = result.promptHistory || [];
          history.push(promptData);
          
          // Keep only last 100 prompts
          if (history.length > 100) {
            history.splice(0, history.length - 100);
          }
          
          chrome.storage.local.set({ promptHistory: history });
        } catch (error) {
          console.error('Error storing prompt:', error);
        }
      });
    } catch (error) {
      console.error('Extension context error:', error);
    }
  }

  updatePromptData(promptData) {
    try {
      if (!chrome || !chrome.storage || !chrome.storage.local) {
        console.warn('Extension context invalidated - cannot update prompt');
        return;
      }
      
      chrome.storage.local.get(['promptHistory'], (result) => {
        try {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.warn('Extension context invalidated:', chrome.runtime.lastError.message);
            return;
          }
          
          const history = result.promptHistory || [];
          const index = history.findIndex(p => p.id === promptData.id);
          
          if (index !== -1) {
            history[index] = promptData;
            chrome.storage.local.set({ promptHistory: history });
          }
        } catch (error) {
          console.error('Error updating prompt:', error);
        }
      });
    } catch (error) {
      console.error('Extension context error:', error);
    }
  }

  async showAnalysis(promptData, analysis, llmOptimizedPrompt = null) {
    // Don't show analysis for empty or very short prompts
    if (!promptData.prompt || promptData.prompt.trim().length < 3) {
      return;
    }

    // Remove existing panel
    const existingPanel = document.getElementById('prompt-tracer-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Check API key status first (needed for template)
    let hasApiKey = false;
    try {
      hasApiKey = await this.checkApiKeyStatus();
    } catch (error) {
      hasApiKey = false;
    }

    // Calculate overall quality score (0-100)
    // Metrics are already in 0-100 range, so no need to multiply
    const metrics = analysis.metrics || {};
    const coreMetrics = ['clarity', 'specificity', 'structure', 'context', 'intent', 'completeness'];
    const coreScores = coreMetrics.map(key => Math.max(0, Math.min(100, metrics[key] || 0))); // Ensure 0-100 range
    const overallScore = Math.round(coreScores.reduce((a, b) => a + b, 0) / coreScores.length);
    const clampedScore = Math.max(0, Math.min(100, overallScore)); // Final clamp to ensure 0-100
    
    // Determine quality level based on actual score (not just analysis.quality)
    let quality = 'developing';
    if (clampedScore < 30) quality = 'basic';
    else if (clampedScore < 50) quality = 'developing';
    else if (clampedScore < 70) quality = 'good';
    else if (clampedScore < 85) quality = 'excellent';
    else quality = 'masterful';
    const qualityConfig = {
      basic: { color: '#f44336', label: 'Basic', icon: '🌱', min: 0, max: 30 },
      developing: { color: '#ff9800', label: 'Developing', icon: '🚀', min: 30, max: 50 },
      good: { color: '#4caf50', label: 'Good', icon: '✨', min: 50, max: 70 },
      excellent: { color: '#2196f3', label: 'Excellent', icon: '🌟', min: 70, max: 85 },
      masterful: { color: '#9c27b0', label: 'Masterful', icon: '👑', min: 85, max: 100 }
    };
    
    const config = qualityConfig[quality] || qualityConfig.developing;

    // Create floating analysis panel - Clean, focused design
    const panel = document.createElement('div');
    panel.id = 'prompt-tracer-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      background: white;
      border: none;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      pointer-events: auto;
      max-height: 85vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease-out;
    `;

    // Add CSS animation
    if (!document.getElementById('prompt-tracer-styles')) {
      const style = document.createElement('style');
      style.id = 'prompt-tracer-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `;
      document.head.appendChild(style);
    }

    // Generate real-time feedback - use rule-based immediately (fast, always works)
    let feedback = this.generateRealTimeFeedback(promptData.prompt, analysis);
    
    // Try AI feedback in background if available (non-blocking)
    this.checkApiKeyStatus().then(hasApiKey => {
      if (!hasApiKey || !chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        return; // No API key or invalid context, keep rule-based
      }
      
      // Try AI feedback with timeout (updates when ready)
      const aiFeedbackPromise = chrome.runtime.sendMessage({
        action: 'generateFeedback',
        prompt: promptData.prompt,
        analysis: analysis
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      Promise.race([aiFeedbackPromise, timeoutPromise])
        .then(aiFeedbackResponse => {
          if (aiFeedbackResponse && aiFeedbackResponse.feedback && aiFeedbackResponse.feedback.length > 0) {
            // Update feedback with AI version
            this.updateFeedbackInPanel(aiFeedbackResponse.feedback);
          }
        })
        .catch(error => {
          // Keep rule-based feedback, AI failed or timed out
          console.log('AI feedback timeout/failed, keeping rule-based');
        });
    }).catch(error => {
      // Keep rule-based feedback
      console.log('Error getting AI feedback, using rule-based');
    });
    
    // Limit feedback to top 2 most critical items to keep panel compact
    const prioritizedFeedback = feedback
      .sort((a, b) => {
        const priority = { 'error': 3, 'warning': 2, 'info': 1 };
        return (priority[b.type] || 0) - (priority[a.type] || 0);
      })
      .slice(0, 2);

    panel.innerHTML = `
      <!-- Compact Header -->
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 16px 20px; border-radius: 16px 16px 0 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">✨</div>
            <div>
              <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 700;">Prompt Optimizer</h3>
              <div style="font-size: 11px; color: rgba(255,255,255,0.9); margin-top: 2px;">AI-powered optimization</div>
            </div>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button id="settings-btn" style="background: rgba(255,255,255,0.2); border: none; cursor: pointer; font-size: 14px; color: white; padding: 6px 10px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-weight: 500;" title="Open Settings">
              ⚙️
            </button>
            <button id="close-analysis-panel" style="background: rgba(255,255,255,0.2); border: none; cursor: pointer; font-size: 18px; color: white; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
          </div>
        </div>
      </div>

      <!-- Compact Feedback Section (Max 2 items) -->
      <div style="padding: 16px 20px; background: #fafbfc; border-bottom: 1px solid #e5e7eb;">
        ${prioritizedFeedback.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${prioritizedFeedback.map((item, index) => `
              <div style="background: white; border-left: 3px solid ${item.type === 'error' ? '#ef4444' : item.type === 'warning' ? '#f59e0b' : '#3b82f6'}; border-radius: 6px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <span style="font-size: 16px; flex-shrink: 0;">${item.icon}</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 12px; font-weight: 600; color: #111827; margin-bottom: 2px;">${item.title}</div>
                  <div style="font-size: 11px; color: #6b7280; line-height: 1.4;">${item.suggestion || item.message}</div>
              </div>
            </div>
            `).join('')}
            </div>
        ` : `
          <div style="text-align: center; padding: 12px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
            <div style="font-size: 14px; font-weight: 600; color: #065f46; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>✨</span>
              <span>Your prompt looks great!</span>
          </div>
            </div>
        `}
        </div>

      <!-- Optimized Prompt (Main Focus - Always Visible) -->
      <div style="padding: 20px; background: white; flex: 1; overflow-y: auto;">
        ${llmOptimizedPrompt ? `
          <div style="margin-bottom: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 16px;">🚀</span>
                <span style="font-size: 13px; font-weight: 600; color: #374151;">Ready-to-Use Version</span>
        </div>
              <button id="copy-optimized" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2); transition: all 0.2s;">Copy</button>
          </div>
            <div style="background: linear-gradient(135deg, #f8f9ff, #f0f4ff); border: 2px solid #e0e7ff; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; color: #1f2937; position: relative; max-height: 200px; overflow-y: auto;">
              <div id="optimized-text" style="white-space: pre-wrap; word-wrap: break-word;">${llmOptimizedPrompt}</div>
        </div>
            <div style="margin-top: 10px;">
              <button id="use-optimized" style="width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; padding: 12px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.2s;">
                Use This Prompt
              </button>
            </div>
            ${hasApiKey ? `
              <div style="margin-top: 8px; text-align: center; font-size: 10px; color: #9ca3af; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span>🤖</span>
                <span>AI-powered optimization</span>
              </div>
            ` : `
              <div style="margin-top: 12px; padding: 12px; background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fbbf24; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                  <span style="font-size: 16px;">🔑</span>
                  <div style="flex: 1;">
                    <div style="font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 2px;">Enable AI Optimization</div>
                    <div style="font-size: 10px; color: #78350f;">Add your OpenAI API key for better results</div>
                  </div>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <input type="password" id="inline-api-key" placeholder="sk-proj-..." style="flex: 1; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 11px; font-family: 'Monaco', 'Courier New', monospace; background: white;" autocomplete="off">
                  <button id="save-inline-api-key" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; padding: 8px 14px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2); transition: all 0.2s;">Save</button>
                </div>
                <div style="margin-top: 8px; font-size: 10px; color: #78350f;">
                  <a href="https://platform.openai.com/api-keys" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 500;">Get your key here</a>
                </div>
              </div>
            `}
        </div>
        ` : `
          <div style="text-align: center; padding: 30px 20px; color: #9ca3af;">
            <div style="font-size: 36px; margin-bottom: 8px;">⏳</div>
            <div style="font-size: 13px; font-weight: 500; color: #6b7280;">Optimizing your prompt...</div>
            <div style="font-size: 11px; margin-top: 6px; color: #d1d5db;">This may take a few seconds</div>
          </div>
        `}
      </div>
    `;

    document.body.appendChild(panel);

    // Add settings button functionality
    const settingsButton = panel.querySelector('#settings-btn');
    if (settingsButton) {
      settingsButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          // Check if extension context is valid
          if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
            this.showShortcutNotification('⚠️ Please reload the extension', 'warning');
            return;
          }
          // Open extension popup to settings tab
          chrome.runtime.sendMessage({ action: 'openSettings' });
          // Also show a notification
          this.showShortcutNotification('⚙️ Opening settings...');
        } catch (error) {
          console.error('Error opening settings:', error);
          this.showShortcutNotification('⚠️ Please reload the extension', 'warning');
        }
      });
      
      settingsButton.addEventListener('mouseenter', () => {
        settingsButton.style.background = 'rgba(255,255,255,0.3)';
        settingsButton.style.transform = 'scale(1.1)';
      });
      
      settingsButton.addEventListener('mouseleave', () => {
        settingsButton.style.background = 'rgba(255,255,255,0.2)';
        settingsButton.style.transform = 'scale(1)';
      });
    }
    
    // Add close button functionality
    const closeButton = panel.querySelector('#close-analysis-panel');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        panel.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => panel.remove(), 300);
      });
      
      closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(255,255,255,0.3)';
      });
      
      closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(255,255,255,0.2)';
      });
    }

    // Add copy functionality
    const copyButton = panel.querySelector('#copy-optimized');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        const text = panel.querySelector('#optimized-text').textContent;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = copyButton.textContent;
          copyButton.textContent = '✓ Copied';
          copyButton.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
          copyButton.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
          
          setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            copyButton.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
          }, 2000);
        }).catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          copyButton.textContent = '✓ Copied';
          setTimeout(() => {
            copyButton.textContent = 'Copy';
          }, 2000);
        });
      });
    }

    // Add inline API key input functionality
    const inlineApiKeyInput = panel.querySelector('#inline-api-key');
    const saveInlineApiKeyBtn = panel.querySelector('#save-inline-api-key');
    
    if (inlineApiKeyInput && saveInlineApiKeyBtn) {
      // Save on button click
      saveInlineApiKeyBtn.addEventListener('click', async () => {
        try {
          // Check if extension context is valid
          if (!chrome || !chrome.storage || !chrome.storage.local) {
            saveInlineApiKeyBtn.textContent = 'Reload extension';
            saveInlineApiKeyBtn.style.background = '#ef4444';
            setTimeout(() => {
              saveInlineApiKeyBtn.textContent = 'Save';
              saveInlineApiKeyBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            }, 3000);
            return;
          }
          
          const apiKey = inlineApiKeyInput.value.trim();
          
          if (!apiKey) {
            saveInlineApiKeyBtn.textContent = 'Enter key';
            saveInlineApiKeyBtn.style.background = '#ef4444';
            setTimeout(() => {
              saveInlineApiKeyBtn.textContent = 'Save';
              saveInlineApiKeyBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            }, 2000);
            return;
          }
          
          if (!apiKey.startsWith('sk-')) {
            saveInlineApiKeyBtn.textContent = 'Invalid';
            saveInlineApiKeyBtn.style.background = '#ef4444';
            setTimeout(() => {
              saveInlineApiKeyBtn.textContent = 'Save';
              saveInlineApiKeyBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            }, 2000);
            return;
          }
          
          // Save the key
          saveInlineApiKeyBtn.textContent = 'Saving...';
          saveInlineApiKeyBtn.style.opacity = '0.7';
          saveInlineApiKeyBtn.disabled = true;
          
          chrome.storage.local.set({ 'openai-api-key': apiKey }, async () => {
            try {
              // Check if runtime is available
              if (!chrome.runtime || !chrome.runtime.sendMessage) {
                throw new Error('Extension context invalidated');
              }
              
              // Test the API key
              const testResponse = await chrome.runtime.sendMessage({
                action: 'testApiKey',
                apiKey: apiKey
              });
              
              if (testResponse && testResponse.success) {
                saveInlineApiKeyBtn.textContent = '✓ Saved!';
                saveInlineApiKeyBtn.style.background = '#10b981';
                
                // Reload the panel with new API key
                setTimeout(() => {
                  // Re-analyze with new API key
                  this.capturePrompt(promptData.prompt);
                }, 1000);
              } else {
                saveInlineApiKeyBtn.textContent = 'Failed';
                saveInlineApiKeyBtn.style.background = '#ef4444';
                setTimeout(() => {
                  saveInlineApiKeyBtn.textContent = 'Save';
                  saveInlineApiKeyBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                  saveInlineApiKeyBtn.disabled = false;
                  saveInlineApiKeyBtn.style.opacity = '1';
                }, 2000);
              }
            } catch (error) {
              console.error('Error testing API key:', error);
              saveInlineApiKeyBtn.textContent = 'Error';
              saveInlineApiKeyBtn.style.background = '#ef4444';
              setTimeout(() => {
                saveInlineApiKeyBtn.textContent = 'Save';
                saveInlineApiKeyBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                saveInlineApiKeyBtn.disabled = false;
                saveInlineApiKeyBtn.style.opacity = '1';
              }, 2000);
            }
          });
        } catch (error) {
          console.error('Error saving API key:', error);
          saveInlineApiKeyBtn.textContent = 'Error';
          saveInlineApiKeyBtn.style.background = '#ef4444';
          setTimeout(() => {
            saveInlineApiKeyBtn.textContent = 'Save';
            saveInlineApiKeyBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            saveInlineApiKeyBtn.disabled = false;
            saveInlineApiKeyBtn.style.opacity = '1';
          }, 2000);
        }
      });
      
      // Save on Enter key
      inlineApiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          saveInlineApiKeyBtn.click();
        }
      });
    }
    
    // Add "Open Settings" button functionality (fallback)
    const openSettingsButton = panel.querySelector('#open-settings');
    if (openSettingsButton) {
      openSettingsButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openSettings' });
        panel.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => panel.remove(), 300);
      });
    }

    // Add "Use This Prompt" button functionality
    const useButton = panel.querySelector('#use-optimized');
    if (useButton) {
      useButton.addEventListener('click', () => {
        const text = panel.querySelector('#optimized-text').textContent;
        
        // Try to find and fill the input field
        const selectors = {
          gpt: ['div[contenteditable="true"]', 'textarea[data-id="root"]', 'textarea[placeholder*="Message"]'],
          claude: ['div[contenteditable="true"]', 'textarea[placeholder*="Message"]'],
          grok: ['textarea[placeholder*="Message"]', 'div[contenteditable="true"]'],
          gemini: ['textarea[placeholder*="Message"]', 'div[contenteditable="true"]']
        };
        
        const platformSelectors = selectors[this.platform] || selectors.gpt;
        let filled = false;
        
        for (const selector of platformSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            if (element.contentEditable === 'true') {
              element.textContent = text;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              filled = true;
            } else if (element.tagName === 'TEXTAREA') {
              element.value = text;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              filled = true;
            }
            if (filled) break;
          }
        }
        
        if (filled) {
          useButton.textContent = '✓ Prompt Inserted!';
          useButton.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
    setTimeout(() => {
            panel.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => panel.remove(), 300);
          }, 1000);
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(text).then(() => {
            useButton.textContent = '✓ Copied to Clipboard!';
            useButton.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
            setTimeout(() => {
              panel.style.animation = 'slideIn 0.3s ease-out reverse';
              setTimeout(() => panel.remove(), 300);
            }, 1000);
          });
        }
      });
      
      useButton.addEventListener('mouseenter', () => {
        useButton.style.transform = 'translateY(-2px)';
        useButton.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
      });
      
      useButton.addEventListener('mouseleave', () => {
        useButton.style.transform = 'translateY(0)';
        useButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
      });
    }

    // Store panel reference for real-time updates
    this.currentPanel = panel;
    this.currentAnalysis = analysis;
    this.currentOptimizedPrompt = llmOptimizedPrompt;
  }

  renderMetrics(metrics) {
    const metricConfigs = {
      clarity: { icon: '🎯', label: 'Clarity', color: '#4caf50' },
      specificity: { icon: '📊', label: 'Specificity', color: '#2196f3' },
      structure: { icon: '📋', label: 'Structure', color: '#ff9800' },
      context: { icon: '🌍', label: 'Context', color: '#9c27b0' },
      intent: { icon: '🎯', label: 'Intent', color: '#f44336' },
      completeness: { icon: '✅', label: 'Completeness', color: '#00bcd4' },
      creativity: { icon: '🎨', label: 'Creativity', color: '#e91e63' },
      precision: { icon: '⚡', label: 'Precision', color: '#795548' },
      engagement: { icon: '💫', label: 'Engagement', color: '#607d8b' },
      adaptability: { icon: '🔄', label: 'Adaptability', color: '#3f51b5' },
      technical_quality: { icon: '⚙️', label: 'Technical Quality', color: '#009688' },
      output_potential: { icon: '🚀', label: 'Output Potential', color: '#ff5722' }
    };

    return Object.entries(metrics).map(([key, value]) => {
      const config = metricConfigs[key] || { icon: '📊', label: key.charAt(0).toUpperCase() + key.slice(1), color: '#666666' };
      const percentage = Math.round(value * 100);
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

  showErrorNotification(message, type = 'error', duration = 5000) {
    try {
      const colors = {
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3',
        success: '#4caf50'
      };
      
      const icons = {
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        success: '✅'
      };
      
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.error};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 1000000;
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        max-width: 400px;
        text-align: center;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      
      notification.innerHTML = `
        <span style="font-size: 16px;">${icons[type] || icons.error}</span>
        <span>${message}</span>
      `;
      
      // Add click to dismiss
      notification.onclick = () => {
        if (notification.parentElement) {
          notification.remove();
        }
      };
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, duration);
    } catch (error) {
      console.error('Failed to show error notification:', error);
    }
  }

  showPlatformNotSupported() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 1000000;
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
      max-width: 350px;
      cursor: pointer;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 18px;">🚫</span>
        <strong>Platform Not Supported</strong>
      </div>
      <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">
        Prompt Tracer works on ChatGPT, Claude, Grok, and Gemini. 
        <br><strong>Click here</strong> to learn more about supported platforms.
      </div>
    `;
    
    notification.onclick = () => {
      window.open('https://github.com/yourusername/prompt_tracer#supported-platforms', '_blank');
      notification.remove();
    };
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  reportError(context, error) {
    try {
      if (!chrome || !chrome.storage || !chrome.storage.local) {
        return; // Extension context invalidated
      }
      
      // Store error locally for debugging (no external transmission)
      const errorReport = {
        timestamp: new Date().toISOString(),
        context: context,
        error: error.message || error.toString(),
        stack: error.stack,
        platform: this.platform,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      chrome.storage.local.get(['errorLogs'], (result) => {
        try {
          if (chrome.runtime && chrome.runtime.lastError) {
            return;
          }
          
          const errorLogs = result.errorLogs || [];
          errorLogs.push(errorReport);
          
          // Keep only last 10 errors
          if (errorLogs.length > 10) {
            errorLogs.splice(0, errorLogs.length - 10);
          }
          
          chrome.storage.local.set({ errorLogs: errorLogs });
        } catch (storageError) {
          console.error('Failed to store error log:', storageError);
        }
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  handleOptimizationError(error, originalPrompt) {
    console.error('Optimization error:', error);
    
    let errorMessage = 'Failed to optimize prompt. ';
    let suggestion = 'Try refreshing the page or check your internet connection.';
    
    if (error.message.includes('API key')) {
      errorMessage += 'API key issue. ';
      suggestion = 'Check your API key in the extension settings.';
    } else if (error.message.includes('network')) {
      errorMessage += 'Network error. ';
      suggestion = 'Check your internet connection and try again.';
    } else if (error.message.includes('quota')) {
      errorMessage += 'API quota exceeded. ';
      suggestion = 'Check your API usage limits or try again later.';
    }
    
    this.showErrorNotification(`${errorMessage}${suggestion}`, 'warning', 8000);
    
    // Fallback to rule-based optimization
    return this.smartFallbackOptimization(originalPrompt, {});
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
    // Monitor input field changes automatically with real-time updates
    setInterval(() => {
      this.monitorInputField();
    }, 500); // Check every 500ms for real-time feel
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
        const trimmedValue = currentValue.trim();
        
        // Real-time updates for existing panel
        if (trimmedValue.length >= 3 && this.currentPanel) {
          // Update quality score in real-time without full re-analysis
          const quickAnalysis = this.optimizer.analyzePrompt(trimmedValue);
          this.updatePanelInRealTime(trimmedValue, quickAnalysis);
        }
        
        // Only do full analysis if there's meaningful content and it changed significantly
        if (trimmedValue.length >= 3 && trimmedValue !== this.lastMonitoredValue) {
          // Only re-analyze if the change is significant (more than just a few characters)
          const significantChange = !this.lastMonitoredValue || 
            Math.abs(trimmedValue.length - this.lastMonitoredValue.length) > 5 ||
            !trimmedValue.startsWith(this.lastMonitoredValue.substring(0, Math.min(10, this.lastMonitoredValue.length)));
          
          if (significantChange) {
            this.lastMonitoredValue = trimmedValue;
            console.log('Auto-detected prompt change:', trimmedValue.substring(0, 50) + '...');
            this.capturePrompt(trimmedValue);
          break;
        }
      }
        
        // If field is empty, clear the last monitored value
        if (trimmedValue.length === 0 && this.lastMonitoredValue) {
          this.lastMonitoredValue = '';
          // Hide analysis panel if it exists
          const existingPanel = document.getElementById('prompt-tracer-panel');
          if (existingPanel) {
            existingPanel.remove();
          }
          this.currentPanel = null;
        }
      }
    }
  }

  generateRealTimeFeedback(promptText, analysis) {
    const feedback = [];
    const metrics = analysis.metrics || {};
    const words = promptText.split(' ').filter(w => w.length > 0);
    const lowerPrompt = promptText.toLowerCase();
    
    // Check for specific issues and provide actionable feedback
    if (words.length < 5) {
      feedback.push({
        type: 'error',
        icon: '📝',
        title: 'Too Short',
        message: 'Your prompt is very brief. Longer prompts usually get better, more detailed responses.',
        suggestion: 'Add more context about what you want to know or achieve.'
      });
    }
    
    if (metrics.clarity < 50) {
      feedback.push({
        type: 'warning',
        icon: '🎯',
        title: 'Unclear Request',
        message: 'Your prompt could be clearer. The AI might not understand exactly what you need.',
        suggestion: 'Use specific action words like "explain", "compare", "create", or "analyze".'
      });
    }
    
    if (metrics.specificity < 50) {
      feedback.push({
        type: 'warning',
        icon: '📊',
        title: 'Too Vague',
        message: 'Your prompt lacks specific details. More specific prompts get better results.',
        suggestion: 'Add details like: who is this for, what format you want, any constraints or preferences.'
      });
    }
    
    if (metrics.context < 50 && !lowerPrompt.includes('for') && !lowerPrompt.includes('about')) {
      feedback.push({
        type: 'info',
        icon: '🌍',
        title: 'Missing Context',
        message: 'Adding context helps the AI provide more relevant responses.',
        suggestion: 'Specify your audience (e.g., "for beginners"), domain, or use case.'
      });
    }
    
    if (metrics.structure < 50 && words.length > 10 && !promptText.includes('\n') && !promptText.includes(':')) {
      feedback.push({
        type: 'info',
        icon: '📋',
        title: 'Could Be Better Organized',
        message: 'Structured prompts with clear sections often get better organized responses.',
        suggestion: 'Use bullet points, numbered lists, or separate your request into clear parts.'
      });
    }
    
    if (metrics.intent < 50 && !lowerPrompt.includes('please') && !lowerPrompt.includes('can you') && !lowerPrompt.includes('?')) {
      feedback.push({
        type: 'info',
        icon: '🎯',
        title: 'Unclear Intent',
        message: 'It\'s not clear what action you want the AI to take.',
        suggestion: 'Start with action words: "Explain...", "Create...", "Compare...", "Help me..."'
      });
    }
    
    // Check for common issues
    if (lowerPrompt.includes('tell me') && words.length < 8) {
      feedback.push({
        type: 'warning',
        icon: '💬',
        title: 'Generic Request',
        message: '"Tell me" is quite generic. Be more specific about what you want to learn.',
        suggestion: 'Instead of "Tell me about X", try "Explain X in simple terms" or "What are the key aspects of X?"'
      });
    }
    
    if (lowerPrompt.includes('best') || lowerPrompt.includes('good') || lowerPrompt.includes('nice')) {
      if (!lowerPrompt.includes('why') && !lowerPrompt.includes('criteria') && !lowerPrompt.includes('compare')) {
        feedback.push({
          type: 'info',
          icon: '⭐',
          title: 'Subjective Terms',
          message: 'Words like "best" or "good" are subjective. The AI needs criteria to judge.',
          suggestion: 'Add what makes it "best" for you: budget, location, features, etc.'
        });
      }
    }
    
    return feedback;
  }

  async checkApiKeyStatus() {
    return new Promise((resolve) => {
      // Always resolve to false if extension context is invalid
      // This prevents the error from breaking the extension
      try {
        // Check if chrome APIs are available
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
          resolve(false);
          return;
        }
        
        // Use try-catch around the entire operation
        try {
          chrome.storage.local.get(['openai-api-key'], (result) => {
            try {
              if (chrome.runtime && chrome.runtime.lastError) {
                // Extension context invalidated
                console.warn('Extension context invalidated');
                resolve(false);
                return;
              }
              const apiKey = result && result['openai-api-key'];
              resolve(apiKey && apiKey.startsWith('sk-') && apiKey.length > 20);
            } catch (error) {
              console.error('Error reading API key:', error);
              resolve(false);
            }
          });
        } catch (error) {
          // If chrome.storage.local.get itself throws, catch it here
          console.error('Storage access error:', error);
          resolve(false);
        }
      } catch (error) {
        // Catch any other errors (like accessing chrome itself)
        console.error('Extension context error:', error);
        resolve(false);
      }
    });
  }

  updateFeedbackInPanel(feedback) {
    if (!this.currentPanel || !feedback || feedback.length === 0) return;
    
    // Find the feedback section in the compact panel
    const feedbackSection = this.currentPanel.querySelector('[style*="padding: 16px 20px; background: #fafbfc"]');
    if (!feedbackSection) return;
    
    // Limit to top 2 most critical items
    const prioritizedFeedback = feedback
      .sort((a, b) => {
        const priority = { 'error': 3, 'warning': 2, 'info': 1 };
        return (priority[b.type] || 0) - (priority[a.type] || 0);
      })
      .slice(0, 2);
    
    // Update the feedback section
    feedbackSection.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${prioritizedFeedback.map((item, index) => `
          <div style="background: white; border-left: 3px solid ${item.type === 'error' ? '#ef4444' : item.type === 'warning' ? '#f59e0b' : '#3b82f6'}; border-radius: 6px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <span style="font-size: 16px; flex-shrink: 0;">${item.icon}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 12px; font-weight: 600; color: #111827; margin-bottom: 2px;">${item.title}</div>
              <div style="font-size: 11px; color: #6b7280; line-height: 1.4;">${item.suggestion || item.message}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async updatePanelInRealTime(promptText, analysis) {
    if (!this.currentPanel) return;
    
    // Generate fresh feedback - use rule-based immediately (fast, always works)
    let feedback = this.generateRealTimeFeedback(promptText, analysis);
    
    // Try AI feedback in background if available (non-blocking)
    try {
      const hasApiKey = await this.checkApiKeyStatus();
      if (hasApiKey && chrome && chrome.runtime && chrome.runtime.sendMessage) {
        // Try AI feedback with timeout
        const aiFeedbackPromise = chrome.runtime.sendMessage({
          action: 'generateFeedback',
          prompt: promptText,
          analysis: analysis
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        try {
          const aiFeedbackResponse = await Promise.race([aiFeedbackPromise, timeoutPromise]);
          if (aiFeedbackResponse && aiFeedbackResponse.feedback && aiFeedbackResponse.feedback.length > 0) {
            feedback = aiFeedbackResponse.feedback;
          }
        } catch (error) {
          // Keep rule-based feedback, AI failed or timed out
          console.log('AI feedback timeout/failed, using rule-based');
        }
      }
    } catch (error) {
      // Keep rule-based feedback
      console.log('Error getting AI feedback, using rule-based');
    }
    
    // Update feedback section
    const feedbackSection = this.currentPanel.querySelector('[style*="What to Improve"]')?.parentElement;
    if (feedbackSection) {
      if (feedback.length > 0) {
        feedbackSection.innerHTML = `
          <h4 style="margin: 0 0 12px 0; color: #333; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <span>🎯</span>
            <span>What to Improve</span>
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${feedback.map((item, index) => `
              <div style="background: ${item.type === 'error' ? '#fff5f5' : item.type === 'warning' ? '#fffbf0' : '#f0f9ff'}; border-left: 4px solid ${item.type === 'error' ? '#f44336' : item.type === 'warning' ? '#ff9800' : '#2196f3'}; border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 10px;">
                <span style="font-size: 18px; margin-top: 2px;">${item.icon}</span>
                <div style="flex: 1;">
                  <div style="font-size: 13px; font-weight: 600; color: #333; margin-bottom: 4px;">${item.title}</div>
                  <div style="font-size: 12px; color: #666; line-height: 1.5;">${item.message}</div>
                  ${item.suggestion ? `<div style="font-size: 12px; color: #667eea; margin-top: 6px; font-weight: 500;">💡 ${item.suggestion}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        feedbackSection.innerHTML = `
          <div style="text-align: center; padding: 20px; background: #f0f9ff; border-radius: 12px; border: 1px solid #b3e5fc;">
            <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
            <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">Great prompt!</div>
            <div style="font-size: 12px; color: #666;">Your prompt looks good. The optimized version below will make it even better.</div>
          </div>
        `;
      }
    }
  }

  updateOptimizedPrompt(optimizedPrompt) {
    if (!this.currentPanel || !optimizedPrompt) {
      console.log('Cannot update optimized prompt - no panel or no prompt');
      return;
    }
    
    console.log('Updating optimized prompt in panel:', optimizedPrompt.substring(0, 50) + '...');
    
    // Find the optimized text element (works with both loading and existing states)
    const optimizedTextElement = this.currentPanel.querySelector('#optimized-text');
    const optimizedSection = this.currentPanel.querySelector('[style*="Ready-to-Use Version"]')?.closest('div[style*="padding: 20px"]');
    const loadingSection = this.currentPanel.querySelector('[style*="Optimizing your prompt"]')?.closest('div[style*="text-align: center"]');
    
    if (optimizedTextElement) {
      // Update existing optimized prompt text
      optimizedTextElement.textContent = optimizedPrompt;
      console.log('Updated existing optimized prompt text');
      
      // Update the AI-powered indicator if it exists
      const aiIndicator = this.currentPanel.querySelector('[style*="AI-powered optimization"]');
      if (aiIndicator && !aiIndicator.textContent.includes('AI-powered')) {
        aiIndicator.innerHTML = `
          <div style="margin-top: 8px; text-align: center; font-size: 10px; color: #9ca3af; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>🤖</span>
            <span>AI-powered optimization</span>
          </div>
        `;
      }
    } else if (loadingSection) {
      // Replace loading section with optimized prompt
      loadingSection.outerHTML = `
        <div style="margin-bottom: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 16px;">🚀</span>
              <span style="font-size: 13px; font-weight: 600; color: #374151;">Ready-to-Use Version</span>
            </div>
            <button id="copy-optimized" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2); transition: all 0.2s;">Copy</button>
          </div>
          <div style="background: linear-gradient(135deg, #f8f9ff, #f0f4ff); border: 2px solid #e0e7ff; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; color: #1f2937; position: relative; max-height: 200px; overflow-y: auto;">
            <div id="optimized-text" style="white-space: pre-wrap; word-wrap: break-word;">${optimizedPrompt}</div>
          </div>
          <div style="margin-top: 10px;">
            <button id="use-optimized" style="width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; padding: 12px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.2s;">
              Use This Prompt
            </button>
          </div>
          <div style="margin-top: 8px; text-align: center; font-size: 10px; color: #9ca3af; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>🤖</span>
            <span>AI-powered optimization</span>
          </div>
        </div>
      `;
      console.log('Replaced loading section with optimized prompt');
      
      // Re-attach event listeners
      this.attachOptimizedPromptListeners();
    } else if (optimizedSection) {
      // Update existing optimized prompt section
      const existingText = optimizedSection.querySelector('#optimized-text');
      if (existingText) {
        existingText.textContent = optimizedPrompt;
        console.log('Updated existing optimized prompt in section');
        
        // Update AI indicator
        const aiIndicator = optimizedSection.querySelector('[style*="AI-powered"]');
        if (aiIndicator) {
          aiIndicator.innerHTML = `
            <div style="margin-top: 8px; text-align: center; font-size: 10px; color: #9ca3af; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span>🤖</span>
              <span>AI-powered optimization</span>
            </div>
          `;
        }
      }
    } else {
      console.log('Could not find optimized prompt section to update');
    }
  }
  
  attachOptimizedPromptListeners() {
    if (!this.currentPanel) return;
    
    const copyButton = this.currentPanel.querySelector('#copy-optimized');
      if (copyButton) {
        copyButton.addEventListener('click', () => {
          const text = this.currentPanel.querySelector('#optimized-text').textContent;
          navigator.clipboard.writeText(text).then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = '✓ Copied';
            copyButton.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
            setTimeout(() => {
              copyButton.textContent = originalText;
              copyButton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            }, 2000);
          });
        });
      }
      
      const useButton = this.currentPanel.querySelector('#use-optimized');
      if (useButton) {
        useButton.addEventListener('click', () => {
          const text = this.currentPanel.querySelector('#optimized-text').textContent;
          
          const selectors = {
            gpt: ['div[contenteditable="true"]', 'textarea[data-id="root"]', 'textarea[placeholder*="Message"]'],
            claude: ['div[contenteditable="true"]', 'textarea[placeholder*="Message"]'],
            grok: ['textarea[placeholder*="Message"]', 'div[contenteditable="true"]'],
            gemini: ['textarea[placeholder*="Message"]', 'div[contenteditable="true"]']
          };
          
          const platformSelectors = selectors[this.platform] || selectors.gpt;
          let filled = false;
          
          for (const selector of platformSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              if (element.contentEditable === 'true') {
                element.textContent = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                filled = true;
              } else if (element.tagName === 'TEXTAREA') {
                element.value = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                filled = true;
              }
              if (filled) break;
            }
          }
          
          if (filled) {
            useButton.textContent = '✓ Prompt Inserted!';
            useButton.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
            setTimeout(() => {
              this.currentPanel.style.animation = 'slideIn 0.3s ease-out reverse';
              setTimeout(() => this.currentPanel.remove(), 300);
            }, 1000);
          }
        });
      }
    }
  }

  async getLLMOptimizedPrompt(originalPrompt, analysis) {
    try {
      console.log('Starting LLM optimization for prompt:', originalPrompt.substring(0, 50) + '...');
      
      // Check if extension context is valid
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        throw new Error('Extension context invalidated');
      }
      
      // Send request to background script for LLM optimization with timeout
      const response = await Promise.race([
        chrome.runtime.sendMessage({
          action: 'optimizePrompt',
          prompt: originalPrompt,
          analysis: analysis
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Message timeout')), 4000)
        )
      ]);
      
      console.log('Background script response:', response);
      
      if (response && response.optimized && response.optimized !== originalPrompt) {
        console.log('LLM optimization successful using:', response.method);
        return response.optimized;
      } else {
        console.log('LLM optimization returned invalid result, using fallback');
        throw new Error('Invalid optimization result');
      }
    } catch (error) {
      console.log('LLM optimization failed, using fallback:', error.message);
      // Use smart fallback as backup
      return this.smartFallbackOptimization(originalPrompt, analysis);
    }
  }

  smartFallbackOptimization(originalPrompt, analysis) {
    console.log('Using smart fallback optimization');
    const lowerPrompt = originalPrompt.toLowerCase();
    let optimized = originalPrompt;
    
    // Context-aware optimization based on prompt content - NO GENERIC TEMPLATES
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is') || lowerPrompt.includes('tell me about')) {
      const topic = originalPrompt.replace(/explain|what is|tell me about/gi, '').trim();
      optimized = `Please explain ${topic} in a clear and engaging way. I'd like to understand what it is, why it matters, key concepts, and real-world examples. Make it accessible and interesting.`;
    } else if (lowerPrompt.includes('trip') || lowerPrompt.includes('travel') || lowerPrompt.includes('vacation') || lowerPrompt.includes('destination') || lowerPrompt.includes('beach')) {
      optimized = `I'm planning a trip and need recommendations. Please suggest specific destinations with details about best time to visit, activities and attractions, accommodation options, and travel tips. Include both popular spots and hidden gems.`;
    } else if (lowerPrompt.includes('movie') || lowerPrompt.includes('film') || lowerPrompt.includes('watch') || lowerPrompt.includes('entertainment')) {
      optimized = `I'm looking for entertainment recommendations. Please suggest specific titles with brief descriptions, why they're worth watching, where to find them, and similar recommendations if I enjoy these.`;
    } else if (lowerPrompt.includes('idea') || lowerPrompt.includes('suggest') || lowerPrompt.includes('recommend')) {
      const topic = originalPrompt.replace(/give me|ideas for|suggest|recommend/gi, '').trim();
      optimized = `I need creative and practical ideas related to ${topic}. Please provide specific suggestions with details about implementation, benefits, and any considerations I should know about.`;
    } else if (lowerPrompt.includes('how to') || lowerPrompt.includes('guide') || lowerPrompt.includes('steps')) {
      const task = originalPrompt.replace(/how to|guide|steps/gi, '').trim();
      optimized = `I need guidance on how to ${task}. Please provide clear, practical steps with explanations, tips for success, and things to watch out for.`;
    } else if (lowerPrompt.includes('write') || lowerPrompt.includes('create') || lowerPrompt.includes('generate')) {
      optimized = `I need help ${originalPrompt.toLowerCase()}. Please provide guidance on how to approach this, key elements to include, and tips for making it effective.`;
    } else if (lowerPrompt.includes('compare')) {
      optimized = `I'd like to compare the topics mentioned. Please provide a helpful comparison with key differences, similarities, pros and cons, and when each option might be best.`;
    } else {
      // Natural, conversational improvement - NO TEMPLATE
      optimized = `I'd like to learn more about ${originalPrompt}. Please provide a helpful response that covers the key aspects, practical information, and anything else that would be useful to know about this topic.`;
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