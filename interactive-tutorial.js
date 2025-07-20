// Interactive Tutorial for Prompt Tracer
class InteractiveTutorial {
  constructor() {
    this.currentStep = 0;
    this.steps = [
      {
        title: "Welcome to Prompt Tracer! 🎉",
        content: "Let's get you started with the most powerful prompt engineering tool. This tutorial will take about 2 minutes.",
        action: "next",
        position: "center"
      },
      {
        title: "🎯 How It Works",
        content: "Prompt Tracer analyzes your prompts in real-time and provides instant feedback. Just start typing on any AI platform!",
        action: "next",
        position: "center"
      },
      {
        title: "📊 Understanding Your Metrics",
        content: "We use 6 key metrics to evaluate your prompts: Clarity, Specificity, Structure, Context, Intent, and Completeness.",
        action: "next",
        position: "center"
      },
      {
        title: "🚀 Quality Levels",
        content: "Your prompts are rated from Basic to Masterful. Each level comes with specific improvement suggestions.",
        action: "next",
        position: "center"
      },
      {
        title: "💡 Let's Try It!",
        content: "Go to ChatGPT and type: 'write about AI'. Then watch the magic happen!",
        action: "demo",
        position: "center"
      },
      {
        title: "⚡ Quick Actions",
        content: "Use the floating panel to copy optimized prompts, view detailed metrics, and get improvement tips.",
        action: "next",
        position: "center"
      },
      {
        title: "📈 Track Your Progress",
        content: "Click the extension icon to see your analytics dashboard and track your improvement over time.",
        action: "next",
        position: "center"
      },
      {
        title: "🔧 Customize Settings",
        content: "Adjust auto-analysis, panel display, and data storage preferences in the settings tab.",
        action: "next",
        position: "center"
      },
      {
        title: "🎯 Pro Tips",
        content: "• Start with the optimized version\n• Learn from the insights\n• Practice regularly\n• Track your progress",
        action: "next",
        position: "center"
      },
      {
        title: "🎉 You're Ready!",
        content: "You now know how to use Prompt Tracer effectively. Start writing better prompts today!",
        action: "finish",
        position: "center"
      }
    ];
    
    this.tutorialElement = null;
    this.isActive = false;
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentStep = 0;
    this.createTutorialUI();
    this.showStep(0);
    
    // Store tutorial completion
    chrome.storage.local.set({ 'tutorialCompleted': true });
  }

  createTutorialUI() {
    // Remove existing tutorial if any
    const existing = document.getElementById('prompt-tracer-tutorial');
    if (existing) existing.remove();

    this.tutorialElement = document.createElement('div');
    this.tutorialElement.id = 'prompt-tracer-tutorial';
    this.tutorialElement.style.cssText = `
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

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;
    `;

    const title = document.createElement('h2');
    title.id = 'tutorial-title';
    title.style.cssText = `
      margin: 0;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = '#f0f0f0';
    closeBtn.onmouseout = () => closeBtn.style.background = 'transparent';
    closeBtn.onclick = () => this.close();

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Content
    const content = document.createElement('div');
    content.id = 'tutorial-content';
    content.style.cssText = `
      margin-bottom: 24px;
      line-height: 1.6;
      color: #555;
      font-size: 16px;
    `;

    // Progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      margin-bottom: 24px;
    `;

    const progressBar = document.createElement('div');
    progressBar.id = 'tutorial-progress';
    progressBar.style.cssText = `
      width: 100%;
      height: 6px;
      background: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
    `;

    const progressFill = document.createElement('div');
    progressFill.id = 'tutorial-progress-fill';
    progressFill.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 3px;
      transition: width 0.3s ease;
      width: 0%;
    `;

    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);

    // Navigation
    const navigation = document.createElement('div');
    navigation.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const backBtn = document.createElement('button');
    backBtn.id = 'tutorial-back';
    backBtn.textContent = '← Back';
    backBtn.style.cssText = `
      background: #f0f0f0;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      transition: all 0.2s;
    `;
    backBtn.onmouseover = () => backBtn.style.background = '#e0e0e0';
    backBtn.onmouseout = () => backBtn.style.background = '#f0f0f0';
    backBtn.onclick = () => this.previousStep();

    const nextBtn = document.createElement('button');
    nextBtn.id = 'tutorial-next';
    nextBtn.textContent = 'Next →';
    nextBtn.style.cssText = `
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      color: white;
      font-weight: 500;
      transition: all 0.2s;
    `;
    nextBtn.onmouseover = () => nextBtn.style.transform = 'translateY(-1px)';
    nextBtn.onmouseout = () => nextBtn.style.transform = 'translateY(0)';
    nextBtn.onclick = () => this.nextStep();

    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Skip Tutorial';
    skipBtn.style.cssText = `
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 14px;
      text-decoration: underline;
    `;
    skipBtn.onclick = () => this.close();

    navigation.appendChild(backBtn);
    navigation.appendChild(skipBtn);
    navigation.appendChild(nextBtn);

    modal.appendChild(header);
    modal.appendChild(progressContainer);
    modal.appendChild(content);
    modal.appendChild(navigation);

    this.tutorialElement.appendChild(modal);
    document.body.appendChild(this.tutorialElement);

    // Add keyboard navigation
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  showStep(stepIndex) {
    const step = this.steps[stepIndex];
    if (!step) return;

    const title = document.getElementById('tutorial-title');
    const content = document.getElementById('tutorial-content');
    const backBtn = document.getElementById('tutorial-back');
    const nextBtn = document.getElementById('tutorial-next');
    const progressFill = document.getElementById('tutorial-progress-fill');

    title.textContent = step.title;
    content.innerHTML = step.content.replace(/\n/g, '<br>');

    // Update progress
    const progress = ((stepIndex + 1) / this.steps.length) * 100;
    progressFill.style.width = `${progress}%`;

    // Update navigation
    backBtn.style.display = stepIndex === 0 ? 'none' : 'block';
    
    if (step.action === 'finish') {
      nextBtn.textContent = 'Get Started! 🚀';
      nextBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (step.action === 'demo') {
      nextBtn.textContent = 'Try It Now!';
      nextBtn.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
    } else {
      nextBtn.textContent = 'Next →';
      nextBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    }

    this.currentStep = stepIndex;
  }

  nextStep() {
    const currentStep = this.steps[this.currentStep];
    
    if (currentStep.action === 'finish') {
      this.close();
      return;
    }
    
    if (currentStep.action === 'demo') {
      // Open ChatGPT in new tab
      window.open('https://chat.openai.com', '_blank');
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  handleKeydown(event) {
    if (!this.isActive) return;
    
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowRight' || event.key === ' ') {
      event.preventDefault();
      this.nextStep();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousStep();
    }
  }

  close() {
    if (this.tutorialElement) {
      this.tutorialElement.remove();
      this.tutorialElement = null;
    }
    this.isActive = false;
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  // Check if tutorial should be shown
  static shouldShowTutorial() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tutorialCompleted', 'firstInstall'], (result) => {
        const shouldShow = !result.tutorialCompleted && result.firstInstall;
        resolve(shouldShow);
      });
    });
  }

  // Mark as first install
  static markFirstInstall() {
    chrome.storage.local.set({ 'firstInstall': true });
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractiveTutorial;
} else {
  window.InteractiveTutorial = InteractiveTutorial;
} 