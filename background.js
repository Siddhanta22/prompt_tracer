/**
 * Background service worker for Prompt Tracer extension
 */

// Background script for Prompt Tracer extension

// Initialize storage with default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    promptHistory: []
  });
});

// Note: chrome.action.openPopup() can silently do nothing (no popup opens)
// without throwing — most commonly when called from a background handler
// relaying a content-script click, which doesn't always carry the genuine
// user-activation context the API requires. There's no MV3-service-worker
// API to verify a popup view actually opened (chrome.extension.getViews
// isn't available here), so "didn't throw" is the best signal available.
// content.js's caller already has an honest fallback toast for the case
// where this reports failure.
function openPopup(sendResponse, extraStorage) {
  const finish = () => {
    try {
      chrome.action.openPopup();
      sendResponse({ success: true });
    } catch (error) {
      console.error('Open popup error:', error);
      sendResponse({ success: false, error: error.message });
    }
  };
  if (extraStorage) {
    chrome.storage.local.set(extraStorage, finish);
  } else {
    finish();
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'optimizePrompt':
      optimizePromptWithLLM(request.prompt, request.analysis)
        .then(sendResponse)
        .catch(error => {
          console.error('Optimize prompt error:', error);
          sendResponse({ optimized: null, method: 'error', error: error.message });
        });
      return true;
    case 'testApiKey':
      testApiKey(request.apiKey)
        .then(sendResponse)
        .catch(error => {
          console.error('Test API key error:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    case 'openSettings':
      // chrome.action.openPopup() has no way to pass which tab to show —
      // popup.html always starts on Dashboard. Leave a flag popup.js reads
      // on load and clears, so "Open Settings" actually opens Settings.
      openPopup(sendResponse, { openToTab: 'settings' });
      return true;
    case 'openDashboard':
      openPopup(sendResponse);
      return true;
    case 'generateFeedback':
      generateAIFeedback(request.prompt)
        .then(sendResponse)
        .catch(error => {
          console.error('Generate feedback error:', error);
          sendResponse({ feedback: null, method: 'error', error: error.message });
        });
      return true;
  }
});

// Real AI optimization only — no local hardcoded-template fallback here.
// If OpenAI isn't available or fails, this returns optimized: null and the
// content script keeps showing its own rule-based version (which is built
// from the same non-hardcoded, checklist-driven logic used for scoring),
// rather than substituting a fixed "if the prompt says X, wrap it in this
// canned paragraph" generator.
async function optimizePromptWithLLM(originalPrompt, analysis) {
  try {
    const result = await chrome.storage.local.get(['llm-optimization', 'openai-api-key']);
    const llmOptimization = result['llm-optimization'] !== false; // Default to true
    const apiKey = result['openai-api-key'];

    if (!llmOptimization) {
      return { optimized: null, method: 'disabled' };
    }

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return { optimized: null, method: 'no-api-key' };
    }

    try {
      const optimizationPrompt = createOptimizationPrompt(originalPrompt, analysis);
      const optimizedPrompt = await callOpenAI(optimizationPrompt, apiKey);
      return { optimized: optimizedPrompt, method: 'openai-premium', original: originalPrompt };
    } catch (error) {
      console.log('OpenAI optimization failed:', error.message);
      return { optimized: null, method: 'openai-failed', error: error.message };
    }
  } catch (error) {
    console.error('Optimization failed:', error);
    return { optimized: null, method: 'error', error: error.message };
  }
}

// Create optimization prompt for LLM
function createOptimizationPrompt(originalPrompt, analysis) {
  const metrics = analysis.metrics || {};
  const issues = analysis.issues ? analysis.issues.map(issue => `- ${issue.issue}`).join('\n') : '';
  const score = analysis.overallScore || 0;
  
  // Detect prompt intent and context
  const lowerPrompt = originalPrompt.toLowerCase();
  let contextHint = '';
  
  if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is') || lowerPrompt.includes('tell me about')) {
    contextHint = 'This is an explanation request. Create a natural, engaging explanation prompt that asks for clear information about the topic.';
  } else if (lowerPrompt.includes('trip') || lowerPrompt.includes('travel') || lowerPrompt.includes('vacation') || lowerPrompt.includes('destination')) {
    contextHint = 'This is a travel request. Create a practical, inspiring travel prompt with specific destination details, timing, and activities.';
  } else if (lowerPrompt.includes('movie') || lowerPrompt.includes('film') || lowerPrompt.includes('watch') || lowerPrompt.includes('entertainment')) {
    contextHint = 'This is an entertainment request. Create an engaging prompt for recommendations with creative suggestions and platform information.';
  } else if (lowerPrompt.includes('idea') || lowerPrompt.includes('suggest') || lowerPrompt.includes('recommend')) {
    contextHint = 'This is a recommendation request. Create a specific prompt asking for tailored suggestions based on the topic.';
  } else if (lowerPrompt.includes('how to') || lowerPrompt.includes('guide') || lowerPrompt.includes('steps')) {
    contextHint = 'This is an instructional request. Create a clear, step-by-step guide prompt with practical instructions.';
  } else if (lowerPrompt.includes('write') || lowerPrompt.includes('create') || lowerPrompt.includes('generate')) {
    contextHint = 'This is a creation request. Create a creative prompt that guides the AI to generate original content.';
  }
  
  return `You are an expert prompt engineer specializing in creating natural, context-aware prompts. Your task is to transform the user's prompt into a highly effective version that feels natural and tailored to their specific need.

ORIGINAL PROMPT:
"${originalPrompt}"

CONTEXT: ${contextHint || 'General request - analyze the intent and create an appropriate prompt.'}

CRITICAL RULES - YOU MUST FOLLOW THESE:

1. **NO GENERIC TEMPLATES**: Never use phrases like:
   - "Please provide a comprehensive and detailed response about X that includes:"
   - "1. Clear Definition 2. Practical Examples 3. Step-by-Step Guidance 4. Common Challenges 5. Best Practices 6. Resources"
   - These are hardcoded templates that don't match the actual request

2. **NATURAL LANGUAGE**: Write the optimized prompt as if a real person is asking:
   - Use conversational, natural phrasing
   - Match the tone of the original (casual, formal, technical, creative)
   - Don't add unnecessary structure unless the topic requires it

3. **TOPIC-SPECIFIC ENHANCEMENT**: 
   - For "explain X" → Ask for clear explanation with examples relevant to X
   - For "trip ideas" → Ask for specific destinations, timing, activities (NOT "common challenges")
   - For "movie recommendations" → Ask for specific titles, genres, platforms (NOT "step-by-step guidance")
   - For "project ideas" → Ask for creative, practical suggestions (NOT generic frameworks)

4. **CONTEXTUAL IMPROVEMENTS**:
   - Add specific details that make sense for the topic
   - Include relevant constraints or preferences
   - Use appropriate language (technical for tech, casual for entertainment, etc.)
   - Make it more engaging and specific WITHOUT using templates

EXAMPLES OF GOOD vs BAD:

BAD (Generic Template):
"Please provide a comprehensive and detailed response about 'Tell me about astrophysics' that includes:
1. Clear Definition
2. Practical Examples
3. Step-by-Step Guidance
4. Common Challenges
5. Best Practices
6. Resources"

GOOD (Natural, Context-Aware):
"Please explain astrophysics in an engaging way. I'm curious about: what it is and why it matters, key discoveries and theories, how it relates to space exploration, and what mysteries scientists are still trying to solve. Make it accessible for someone with basic science knowledge."

BAD (Generic Template):
"Please provide a comprehensive response about 'Give me beach trip ideas' that includes:
1. Clear Definition
2. Practical Examples..."

GOOD (Natural, Travel-Specific):
"I'm planning a beach vacation and need destination recommendations. Please suggest 5-7 beautiful beach destinations with details about: best time to visit, activities available, accommodation options, and travel tips. Include both popular spots and hidden gems."

BAD (Generic Template):
"Please provide a comprehensive response about 'Movie recommendations' that includes:
1. Clear Definition..."

GOOD (Natural, Entertainment-Specific):
"I'm looking for movie recommendations. Please suggest 5-7 films that are: engaging and well-made, available on major streaming platforms, suitable for [mood/genre preference], and include a brief reason why each one is worth watching."

YOUR TASK:
Create an optimized version of "${originalPrompt}" that:
- Feels natural and conversational
- Is specific to the actual topic (not a generic template)
- Enhances clarity and specificity in a way that makes sense for this particular request
- Uses appropriate tone and language for the domain
- Does NOT include numbered lists like "1. Clear Definition 2. Practical Examples" unless the topic genuinely requires structured output

Return ONLY the optimized prompt text, nothing else. No explanations, no meta-commentary, just the prompt itself.`;
}

