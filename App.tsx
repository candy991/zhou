import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DeckType, ReadingEntry, AppState, SelectedCard, ThemeMode, LenormandColor } from './types';
import { loadEntries, saveEntries } from './services/storage';
import { MysticButton } from './components/MysticButton';
import { TAROT_CARDS, LENORMAND_CARDS, TAROT_DETAILS, LENORMAND_DETAILS, SPREAD_LAYOUTS, SpreadLayout } from './constants/cards';
import * as echarts from 'echarts';

// ==========================================
// 核心工具函数：月相计算
// ==========================================
const getMoonPhase = (date: Date) => {
  const lp = 2551442.8; 
  const newMoonRef = new Date(1970, 0, 7, 20, 35, 0).getTime() / 1000;
  const now = date.getTime() / 1000;
  const phase = ((now - newMoonRef) % lp) / lp;
  const normalized = phase < 0 ? phase + 1 : phase;
  
  if (normalized < 0.0625 || normalized > 0.9375) return { name: "新月", emoji: "🌑" };
  if (normalized < 0.1875) return { name: "娥眉月", emoji: "🌒" };
  if (normalized < 0.3125) return { name: "上弦月", emoji: "🌓" };
  if (normalized < 0.4375) return { name: "盈凸月", emoji: "🌔" };
  if (normalized < 0.5625) return { name: "满月", emoji: "🌕" };
  if (normalized < 0.6875) return { name: "亏凸月", emoji: "🌖" };
  if (normalized < 0.8125) return { name: "下弦月", emoji: "🌗" };
  return { name: "残月", emoji: "🌘" };
};

const LENORMAND_THEME_CONFIG: Record<LenormandColor, { bg: string; text: string; label: string; emoji: string }> = {
  default: { bg: 'from-slate-900 via-slate-800 to-slate-950', text: 'text-indigo-300', label: '默认', emoji: '🌑' },
  water: { bg: 'from-blue-900 via-cyan-900 to-blue-950', text: 'text-cyan-200', label: '水象', emoji: '💧' },
  fire: { bg: 'from-red-950 via-orange-900 to-stone-950', text: 'text-orange-200', label: '火象', emoji: '🔥' },
  earth: { bg: 'from-emerald-950 via-green-900 to-stone-950', text: 'text-emerald-200', label: '土象', emoji: '🌿' },
  air: { bg: 'from-purple-950 via-indigo-900 to-slate-950', text: 'text-purple-200', label: '风象', emoji: '🌪️' },
  spirit: { bg: 'from-amber-900 via-yellow-700 to-amber-950', text: 'text-yellow-100', label: '灵性', emoji: '✨' }
};

const PRESET_TAGS = ['❤️ 感情', '💰 事业', '🎓 学业', '🧘‍♀️ 灵性', '🏠 生活'];

