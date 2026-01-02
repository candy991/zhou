
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
  return getMoonPhaseFromNormalized(normalized);
};

const getMoonPhaseFromNormalized = (phase: number) => {
  if (phase < 0.0625 || phase > 0.9375) return { name: "新月", emoji: "🌑" };
  if (phase < 0.1875) return { name: "娥眉月", emoji: "🌒" };
  if (phase < 0.3125) return { name: "上弦月", emoji: "🌓" };
  if (phase < 0.4375) return { name: "盈凸月", emoji: "🌔" };
  if (phase < 0.5625) return { name: "满月", emoji: "🌕" };
  if (phase < 0.6875) return { name: "亏凸月", emoji: "🌖" };
  if (phase < 0.8125) return { name: "下弦月", emoji: "🌗" };
  return { name: "残月", emoji: "🌘" };
};

const LENORMAND_THEMES: Record<LenormandColor, string> = {
  default: 'from-slate-900 via-teal-900 to-slate-900',
  water: 'from-blue-900 via-indigo-900 to-blue-950',
  fire: 'from-orange-950 via-red-900 to-stone-950',
  earth: 'from-emerald-950 via-green-900 to-stone-950',
  air: 'from-purple-950 via-violet-900 to-indigo-950',
  spirit: 'from-amber-900 via-yellow-700 to-amber-950'
};

const PRESET_TAGS = ['❤️ 感情', '💰 事业', '🎓 学业', '🧘‍♀️ 灵性', '🏠 生活'];

const CardBack: React.FC<{ 
  type: DeckType; 
  isReversed?: boolean; 
  name: string; 
  compact?: boolean;
  color?: LenormandColor;
  onInfoClick?: (e: React.MouseEvent) => void;
  theme?: ThemeMode;
}> = ({ type, isReversed, name, compact, color = 'default', onInfoClick, theme = 'dark' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const isTarot = type === DeckType.TAROT;
  const rotationClass = isReversed ? 'rotate-180' : 'rotate-0';
  const details = isTarot ? TAROT_DETAILS[name] : LENORMAND_DETAILS[name];
  const imageUrl = details?.imageUrl;
  const emoji = details?.emoji;
  
  const bgGradient = isTarot 
    ? (theme === 'dark' ? 'from-indigo-950 via-purple-900 to-indigo-950' : 'from-amber-100 via-orange-50 to-amber-100')
    : LENORMAND_THEMES[color];

  const textColor = theme === 'dark' ? 'text-indigo-100/80' : 'text-stone-800/80';
  const subTextColor = theme === 'dark' ? 'text-indigo-200/60' : 'text-stone-600/60';
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative transition-all duration-500 ease-in-out ${rotationClass} ${compact ? 'w-16 h-24' : 'w-full aspect-[2/3]'} rounded-lg overflow-hidden shadow-lg border ${theme === 'dark' ? 'border-white/10' : 'border-stone-300'} group bg-slate-900`}
    >
      {!isLoaded && !imgError && imageUrl && (
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} animate-pulse flex flex-col items-center justify-center p-2 text-center`}>
           <div className="opacity-20 text-xs font-mystic mb-1">LOADING</div>
           <div className="text-xl opacity-20">✡</div>
        </div>
      )}

      {(imageUrl && !imgError) ? (
        <img 
          src={imageUrl} 
          alt={name} 
          loading="eager" 
          onLoad={() => setIsLoaded(true)}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} ${theme === 'dark' ? 'grayscale-[0.2] group-hover:grayscale-0' : 'grayscale-0'}`} 
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`}>
          <div className={`absolute inset-0 opacity-10 pointer-events-none`} style={{ backgroundImage: `radial-gradient(circle at center, ${theme === 'dark' ? 'gold' : '#8b4513'} 1px, transparent 1px)`, backgroundSize: '12px 12px' }}></div>
          <div className="absolute inset-1.5 border border-black/5 rounded-md flex flex-col items-center justify-center text-center p-2">
            <div className={`text-[8px] opacity-40 mb-1 font-mystic uppercase tracking-widest ${textColor}`}>{isTarot ? 'Tarot' : 'Lenormand'}</div>
            {emoji ? <div className={`${compact ? 'text-2xl' : 'text-4xl'} mb-1 drop-shadow-md`}>{emoji}</div> : <div className="mt-2 text-xl opacity-30">{isTarot ? '✡' : '❦'}</div>}
            <div className={`font-serif ${compact ? 'text-[7px]' : 'text-[10px]'} font-bold ${textColor} leading-tight mb-0.5`}>{name.split(' ')[0]}</div>
            <div className={`opacity-80 ${compact ? 'text-[6px]' : 'text-[8px]'} ${subTextColor} leading-tight`}>{name.split(' ').slice(1).join(' ')}</div>
          </div>
        </div>
      )}
      
      {isHovered && !compact && isLoaded && (
        <div className={`absolute inset-0 flex flex-col justify-end p-2 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300 z-40`}>
          <div className="p-2 bg-slate-900/90 rounded-lg border border-white/10">
            <div className={`font-bold text-[10px] ${theme === 'dark' ? 'text-indigo-300' : 'text-amber-400'}`}>{details.zh}</div>
            <div className="text-[8px] text-white/70 line-clamp-2 leading-tight mt-1 italic">{details.meaning}</div>
          </div>
        </div>
      )}

      {isReversed && <div className="absolute top-1 left-1 bg-amber-500/90 text-[8px] px-1 rounded text-black font-bold rotate-180 shadow-md z-10">逆位</div>}
      {onInfoClick && !compact && (
        <button onClick={onInfoClick} className={`absolute top-2 right-2 w-7 h-7 bg-black/40 hover:bg-indigo-600 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-xs text-white transition-all z-50 active:scale-90 ${isReversed ? 'rotate-180' : ''}`}>i</button>
      )}
    </div>
  );
};

