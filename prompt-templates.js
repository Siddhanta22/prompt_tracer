/**
 * Advanced Prompt Templates and Categorization System
 * Provides context-aware prompt templates for different use cases
 */

class PromptTemplateManager {
  constructor() {
    this.templates = this.initializeTemplates();
    this.categories = this.initializeCategories();
  }

  initializeCategories() {
    return {
      creative: {
        name: 'Creative Writing',
        icon: '🎨',
        description: 'Stories, poems, scripts, and creative content',
        color: '#e91e63'
      },
      business: {
        name: 'Business & Professional',
        icon: '💼',
        description: 'Emails, presentations, reports, and business content',
        color: '#2196f3'
      },
      technical: {
        name: 'Technical & Code',
        icon: '💻',
        description: 'Programming, debugging, technical explanations',
        color: '#4caf50'
      },
      academic: {
        name: 'Academic & Research',
        icon: '📚',
        description: 'Essays, research, analysis, and educational content',
        color: '#9c27b0'
      },
      personal: {
        name: 'Personal & Life',
        icon: '🏠',
        description: 'Personal advice, life planning, and self-improvement',
        color: '#ff9800'
      },
      marketing: {
        name: 'Marketing & Sales',
        icon: '📢',
        description: 'Copywriting, ads, social media, and promotional content',
        color: '#f44336'
      },
      analysis: {
        name: 'Analysis & Research',
        icon: '🔍',
        description: 'Data analysis, market research, and investigative content',
        color: '#00bcd4'
      },
      communication: {
        name: 'Communication',
        icon: '💬',
        description: 'Conversations, negotiations, and interpersonal skills',
        color: '#795548'
      }
    };
  }

