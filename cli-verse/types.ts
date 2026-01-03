
export enum AgentCategory {
  CODING = 'Coding Assistant',
  AUTONOMOUS = 'Autonomous Agent',
  TERMINAL_UTILITY = 'Terminal Utility',
  FRAMEWORK = 'Agent Framework',
  RESEARCH = 'Research/Data',
  INFRASTRUCTURE = 'Infrastructure/Cloud'
}

export type AgentStatus = 'LIVE' | 'SYNCING' | 'UPDATE_AVAILABLE' | 'OFFLINE';

export interface Review {
  id: string;
  user: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: AgentCategory;
  stars: number;
  language: string;
  installCommand: string;
  repoUrl: string;
  features: string[];
  tags: string[];
  useCases: string[];
  reviews: Review[];
  isNew?: boolean;
  status?: AgentStatus;
  lastSynced?: string;
  repoLastPushed?: string;
  repoLastUpdated?: string;
  lastSyncError?: string;
  lastSyncErrorAt?: string;
  version?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