const CardInfoModal: React.FC<{ cardName: string; type: DeckType; isReversed?: boolean; onClose: () => void; theme: ThemeMode }> = ({ cardName, type, isReversed, onClose, theme }) => {
  const details = type === DeckType.TAROT ? TAROT_DETAILS[cardName] : LENORMAND_DETAILS[cardName];
  if (!details) return null;
  const isDark = theme === 'dark';
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative ${isDark ? 'bg-slate-900 border-indigo-500/30' : 'bg-stone-50 border-stone-300'} border w-full max-w-sm rounded-3xl p-6 shadow-2xl overflow-hidden`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-indigo-500 text-xl transition-transform">✕</button>
        <div className="mb-6">
          <h4 className={`text-[10px] ${isDark ? 'text-indigo-400' : 'text-stone-500'} font-mystic tracking-widest uppercase mb-1`}>{type === DeckType.TAROT ? 'Tarot Archetype' : 'Lenormand Symbol'}</h4>
          <h3 className={`text-2xl ${isDark ? 'text-indigo-100' : 'text-stone-900'} font-serif flex items-center gap-3`}>{details.zh} {details.emoji && <span>{details.emoji}</span>}</h3>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-stone-400'} italic uppercase`}>{details.en}</p>
        </div>
        <div className="space-y-4">
          <h5 className={`text-[10px] ${isDark ? 'text-indigo-300' : 'text-amber-800'} uppercase tracking-widest font-mystic mb-2`}>{isReversed ? '逆位 牌义' : '正位/核心 牌义'}</h5>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-stone-700'} leading-relaxed ${isDark ? 'bg-black/20' : 'bg-stone-200/50'} p-4 rounded-xl border border-white/5`}>{(isReversed && details.reversedMeaning) ? details.reversedMeaning : details.meaning}</p>
        </div>
        <div className="mt-8 flex justify-center"><MysticButton onClick={onClose} variant="secondary" className="text-xs py-1">明白了</MysticButton></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ entries: [], currentView: 'home', theme: 'dark' });
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTarotTab, setActiveTarotTab] = useState<keyof typeof TAROT_CARDS>('major');
  const [activeInfoCard, setActiveInfoCard] = useState<{name: string, isReversed: boolean} | null>(null);
  
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);

  const getLocalISOString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<{ 
    deckType: DeckType; 
    image: string; 
    notes: string; 
    selectedCards: SelectedCard[]; 
    lenormandColor: LenormandColor; 
    tag?: string;
    readingDate: string;
  }>({
    deckType: DeckType.TAROT, 
    image: '', 
    notes: '', 
    selectedCards: [], 
    lenormandColor: 'default', 
    tag: undefined,
    readingDate: getLocalISOString(new Date())
  });

  useEffect(() => {
    const preloadAllImages = async () => {
      const allTarotDetails = Object.values(TAROT_DETAILS);
      const promises = allTarotDetails.map(detail => {
        if (!detail.imageUrl) return Promise.resolve();
        return new Promise((resolve) => {
          const img = new Image();
          img.src = detail.imageUrl!;
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(promises);
    };
    
    preloadAllImages();
    const rawEntries = loadEntries();
    const sanitizedEntries = rawEntries.map(entry => ({
      ...entry,
      tag: entry.tag || undefined,
      selectedCards: entry.selectedCards || [],
      moonPhase: entry.moonPhase || undefined
    }));
    setState(prev => ({ ...prev, entries: sanitizedEntries }));
  }, []);

  const selectedEntry = state.entries.find(e => e.id === state.selectedEntryId);
  const isDark = state.theme === 'dark';

  const dashboardStats = useMemo(() => {
    const entries = state.entries;
    const totalEntries = entries.length;
    const uniqueDays = new Set(entries.map(e => new Date(e.date).toDateString())).size;
    
    const cardCounts: Record<string, number> = {};
    entries.forEach(e => e.selectedCards?.forEach(c => {
      cardCounts[c.name] = (cardCounts[c.name] || 0) + 1;
    }));

    const sortedCards = Object.entries(cardCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const topCardNames = sortedCards.map(([name]) => {
      const detail = TAROT_DETAILS[name] || LENORMAND_DETAILS[name];
      return detail?.zh || name.replace(/^\d+\s/, '');
    });
    const topCardValues = sortedCards.map(([, count]) => count);

    const dailyCounts: Record<string, number> = {};
    entries.forEach(e => {
      const d = new Date(e.date).toISOString().split('T')[0];
      dailyCounts[d] = (dailyCounts[d] || 0) + 1;
    });

    const sortedDates = Object.keys(dailyCounts).sort();
    const trendValues = sortedDates.map(d => dailyCounts[d]);
    
    let cumulative = 0;
    const cumulativeValues = sortedDates.map(d => {
      cumulative += dailyCounts[d];
      return cumulative;
    });

    return { 
      totalEntries, 
      uniqueDays, 
      topCardNames, 
      topCardValues, 
      sortedDates, 
      trendValues,
      cumulativeValues
    };
  }, [state.entries]);

  useEffect(() => {
    if (state.currentView !== 'home') return;

    let barChart: echarts.ECharts | null = null;
    let lineChart: echarts.ECharts | null = null;

    if (barChartRef.current) {
      barChart = echarts.init(barChartRef.current);
      barChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { top: '10%', bottom: '20%', left: '15%', right: '10%' },
        xAxis: { 
          type: 'category', 
          data: dashboardStats.topCardNames,
          axisLabel: { color: isDark ? '#94a3b8' : '#4b5563', fontSize: 10, interval: 0, rotate: 20 },
          axisLine: { lineStyle: { color: isDark ? '#1e293b' : '#e2e8f0' } }
        },
        yAxis: { 
          type: 'value', 
          splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#e2e8f0', type: 'dashed' } },
          axisLabel: { color: isDark ? '#94a3b8' : '#4b5563', fontSize: 10 }
        },
        series: [{
          data: dashboardStats.topCardValues,
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#6366f1' },
              { offset: 1, color: '#a855f7' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '50%'
        }]
      });
    }

    if (lineChartRef.current) {
      lineChart = echarts.init(lineChartRef.current);
      lineChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { 
          data: ['每日抽牌', '累计记录'], 
          textStyle: { color: isDark ? '#94a3b8' : '#4b5563', fontSize: 10 },
          bottom: 0
        },
        grid: { top: '15%', bottom: '25%', left: '15%', right: '10%' },
        xAxis: { 
          type: 'category', 
          data: dashboardStats.sortedDates,
          axisLabel: { color: isDark ? '#94a3b8' : '#4b5563', fontSize: 9 },
          axisLine: { lineStyle: { color: isDark ? '#1e293b' : '#e2e8f0' } }
        },
        yAxis: { 
          type: 'value',
          splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#e2e8f0', type: 'dashed' } },
          axisLabel: { color: isDark ? '#94a3b8' : '#4b5563', fontSize: 10 }
        },
        series: [
          {
            name: '每日抽牌',
            data: dashboardStats.trendValues,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            itemStyle: { color: '#f59e0b' },
            areaStyle: { opacity: 0.1 }
          },
          {
            name: '累计记录',
            data: dashboardStats.cumulativeValues,
            type: 'line',
            smooth: true,
            itemStyle: { color: '#6366f1' }
          }
        ]
      });
    }

    const handleResize = () => {
      barChart?.resize();
      lineChart?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      barChart?.dispose();
      lineChart?.dispose();
    };
  }, [state.currentView, isDark, dashboardStats]);

  const timeCapsuleEntry = useMemo(() => {
    const today = new Date();
    return state.entries.find(entry => {
      const entryDate = new Date(entry.date);
      const isOneYearAgo = entryDate.getFullYear() === today.getFullYear() - 1 && 
                           entryDate.getMonth() === today.getMonth() && 
                           entryDate.getDate() === today.getDate();
      const isOneMonthAgo = (entryDate.getFullYear() === today.getFullYear() || (entryDate.getMonth() === 11 && today.getMonth() === 0)) &&
                            ((entryDate.getMonth() + 1) % 12 === today.getMonth()) &&
                            entryDate.getDate() === today.getDate();
      return isOneYearAgo || isOneMonthAgo;
    });
  }, [state.entries]);

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const handleVirtualDraw = () => {
    const isTarot = formData.deckType === DeckType.TAROT;
    const keys = isTarot ? Object.keys(TAROT_DETAILS) : Object.keys(LENORMAND_DETAILS);
    const randomName = keys[Math.floor(Math.random() * keys.length)];
    const isReversed = isTarot ? Math.random() < 0.5 : false;
    
    setFormData(prev => ({
      ...prev,
      selectedCards: [{ name: randomName, isReversed }]
    }));
  };

  const filteredEntries = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return state.entries.filter(e => 
      e.notes.toLowerCase().includes(query) || 
      e.tag?.toLowerCase().includes(query) ||
      e.selectedCards?.some(c => c.name.toLowerCase().includes(query))
    );
  }, [state.entries, searchQuery]);

  const handleSaveEntry = () => {
    const dateToSave = new Date(formData.readingDate);
    const newEntry: ReadingEntry = {
      id: Date.now().toString(), 
      date: dateToSave.toISOString(), 
      deckType: formData.deckType,
      image: formData.image, 
      notes: formData.notes, 
      selectedCards: formData.selectedCards,
      lenormandColor: formData.lenormandColor, 
      tag: formData.tag,
      moonPhase: getMoonPhase(dateToSave)
    };
    const updated = [newEntry, ...state.entries];
    setState(prev => ({ ...prev, entries: updated, currentView: 'home' }));
    saveEntries(updated);
    setFormData({ 
      deckType: DeckType.TAROT, 
      image: '', 
      notes: '', 
      selectedCards: [], 
      lenormandColor: 'default', 
      tag: undefined,
      readingDate: getLocalISOString(new Date())
    });
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(state.entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mystic_journal_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (filteredEntries.length === 0) return alert("当前视图无数据可导出。");
    const headers = ["日期", "类型", "问题(标签)", "月相", "抽到的牌", "笔记/心得"];
    const rows = filteredEntries.map(entry => {
      const date = formatFullDate(entry.date);
      const type = entry.deckType === DeckType.TAROT ? "塔罗" : "雷诺曼";
      const problem = entry.tag || "";
      const moon = entry.moonPhase ? `${entry.moonPhase.emoji} ${entry.moonPhase.name}` : "";
      const cards = entry.selectedCards?.map(c => {
        const detail = entry.deckType === DeckType.TAROT ? TAROT_DETAILS[c.name] : LENORMAND_DETAILS[c.name];
        const cardName = detail?.zh || c.name.replace(/^\d+\s/, '');
        return cardName + (c.isReversed ? "(逆位)" : "");
      }).join('; ') || "";
      const notes = entry.notes.replace(/"/g, '""');
      return [date, type, problem, moon, cards, notes].map(field => `"${field}"`).join(',');
    });
    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mystic_journal_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported: ReadingEntry[] = JSON.parse(event.target?.result as string);
        const sanitized = imported.map(entry => ({
          ...entry,
          tag: entry.tag || undefined,
          selectedCards: entry.selectedCards || [],
          moonPhase: entry.moonPhase || undefined
        }));
        if (confirm(`准备导入 ${sanitized.length} 条记录，这会合并到现有记录中。确信继续吗？`)) {
          const combined = [...sanitized, ...state.entries];
          const uniqueCombined = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
          setState(prev => ({ ...prev, entries: uniqueCombined }));
          saveEntries(uniqueCombined);
        }
      } catch (err) {
        alert("文件格式有误，导入失败。");
      }
    };
    reader.readAsText(file);
  };

  const formatFullDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-24 ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-stone-100 text-stone-900'}`}>
      <header className={`p-6 text-center border-b ${isDark ? 'border-indigo-900/30 bg-slate-900/50' : 'border-stone-300 bg-white/50'} backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-10`}>
        <div className="w-10"></div>
        <div>
          <h1 className={`text-3xl font-mystic tracking-widest ${isDark ? 'text-indigo-200' : 'text-stone-800'}`}>MYSTIC JOURNAL</h1>
          <p className={`text-[10px] ${isDark ? 'text-indigo-400/60' : 'text-stone-500'} mt-1 uppercase tracking-[0.2em]`}>Archive of Symbols & Whispers</p>
        </div>
        <button onClick={toggleTheme} title={isDark ? "切换白天模式" : "切换夜间模式"} className={`p-2 rounded-full border transition-all ${isDark ? 'border-indigo-500/30 text-indigo-400 bg-indigo-950/40' : 'border-stone-300 text-stone-600 bg-white'}`}>
          {isDark ? '🌙' : '☀️'}
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {state.currentView === 'home' && timeCapsuleEntry && (
          <div className={`mb-8 p-6 rounded-2xl border ${isDark ? 'bg-indigo-900/20 border-amber-500/40' : 'bg-white border-amber-400 shadow-lg'} animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden group cursor-pointer`} onClick={() => setState(prev => ({ ...prev, currentView: 'detail', selectedEntryId: timeCapsuleEntry.id }))}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h3 className={`text-sm font-mystic tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>时光胶囊 · 那年今日</h3>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>回顾过往的星迹记录...</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-2">
                {timeCapsuleEntry.selectedCards?.slice(0, 3).map((c, i) => (
                  <div key={i} className="scale-50 origin-left"><CardBack type={timeCapsuleEntry.deckType} name={c.name} isReversed={c.isReversed} compact theme={state.theme} /></div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-serif italic truncate ${isDark ? 'text-slate-200' : 'text-stone-700'}`}>“{timeCapsuleEntry.notes || "无言的指引。"}”</p>
                <p className="text-[9px] mt-1 opacity-50 uppercase font-mystic">{formatFullDate(timeCapsuleEntry.date)}</p>
              </div>
            </div>
          </div>
        )}

        {state.currentView === 'home' && (
          <div className={`${isDark ? 'bg-slate-900/60 border-amber-500/20' : 'bg-white border-stone-200 shadow-sm'} border backdrop-blur-lg rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500`}>
            <div className="flex flex-col md:flex-row justify-around items-center gap-6 mb-8">
              <div className="text-center group">
                <div className="text-amber-400 font-mystic font-bold text-3xl group-hover:scale-110 transition-transform">{dashboardStats.uniqueDays}</div>
                <div className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>坚持天数</div>
              </div>
              <div className={`h-10 w-px ${isDark ? 'bg-amber-500/20' : 'bg-stone-200'} hidden md:block`}></div>
              <div className="text-center group">
                <div className="text-amber-400 font-mystic font-bold text-3xl group-hover:scale-110 transition-transform">{dashboardStats.totalEntries}</div>
                <div className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>总记录数</div>
              </div>
              <div className={`h-10 w-px ${isDark ? 'bg-amber-500/20' : 'bg-stone-200'} hidden md:block`}></div>
              <div className="text-center group">
                <div className="text-amber-400 font-serif font-bold text-xl group-hover:scale-110 transition-transform truncate max-w-[120px]">
                  {dashboardStats.topCardNames[0] || "无"}
                </div>
                <div className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  高频牌 {dashboardStats.topCardValues[0] > 0 && `(${dashboardStats.topCardValues[0]}次)`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-black/20 border border-white/5' : 'bg-stone-50 border border-stone-100'}`}>
                <h4 className={`text-[10px] uppercase tracking-widest font-mystic mb-2 text-center ${isDark ? 'text-indigo-300' : 'text-stone-600'}`}>高频牌分布 (Top 5)</h4>
                <div ref={barChartRef} className="h-48 w-full"></div>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-black/20 border border-white/5' : 'bg-stone-50 border border-stone-100'}`}>
                <h4 className={`text-[10px] uppercase tracking-widest font-mystic mb-2 text-center ${isDark ? 'text-indigo-300' : 'text-stone-600'}`}>历史趋势 & 累计</h4>
                <div ref={lineChartRef} className="h-48 w-full"></div>
              </div>
            </div>
          </div>
        )}

        {state.currentView === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="检索记录、标签或牌名..." className={`w-full ${isDark ? 'bg-slate-800/40 border-indigo-900/30 text-white' : 'bg-white border-stone-300'} border rounded-2xl py-3 px-12 text-sm focus:outline-none focus:border-indigo-500 transition-all`} />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
              </div>
              <div className="flex gap-2">
                 <button onClick={exportToCSV} title="导出 CSV (表格阅读)" className={`px-3 py-2 rounded-xl border flex items-center gap-1 ${isDark ? 'border-emerald-900/40 hover:border-emerald-500 bg-slate-900 text-emerald-400' : 'border-stone-200 hover:border-emerald-600 bg-white text-emerald-700'} transition-all text-[10px] font-bold`}>📊 CSV</button>
                 <button onClick={exportToJSON} title="导出 JSON (备份恢复)" className={`px-3 py-2 rounded-xl border flex items-center gap-1 ${isDark ? 'border-indigo-900/40 hover:border-indigo-500 bg-slate-900 text-indigo-400' : 'border-stone-200 hover:border-indigo-600 bg-white text-indigo-700'} transition-all text-[10px] font-bold`}>📦 JSON</button>
                 <label title="导入备份" className={`p-3 rounded-xl border cursor-pointer ${isDark ? 'border-slate-800 hover:border-indigo-500 bg-slate-900' : 'border-stone-200 hover:border-stone-400 bg-white'} transition-all`}>
                    📥 <input type="file" accept=".json" onChange={importData} className="hidden" />
                 </label>
              </div>
            </div>

            <div className="flex justify-between items-center relative">
              <h2 className={`text-xl font-mystic ${isDark ? 'text-indigo-100' : 'text-stone-800'} flex items-center gap-3`}>历史星迹记录</h2>
              <MysticButton onClick={() => setState(prev => ({ ...prev, currentView: 'create' }))}>+ 启程抽牌</MysticButton>
            </div>

            {filteredEntries.length === 0 ? (
              <div className={`text-center py-24 border-2 border-dashed ${isDark ? 'border-indigo-900/20' : 'border-stone-300'} rounded-3xl opacity-50 italic`}>尚未在记录本中留下足迹。</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEntries.map(entry => (
                  <div key={entry.id} onClick={() => setState(prev => ({ ...prev, currentView: 'detail', selectedEntryId: entry.id }))} className={`${isDark ? 'bg-slate-800/30 border-indigo-900/20 hover:border-indigo-500/50' : 'bg-white border-stone-200 hover:border-stone-400 shadow-sm'} border rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl group`}>
                    {entry.image ? (
                      <div className="h-40 overflow-hidden relative">
                         <img src={entry.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         {entry.tag && <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[9px] text-amber-200 border border-white/10">{entry.tag}</div>}
                         {entry.moonPhase && <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/40 backdrop-blur-md text-[12px] shadow-sm">{entry.moonPhase.emoji}</div>}
                      </div>
                    ) : (
                      <div className={`h-40 ${isDark ? 'bg-slate-950/50' : 'bg-stone-50'} flex items-center justify-center p-4 gap-2 relative`}>
                        {entry.selectedCards?.slice(0, 3).map((card, i) => (
                          <div key={i} className="scale-75 -mx-2"><CardBack type={entry.deckType} name={card.name} isReversed={card.isReversed} compact color={entry.lenormandColor} theme={state.theme} /></div>
                        ))}
                        {entry.tag && <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/40 backdrop-blur-md text-[9px] text-amber-200 border border-white/10">{entry.tag}</div>}
                        {entry.moonPhase && <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/20 backdrop-blur-md text-[12px]">{entry.moonPhase.emoji}</div>}
                      </div>
                    )}
                    <div className={`p-4 ${isDark ? 'bg-black/10' : 'bg-stone-50/50'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] ${isDark ? 'text-indigo-400' : 'text-stone-500'} font-mystic uppercase`}>{entry.deckType}</span>
                        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-stone-400'} font-serif`}>{formatFullDate(entry.date)}</span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-stone-700'} line-clamp-2 italic`}>{entry.notes || "无言的灵感记录"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {state.currentView === 'create' && (
          <div className={`${isDark ? 'bg-slate-900/80 border-indigo-800/30' : 'bg-white border-stone-300'} p-6 rounded-3xl border shadow-2xl relative animate-in zoom-in-95 duration-300`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b ${isDark ? 'border-indigo-900/20' : 'border-stone-100'} pb-4">
              <div className="flex flex-col gap-2 flex-1">
                <h2 className={`text-2xl font-mystic ${isDark ? 'text-indigo-100' : 'text-stone-900'}`}>星迹捕获</h2>
                <div className={`flex flex-col gap-1 p-2 rounded-lg ${isDark ? 'bg-black/20' : 'bg-stone-50 border border-stone-200'}`}>
                  <label className={`text-[8px] uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-stone-500'} font-bold`}>设定时间</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="datetime-local" 
                      value={formData.readingDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, readingDate: e.target.value }))}
                      className={`bg-transparent text-xs ${isDark ? 'text-indigo-200' : 'text-stone-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 transition-all`}
                    />
                    <span className="text-sm">{getMoonPhase(new Date(formData.readingDate)).emoji}</span>
                    <span className={`text-[9px] ${isDark ? 'text-indigo-400/70' : 'text-stone-500'}`}>{getMoonPhase(new Date(formData.readingDate)).name}</span>
                  </div>
                </div>
              </div>
              <MysticButton onClick={handleVirtualDraw} variant="secondary" className="text-xs py-1.5 flex items-center gap-2 border-amber-500/30 text-amber-400">
                🔮 随机帮我抽一张
              </MysticButton>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                {[DeckType.TAROT, DeckType.LENORMAND].map(type => (
                  <button key={type} onClick={() => setFormData(prev => ({ ...prev, deckType: type, selectedCards: [] }))} className={`flex-1 py-3 rounded-xl border transition-all font-mystic ${formData.deckType === type ? (isDark ? 'border-indigo-500 bg-indigo-900/30 text-indigo-100' : 'border-stone-600 bg-stone-100 text-stone-900') : (isDark ? 'border-slate-800 bg-slate-900 text-slate-500' : 'border-stone-200 bg-white text-stone-400')}`}>
                    {type === DeckType.TAROT ? '塔罗 Tarot' : '雷诺曼 Lenormand'}
                  </button>
                ))}
              </div>

              {formData.deckType === DeckType.LENORMAND && (
                <div>
                  <label className={`block text-[10px] ${isDark ? 'text-indigo-400' : 'text-stone-500'} uppercase tracking-widest mb-3 font-mystic`}>牌阵基调 (元素颜色)</label>
                  <div className="flex gap-3 justify-center">
                    {(Object.keys(LENORMAND_THEMES) as LenormandColor[]).map(c => (
                      <button key={c} onClick={() => setFormData(prev => ({ ...prev, lenormandColor: c }))} className={`w-8 h-8 rounded-full border-2 transition-all ${formData.lenormandColor === c ? 'border-indigo-400 scale-110 shadow-lg' : 'border-transparent scale-90'}`} style={{ background: `linear-gradient(135deg, ${c === 'default' ? '#334155' : c === 'water' ? '#1e3a8a' : c === 'fire' ? '#7f1d1d' : c === 'earth' ? '#064e3b' : c === 'air' ? '#4c1d95' : '#92400e'})` }} />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => document.getElementById('camera-input')?.click()} className={`h-48 border-2 border-dashed ${isDark ? 'border-indigo-900/50 bg-slate-950 hover:border-indigo-500' : 'border-stone-300 bg-stone-50 hover:border-stone-500'} rounded-2xl flex items-center justify-center overflow-hidden transition-colors cursor-pointer group`}>
                  {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="text-center opacity-40 group-hover:opacity-100">📷 <p className="text-[10px] mt-2">拍摄照片</p></div>}
                  <input id="camera-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if(file) { const reader = new FileReader(); reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string })); reader.readAsDataURL(file); } }} />
                </div>
                <div onClick={() => setShowPicker(true)} className={`h-48 border ${isDark ? 'border-indigo-900/30 bg-slate-950 hover:border-indigo-500' : 'border-stone-300 bg-stone-50 hover:border-stone-500'} rounded-2xl flex flex-wrap justify-center gap-2 items-center p-4 transition-colors cursor-pointer group`}>
                  {formData.selectedCards.length > 0 ? (
                    formData.selectedCards.map((card, i) => (
                      <div key={i} className="scale-50 -mx-4"><CardBack type={formData.deckType} name={card.name} isReversed={card.isReversed} compact color={formData.lenormandColor} theme={state.theme} /></div>
                    ))
                  ) : (
                    <div className="text-center opacity-40 group-hover:opacity-100">🃏 <p className="text-[10px] mt-2">手动选择牌面</p></div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className={`block text-[10px] ${isDark ? 'text-indigo-400' : 'text-stone-500'} uppercase tracking-widest font-mystic`}>分类标签 (Tags)</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => setFormData(p => ({ ...p, tag: p.tag === tag ? undefined : tag }))}
                      className={`px-4 py-2 rounded-full text-xs transition-all border ${formData.tag === tag ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]' : (isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-indigo-800' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400')}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-[10px] ${isDark ? 'text-indigo-400' : 'text-stone-500'} uppercase tracking-widest font-mystic`}>解牌心得与记录</label>
                <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="在此记录你的问题、直觉和心得..." className={`w-full h-40 ${isDark ? 'bg-slate-950 border-indigo-900/30 text-white' : 'bg-white border-stone-300 text-stone-900'} border rounded-2xl p-4 focus:outline-none focus:border-indigo-500 transition-all resize-none italic font-serif`} />
              </div>
              
              <div className="flex gap-4">
                <MysticButton variant="secondary" className="flex-1" onClick={() => setState(prev => ({ ...prev, currentView: 'home' }))}>取消</MysticButton>
                <MysticButton className="flex-1" onClick={handleSaveEntry}>保存记录</MysticButton>
              </div>
            </div>
          </div>
        )}

        {state.currentView === 'detail' && selectedEntry && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
              <button onClick={() => setState(prev => ({ ...prev, currentView: 'home' }))} className={`${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-stone-600 hover:text-stone-900'} flex items-center gap-2 text-sm font-mystic tracking-widest`}>← 返回星图</button>
              <MysticButton variant="danger" className="py-1 px-4 text-[10px]" onClick={() => { if(confirm("确信要移除这段星迹记录吗？")){ const updated = state.entries.filter(e=>e.id!==selectedEntry.id); setState(prev=>({...prev, entries:updated, currentView:'home'})); saveEntries(updated); } }}>删除记录</MysticButton>
            </div>

            <div className="space-y-8">
              {/* 照片展示 */}
              {selectedEntry.image && (
                <div className={`rounded-3xl overflow-hidden border ${isDark ? 'border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 'border-stone-300 shadow-xl'}`}>
                  <img src={selectedEntry.image} className="w-full h-auto" alt="Entry Photo" />
                </div>
              )}

              {/* 卡片与信息 */}
              <div className={`${isDark ? 'bg-slate-900/50 border-indigo-900/20' : 'bg-white border-stone-300 shadow-sm'} p-8 rounded-3xl border`}>
                 <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/5">
                   <div className="flex flex-col">
                      <h3 className={`text-[12px] ${isDark ? 'text-indigo-400' : 'text-stone-500'} uppercase tracking-widest font-mystic`}>SPREAD DETAILS</h3>
                      <div className={`text-sm mt-1 font-serif ${isDark ? 'text-slate-300' : 'text-stone-800'}`}>
                         {formatFullDate(selectedEntry.date)}
                      </div>
                      {selectedEntry.moonPhase && (
                        <div className={`text-xs mt-1 ${isDark ? 'text-amber-500/80' : 'text-amber-700/80'}`}>
                          {selectedEntry.moonPhase.emoji} {selectedEntry.moonPhase.name}
                        </div>
                      )}
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <span className={`text-[10px] px-3 py-1 rounded-full ${isDark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-stone-100 text-stone-600'} font-mystic border border-white/5`}>{selectedEntry.deckType}</span>
                     {selectedEntry.tag && <span className="text-[10px] px-3 py-1 rounded-full bg-indigo-600 text-white font-mystic shadow-md">{selectedEntry.tag}</span>}
                   </div>
                 </div>

                 <div className="flex flex-wrap gap-6 justify-center mb-10">
                    {selectedEntry.selectedCards?.map((card, i) => (
                      <div key={i} className="w-24 text-center">
                        <CardBack 
                          type={selectedEntry.deckType} 
                          name={card.name} 
                          isReversed={card.isReversed} 
                          color={selectedEntry.lenormandColor} 
                          theme={state.theme} 
                          onInfoClick={() => setActiveInfoCard({ name: card.name, isReversed: card.isReversed })} 
                        />
                        <div className={`mt-2 text-[10px] font-bold ${isDark ? 'text-indigo-200' : 'text-stone-700'} truncate`}>
                          {TAROT_DETAILS[card.name]?.zh || LENORMAND_DETAILS[card.name]?.zh || card.name}
                        </div>
                      </div>
                    ))}
                 </div>

                 <div>
                    <h3 className={`text-[10px] ${isDark ? 'text-indigo-400' : 'text-stone-500'} uppercase tracking-widest font-mystic mb-4`}>MY NOTES</h3>
                    <div className={`whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-stone-700'} italic text-base font-serif leading-relaxed p-6 rounded-2xl ${isDark ? 'bg-black/20' : 'bg-stone-50 border border-stone-100'}`}>
                      {selectedEntry.notes || "这一天，星辰选择了沉默。"}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {showPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowPicker(false)}></div>
            <div className={`relative ${isDark ? 'bg-slate-900 border-indigo-500/30' : 'bg-stone-50 border-stone-300'} border w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300`}>
              <div className={`p-6 border-b ${isDark ? 'border-indigo-900/50 bg-slate-950/50' : 'border-stone-200 bg-stone-100/50'} flex justify-between items-center sticky top-0 z-10`}>
                <h3 className={`font-mystic ${isDark ? 'text-indigo-200' : 'text-stone-800'} tracking-widest`}>SELECT CARDS 🎴</h3>
                <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-indigo-500 text-xl p-2 active:scale-90 transition-all">✕</button>
              </div>

              {formData.deckType === DeckType.TAROT && (
                <div className="relative border-b ${isDark ? 'border-indigo-900/20 bg-slate-900/50' : 'border-stone-200 bg-stone-50'}">
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950/20 to-transparent pointer-events-none z-10 opacity-50"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950/20 to-transparent pointer-events-none z-10 opacity-50"></div>
                  
                  <div className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x">
                    {['major', 'wands', 'cups', 'swords', 'pentacles'].map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveTarotTab(tab as any)} 
                        className={`flex-shrink-0 px-6 py-4 text-[11px] uppercase tracking-widest whitespace-nowrap transition-all snap-start ${activeTarotTab === tab ? (isDark ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'text-stone-800 border-b-2 border-stone-800 font-bold') : 'text-slate-500 opacity-60'}`}
                      >
                        {tab === 'major' ? '大阿卡纳' : tab === 'wands' ? '权杖' : tab === 'cups' ? '圣杯' : tab === 'swords' ? '宝剑' : '星币'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={`p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 ${isDark ? 'bg-slate-950/20' : 'bg-stone-100/20'} flex-1 custom-scrollbar`}>
                {(formData.deckType === DeckType.TAROT ? TAROT_CARDS[activeTarotTab] : LENORMAND_CARDS).map(name => {
                  const sel = formData.selectedCards.find(c => c.name === name);
                  return (
                    <div key={name} onClick={() => {
                      if(sel) setFormData(p => ({ ...p, selectedCards: p.selectedCards.filter(c => c.name !== name) }));
                      else setFormData(p => ({ ...p, selectedCards: [...p.selectedCards, { name, isReversed: false }] }));
                    }} className={`relative group cursor-pointer transition-all ${!!sel ? 'scale-105 opacity-100' : 'scale-95 opacity-50 hover:opacity-100'}`}>
                      <CardBack type={formData.deckType} name={name} isReversed={sel?.isReversed} color={formData.lenormandColor} theme={state.theme} />
                      {!!sel && <div className={`absolute inset-0 border-2 ${isDark ? 'border-indigo-500' : 'border-stone-800'} rounded-lg pointer-events-none shadow-[0_0_15px_rgba(99,102,241,0.5)]`}></div>}
                      {!!sel && formData.deckType === DeckType.TAROT && (
                        <button onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, selectedCards: p.selectedCards.map(c => c.name === name ? { ...c, isReversed: !c.isReversed } : c) })); }} className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 border border-white/20 text-[8px] px-2 py-0.5 rounded-full shadow-xl z-50 font-bold text-white whitespace-nowrap">
                          {sel.isReversed ? '点击转正位' : '点击转逆位'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className={`p-6 border-t ${isDark ? 'border-indigo-900/50 bg-slate-950' : 'border-stone-200 bg-stone-100'} flex justify-end gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]`}>
                <MysticButton onClick={() => setShowPicker(false)}>确定所选 ({formData.selectedCards.length})</MysticButton>
              </div>
            </div>
          </div>
        )}
      </main>

      {activeInfoCard && <CardInfoModal cardName={activeInfoCard.name} type={selectedEntry?.deckType || formData.deckType} isReversed={activeInfoCard.isReversed} onClose={() => setActiveInfoCard(null)} theme={state.theme} />}
      
      {state.currentView === 'home' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button onClick={() => setState(prev => ({ ...prev, currentView: 'create' }))} className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl border-4 ${isDark ? 'bg-indigo-600 border-slate-900' : 'bg-stone-800 border-stone-100 text-white'} active:scale-90 transition-all hover:scale-110 active:shadow-indigo-500/50`}>🎴</button>
        </div>
      )}
    </div>
  );
};

export default App;
