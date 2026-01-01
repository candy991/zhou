
import { GoogleGenAI } from "@google/genai";
import { DeckType, SelectedCard, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSystemInstruction = (deckType: DeckType, selectedCards?: SelectedCard[]) => {
  let cardInfo = "";
  if (selectedCards && selectedCards.length > 0) {
    const cardDescriptions = selectedCards.map(c => 
      `${c.name}${deckType === DeckType.TAROT ? (c.isReversed ? '（逆位）' : '（正位）') : ''}`
    );
    cardInfo = `当前牌阵包含：${cardDescriptions.join('，')}。`;
  }

  return `你是一位精通韦特塔罗牌和雷诺曼牌的神秘学导师，名叫“星语者”。
  用户会提供他们的抽牌记录。
  ${cardInfo}
  你的任务：
  1. 深度解析：结合牌义、五行、占星关联及正逆位差异进行解析。
  2. 引导思考：不仅仅是给出答案，更要通过温和的提问引导用户觉察内心。
  3. 语气风格：温和、神秘、且富有同情心。
  4. 规则：如果是塔罗逆位，探讨能量的阻塞、过度或需要向内转化。
  请始终使用中文回复。`;
};

export const getAIInterpretation = async (
  deckType: DeckType,
  notes: string,
  imageData?: string,
  selectedCards?: SelectedCard[]
): Promise<ChatMessage[]> => {
  const model = 'gemini-3-flash-preview';
  const systemInstruction = generateSystemInstruction(deckType, selectedCards);
  
  const userPrompt = `我的解牌笔记和直觉：${notes || "（无笔记，请根据牌义给出第一直觉的指引）"}`;

  const parts: any[] = [{ text: userPrompt }];
  if (imageData) {
    const base64Data = imageData.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    const aiResponseText = response.text || "星辰在此时保持了沉默，请稍后再试。";
    return [
      { role: 'user', text: userPrompt },
      { role: 'model', text: aiResponseText }
    ];
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    throw error;
  }
};

export const getFollowUpResponse = async (
  deckType: DeckType,
  selectedCards: SelectedCard[] | undefined,
  history: ChatMessage[],
  userQuestion: string
): Promise<ChatMessage> => {
  const model = 'gemini-3-flash-preview';
  const systemInstruction = generateSystemInstruction(deckType, selectedCards);

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
      // Transform history to simple array if needed, though gemini-3-flash-preview usually handles objects
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });

    const result = await chat.sendMessage({ message: userQuestion });
    return { role: 'model', text: result.text || "我还在感应这一层深意，请再问一次。" };
  } catch (error) {
    console.error("Follow-up Error:", error);
    throw error;
  }
};
