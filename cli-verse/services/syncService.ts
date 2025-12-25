
import { Agent, AgentStatus } from '../types';

/**
 * Deterministic Registry Sync Service
 * Simulates high-performance metadata pulling from repository headers.
 */
export const RegistrySyncService = {
  /**
   * Deterministically calculates if a tool needs an update based on its repo URL 
   * and current timestamp hash. This avoids API overhead while providing a 
   * "live" feel.
   */
  checkStatus: (agent: Agent): AgentStatus => {
    const hash = agent.repoUrl.length + agent.name.length;
    const now = Math.floor(Date.now() / (1000 * 60 * 10)); // 10-minute window hash
    
    // Deterministic logic: if the current 10min block + repo hash % 20 is 0, 
    // simulate an update available
    if ((hash + now) % 23 === 0) return 'UPDATE_AVAILABLE';
    if ((hash + now) % 50 === 0) return 'OFFLINE';
    return 'LIVE';
  },

  /**
   * Performs a simulated active pull of data
   */
  syncAgent: async (agent: Agent): Promise<{ status: AgentStatus; timestamp: string }> => {
    // Artificial delay to simulate network I/O
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    return {
      status: 'LIVE',
      timestamp: new Date().toISOString()
    };
  }
};
