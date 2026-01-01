export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  isOnline?: boolean;
  createdAt: string;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: string;
  industry: string;
  location: string;
  foundedYear: number;
  teamSize: number;
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  organizerId: string;
  attendeeId: string;
  status: 'pending' | 'accepted' | 'declined' | 'confirmed';
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isRecurring: boolean;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'funding';
  amount: number;
  senderId: string;
  receiverId?: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
}

export interface DocumentChamber {
  id: string;
  name: string;
  type: 'contract' | 'deal' | 'agreement' | 'other';
  fileUrl: string;
  fileSize: number;
  status: 'draft' | 'in_review' | 'signed';
  ownerId: string;
  participants: string[];
  signatures: Signature[];
  createdAt: string;
  updatedAt: string;
}

export interface Signature {
  id: string;
  userId: string;
  userName: string;
  signatureData: string; // Base64 encoded signature
  signedAt: string;
}