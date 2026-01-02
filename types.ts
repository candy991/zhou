export enum DeckType {
  TAROT = 'tarot',
  LENORMAND = 'lenormand'
}

export type ThemeMode = 'dark' | 'light';
export type LenormandColor = 'default' | 'water' | 'fire' | 'earth' | 'air' | 'spirit';

export interface SelectedCard {
  name: string;
  isReversed: boolean;
}

export interface MoonPhase {
  name: string;
  emoji: string;
}

export interface ReadingEntry {
  id: string;
  date: string;
  deckType: DeckType;
  image?: string;
  title?: string;      // 新增：标题 (加了 ? 表示它是可选的)
  font?: string;       // 新增：字体
  notes: string;
  selectedCards: SelectedCard[];
  lenormandColor?: LenormandColor;
  tag?: string;
  moonPhase?: MoonPhase;
}

export interface AppState {
  entries: ReadingEntry[];
  currentView: 'home' | 'create' | 'detail';
  selectedEntryId?: string;
  theme: ThemeMode;
}