// Call OpenAI API with timeout
async function callOpenAI(prompt, apiKey) {
  console.log('Calling OpenAI API with prompt:', prompt.substring(0, 100) + '...');
  
  try {
    // Use GPT-3.5-turbo for speed (faster than GPT-4)
    const model = 'gpt-3.5-turbo';
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second timeout
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert prompt engineer. Your ONLY job is to return the optimized prompt text. Do NOT include explanations, meta-commentary, or any text other than the optimized prompt itself. Return ONLY the prompt.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300, // Reduced for faster response
          temperature: 0.3,
          top_p: 0.9
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    
      console.log(`OpenAI API response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error response:`, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`OpenAI API response data:`, data);
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        let optimizedPrompt = data.choices[0].message.content.trim();
        
        // Clean up the response - remove any meta-commentary or explanations
        optimizedPrompt = optimizedPrompt
          .replace(/^(Here's|Here is|This is|The optimized prompt is|Optimized prompt:|Optimized version:)\s*/i, '')
          .replace(/^["']|["']$/g, '') // Remove surrounding quotes
          .trim();
        
        // If the response still looks like it contains explanations, try to extract just the prompt
        if (optimizedPrompt.includes('ORIGINAL PROMPT:') || optimizedPrompt.includes('Optimized:')) {
          const promptMatch = optimizedPrompt.match(/(?:Optimized|Optimized prompt|Here's the optimized prompt)[:\s]*(.+)/is);
          if (promptMatch) {
            optimizedPrompt = promptMatch[1].trim();
          }
        }
        
        console.log(`OpenAI optimized prompt:`, optimizedPrompt);
        return optimizedPrompt;
      } else {
        throw new Error('Invalid response format from OpenAI API');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - API took too long to respond');
      }
      throw error;
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

// Generate AI-powered feedback for prompts
async function generateAIFeedback(originalPrompt) {
  try {
    const result = await chrome.storage.local.get(['openai-api-key']);
    const apiKey = result['openai-api-key'];
    
    // If no API key, return null to use rule-based feedback
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return { feedback: null, method: 'rule-based' };
    }
    
    // Create feedback prompt for LLM
    const feedbackPrompt = createFeedbackPrompt(originalPrompt);
    
    // Call OpenAI API
    const models = ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];
    let lastError = null;
    
    for (const model of models) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert prompt engineer. Analyze prompts and provide specific, actionable feedback. Return ONLY a JSON array of feedback objects, no other text.'
              },
              {
                role: 'user',
                content: feedbackPrompt
              }
            ],
            max_tokens: 500,
            temperature: 0.3
          })
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            lastError = new Error(`Model ${model} not available`);
            continue;
          }
          throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          let feedbackText = data.choices[0].message.content.trim();
          
          // Clean up the response - remove markdown code blocks if present
          feedbackText = feedbackText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          // Try to extract JSON array from the response
          // Look for JSON array pattern: [...]
          const jsonMatch = feedbackText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            feedbackText = jsonMatch[0];
          }
          
          try {
            const feedback = JSON.parse(feedbackText);
            // Validate it's an array
            if (Array.isArray(feedback) && feedback.length > 0) {
              // Validate each item has required fields
              const validFeedback = feedback.filter(item => 
                item && typeof item === 'object' && 
                item.type && item.title && 
                (item.suggestion || item.message)
              );
              if (validFeedback.length > 0) {
                return { feedback: validFeedback, method: 'ai-powered' };
              }
            }
            throw new Error('Invalid feedback format');
          } catch (parseError) {
            console.error('Failed to parse AI feedback:', parseError.message);
            // Don't log the full error to avoid console spam
            return { feedback: null, method: 'rule-based' };
          }
        }
      } catch (error) {
        console.log(`Failed with model ${model}, trying next...`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // If all models failed, return null to use rule-based
    return { feedback: null, method: 'rule-based' };
  } catch (error) {
    console.error('AI feedback generation failed:', error);
    return { feedback: null, method: 'rule-based' };
  }
}