  initializeTemplates() {
    return {
      creative: [
        {
          name: 'Short Story',
          template: 'Write a compelling short story about [topic/subject] that includes:\n- Well-developed characters with distinct personalities\n- A clear beginning, middle, and end\n- Descriptive language that creates vivid imagery\n- An engaging plot with conflict and resolution\n- A theme that resonates with readers\n\nLength: [word count] words\nGenre: [genre]\nTarget audience: [audience]',
          variables: ['topic/subject', 'word count', 'genre', 'audience'],
          example: 'Write a compelling short story about a time traveler that includes...'
        },
        {
          name: 'Poem',
          template: 'Create a [poem type] poem about [theme/topic] that:\n- Uses vivid imagery and sensory details\n- Has a consistent rhythm and flow\n- Incorporates literary devices like metaphor, simile, or alliteration\n- Evokes strong emotions\n- Has [number] stanzas of [lines per stanza] lines each\n\nStyle: [poetic style]\nMood: [emotional tone]',
          variables: ['poem type', 'theme/topic', 'number', 'lines per stanza', 'poetic style', 'emotional tone'],
          example: 'Create a sonnet about lost love that...'
        },
        {
          name: 'Character Development',
          template: 'Develop a detailed character profile for [character name] including:\n- Physical appearance and mannerisms\n- Personality traits and motivations\n- Background history and experiences\n- Relationships with other characters\n- Character arc and development\n- Unique quirks and flaws\n\nCharacter role: [protagonist/antagonist/supporting]\nStory setting: [time period/location]',
          variables: ['character name', 'protagonist/antagonist/supporting', 'time period/location'],
          example: 'Develop a detailed character profile for a detective...'
        }
      ],
      business: [
        {
          name: 'Professional Email',
          template: 'Write a professional email to [recipient] about [subject] that:\n- Has a clear and compelling subject line\n- Opens with appropriate greeting and context\n- Clearly states the purpose and main points\n- Includes specific details and next steps\n- Maintains professional yet friendly tone\n- Ends with clear call-to-action\n\nPurpose: [email purpose]\nUrgency: [high/medium/low]\nRelationship: [professional relationship]',
          variables: ['recipient', 'subject', 'email purpose', 'high/medium/low', 'professional relationship'],
          example: 'Write a professional email to a client about project updates...'
        },
        {
          name: 'Business Proposal',
          template: 'Create a comprehensive business proposal for [project/idea] that includes:\n- Executive summary highlighting key benefits\n- Problem statement and proposed solution\n- Detailed implementation plan with timeline\n- Budget breakdown and cost justification\n- Risk assessment and mitigation strategies\n- Expected outcomes and success metrics\n\nTarget audience: [decision makers]\nBudget range: [amount]\nTimeline: [duration]',
          variables: ['project/idea', 'decision makers', 'amount', 'duration'],
          example: 'Create a comprehensive business proposal for a digital transformation project...'
        },
        {
          name: 'Meeting Agenda',
          template: 'Create a structured meeting agenda for [meeting purpose] including:\n- Clear meeting objectives and desired outcomes\n- Detailed agenda items with time allocations\n- Required participants and their roles\n- Preparation materials and pre-reading\n- Discussion topics and decision points\n- Follow-up actions and next steps\n\nMeeting type: [meeting type]\nDuration: [time]\nParticipants: [number] people',
          variables: ['meeting purpose', 'meeting type', 'time', 'number'],
          example: 'Create a structured meeting agenda for a quarterly review...'
        }
      ],
      technical: [
        {
          name: 'Code Explanation',
          template: 'Explain the following code/concept in detail:\n\n[code/concept]\n\nProvide:\n- Clear explanation of what it does\n- Step-by-step breakdown of how it works\n- Key concepts and programming principles involved\n- Potential use cases and applications\n- Common pitfalls or considerations\n- Best practices and improvements\n\nTarget audience: [beginner/intermediate/advanced]\nLanguage: [programming language]',
          variables: ['code/concept', 'beginner/intermediate/advanced', 'programming language'],
          example: 'Explain the following sorting algorithm in detail...'
        },
        {
          name: 'Bug Fix Request',
          template: 'Help debug the following issue:\n\nProblem: [description of the problem]\nCode: [relevant code snippet]\nError message: [error details]\nExpected behavior: [what should happen]\nActual behavior: [what actually happens]\n\nPlease provide:\n- Root cause analysis\n- Step-by-step debugging approach\n- Corrected code with explanations\n- Prevention strategies for similar issues\n\nEnvironment: [programming environment]\nLanguage: [programming language]',
          variables: ['description of the problem', 'relevant code snippet', 'error details', 'what should happen', 'what actually happens', 'programming environment', 'programming language'],
          example: 'Help debug the following memory leak issue...'
        },
        {
          name: 'System Architecture',
          template: 'Design a system architecture for [system description] that includes:\n- High-level system overview and components\n- Data flow and interaction patterns\n- Technology stack recommendations\n- Scalability and performance considerations\n- Security and compliance requirements\n- Deployment and monitoring strategies\n\nScale: [small/medium/large]\nRequirements: [specific requirements]\nConstraints: [technical constraints]',
          variables: ['system description', 'small/medium/large', 'specific requirements', 'technical constraints'],
          example: 'Design a system architecture for a real-time chat application...'
        }
      ],
      academic: [
        {
          name: 'Research Paper',
          template: 'Write a comprehensive research paper on [research topic] that includes:\n- Abstract summarizing key findings\n- Introduction with clear thesis statement\n- Literature review of relevant research\n- Methodology and research approach\n- Analysis of findings with supporting evidence\n- Discussion of implications and limitations\n- Conclusion with recommendations for future research\n\nLength: [word count] words\nAcademic level: [undergraduate/graduate/professional]\nCitation style: [APA/MLA/Chicago]',
          variables: ['research topic', 'word count', 'undergraduate/graduate/professional', 'APA/MLA/Chicago'],
          example: 'Write a comprehensive research paper on climate change impacts...'
        },
        {
          name: 'Critical Analysis',
          template: 'Provide a critical analysis of [subject/text/idea] that examines:\n- Main arguments and key points\n- Strengths and weaknesses of the approach\n- Supporting evidence and credibility\n- Alternative perspectives and counterarguments\n- Implications and broader significance\n- Personal evaluation and conclusion\n\nAnalysis framework: [theoretical framework]\nPerspective: [academic perspective]\nDepth: [brief/comprehensive]',
          variables: ['subject/text/idea', 'theoretical framework', 'academic perspective', 'brief/comprehensive'],
          example: 'Provide a critical analysis of the latest economic policy...'
        },
        {
          name: 'Study Guide',
          template: 'Create a comprehensive study guide for [subject/topic] including:\n- Key concepts and definitions\n- Important theories and frameworks\n- Practice questions with detailed answers\n- Study tips and memorization techniques\n- Common exam topics and formats\n- Additional resources and references\n\nLevel: [academic level]\nExam type: [exam format]\nStudy time: [available time]',
          variables: ['subject/topic', 'academic level', 'exam format', 'available time'],
          example: 'Create a comprehensive study guide for organic chemistry...'
        }
      ],
      personal: [
        {
          name: 'Goal Setting',
          template: 'Help me create a comprehensive plan to achieve [specific goal] including:\n- Clear definition and success criteria\n- Breakdown into smaller, manageable steps\n- Timeline with milestones and deadlines\n- Required resources and support systems\n- Potential obstacles and mitigation strategies\n- Progress tracking methods and accountability\n\nGoal type: [personal/professional/health/financial]\nTimeline: [short-term/long-term]\nPriority: [high/medium/low]',
          variables: ['specific goal', 'personal/professional/health/financial', 'short-term/long-term', 'high/medium/low'],
          example: 'Help me create a comprehensive plan to achieve fitness goals...'
        },
        {
          name: 'Decision Making',
          template: 'Help me make a decision about [decision topic] by providing:\n- Analysis of available options and alternatives\n- Pros and cons for each option\n- Risk assessment and potential outcomes\n- Factors to consider and prioritize\n- Decision-making framework or criteria\n- Recommendations based on my situation\n\nDecision type: [personal/professional/financial]\nUrgency: [immediate/flexible]\nImpact: [low/medium/high]',
          variables: ['decision topic', 'personal/professional/financial', 'immediate/flexible', 'low/medium/high'],
          example: 'Help me make a decision about changing careers...'
        },
        {
          name: 'Problem Solving',
          template: 'Help me solve this problem: [problem description]\n\nPlease provide:\n- Root cause analysis and contributing factors\n- Multiple solution approaches and alternatives\n- Step-by-step implementation plan\n- Required resources and timeline\n- Success metrics and evaluation criteria\n- Prevention strategies for similar issues\n\nProblem type: [personal/professional/technical]\nComplexity: [simple/moderate/complex]\nUrgency: [immediate/flexible]',
          variables: ['problem description', 'personal/professional/technical', 'simple/moderate/complex', 'immediate/flexible'],
          example: 'Help me solve this problem with time management...'
        }
      ],
      marketing: [
        {
          name: 'Social Media Post',
          template: 'Create engaging social media content for [platform] that:\n- Captures attention with compelling hook\n- Delivers clear value proposition\n- Includes relevant hashtags and mentions\n- Encourages engagement and interaction\n- Aligns with brand voice and tone\n- Includes clear call-to-action\n\nPlatform: [social media platform]\nContent type: [post type]\nTarget audience: [demographics]\nCampaign goal: [objective]',
          variables: ['platform', 'social media platform', 'post type', 'demographics', 'objective'],
          example: 'Create engaging social media content for LinkedIn that...'
        },
        {
          name: 'Sales Copy',
          template: 'Write compelling sales copy for [product/service] that:\n- Opens with attention-grabbing headline\n- Identifies target audience pain points\n- Presents unique value proposition\n- Provides social proof and testimonials\n- Addresses common objections\n- Creates urgency and includes clear CTA\n\nProduct type: [product category]\nPrice point: [price range]\nTarget market: [market segment]\nSales channel: [distribution method]',
          variables: ['product/service', 'product category', 'price range', 'market segment', 'distribution method'],
          example: 'Write compelling sales copy for a productivity app that...'
        },
        {
          name: 'Email Campaign',
          template: 'Design an email marketing campaign for [campaign purpose] including:\n- Compelling subject line that drives opens\n- Personalized greeting and content\n- Clear value proposition and benefits\n- Engaging body content with storytelling\n- Social proof and credibility indicators\n- Strong call-to-action with urgency\n\nCampaign type: [email type]\nAudience: [target audience]\nGoal: [campaign objective]\nTimeline: [campaign duration]',
          variables: ['campaign purpose', 'email type', 'target audience', 'campaign objective', 'campaign duration'],
          example: 'Design an email marketing campaign for product launch...'
        }
      ],
      analysis: [
        {
          name: 'Data Analysis',
          template: 'Analyze the following data and provide insights:\n\n[data description or dataset]\n\nPlease include:\n- Data overview and summary statistics\n- Key trends and patterns identified\n- Statistical analysis and correlations\n- Visual representations and charts\n- Actionable insights and recommendations\n- Limitations and considerations\n\nAnalysis type: [descriptive/predictive/prescriptive]\nData source: [data origin]\nBusiness context: [relevant context]',
          variables: ['data description or dataset', 'descriptive/predictive/prescriptive', 'data origin', 'relevant context'],
          example: 'Analyze the following sales data and provide insights...'
        },
        {
          name: 'Market Research',
          template: 'Conduct market research analysis for [product/market] covering:\n- Market size and growth potential\n- Target customer segments and personas\n- Competitive landscape and positioning\n- Market trends and opportunities\n- Barriers to entry and challenges\n- Strategic recommendations and next steps\n\nMarket type: [market category]\nGeographic scope: [geographic area]\nTime frame: [analysis period]',
          variables: ['product/market', 'market category', 'geographic area', 'analysis period'],
          example: 'Conduct market research analysis for electric vehicles...'
        },
        {
          name: 'SWOT Analysis',
          template: 'Perform a comprehensive SWOT analysis for [organization/project] including:\n- Strengths: Internal advantages and capabilities\n- Weaknesses: Internal limitations and challenges\n- Opportunities: External factors that could benefit\n- Threats: External risks and competitive pressures\n- Strategic implications and recommendations\n- Action plan based on findings\n\nAnalysis scope: [organizational level]\nTime horizon: [planning period]\nIndustry context: [relevant industry]',
          variables: ['organization/project', 'organizational level', 'planning period', 'relevant industry'],
          example: 'Perform a comprehensive SWOT analysis for a startup...'
        }
      ],
      communication: [
        {
          name: 'Difficult Conversation',
          template: 'Help me prepare for a difficult conversation about [topic] with [person/group]:\n- Appropriate opening and context setting\n- Key points to address and desired outcomes\n- Potential objections and how to handle them\n- Active listening techniques and empathy\n- Conflict resolution strategies\n- Follow-up actions and next steps\n\nRelationship: [personal/professional]\nSensitivity level: [high/medium/low]\nOutcome goal: [desired result]',
          variables: ['topic', 'person/group', 'personal/professional', 'high/medium/low', 'desired result'],
          example: 'Help me prepare for a difficult conversation about performance...'
        },
        {
          name: 'Presentation',
          template: 'Create an engaging presentation about [topic] that includes:\n- Compelling opening that captures attention\n- Clear structure with logical flow\n- Key messages and supporting evidence\n- Visual elements and storytelling\n- Interactive elements and audience engagement\n- Strong conclusion with call-to-action\n\nAudience: [target audience]\nDuration: [presentation length]\nFormat: [presentation type]\nPurpose: [presentation goal]',
          variables: ['topic', 'target audience', 'presentation length', 'presentation type', 'presentation goal'],
          example: 'Create an engaging presentation about digital transformation...'
        },
        {
          name: 'Negotiation',
          template: 'Help me prepare for a negotiation about [negotiation topic] including:\n- Research on counterpart and market conditions\n- BATNA (Best Alternative to Negotiated Agreement)\n- Opening position and target outcomes\n- Concession strategy and trade-offs\n- Communication tactics and body language\n- Contingency plans and fallback options\n\nNegotiation type: [negotiation category]\nStakes: [high/medium/low]\nRelationship: [ongoing/one-time]',
          variables: ['negotiation topic', 'negotiation category', 'high/medium/low', 'ongoing/one-time'],
          example: 'Help me prepare for a negotiation about salary...'
        }
      ]
    };
  }

