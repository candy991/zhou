import React, { useState, useMemo, useEffect } from 'react';
import { DeckType, ReadingEntry, LenormandColor } from '../types';
import { TAROT_DETAILS, LENORMAND_DETAILS, TAROT_CARDS, LENORMAND_CARDS } from '../constants/cards';
import { CardBack, LENORMAND_THEME_CONFIG } from '../App';

interface CardArchiveProps {
  entries: ReadingEntry[];
  theme: 'light' | 'dark';
  lenormandColor: LenormandColor;
  onColorChange: (color: LenormandColor) => void;
}

export const CardArchive: React.FC<CardArchiveProps> = ({ entries, theme, lenormandColor, onColorChange }) => {
  const [activeSystem, setActiveSystem] = useState<DeckType>(DeckType.TAROT);
  const [tarotFilter, setTarotFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardName, setSelectedCardName] = useState<string | null>(null);
  const [myInsights, setMyInsights] = useState<Record<string, string>>({});

  // 初始化洞见数据
  useEffect(() => {
    const saved = localStorage.getItem('mystic_card_insights');
    if (saved) setMyInsights(JSON.parse(saved));
  }, []);

  // 计算高能卡牌：30天内出现次数 > 3
  const highEnergyCards = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const counts: Record<string, number> = {};
    
    entries.forEach(entry => {
      if (new Date(entry.date).getTime() > thirtyDaysAgo && entry.selectedCards) {
        entry.selectedCards.forEach(c => {
          if (c.name) {
            counts[c.name] = (counts[c.name] || 0) + 1;
          }
        });
      }
    });

    return new Set(Object.entries(counts).filter(([_, count]) => count > 3).map(([name]) => name));
  }, [entries]);

  // 过滤逻辑
  const filteredCards = useMemo(() => {
    let pool: string[] = [];
    if (activeSystem === DeckType.TAROT) {
      if (tarotFilter === 'all') pool = Object.keys(TAROT_DETAILS);
      else pool = (TAROT_CARDS as any)[tarotFilter] || [];
    } else {
      pool = LENORMAND_CARDS;
    }

    return pool.filter(name => {
      const detail = activeSystem === DeckType.TAROT ? TAROT_DETAILS[name] : LENORMAND_DETAILS[name];
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             detail?.zh.includes(searchQuery) || 
             detail?.en.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [activeSystem, tarotFilter, searchQuery]);

  const handleSaveInsight = (name: string, text: string) => {
    const updated = { ...myInsights, [name]: text };
    setMyInsights(updated);
    localStorage.setItem('mystic_card_insights', JSON.stringify(updated));
  };

  const isDark = theme === 'dark';

  return (
    <div className="animate-in fade-in duration-700 space-y-10 pb-20">
      {/* 顶部系统切换 */}
      <div className="flex justify-center">
        <div className={`inline-flex p-1 rounded-2xl border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'} shadow-2xl`}>
          {[
            { id: DeckType.TAROT, label: '塔罗牌 (78)', count: 78 },
            { id: DeckType.LENORMAND, label: '雷诺曼 (36)', count: 36 }
          ].map(sys => (
            <button 
              key={sys.id}
              onClick={() => { setActiveSystem(sys.id); setTarotFilter('all'); }}
              className={`px-8 py-3 rounded-xl transition-all font-mystic uppercase tracking-widest text-xs ${activeSystem === sys.id ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
            >
              {sys.label}
            </button>
          ))}
        </div>
      </div>

      {/* 雷诺曼专属颜色选择器 */}
      {activeSystem === DeckType.LENORMAND && (
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-2">
           <label className="text-[10px] uppercase opacity-40 font-bold tracking-widest block">档案色调 (Archive Theme Color)</label>
           <div className={`p-2 rounded-2xl border flex flex-wrap gap-2 justify-center ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              {(Object.keys(LENORMAND_THEME_CONFIG) as LenormandColor[]).map(color => (
                <button 
                  key={color} 
                  onClick={() => onColorChange(color)} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${lenormandColor === color ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950/20 border-white/5 opacity-60 hover:opacity-100'}`}
                >
                  {LENORMAND_THEME_CONFIG[color].emoji} {LENORMAND_THEME_CONFIG[color].label}
                </button>
              ))}
           </div>
        </div>
      )}

      {/* 筛选和搜索 */}
      <div className={`p-6 rounded-[2rem] border backdrop-blur-md flex flex-col lg:flex-row gap-6 items-center justify-between ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
          {activeSystem === DeckType.TAROT ? (
            [
              { id: 'all', label: '全部' },
              { id: 'major', label: '大阿卡纳' },
              { id: 'wands', label: '权杖组' },
              { id: 'cups', label: '圣杯组' },
              { id: 'swords', label: '宝剑组' },
              { id: 'pentacles', label: '星币组' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setTarotFilter(f.id)}
                className={`px-5 py-2 rounded-full text-[10px] font-bold transition-all border uppercase tracking-widest ${tarotFilter === f.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950/20 border-white/5 opacity-60 hover:opacity-100'}`}
              >
                {f.label}
              </button>
            ))
          ) : (
            <span className="text-[10px] uppercase opacity-40 font-bold tracking-[0.3em] py-2 px-4">经典雷诺曼 36 占卜全集</span>
          )}
        </div>

        <div className="relative w-full lg:w-80">
          <input 
            type="text" 
            placeholder="在档案中搜索关键词..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-3 px-12 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
        </div>
      </div>

      {/* 画廊网格 - forceStylized={false} 恢复写实风格优先 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filteredCards.map(name => {
          const detail = activeSystem === DeckType.TAROT ? TAROT_DETAILS[name] : LENORMAND_DETAILS[name];
          const isHighEnergy = highEnergyCards.has(name);
          
          return (
            <div 
              key={name}
              onClick={() => setSelectedCardName(name)}
              className={`group relative aspect-[2/3] rounded-xl transition-all duration-500 hover:scale-105 ${isHighEnergy ? 'shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]'}`}
            >
              <CardBack 
                type={activeSystem} 
                name={name} 
                theme={theme} 
                color={activeSystem === DeckType.LENORMAND ? lenormandColor : 'default'}
                forceStylized={false} 
                showDetailsOnHover={true}
              />

              {/* 高能徽章 */}
              {isHighEnergy && (
                <div className="absolute top-2 right-2 bg-amber-500 text-black text-[7px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse z-10 border border-white/20">
                  🔥 HIGH ENERGY
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-40 opacity-20 italic">未发现匹配卡牌档案。</div>
      )}

      {/* 详情模态框 */}
      {selectedCardName && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedCardName(null)}></div>
          <div className={`relative w-full max-w-4xl max-h-[90vh] border rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
            <button onClick={() => setSelectedCardName(null)} className="absolute top-6 right-6 z-10 text-2xl opacity-40 hover:opacity-100 transition-opacity">✕</button>
            
            <div className="w-full md:w-1/2 aspect-[2/3] md:aspect-auto bg-black overflow-hidden flex items-center justify-center">
              <div className="w-full max-w-[320px] shadow-2xl scale-90 md:scale-100">
                <CardBack 
                   type={activeSystem} 
                   name={selectedCardName} 
                   theme={theme} 
                   color={activeSystem === DeckType.LENORMAND ? lenormandColor : 'default'}
                   forceStylized={false} 
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="mb-8">
                <h3 className="text-4xl font-serif font-bold mb-2">{(activeSystem === DeckType.TAROT ? TAROT_DETAILS[selectedCardName] : LENORMAND_DETAILS[selectedCardName])?.zh}</h3>
                <p className="text-xs opacity-40 uppercase tracking-[0.4em] font-mystic">{(activeSystem === DeckType.TAROT ? TAROT_DETAILS[selectedCardName] : LENORMAND_DETAILS[selectedCardName])?.en}</p>
              </div>

              <div className="space-y-8 flex-1">
                <div>
                  <h4 className="text-[10px] uppercase text-indigo-500 font-bold tracking-widest mb-3">核心语义 (Keywords)</h4>
                  <p className="text-sm italic leading-loose opacity-80">{(activeSystem === DeckType.TAROT ? TAROT_DETAILS[selectedCardName] : LENORMAND_DETAILS[selectedCardName])?.meaning}</p>
                </div>

                {activeSystem === DeckType.TAROT && (
                  <div>
                    <h4 className="text-[10px] uppercase text-amber-500 font-bold tracking-widest mb-3">逆位启示 (Reversed)</h4>
                    <p className="text-sm italic leading-loose opacity-60">{TAROT_DETAILS[selectedCardName].reversedMeaning}</p>
                  </div>
                )}

                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-[10px] uppercase text-indigo-400 font-bold tracking-widest mb-4 flex justify-between items-center">
                    <span>我的洞见 (My Insights)</span>
                    <span className="text-[7px] opacity-20 font-normal">记录你的实战感悟</span>
                  </h4>
                  <textarea 
                    placeholder="在此记录你对这张牌的个人感悟、实战经验或独特解读..."
                    value={myInsights[selectedCardName] || ''}
                    onChange={(e) => handleSaveInsight(selectedCardName, e.target.value)}
                    className={`w-full h-44 border rounded-2xl p-5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all leading-relaxed ${isDark ? 'bg-slate-950 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};