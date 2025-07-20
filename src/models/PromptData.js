/**
 * Data model for prompt tracing and analysis
 */

export class PromptData {
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

export class PromptMetrics {
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
    this.overallScore = (
      this.clarity * 0.25 +
      this.specificity * 0.25 +
      this.completeness * 0.2 +
      this.relevance * 0.2 +
      this.userSatisfaction * 0.1
    );
  }
} 