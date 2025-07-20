/**
 * Prompt optimization engine
 * Analyzes prompts and suggests improvements based on best practices
 */

export class PromptOptimizer {
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
          }
        ]
      }
    };
  }

  analyzePrompt(prompt) {
    const analysis = {
      score: 0,
      issues: [],
      suggestions: [],
      optimizedVersion: null
    };

    // Analyze each optimization category
    Object.entries(this.optimizationRules).forEach(([category, rule]) => {
      rule.patterns.forEach(pattern => {
        if (pattern.pattern.test(prompt)) {
          analysis.issues.push({
            category: rule.name,
            issue: pattern.issue,
            suggestion: pattern.suggestion
          });
        }
      });
    });

    // Calculate score based on issues found
    analysis.score = Math.max(0, 100 - (analysis.issues.length * 15));
    
    // Generate optimized version
    analysis.optimizedVersion = this.generateOptimizedVersion(prompt, analysis.issues);
    
    return analysis;
  }

  generateOptimizedVersion(originalPrompt, issues) {
    let optimized = originalPrompt;
    const improvements = [];

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
    // Add context if it's a generic request
    if (prompt.toLowerCase().includes('explain') || prompt.toLowerCase().includes('describe')) {
      return `Please provide a detailed explanation with specific examples and practical applications. ${prompt}`;
    }
    return prompt;
  }

  addTargetAudience(prompt) {
    // Add target audience if not specified
    if (!prompt.toLowerCase().includes('for') && !prompt.toLowerCase().includes('to')) {
      return `For someone with intermediate knowledge in this field, ${prompt}`;
    }
    return prompt;
  }

  addObjective(prompt) {
    // Add objective if not clear
    if (!prompt.toLowerCase().includes('goal') && !prompt.toLowerCase().includes('objective')) {
      return `My goal is to ${prompt}`;
    }
    return prompt;
  }

  addFormatSpecification(prompt) {
    // Add format specification if not present
    if (!prompt.toLowerCase().includes('format') && !prompt.toLowerCase().includes('output')) {
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