// ==========================================
// 子组件：卡牌显示 (强化统一对齐)
// ==========================================
const CardBack: React.FC<{ 
  type: DeckType; 
  isReversed?: boolean; 
  name: string; 
  compact?: boolean;
  color?: LenormandColor;
  onInfoClick?: (e: React.MouseEvent) => void;
  theme?: ThemeMode;
  showDetailsOnHover?: boolean;
  zenMode?: boolean;
}> = ({ type, isReversed, name, compact, color = 'default', onInfoClick, theme = 'dark', showDetailsOnHover, zenMode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const isTarot = type === DeckType.TAROT;
  const rotationClass = isReversed ? 'rotate-180' : 'rotate-0';
  const details = isTarot ? TAROT_DETAILS[name] : LENORMAND_DETAILS[name];
  const imageUrl = details?.imageUrl;
  
  const config = isTarot ? null : LENORMAND_THEME_CONFIG[color];
  const bgGradient = isTarot 
    ? (theme === 'dark' ? 'from-indigo-950 via-purple-900 to-indigo-950' : 'from-amber-100 via-orange-50 to-amber-100')
    : config?.bg;

  return (
    <div 
      onClick={onInfoClick}
      className={`relative transition-all duration-500 ease-in-out ${rotationClass} w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-stone-300'} group bg-slate-900 cursor-pointer`}
    >
      {imageUrl && !imgError ? (
        <img 
          src={imageUrl} 
          alt={name} 
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center p-2 text-center`}>
          <div className="text-[8px] font-mystic opacity-30 absolute top-2 uppercase tracking-tighter">{isTarot ? 'Tarot' : 'Lenormand'}</div>
          <div className={`text-3xl mb-1 ${isTarot ? 'text-indigo-400/50' : 'drop-shadow-lg'}`}>{details?.emoji || (isTarot ? '✡' : '❦')}</div>
          <div className={`text-[10px] font-bold leading-tight uppercase mt-2 px-1 ${isTarot ? 'text-indigo-300' : config?.text}`}>
            {details?.zh}<br/>
            <span className="text-[7px] opacity-40 font-normal">({details?.en})</span>
          </div>
        </div>
      )}
      
      {showDetailsOnHover && !zenMode && (
        <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 pointer-events-none">
          <div className="text-[10px] font-bold text-indigo-400 mb-1 border-b border-white/10 pb-1">{details?.zh}</div>
          <p className="text-[8px] leading-tight text-white/70 line-clamp-4 italic">{details?.meaning}</p>
        </div>
      )}

      {!compact && onInfoClick && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-black/40 hover:bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white backdrop-blur-md transition-colors z-20">i</div>
      )}
    </div>
  );
};

const CardInfoModal: React.FC<{ cardName: string; type: DeckType; isReversed?: boolean; onClose: () => void; theme: ThemeMode }> = ({ cardName, type, isReversed, onClose, theme }) => {
  const details = type === DeckType.TAROT ? TAROT_DETAILS[cardName] : LENORMAND_DETAILS[cardName];
  if (!details) return null;
  const isDark = theme === 'dark';
  return (
    <div className="fixed inset-0 z-[450] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className={`relative ${isDark ? 'bg-slate-900 border-indigo-500/30' : 'bg-white border-stone-200'} border w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-indigo-500">✕</button>
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{details.emoji || '✨'}</div>
          <h3 className="text-2xl font-serif font-bold">{details.zh}</h3>
          <p className="text-xs opacity-50 uppercase tracking-widest">{details.en}</p>
        </div>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed italic opacity-80">{(isReversed && details.reversedMeaning) ? details.reversedMeaning : details.meaning}</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 主应用组件
// ==========================================
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ entries: [], currentView: 'home', theme: 'dark' });
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [typeFilter, setTypeFilter] = useState<'ALL' | DeckType>('ALL');
  const [activeTagFilter, setActiveTagFilter] = useState<string>('全部');
  const [homeSubView, setHomeSubView] = useState<'recent' | 'archive'>('recent');

  const [isZenMode, setIsZenMode] = useState(false);
  const [showSpreadLabels, setShowSpreadLabels] = useState(false);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set());

  const [activeTarotTab, setActiveTarotTab] = useState<keyof typeof TAROT_CARDS>('major');
  const [activeInfoCard, setActiveInfoCard] = useState<{name: string, isReversed: boolean} | null>(null);

  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLocalISOString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    id: undefined as string | undefined,
    deckType: DeckType.TAROT, 
    title: '',
    image: '', 
    notes: '', 
    selectedCards: [] as SelectedCard[], 
    lenormandColor: 'default' as LenormandColor, 
    tag: undefined as string | undefined,
    font: 'font-serif',
    readingDate: getLocalISOString(new Date()),
    actualOutcome: '',
    accuracyRating: 0,
    layoutId: 't-1'
  });

  useEffect(() => {
    const data = loadEntries();
    setState(prev => ({ ...prev, entries: data }));
  }, []);

  const isDark = state.theme === 'dark';
  const selectedEntry = state.entries.find(e => e.id === state.selectedEntryId);

  const dashboardStats = useMemo(() => {
    const entries = state.entries;
    const cardCounts: Record<string, number> = {};
    entries.forEach(e => e.selectedCards?.forEach(c => {
      cardCounts[c.name] = (cardCounts[c.name] || 0) + 1;
    }));
    const sortedCards = Object.entries(cardCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
    const topCardNames = sortedCards.map(([name]) => (TAROT_DETAILS[name]?.zh || LENORMAND_DETAILS[name]?.zh || name.split(' ')[0]));
    const topCardValues = sortedCards.map(([, count]) => count);
    const dailyCounts: Record<string, number> = {};
    entries.forEach(e => {
      const d = new Date(e.date).toISOString().split('T')[0];
      dailyCounts[d] = (dailyCounts[d] || 0) + 1;
    });
    const allDates = Object.keys(dailyCounts).sort();
    const cumulativeMap: Record<string, number> = {};
    let runningTotal = 0;
    allDates.forEach(d => {
      runningTotal += dailyCounts[d];
      cumulativeMap[d] = runningTotal;
    });
    const sortedDates = allDates.slice(-10);
    const trendValues = sortedDates.map(d => dailyCounts[d]);
    const cumulativeValues = sortedDates.map(d => cumulativeMap[d]);
    return { total: entries.length, topCardNames, topCardValues, sortedDates, trendValues, cumulativeValues };
  }, [state.entries]);

  useEffect(() => {
    if (state.currentView !== 'home' || state.entries.length === 0) return;
    const bar = echarts.init(barChartRef.current!);
    bar.setOption({
      xAxis: { type: 'category', data: dashboardStats.topCardNames, axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } } },
      series: [{ data: dashboardStats.topCardValues, type: 'bar', itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] } }],
      grid: { top: 20, bottom: 40, left: 30, right: 10 }
    });
    const line = echarts.init(lineChartRef.current!);
    line.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#f1f5f9',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 10,
        textStyle: { color: '#334155', fontSize: 12 },
        formatter: (params: any) => {
          let html = `<div style="font-weight: 700; margin-bottom: 8px; color: #64748b;">${params[0].name}</div>`;
          params.forEach((p: any) => {
            html += `
              <div style="display: flex; justify-content: space-between; align-items: center; min-width: 140px; margin-bottom: 4px;">
                <span style="display: flex; align-items: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${p.color}; margin-right: 8px;"></span>
                  <span>${p.seriesName}</span>
                </span>
                <span style="font-weight: 700; font-family: monospace; margin-left: 20px;">${p.value}</span>
              </div>
            `;
          });
          return html;
        }
      },
      legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }, data: ['每日抽牌', '累计记录'] },
      xAxis: { type: 'category', data: dashboardStats.sortedDates, axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: isDark ? '#1e293b' : '#e2e8f0' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9', type: 'dashed' } }, axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 } },
      series: [
        { name: '每日抽牌', data: dashboardStats.trendValues, type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#f59e0b' }, lineStyle: { width: 3 } },
        { name: '累计记录', data: dashboardStats.cumulativeValues, type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#6366f1' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(99, 102, 241, 0.3)' }, { offset: 1, color: 'rgba(99, 102, 241, 0)' }]) }, lineStyle: { width: 3 } }
      ],
      grid: { top: 30, bottom: 50, left: 40, right: 15 }
    });
    return () => { bar.dispose(); line.dispose(); };
  }, [state.currentView, isDark, dashboardStats]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return state.entries.filter(e => {
      const matchesSearch = e.notes.toLowerCase().includes(query) || (e.title && e.title.toLowerCase().includes(query)) || (e.tag && e.tag.includes(query)) || e.selectedCards?.some(c => c.name.toLowerCase().includes(query));
      const matchesType = typeFilter === 'ALL' || e.deckType === typeFilter;
      const matchesTag = activeTagFilter === '全部' || e.tag === activeTagFilter;
      return matchesSearch && matchesType && matchesTag;
    });
  }, [state.entries, searchQuery, typeFilter, activeTagFilter]);

  const displayData = useMemo(() => {
    if (homeSubView === 'recent') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return filteredEntries.filter(e => new Date(e.date).getTime() > sevenDaysAgo);
    } else {
      const groups: Record<string, ReadingEntry[]> = {};
      filteredEntries.forEach(e => {
        const date = new Date(e.date);
        const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        if (!groups[monthKey]) groups[monthKey] = [];
        groups[monthKey].push(e);
      });
      return groups;
    }
  }, [filteredEntries, homeSubView]);

  const handleSaveEntry = () => {
    const d = new Date(formData.readingDate);
    const newEntry: ReadingEntry = { id: formData.id || Date.now().toString(), date: d.toISOString(), deckType: formData.deckType, title: formData.title || "未命名记录", image: formData.image, notes: formData.notes, selectedCards: formData.selectedCards, lenormandColor: formData.lenormandColor, tag: formData.tag, font: formData.font, moonPhase: getMoonPhase(d), actualOutcome: formData.actualOutcome, accuracyRating: formData.accuracyRating, layoutId: formData.layoutId };
    let updated: ReadingEntry[];
    if (formData.id) updated = state.entries.map(e => e.id === formData.id ? newEntry : e);
    else updated = [newEntry, ...state.entries];
    setState(prev => ({ ...prev, entries: updated, currentView: 'home' }));
    saveEntries(updated);
    setFormData({ id: undefined, deckType: DeckType.TAROT, title: '', image: '', notes: '', selectedCards: [], lenormandColor: 'default', tag: undefined, font: 'font-serif', readingDate: getLocalISOString(new Date()), actualOutcome: '', accuracyRating: 0, layoutId: 't-1' });
  };

  const handleEditEntry = (entry: ReadingEntry) => {
    setFormData({ id: entry.id, deckType: entry.deckType, title: entry.title || '', image: entry.image || '', notes: entry.notes || '', selectedCards: entry.selectedCards || [], lenormandColor: entry.lenormandColor || 'default', tag: entry.tag, font: entry.font || 'font-serif', readingDate: getLocalISOString(new Date(entry.date)), actualOutcome: entry.actualOutcome || '', accuracyRating: entry.accuracyRating || 0, layoutId: entry.layoutId || (entry.deckType === DeckType.TAROT ? 't-1' : 'l-3') });
    setState(prev => ({ ...prev, currentView: 'create' }));
  };

  const handleDeleteSingle = (id: string) => {
    if (window.confirm("确定要永久删除这条启示记录吗？")) {
      const updated = state.entries.filter(e => e.id !== id);
      saveEntries(updated);
      setState(prev => ({ ...prev, entries: updated, currentView: (prev.selectedEntryId === id ? 'home' : prev.currentView), selectedEntryId: (prev.selectedEntryId === id ? undefined : prev.selectedEntryId) }));
    }
  };

  const handleBulkDelete = () => {
    if (selectedEntryIds.size === 0) return;
    if (window.confirm(`确定要永久删除选中的 ${selectedEntryIds.size} 条记录吗？`)) {
      const updated = state.entries.filter(e => !selectedEntryIds.has(e.id));
      saveEntries(updated);
      setState(prev => ({ ...prev, entries: updated }));
      setSelectedEntryIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleRandomDraw = (count?: number) => {
    const isTarot = formData.deckType === DeckType.TAROT;
    const pool = isTarot ? Object.keys(TAROT_DETAILS) : Object.keys(LENORMAND_DETAILS);
    const layouts = SPREAD_LAYOUTS[formData.deckType];
    const currentLayout = layouts.find(l => l.id === formData.layoutId) || layouts[0];
    const drawCount = count || currentLayout.positions.length;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const drawn = shuffled.slice(0, drawCount).map(name => ({ name, isReversed: isTarot ? Math.random() > 0.5 : false }));
    setFormData(p => ({ ...p, selectedCards: drawn }));
  };

  const exportBackup = () => {
    const data = JSON.stringify(state.entries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MysticJournal_Backup_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        if (confirm(`从备份恢复 ${importedData.length} 条记录？`)) {
          setState(prev => ({ ...prev, entries: importedData }));
          saveEntries(importedData);
        }
      } catch (err) { alert("导入失败"); }
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const headers = ["日期", "标题", "笔记"];
    const rows = filteredEntries.map(e => [e.date, e.title, e.notes]);
    const csv = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "mystic.csv";
    link.click();
  };

  const toggleTheme = () => setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));

  const renderEntryCard = (entry: ReadingEntry) => {
    const isSelected = selectedEntryIds.has(entry.id);
    return (
      <div 
        key={entry.id} 
        onClick={() => isSelectionMode ? setSelectedEntryIds(prev => { const next = new Set(prev); if(next.has(entry.id)) next.delete(entry.id); else next.add(entry.id); return next; }) : setState(p => ({ ...p, currentView: 'detail', selectedEntryId: entry.id }))} 
        className={`relative rounded-2xl border overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 group ${isDark ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-100 shadow-sm'} ${isSelectionMode && isSelected ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-slate-950' : ''}`}
      >
        {isSelectionMode && (
          <div className="absolute top-3 left-3 z-40 w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center bg-black/20 backdrop-blur-md">
            {isSelected && <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>}
          </div>
        )}
        {!isSelectionMode && (
          <div className="absolute top-2 left-2 z-[100] opacity-0 group-hover:opacity-100 transition-opacity no-print flex flex-col gap-2">
             <button onClick={(e) => { e.stopPropagation(); handleDeleteSingle(entry.id); }} className="w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-50 text-white rounded-full shadow-2xl transform hover:scale-110 transition-transform">🗑️</button>
             <button onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); }} className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-50 text-white rounded-full shadow-2xl transform hover:scale-110 transition-transform">📝</button>
          </div>
        )}
        <div className="h-44 relative bg-slate-950/20 flex items-center justify-center p-4 overflow-hidden">
          {entry.image ? (
            <img src={entry.image} className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="flex justify-center items-center w-full px-4 transition-all duration-500">
              {entry.selectedCards?.slice(0,3).map((c,i) => (
                <div key={i} className="w-14 h-20 -mx-4 group-hover:mx-1 transition-all duration-500 group-hover:-translate-y-4 group-hover:scale-110" style={{ zIndex: 10 - i }}>
                  <CardBack type={entry.deckType} name={c.name} isReversed={c.isReversed} color={entry.lenormandColor} compact theme={state.theme} />
                </div>
              ))}
            </div>
          )}
          <div className="absolute top-3 right-3 text-xl bg-black/30 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-md shadow-lg">{entry.moonPhase?.emoji}</div>
          {entry.tag && <div className="absolute bottom-3 left-3 bg-indigo-600/80 backdrop-blur-md text-[9px] px-2 py-0.5 rounded-full text-white shadow-md uppercase tracking-wider">{entry.tag}</div>}
        </div>
        <div className="p-5">
          <div className="flex justify-between items-center mb-1">
             <h4 className="text-sm font-bold font-serif truncate flex-1 pr-2">{entry.title || "记录档案"}</h4>
             <span className="text-[10px] font-mystic text-indigo-500 uppercase tracking-widest">{entry.deckType === DeckType.TAROT ? 'Tarot' : 'Lenor'}</span>
          </div>
          <div className="text-[10px] opacity-40 mb-2 font-mono">{new Date(entry.date).toLocaleDateString()}</div>
          <p className="text-sm italic line-clamp-2 opacity-80 leading-relaxed font-serif">{entry.notes || "一段未被捕捉的觉醒时刻..."}</p>
        </div>
      </div>
    );
  };

  // 渲染牌阵布局内容 (修复对齐、尺寸与交互)
  const renderSpreadPreview = (layout: SpreadLayout, selectedCards: SelectedCard[], onAddCard: () => void, showLabels: boolean, isZen: boolean = false) => {
    const isLenormand = layout.type === DeckType.LENORMAND;
    const isGrandTableau = layout.id === 'l-gt';
    
    // 动态调整卡牌尺寸以适应不同模式
    const cardSizeClass = isZen ? 'w-[25vw] sm:w-44 md:w-56' : 'w-16 sm:w-20 md:w-24';

    if (isLenormand && layout.grid) {
      return (
        <div className={`w-full ${isGrandTableau ? 'overflow-x-auto custom-scrollbar pb-8' : ''}`}>
          <div 
            className={`grid gap-x-3 gap-y-8 mx-auto ${isGrandTableau ? 'w-max px-8' : 'w-full max-w-5xl'}`}
            style={{ 
              gridTemplateColumns: `repeat(${layout.grid.cols}, minmax(${isGrandTableau ? '65px' : '60px'}, 1fr))`,
              gridTemplateRows: `repeat(${layout.grid.rows}, auto)`
            }}
          >
            {layout.positions.map((pos, idx) => {
              const card = selectedCards[idx];
              return (
                <div key={idx} className="relative flex flex-col items-center gap-2 group/item">
                  <div className="relative aspect-[2/3] w-full shadow-2xl rounded-xl transition-transform hover:scale-105">
                    {card ? (
                      <CardBack 
                        type={layout.type} 
                        name={card.name} 
                        isReversed={card.isReversed} 
                        color={formData.lenormandColor} 
                        theme={state.theme} 
                        onInfoClick={() => setActiveInfoCard(card)}
                      />
                    ) : (
                      <div onClick={onAddCard} className="w-full h-full border-2 border-dashed border-white/10 bg-slate-900/40 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-900/60 transition-colors">
                        <span className="text-[12px] opacity-10">+</span>
                      </div>
                    )}
                  </div>
                  {showLabels && (
                    <span className="text-[8px] md:text-[10px] opacity-40 uppercase font-bold text-center truncate w-full tracking-tighter">{pos.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-x-6 gap-y-12 justify-center px-4">
        {layout.positions.map((pos, idx) => {
          const card = selectedCards[idx];
          return (
            <div key={idx} className={`${cardSizeClass} flex flex-col items-center gap-3 group/item`}>
              <div className="w-full aspect-[2/3] relative shadow-2xl rounded-xl transition-transform hover:scale-105">
                 {card ? (
                    <CardBack 
                      type={layout.type} 
                      name={card.name} 
                      isReversed={card.isReversed} 
                      color={formData.lenormandColor} 
                      theme={state.theme} 
                      onInfoClick={() => setActiveInfoCard(card)}
                    />
                 ) : (
                    <div onClick={onAddCard} className="w-full h-full border-2 border-dashed border-white/10 bg-slate-900/40 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-900/60 transition-colors">
                       <span className="text-[32px] opacity-10">+</span>
                    </div>
                 )}
              </div>
              {showLabels && (
                <span className="text-[9px] md:text-[11px] opacity-40 uppercase font-bold text-center truncate w-full tracking-widest bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">{pos.label}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'} transition-colors duration-500`}>
      <aside className={`hidden md:flex flex-col w-64 border-r sticky top-0 h-screen ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} p-6 no-print`}>
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-mystic tracking-tighter text-indigo-500 uppercase">Mystic Journal</h1>
          <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Archive of Symbols & Whispers</p>
        </div>
        <nav className="flex-1 space-y-4">
          <button onClick={() => setState(p => ({ ...p, currentView: 'home' }))} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${state.currentView === 'home' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-indigo-500/10 opacity-70'}`}>🏠 仪表盘</button>
          <button onClick={() => { setFormData({ id: undefined, deckType: DeckType.TAROT, title: '', image: '', notes: '', selectedCards: [], lenormandColor: 'default', tag: undefined, font: 'font-serif', readingDate: getLocalISOString(new Date()), actualOutcome: '', accuracyRating: 0, layoutId: 't-1' }); setState(p => ({ ...p, currentView: 'create' })); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${state.currentView === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-indigo-500/10 opacity-70'}`}>🎴 抽牌记录</button>
        </nav>
        <button onClick={toggleTheme} className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all">{isDark ? '🌙 深邃模式' : '☀️ 纯净模式'}</button>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-[100] no-print">
           <h1 className="text-xl font-mystic text-indigo-500 uppercase">Mystic Journal</h1>
           <button onClick={toggleTheme}>{isDark ? '🌙' : '☀️'}</button>
        </header>

        <div className="max-w-6xl mx-auto p-6 md:p-10 pb-32">
          {state.currentView === 'home' && (
            <div className="animate-in fade-in duration-700 space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
                <div className={`flex-1 flex justify-around p-8 rounded-3xl border ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="text-center px-4">
                    <div className="text-3xl font-serif font-bold text-amber-500">{state.entries.length > 0 ? Array.from(new Set(state.entries.map(e => new Date(e.date).toDateString()))).length : 0}</div>
                    <div className="text-[10px] opacity-40 uppercase tracking-widest mt-1 font-bold">坚持天数</div>
                  </div>
                  <div className="w-px bg-white/5 h-full"></div>
                  <div className="text-center px-4">
                    <div className="text-3xl font-serif font-bold text-amber-500">{state.entries.length}</div>
                    <div className="text-[10px] opacity-40 uppercase tracking-widest mt-1 font-bold">总记录数</div>
                  </div>
                  <div className="w-px bg-white/5 h-full"></div>
                  <div className="text-center px-4">
                    <div className="text-xl font-serif font-bold text-amber-500 truncate max-w-[80px]">{dashboardStats.topCardNames[0] || '---'}</div>
                    <div className="text-[10px] opacity-40 uppercase tracking-widest mt-1 font-bold">高频牌</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
                   <h3 className="text-[10px] font-mystic uppercase opacity-40 mb-4 tracking-widest text-center">高频牌分布 (TOP 5)</h3>
                   <div ref={barChartRef} className="h-48 w-full"></div>
                </div>
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
                   <h3 className="text-[10px] font-mystic uppercase opacity-40 mb-4 tracking-widest text-center">历史趋势 & 累计</h3>
                   <div ref={lineChartRef} className="h-48 w-full"></div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="检索记录、标签或牌名..." className={`w-full py-4 px-12 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200'}`} />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xl pointer-events-none">🔍</span>
                  </div>
                  <div className="flex gap-2 no-print shrink-0">
                    <button onClick={exportToCSV} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-bold uppercase ${isDark ? 'bg-slate-900/40 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>📊 CSV</button>
                    <button onClick={exportBackup} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-bold uppercase ${isDark ? 'bg-slate-900/40 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>📦 JSON</button>
                    <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-bold uppercase ${isDark ? 'bg-slate-900/40 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>📥<input type="file" ref={fileInputRef} onChange={importBackup} accept=".json" className="hidden" /></button>
                  </div>
                  <div className="flex bg-slate-900/20 p-1 rounded-2xl gap-1 border border-white/5 shrink-0">
                    {(['ALL', DeckType.TAROT, DeckType.LENORMAND] as const).map(type => (
                      <button key={type} onClick={() => setTypeFilter(type)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${typeFilter === type ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>
                        {type === 'ALL' ? '全部' : type === DeckType.TAROT ? '塔罗' : '雷诺曼'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <h3 className="text-xl font-serif font-bold">历史星迹记录</h3>
                   <div className="flex gap-4">
                      <MysticButton variant="secondary" onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedEntryIds(new Set()); }}>{isSelectionMode ? '取消选择' : '批量管理'}</MysticButton>
                      {!isSelectionMode && <MysticButton onClick={() => { setFormData({ id: undefined, deckType: DeckType.TAROT, title: '', image: '', notes: '', selectedCards: [], lenormandColor: 'default', tag: undefined, font: 'font-serif', readingDate: getLocalISOString(new Date()), actualOutcome: '', accuracyRating: 0, layoutId: 't-1' }); setState(p => ({ ...p, currentView: 'create' })); }}>+ 启程抽牌</MysticButton>}
                      {isSelectionMode && selectedEntryIds.size > 0 && <MysticButton variant="danger" onClick={handleBulkDelete}>删除选中 ({selectedEntryIds.size})</MysticButton>}
                   </div>
                </div>

                {/* 恢复：标签过滤器 */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {['全部', ...PRESET_TAGS].map(tag => (
                    <button key={tag} onClick={() => setActiveTagFilter(tag)} className={`px-5 py-2 rounded-full text-xs transition-all whitespace-nowrap border ${activeTagFilter === tag ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-900/40 border-white/5 opacity-40 hover:opacity-100'}`}>{tag}</button>
                  ))}
                </div>

                {/* 恢复：近期/归档切换 */}
                <div className="flex border-b border-white/5 mb-6">
                  <button onClick={() => setHomeSubView('recent')} className={`px-8 py-4 text-xs uppercase tracking-widest font-mystic transition-all border-b-2 ${homeSubView === 'recent' ? 'text-indigo-400 border-indigo-500' : 'opacity-30 border-transparent hover:opacity-60'}`}>近期 (RECENT)</button>
                  <button onClick={() => setHomeSubView('archive')} className={`px-8 py-4 text-xs uppercase tracking-widest font-mystic transition-all border-b-2 ${homeSubView === 'archive' ? 'text-indigo-400 border-indigo-500' : 'opacity-30 border-transparent hover:opacity-60'}`}>归档 (ARCHIVE)</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {homeSubView === 'recent' ? (
                    (displayData as ReadingEntry[]).map(renderEntryCard)
                  ) : (
                    Object.keys(displayData as Record<string, ReadingEntry[]>).map(month => (
                      <div key={month} className="col-span-full space-y-4">
                        <div className="font-serif font-bold text-lg opacity-40 px-2">{month}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {(displayData as Record<string, ReadingEntry[]>)[month].map(renderEntryCard)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {state.currentView === 'create' && (
            <div className={`max-w-3xl mx-auto p-10 rounded-[2.5rem] border shadow-2xl animate-in zoom-in-95 duration-500 ${isDark ? 'bg-slate-900/80 border-white/5 shadow-indigo-500/10' : 'bg-white border-slate-200'}`}>
              <div className="mb-10 text-center">
                 <h2 className="text-3xl font-serif font-bold mb-2">{formData.id ? '复盘记录' : '捕捉启示'}</h2>
                 <p className="text-xs opacity-50 uppercase tracking-[0.3em] font-mystic">{formData.id ? 'Review & Reflect' : 'Intuition Recording'}</p>
              </div>
              <div className="space-y-10">
                <div className="flex p-1 bg-slate-950/20 rounded-2xl gap-2 border border-white/5">
                  {[DeckType.TAROT, DeckType.LENORMAND].map(t => (
                    <button key={t} onClick={() => setFormData(p => ({ ...p, deckType: t, selectedCards: [], layoutId: t === DeckType.TAROT ? 't-1' : 'l-3' }))} className={`flex-1 py-3 rounded-xl transition-all font-mystic text-sm uppercase tracking-widest ${formData.deckType === t ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>{t}</button>
                  ))}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase opacity-40 font-bold tracking-widest block px-2">牌阵布局 (Spread Layout)</label>
                  <div className="flex flex-wrap gap-2">
                    {SPREAD_LAYOUTS[formData.deckType].map(layout => (
                      <button key={layout.id} onClick={() => setFormData(p => ({ ...p, layoutId: layout.id, selectedCards: [] }))} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${formData.layoutId === layout.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950/20 border-white/5 opacity-60 hover:opacity-100'}`}>{layout.name}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase opacity-40 font-bold tracking-widest block px-2">启示时刻 (Time)</label>
                  <input type="datetime-local" value={formData.readingDate} onChange={e => setFormData(p => ({ ...p, readingDate: e.target.value }))} className={`w-full p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>

                {/* 分类标签选择 */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase opacity-40 font-bold tracking-widest block px-2">分类标签 (Tags)</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TAGS.map(tag => (
                      <button key={tag} onClick={() => setFormData(p => ({ ...p, tag: p.tag === tag ? undefined : tag }))} className={`px-4 py-2 rounded-full text-xs border transition-all ${formData.tag === tag ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950/20 border-white/5 opacity-60 hover:opacity-100'}`}>{tag}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase opacity-40 font-bold tracking-widest block px-2">仪式主题 (Title)</label>
                  <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="为这段灵感命名..." className={`w-full p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>

                <div className="flex justify-between items-center px-2">
                   <span className="text-[10px] uppercase opacity-40 font-bold tracking-widest block">牌阵预览 (Spread)</span>
                   <div className="flex gap-2">
                     <button onClick={() => setShowSpreadLabels(!showSpreadLabels)} className={`text-[9px] uppercase font-mystic px-3 py-1 rounded-full transition-all border ${showSpreadLabels ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'}`}>{showSpreadLabels ? '隐藏标签' : '显示标签'}</button>
                     <button onClick={() => handleRandomDraw()} className="text-[9px] uppercase font-mystic bg-indigo-600/20 hover:bg-indigo-600/40 px-3 py-1 rounded-full transition-all border border-indigo-500/20">✨ 虚拟抽牌</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div onClick={() => document.getElementById('cam')?.click()} className="aspect-square border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all overflow-hidden relative">
                      {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <><span className="text-4xl mb-3 opacity-20">📷</span><p className="text-[10px] uppercase opacity-40 font-bold tracking-widest">上传实拍</p></>}
                      <input id="cam" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onloadend = () => setFormData(p => ({ ...p, image: r.result as string })); r.readAsDataURL(f); } }} />
                   </div>
                   <div className="aspect-square border border-white/5 rounded-3xl flex flex-col items-center justify-center p-6 bg-slate-950/20 overflow-hidden relative shadow-inner">
                      {formData.selectedCards.length > 0 ? (
                        <div className="w-full h-full flex items-center justify-center overflow-hidden">
                          {renderSpreadPreview(SPREAD_LAYOUTS[formData.deckType].find(l => l.id === formData.layoutId) || SPREAD_LAYOUTS[formData.deckType][0], formData.selectedCards, () => setShowPicker(true), showSpreadLabels)}
                        </div>
                      ) : (
                        <div onClick={() => setShowPicker(true)} className="text-center opacity-40 cursor-pointer w-full h-full flex flex-col items-center justify-center"><p className="text-2xl mb-2">🎴</p><p className="text-[10px] uppercase font-bold tracking-widest">手动标记</p></div>
                      )}
                      {formData.selectedCards.length > 0 && <button onClick={() => setShowPicker(true)} className="absolute bottom-2 right-2 bg-black/40 text-[10px] px-2 py-1 rounded-md opacity-40 hover:opacity-100 z-10">重选</button>}
                   </div>
                </div>

                <div className="space-y-4">
                   <span className="text-[10px] uppercase opacity-40 font-bold tracking-widest block px-2">解牌笔记 (Notes)</span>
                   <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="在此记录下你的直觉解读..." className={`w-full h-32 p-6 rounded-3xl border transition-all resize-none text-base leading-relaxed ${isDark ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>

                {formData.id && (
                  <div className={`p-8 rounded-3xl border space-y-6 ${isDark ? 'bg-indigo-900/10 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'}`}>
                    <h3 className="text-sm font-bold font-serif text-indigo-500">✨ 复盘与反馈</h3>
                    <textarea value={formData.actualOutcome} onChange={e => setFormData(p => ({ ...p, actualOutcome: e.target.value }))} placeholder="事后发生了什么？" className={`w-full h-24 p-4 rounded-2xl border transition-all resize-none text-sm ${isDark ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(s => <button key={s} onClick={() => setFormData(p => ({ ...p, accuracyRating: s }))} className={`text-2xl ${formData.accuracyRating >= s ? 'text-amber-500 scale-110' : 'text-slate-600 opacity-30'}`}>★</button>)}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                   <MysticButton variant="secondary" className="flex-1 py-4" onClick={() => setState(p => ({ ...p, currentView: 'home' }))}>取消</MysticButton>
                   <MysticButton className="flex-1 py-4 shadow-indigo-500/40" onClick={handleSaveEntry}>保存记录</MysticButton>
                </div>
              </div>
            </div>
          )}

          {state.currentView === 'detail' && selectedEntry && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-10">
              <div className="flex justify-between items-center no-print">
                <button onClick={() => setState(p => ({ ...p, currentView: 'home' }))} className="text-xs opacity-50 hover:opacity-100 flex items-center gap-2 font-bold">← 返回仪表盘</button>
                <div className="flex gap-3">
                  <button onClick={() => setShowSpreadLabels(!showSpreadLabels)} className={`text-[9px] uppercase font-mystic px-4 py-2 rounded-full transition-all border ${showSpreadLabels ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'}`}>{showSpreadLabels ? '隐藏标签' : '显示标签'}</button>
                  <MysticButton variant="secondary" className="py-2 px-6 text-[10px] uppercase tracking-widest" onClick={() => setIsZenMode(true)}>✨ 专注/分享</MysticButton>
                  <MysticButton variant="secondary" className="py-2 px-6 text-[10px] uppercase tracking-widest" onClick={() => handleEditEntry(selectedEntry)}>复盘/编辑</MysticButton>
                  <MysticButton variant="danger" className="py-2 px-6 text-[10px] uppercase tracking-widest" onClick={() => handleDeleteSingle(selectedEntry.id)}>销毁档案</MysticButton>
                </div>
              </div>
              
              <div className={`p-10 md:p-14 rounded-[2.5rem] border shadow-2xl transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'} print-content`}>
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold font-serif mb-3 leading-tight">{selectedEntry.title || "星迹记录"}</h2>
                    <div className="text-xs opacity-40 font-mono tracking-[0.2em] uppercase">
                      {new Date(selectedEntry.date).toLocaleString()} | {selectedEntry.moonPhase?.name} | {selectedEntry.deckType}
                    </div>
                  </div>
                  {selectedEntry.image && <div className="mb-12 max-w-2xl mx-auto rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl"><img src={selectedEntry.image} className="w-full" /></div>}
                  
                  {/* 牌阵展示区：支持点击 */}
                  <div className="mb-14 w-full flex justify-center">
                    {renderSpreadPreview(SPREAD_LAYOUTS[selectedEntry.deckType].find(l => l.id === selectedEntry.layoutId) || SPREAD_LAYOUTS[selectedEntry.deckType][0], selectedEntry.selectedCards || [], () => {}, showSpreadLabels)}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className={`p-8 rounded-[2rem] border leading-relaxed italic font-serif ${isDark ? 'bg-slate-950/40 border-white/5 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'}`}><h4 className="text-[10px] uppercase opacity-30 mb-6 font-bold tracking-[0.3em]">当时解读</h4><div className="whitespace-pre-wrap text-lg opacity-90 leading-loose">{selectedEntry.notes || "无文字记录。"}</div></div>
                    {(selectedEntry.actualOutcome || selectedEntry.accuracyRating) && <div className={`p-8 rounded-[2rem] border leading-relaxed italic font-serif ${isDark ? 'bg-indigo-900/10 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}><div className="flex justify-between items-start mb-6"><h4 className="text-[10px] uppercase text-indigo-500 font-bold tracking-[0.3em]">复盘反思</h4>{selectedEntry.accuracyRating ? <span className="text-amber-500 text-lg">{'★'.repeat(selectedEntry.accuracyRating)}</span> : null}</div><div className="whitespace-pre-wrap text-lg opacity-90 leading-loose text-indigo-400/80">{selectedEntry.actualOutcome || "暂未填写实际结果。"}</div></div>}
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* 专注模式：宏大布局适配 */}
        {isZenMode && selectedEntry && (
          <div className={`fixed inset-0 z-[400] flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 animate-in fade-in duration-500 ${isDark ? 'bg-slate-950' : 'bg-slate-100'} no-print overflow-hidden`}>
            <div className="absolute top-8 right-8 flex gap-4 z-[410]">
              <button onClick={() => setShowSpreadLabels(!showSpreadLabels)} className={`text-[11px] uppercase font-mystic px-6 py-2.5 rounded-full transition-all border ${showSpreadLabels ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/10 text-indigo-300 border-white/20'}`}>{showSpreadLabels ? '隐藏标签' : '显示标签'}</button>
              <button onClick={() => setIsZenMode(false)} className="text-4xl opacity-40 hover:opacity-100 transition-opacity">✕</button>
            </div>
            <div className="w-full max-w-7xl h-full flex flex-col justify-center items-center overflow-y-auto py-24 no-scrollbar">
              <h2 className="text-4xl sm:text-6xl font-bold font-serif mb-16 sm:mb-24 text-center tracking-[0.2em]">{selectedEntry.title || "星迹记录"}</h2>
              <div className="w-full flex justify-center items-center">
                {renderSpreadPreview(SPREAD_LAYOUTS[selectedEntry.deckType].find(l => l.id === selectedEntry.layoutId) || SPREAD_LAYOUTS[selectedEntry.deckType][0], selectedEntry.selectedCards || [], () => {}, showSpreadLabels, true)}
              </div>
              <p className="text-[12px] opacity-10 uppercase tracking-[0.8em] animate-pulse mt-16 sm:mt-32">点击卡牌查看寓意 • 仪式神圣</p>
            </div>
          </div>
        )}
      </main>

      {/* 选牌浮层 */}
      {showPicker && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 no-print">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowPicker(false)}></div>
          <div className={`relative w-full max-w-5xl h-[85vh] rounded-[2.5rem] border shadow-2xl flex flex-col overflow-hidden ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/10"><h3 className="text-xl font-mystic text-indigo-400">选择卡牌 🎴</h3><button onClick={() => setShowPicker(false)} className="text-3xl opacity-30 hover:opacity-100">✕</button></div>
             {formData.deckType === DeckType.TAROT && <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 bg-black/20">{Object.keys(TAROT_CARDS).map((tab) => <button key={tab} onClick={() => setActiveTarotTab(tab as any)} className={`flex-shrink-0 px-6 md:px-8 py-4 text-[10px] font-bold uppercase transition-all whitespace-nowrap ${activeTarotTab === tab ? 'text-indigo-400 border-indigo-500' : 'opacity-20 hover:opacity-60'}`}>{tab === 'major' ? '大阿卡纳' : tab === 'wands' ? '权杖' : tab === 'cups' ? '圣杯' : tab === 'swords' ? '宝剑' : '星币'}</button>)}</div>}
             <div className="flex-1 overflow-y-auto p-6 md:p-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8 custom-scrollbar">
                {(formData.deckType === DeckType.TAROT ? TAROT_CARDS[activeTarotTab] : LENORMAND_CARDS).map(name => {
                  const sel = formData.selectedCards.find(c => c.name === name);
                  return (
                    <div key={name} onClick={() => sel ? setFormData(p => ({ ...p, selectedCards: p.selectedCards.filter(c => c.name !== name) })) : setFormData(p => ({ ...p, selectedCards: [...p.selectedCards, { name, isReversed: false }] }))} className={`relative cursor-pointer transition-all ${sel ? 'scale-105 z-10' : 'opacity-50 hover:opacity-100'}`}>
                       <CardBack type={formData.deckType} name={name} isReversed={sel?.isReversed} color={formData.lenormandColor} theme={state.theme} showDetailsOnHover={true} />
                       {sel && <div className="absolute inset-0 border-4 border-indigo-500 rounded-xl pointer-events-none z-20"></div>}
                       {sel && formData.deckType === DeckType.TAROT && <button onClick={e => { e.stopPropagation(); setFormData(p => ({ ...p, selectedCards: p.selectedCards.map(c => c.name === name ? {...c, isReversed: !c.isReversed} : c) })) }} className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-[8px] px-3 py-1 rounded-full font-bold z-30">{sel.isReversed ? '逆' : '正'}</button>}
                    </div>
                  );
                })}
             </div>
             <div className="p-8 border-t border-white/5 flex justify-end bg-black/10"><MysticButton onClick={() => setShowPicker(false)}>确定 ({formData.selectedCards.length})</MysticButton></div>
          </div>
        </div>
      )}
      {activeInfoCard && <CardInfoModal cardName={activeInfoCard.name} type={selectedEntry?.deckType || formData.deckType} isReversed={activeInfoCard.isReversed} onClose={() => setActiveInfoCard(null)} theme={state.theme} />}
    </div>
  );
};

export default App;