  // Get all categories
  getCategories() {
    return this.categories;
  }

  // Get templates for a specific category
  getTemplatesByCategory(category) {
    return this.templates[category] || [];
  }

  // Get a specific template by category and name
  getTemplate(category, templateName) {
    const categoryTemplates = this.templates[category];
    if (!categoryTemplates) return null;
    
    return categoryTemplates.find(template => 
      template.name.toLowerCase() === templateName.toLowerCase()
    );
  }

  // Generate a prompt from a template
  generatePrompt(template, variables = {}) {
    let prompt = template.template;
    
    // Replace variables with provided values
    template.variables.forEach(variable => {
      const value = variables[variable] || `[${variable}]`;
      prompt = prompt.replace(new RegExp(`\\[${variable}\\]`, 'g'), value);
    });
    
    return prompt;
  }

  // Suggest templates based on prompt content
  suggestTemplates(promptText) {
    const suggestions = [];
    const lowerPrompt = promptText.toLowerCase();
    
    // Analyze prompt content and suggest relevant templates
    Object.entries(this.templates).forEach(([category, templates]) => {
      templates.forEach(template => {
        const relevance = this.calculateRelevance(lowerPrompt, template);
        if (relevance > 0.3) {
          suggestions.push({
            ...template,
            category,
            relevance,
            categoryInfo: this.categories[category]
          });
        }
      });
    });
    
    // Sort by relevance
    return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  }

