
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Dna, 
  Sparkles, 
  History, 
  RotateCcw, 
  CalendarDays,
  Gem,
  Info,
  Check,
  BrainCircuit
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';

import { Strategy, UserProfile, GeneratedResult, ElementType } from './types';
import { getOheng, getZodiac, generateNumbers } from './utils/sajuLogic';
import LottoBall from './components/LottoBall';
import HistoryViewer from './components/HistoryViewer';
import { HISTORICAL_DATA, AI_PROMPT_TEMPLATE } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');
  
  // Form State
  const [birthYear, setBirthYear] = useState<number>(1990);
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);
  const [birthTime, setBirthTime] = useState<number>(12);
  
  // Strategy State - Array for multi-select
  const [strategies, setStrategies] = useState<Strategy[]>([Strategy.SAJU]);
  
  // Result State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Gemini Setup
  const [aiFortune, setAiFortune] = useState<string>("");

  useEffect(() => {
    // Auto-calculate profile on year change for live preview
    const zodiac = getZodiac(birthYear);
    const element = getOheng(birthYear);
    setUserProfile({
      year: birthYear,
      month: birthMonth,
      day: birthDay,
      hour: birthTime,
      zodiac,
      element
    });
  }, [birthYear, birthMonth, birthDay, birthTime]);

  const toggleStrategy = (s: Strategy) => {
    setStrategies(prev => {
      if (prev.includes(s)) {
        // Prevent deselecting if it's the only one
        if (prev.length === 1) return prev;
        return prev.filter(item => item !== s);
      } else {
        // Limit to 2 strategies
        if (prev.length >= 2) return prev; 
        return [...prev, s];
      }
    });
  };

  const handleGenerate = async () => {
    if (!userProfile) return;

    setIsGenerating(true);
    setAiFortune("");
    setResult(null);

    // Simulate calculation delay for effect
    setTimeout(async () => {
      const numbers = generateNumbers(strategies, userProfile.element);
      const newResult = {
        numbers,
        strategies,
        luckyElement: userProfile.element
      };
      setResult(newResult);
      setIsGenerating(false);

      // Call Gemini for fortune
      if (process.env.API_KEY) {
        setAiLoading(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const strategyNames = strategies.map(s => {
             if(s === Strategy.CDM) return "CDM 과학적 분석";
             if(s === Strategy.SAJU) return "사주 오행";
             return s;
          }).join(' + ');
          
          const prompt = AI_PROMPT_TEMPLATE
            .replace('{year}', userProfile.year.toString())
            .replace('{zodiac}', userProfile.zodiac)
            .replace('{element}', userProfile.element)
            .replace('{numbers}', numbers.join(', '))
            .replace('{strategy}', strategyNames);

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          setAiFortune(response.text || "운세 정보를 가져올 수 없습니다.");
        } catch (error) {
          console.error("AI Error:", error);
          setAiFortune("오늘의 운세 연결이 원활하지 않습니다. 하지만 행운은 당신 곁에 있습니다!");
        } finally {
          setAiLoading(false);
        }
      } else {
        setAiFortune("AI API Key가 설정되지 않아 운세 해석을 건너뜁니다.");
      }
    }, 800);
  };

  // Stats data for chart
  const statsData = [
    { name: 'Wood', count: 5, color: '#22c55e' },
    { name: 'Fire', count: 5, color: '#ef4444' },
    { name: 'Earth', count: 5, color: '#eab308' },
    { name: 'Metal', count: 5, color: '#94a3b8' },
    { name: 'Water', count: 5, color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-12">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg text-white">
              <Dna size={24} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-serif-kr">
              Saju Lotto
            </h1>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'generator' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              생성기
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'history' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              당첨 내역
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Input */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/50">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CalendarDays className="text-indigo-500" size={20} />
                  사주 정보 입력
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">생년 (Birth Year)</label>
                    <input 
                      type="number" 
                      value={birthYear}
                      onChange={(e) => setBirthYear(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-700"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">월 (Month)</label>
                      <select 
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(Number(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>{m}월</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">일 (Day)</label>
                      <select 
                        value={birthDay}
                        onChange={(e) => setBirthDay(Number(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{d}일</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">시간 (Time - 24h)</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="23" 
                      value={birthTime}
                      onChange={(e) => setBirthTime(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="text-right text-sm text-slate-500">{birthTime}:00</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 flex justify-between">
                      <span>추천 전략 (최대 2개 선택)</span>
                      <span className={`text-xs ${strategies.length === 2 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                        {strategies.length}/2
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(Strategy).map((s) => {
                        const isSelected = strategies.includes(s);
                        // Labels
                        let label = "";
                        let icon = null;
                        if(s === Strategy.SAJU) { label = "사주 기반"; icon = <Sparkles size={14}/>; }
                        else if(s === Strategy.CDM) { label = "CDM (과학)"; icon = <BrainCircuit size={14}/>; }
                        else if(s === Strategy.MIXED) { label = "혼합 (추천)"; }
                        else if(s === Strategy.PROBABILITY) { label = "확률 상위"; }
                        else if(s === Strategy.RANDOM) { label = "완전 랜덤"; }

                        return (
                          <button
                            key={s}
                            onClick={() => toggleStrategy(s)}
                            className={`py-2.5 px-2 rounded-lg text-xs font-medium transition-all relative overflow-hidden flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300 ring-offset-1' 
                                : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-200'
                            }`}
                          >
                            {isSelected && <Check size={12} className="absolute left-1.5 top-1/2 -translate-y-1/2" />}
                            <span className={isSelected ? 'ml-3' : ''}>{icon} {label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {strategies.includes(Strategy.CDM) && (
                      <p className="text-[10px] text-indigo-600 mt-2 bg-indigo-50 p-2 rounded leading-tight">
                        * CDM 모델: 통계적 확률(CDM)과 3-Strategy(간격 분석)를 결합한 과학적 분석 방식입니다.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <RotateCcw className="animate-spin" />
                  ) : (
                    <Sparkles className="text-yellow-300" />
                  )}
                  {isGenerating ? '정밀 분석 중...' : '행운 번호 추출하기'}
                </button>
              </div>

              {/* User Profile Summary */}
              {userProfile && (
                <div className="bg-white/60 rounded-xl p-4 border border-indigo-50 text-sm text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">띠</span>
                    {userProfile.zodiac}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">오행</span>
                    {userProfile.element}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <div className="md:col-span-7 space-y-6">
              {result ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Balls Display */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                    <div className="flex flex-col justify-center items-center gap-2 mb-6">
                        <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">LUCKY NUMBERS</span>
                        <div className="flex gap-1.5 flex-wrap justify-center">
                            {result.strategies.map(s => (
                                <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-full border border-indigo-100 font-bold">
                                    {s === Strategy.CDM ? 'CDM+3Strategy' : s}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                      {result.numbers.map((num, idx) => (
                        <LottoBall key={`${num}-${idx}`} number={num} index={idx} />
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> 1-10</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 11-20</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> 21-30</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-500"></div> 31-40</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> 41-45</span>
                    </div>
                  </div>

                  {/* AI Fortune */}
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white relative">
                    <Gem className="absolute top-4 right-4 text-white/20" size={48} />
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <Sparkles size={18} className="text-yellow-300" />
                      AI 운세 & 전략 분석
                    </h3>
                    {aiLoading ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-white/20 rounded w-3/4"></div>
                        <div className="h-4 bg-white/20 rounded w-1/2"></div>
                      </div>
                    ) : (
                      <p className="text-purple-50 leading-relaxed font-serif-kr text-sm sm:text-base">
                        {aiFortune}
                      </p>
                    )}
                  </div>

                  {/* Chart (Mock Data Visualization) */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Info size={16} /> 오행 분포 분석
                    </h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statsData}>
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis hide />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {statsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 rounded-2xl min-h-[400px]">
                  <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <Sparkles size={32} className="text-slate-300" />
                  </div>
                  <p className="text-center font-medium">좌측 메뉴에서 정보를 입력하고<br/>행운의 번호를 확인하세요.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <History className="text-indigo-500" />
                역대 당첨 번호 데이터
              </h2>
              <p className="text-slate-500 text-sm">
                PDF 자료에 기반한 과거 당첨 번호 및 2025년 예상 데이터입니다.
              </p>
            </div>
            <HistoryViewer data={HISTORICAL_DATA} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
