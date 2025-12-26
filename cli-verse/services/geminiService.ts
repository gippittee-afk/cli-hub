
import { GoogleGenAI, Type } from "@google/genai";
import { Agent } from '../types';
import { AgentSeed, enrichAgent } from './agentEnrichment';

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an agent using the high-quality reasoning model.
 */
export const analyzeAgent = async (agent: Agent): Promise<string> => {
  try {
    // Complex reasoning task: use gemini-3-pro-preview
    const modelId = 'gemini-3-pro-preview';
    const prompt = `
      You are an expert Senior Software Engineer and AI Researcher.
      Analyze the following CLI AI Agent: "${agent.name}".
      Description: ${agent.longDescription}
      
      Provide a concise but technical analysis covering:
      1. Best Use Case (When should a dev use this?)
      2. Potential Limitations
      3. "Cool Factor" - what makes it unique?
      
      Keep it under 200 words. Format with Markdown.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    // response.text is a property, not a method
    return response.text || "Analysis unavailable.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "Unable to contact the AI Core for analysis. Please check your network connection.";
  }
};

/**
 * Compares two agents using the high-quality reasoning model.
 */
export const compareAgents = async (agentA: Agent, agentB: Agent): Promise<string> => {
  try {
    // Complex reasoning task: use gemini-3-pro-preview
    const modelId = 'gemini-3-pro-preview';
    const prompt = `
      Compare these two AI agents: ${agentA.name} vs ${agentB.name}.
      
      Agent A: ${agentA.description}
      Agent B: ${agentB.description}
      
      Create a comparison table in Markdown followed by a final verdict on which one is better for specific scenarios.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Comparison unavailable.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "Comparison module offline.";
  }
};

/**
 * Simulates collaboration between agents using the high-quality reasoning model.
 */
export const simulateCollaboration = async (agents: Agent[], task: string): Promise<string> => {
  try {
    // Complex reasoning task: use gemini-3-pro-preview
    const modelId = 'gemini-3-pro-preview';
    const agentDescriptions = agents.map(a => `${a.name} (${a.category}): ${a.description}`).join('\n');
    
    const prompt = `
      Simulate a technical collaboration between the following AI agents:
      ${agentDescriptions}

      The user's mission objective is: "${task}"

      Generate a script-like conversation where:
      1. Each agent introduces their role in solving this specific task.
      2. They discuss the approach, handing off tasks to each other based on their strengths.
      3. They provide a final joint solution (code, architecture, or command sequence).

      Format the output as a dramatic but technical transcript (e.g., "**AgentName:** Message").
      Use Markdown for code blocks.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Simulation failed to initialize.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "Collaboration network unreachable.";
  }
};

/**
 * Generates a shell command from natural language.
 */
export const generateShellCommand = async (query: string): Promise<string> => {
  try {
    // Basic text task: use gemini-3-flash-preview
    const modelId = 'gemini-3-flash-preview';
    const prompt = `
      You are a specialized shell command generator.
      Convert the following natural language request into a precise, efficient shell command (Bash/Zsh).
      Request: "${query}"
      
      Rules:
      1. Provide ONLY the command inside a markdown code block.
      2. If multiple steps are needed, chain them logically (&&, |).
      3. Add a brief 1-sentence comment explaining what it does above the code block.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Command generation failed.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "Shell module offline.";
  }
};

/**
 * Futuristic system persona for general queries.
 */
export const askExpert = async (query: string, context?: string): Promise<string> => {
  try {
    // Basic text task: use gemini-3-flash-preview
    const modelId = 'gemini-3-flash-preview';
    const prompt = `
      You are "CLI-Verse System", a futuristic interface for AI Agents.
      User Query: "${query}"
      Context: ${context || 'None provided'}
      
      Answer helpful, concise, and in a slightly "cyberpunk/terminal" persona.
    `;
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    
    return response.text || "No data received.";
  } catch (error: any) {
      console.error("System Error:", error);
      return "System Error: Connection severed.";
  }
};

/**
 * Fetches new trending agents using the Pro model for structured JSON generation.
 */
export const fetchTrendingAgents = async (existingNames: string[]): Promise<Agent[]> => {
  try {
    // Complex structured output task: use gemini-3-pro-preview
    const modelId = 'gemini-3-pro-preview';
    const prompt = `
      You are the curator of the "CLI-Verse", a live registry of AI terminal tools.
      
      Generate 2 NEW, unique, and realistic AI CLI agents that are NOT in this list: ${existingNames.slice(0, 25).join(', ')}.
      They should be cutting-edge tools (e.g., Rust-based, WebAssembly, specialized autonomous agents, or new frameworks).
      
      Return a JSON ARRAY of objects matching the required schema.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              longDescription: { type: Type.STRING },
              category: { type: Type.STRING },
              stars: { type: Type.INTEGER },
              language: { type: Type.STRING },
              installCommand: { type: Type.STRING },
              repoUrl: { type: Type.STRING },
              features: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              useCases: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['id', 'name', 'description', 'longDescription', 'category', 'stars', 'language', 'installCommand', 'repoUrl', 'features', 'tags', 'useCases'],
          },
        },
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const agents = JSON.parse(text) as AgentSeed[];
    return agents.map(agent => enrichAgent(agent));
  } catch (error: any) {
    console.error("Auto-update failed:", error);
    return [];
  }
};