  // Calculate relevance between prompt and template
  calculateRelevance(promptText, template) {
    const templateKeywords = this.extractKeywords(template.template + ' ' + template.name);
    const promptKeywords = this.extractKeywords(promptText);
    
    let matches = 0;
    templateKeywords.forEach(keyword => {
      if (promptKeywords.includes(keyword)) {
        matches++;
      }
    });
    
    return matches / Math.max(templateKeywords.length, 1);
  }

  // Extract keywords from text
  extractKeywords(text) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10);
  }

  // Get template examples for quick start
  getQuickStartExamples() {
    return [
      {
        category: 'creative',
        template: this.getTemplate('creative', 'Short Story'),
        example: 'Write a compelling short story about a detective solving a mystery in a small town...'
      },
      {
        category: 'business',
        template: this.getTemplate('business', 'Professional Email'),
        example: 'Write a professional email to a client about project updates and next steps...'
      },
      {
        category: 'technical',
        template: this.getTemplate('technical', 'Code Explanation'),
        example: 'Explain how this sorting algorithm works and provide optimization suggestions...'
      },
      {
        category: 'academic',
        template: this.getTemplate('academic', 'Research Paper'),
        example: 'Write a research paper analyzing the impact of social media on mental health...'
      },
      {
        category: 'personal',
        template: this.getTemplate('personal', 'Goal Setting'),
        example: 'Help me create a plan to learn a new language in 6 months...'
      },
      {
        category: 'marketing',
        template: this.getTemplate('marketing', 'Social Media Post'),
        example: 'Create engaging Instagram content for a fitness brand targeting millennials...'
      }
    ];
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptTemplateManager;
} else {
  window.PromptTemplateManager = PromptTemplateManager;
}
