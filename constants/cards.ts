import { DeckType } from "../types";

export interface SpreadLayout {
  id: string;
  name: string;
  type: DeckType | 'configurable_comparison' | 'free';
  positions: { label: string }[];
  grid?: { rows: number; cols: number };
  groups?: string[];
  options?: number[];
  defaultPerSide?: number;
}

export const SPREAD_LAYOUTS: Record<string, SpreadLayout[]> = {
  [DeckType.TAROT]: [
    { id: 't-1', name: '单张牌', type: DeckType.TAROT, positions: [{ label: '启示' }] },
    { id: 't-3', name: '三张牌', type: DeckType.TAROT, positions: [{ label: '过去' }, { label: '现在' }, { label: '未来' }] },
    { id: 't-5', name: '五张牌', type: DeckType.TAROT, positions: [{ label: '现状' }, { label: '挑战' }, { label: '潜意识' }, { label: '目标' }, { label: '近未来' }] },
    { id: 't-cc', name: '凯尔特十字', type: DeckType.TAROT, positions: Array(10).fill(0).map((_, i) => ({ label: `位置 ${i + 1}` })) },
    { id: 'two_paths_dynamic', name: '二路抉择', type: 'configurable_comparison', groups: ['选项 A (Option A)', '选项 B (Option B)'], options: [3, 5], defaultPerSide: 3, positions: [] },
    { id: 'free', name: '自由抽牌', type: 'free', positions: [] },
  ],
  [DeckType.LENORMAND]: [
    { id: 'l-3', name: '3张线性', type: DeckType.LENORMAND, positions: Array(3).fill(0).map((_, i) => ({ label: `${i + 1}` })), grid: { rows: 1, cols: 3 } },
    { id: 'l-5', name: '5张线性', type: DeckType.LENORMAND, positions: Array(5).fill(0).map((_, i) => ({ label: `${i + 1}` })), grid: { rows: 1, cols: 5 } },
    { id: 'l-9', name: '9宫格', type: DeckType.LENORMAND, positions: Array(9).fill(0).map((_, i) => ({ label: `${i + 1}` })), grid: { rows: 3, cols: 3 } },
    { id: 'l-gt', name: 'Grand Tableau', type: DeckType.LENORMAND, positions: Array(36).fill(0).map((_, i) => ({ label: `${i + 1}` })), grid: { rows: 5, cols: 8 } },
    { id: 'two_paths_dynamic', name: '二路抉择', type: 'configurable_comparison', groups: ['选项 A (Option A)', '选项 B (Option B)'], options: [3, 5], defaultPerSide: 3, positions: [] },
    { id: 'free', name: '自由抽牌', type: 'free', positions: [] },
  ]
};

export interface CardDetail {
  zh: string;
  en: string;
  meaning: string;
  reversedMeaning?: string;
  imageUrl?: string;
  emoji?: string;
}

const WIKIMEDIA_BASE = "https://upload.wikimedia.org/wikipedia/commons";

