import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DeckType, ReadingEntry, AppState, SelectedCard, ThemeMode, LenormandColor } from './types';
import { loadEntries, saveEntries } from './services/storage';
import { MysticButton } from './components/MysticButton';
import { TAROT_CARDS, LENORMAND_CARDS, TAROT_DETAILS, LENORMAND_DETAILS } from './constants/cards';
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
// 子组件：卡牌显示
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
    <div className={`relative transition-all duration-500 ease-in-out ${rotationClass} ${compact ? 'w-full h-full' : 'w-full aspect-[2/3]'} rounded-xl overflow-hidden shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-stone-300'} group bg-slate-900`}>
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

      {onInfoClick && !compact && !zenMode && (
        <button onClick={onInfoClick} className="absolute top-2 right-2 w-6 h-6 bg-black/40 hover:bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white backdrop-blur-md transition-colors z-10">i</button>
      )}
    </div>
  );
};

const CardInfoModal: React.FC<{ cardName: string; type: DeckType; isReversed?: boolean; onClose: () => void; theme: ThemeMode }> = ({ cardName, type, isReversed, onClose, theme }) => {
  const details = type === DeckType.TAROT ? TAROT_DETAILS[cardName] : LENORMAND_DETAILS[cardName];
  if (!details) return null;
  const isDark = theme === 'dark';
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className={`relative ${isDark ? 'bg-slate-900 border-indigo-500/30' : 'bg-white border-stone-200'} border w-full max-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200`}>
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

  // 首页子视图切换
  const [homeSubView, setHomeSubView] = useState<'recent' | 'archive'>('recent');
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // 专注模式状态
  const [isZenMode, setIsZenMode] = useState(false);

  // 批量管理与单选删除相关状态
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
    readingDate: getLocalISOString(new Date())
  });

  useEffect(() => {
    const data = loadEntries();
    setState(prev => ({ ...prev, entries: data }));
  }, []);

  const isDark = state.theme === 'dark';
  const selectedEntry = state.entries.find(e => e.id === state.selectedEntryId);

  // 仪表盘统计
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
    const sortedDates = Object.keys(dailyCounts).sort().slice(-10);
    const trendValues = sortedDates.map(d => dailyCounts[d]);

    return { total: entries.length, topCardNames, topCardValues, sortedDates, trendValues };
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
      xAxis: { type: 'category', data: dashboardStats.sortedDates, axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } } },
      series: [{ data: dashboardStats.trendValues, type: 'line', smooth: true, itemStyle: { color: '#f59e0b' }, areaStyle: { opacity: 0.1 } }],
      grid: { top: 20, bottom: 40, left: 30, right: 10 }
    });

    return () => { bar.dispose(); line.dispose(); };
  }, [state.currentView, isDark, dashboardStats]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return state.entries.filter(e => {
      const matchesSearch = e.notes.toLowerCase().includes(query) || 
                          (e.title && e.title.toLowerCase().includes(query)) ||
                          (e.tag && e.tag.includes(query)) ||
                          e.selectedCards?.some(c => c.name.toLowerCase().includes(query));
      const matchesType = typeFilter === 'ALL' || e.deckType === typeFilter;
      const matchesTag = activeTagFilter === '全部' || e.tag === activeTagFilter;
      return matchesSearch && matchesType && matchesTag;
    });
  }, [state.entries, searchQuery, typeFilter, activeTagFilter]);

  // 根据子视图(近期/归档)处理展示数据
  const displayData = useMemo(() => {
    if (homeSubView === 'recent') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return filteredEntries.filter(e => new Date(e.date).getTime() > sevenDaysAgo);
    } else {
      // 归档视图：按月分组
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
    const newEntry: ReadingEntry = {
      id: formData.id || Date.now().toString(),
      date: d.toISOString(),
      deckType: formData.deckType,
      title: formData.title || "未命名记录",
      image: formData.image, 
      notes: formData.notes, 
      selectedCards: formData.selectedCards,
      lenormandColor: formData.lenormandColor, 
      tag: formData.tag,
      font: formData.font,
      moonPhase: getMoonPhase(d)
    };
    
    let updated: ReadingEntry[];
    if (formData.id) {
      updated = state.entries.map(e => e.id === formData.id ? newEntry : e);
    } else {
      updated = [newEntry, ...state.entries];
    }
    
    setState(prev => ({ ...prev, entries: updated, currentView: 'home' }));
    saveEntries(updated);
    setFormData({ id: undefined, deckType: DeckType.TAROT, title: '', image: '', notes: '', selectedCards: [], lenormandColor: 'default', tag: undefined, font: 'font-serif', readingDate: getLocalISOString(new Date()) });
  };

  const handleEditEntry = (entry: ReadingEntry) => {
    setFormData({
      id: entry.id,
      deckType: entry.deckType,
      title: entry.title || '',
      image: entry.image || '',
      notes: entry.notes || '',
      selectedCards: entry.selectedCards || [],
      lenormandColor: entry.lenormandColor || 'default',
      tag: entry.tag,
      font: entry.font || 'font-serif',
      readingDate: getLocalISOString(new Date(entry.date))
    });
    setState(prev => ({ ...prev, currentView: 'create' }));
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(monthKey)) next.delete(monthKey);
      else next.add(monthKey);
      return next;
    });
  };

  // --- 抽离核心删除逻辑 ---
  const applyDeletion = (updated: ReadingEntry[]) => {
    saveEntries(updated);
    setState(prev => ({
      ...prev,
      entries: updated,
      // 如果当前正在查看已删除的项，切回首页
      currentView: (prev.selectedEntryId && !updated.find(e => e.id === prev.selectedEntryId)) ? 'home' : prev.currentView,
      selectedEntryId: (prev.selectedEntryId && !updated.find(e => e.id === prev.selectedEntryId)) ? undefined : prev.selectedEntryId
    }));
  };

  const handleDeleteSingle = (id: string) => {
    if (window.confirm("确定要永久删除这条启示记录吗？")) {
      const updated = state.entries.filter(e => e.id !== id);
      applyDeletion(updated);
    }
  };

  const handleBulkDelete = () => {
    if (selectedEntryIds.size === 0) return;
    if (window.confirm(`确定要永久删除选中的 ${selectedEntryIds.size} 条记录吗？`)) {
      const updated = state.entries.filter(e => !selectedEntryIds.has(e.id));
      applyDeletion(updated);
      setSelectedEntryIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const toggleSelectEntry = (id: string) => {
    setSelectedEntryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- 随机抽牌功能实现 ---
  const handleRandomDraw = (count: number) => {
    const isTarot = formData.deckType === DeckType.TAROT;
    const pool = isTarot ? Object.keys(TAROT_DETAILS) : Object.keys(LENORMAND_DETAILS);
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const drawn = shuffled.slice(0, count).map(name => ({
      name,
      isReversed: isTarot ? Math.random() > 0.5 : false
    }));

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
        const importedData = JSON.parse(content) as ReadingEntry[];
        if (Array.isArray(importedData)) {
          if (confirm(`确定要从备份中恢复 ${importedData.length} 条记录吗？这会覆盖当前的本地记录。`)) {
            setState(prev => ({ ...prev, entries: importedData }));
            saveEntries(importedData);
            alert("恢复成功！");
          }
        } else {
          alert("无效的备份文件格式。");
        }
      } catch (err) {
        alert("导入失败：文件可能已损坏。");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const exportToCSV = () => {
    const headers = ["日期", "标题", "类型", "标签", "月相", "牌面", "笔记"];
    const rows = filteredEntries.map(e => [
      new Date(e.date).toLocaleString(),
      e.title || "未命名",
      e.deckType,
      e.tag || "",
      e.moonPhase?.name || "",
      e.selectedCards?.map(c => c.name + (c.isReversed ? "(逆)" : "")).join('; ') || "",
      e.notes.replace(/"/g, '""')
    ].map(v => `"${v}"`).join(','));
    const csv = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MysticJournal_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  // 渲染首页单张卡片
  const renderEntryCard = (entry: ReadingEntry) => {
    const isSelected = selectedEntryIds.has(entry.id);
    return (
      <div 
        key={entry.id} 
        onClick={() => {
          if (isSelectionMode) {
            toggleSelectEntry(entry.id);
          } else {
            setState(p => ({ ...p, currentView: 'detail', selectedEntryId: entry.id }));
          }
        }} 
        onDoubleClick={(e) => {
          if (!isSelectionMode) {
            e.stopPropagation();
            setState(p => ({ ...p, currentView: 'detail', selectedEntryId: entry.id }));
            setIsZenMode(true);
          }
        }}
        className={`relative rounded-2xl border overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 group ${isDark ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-100 shadow-sm'} ${isSelectionMode && isSelected ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-slate-950' : ''}`}
      >
        {/* 选择模式下的勾选框 */}
        {isSelectionMode && (
          <div className="absolute top-3 left-3 z-40 w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center bg-black/20 backdrop-blur-md">
            {isSelected && <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>}
          </div>
        )}

        {/* 显眼的删除按钮 - 单独浮层确保点击 */}
        {!isSelectionMode && (
          <div className="absolute top-2 left-2 z-[100] opacity-0 group-hover:opacity-100 transition-opacity no-print">
             <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleDeleteSingle(entry.id);
                }}
                className="w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white rounded-full shadow-2xl transform hover:scale-110 transition-transform"
                title="删除记录"
              >
                <span className="text-[14px]">🗑️</span>
              </button>
          </div>
        )}

        <div className="h-44 relative bg-slate-950/20 flex items-center justify-center p-4 overflow-hidden">
          {entry.image ? (
            <img src={entry.image} className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105 pointer-events-none" />
          ) : (
            <div className="flex justify-center items-center w-full px-4 pointer-events-none">
              {entry.selectedCards?.slice(0,3).map((c,i) => (
                <div key={i} className="w-14 h-20 -mx-4 transition-transform duration-500 group-hover:-translate-y-2" style={{ zIndex: 10 - i }}>
                  <CardBack type={entry.deckType} name={c.name} isReversed={c.isReversed} color={entry.lenormandColor} compact theme={state.theme} />
                </div>
              ))}
            </div>
          )}
          <div className="absolute top-3 right-3 text-xl bg-black/30 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-md shadow-lg pointer-events-none">{entry.moonPhase?.emoji}</div>
          {entry.tag && <div className="absolute bottom-3 left-3 bg-indigo-600/80 backdrop-blur-md text-[9px] px-2 py-0.5 rounded-full text-white shadow-md uppercase tracking-wider pointer-events-none">{entry.tag}</div>}
        </div>
        <div className="p-5 pointer-events-none">
          <div className="flex justify-between items-center mb-1">
             <h4 className="text-sm font-bold font-serif truncate flex-1 pr-2">{entry.title || "记录档案"}</h4>
             <span className="text-[10px] font-mystic text-indigo-500 uppercase tracking-widest">{entry.deckType === DeckType.TAROT ? 'Tarot' : 'Lenor'}</span>
          </div>
          <div className="text-[10px] opacity-40 mb-2 font-mono">{new Date(entry.date).toLocaleDateString()}</div>
          <p className={`text-sm italic line-clamp-2 opacity-80 leading-relaxed font-serif`}>{entry.notes || "一段未被捕捉的觉醒时刻..."}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'} transition-colors duration-500`}>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-content {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          main {
            padding: 0 !important;
          }
          .max-w-4xl {
            max-width: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* 侧边栏 */}
      <aside className={`hidden md:flex flex-col w-64 border-r sticky top-0 h-screen ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} p-6 no-print`}>
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-mystic tracking-tighter text-indigo-500 uppercase">Mystic Journal</h1>
          <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Archive of Symbols & Whispers</p>
        </div>
        <nav className="flex-1 space-y-4">
          <button onClick={() => setState(p => ({ ...p, currentView: 'home' }))} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${state.currentView === 'home' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-indigo-500/10 opacity-70'}`}>
            <span>🏠</span> 仪表盘
          </button>
          <button onClick={() => { setFormData({ id: undefined, deckType: DeckType.TAROT, title: '', image: '', notes: '', selectedCards: [], lenormandColor: 'default', tag: undefined, font: 'font-serif', readingDate: getLocalISOString(new Date()) }); setState(p => ({ ...p, currentView: 'create' })); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${state.currentView === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-indigo-500/10 opacity-70'}`}>
            <span>🎴</span> 抽牌记录
          </button>
        </nav>
        <button onClick={toggleTheme} className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
          {isDark ? '🌙 深邃模式' : '☀️ 纯净模式'}
        </button>
      </aside>

      {/* 主区域 */}
      <main className="flex-1 overflow-x-hidden">
        <header className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-[100] no-print">
           <h1 className="text-xl font-mystic text-indigo-500 uppercase">Mystic Journal</h1>
           <button onClick={toggleTheme}>{isDark ? '🌙' : '☀️'}</button>
        </header>

        <div className="max-w-6xl mx-auto p-6 md:p-10 pb-32">
          
          {/* 首页视图 */}
          {state.currentView === 'home' && (
            <div className="animate-in fade-in duration-700 space-y-10">
              <div className="text-center md:hidden mb-6 no-print">
                 <h2 className="text-3xl font-mystic uppercase tracking-widest text-indigo-500">Mystic Journal</h2>
                 <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Archive of Symbols & Whispers</p>
              </div>

              {/* 数据看板统计区域 */}
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
                    <div className="text-[10px] opacity-40 uppercase tracking-widest mt-1 font-bold">高频牌 ({dashboardStats.topCardValues[0] || 0}次)</div>
                  </div>
                </div>
              </div>

              {state.entries.length > 0 && (
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6`}>
                  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
                     <h3 className="text-[10px] font-mystic uppercase opacity-40 mb-4 tracking-widest text-center">高频牌分布 (TOP 5)</h3>
                     <div ref={barChartRef} className="h-48 w-full"></div>
                  </div>
                  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
                     <h3 className="text-[10px] font-mystic uppercase opacity-40 mb-4 tracking-widest text-center">历史趋势 & 累计</h3>
                     <div ref={lineChartRef} className="h-48 w-full"></div>
                  </div>
                </div>
              )}

              {/* 搜索与工具栏 */}
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="检索记录、标签或牌名..." className={`w-full py-4 px-12 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200'}`} />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xl pointer-events-none">🔍</span>
                  </div>

                  {/* 备份与导出功能按钮组 (JSON/CSV) */}
                  <div className="flex gap-2 no-print shrink-0">
                    <button onClick={exportToCSV} title="导出 CSV" className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${isDark ? 'bg-slate-900/40 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <span>📊</span> CSV
                    </button>
                    <button onClick={exportBackup} title="导出 JSON 备份" className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${isDark ? 'bg-slate-900/40 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <span>📦</span> JSON
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} title="导入 JSON 备份" className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${isDark ? 'bg-slate-900/40 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <span>📥</span>
                      <input type="file" ref={fileInputRef} onChange={importBackup} accept=".json" className="hidden" />
                    </button>
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
                      <MysticButton variant="secondary" onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedEntryIds(new Set()); }}>
                        {isSelectionMode ? '取消选择' : '批量管理'}
                      </MysticButton>
                      {!isSelectionMode && (
                        <MysticButton onClick={() => { setFormData({ id: undefined, deckType: DeckType.TAROT, title: '', image: '', notes: '', selectedCards: [], lenormandColor: 'default', tag: undefined, font: 'font-serif', readingDate: getLocalISOString(new Date()) }); setState(p => ({ ...p, currentView: 'create' })); }}>+ 启程抽牌</MysticButton>
                      )}
                      {isSelectionMode && selectedEntryIds.size > 0 && (
                        <MysticButton variant="danger" onClick={handleBulkDelete}>删除选中 ({selectedEntryIds.size})</MysticButton>
                      )}
                   </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {['全部', ...PRESET_TAGS].map(tag => (
                    <button key={tag} onClick={() => setActiveTagFilter(tag)} className={`px-5 py-2 rounded-full text-xs transition-all whitespace-nowrap border ${activeTagFilter === tag ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-900/40 border-white/5 opacity-40 hover:opacity-100'}`}>{tag}</button>
                  ))}
                </div>

                <div className="flex border-b border-white/5 mb-6">
                  <button onClick={() => setHomeSubView('recent')} className={`px-8 py-4 text-xs uppercase tracking-widest font-mystic transition-all border-b-2 ${homeSubView === 'recent' ? 'text-indigo-400 border-indigo-500' : 'opacity-30 border-transparent hover:opacity-60'}`}>近期 (LAST 7 DAYS)</button>
                  <button onClick={() => setHomeSubView('archive')} className={`px-8 py-4 text-xs uppercase tracking-widest font-mystic transition-all border-b-2 ${homeSubView === 'archive' ? 'text-indigo-400 border-indigo-500' : 'opacity-30 border-transparent hover:opacity-60'}`}>归档 (MONTHLY ARCHIVE)</button>
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

          {/* 录入视图 - 恢复标签选择及日期时间选择 */}
          {state.currentView === 'create' && (
            <div className={`max-w-3xl mx-auto p-10 rounded-[2.5rem] border shadow-2xl animate-in zoom-in-95 duration-500 ${isDark ? 'bg-slate-900/80 border-white/5 shadow-indigo-500/10' : 'bg-white border-slate-200'}`}>
              <div className="mb-10 text-center">
                 <h2 className="text-3xl font-serif font-bold mb-2">{formData.id ? '修正星迹' : '捕捉启示'}</h2>
                 <p className="text-xs opacity-50 uppercase tracking-[0.3em] font-mystic">Intuition Recording</p>
              </div>
              <div className="space-y-10">
                {/* 核心类型切换 */}
                <div className="flex p-1 bg-slate-950/20 rounded-2xl gap-2 border border-white/5">
                  {[DeckType.TAROT, DeckType.LENORMAND].map(t => (
                    <button key={t} onClick={() => setFormData(p => ({ ...p, deckType: t, selectedCards: [] }))} className={`flex-1 py-3 rounded-xl transition-all font-mystic text-sm uppercase tracking-widest ${formData.deckType === t ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>{t}</button>
                  ))}
                </div>

                {/* 恢复日期选择功能 */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase opacity-40 font-bold tracking-widest block px-2">启示时刻 (Time)</label>
                  <input 
                    type="datetime-local" 
                    value={formData.readingDate} 
                    onChange={e => setFormData(p => ({ ...p, readingDate: e.target.value }))}
                    className={`w-full p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                  />
                </div>

                {/* 标签快速选择 */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase opacity-40 font-bold tracking-widest block px-2">分类标签 (Tags)</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TAGS.map(tag => (
                      <button 
                        key={tag} 
                        onClick={() => setFormData(p => ({ ...p, tag: p.tag === tag ? undefined : tag }))}
                        className={`px-4 py-2 rounded-full text-xs border transition-all ${formData.tag === tag ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950/20 border-white/5 opacity-60 hover:opacity-100'}`}
                      >
                        {tag}
                      </button>
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
                     <button onClick={() => handleRandomDraw(1)} className="text-[9px] uppercase font-mystic bg-indigo-600/20 hover:bg-indigo-600/40 px-3 py-1 rounded-full transition-all border border-indigo-500/20">✨ 随机1张</button>
                     <button onClick={() => handleRandomDraw(3)} className="text-[9px] uppercase font-mystic bg-indigo-600/20 hover:bg-indigo-600/40 px-3 py-1 rounded-full transition-all border border-indigo-500/20">✨ 随机3张</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div onClick={() => document.getElementById('cam')?.click()} className="aspect-square border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all overflow-hidden relative">
                      {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <><span className="text-4xl mb-3 opacity-20">📷</span><p className="text-[10px] uppercase opacity-40 font-bold tracking-widest">上传实拍</p></>}
                      <input id="cam" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onloadend = () => setFormData(p => ({ ...p, image: r.result as string })); r.readAsDataURL(f); } }} />
                   </div>
                   <div onClick={() => setShowPicker(true)} className="aspect-square border border-white/5 rounded-3xl flex flex-wrap items-center justify-center gap-2 p-6 cursor-pointer bg-slate-950/20 hover:bg-slate-950/40 transition-all overflow-hidden relative">
                      {formData.selectedCards.length > 0 ? (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {formData.selectedCards.map((c,i) => (
                            <div key={i} className="w-10 h-14 shadow-lg relative group">
                              <CardBack type={formData.deckType} name={c.name} isReversed={c.isReversed} color={formData.lenormandColor} compact theme={state.theme} />
                            </div>
                          ))}
                        </div>
                      ) : <div className="text-center opacity-40"><p className="text-2xl mb-2">🎴</p><p className="text-[10px] uppercase font-bold tracking-widest">手动标记</p></div>}
                   </div>
                </div>

                <div className="space-y-4">
                   <span className="text-[10px] uppercase opacity-40 font-bold tracking-widest block px-2">解牌笔记 (Notes)</span>
                   <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="在此记录下你的直觉解读..." className={`w-full h-48 p-6 rounded-3xl border transition-all resize-none text-base leading-relaxed ${isDark ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>

                <div className="flex gap-4 pt-6">
                   <MysticButton variant="secondary" className="flex-1 py-4" onClick={() => setState(p => ({ ...p, currentView: 'home' }))}>取消</MysticButton>
                   <MysticButton className="flex-1 py-4 shadow-indigo-500/40" onClick={handleSaveEntry}>保存记录</MysticButton>
                </div>
              </div>
            </div>
          )}

          {/* 详情视图 - 优化卡牌居中 */}
          {state.currentView === 'detail' && selectedEntry && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-10">
              <div className="flex justify-between items-center no-print">
                <button onClick={() => setState(p => ({ ...p, currentView: 'home' }))} className="text-xs opacity-50 hover:opacity-100 flex items-center gap-2 transition-all group font-bold">
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> 返回仪表盘
                </button>
                <div className="flex gap-3">
                  <MysticButton variant="secondary" className="py-2 px-6 text-[10px] uppercase tracking-widest" onClick={() => setIsZenMode(true)}>✨ 专注/分享</MysticButton>
                  <MysticButton variant="secondary" className="py-2 px-6 text-[10px] uppercase tracking-widest" onClick={() => handleEditEntry(selectedEntry)}>编辑</MysticButton>
                  <MysticButton 
                    variant="danger" 
                    className="py-2 px-6 text-[10px] uppercase tracking-widest" 
                    onClick={() => handleDeleteSingle(selectedEntry.id)}
                  >
                    销毁档案
                  </MysticButton>
                </div>
              </div>
              
              <div className={`p-10 md:p-14 rounded-[2.5rem] border shadow-2xl transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'} print-content`}>
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold font-serif mb-3 leading-tight text-center w-full">{selectedEntry.title || "星迹记录"}</h2>
                    <div className="text-xs opacity-40 font-mono tracking-[0.2em] uppercase text-center w-full">
                      {new Date(selectedEntry.date).toLocaleString()} | {selectedEntry.moonPhase?.name} | {selectedEntry.deckType}
                    </div>
                  </div>

                  {selectedEntry.image && (
                    <div className="mb-12 max-w-2xl mx-auto rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                      <img src={selectedEntry.image} className="w-full" />
                    </div>
                  )}

                  {/* 核心改动：使用 flex + justify-center 确保任何数量的卡牌在水平方向上始终居中 */}
                  <div className="mb-14 flex flex-wrap justify-center gap-6 max-w-full mx-auto">
                    {selectedEntry.selectedCards?.map((c,i) => (
                      <div key={i} className="w-[120px] sm:w-[140px] shrink-0 transform hover:scale-105 transition-transform">
                        <CardBack type={selectedEntry.deckType} name={c.name} isReversed={c.isReversed} color={selectedEntry.lenormandColor} onInfoClick={() => setActiveInfoCard(c)} theme={state.theme} />
                      </div>
                    ))}
                  </div>

                  <div className={`p-10 rounded-[2rem] border leading-relaxed italic font-serif ${isDark ? 'bg-slate-950/40 border-white/5 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                    <h4 className="text-[10px] uppercase opacity-30 mb-6 font-bold tracking-[0.3em]">解牌觉察</h4>
                    <div className="whitespace-pre-wrap text-lg opacity-90 leading-loose">{selectedEntry.notes || "无文字记录。"}</div>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* 专注模式 - 优化卡牌居中 */}
        {isZenMode && selectedEntry && (
          <div className={`fixed inset-0 z-[300] flex flex-col items-center justify-center p-10 cursor-pointer animate-in fade-in duration-500 ${isDark ? 'bg-slate-950' : 'bg-slate-100'} no-print`} onClick={() => setIsZenMode(false)}>
            <div className="text-center max-w-5xl w-full">
              <h2 className="text-5xl font-bold font-serif mb-10 text-center">{selectedEntry.title || "星迹记录"}</h2>
              
              {/* 使用 flex justify-center 确保全屏专注模式下卡牌居中 */}
              <div className="flex flex-wrap justify-center items-center gap-8 mb-14 w-full">
                {selectedEntry.selectedCards?.map((c,i) => (
                  <div key={i} className="w-[160px] sm:w-[200px] shrink-0 shadow-2xl"><CardBack type={selectedEntry.deckType} name={c.name} isReversed={c.isReversed} color={selectedEntry.lenormandColor} theme={state.theme} zenMode={true} /></div>
                ))}
              </div>
              <p className="text-xs opacity-20 uppercase tracking-[0.5em] animate-pulse">点击任意处退出</p>
            </div>
          </div>
        )}
      </main>

      {/* 选牌浮层 */}
      {showPicker && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 no-print">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowPicker(false)}></div>
          <div className={`relative w-full max-w-5xl h-[85vh] rounded-[2.5rem] border shadow-2xl flex flex-col overflow-hidden ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
             <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/10">
                <h3 className="text-xl font-mystic text-indigo-400">选择卡牌 🎴</h3>
                <button onClick={() => setShowPicker(false)} className="text-3xl opacity-30 hover:opacity-100">✕</button>
             </div>
             {formData.deckType === DeckType.TAROT && (
               <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 bg-black/20">
                 {Object.keys(TAROT_CARDS).map((tab) => (
                   <button key={tab} onClick={() => setActiveTarotTab(tab as any)} className={`flex-shrink-0 px-6 md:px-8 py-4 text-[10px] font-bold uppercase transition-all whitespace-nowrap ${activeTarotTab === tab ? 'text-indigo-400 border-indigo-500' : 'opacity-20 hover:opacity-60'}`}>
                     {tab === 'major' ? '大阿卡纳' : tab === 'wands' ? '权杖' : tab === 'cups' ? '圣杯' : tab === 'swords' ? '宝剑' : '星币'}
                   </button>
                 ))}
               </div>
             )}
             <div className="flex-1 overflow-y-auto p-6 md:p-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8 custom-scrollbar">
                {(formData.deckType === DeckType.TAROT ? TAROT_CARDS[activeTarotTab] : LENORMAND_CARDS).map(name => {
                  const sel = formData.selectedCards.find(c => c.name === name);
                  return (
                    <div key={name} onClick={() => {
                      if(sel) setFormData(p => ({ ...p, selectedCards: p.selectedCards.filter(c => c.name !== name) }));
                      else setFormData(p => ({ ...p, selectedCards: [...p.selectedCards, { name, isReversed: false }] }));
                    }} className={`relative cursor-pointer transition-all ${sel ? 'scale-105 z-10' : 'opacity-50 hover:opacity-100'}`}>
                       <CardBack type={formData.deckType} name={name} isReversed={sel?.isReversed} color={formData.lenormandColor} theme={state.theme} showDetailsOnHover={true} />
                       {sel && <div className="absolute inset-0 border-4 border-indigo-500 rounded-xl pointer-events-none z-20"></div>}
                       {sel && formData.deckType === DeckType.TAROT && (
                         <button onClick={e => { e.stopPropagation(); setFormData(p => ({ ...p, selectedCards: p.selectedCards.map(c => c.name === name ? {...c, isReversed: !c.isReversed} : c) })) }} className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-[8px] px-3 py-1 rounded-full font-bold z-30">{sel.isReversed ? '逆' : '正'}</button>
                       )}
                    </div>
                  );
                })}
             </div>
             <div className="p-8 border-t border-white/5 flex justify-end bg-black/10">
                <MysticButton onClick={() => setShowPicker(false)}>确定 ({formData.selectedCards.length})</MysticButton>
             </div>
          </div>
        </div>
      )}

      {activeInfoCard && <CardInfoModal cardName={activeInfoCard.name} type={selectedEntry?.deckType || formData.deckType} isReversed={activeInfoCard.isReversed} onClose={() => setActiveInfoCard(null)} theme={state.theme} />}
    </div>
  );
};

export default App;
