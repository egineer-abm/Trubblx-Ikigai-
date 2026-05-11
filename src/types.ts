export enum Pillar {
  PASSION = 'passion',
  MISSION = 'mission',
  VOCATION = 'vocation',
  PROFESSION = 'profession',
}

export interface Answers {
  whatYouLove: string[];
  whatYouAreGoodAt: string[];
  whatTheWorldNeeds: string[];
  whatYouCanBePaidFor: string[];
}

export interface Recommendation {
  text: string;
  category: 'remote' | 'creative' | 'social' | 'entrepreneurship' | 'other';
}

export interface FinalAnalysis {
  passion: string;
  mission: string;
  vocation: string;
  profession: string;
  ikigai: string;
  summary: string;
  recommendations: Recommendation[];
}

export interface IkigaiSession {
  id: string;
  userId: string;
  status: 'active' | 'completed';
  currentPillar: 'passion' | 'mission' | 'vocation' | 'profession' | 'done';
  answers: Answers;
  completedPillars: string[];
  pillarCompletionDates?: Record<string, any>;
  finalAnalysis?: FinalAnalysis;
  isPublic?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: any;
}

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any;
}