export const TAROT_DETAILS: Record<string, CardDetail> = {
  // --- Major Arcana (22 cards: 0-21) ---
  "0 愚人 (The Fool)": { 
    zh: "愚人", en: "The Fool", 
    imageUrl: `${WIKIMEDIA_BASE}/9/90/RWS_Tarot_00_Fool.jpg`,
    meaning: "新的开始、自由、纯真、自发性、冒险。", reversedMeaning: "鲁莽、风险、天真、草率、犹豫不决。" 
  },
  "1 魔术师 (The Magician)": { 
    zh: "魔术师", en: "The Magician", 
    imageUrl: `${WIKIMEDIA_BASE}/d/de/RWS_Tarot_01_Magician.jpg`,
    meaning: "创造力、意志力、表现力、行动、才华。", reversedMeaning: "操纵、计划不周、未开发的潜力、欺骗。" 
  },
  "2 女祭司 (The High Priestess)": { 
    zh: "女祭司", en: "The High Priestess", 
    imageUrl: `${WIKIMEDIA_BASE}/8/88/RWS_Tarot_02_High_Priestess.jpg`,
    meaning: "直觉、潜意识、神秘、神圣女性、内在智慧。", reversedMeaning: "秘密、脱离直觉、肤浅、被动等待。" 
  },
  "3 女皇 (The Empress)": { 
    zh: "女皇", en: "The Empress", 
    imageUrl: `${WIKIMEDIA_BASE}/a/af/RWS_Tarot_03_Empress.jpg`,
    meaning: "丰饶、自然、母亲、创造力、感官享受。", reversedMeaning: "创造性障碍、对他人的过度依赖、空虚。" 
  },
  "4 皇帝 (The Emperor)": { 
    zh: "皇帝", en: "The Emperor", 
    imageUrl: `${WIKIMEDIA_BASE}/c/c3/RWS_Tarot_04_Emperor.jpg`,
    meaning: "权威、结构、秩序、父亲、稳定。", reversedMeaning: "专制、僵化、缺乏纪律、权力滥用。" 
  },
  "5 教皇 (The Hierophant)": { 
    zh: "教皇", en: "The Hierophant", 
    imageUrl: `${WIKIMEDIA_BASE}/8/8d/RWS_Tarot_05_Hierophant.jpg`,
    meaning: "传统、信仰、社会规范、导师、精神指引。", reversedMeaning: "反叛、打破常规、自由思考、教条主义。" 
  },
  "6 恋人 (The Lovers)": { 
    zh: "恋人", en: "The Lovers", 
    imageUrl: `${WIKIMEDIA_BASE}/3/3a/RWS_Tarot_06_Lovers.jpg`,
    meaning: "爱、和谐、关系、价值观一致、选择。", reversedMeaning: "失衡、关系不和、价值观冲突、逃避责任。" 
  },
  "7 战车 (The Chariot)": { 
    zh: "战车", en: "The Chariot", 
    imageUrl: `${WIKIMEDIA_BASE}/9/9b/RWS_Tarot_07_Chariot.jpg`,
    meaning: "意志、成功、决心、控制、胜利。", reversedMeaning: "失控、缺乏方向、攻击性、阻碍。" 
  },
  "8 力量 (Strength)": { 
    zh: "力量", en: "The Strength", 
    imageUrl: `${WIKIMEDIA_BASE}/f/f5/RWS_Tarot_08_Strength.jpg`,
    meaning: "内在力量、勇、同情、控制冲动。", reversedMeaning: "自我怀疑、软弱、缺乏克制、沮丧。" 
  },
  "9 隐士 (The Hermit)": { 
    zh: "隐士", en: "The Hermit", 
    imageUrl: `${WIKIMEDIA_BASE}/4/4d/RWS_Tarot_09_Hermit.jpg`,
    meaning: "反省、寻求真理、孤独、内向引导。", reversedMeaning: "孤立、孤独、隐遁过久、与世隔绝。" 
  },
  "10 命运之轮 (Wheel of Fortune)": { 
    zh: "命运之轮", en: "Wheel of Fortune", 
    imageUrl: `${WIKIMEDIA_BASE}/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg`,
    meaning: "运气、变化、周期、不可避免的转折点。", reversedMeaning: "运气不佳、抗拒变化、不必要的重复。" 
  },
  "11 正义 (Justice)": { 
    zh: "正义", en: "Justice", 
    imageUrl: `${WIKIMEDIA_BASE}/e/e0/RWS_Tarot_11_Justice.jpg`,
    meaning: "公正、因果、法律、真相、均衡。", reversedMeaning: "不公平、缺乏责任感、不诚实、偏见。" 
  },
  "12 倒吊人 (The Hanged Man)": { 
    zh: "倒吊人", en: "The Hanged Man", 
    imageUrl: `${WIKIMEDIA_BASE}/2/2b/RWS_Tarot_12_Hanged_Man.jpg`,
    meaning: "停顿、投降、放手、新视角、牺牲。", reversedMeaning: "拖延、阻碍、无谓的牺牲、抗拒直觉。" 
  },
  "13 死神 (Death)": { 
    zh: "死神", en: "Death", 
    imageUrl: `${WIKIMEDIA_BASE}/d/d7/RWS_Tarot_13_Death.jpg`,
    meaning: "结束、转变、过渡、放手、重生。", reversedMeaning: "抗拒变化、停滞不前、恐惧终结。" 
  },
  "14 节制 (Temperance)": { 
    zh: "节制", en: "Temperance", 
    imageUrl: `${WIKIMEDIA_BASE}/f/f8/RWS_Tarot_14_Temperance.jpg`,
    meaning: "平衡、调节、耐心、目的、融合。", reversedMeaning: "失衡、过度、缺乏目标、冲突。" 
  },
  "15 恶魔 (The Devil)": { 
    zh: "恶魔", en: "The Devil", 
    imageUrl: `${WIKIMEDIA_BASE}/5/55/RWS_Tarot_15_Devil.jpg`,
    meaning: "束缚、物质主义、沉迷、影子自我、欲望。", reversedMeaning: "解脱、打破枷锁、自我意识觉醒、恢复自由。" 
  },
  "16 高塔 (The Tower)": { 
    zh: "高塔", en: "The Tower", 
    imageUrl: `${WIKIMEDIA_BASE}/5/53/RWS_Tarot_16_Tower.jpg`,
    meaning: "剧变、灾难、突然的变化、觉醒、幻灭。", reversedMeaning: "避免灾难、延迟必然、恐惧变化、内部动荡。" 
  },
  "17 星星 (The Star)": { 
    zh: "星星", en: "The Star", 
    imageUrl: `${WIKIMEDIA_BASE}/d/db/RWS_Tarot_17_Star.jpg`,
    meaning: "希望、灵感、宁静、治愈、愿景。", reversedMeaning: "绝望、缺乏信心、灰心丧气、迷茫。" 
  },
  "18 月亮 (The Moon)": { 
    zh: "月亮", en: "The Moon", 
    imageUrl: `${WIKIMEDIA_BASE}/7/7f/RWS_Tarot_18_Moon.jpg`,
    meaning: "幻觉、恐惧、焦虑、潜意识、不安。", reversedMeaning: "释放恐惧、混乱消除、真理显现、直觉复苏。" 
  },
  "19 太阳 (The Sun)": { 
    zh: "太阳", en: "The Sun", 
    imageUrl: `${WIKIMEDIA_BASE}/1/17/RWS_Tarot_19_Sun.jpg`,
    meaning: "快乐、成功、活力、自信、明晰。", reversedMeaning: "暂时的不快、过度热情导致的失败、虚假希望。" 
  },
  "20 审判 (Judgement)": { 
    zh: "审判", en: "Judgement", 
    imageUrl: `${WIKIMEDIA_BASE}/d/dd/RWS_Tarot_20_Judgement.jpg`,
    meaning: "重生、呼唤、反思、宽恕、觉醒。", reversedMeaning: "自我怀疑、拒绝呼唤、忽视教训、优忧寡断。" 
  },
  "21 世界 (The World)": { 
    zh: "世界", en: "The World", 
    imageUrl: `${WIKIMEDIA_BASE}/f/ff/RWS_Tarot_21_World.jpg`,
    meaning: "完成、整合、成就、旅行、圆满。", reversedMeaning: "未完成的目标、停滞、缺乏终点、失望。" 
  },

  // --- Wands (14 cards) ---
  "权杖一 (Ace of Wands)": { zh: "权杖一", en: "Ace of Wands", imageUrl: `${WIKIMEDIA_BASE}/1/11/Wands01.jpg`, meaning: "灵感、动力、新项目、热情。", reversedMeaning: "缺乏动力、创意受阻、延迟。" },
  "权杖二 (Two of Wands)": { zh: "权杖二", en: "Two of Wands", imageUrl: `${WIKIMEDIA_BASE}/0/0f/Wands02.jpg`, meaning: "规划、未来、进步、发现。", reversedMeaning: "恐惧未知、计划不周。" },
  "权杖三 (Three of Wands)": { zh: "权杖三", en: "Three of Wands", imageUrl: `${WIKIMEDIA_BASE}/f/ff/Wands03.jpg`, meaning: "扩张、远见、海外贸易、合作。", reversedMeaning: "延误、计划落空。" },
  "权杖四 (Four of Wands)": { zh: "权杖四", en: "Four of Wands", imageUrl: `${WIKIMEDIA_BASE}/a/a4/Wands04.jpg`, meaning: "庆祝、家、和谐、初步成功。", reversedMeaning: "家庭不睦、不稳定的成就。" },
  "权杖五 (Five of Wands)": { zh: "权杖五", en: "Five of Wands", imageUrl: `${WIKIMEDIA_BASE}/9/9d/Wands05.jpg`, meaning: "竞争、冲突、挑战、内部斗争。", reversedMeaning: "避免冲突、妥协。" },
  "权杖六 (Six of Wands)": { zh: "权杖六", en: "Six of Wands", imageUrl: `${WIKIMEDIA_BASE}/3/3b/Wands06.jpg`, meaning: "胜利、公开认可、成功、自信。", reversedMeaning: "傲慢、落败、名誉扫地。" },
  "权杖七 (Seven of Wands)": { zh: "权杖七", en: "Seven of Wands", imageUrl: `${WIKIMEDIA_BASE}/e/e4/Wands07.jpg`, meaning: "防御、毅力、保护阵阵地、竞争。", reversedMeaning: "放弃、不知所措。" },
  "权杖八 (Eight of Wands)": { zh: "权杖八", en: "Eight of Wands", imageUrl: `${WIKIMEDIA_BASE}/6/6b/Wands08.jpg`, meaning: "迅速、行动、进展快、消息传达。", reversedMeaning: "拖延、忙乱无序。" },
  "权杖九 (Nine of Wands)": { zh: "权杖九", en: "Nine of Wands", imageUrl: `${WIKIMEDIA_BASE}/4/4d/Wands09.jpg`, meaning: "韧性、警惕、最后冲刺、防御意识。", reversedMeaning: "精疲力竭、防备心过重。" },
  "权杖十 (Ten of Wands)": { zh: "权杖十", en: "Ten of Wands", imageUrl: `${WIKIMEDIA_BASE}/0/0b/Wands10.jpg`, meaning: "重担、责任过大、精疲力竭。", reversedMeaning: "不堪重负、分配职责。" },
  "权杖侍从 (Page of Wands)": { zh: "权杖侍从", en: "Page of Wands", imageUrl: `${WIKIMEDIA_BASE}/6/6a/Wands11.jpg`, meaning: "新消息、热情、探索精神。", reversedMeaning: "缺乏愿景、怀才不遇。" },
  "权杖骑士 (Knight of Wands)": { zh: "权杖骑士", en: "Knight of Wands", imageUrl: `${WIKIMEDIA_BASE}/1/16/Wands12.jpg`, meaning: "充满活力、冒险、鲁胆行动。", reversedMeaning: "傲慢、焦躁、挫折。" },
  "权杖王后 (Queen of Wands)": { zh: "权杖王后", en: "Queen of Wands", imageUrl: `${WIKIMEDIA_BASE}/0/0d/Wands13.jpg`, meaning: "自信、社交、热情、勇气。", reversedMeaning: "控制欲强、多疑。" },
  "权杖国王 (King of Wands)": { zh: "权杖国王", en: "King of Wands", imageUrl: `${WIKIMEDIA_BASE}/c/ce/Wands14.jpg`, meaning: "领导力、视野、果断、魅力。", reversedMeaning: "冲动、霸道、专横。" },

  // --- Cups (14 cards) ---
  "圣杯一 (Ace of Cups)": { zh: "圣杯一", en: "Ace of Cups", imageUrl: `${WIKIMEDIA_BASE}/3/36/Cups01.jpg`, meaning: "新感情、直觉、喜悦、爱。", reversedMeaning: "情感阻碍、空虚。" },
  "圣杯二 (Two of Cups)": { zh: "圣杯二", en: "Two of Cups", imageUrl: `${WIKIMEDIA_BASE}/f/f8/Cups02.jpg`, meaning: "统一、友谊、吸引、合作。", reversedMeaning: "关系失和、不信任。" },
  "圣杯三 (Three of Cups)": { zh: "圣杯三", en: "Three of Cups", imageUrl: `${WIKIMEDIA_BASE}/7/7a/Cups03.jpg`, meaning: "聚会、庆祝、创造性合作。", reversedMeaning: "过度纵乐、孤立。" },
  "圣杯四 (Four of Cups)": { zh: "圣杯四", en: "Four of Cups", imageUrl: `${WIKIMEDIA_BASE}/3/35/Cups04.jpg`, meaning: "沉思、厌倦、冷漠、忽视机会。", reversedMeaning: "重新参与、觉醒。" },
  "圣杯五 (Five of Cups)": { zh: "圣杯五", en: "Five of Cups", imageUrl: `${WIKIMEDIA_BASE}/d/d7/Cups05.jpg`, meaning: "悲伤、损失、遗憾、哀悼过去。", reversedMeaning: "接受、释怀、前进。" },
  "圣杯六 (Six of Cups)": { zh: "圣杯六", en: "Six of Cups", imageUrl: `${WIKIMEDIA_BASE}/1/17/Cups06.jpg`, meaning: "怀旧、童真、重聚、快乐记忆。", reversedMeaning: "沉溺过去、脱离现实。" },
  "圣杯七 (Seven of Cups)": { zh: "圣杯七", en: "Seven of Cups", imageUrl: `${WIKIMEDIA_BASE}/a/ae/Cups07.jpg`, meaning: "幻觉、选择、愿望、白日梦。", reversedMeaning: "看清现实、做出决定。" },
  "圣杯八 (Eight of Cups)": { zh: "圣杯八", en: "Eight of Cups", imageUrl: `${WIKIMEDIA_BASE}/6/60/Cups08.jpg`, meaning: "离开、寻找更高价值、放手。", reversedMeaning: "犹豫不决、恐惧离开。" },
  "圣杯九 (Nine of Cups)": { zh: "圣杯九", en: "Nine of Cups", imageUrl: `${WIKIMEDIA_BASE}/2/24/Cups09.jpg`, meaning: "满足、愿望达成、自豪、享受。", reversedMeaning: "贪婪、不满足。" },
  "圣杯十 (Ten of Cups)": { zh: "圣杯十", en: "Ten of Cups", imageUrl: `${WIKIMEDIA_BASE}/8/84/Cups10.jpg`, meaning: "和谐、长期幸福、家庭美满。", reversedMeaning: "家庭冲突、梦想破灭。" },
  "圣杯侍从 (Page of Cups)": { zh: "圣杯侍从", en: "Page of Cups", imageUrl: `${WIKIMEDIA_BASE}/a/ad/Cups11.jpg`, meaning: "敏感、直觉、好消息、创意提议。", reversedMeaning: "情绪化、由于幼稚导致的失败。" },
  "圣杯骑士 (Knight of Cups)": { zh: "圣杯骑士", en: "Knight of Cups", imageUrl: `${WIKIMEDIA_BASE}/f/fa/Cups12.jpg`, meaning: "浪漫、迷人、理想主义。", reversedMeaning: "情绪多变、不切实际。" },
  "圣杯王后 (Queen of Cups)": { zh: "圣杯王后", en: "Queen of Cups", imageUrl: `${WIKIMEDIA_BASE}/6/62/Cups13.jpg`, meaning: "慈悲、直觉、共情心、温柔。", reversedMeaning: "情感勒索、过于敏感。" },
  "圣杯国王 (King of Cups)": { zh: "圣杯国王", en: "King of Cups", imageUrl: `${WIKIMEDIA_BASE}/0/04/Cups14.jpg`, meaning: "情感平衡、外交手腕、宽容。", reversedMeaning: "冷漠、情感操控。" },

  // --- Swords (14 cards) ---
  "宝剑一 (Ace of Swords)": { zh: "宝剑一", en: "Ace of Swords", imageUrl: `${WIKIMEDIA_BASE}/1/1a/Swords01.jpg`, meaning: "清晰、突破、逻辑、真相。", reversedMeaning: "混乱、误解。" },
  "宝剑二 (Two of Swords)": { zh: "宝剑二", en: "Two of Swords", imageUrl: `${WIKIMEDIA_BASE}/9/9e/Swords02.jpg`, meaning: "僵局、犹豫不决、逃避。", reversedMeaning: "打破僵局、看清真相。" },
  "宝剑三 (Three of Swords)": { zh: "宝剑三", en: "Three of Swords", imageUrl: `${WIKIMEDIA_BASE}/0/02/Swords03.jpg`, meaning: "心碎、痛苦、背叛、分离。", reversedMeaning: "康复、释放痛苦。" },
  "宝剑四 (Four of Swords)": { zh: "宝剑四", en: "Four of Swords", imageUrl: `${WIKIMEDIA_BASE}/b/bf/Swords04.jpg`, meaning: "休息、退隐、恢复、冥想。", reversedMeaning: "必须行动、精疲力竭。" },
  "宝剑五 (Five of Swords)": { zh: "宝剑五", en: "Five of Swords", imageUrl: `${WIKIMEDIA_BASE}/2/23/Swords05.jpg`, meaning: "冲突、自私、惨胜。", reversedMeaning: "结束冲突、悔改。" },
  "宝剑六 (Six of Swords)": { zh: "宝剑六", en: "Six of Swords", imageUrl: `${WIKIMEDIA_BASE}/2/29/Swords06.jpg`, meaning: "过渡、离开困境、治愈。", reversedMeaning: "受阻、无法前进。" },
  "宝剑七 (Seven of Swords)": { zh: "宝剑七", en: "Seven of Swords", imageUrl: `${WIKIMEDIA_BASE}/3/34/Swords07.jpg`, meaning: "欺骗、逃避、战略、孤独行动。", reversedMeaning: "秘密泄露、回归正道。" },
  "宝剑八 (Eight of Swords)": { zh: "宝剑八", en: "Eight of Swords", imageUrl: `${WIKIMEDIA_BASE}/a/a7/Swords08.jpg`, meaning: "受限、被困、自我怀疑。", reversedMeaning: "解脱、重获自由。" },
  "宝剑九 (Nine of Swords)": { zh: "宝剑九", en: "Nine of Swords", imageUrl: `${WIKIMEDIA_BASE}/2/2f/Swords09.jpg`, meaning: "焦虑、失眠、噩梦、巨大压力。", reversedMeaning: "释放压力、希望重现。" },
  "宝剑十 (Ten of Swords)": { zh: "宝剑十", en: "Ten of Swords", imageUrl: `${WIKIMEDIA_BASE}/d/d4/Swords10.jpg`, meaning: "彻底失败、背叛、触底重生。", reversedMeaning: "康复、转机。" },
  "宝剑侍从 (Page of Swords)": { zh: "宝剑侍从", en: "Page of Swords", imageUrl: `${WIKIMEDIA_BASE}/4/4c/Swords11.jpg`, meaning: "警惕、好奇、新视角、洞察力。", reversedMeaning: "言语尖酸、不可靠。" },
  "宝剑骑士 (Knight of Swords)": { zh: "宝剑骑士", en: "Knight of Swords", imageUrl: `${WIKIMEDIA_BASE}/b/b5/Swords12.jpg`, meaning: "大胆、迅速、知性挑战。", reversedMeaning: "冲动鲁莽、缺乏耐心。" },
  "宝剑王后 (Queen of Swords)": { zh: "宝剑王后", en: "Queen of Swords", imageUrl: `${WIKIMEDIA_BASE}/d/d4/Swords13.jpg`, meaning: "客观、敏锐、坦诚、独立。", reversedMeaning: "冷酷、偏执、毒舌。" },
  "宝剑国王 (King of Swords)": { zh: "宝剑国王", en: "King of Swords", imageUrl: `${WIKIMEDIA_BASE}/3/33/Swords14.jpg`, meaning: "理智、权威、法律、真理。", reversedMeaning: "残忍、操纵、偏执。" },

  // --- Pentacles (14 cards) ---
  "星币一 (Ace of Pentacles)": { zh: "星币一", en: "Ace of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/f/fd/Pents01.jpg`, meaning: "财务机会、繁荣、扎根、现实成功。", reversedMeaning: "错失机会、财务损失。" },
  "星币二 (Two of Pentacles)": { zh: "星币二", en: "Two of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/9/9f/Pents02.jpg`, meaning: "平衡、多项任务、适应性。", reversedMeaning: "失衡、生活压力。" },
  "星币三 (Three of Pentacles)": { zh: "星币三", en: "Three of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/4/41/Pents03.jpg`, meaning: "团队合作、技能提升、建设性成果。", reversedMeaning: "缺乏协作、平庸。" },
  "星币四 (Four of Pentacles)": { zh: "星币四", en: "Four of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/b/be/Pents04.jpg`, meaning: "稳定、控制、物质保障、守财。", reversedMeaning: "挥霍、放手、损失。" },
  "星币五 (Five of Pentacles)": { zh: "星币五", en: "Five of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/9/96/Pents05.jpg`, meaning: "匮乏、财务困境、被排斥。", reversedMeaning: "好转、找到支持。" },
  "星币六 (Six of Pentacles)": { zh: "星币六", en: "Six of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/a/a6/Pents06.jpg`, meaning: "慷慨、慈善、公平、施予。", reversedMeaning: "自私、滥用权力。" },
  "星币七 (Seven of Pentacles)": { zh: "星币七", en: "Seven of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/6/6a/Pents07.jpg`, meaning: "耐心、长期投资、等待收获。", reversedMeaning: "缺乏耐心、无谓的投资。" },
  "星币八 (Eight of Pentacles)": { zh: "星币八", en: "Ace of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/4/49/Pents08.jpg`, meaning: "工匠精神、勤奋、学习、细节。", reversedMeaning: "缺乏动力、走捷径。" },
  "星币九 (Nine of Pentacles)": { zh: "星币九", en: "Nine of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/f/f0/Pents09.jpg`, meaning: "独立、成就、物质自由、高雅。", reversedMeaning: "过度依赖、财务失控。" },
  "星币十 (Ten of Pentacles)": { zh: "星币十", en: "Ten of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/3/3f/Pents10.jpg`, meaning: "遗产、家庭保障、长久传统。", reversedMeaning: "家族纷争、经济崩盘。" },
  "星币侍从 (Page of Pentacles)": { zh: "星币侍从", en: "Page of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/8/8a/Pents11.jpg`, meaning: "雄心、勤学、设定现实目标。", reversedMeaning: "缺乏远见、懒惰。" },
  "星币骑士 (Knight of Pentacles)": { zh: "星币骑士", en: "Knight of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/1/15/Pents12.jpg`, meaning: "务实、可靠、有条不紊、勤勉。", reversedMeaning: "固执、枯燥、工作狂。" },
  "星币王后 (Queen of Pentacles)": { zh: "星币王后", en: "Queen of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/a/ad/Pents13.jpg`, meaning: "实用、慷慨、稳定、养育者。", reversedMeaning: "自我怀疑、财务失衡。" },
  "星币国王 (King of Pentacles)": { zh: "星币国王", en: "King of Pentacles", imageUrl: `${WIKIMEDIA_BASE}/1/1c/Pents14.jpg`, meaning: "事业成功、财务纪律、稳健。", reversedMeaning: "贪婪、腐败、唯利不图。" }
};

// --- Lenormand Cards (1-36) ---
export const LENORMAND_DETAILS: Record<string, CardDetail> = {
  "1 骑士 (The Rider)": { zh: "骑士", en: "The Rider", emoji: "🏇", meaning: "消息、访客、速度、新的人或事进入生活。" },
  "2 三叶草 (The Clover)": { zh: "三叶草", en: "The Clover", emoji: "🍀", meaning: "小运气、机会、希望、轻松愉快。" },
  "3 船 (The Ship)": { zh: "船", en: "The Ship", emoji: "🚢", meaning: "旅行、距离、商业、转变、进步。" },
  "4 房子 (The House)": { zh: "房子", en: "The House", emoji: "🏠", meaning: "家庭、私人领域、安全感、舒适、根基。" },
  "5 树 (The Tree)": { zh: "树", en: "The Tree", emoji: "🌳", meaning: "健康、生命力、精神成长、长期发展、耐性。" },
  "6 云 (The Clouds)": { zh: "云", en: "The Clouds", emoji: "☁️", meaning: "混乱、不确定、暂时的阻碍、模糊不清。" },
  "7 蛇 (The Snake)": { zh: "蛇", en: "The Snake", emoji: "🐍", meaning: "背叛、并发症、引诱、聪明但可能有害的女性。" },
  "8 棺材 (The Coffin)": { zh: "棺材", en: "The Coffin", emoji: "⚰️", meaning: "结束、重大的变化、患病、停滞、转化。" },
  "9 花束 (The Bouquet)": { zh: "花束", en: "The Bouquet", emoji: "💐", meaning: "礼物、美丽、快乐、成功、认可。" },
  "10 镰刀 (The Scythe)": { zh: "镰刀", en: "The Scythe", emoji: "🔪", meaning: "突然的断绝、决定、危险、收获。" },
  "11 鞭子 (The Whip)": { zh: "鞭子", en: "The Whip", emoji: "🪄", meaning: "冲突、争论、体育锻炼、重复的行为、惩罚。" },
  "12 鸟 (The Birds)": { zh: "鸟", en: "The Birds", emoji: "🐦", meaning: "交谈、沟通、紧张、八卦、一对（夫妻或伴侣）。" },
  "13 小孩 (The Child)": { zh: "小孩", en: "The Child", emoji: "👶", meaning: "新的开始、天真、小型事物、孩子、信任。" },
  "14 狐狸 (The Fox)": { zh: "狐狸", en: "The Fox", emoji: "🦊", meaning: "工作、狡猾、策略、虚伪、自我保护。" },
  "15 熊 (The Bear)": { zh: "熊", en: "The Bear", emoji: "🐻", meaning: "力量、财务、权威、母亲形象、保护。" },
  "16 星星 (The Stars)": { zh: "星星", en: "The Stars", emoji: "⭐", meaning: "灵感、清晰、愿望、精神指引、未来计划。" },
  "17 鹳 (The Stork)": { zh: "鹳", en: "The Stork", emoji: "🦢", meaning: "改变、迁移、改善、收获、循环。" },
  "18 狗 (The Dog)": { zh: "狗", en: "The Dog", emoji: "🐕", meaning: "忠诚、友谊、信任、可靠的朋友、支持。" },
  "19 高塔 (The Tower)": { zh: "高塔", en: "The Tower", emoji: "🏰", meaning: "政府/官方、孤立、雄心、法律事务、大机构。" },
  "20 公园 (The Garden)": { zh: "公园", en: "The Garden", emoji: "⛲", meaning: "公众、聚会、社交、网络、社区。" },
  "21 山 (The Mountain)": { zh: "山", en: "The Mountain", emoji: "⛰️", meaning: "阻碍、延迟、沉重、挑战、顽固。" },
  "22 路径 (The Crossroads)": { zh: "路径", en: "The Crossroads", emoji: "🛣️", meaning: "决定、多种选择、分歧点、新的方向。" },
  "23 老鼠 (The Mice)": { zh: "老鼠", en: "The Mice", emoji: "🐭", meaning: "损失、压力、腐蚀、焦虑、小偷小摸。" },
  "24 心 (The Heart)": { zh: "心", en: "The Heart", emoji: "❤️", meaning: "爱、激情、浪漫、慷慨、关怀。" },
  "25 戒指 (The Ring)": { zh: "戒指", en: "The Ring", emoji: "💍", meaning: "契约、承诺、婚姻、周期、合作。" },
  "26 书 (The Book)": { zh: "书", en: "The Book", emoji: "📖", meaning: "秘密、知识、学习、隐藏的信息、真相。" },
  "27 信 (The Letter)": { zh: "信", en: "The Letter", emoji: "✉️", meaning: "文件、书信沟通、消息、邀请函。" },
  "28 男人 (The Man)": { zh: "男人", en: "The Man", emoji: "👨", meaning: "男人本人、配偶、重要的男性、阳性能量。" },
  "29 女人 (The Woman)": { zh: "女人", en: "The Woman", emoji: "👩", meaning: "女人本人、配偶、重要的女性、阴性能量。" },
  "30 百合 (The Lily)": { zh: "百合", en: "The Lily", emoji: "⚜️", meaning: "平静、成熟、经验、智慧、长久的宁静。" },
  "31 太阳 (The Sun)": { zh: "太阳", en: "The Sun", emoji: "☀️", meaning: "巨大的成功、乐观、活力、能量、清晰。" },
  "32 月亮 (The Moon)": { zh: "月亮", en: "The Moon", emoji: "🌙", meaning: "名望、直觉、情绪、创造力、潜意识。" },
  "33 钥匙 (The Key)": { zh: "钥匙", en: "The Key", emoji: "🔑", meaning: "解决方案、确定性、发现、重要的启示。" },
  "34 鱼 (The Fish)": { zh: "鱼", en: "The Fish", emoji: "🐟", meaning: "财务、繁荣、流动、商业机会、自由。" },
  "35 锚 (The Anchor)": { zh: "锚", en: "The Anchor", emoji: "⚓", meaning: "稳定、安全、长期、决心、目的地。" },
  "36 十字架 (The Cross)": { zh: "十字架", en: "The Cross", emoji: "✝️", meaning: "业力、痛苦、命运、责任、考验。" }
};

export const TAROT_CARDS = {
  major: Object.keys(TAROT_DETAILS).filter(k => !k.includes('权杖') && !k.includes('圣杯') && !k.includes('宝剑') && !k.includes('星币')),
  wands: Object.keys(TAROT_DETAILS).filter(k => k.includes('权杖')),
  cups: Object.keys(TAROT_DETAILS).filter(k => k.includes('圣杯')),
  swords: Object.keys(TAROT_DETAILS).filter(k => k.includes('宝剑')),
  pentacles: Object.keys(TAROT_DETAILS).filter(k => k.includes('星币'))
};

export const LENORMAND_CARDS = Object.keys(LENORMAND_DETAILS);