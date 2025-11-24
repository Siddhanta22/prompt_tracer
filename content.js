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
    const coreMetrics = ['clarity', 'specificity', 'structure', 'context', 'intent', 'completeness'];
    const coreScores = coreMetrics.map(key => metrics[key] || 0);
    const avgScore = coreScores.reduce((a, b) => a + b, 0) / coreScores.length;
    
    // Convert to percentage
    const percentage = avgScore * 100;
    
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
    
    // Show analysis immediately with real-time score
    if (!analysis.quality) {
      analysis.quality = this.optimizer.determineQuality(analysis.metrics || {});
    }
    this.showAnalysis(promptData, analysis, null); // Show panel immediately, optimize in background
    
    // Try LLM optimization in background, update panel when ready
    this.getLLMOptimizedPrompt(promptText, analysis).then(optimizedPrompt => {
      console.log('Got LLM optimized prompt, updating panel...');
      promptData.setOptimizedVersion(optimizedPrompt);
      this.storePromptData(promptData);
      
      // Update the panel with optimized prompt
      this.updateOptimizedPrompt(optimizedPrompt);
    }).catch(error => {
      console.error('Error in LLM optimization flow:', error);
      // Use rule-based optimization as fallback
      const fallbackOptimization = this.optimizer.optimizePrompt(promptText, analysis);
      promptData.setOptimizedVersion(fallbackOptimization);
      this.storePromptData(promptData);
      
      // Update the panel with fallback optimization
      this.updateOptimizedPrompt(fallbackOptimization);
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
    // Don't show analysis for empty or very short prompts
    if (!promptData.prompt || promptData.prompt.trim().length < 3) {
      return;
    }

    // Remove existing panel
    const existingPanel = document.getElementById('prompt-tracer-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    // Calculate overall quality score (0-100)
    const metrics = analysis.metrics || {};
    const coreMetrics = ['clarity', 'specificity', 'structure', 'context', 'intent', 'completeness'];
    const coreScores = coreMetrics.map(key => (metrics[key] || 0) * 100);
    const overallScore = Math.round(coreScores.reduce((a, b) => a + b, 0) / coreScores.length);
    
    // Get quality level and color based on score
    const quality = analysis.quality || 'developing';
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
      width: 420px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      pointer-events: auto;
      max-height: 90vh;
      overflow-y: auto;
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

    panel.innerHTML = `
      <!-- Header with Quality Score -->
      <div style="background: linear-gradient(135deg, ${config.color}15, ${config.color}05); padding: 24px; border-radius: 20px 20px 0 0; border-bottom: 2px solid ${config.color}20;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 24px;">${config.icon}</span>
              <h3 style="margin: 0; color: #333; font-size: 18px; font-weight: 700;">Prompt Quality</h3>
            </div>
            <div style="font-size: 13px; color: #666; margin-bottom: 16px;">
              ${this.getQualityDescription(quality)}
            </div>
          </div>
          <button id="close-analysis-panel" style="background: rgba(0,0,0,0.05); border: none; cursor: pointer; font-size: 20px; color: #666; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
        </div>
        
        <!-- Single Quality Score Display -->
        <div style="text-align: center;">
          <div style="position: relative; display: inline-block;">
            <div style="width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(from 0deg, ${config.color} 0% ${overallScore}%, #e0e0e0 ${overallScore}% 100%); display: flex; align-items: center; justify-content: center; position: relative;">
              <div style="width: 90px; height: 90px; border-radius: 50%; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: 32px; font-weight: 800; color: ${config.color}; line-height: 1;">${overallScore}</div>
                <div style="font-size: 11px; color: #999; font-weight: 600; margin-top: -4px;">/ 100</div>
              </div>
            </div>
          </div>
          <div style="margin-top: 12px; font-size: 14px; font-weight: 600; color: ${config.color};">
            ${config.label} Quality
          </div>
        </div>
      </div>

      <!-- Optimized Prompt (Main Focus) -->
      <div style="padding: 24px;">
        ${llmOptimizedPrompt ? `
          <div style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <h4 style="margin: 0; color: #333; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>✨</span>
                <span>Optimized Prompt</span>
              </h4>
              <button id="copy-optimized" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); transition: all 0.2s;">Copy</button>
            </div>
            <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.6; color: #333; position: relative; max-height: 300px; overflow-y: auto;">
              <div id="optimized-text" style="white-space: pre-wrap; word-wrap: break-word;">${llmOptimizedPrompt}</div>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #667eea; font-weight: 500; display: flex; align-items: center; gap: 4px;">
              <span>🤖</span>
              <span>AI-powered • Real-time • Context-aware</span>
            </div>
          </div>
        ` : `
          <div style="text-align: center; padding: 40px 20px; color: #999;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div style="font-size: 14px; font-weight: 500;">Optimizing your prompt...</div>
            <div style="font-size: 12px; margin-top: 8px; color: #bbb;">This may take a few seconds</div>
          </div>
        `}

        <!-- Single Action Button -->
        ${llmOptimizedPrompt ? `
          <button id="use-optimized" style="width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.2s; margin-top: 16px;">
            Use This Prompt
          </button>
        ` : ''}
      </div>
    `;

    document.body.appendChild(panel);

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
        closeButton.style.background = 'rgba(0,0,0,0.1)';
      });
      
      closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(0,0,0,0.05)';
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
        const errorLogs = result.errorLogs || [];
        errorLogs.push(errorReport);
        
        // Keep only last 10 errors
        if (errorLogs.length > 10) {
          errorLogs.splice(0, errorLogs.length - 10);
        }
        
        chrome.storage.local.set({ errorLogs: errorLogs });
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

  updatePanelInRealTime(promptText, analysis) {
    if (!this.currentPanel) return;
    
    // Calculate overall quality score
    const metrics = analysis.metrics || {};
    const coreMetrics = ['clarity', 'specificity', 'structure', 'context', 'intent', 'completeness'];
    const coreScores = coreMetrics.map(key => (metrics[key] || 0) * 100);
    const overallScore = Math.round(coreScores.reduce((a, b) => a + b, 0) / coreScores.length);
    
    // Get quality level
    const quality = analysis.quality || 'developing';
    const qualityConfig = {
      basic: { color: '#f44336', label: 'Basic', icon: '🌱' },
      developing: { color: '#ff9800', label: 'Developing', icon: '🚀' },
      good: { color: '#4caf50', label: 'Good', icon: '✨' },
      excellent: { color: '#2196f3', label: 'Excellent', icon: '🌟' },
      masterful: { color: '#9c27b0', label: 'Masterful', icon: '👑' }
    };
    
    const config = qualityConfig[quality] || qualityConfig.developing;
    
    // Update the score circle
    const scoreCircle = this.currentPanel.querySelector('[style*="conic-gradient"]');
    if (scoreCircle) {
      scoreCircle.style.background = `conic-gradient(from 0deg, ${config.color} 0% ${overallScore}%, #e0e0e0 ${overallScore}% 100%)`;
    }
    
    // Update the score number
    const scoreNumber = this.currentPanel.querySelector('[style*="font-size: 32px"]');
    if (scoreNumber) {
      scoreNumber.textContent = overallScore;
      scoreNumber.style.color = config.color;
    }
    
    // Update the quality label
    const qualityLabel = this.currentPanel.querySelector('[style*="font-size: 14px; font-weight: 600"]');
    if (qualityLabel && qualityLabel.textContent.includes('Quality')) {
      qualityLabel.textContent = `${config.label} Quality`;
      qualityLabel.style.color = config.color;
    }
    
    // Update description
    const description = this.currentPanel.querySelector('[style*="font-size: 13px; color: #666"]');
    if (description && description.textContent.includes('prompt')) {
      description.textContent = this.getQualityDescription(quality);
    }
    
    // Update header background
    const header = this.currentPanel.querySelector('[style*="background: linear-gradient"]');
    if (header) {
      header.style.background = `linear-gradient(135deg, ${config.color}15, ${config.color}05)`;
      header.style.borderBottom = `2px solid ${config.color}20`;
    }
  }

  updateOptimizedPrompt(optimizedPrompt) {
    if (!this.currentPanel) return;
    
    // Find the loading section
    const loadingSection = this.currentPanel.querySelector('[style*="text-align: center; padding: 40px"]');
    if (loadingSection) {
      loadingSection.outerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h4 style="margin: 0; color: #333; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>✨</span>
              <span>Optimized Prompt</span>
            </h4>
            <button id="copy-optimized" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); transition: all 0.2s;">Copy</button>
          </div>
          <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.6; color: #333; position: relative; max-height: 300px; overflow-y: auto;">
            <div id="optimized-text" style="white-space: pre-wrap; word-wrap: break-word;">${optimizedPrompt}</div>
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: #667eea; font-weight: 500; display: flex; align-items: center; gap: 4px;">
            <span>🤖</span>
            <span>AI-powered • Real-time • Context-aware</span>
          </div>
        </div>
        <button id="use-optimized" style="width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.2s; margin-top: 16px;">
          Use This Prompt
        </button>
      `;
      
      // Re-attach event listeners
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
    
    this.currentOptimizedPrompt = optimizedPrompt;
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