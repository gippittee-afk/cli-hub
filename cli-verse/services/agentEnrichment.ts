import { Agent, Review } from '../types';

export type AgentSeed = Omit<Agent, 'reviews' | 'status' | 'lastSynced' | 'isNew'>;

const REVIEW_USERS = [
  'Registry_Analyst',
  'Kernel_Scribe',
  'Ops_Commander',
  'Telemetry_Auditor',
  'Field_Engineer',
  'Signal_Operator'
];

const REVIEW_OPENERS = [
  'Latency stayed minimal while',
  'Under sustained load, it',
  'In our deployment pipeline, it',
  'During incident response, it',
  'Across large repos, it',
  'When paired with automation, it'
];

const REVIEW_VERBS = [
  'held steady',
  'scaled gracefully',
  'maintained precision',
  'kept outputs consistent',
  'responded predictably',
  'kept throughput high'
];

const REVIEW_IMPACTS = [
  'and reduced manual overhead by',
  'and improved turnaround by',
  'and increased throughput by',
  'and stabilized workflows by',
  'and tightened feedback loops by',
  'and elevated reliability by'
];

const REVIEW_SUFFIXES = [
  'without introducing new failure modes.',
  'even under peak concurrency.',
  'with clean, inspectable output.',
  'while keeping resource usage modest.',
  'in multi-team environments.',
  'with predictable rollback paths.'
];

const TAG_SIGNAL: Record<string, number> = {
  security: 0.25,
  sandbox: 0.2,
  git: 0.15,
  automation: 0.12,
  cloud: 0.1,
  'open-source': 0.08
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), 1 | t);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const deriveRating = (agent: AgentSeed) => {
  const starSignal = Math.log10(agent.stars + 10) * 0.55;
  const featureSignal = agent.features.length * 0.08;
  const tagSignal = agent.tags.reduce((acc, tag) => acc + (TAG_SIGNAL[tag] || 0), 0);
  const base = 3.2 + starSignal + featureSignal + tagSignal;
  return clamp(base, 3.1, 4.9);
};

const deriveImpactScore = (agent: AgentSeed) => {
  const saturation = 1 - Math.exp(-agent.stars / 20000);
  const featureWeight = Math.min(0.3, agent.features.length * 0.03);
  return clamp(12 + (saturation + featureWeight) * 28, 12, 45);
};

const buildReview = (agent: AgentSeed, index: number, rand: () => number): Review => {
  const ratingBase = deriveRating(agent);
  const variance = (rand() - 0.5) * 0.6;
  const rating = clamp(ratingBase + variance, 3.0, 5.0);
  const impact = Math.round(deriveImpactScore(agent) + rand() * 6);
  const opener = REVIEW_OPENERS[Math.floor(rand() * REVIEW_OPENERS.length)];
  const verb = REVIEW_VERBS[Math.floor(rand() * REVIEW_VERBS.length)];
  const impactVerb = REVIEW_IMPACTS[Math.floor(rand() * REVIEW_IMPACTS.length)];
  const suffix = REVIEW_SUFFIXES[Math.floor(rand() * REVIEW_SUFFIXES.length)];
  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() - Math.floor(rand() * 180) - index * 14);

  return {
    id: `${agent.id}-review-${index}`,
    user: REVIEW_USERS[Math.floor(rand() * REVIEW_USERS.length)],
    rating: Number(rating.toFixed(1)),
    comment: `${opener} ${verb} ${impactVerb} ${impact}%. ${suffix}`,
    date: reviewDate.toISOString().split('T')[0]
  };
};

export const enrichAgent = (agent: AgentSeed): Agent => {
  const rand = seededRandom(hashString(agent.id));
  const reviewCount = 2 + Math.floor(rand() * 2);
  const reviews = Array.from({ length: reviewCount }, (_, index) => buildReview(agent, index + 1, rand));

  return {
    ...agent,
    reviews
  };
};

export const enrichAgents = (agents: AgentSeed[]): Agent[] => agents.map(enrichAgent);

export interface RegistryTimelinePoint {
  year: number;
  adoptionIndex: number;
  reliabilityIndex: number;
}

export const buildRegistryTimeline = (agents: AgentSeed[], yearsBack = 6): RegistryTimelinePoint[] => {
  const now = new Date().getFullYear();
  const totalStars = agents.reduce((sum, agent) => sum + agent.stars, 0);
  const avgStars = totalStars / Math.max(1, agents.length);
  const growthRate = 0.45 + Math.min(0.4, agents.length / 140);
  const midpoint = (yearsBack - 1) / 2;
  const stability = clamp(1 - Math.sqrt(avgStars) / 500, 0.2, 0.9);

  return Array.from({ length: yearsBack }, (_, offset) => {
    const year = now - (yearsBack - 1 - offset);
    const t = offset - midpoint;
    const logistic = 1 / (1 + Math.exp(-growthRate * t));
    const adoptionIndex = Math.round(35 + logistic * 65);
    const reliabilityIndex = Math.round(50 + logistic * 40 * (1 - stability));

    return { year, adoptionIndex, reliabilityIndex };
  });
};

export interface RegistryCategoryStat {
  category: string;
  count: number;
  stars: number;
  averageStars: number;
  maturityScore: number;
}

export const buildCategoryStats = (agents: AgentSeed[]): RegistryCategoryStat[] => {
  const totals = agents.reduce<Record<string, { count: number; stars: number }>>((acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = { count: 0, stars: 0 };
    }
    acc[agent.category].count += 1;
    acc[agent.category].stars += agent.stars;
    return acc;
  }, {});

  return Object.entries(totals).map(([category, data]) => {
    const averageStars = data.stars / Math.max(1, data.count);
    const maturityScore = clamp(Math.log10(averageStars + 10) * 18, 20, 92);
    return {
      category,
      count: data.count,
      stars: data.stars,
      averageStars: Math.round(averageStars),
      maturityScore: Math.round(maturityScore)
    };
  }).sort((a, b) => b.stars - a.stars);
};

export const buildRegistryHealth = (agents: AgentSeed[]) => {
  const stars = agents.map(agent => agent.stars);
  const mean = stars.reduce((sum, value) => sum + value, 0) / Math.max(1, stars.length);
  const variance = stars.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / Math.max(1, stars.length);
  const coefficient = Math.sqrt(variance) / Math.max(1, mean);
  const coverage = clamp(1 - coefficient, 0.25, 0.95);
  const breadth = clamp(Math.log2(agents.length + 1) / 5, 0.2, 1);

  return {
    coverageIndex: Math.round(coverage * 100),
    breadthIndex: Math.round(breadth * 100),
    signalIntegrity: Math.round((coverage * 0.6 + breadth * 0.4) * 100)
  };
};