// Create feedback prompt for LLM
function createFeedbackPrompt(originalPrompt) {
  return `Analyze this prompt and provide specific, actionable feedback on how to improve it.

PROMPT:
"${originalPrompt}"

Judge the prompt yourself on clarity, specificity, structure, context, and intent — don't assume any prior scoring.

INSTRUCTIONS:
Provide 2-4 specific, actionable feedback items. Each item should:
1. Identify a specific issue or area for improvement
2. Explain why it matters
3. In "suggestion", don't just describe the fix abstractly — write it as a short example of the kind of phrase or detail the prompt is missing, quoted, so the user can see exactly what to add.

If the prompt is so short or generic that you'd have to guess at the user's actual goal (e.g. a bare topic or product name with no stated scope, like "build facebook" or "write about AI"), make your top item a genuine clarifying question specific to this exact prompt — not generic "be more specific" advice, but the actual question you'd need answered to give a good response (e.g. "Are you cloning this as a learning exercise, building one specific feature, or something else?"). Give this item "type": "error" and title it something like "Clarify Your Goal".

Focus on the most important issues that would significantly improve the prompt's effectiveness.

Return ONLY a JSON array in this exact format:
[
  {
    "type": "error|warning|info",
    "icon": "emoji",
    "title": "Short, clear title",
    "message": "Explanation of the issue",
    "suggestion": "Concrete example phrasing the user could add or use, not abstract advice"
  }
]

Types:
- "error": Critical issues that severely limit prompt effectiveness
- "warning": Important issues that reduce prompt quality
- "info": Helpful suggestions that would enhance the prompt

Be specific and contextual. Don't use generic feedback like "add more detail" — show what that detail would actually look like for this exact prompt.`;
}
