
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

export interface ReadingEntry {
  id: string;
  date: string;
  deckType: DeckType;
  title?: string;
  font?: string;
  image?: string; // Base64 string
  notes: string;
  tag?: string;
  moonPhase?: { name: string; emoji: string };
  selectedCards?: SelectedCard[];
  lenormandColor?: LenormandColor;
}

export interface AppState {
  entries: ReadingEntry[];
  currentView: 'home' | 'create' | 'detail';
  selectedEntryId?: string;
  theme: ThemeMode;
}
