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

  // Action verbs that signal a concrete task.
  getActionWords() {
    return [
      'write', 'create', 'explain', 'analyze', 'compare', 'evaluate', 'build',
      'design', 'make', 'generate', 'summarize', 'list', 'outline', 'plan',
      'improve', 'fix', 'debug', 'review', 'translate', 'develop', 'draft',
      'describe', 'show', 'demonstrate', 'illustrate'
    ];
  }

  // Naming a well-known deliverable or genre — "a recipe", "a haiku", "an
  // itinerary", "interview questions" — is itself a clear, bounded request:
  // there's nothing left for the LLM to guess at, whether or not the
  // sentence also has an explicit verb. Shared by clear_action (recognizing
  // the request) and the ambiguity check (recognizing the scope is bounded)
  // so the two can't quietly disagree about the same prompt.
  getBoundedTopicWords() {
    return [
      'recipe', 'template', 'example', 'itinerary', 'questions', 'substitute',
      'alternative', 'checklist', 'workout', 'haiku', 'poem', 'sonnet',
      'limerick', 'tweet', 'post', 'email', 'essay', 'story', 'script',
      'tagline', 'slogan', 'joke', 'riddle', 'resume', 'memo', 'letter'
    ];
  }

  // The single source of truth: the score, the quality tier, the checklist
  // shown in the panel, the feedback cards, and the optimizer's reinforcement
  // pass all read from this one array. Nothing else computes a competing
  // number, so "all checks pass" and "score is 100" can never disagree again.
  runChecks(text) {
    const trimmed = (text || '').trim();
    const lower = trimmed.toLowerCase();
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = trimmed.split('\n\n').filter(p => p.trim().length > 0);

    const hasActionWord = this.getActionWords().some(w => lower.includes(w));
    // A plain "what is X" / "how does X work" is a complete, well-formed
    // question even without a terminal "?" — people routinely drop it when
    // typing fast into a chat box. Recognizing the WH-structure itself
    // avoids penalizing a perfectly clear question for missing punctuation.
    // "Best time to visit X" / "best way to do X" is an implicit question
    // (functionally "when/how should I...") even without a WH-word.
    const hasWhQuestion = /^(what|how|why|when|where|who|which|best)\b/i.test(trimmed);
    // Noun-phrase requests like "pros and cons of X" or "summary of X" carry
    // just as clear an implied action as an explicit verb — the analysis
    // type is named directly, so treat these openers as recognized requests.
    const hasAnalyticalNounPhrase = /^(summary|overview|pros and cons|advantages and disadvantages|comparison|difference between|differences between|analysis|review|history|breakdown|top\s+\d+)\b/i.test(trimmed);
    // "Give me X" / "come up with X" are two of the most common ways people
    // actually phrase a request in a chat box — as clear an ask as any verb
    // in getActionWords(), just idiomatic rather than a single verb.
    const hasCommonRequestPhrase = lower.includes('give me') || lower.includes('come up with');
    // Naming a well-known deliverable ("recipe for X", "template for X",
    // "itinerary for X") is itself the request — no separate verb needed.
    const hasBoundedTopicWord = this.getBoundedTopicWords().some(w => lower.includes(w));
    const hasQuestionOrRequest = trimmed.includes('?') || hasWhQuestion || hasAnalyticalNounPhrase
      || hasCommonRequestPhrase || hasBoundedTopicWord
      || lower.includes('please') || lower.includes('can you') || lower.includes('could you')
      || lower.includes('help me') || lower.startsWith('help ');
    const hasNumberOrProperNoun = /\d/.test(trimmed) || /[A-Z][a-z]+/.test(trimmed);
    const hasSpecificWord = /\b(specific|detailed|concrete|particular|exact)\b/i.test(trimmed);
    const hasAudienceOrPurpose = /\b(beginner|expert|professional|student|for a|for someone|goal|objective|purpose|so that|in order to)\b/i.test(lower)
      || lower.includes(' for ') || lower.includes(' about ');
    const hasFormatting = paragraphs.length > 1 || trimmed.includes('\n')
      || /(^|\n)\s*[-•]/.test(trimmed) || /(^|\n)\s*\d+[.)]/.test(trimmed);
    const hasFormatOrExampleAsk = /\b(format|list|steps|bullet|section|example|instance)\b/i.test(lower);

    return [
      {
        id: 'substance',
        weight: 20,
        ok: words.length >= 8,
        label: words.length >= 8
          ? 'Enough detail to work with'
          : 'Too short — add more detail about what you want',
        reinforce: null
      },
      {
        id: 'clear_action',
        weight: 20,
        ok: hasActionWord || hasQuestionOrRequest,
        label: (hasActionWord || hasQuestionOrRequest)
          ? 'Clear action requested'
          : 'No clear task or action — start with a verb like "explain" or "create"',
        reinforce: null
      },
      {
        id: 'specific_details',
        weight: 20,
        ok: hasNumberOrProperNoun || hasSpecificWord,
        label: (hasNumberOrProperNoun || hasSpecificWord)
          ? 'Includes specific details'
          : 'No specific details — mention concrete names, numbers, or examples',
        reinforce: 'Be concrete and specific — use real details, not placeholders.'
      },
      {
        id: 'audience_or_context',
        weight: 20,
        ok: hasAudienceOrPurpose,
        label: hasAudienceOrPurpose
          ? 'Audience or context given'
          : 'No audience or context — say who this is for and why',
        // Deliberately not "assume a non-expert audience" — that default
        // actively hurts clearly technical asks (e.g. a React/SQL question),
        // pushing the LLM to over-explain basics to someone who obviously
        // already knows them. Ask it to match the depth the question already
        // implies instead of forcing a novice-level default either way.
        reinforce: "Match the response's depth to what the question already implies (e.g. keep it at a developer level if it uses technical terms) — state who it's for if that's genuinely unclear."
      },
      {
        id: 'structure_or_format',
        weight: 20,
        ok: hasFormatting || hasFormatOrExampleAsk,
        label: (hasFormatting || hasFormatOrExampleAsk)
          ? 'Structured or asks for a specific format'
          : 'No structure or format requested — ask for bullet points, sections, or an example',
        reinforce: 'Structure the response with clear sections or bullet points, and include at least one concrete example.'
      }
    ];
  }

  // Ambiguity is a different problem than a missing format ask: reinforcement
  // (below) only ever appends generic rigor instructions, so it can polish
  // HOW a vague prompt gets answered but can't fix WHAT the LLM has to guess
  // at. A prompt this short, missing substance/specifics/audience all at
  // once, is a sign the user hasn't decided the scope themselves yet — no
  // amount of "be more specific" reinforcement resolves that, only the user
  // actually adding real intent can.
  isAmbiguous(text, checks) {
    const trimmed = (text || '').trim();
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);

    // "What is X" / "How does X work" is fully scoped by its own grammar —
    // the LLM knows exactly what's being asked (define/explain X) even if
    // the prompt is short. The scope problem is specific to broad, undefined
    // action verbs like "build" or "make", not genuine definitional
    // questions, so those are excluded here even though they can trip the
    // same brevity-driven checks below.
    // "Help me understand/learn X" and "explain/describe X" are all
    // functionally the same ask — bounded by the named topic, not open scope.
    const isDefinitionalQuestion = /^(what|how|why|when|where|who|which|best|explain|describe)\b/i.test(trimmed)
      || trimmed.includes('?')
      || /\bhelp me (understand|learn|grasp)\b/i.test(trimmed);
    if (isDefinitionalQuestion) return false;

    // "Pros and cons of X" / "summary of X" / "difference between X and Y"
    // name the analysis type directly — just as bounded as an explicit verb.
    const isAnalyticalNounPhrase = /^(summary|overview|pros and cons|advantages and disadvantages|comparison|difference between|differences between|analysis|review|history|breakdown|top\s+\d+)\b/i.test(trimmed);
    if (isAnalyticalNounPhrase) return false;

    // "Translate THIS sentence" / "summarize THIS article" / "fix THIS
    // function" all point at something specific and already provided — the
    // scope is bounded by that reference even though the sentence is short.
    const lower = trimmed.toLowerCase();
    const hasBoundedReference = /\b(this|that|these|those)\b/i.test(lower);

    // Naming a well-known deliverable/genre ("a haiku", "an itinerary", "a
    // recipe") bounds the task the same way — there's no real scope left
    // for the LLM to guess at.
    const hasGenreWord = this.getBoundedTopicWords().some(w => lower.includes(w));

    if (hasBoundedReference || hasGenreWord) return false;

    const byId = Object.fromEntries(checks.map(c => [c.id, c.ok]));
    const missingCount = [byId.substance, byId.specific_details, byId.audience_or_context]
      .filter(ok => ok === false).length;
    return words.length <= 8 && missingCount >= 2;
  }

  analyzePrompt(prompt) {
    const checks = this.runChecks(prompt);
    const score = checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0);
    const quality = this.determineQuality(score);

    return {
      metrics: { overallScore: score },
      checks,
      quality,
      isAmbiguous: this.isAmbiguous(prompt, checks)
    };
  }

  determineQuality(score) {
    const percentage = Math.max(0, Math.min(100, score));
    if (percentage < 30) return 'basic';
    if (percentage < 50) return 'developing';
    if (percentage < 70) return 'good';
    if (percentage < 85) return 'excellent';
    return 'masterful';
  }

  // Strictly additive: the original text is never rewritten, reworded, or
  // re-cased (that was the old bug — lowercasing the whole prompt destroyed
  // proper nouns like "Facebook", which specificity scoring rewards). This
  // only appends fixes for checks that are currently failing, phrased so
  // each addition contains the exact signal its check looks for — so
  // applying the suggestion reliably flips that check to passing.
  optimizePrompt(promptText, analysis) {
    const checks = (analysis && analysis.checks) || this.runChecks(promptText);
    return this.reinforceFailedChecks(promptText, checks);
  }

  reinforceFailedChecks(text, checks) {
    const asks = checks.filter(c => !c.ok && c.reinforce).map(c => c.reinforce);

    if (asks.length === 0) {
      return text;
    }

    return `${text.trim()}\n\nAdditional requirements:\n- ${asks.join('\n- ')}`;
  }

}

