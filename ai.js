/*
  AI module for SchoolQuest.
  - Keeps AI logic separate from the rest of the application.
  - Uses async/await and fetch() for future API integration.
  - Contains placeholder responses until Gemini API integration is enabled.
*/

async function aiRequest(prompt, context = {}) {
  const cfg = window.AI_CONFIG || {};
  const payload = {
    model: cfg.defaultModel || 'gemini-pro',
    prompt,
    context,
  };

  if (cfg.useBackend) {
    return callBackendAI(payload);
  }

  return mockAIResponse(prompt, context);
}

async function callBackendAI(payload) {
  try {
    const response = await fetch(window.AI_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.output || 'AI service returned no output.';
  } catch (error) {
    console.error('AI backend request failed', error);
    throw new Error('Failed to connect to the AI service.');
  }
}

function mockAIResponse(prompt, context) {
  const normalized = prompt.toLowerCase();
  if (normalized.includes('study plan')) {
    return `Study Plan\n\n- Subjects: ${context.subjects || 'General studies'}\n- Exam Date: ${context.examDate || 'TBD'}\n- Hours per day: ${context.hoursPerDay || '2'}\n\nSuggested schedule:\n1. Review key topics in the morning.\n2. Practice problem sets in the afternoon.\n3. Reserve evenings for revision and summaries.\n\nFocus on weaker subjects first, and take short breaks every 45 minutes.`;
  }
  if (normalized.includes('quiz') || normalized.includes('multiple choice')) {
    return `Quiz Generator\n\n1. What is the process called when plants make food from sunlight?\n   a) Respiration\n   b) Photosynthesis\n   c) Digestion\n   d) Evaporation\n\n2. True/False: Electricity flows from negative to positive in a circuit.\n\n3. Fill in the blank: The largest planet in our solar system is ________.\n\n4. Short Answer: Explain why fractions are useful in everyday life.`;
  }
  if (normalized.includes('notes') || normalized.includes('summary')) {
    return `Notes Summary\n\n- Key points: focus on the main idea, definitions, and examples.\n- Important definitions: make sure each term is clear and short.\n- Revision tips: create flashcards and review daily.\n\nThis summary is intended to help you remember the most important parts quickly.`;
  }
  if (normalized.includes('hint') || normalized.includes('explain')) {
    return `Study Hint\n\nStart with the concept itself, then look at one example problem. Break the problem into smaller steps and check each step before moving on. If you're stuck, try explaining the idea in your own words first.`;
  }

  return `AI Study Assistant\n\nI can help you understand your topic, generate practice questions, and create study notes. Try asking for a study plan, quiz questions, or a short summary.`;
}

function formatAIText(rawText) {
  return rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
      if (/^\d+\./.test(line)) return `<li>${line}</li>`;
      return `<p>${line}</p>`;
    })
    .join('');
}

async function runAIQuery(prompt, context = {}) {
  const output = await aiRequest(prompt, context);
  return output;
}

window.AI = {
  runAIQuery,
  formatAIText,
};
