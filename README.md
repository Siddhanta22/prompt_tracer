# 🔍 Prompt Tracer - AI Prompt Optimizer
<img width="1253" height="663" alt="Screenshot 2025-11-24 at 5 02 41 PM" src="https://github.com/user-attachments/assets/e32b443d-e3c9-4781-b743-676fccea79a7" />
<img width="1254" height="677" alt="Screenshot 2025-11-24 at 5 04 52 PM" src="https://github.com/user-attachments/assets/81722009-c3cc-491f-b6a1-e6d82a96ad3d" />




**Transform your AI interactions with intelligent prompt analysis and optimization. Write better prompts, get better results, and master the art of prompt engineering across ChatGPT, Claude, Grok, and Gemini.**

[![Version](https://img.shields.io/badge/Version-1.0.1-blue)](https://github.com/Siddhanta22/prompt_tracer/releases)
[![Chrome Extension](https://img.shields.io/badge/Platform-Chrome%20Extension-green)](https://chrome.google.com/webstore)
[![Privacy First](https://img.shields.io/badge/Privacy-Local%20Only-brightgreen)](#privacy-first)
[![Open Source](https://img.shields.io/badge/Open%20Source-MIT-orange)](LICENSE)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🎯 **Real-time Prompt Analysis**
- **Contextual Feedback**: Get instant, actionable feedback on the top 2 most critical issues
- **AI-Powered Insights**: Optional OpenAI integration for intelligent, context-aware suggestions
- **Instant Analysis**: Feedback appears as you type, no waiting required
- **Cross-platform**: Works seamlessly on ChatGPT, Claude, Grok, and Gemini

### 🚀 **Smart Optimization**
- **Instant Rule-based**: Privacy-safe optimization that works immediately, no API key required
- **AI-Powered Enhancement**: Optional OpenAI API integration for context-aware, natural optimizations
- **Ready-to-Use**: Copy optimized prompts instantly with one click
- **Context-Aware**: Understands travel, learning, creative, and technical prompts for better suggestions

### 📊 **Advanced Analytics Dashboard**
- **Visual Charts**: Performance trends, platform usage, and score distribution
- **Achievement System**: 6 achievements with progress tracking
- **Performance Insights**: Comprehensive analytics with visual representations
- **Export Data**: Download your prompt history anytime


### ⌨️ **Power User Features**
- **Keyboard Shortcuts**: `Ctrl+Shift+P/O/D/H` for quick access
- **Help System**: Built-in keyboard shortcuts guide
- **Accessibility**: Screen reader friendly, keyboard navigation
- **User Feedback**: Toast notifications for all actions

### 🔒 **Privacy-First Design**
- **100% Local**: All processing happens on your device
- **No Data Collection**: Your prompts never leave your browser
- **Your API Keys**: You control your own costs and usage
- **Transparent**: See exactly what data is stored

## 🎨 Interactive Tutorial

New users get a guided 2-minute tutorial that covers:
- How the extension works
- Understanding real-time feedback
- Using the floating analysis panel
- Tracking progress in the dashboard
- Setting up OpenAI API key (optional)

Access the tutorial anytime from the extension popup!

## 🚀 Quick Start

### **Installation from Chrome Web Store** (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "Prompt Tracer"
3. Click "Add to Chrome"
4. Pin the extension to your toolbar

### **Development Installation**
```bash
# Clone the repository
git clone https://github.com/Siddhanta22/prompt_tracer.git 
cd prompt_tracer      

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the prompt_tracer folder
```

### **First Use**
1. **Pin the extension** to your toolbar
2. **Visit any supported AI platform** (ChatGPT, Claude, etc.)
3. **Start typing** a prompt - analysis appears automatically
4. **Copy the optimized version** for better results
5. **Use keyboard shortcuts** for power user features

## 💡 How It Works

### **Real-time Feedback**
The extension analyzes your prompt as you type and provides:
- **Top 2 Critical Issues**: Focus on what matters most
- **Actionable Suggestions**: Specific, contextual advice to improve your prompt
- **Instant Optimization**: See an improved version immediately

### **Feedback Types**
- **🔴 Error**: Critical issues that severely limit prompt effectiveness
- **🟠 Warning**: Important issues that reduce prompt quality
- **🔵 Info**: Helpful suggestions that would enhance the prompt

### **Optimization Methods**
- **Rule-based (Default)**: Fast, privacy-safe optimization using intelligent rules
- **AI-powered (Optional)**: Context-aware optimization using OpenAI API for natural, tailored suggestions

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Shift+P` | Quick Analysis | Analyze current prompt instantly |
| `Ctrl+Shift+O` | Copy Optimized | Copy last optimized prompt |
| `Ctrl+Shift+D` | Open Dashboard | View analytics and settings |
| `Ctrl+Shift+H` | Show Help | Display shortcuts guide |

*These shortcuts work on any supported AI platform when Prompt Tracer is active.*

## 🎯 Context-Aware Optimization

The extension intelligently understands different prompt types and provides tailored optimization:

- **✈️ Travel Prompts**: Destination recommendations, trip planning, travel tips
- **📚 Learning Prompts**: Explanations, tutorials, educational content
- **🎨 Creative Prompts**: Stories, ideas, creative projects
- **💼 Business Prompts**: Professional communication, analysis, reports
- **💻 Technical Prompts**: Programming, debugging, technical explanations
- **🔍 Analysis Prompts**: Research, comparisons, investigations

Each context receives specialized optimization that avoids generic templates and provides natural, relevant improvements.

## 📊 Analytics Dashboard

### **Visual Charts**
- **Performance Trends**: Track your improvement over time with interactive line charts
- **Platform Usage**: See which AI platforms you use most with colorful bar charts
- **Score Distribution**: Understand your prompt quality distribution with doughnut charts

### **Achievement System**
Unlock achievements as you improve your prompt engineering skills:

- **🎉 Getting Started**: Analyze your first prompt
- **🚀 Prompt Explorer**: Analyze 10 prompts
- **👑 Prompt Master**: Analyze 50 prompts
- **⭐ Quality Seeker**: Achieve 80% average score
- **🌐 Platform Explorer**: Use 3 different AI platforms
- **🏆 Consistency Champion**: Get 70%+ score on 10 prompts

### **Progress Tracking**
- Real-time progress bars for each achievement
- Detailed analytics with export functionality
- Performance insights and improvement suggestions

## 🛠️ Technical Architecture

### **Core Components**
```
prompt_tracer/
├── manifest.json              # Extension configuration
├── background.js              # Service worker & API handling
├── content.js                # Content script for LLM platforms
├── popup.html                # Extension popup interface
├── popup.js                  # Popup functionality
├── interactive-tutorial.js   # Interactive onboarding
├── chart.js                  # Custom analytics charting library
├── icons/                    # Extension icons (16–128px, SVG source)
├── PRIVACY_POLICY.md         # Privacy policy documentation
└── STORE_LISTING.md          # Chrome Web Store listing copy
```

### **Key Classes**
- **PromptTracer**: Main extension controller with error handling
- **PromptOptimizer**: Advanced rule-based optimization engine
- **InteractiveTutorial**: User onboarding system
- **PromptData**: Data structure for prompts and metrics
- **PromptTracerCharts**: Custom SVG-based charting library

### **Platform Support**
- ✅ **ChatGPT** (chat.openai.com)
- ✅ **Claude** (claude.ai)
- ✅ **Grok** (x.ai)
- ✅ **Gemini** (gemini.google.com)

## 🎯 Example Transformations

### **Before (Basic)**
```
"write about AI"
```

### **After (Excellent)**
```
"Write a comprehensive 500-word article about artificial intelligence for beginners. Include:
- Clear definition and explanation
- Real-world examples and applications
- Current trends and future implications
- Simple language that non-technical readers can understand

Format as a structured article with headings and bullet points."
```

## 🔧 Development

### **Adding New Platforms**
1. Update `manifest.json` with new host permissions
2. Add platform detection in `content.js`
3. Create platform-specific selectors for prompt capture
4. Test the integration

### **Extending Optimization Rules**
1. Modify `PromptOptimizer` class in `content.js`
2. Add new optimization functions
3. Update the `initializeOptimizationRules()` method
4. Test with various prompt types

### **Customizing the UI**
1. Edit `popup.html` for popup interface
2. Modify `content.js` for floating analysis panel
3. Update CSS styles for visual changes
4. Test across different platforms

## 📈 Project Goals

### **Educational Value**
- Help users understand prompt engineering principles
- Provide actionable feedback for improvement
- Track progress and celebrate achievements
- Build confidence in AI interactions

### **Privacy & Ethics**
- Zero data collection or tracking
- Local processing only
- User control over all features
- Transparent about what data is stored

### **User Experience**
- Fast and responsive interface
- Intuitive design that doesn't interfere
- Progressive disclosure of features
- Accessible to users of all skill levels

## 🤝 Contributing

We welcome contributions to make Prompt Tracer even better! Here's how you can help:

### **Ways to Contribute**
- 🐛 **Report Bugs**: Found an issue? Open a GitHub issue
- 💡 **Feature Requests**: Have an idea? We'd love to hear it
- 🔧 **Code Contributions**: Submit pull requests for improvements
- 📚 **Documentation**: Help improve our docs and guides
- 🌍 **Translations**: Help us reach more users worldwide

### **Development Setup**
1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/yourusername/prompt_tracer.git`
3. **Create a feature branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes** and test thoroughly
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### **Development Guidelines**
- Follow existing code style and patterns
- Add comments for complex logic
- Test on multiple platforms (ChatGPT, Claude, Grok, Gemini)
- Consider privacy implications (keep everything local)
- Update documentation as needed
- Ensure all new features work with keyboard shortcuts
- Test error handling scenarios

## 📚 Learning Resources

### **Prompt Engineering**
- [OpenAI's Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic's Prompt Engineering](https://www.anthropic.com/index/prompting-guide)
- [Prompt Engineering Patterns](https://www.promptingguide.ai/)

### **Browser Extensions**
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

## 🎉 Acknowledgments

- Built with modern web technologies and privacy-first principles
- Inspired by the need for better prompt engineering education
- Thanks to the open-source community for inspiration and tools
- Special thanks to AI platform developers for creating amazing tools
- Community feedback and contributions that made this project better

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **What this means:**
- ✅ **Free to use**: Personal and commercial use allowed
- ✅ **Free to modify**: Adapt the code for your needs
- ✅ **Free to distribute**: Share and redistribute freely
- ✅ **Attribution required**: Please give credit when using our code

## 🔗 Links & Resources

- **GitHub Repository**: [Siddhanta22/prompt_tracer](https://github.com/Siddhanta22/prompt_tracer)
- **Chrome Web Store**: Coming Soon!
- **Privacy Policy**: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- **Store Listing**: [STORE_LISTING.md](STORE_LISTING.md)

## 🚀 Production Ready

Prompt Tracer v1.0.1 is production-ready with:
- ✅ **Real-time Contextual Feedback** with AI-powered insights
- ✅ **Professional Analytics Dashboard** with visual charts
- ✅ **Context-Aware Optimization** for different prompt types
- ✅ **Keyboard Shortcuts** for power users
- ✅ **Achievement System** with progress tracking
- ✅ **Comprehensive Error Handling** with graceful fallbacks
- ✅ **Privacy-First Design** with full compliance
- ✅ **Production-Ready Code** with proper documentation

---

**Happy Prompt Engineering! 🚀**

*Transform your AI interactions, one prompt at a time.* 

**Ready for Chrome Web Store submission!** 🎉 