const CORE_METRIC_KEYS = ['clarity', 'specificity', 'structure', 'context', 'intent', 'completeness'];

function buildStoredMetrics(analysis) {
  const metrics = { ...(analysis?.metrics || {}) };
  if (typeof metrics.overallScore !== 'number') {
    // Backward compatibility only — the current engine always sets
    // overallScore directly in analyzePrompt(). This path only exists in
    // case metrics ever comes from an older shape without it.
    const coreScores = CORE_METRIC_KEYS.map(key => Math.max(0, Math.min(100, metrics[key] || 0)));
    metrics.overallScore = Math.round(coreScores.reduce((a, b) => a + b, 0) / coreScores.length);
  }
  return metrics;
}

function getOverallScoreFromMetrics(metrics) {
  if (!metrics) return 0;
  if (typeof metrics.overallScore === 'number') {
    return metrics.overallScore <= 1
      ? Math.round(metrics.overallScore * 100)
      : Math.round(metrics.overallScore);
  }
  const coreScores = CORE_METRIC_KEYS.map(key => Math.max(0, Math.min(100, metrics[key] || 0)));
  return Math.round(coreScores.reduce((a, b) => a + b, 0) / coreScores.length);
}

class PromptTracer {
  constructor() {
    this.platform = this.detectPlatform();
    this.optimizer = new PromptOptimizer();
    this.currentPrompt = null;
    // Bumped every time the tracked input text actually changes. Async AI
    // calls capture this value and check it before writing to the panel, so
    // a slow response for stale text can never clobber a newer result.
    this.analysisGeneration = 0;
    this.settings = {
      autoAnalysis: true,
      showPanel: true,
      saveHistory: true,
      llmOptimization: true
    };
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

  // Design tokens + component classes + animations shared by the panel, the
  // floating trigger button, toasts, and the shortcuts modal. Injected once,
  // as early as possible, so dark mode is correct even before any of those
  // elements exist yet.
  injectSharedStyles() {
    if (document.getElementById('prompt-tracer-styles')) return;
    const style = document.createElement('style');
    style.id = 'prompt-tracer-styles';
    style.textContent = `
      #prompt-tracer-panel, #prompt-tracer-button, #prompt-tracer-tutorial, .pt-toast, .pt-modal-overlay {
        --pt-bg: #ffffff;
        --pt-bg-subtle: #f9fafb;
        --pt-bg-muted: #f3f4f6;
        --pt-border: #e5e7eb;
        --pt-border-strong: #d1d5db;
        --pt-text-primary: #111827;
        --pt-text-secondary: #4b5563;
        --pt-text-muted: #9ca3af;
        --pt-accent: #5b5bd6;
        --pt-accent-hover: #4747c2;
        --pt-accent-subtle: #eef0fd;
        --pt-accent-text: #4338ca;
        --pt-success: #1a9d5c;
        --pt-success-subtle: #e8f7ef;
        --pt-success-text: #0f7a45;
        --pt-warning: #c17a10;
        --pt-warning-subtle: #fdf3e2;
        --pt-warning-text: #92590a;
        --pt-danger: #d13c3c;
        --pt-danger-subtle: #fbeaea;
        --pt-danger-text: #a82a2a;
        --pt-radius-sm: 6px;
        --pt-radius-md: 8px;
        --pt-radius-lg: 14px;
        --pt-shadow: 0 20px 60px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06);
        color-scheme: light dark;
      }
      @media (prefers-color-scheme: dark) {
        #prompt-tracer-panel, #prompt-tracer-button, #prompt-tracer-tutorial, .pt-toast, .pt-modal-overlay {
          --pt-bg: #1c1c1f;
          --pt-bg-subtle: #232326;
          --pt-bg-muted: #2a2a2e;
          --pt-border: #38383d;
          --pt-border-strong: #4a4a50;
          --pt-text-primary: #f4f4f5;
          --pt-text-secondary: #a8a8b3;
          --pt-text-muted: #75757f;
          --pt-accent: #8b8bf0;
          --pt-accent-hover: #a3a3f5;
          --pt-accent-subtle: rgba(139,139,240,0.16);
          --pt-accent-text: #c7c7f9;
          --pt-success-subtle: rgba(26,157,92,0.16);
          --pt-success-text: #4ade95;
          --pt-warning-subtle: rgba(193,122,16,0.18);
          --pt-warning-text: #f0ac52;
          --pt-danger-subtle: rgba(209,60,60,0.18);
          --pt-danger-text: #f28080;
          --pt-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
        }
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      #prompt-tracer-panel * { box-sizing: border-box; }
      .pt-icon-btn {
        background: rgba(255,255,255,0.15);
        border: none;
        cursor: pointer;
        color: white;
        border-radius: var(--pt-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease;
      }
      .pt-icon-btn:hover { background: rgba(255,255,255,0.28); }
      .pt-btn {
        border: none;
        border-radius: var(--pt-radius-sm);
        cursor: pointer;
        font-weight: 600;
        transition: background 0.15s ease, opacity 0.15s ease;
      }
      .pt-btn-primary { background: var(--pt-accent); color: white; }
      .pt-btn-primary:hover { background: var(--pt-accent-hover); }
      .pt-btn-success { background: var(--pt-success); color: white; }
      .pt-btn-danger { background: var(--pt-danger); color: white; }
      #prompt-tracer-panel a { color: var(--pt-accent); }
    `;
    document.head.appendChild(style);
  }

  async init() {
    try {
      console.log('Prompt Tracer: init() called');
      this.injectSharedStyles();
      if (this.platform === 'unknown') {
        console.log('Prompt Tracer: Platform not supported');
        this.showPlatformNotSupported();
        return;
      }

      await this.loadSettings();
      console.log(`Prompt Tracer: Initialized for ${this.platform}`);
      this.setupEventListeners();
      this.setupSettingsListener();
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

  loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        ['auto-analysis', 'show-panel', 'save-history', 'llm-optimization'],
        (result) => {
          this.settings = {
            autoAnalysis: result['auto-analysis'] !== false,
            showPanel: result['show-panel'] !== false,
            saveHistory: result['save-history'] !== false,
            llmOptimization: result['llm-optimization'] !== false
          };
          resolve();
        }
      );
    });
  }

  setupSettingsListener() {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes['auto-analysis']) {
        this.settings.autoAnalysis = changes['auto-analysis'].newValue !== false;
      }
      if (changes['show-panel']) {
        this.settings.showPanel = changes['show-panel'].newValue !== false;
        if (!this.settings.showPanel) {
          const panel = document.getElementById('prompt-tracer-panel');
          if (panel) panel.remove();
        }
      }
      if (changes['save-history']) {
        this.settings.saveHistory = changes['save-history'].newValue !== false;
      }
      if (changes['llm-optimization']) {
        this.settings.llmOptimization = changes['llm-optimization'].newValue !== false;
      }
    });
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
      // Deliberately no "skip if typing in an input" guard here: every
      // shortcut below requires Ctrl+Shift, which never produces a typed
      // character. Skipping them while focused in the compose box would
      // disable "Quick Analysis" in the one place it's most useful — while
      // actually writing the prompt.
      if (!event.ctrlKey || !event.shiftKey) {
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
    this.injectSharedStyles();
    const notification = document.createElement('div');
    notification.className = 'pt-toast';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--pt-accent);
      color: white;
      padding: 12px 20px;
      border-radius: var(--pt-radius-md);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 1000000;
      box-shadow: var(--pt-shadow);
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
    chrome.runtime.sendMessage({ action: 'openDashboard' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        this.showShortcutNotification('📊 Click the Prompt Tracer icon in your toolbar to see your dashboard');
      }
    });
  }

  showKeyboardShortcutsHelp() {
    this.injectSharedStyles();
    const helpModal = document.createElement('div');
    helpModal.className = 'pt-modal-overlay';
    helpModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--pt-bg);
      color: var(--pt-text-primary);
      border-radius: var(--pt-radius-lg);
      padding: 32px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: var(--pt-shadow);
      position: relative;
    `;

    const shortcutRow = (title, description, keys) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--pt-bg-subtle); border-radius: var(--pt-radius-md); margin-bottom: 8px;">
        <div>
          <div style="font-weight: 600; color: var(--pt-text-primary);">${title}</div>
          <div style="font-size: 14px; color: var(--pt-text-secondary);">${description}</div>
        </div>
        <kbd style="background: var(--pt-bg-muted); border: 1px solid var(--pt-border); color: var(--pt-text-primary); padding: 4px 8px; border-radius: var(--pt-radius-sm); font-family: monospace;">${keys}</kbd>
      </div>
    `;

    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="margin: 0; color: var(--pt-text-primary); font-size: 22px; font-weight: 700;">Keyboard shortcuts</h2>
        <button id="pt-close-shortcuts-help" class="pt-icon-btn" style="background: transparent; color: var(--pt-text-secondary); width: 28px; height: 28px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div>
        ${shortcutRow('Quick analysis', 'Analyze current prompt', 'Ctrl+Shift+P')}
        ${shortcutRow('Copy optimized', 'Copy last optimized prompt', 'Ctrl+Shift+O')}
        ${shortcutRow('Open dashboard', 'View analytics and settings', 'Ctrl+Shift+D')}
        ${shortcutRow('Show help', 'Display this shortcuts guide', 'Ctrl+Shift+H')}
      </div>

      <div style="margin-top: 24px; padding: 16px; background: var(--pt-accent-subtle); border-radius: var(--pt-radius-md);">
        <div style="font-size: 14px; color: var(--pt-text-secondary); text-align: center;">
          <strong style="color: var(--pt-text-primary);">Pro tip:</strong> these shortcuts work on any AI platform where Prompt Tracer is active
        </div>
      </div>
    `;
    modal.querySelector('#pt-close-shortcuts-help').addEventListener('click', () => helpModal.remove());

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
      if (element) {
        const value = element.value || element.textContent || '';
        if (value.trim()) {
          this.capturePrompt(value.trim());
          break;
        }
      }
    }
  }

  captureGrokPrompt() {
    // Grok specific selectors
    const selectors = [
      'textarea[placeholder*="Message"]',
      'textarea[aria-label*="Ask"]',
      'div[contenteditable="true"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const value = element.value || element.textContent || '';
        if (value.trim()) {
          this.capturePrompt(value.trim());
          break;
        }
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
      if (element) {
        const value = element.value || element.textContent || '';
        if (value.trim()) {
          this.capturePrompt(value.trim());
          break;
        }
      }
    }
  }

  capturePrompt(promptText) {
    // Don't analyze empty or very short prompts. No time-based lockout here:
    // the debounce timer in monitorInputField already prevents automatic
    // spam, and analysisGeneration already prevents a slow async response
    // from clobbering a newer one — so a manual trigger (button, shortcut)
    // right after an automatic capture is honored immediately instead of
    // silently doing nothing for up to a second.
    if (!promptText || promptText.trim().length < 3) return;
    if (!this.settings.autoAnalysis) return;

    console.log('Prompt Tracer: Capturing prompt:', promptText.substring(0, 50) + '...');

    // Claim this analysis pass. If a newer capture starts before this one's
    // async AI call resolves, its response gets discarded instead of
    // overwriting the panel with stale text.
    this.analysisGeneration += 1;
    const generation = this.analysisGeneration;

    const promptData = new PromptData(promptText, this.platform);
    const analysis = this.optimizer.analyzePrompt(promptText);
    promptData.metrics = buildStoredMetrics(analysis);

    // Show analysis immediately with rule-based optimization (fast, always works)
    if (!analysis.quality) {
      analysis.quality = this.optimizer.determineQuality((analysis.metrics && analysis.metrics.overallScore) || 0);
    }

    // Always show rule-based optimization immediately (no waiting)
    const immediateOptimization = this.optimizer.optimizePrompt(promptText, analysis);
    promptData.setOptimizedVersion(immediateOptimization);
    if (this.settings.showPanel) {
      const panelExists = this.currentPanel && document.body.contains(this.currentPanel);
      if (panelExists) {
        // Update the existing panel in place — no remove/rebuild, no
        // slide-in replay. This is what actually stops the flicker.
        this.updateMetricsInPanel(analysis);
        const feedback = this.generateRealTimeFeedback(promptText, analysis);
        const feedbackSection = this.currentPanel.querySelector('#prompt-tracer-feedback');
        if (feedbackSection) feedbackSection.innerHTML = this.renderFeedbackItems(feedback);
        this.updateOptimizedPrompt(immediateOptimization);
      } else {
        this.showAnalysis(promptData, analysis, immediateOptimization, generation);
      }
      this.fetchAIFeedback(promptText, analysis, generation);
    }

    // Try AI optimization in background if API key exists (non-blocking)
    this.checkApiKeyStatus().then(hasApiKey => {
      if (!hasApiKey || !this.settings.llmOptimization) {
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

          this.storePromptData(promptData);

          if (generation !== this.analysisGeneration) {
            console.log('Discarding stale AI optimization — input has changed since this request started');
            return;
          }

          // Update if we got a valid AI optimization (always update if AI succeeded)
          if (optimizedPrompt && optimizedPrompt.trim()) {
            // Safety net: verify the AI's rewrite isn't weaker than it should
            // be on our own rubric, and patch any still-failing check before
            // showing it. This is what guarantees the suggested prompt never
            // scores worse than what the user typed.
            const candidateChecks = this.optimizer.runChecks(optimizedPrompt);
            const finalOptimized = this.optimizer.reinforceFailedChecks(optimizedPrompt, candidateChecks);
            console.log('Updating panel with AI optimization');
            promptData.setOptimizedVersion(finalOptimized);
            this.updateOptimizedPrompt(finalOptimized);
          } else {
            console.log('AI optimization returned empty, keeping rule-based');
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
    if (!this.settings.saveHistory) return;

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

  async showAnalysis(promptData, analysis, llmOptimizedPrompt = null, generation = this.analysisGeneration) {
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

    const metrics = analysis.metrics || {};
    const clampedScore = getOverallScoreFromMetrics(metrics);
    
    // Determine quality level based on actual score (not just analysis.quality)
    let quality = 'developing';
    if (clampedScore < 30) quality = 'basic';
    else if (clampedScore < 50) quality = 'developing';
    else if (clampedScore < 70) quality = 'good';
    else if (clampedScore < 85) quality = 'excellent';
    else quality = 'masterful';
    const qualityConfig = {
      basic: { color: '#d13c3c', label: 'Basic', icon: '🌱', min: 0, max: 30 },
      developing: { color: '#c17a10', label: 'Developing', icon: '🚀', min: 30, max: 50 },
      good: { color: '#1a9d5c', label: 'Good', icon: '✨', min: 50, max: 70 },
      excellent: { color: '#5b5bd6', label: 'Excellent', icon: '🌟', min: 70, max: 85 },
      masterful: { color: '#9333ea', label: 'Masterful', icon: '👑', min: 85, max: 100 }
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
      background: var(--pt-bg, white);
      border: none;
      border-radius: var(--pt-radius-lg, 14px);
      box-shadow: var(--pt-shadow, 0 20px 60px rgba(0,0,0,0.25));
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

    this.injectSharedStyles();

    // Generate real-time feedback - use rule-based immediately (fast, always works)
    let feedback = this.generateRealTimeFeedback(promptData.prompt, analysis);

    // AI feedback (if a key is set) is fetched once, centrally, by
    // capturePrompt() via fetchAIFeedback() — not duplicated here.
    
    panel.innerHTML = `
      <!-- Compact Header -->
      <div style="background: var(--pt-accent); padding: 16px 20px; border-radius: var(--pt-radius-lg) var(--pt-radius-lg) 0 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.18); border-radius: var(--pt-radius-sm); display: flex; align-items: center; justify-content: center;">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <div>
              <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 700;">Prompt Optimizer</h3>
              <div style="font-size: 11px; color: rgba(255,255,255,0.85); margin-top: 2px;">${hasApiKey ? 'AI-powered optimization' : 'Rule-based optimization'}</div>
            </div>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button id="settings-btn" class="pt-icon-btn" style="width: 28px; height: 28px;" title="Open Settings">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            <button id="close-analysis-panel" class="pt-icon-btn" style="width: 28px; height: 28px;" title="Close">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>

      ${this.renderCoreMetricsPanel(metrics, clampedScore, quality, config, analysis.checks)}

      <!-- Feedback Section -->
      <div id="prompt-tracer-feedback" style="padding: 16px 20px; background: var(--pt-bg); border-bottom: 1px solid var(--pt-border);">
        ${this.renderFeedbackItems(feedback)}
      </div>

      <!-- Optimized Prompt (Main Focus - Always Visible) -->
      <div style="padding: 20px; background: var(--pt-bg); flex: 1; overflow-y: auto;">
        ${llmOptimizedPrompt ? `
          <div style="margin-bottom: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 6px; color: var(--pt-text-secondary);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"></path></svg>
                <span style="font-size: 13px; font-weight: 600; color: var(--pt-text-primary);">Ready-to-use version</span>
              </div>
              <button id="copy-optimized" class="pt-btn pt-btn-primary" style="padding: 6px 12px; font-size: 11px;">Copy</button>
            </div>
            <div style="background: var(--pt-accent-subtle); border: 1px solid var(--pt-border); border-radius: var(--pt-radius-md); padding: 14px; font-size: 13px; line-height: 1.6; color: var(--pt-text-primary); position: relative; max-height: 200px; overflow-y: auto;">
              <div id="optimized-text" style="white-space: pre-wrap; word-wrap: break-word;">${llmOptimizedPrompt}</div>
            </div>
            <div style="margin-top: 10px;">
              <button id="use-optimized" class="pt-btn pt-btn-primary" style="width: 100%; padding: 12px; font-size: 14px;">
                Use this prompt
              </button>
            </div>
            ${hasApiKey ? `
              <div style="margin-top: 8px; text-align: center; font-size: 10px; color: var(--pt-text-muted);">
                AI-powered optimization
              </div>
            ` : `
              <div style="margin-top: 12px; padding: 12px; background: var(--pt-warning-subtle); border: 1px solid var(--pt-border); border-radius: var(--pt-radius-md);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pt-warning-text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                  <div style="flex: 1;">
                    <div style="font-size: 12px; font-weight: 600; color: var(--pt-warning-text); margin-bottom: 2px;">Enable AI optimization</div>
                    <div style="font-size: 10px; color: var(--pt-text-secondary);">Add your OpenAI API key for better results</div>
                  </div>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <input type="password" id="inline-api-key" placeholder="sk-proj-..." style="flex: 1; padding: 8px 10px; border: 1px solid var(--pt-border-strong); border-radius: var(--pt-radius-sm); font-size: 11px; font-family: 'Monaco', 'Courier New', monospace; background: var(--pt-bg); color: var(--pt-text-primary);" autocomplete="off">
                  <button id="save-inline-api-key" class="pt-btn pt-btn-primary" style="padding: 8px 14px; font-size: 11px; white-space: nowrap;">Save</button>
                </div>
                <div style="margin-top: 8px; font-size: 10px; color: var(--pt-text-secondary);">
                  <a href="https://platform.openai.com/api-keys" target="_blank" style="text-decoration: none; font-weight: 500;">Get your key here</a>
                </div>
              </div>
            `}
          </div>
        ` : `
          <div style="text-align: center; padding: 30px 20px; color: var(--pt-text-muted);">
            <div style="font-size: 13px; font-weight: 500; color: var(--pt-text-secondary);">Optimizing your prompt...</div>
            <div style="font-size: 11px; margin-top: 6px;">This may take a few seconds</div>
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
          chrome.runtime.sendMessage({ action: 'openSettings' }, (response) => {
            if (chrome.runtime.lastError || !response || !response.success) {
              this.showShortcutNotification('⚙️ Click the Prompt Tracer icon in your toolbar to open settings');
            }
          });
        } catch (error) {
          console.error('Error opening settings:', error);
          this.showShortcutNotification('⚠️ Please reload the extension', 'warning');
        }
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
    }

    // Add copy functionality
    const copyButton = panel.querySelector('#copy-optimized');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        const text = panel.querySelector('#optimized-text').textContent;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = copyButton.textContent;
          copyButton.textContent = '✓ Copied';
          copyButton.style.background = 'var(--pt-success)';

          setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.style.background = '';
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
            saveInlineApiKeyBtn.style.background = 'var(--pt-danger)';
    setTimeout(() => {
              saveInlineApiKeyBtn.textContent = 'Save';
              saveInlineApiKeyBtn.style.background = 'var(--pt-accent)';
            }, 3000);
            return;
          }
          
          const apiKey = inlineApiKeyInput.value.trim();
          
          if (!apiKey) {
            saveInlineApiKeyBtn.textContent = 'Enter key';
            saveInlineApiKeyBtn.style.background = 'var(--pt-danger)';
            setTimeout(() => {
              saveInlineApiKeyBtn.textContent = 'Save';
              saveInlineApiKeyBtn.style.background = 'var(--pt-accent)';
            }, 2000);
            return;
          }
          
          if (!apiKey.startsWith('sk-')) {
            saveInlineApiKeyBtn.textContent = 'Invalid';
            saveInlineApiKeyBtn.style.background = 'var(--pt-danger)';
            setTimeout(() => {
              saveInlineApiKeyBtn.textContent = 'Save';
              saveInlineApiKeyBtn.style.background = 'var(--pt-accent)';
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
                saveInlineApiKeyBtn.style.background = 'var(--pt-success)';
                
                // Reload the panel with new API key
                setTimeout(() => {
                  // Re-analyze with new API key
                  this.capturePrompt(promptData.prompt);
                }, 1000);
              } else {
                saveInlineApiKeyBtn.textContent = 'Failed';
                saveInlineApiKeyBtn.style.background = 'var(--pt-danger)';
                setTimeout(() => {
                  saveInlineApiKeyBtn.textContent = 'Save';
                  saveInlineApiKeyBtn.style.background = 'var(--pt-accent)';
                  saveInlineApiKeyBtn.disabled = false;
                  saveInlineApiKeyBtn.style.opacity = '1';
                }, 2000);
              }
            } catch (error) {
              console.error('Error testing API key:', error);
              saveInlineApiKeyBtn.textContent = 'Error';
              saveInlineApiKeyBtn.style.background = 'var(--pt-danger)';
              setTimeout(() => {
                saveInlineApiKeyBtn.textContent = 'Save';
                saveInlineApiKeyBtn.style.background = 'var(--pt-accent)';
                saveInlineApiKeyBtn.disabled = false;
                saveInlineApiKeyBtn.style.opacity = '1';
              }, 2000);
            }
          });
        } catch (error) {
          console.error('Error saving API key:', error);
          saveInlineApiKeyBtn.textContent = 'Error';
          saveInlineApiKeyBtn.style.background = 'var(--pt-danger)';
          setTimeout(() => {
            saveInlineApiKeyBtn.textContent = 'Save';
            saveInlineApiKeyBtn.style.background = 'var(--pt-accent)';
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
    
    // Add "Use This Prompt" button functionality
    const useButton = panel.querySelector('#use-optimized');
    if (useButton) {
      useButton.addEventListener('click', () => {
        const text = panel.querySelector('#optimized-text').textContent;
        
        // Try to find and fill the input field
        const selectors = {
          gpt: ['div[contenteditable="true"]', 'textarea[data-id="root"]', 'textarea[placeholder*="Message"]'],
          claude: ['div[contenteditable="true"]', 'textarea[placeholder*="Message"]'],
          grok: ['textarea[placeholder*="Message"]', 'textarea[aria-label*="Ask"]', 'div[contenteditable="true"]', 'textarea'],
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
          useButton.textContent = '✓ Prompt inserted!';
          useButton.style.background = 'var(--pt-success)';
          setTimeout(() => {
            panel.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => panel.remove(), 300);
          }, 1000);
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(text).then(() => {
            useButton.textContent = '✓ Copied to clipboard!';
            useButton.style.background = 'var(--pt-success)';
            setTimeout(() => {
              panel.style.animation = 'slideIn 0.3s ease-out reverse';
              setTimeout(() => panel.remove(), 300);
            }, 1000);
          });
        }
      });
    }

    // Store panel reference for real-time updates
    this.currentPanel = panel;
    this.currentAnalysis = analysis;
    this.currentOptimizedPrompt = llmOptimizedPrompt;
  }

  renderCoreMetricsPanel(metrics, overallScore, quality, qualityConfig, checks) {
    const config = qualityConfig || { color: 'var(--pt-accent)', icon: '✨', label: 'Analyzing' };
    const checkIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--pt-success)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const emptyIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--pt-border-strong)" stroke-width="2"><circle cx="12" cy="12" r="9"></circle></svg>`;
    const checklist = (checks || []).map(({ ok, label }) => `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: ${ok ? 'var(--pt-text-primary)' : 'var(--pt-text-secondary)'};">
        <span style="flex-shrink: 0; display: flex;">${ok ? checkIcon : emptyIcon}</span>
        <span>${label}</span>
      </div>
    `).join('');

    return `
      <div id="prompt-tracer-metrics" style="padding: 14px 20px; background: var(--pt-bg); border-bottom: 1px solid var(--pt-border);">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: conic-gradient(${config.color} ${overallScore}%, var(--pt-border) 0); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--pt-bg); display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span style="font-size: 16px; font-weight: 800; color: ${config.color}; line-height: 1;">${overallScore}</span>
              <span style="font-size: 8px; color: var(--pt-text-muted); font-weight: 600;">/100</span>
            </div>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 700; color: var(--pt-text-primary); display: flex; align-items: center; gap: 6px;">
              <span>${config.icon}</span>
              <span>${config.label} quality</span>
            </div>
            <div style="font-size: 11px; color: var(--pt-text-secondary); margin-top: 4px; line-height: 1.4;">${this.getQualityDescription(quality)}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${checklist}
        </div>
      </div>
    `;
  }

  // Shared by the initial render and both live-update paths so the feedback
  // section never drifts into a different visual style depending on how it
  // was last refreshed.
  renderFeedbackItems(feedback) {
    const prioritized = (feedback || [])
      .sort((a, b) => {
        const priority = { error: 3, warning: 2, info: 1 };
        return (priority[b.type] || 0) - (priority[a.type] || 0);
      })
      .slice(0, 2);

    if (prioritized.length === 0) {
      return `
        <div style="text-align: center; padding: 12px; background: var(--pt-success-subtle); border-radius: var(--pt-radius-sm); border: 1px solid var(--pt-border);">
          <div style="font-size: 14px; font-weight: 600; color: var(--pt-success-text);">Your prompt looks great!</div>
        </div>
      `;
    }

    const borderColor = { error: 'var(--pt-danger)', warning: 'var(--pt-warning)', info: 'var(--pt-accent)' };

    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${prioritized.map(item => `
          <div style="display: flex; align-items: flex-start; gap: 10px; padding-left: 10px; border-left: 3px solid ${borderColor[item.type] || borderColor.info};">
            <span style="font-size: 15px; flex-shrink: 0;">${item.icon}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 12px; font-weight: 600; color: var(--pt-text-primary); margin-bottom: 2px;">${item.title}</div>
              <div style="font-size: 11px; color: var(--pt-text-secondary); line-height: 1.4;">${item.suggestion || item.message}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
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

  showErrorNotification(message, type = 'error', duration = 5000) {
    try {
      const colors = {
        error: 'var(--pt-danger)',
        warning: 'var(--pt-warning)',
        info: 'var(--pt-accent)',
        success: 'var(--pt-success)'
      };

      const notification = document.createElement('div');
      notification.className = 'pt-toast';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.error};
        color: white;
        padding: 12px 20px;
        border-radius: var(--pt-radius-md);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000000;
        box-shadow: var(--pt-shadow);
        max-width: 400px;
        text-align: center;
        cursor: pointer;
        transition: opacity 0.2s ease;
      `;

      notification.textContent = message;

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
    notification.className = 'pt-toast';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--pt-bg);
      color: var(--pt-text-primary);
      border: 1px solid var(--pt-border);
      padding: 16px 20px;
      border-radius: var(--pt-radius-lg);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 1000000;
      box-shadow: var(--pt-shadow);
      max-width: 350px;
      cursor: pointer;
    `;

    notification.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 6px;">Platform not supported</div>
      <div style="font-size: 13px; color: var(--pt-text-secondary); line-height: 1.4;">
        Prompt Tracer works on ChatGPT, Claude, Grok, and Gemini.
        <br><strong style="color: var(--pt-accent);">Click here</strong> to learn more about supported platforms.
      </div>
    `;

    notification.onclick = () => {
      window.open('https://github.com/Siddhanta22/prompt_tracer#supported-platforms', '_blank');
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

  injectUI() {
    // Add a floating button to manually trigger analysis
    const button = document.createElement('div');
    button.id = 'prompt-tracer-button';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 52px;
      height: 52px;
      background: var(--pt-accent, #5b5bd6);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      box-shadow: var(--pt-shadow, 0 4px 12px rgba(0,0,0,0.15));
      pointer-events: auto;
      transition: background 0.15s ease;
    `;
    button.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    button.title = 'Analyze current prompt';
    button.addEventListener('mouseenter', () => { button.style.background = 'var(--pt-accent-hover, #4747c2)'; });
    button.addEventListener('mouseleave', () => { button.style.background = 'var(--pt-accent, #5b5bd6)'; });

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
    if (!this.settings.autoAnalysis) return;

    // Platform-specific input field monitoring
    const selectors = {
      gpt: ['div[contenteditable="true"]', 'textarea[data-id="root"]', 'textarea[placeholder*="Message"]'],
      claude: ['div[contenteditable="true"]', 'textarea[placeholder*="Message"]'],
      grok: ['textarea[placeholder*="Message"]', 'textarea[aria-label*="Ask"]', 'div[contenteditable="true"]', 'textarea'],
      gemini: ['textarea[placeholder*="Message"]', 'div[contenteditable="true"]']
    };

    const platformSelectors = selectors[this.platform] || selectors.gpt;

    for (const selector of platformSelectors) {
      const element = document.querySelector(selector);
      if (!element) continue;

      const currentValue = element.value || element.textContent || '';
      const trimmedValue = currentValue.trim();

      if (trimmedValue.length === 0) {
        if (this.lastMonitoredValue) {
          this.lastMonitoredValue = '';
          clearTimeout(this.debounceTimer);
          const existingPanel = document.getElementById('prompt-tracer-panel');
          if (existingPanel) existingPanel.remove();
          this.currentPanel = null;
        }
        break;
      }

      if (trimmedValue.length >= 3 && trimmedValue !== this.lastMonitoredValue) {
        this.lastMonitoredValue = trimmedValue;
        // Debounce: wait for a pause in typing before re-analyzing, instead
        // of reacting to every keystroke. This is what was making the panel
        // feel "shaky" — it was rebuilding on almost every character typed.
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.capturePrompt(trimmedValue);
        }, 700);
      }

      break;
    }
  }

  // Derived from the exact same checks array that drives the score and the
  // checklist UI, so feedback can never disagree with what the panel shows
  // above it (that mismatch was the whole reason "all checks pass" and
  // "score is 65" used to coexist).
  generateRealTimeFeedback(promptText, analysis) {
    const feedback = [];
    const checks = (analysis && analysis.checks) || this.optimizer.runChecks(promptText);
    const lowerPrompt = promptText.toLowerCase();

    const iconById = {
      substance: '📝',
      clear_action: '🎯',
      specific_details: '📊',
      audience_or_context: '🌍',
      structure_or_format: '📋'
    };
    const titleById = {
      substance: 'Too Short',
      clear_action: 'Unclear Intent',
      specific_details: 'Too Vague',
      audience_or_context: 'Missing Context',
      structure_or_format: 'Could Be Better Organized'
    };

    checks.filter(c => !c.ok).forEach(check => {
      feedback.push({
        type: check.id === 'substance' ? 'error' : 'warning',
        icon: iconById[check.id] || '💡',
        title: titleById[check.id] || check.label,
        message: check.label,
        suggestion: check.reinforce || undefined
      });
    });

    // A prompt this short and this underspecified isn't a formatting
    // problem — no amount of "be more specific" reinforcement can guess
    // what you actually mean. Surface that distinctly, and put it first:
    // it's a more fundamental issue than anything the checklist covers.
    if (analysis && analysis.isAmbiguous) {
      feedback.unshift({
        type: 'error',
        icon: '❓',
        title: 'What\'s the Real Goal Here?',
        message: 'This is short enough that the AI would have to guess at what you actually want — reinforcement can\'t fix that, only you can.',
        suggestion: 'Add a sentence about the specific goal, scope, or use case — e.g. what this is for and who it\'s for.'
      });
    }

    // A couple of extra, cheap heuristics that don't factor into scoring but
    // are worth flagging when they show up.
    const words = promptText.split(' ').filter(w => w.length > 0);
    if (lowerPrompt.includes('tell me') && words.length < 8) {
      feedback.push({
        type: 'info',
        icon: '💬',
        title: 'Generic Request',
        message: '"Tell me" is quite generic. Be more specific about what you want to learn.',
        suggestion: 'Instead of "Tell me about X", try "Explain X in simple terms" or "What are the key aspects of X?"'
      });
    }

    if ((lowerPrompt.includes('best') || lowerPrompt.includes('good') || lowerPrompt.includes('nice')) &&
        !lowerPrompt.includes('why') && !lowerPrompt.includes('criteria') && !lowerPrompt.includes('compare')) {
      feedback.push({
        type: 'info',
        icon: '⭐',
        title: 'Subjective Terms',
        message: 'Words like "best" or "good" are subjective. The AI needs criteria to judge.',
        suggestion: 'Add what makes it "best" for you: budget, location, features, etc.'
      });
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

  updateMetricsInPanel(analysis) {
    if (!this.currentPanel || !analysis) return;

    const metrics = analysis.metrics || {};
    const clampedScore = getOverallScoreFromMetrics(metrics);
    let quality = analysis.quality || this.optimizer.determineQuality(clampedScore);
    const qualityConfig = {
      basic: { color: '#d13c3c', label: 'Basic', icon: '🌱' },
      developing: { color: '#c17a10', label: 'Developing', icon: '🚀' },
      good: { color: '#1a9d5c', label: 'Good', icon: '✨' },
      excellent: { color: '#5b5bd6', label: 'Excellent', icon: '🌟' },
      masterful: { color: '#9333ea', label: 'Masterful', icon: '👑' }
    };
    const config = qualityConfig[quality] || qualityConfig.developing;
    const metricsSection = this.currentPanel.querySelector('#prompt-tracer-metrics');
    if (metricsSection) {
      metricsSection.outerHTML = this.renderCoreMetricsPanel(metrics, clampedScore, quality, config, analysis.checks).trim();
    }
  }

  updateFeedbackInPanel(feedback) {
    if (!this.currentPanel || !feedback || feedback.length === 0) return;

    const feedbackSection = this.currentPanel.querySelector('#prompt-tracer-feedback');
    if (!feedbackSection) return;

    feedbackSection.innerHTML = this.renderFeedbackItems(feedback);
  }

  // Single, centralized AI-feedback fetch — called once per capturePrompt()
  // pass, whether that pass built a new panel or updated an existing one.
  fetchAIFeedback(promptText, analysis, generation) {
    this.checkApiKeyStatus().then(hasApiKey => {
      if (!hasApiKey || !chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        return;
      }

      const aiFeedbackPromise = chrome.runtime.sendMessage({
        action: 'generateFeedback',
        prompt: promptText,
        analysis: analysis
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      Promise.race([aiFeedbackPromise, timeoutPromise])
        .then(aiFeedbackResponse => {
          if (generation !== this.analysisGeneration) {
            console.log('Discarding stale AI feedback — input has changed since this request started');
            return;
          }
          if (aiFeedbackResponse && aiFeedbackResponse.feedback && aiFeedbackResponse.feedback.length > 0) {
            this.updateFeedbackInPanel(aiFeedbackResponse.feedback);
          }
        })
        .catch(error => {
          console.log('AI feedback timeout/failed, keeping rule-based:', error.message);
        });
    }).catch(error => {
      console.log('Error checking API key status for feedback, keeping rule-based:', error);
    });
  }

  updateOptimizedPrompt(optimizedPrompt) {
    if (!this.currentPanel || !optimizedPrompt) {
      console.log('Cannot update optimized prompt - no panel or no prompt');
      return;
    }

    const optimizedTextElement = this.currentPanel.querySelector('#optimized-text');
    if (optimizedTextElement) {
      optimizedTextElement.textContent = optimizedPrompt;
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
      }

      // No usable AI result — return null and let the caller keep showing
      // the rule-based version that's already on screen. There is
      // deliberately no local template fallback here: a fixed "if the
      // prompt mentions X, wrap it in this canned paragraph" generator is
      // exactly the hardcoded behavior this tool should never produce.
      console.log('No AI optimization available, keeping rule-based version');
      return null;
    } catch (error) {
      console.log('LLM optimization unavailable, keeping rule-based version:', error.message);
      return null;
    }
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