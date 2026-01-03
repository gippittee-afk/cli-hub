
import { Agent, AgentStatus } from '../types';

const OFFLINE_GRACE_MS = 30 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 8000;

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

const parseGithubRepo = (repoUrl: string) => {
  try {
    const url = new URL(repoUrl);
    if (url.hostname !== 'github.com') return null;
    const [owner, repoWithSuffix] = url.pathname.replace(/^\/+/, '').split('/');
    if (!owner || !repoWithSuffix) return null;
    const repo = repoWithSuffix.replace(/\.git$/, '');
    return { owner, repo };
  } catch {
    return null;
  }
};

const toIsoString = (value?: string | null) => (value ? new Date(value).toISOString() : undefined);

const resolveStatus = (agent: Agent, repoPushedAt?: string) => {
  if (agent.status === 'SYNCING') return 'SYNCING';
  if (agent.lastSyncErrorAt) {
    const errorAge = Date.now() - new Date(agent.lastSyncErrorAt).getTime();
    if (errorAge < OFFLINE_GRACE_MS) return 'OFFLINE';
  }
  if (!repoPushedAt || !agent.lastSynced) return 'LIVE';
  const lastPush = new Date(repoPushedAt).getTime();
  const lastSync = new Date(agent.lastSynced).getTime();
  if (Number.isFinite(lastPush) && Number.isFinite(lastSync) && lastPush > lastSync) {
    return 'UPDATE_AVAILABLE';
  }
  return 'LIVE';
};

const fetchGithubMetadata = async (repoUrl: string) => {
  const repoInfo = parseGithubRepo(repoUrl);
  if (!repoInfo) return null;
  const response = await fetchWithTimeout(
    `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`,
    {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    }
  );
  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status})`);
  }
  const data = await response.json();
  return {
    stars: typeof data.stargazers_count === 'number' ? data.stargazers_count : undefined,
    updatedAt: toIsoString(data.updated_at),
    pushedAt: toIsoString(data.pushed_at)
  };
};

const fetchGenericMetadata = async (repoUrl: string) => {
  try {
    const response = await fetchWithTimeout(repoUrl, { method: 'HEAD' });
    if (response.type === 'opaque') {
      return { updatedAt: undefined, pushedAt: undefined, stars: undefined };
    }
    if (!response.ok) {
      throw new Error(`Repository unreachable (${response.status})`);
    }
    const lastModified = response.headers.get('last-modified');
    const date = response.headers.get('date');
    return {
      updatedAt: toIsoString(lastModified || date || undefined),
      pushedAt: undefined,
      stars: undefined
    };
  } catch (error) {
    const response = await fetchWithTimeout(repoUrl, { method: 'GET', mode: 'no-cors' });
    if (response.type === 'opaque') {
      return { updatedAt: undefined, pushedAt: undefined, stars: undefined };
    }
    throw error;
  }
};

export const RegistrySyncService = {
  checkStatus: (agent: Agent): AgentStatus => resolveStatus(agent, agent.repoLastPushed),

  syncAgent: async (
    agent: Agent
  ): Promise<{
    id: string;
    status: AgentStatus;
    timestamp: string;
    stars?: number;
    repoLastUpdated?: string;
    repoLastPushed?: string;
    lastSyncError?: string;
    lastSyncErrorAt?: string;
  }> => {
    const timestamp = new Date().toISOString();
    try {
      const metadata = (await fetchGithubMetadata(agent.repoUrl)) ?? (await fetchGenericMetadata(agent.repoUrl));
      return {
        id: agent.id,
        status: resolveStatus(agent, metadata.pushedAt ?? metadata.updatedAt),
        timestamp,
        stars: metadata.stars,
        repoLastUpdated: metadata.updatedAt,
        repoLastPushed: metadata.pushedAt,
        lastSyncError: undefined,
        lastSyncErrorAt: undefined
      };
    } catch (error: any) {
      return {
        id: agent.id,
        status: 'OFFLINE',
        timestamp,
        lastSyncError: error?.message ?? 'Sync failed',
        lastSyncErrorAt: timestamp
      };
    }
  }
};
