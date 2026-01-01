
export enum DeckType {
  TAROT = 'TAROT',
  LENORMAND = 'LENORMAND'
}

export type ThemeMode = 'light' | 'dark';

export type LenormandColor = 'default' | 'water' | 'fire' | 'earth' | 'air' | 'spirit';

export interface SelectedCard {
  name: string;
  isReversed: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ReadingEntry {
  id: string;
  date: string;
  deckType: DeckType;
  image?: string; // Base64 string
  notes: string;
  tag?: string; // 预设标签
  moonPhase?: { name: string; emoji: string }; // 月相信息
  interpretation?: string; // Initial AI summary
  chatHistory?: ChatMessage[]; // Full conversation history
  selectedCards?: SelectedCard[]; // List of manually selected cards
  lenormandColor?: LenormandColor;
}

export interface AppState {
  entries: ReadingEntry[];
  currentView: 'home' | 'create' | 'detail';
  selectedEntryId?: string;
  theme: ThemeMode;
}
