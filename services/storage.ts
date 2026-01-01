
import { ReadingEntry } from "../types";

const STORAGE_KEY = 'mystic_journal_data';

export const saveEntries = (entries: ReadingEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Failed to save to local storage (might be size limit):", e);
    alert("存储空间不足，请尝试清理较旧的记录。");
  }
};

export const loadEntries = (): ReadingEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};
