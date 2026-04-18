'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Clock, Trash2, Search as SearchIcon, X, Mic, Image as ImageIcon, Send, PlayCircle, Bookmark, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'audio';
  duration?: string;
  link?: {
    surahId: number;
    verseId?: number;
    label: string;
  };
}

interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
  type: 'text' | 'voice' | 'image';
}

export default function SearchPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'quron' | 'hadis' | 'fiqh'>('quron');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Assalomu alaykum! Men Qur'on qidiruv tizimiman. Sizga bazamizdan suralar, oyatlar va ularning tafsirlarini topishda yordam beraman. \n\nIltimos, qidirayotgan mavzuingiz yoki oyatingiz haqida yozing yoki ovozli xabar yuboring. Men faqat bazadagi ma'lumotlarni (Shayx Alouddin Mansur tafsiri va Hamdatanzil matni) taqdim etaman.",
      type: 'text'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('quran_chat_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing history:', e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      // Custom stringifier to handle circular references and non-serializable data
      const safeStringify = (obj: any) => {
        try {
          const cache = new Set();
          return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (cache.has(value)) {
                return; // Discard circular reference
              }
              cache.add(value);
              
              // If it's a DOM element or looks like one, don't stringify it
              if (value instanceof Node || (value.nodeType && value.nodeName)) {
                return '[DOM Element]';
              }
            }
            
            // For the root array or history items, allow them
            if (key === "" || !isNaN(Number(key))) return value;

            // Ensure we only keep primitive values for history items
            if (['id', 'query', 'timestamp', 'type'].includes(key)) {
              return String(value);
            }
            
            // Discard anything else to be safe
            return undefined;
          });
        } catch (err) {
          console.error('Safe stringify failed:', err);
          return '[]';
        }
      };

      const serializableHistory = history.map(item => ({
        id: String(item.id),
        query: String(item.query),
        timestamp: String(item.timestamp),
        type: item.type
      }));
      
      localStorage.setItem('quran_chat_history', safeStringify(serializableHistory));
    } catch (e) {
      console.error('Error saving history to localStorage:', e);
    }
  }, [history]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  const addToHistory = (query: string, type: 'text' | 'voice' | 'image' = 'text') => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      // Stop recording and send
      const voiceMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Ovozli xabar',
        type: 'audio',
        duration: formatTime(recordingTime)
      };
      setMessages(prev => [...prev, voiceMessage]);
      addToHistory('Ovozli xabar', 'voice');
      setIsRecording(false);
      
      // Simulate AI response for voice
      setIsAnalyzing(true);
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Ovozli xabaringiz qabul qilindi. Siz yuborgan ovozli xabarda Baqara surasining 2-oyati keltirilgan.",
          type: 'text'
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsAnalyzing(false);
      }, 2000);
    } else {
      setIsRecording(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Rasm yuborildi: ${file.name}`,
        type: 'text'
      };
      setMessages(prev => [...prev, imageMessage]);
      addToHistory(`Rasm: ${file.name}`, 'image');
      
      // Simulate AI response for image
      setIsAnalyzing(true);
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Rasm tahlil qilindi. Bu rasmdagi matn Qur'onning Fotiha surasiga o'xshaydi.",
          type: 'text'
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  const handleSend = async (forcedQuery?: string) => {
    const query = forcedQuery || input;
    if (!query.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    addToHistory(query);
    const currentInput = query;
    setInput('');
    setIsAnalyzing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      
      // Try to find relevant ayats in Supabase to provide as context
      let context = "";
      try {
        const { data: ayatsData } = await supabase
          .from('ayats')
          .select('surah_number, number, text, translation, tafsir')
          .or(`text.ilike.%${currentInput}%,translation.ilike.%${currentInput}%,tafsir.ilike.%${currentInput}%`)
          .limit(3);

        if (ayatsData && ayatsData.length > 0) {
          context = "\n\nQuyidagi oyatlar foydalanuvchi so'roviga aloqador bo'lishi mumkin:\n" + 
            ayatsData.map(a => `Sura ${a.surah_number}, Oyat ${a.number}: ${a.text}\nTarjima: ${a.translation}\nTafsir: ${a.tafsir}`).join("\n\n");
        }
      } catch (dbError) {
        console.error("Database search error:", dbError);
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: currentInput + context,
        config: {
          systemInstruction: "Siz Qur'on qidiruv tizimisiz. Sizning vazifangiz faqat foydalanuvchi so'roviga mos keladigan oyatlarni, ularning tarjimalarini va tafsirlarini taqdim etilgan bazadan (context) topib berishdir. Hech qanday diniy hukm chiqarmang, shaxsiy fikr bildirmang yoki umumiy Islomiy savollarga javob bermang. Agar so'rovga mos ma'lumot bazada topilmasa, buni ochiq ayting. Faqat Shayx Alouddin Mansur tafsiri va Hamdatanzil matniga asoslangan ma'lumotlarni (agar ular context'da bo'lsa) ko'rsating. Javobingizda sura raqami, oyat raqami, arabcha matn, o'zbekcha tarjima va tafsirni aniq ko'rsating. JSON formatida surahId va verseId maydonlarini to'ldiring.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "AI javob matni (Markdown formatida)" },
              surahId: { type: Type.INTEGER, description: "Sura raqami (1-114)" },
              verseId: { type: Type.INTEGER, description: "Oyat raqami" },
              linkTitle: { type: Type.STRING, description: "Tugma uchun matn (masalan, 'Fotiha surasiga o'tish')" }
            },
            required: ["text"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("AI response text is empty");
      }
      const data = JSON.parse(responseText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || "Kechirasiz, javob olishda xatolik yuz berdi.",
        type: 'text',
        link: data.surahId ? {
          surahId: data.surahId,
          verseId: data.verseId,
          label: data.linkTitle || (data.verseId ? `Sura ${data.surahId}, Oyat ${data.verseId}` : `Sura ${data.surahId}`)
        } : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Kechirasiz, hozirda javob bera olmayman. Iltimos, keyinroq urinib ko'ring.",
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHistoryClick = (query: string) => {
    // Optionally clear existing messages if we want to start a "new" chat
    // setMessages([]); 
    setShowHistory(false);
    handleSend(query);
  };

  const filteredHistory = history.filter(item => 
    item.query.toLowerCase().includes(searchHistoryQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5FBF7] font-display text-slate-800 overflow-hidden overscroll-none">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <Image 
          aria-hidden="true" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.1]" 
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAACECAIAAABtQv6vAAAAA3NCSVQICAjb4U/gAAAPp0lEQVRoQ6VbW7MdRRWemT3nmoQCAoYkUgGFYAmFUmUp6gsvvlvlD/DP+gt80Ad9QKtULFMBknPZJzt7xvV969Kre+aQAFP7zHSvy7cuvWb17Mvp3/njH7qu6+Wv63meZ5x5cO5XZcasSJmQSCuKQASpQgD2tOl2p8P2rZPBZeLqsgvGCwjfQm+W4EbzM6EWz5emes2KMPo5AmshQqaIzJ7Soe+Oum7XzaOCNynxJOd8mkgiWWZTqC+IWnQ3fXfcz8/6Dql+gfgy7poicMsFv0apl0BfGcT2eqpTElsANdEm16Ua7jIiVO5eSmyaxIPZQ17KtWYxh5SoF2EbvZz2PPe7ed53kuqXU1hz4bvQpr57NvRTh5wvFjlSEItXUivFzGPdXaXGii9WhGX+vBumrhsJUWVLS1+pi4SK6AIdjqyV14pzvYBPfY/7WAP43ucVI+uYcycLLG6K4dTqar9RQgRM5Ogg/WqQEKZO5YjnaO5naSByL1310kBcBCvrK2jOikG1KTLRjupAhCNwpGVbbsqEOYXofLiZ3zqZ96N3rhoti69ygriytMDPSskfydJrh/Mv7nTzgAZSDi9nU5RCQDGkAxMwCY5JawWyUcuuq0KiJ1kbx/7WyeZ02oySqUCWctNxuFwxzWqI68DVyzVTMC57BW0PY7/ZD8ttscG1afFunf8CakSy7+bLab9jy/SjwuakOeX6SbXmegrOWW4FhBeqNA0sgoyGYZ6sgYRtVVOLbrmy55LVtXI5i6tUfbdI85jEx5dN9arBb0WEd9K25un57tl+v/dUZ6elScSaXI9dVXcSE6T6VoipFBlulHHoJVzvXNkwCr8xCDSQnK6OQbBI2gjY1M7Ouzz63ST78aydqzEj3MrKetRhO/mzLlmoshnvu6+vdtteqjpZLZ5GE3CltFVq3BaPdBjRkhfmGJY4qwlwUGS7af5qO20P1lpmE3/xt2J4jgGfGTEE83XyxPvnU//kqt8OPVpmXoz1ZF3ry8pyLuqjgtztN48vji7HsTQQu7tFDI7YIl/nU7UU5laRXdGijJyedcMX0/HZDMPXbHjrsav6tbwlo0nWvu8vunE3v3SvXiK+LCVZjhtNtvD60UdzBFEVr2oZVNaR/K0l01WSR2qJSqFhYul28qXFlVw51S3MrCZkDFVe8dzjbGlRbcD93r06vGy8WZ/SJB3Bc7W/IXafk04mxThnBCi2zwvf0pm1Wp0ZZW9O6TGbXucpHAdDm9cjKDbIJkASkPToQSFZOO1zMsvFZQiOaAbqi8KviqwSFyB8mBXzvI9X9oQaRWaUsajUexWpcgkS/sK91hnv7B6x32DMcVRy7sE+VqSEFz276tgaKPyNkGVSWhUiLrMUzyJDidBG8U2yLU/TAUO5uApidkGp+saE+YDrTH3taBUeRaDJdzoZGHTMUwPBdkkPi1xMhGE8satiXJ5aIRsgkqNFrwxqVdWF2ozq0PhmyZqpBmXijViAIEidQEIeuBCyplrp3kkQCEUoXcEhSLJKZRQB1ykaISUk+kg9+eulc5kzagg6tSXObF2Np4nTc6w0rVK4AGLmB6kQULZ+FJEFdLyuLEpweClO0JacCTXTG4hrpHVrYEwPJRoQlhif48oxgvJiap6whYXapGS1H2dQps7NWHPAXO3V2yU9dxaNE2nhU16yl38LE17RzIsOy8dSDDlD5CliFBzlXSm9K9f0JNs5ZJKpFAIGlYtf2QTCaUw80aWmZDRsuxtCczCIpID8luEuCH2ebFUKE1o48L4M7wKqNXYmBXyiA5sGNYsqoBozutpeERKP99wN8wN9QfW3iys15B5FLVnbSS55mMV1y6HICE+7PPfjgq/qnnNu2qIuc8ttxsymcnosWmiYCFCMSkH5hH7tvVNKUK75tKyUSHZNAwFhOFAUsVXFYFKmWn2W6SzHzLdmbaj436ai+GNFpt4wZGTWum8/opUsl4kuFxc5w7wN28ghKXyPW2STjrY8nnVhr6tqs1obpztOWvGh8jQmyHnBMfdnfrJHsGtCqsBMkLS0Dsk9HfIsJ2fYNTuNZ65Wz3aCElLdemk29m5RlnFA0B2FdOtcIBWglqDJRVNdTLdOlFVNHJouR7IK4noqag1+C7M4hFSirfiFowuTBNkYrF02mDmlkOELDWRheY1GqUhwSCC8NQAN3ZCzCITx2GJfeMn0OnURzCz1N/la6RHHKBFc0Q+e9moRLqmt7eh6CZdgSY/IjGYVZECsA6FynLSAtN3EpBS0w5tIAYqfoVnhlZs1vCeiqC6vCByiBO2iTEQGwcd4Ttc3agsrduKXMmALuBzLtmWIaLiHrjaA03+PJuM2zDMYdzipLo15zOORIyxFWi7SRRTKdS0egs+HQgDNqRCIoZjpb5TqpOlPIxwWywKVehlBnc80wZGSZ4Ys76FIcGSZ3JrlxyHWayUai8qp4QVubGWGb0631MG4Tku8P7k6a0krYIH5NfkZmiVcPK22DicYl5yPIKVxAhrLXRs/JSWewm3U+0yV6bKumP4lcHjVGdj6ZqaN7o6gwkJMIxr8hBwUXpLNHrdFINBkePraOunzkHAHwVkfdV8SfXSCn1aOb5BUlltFhsMescG0jA06kIEv3wG0noithArs1YS0nyZa76qDOD4ZUhZdZDsj1RzSS663dJobckyT2fJIRoNmTVpjG4BTAGTFcE3QMYv0kJQsnP0GnLJPIdqw80FgQONo82pMLDGuiQ1E6lbiOe1q9zApParEOAQwuSWoFmBqNxOCBzOFW2mVkuUtgpm9sWplAgxWVwZKy83TUmyhqKs9XeLxrPlg1N2OJ5OPQE5ETCpUuV7S4lUf24igs5DccnvBeTwHliZAcdFybCJ0Q3H0sC7IwlgqYolH7qX5WHPn3KKMX3uSLp0cInmzQ6aLOBIhXqigRoOP18TyXh/rHSUAQNQ71NuQAROlQAlMcygRxkERQbqjHwTMeD3J3JGqgOLkg2wNThveQiuSUGrAgBWVTKMmduGEXEOhltzWO5iX0eeKGc4H/FZebQq5qGQmYTC5hQtE1ccJUlFSDnt3DUAF1pODOE8wM/0IldQ4qc+dFvoihHrDEUqM8FghpdCpjCJIWfzImZBAZupRgeHuLzs0Ydj/Tg447snsJH8R+NWP+gTueaKzUiLwxo9eapQf6QIBvXVns5cO+wqwexABvG4bAxcLaQpJmzkF15bcZkc4MpWkpTNleoLArcIMC6XrZm7SCs6YaIBh42KL26LESH9tbwYDKPxfBb3COkWoBWRcahGXFxmFFbH7MHvmvfHpmOAtI1jaQqVwerKR/JJSwFWTch5+hmIaoHFBQ4ZNcjti0wAWNYLFJXVerVMuk0xr77tS9Ni9ILDzlWVkyI7fApGFRKhuEtf1Sr4IaP+chp0GWAcm0QEonD5nLECsxVI5oKlwvoEoCkTKetzlmrZMtSyJ1p0kiscasSGauJlNWNEa1DwKkXjpjmIyEVN6MMexEosyWI4TyAeceEAYEpZKX0IcAG4achYi0SG/Ly6WFRYtyv0MqyEinlA2xESGpFS3S+xrGRETCdKVZsdJiY2HFi2DHGUD50lN5MHxE7iLuvfe+sXXiaglnFusobMOE66m9ROoMcCgWITXT8SGLFqU+WaBhIoFkXxPgw5p71+o4AwxRl8xlX1anUQO49r8yqncERZJDfOgYY/aQql4kzImxu6HIvRvriuIJCShKoueOkqkPLVzcp+AlI9LhITTL8EBnO5rHw1AGpBi/sVMVLHBnZt44aMs/xqMZapVJH+PLIWhV0YUD/Bw+2Hg5coL21BCzOtvPxWjveFJU3Wd+j2ZxfcFglpaUKm3awbs9tLtzWLOuogW66XnYUMjPaY90/O+KaNjIjKIylZZuwNhMxBbky5CZI9xfKtjIYrEL38JlN+t/foS1R1c98apAhZP89eRQhmEamqXeKskDBiRamX034/ff1kfnKuD3sL21Bu2oj5o5BqtrEa1vTusUTTcmDN+2k6u5gvtmKY32oBw9NmAOqjmZAJS8RyKFqUwrRZBP9MS98hAheCfsi/SOy323m3Sx83VQAekuYx1BE2jQEIzrALUggyLKfAsRFlXQCD5/I7WN7HBusC4qKbNRS7vxCx2YQWDUQ42O6RE8gEEg2qCjiy68vPX2UkqiPfMsNlkTcU3MhJxWzRDE5cGlsXQTC3wyMtYDPnIaiXg/wcc9gcHozbUX5R7kUjAH6HiBiM6ycw8IE5BFZZDnWVPnCVKQC/GDUHGIdbRhg2w/HhyfnmwKqa8n5SFQ8BqgVJsUSCSc95NdcAok6YcV5AEWG8Qd6cHN84GI9GZM4S624yRrcLNSRXs4GZoXAYoS0nQWHQal4ebw8Ob926/dXR6Xj6ytHF0yuDExGzyBxVZYL+bR6qTT/7MpR5E0hkiQ4Mm/Ho4OhkuHP71f6AqZQuIhh4WVo4xkvokiVUlp+xePoS/wqRGdDXQC35zMG1IMYUyScRRyc3h58/eGe8ucETvh7IiQjwVVBQaaFZ6CKgFUjb8eIqe7oA4sEgiXjduP3G+KsHDy+f7f70l7+en297+f8YOqXGecWsLLiSSMOQOeXIotEkM4GqpAMCyeGLdXB8Or5/++7F1dU/Hv3vn188ujy/UiwXVB/sHEQiACPgYaR6JwR3sBQMXL3J6pvxYHz18MZ7b979zUcfTPvpb+f/aUzmKQPjCYehZdvBNlOMORQqNTxl9v3rxzd/e+8njx4//e/Z12dfbqfntpqANz1C4U/nBskJPdAMEDs2icQk2SV1FVBUp+PRO7d+8NO7b793/+7R8YHUixZDnG0VvXzkUUZeqZRokE7V8SmB54qBe5Wdi8ev7z886sZ/PX58ud/N29gjjevrVNZLRgy8PYRShJQJIUSRQYdovyfj4Y9u3/n9z375wf173WEN2SIVY6gdfoyEF2NGeiwf2gDkYWeaOvn3lwl3tt1RKWK5l2+f3vr0wftfnp19dXH+6NGT5/JwZCaRHLqdjhJsjHJIlNVTKTZTF3I0DpCONwf3Tl//7OGHv/vo4xunh+lGcPu+kMsMZ5fcoGjxBX8UwXDkzQr7Pw8Mul7ivnfjtU/uv/vZxx/98M4bVtXQ1cOhNBDRi7BViNIpDRi7BViNIp/yXkSdVZeSfjuqX/IeXcKoAbh6cPHj1zU9//PDpxfbJxeXZU/nPKFFCeeT60LTCYbpFjziRP60kDjUTIkIbEFDFUtUqoedXDk8/efPdpw+35/PVn//y+eXFFaMwW1nSYMyEmsEty5FOzb5SdLlFoBiWPBMdBx+Oxg/feFuaiYT798///fjxU/DgtlzRL3FRfNXB83lp2waFi2HqVb0Q4v8BelILuRLt1xkAAAAASUVORK5CYII=" 
          alt="Pattern" 
          fill
        />
        <div className="fixed top-[20%] right-[-10%] w-[60%] h-[40%] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/50 shadow-sm shrink-0">
        <div className="max-w-[480px] mx-auto w-full flex items-center justify-between p-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center size-9 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-700" />
          </button>

          {/* Category Selector */}
          <div className="relative flex-1 flex justify-center">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white/60 transition-all active:scale-95"
            >
              <h1 className="text-base font-bold tracking-tight text-emerald-700">
                {selectedCategory === 'quron' ? "Qur'on qidiruvi" : selectedCategory === 'hadis' ? 'Hadislar' : 'Fiqhiy masalalar'}
              </h1>
              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                {showCategoryMenu ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showCategoryMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowCategoryMenu(false)}
                />
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Quron - Active */}
                  <button
                    onClick={() => { setSelectedCategory('quron'); setShowCategoryMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">menu_book</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-800">Qur'on</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Faol</p>
                    </div>
                    {selectedCategory === 'quron' && (
                      <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span>
                    )}
                  </button>

                  <div className="h-px bg-slate-100" />

                  {/* Hadislar - Blocked */}
                  <div className="w-full flex items-center gap-3 px-4 py-3 opacity-50 cursor-not-allowed select-none">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">auto_stories</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-500">Hadislar</p>
                      <p className="text-[10px] text-slate-400 font-medium">Yaqinda qo'shiladi</p>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Fiqhiy masalalar - Blocked */}
                  <div className="w-full flex items-center gap-3 px-4 py-3 opacity-50 cursor-not-allowed select-none">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">gavel</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-500">Fiqhiy masalalar</p>
                      <p className="text-[10px] text-slate-400 font-medium">Yaqinda qo'shiladi</p>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center justify-center size-9 rounded-full hover:bg-white/50 transition-colors"
            >
              <Clock size={20} className="text-slate-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth overscroll-contain">
        <div className="max-w-[480px] mx-auto px-4 py-6 space-y-6 flex flex-col">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}
          >
            <span className={`text-xs font-medium text-slate-500 ${msg.role === 'user' ? 'mr-2' : 'ml-2'}`}>
              {msg.role === 'user' ? 'Siz' : 'AI Assistant'}
            </span>
            
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end max-w-[80%]' : 'items-start max-w-[95%] w-full'} gap-2`}>
              <div className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="size-8 rounded-full overflow-hidden shrink-0 shadow-sm ring-1 ring-white/50 bg-white flex items-center justify-center">
                  {msg.role === 'user' ? (
                    <Image 
                      src="https://picsum.photos/seed/user/32/32"
                      alt="User"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="bg-emerald-100 text-emerald-600 w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 ${
                  msg.role === 'user' 
                    ? 'bg-white dark:bg-slate-800 rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 rounded-tl-none'
                }`}>
                  {msg.type === 'audio' ? (
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <PlayCircle size={20} className="text-primary" />
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{msg.duration}</span>
                    </div>
                  ) : (
                    <div className={`text-sm leading-relaxed font-medium ${
                      msg.role === 'assistant' 
                        ? 'text-slate-800 dark:text-slate-100' 
                        : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}

                  {/* Link Button */}
                  {msg.link && (
                    <Link 
                      href={`/surah/${msg.link.surahId}${msg.link.verseId ? `#ayat-${msg.link.verseId}` : ''}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      {msg.link.label}
                    </Link>
                  )}
                </div>
              </div>

              {/* Actions (only for assistant) */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-4 ml-11">
                  <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                    <Bookmark size={14} className="text-primary-dark" />
                    <span className="text-[10px] font-bold bg-gradient-to-b from-[#19e66b] to-black bg-clip-text text-transparent uppercase tracking-wider">Saqlash</span>
                  </button>
                  <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                    <Share2 size={14} className="text-primary-dark" />
                    <span className="text-[10px] font-bold bg-gradient-to-b from-[#19e66b] to-black bg-clip-text text-transparent uppercase tracking-wider">Ulashish</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex flex-col items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-xs font-medium text-slate-500 ml-2">AI tahlil qilmoqda...</span>
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[20px] text-primary animate-spin">sync</span>
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-white/60 backdrop-blur-md border border-white/60 shadow-sm">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
          <div ref={messagesEndRef} className="h-4 shrink-0" />
        </div>
      </main>

      {/* Bottom Input Bar Area */}
      <footer className="shrink-0 bg-[#F5FBF7]/90 backdrop-blur-xl z-50 border-t border-white/10">
        <div className="max-w-[480px] mx-auto px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="w-full flex items-center bg-white/80 backdrop-blur-md rounded-full px-2 py-1 border border-white/60 shadow-[0_-4px_12px_rgba(25,230,107,0.12)]">
          {/* Left Gallery Icon */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center size-10 shrink-0 text-slate-500 hover:text-primary transition-colors"
          >
            <ImageIcon size={20} />
          </button>
          
          {/* Main Input Field */}
          <div className="flex-1 flex items-center">
            {isRecording ? (
              <div className="flex-1 flex items-center gap-3 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-bold text-red-500">{formatTime(recordingTime)}</span>
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-red-400 animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            ) : (
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 px-2 py-2" 
                placeholder="Xabar yozing..." 
              />
            )}
          </div>
          
          {/* Right Controls (Mic & Send) */}
          <div className="flex items-center gap-1.5 ml-1">
            <button 
              onClick={handleVoiceToggle}
              className={`flex items-center justify-center size-10 transition-colors ${isRecording ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {isRecording ? <X size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={isRecording ? handleVoiceToggle : () => handleSend()}
              disabled={(!input.trim() && !isRecording) || isAnalyzing}
              className={`flex items-center justify-center size-10 rounded-full shadow-md transition-all shrink-0 ${
                (input.trim() || isRecording) && !isAnalyzing
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 hover:brightness-110 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isRecording ? <Send size={18} className="text-white" /> : <Send size={18} className="text-white" />}
            </button>
          </div>
        </div>
      </div>
    </footer>

      {/* History Modal (Bottom Sheet) */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowHistory(false)}
          ></div>
          
          <div className="relative w-full max-w-[480px] bg-white rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[85vh]">
            {/* Handle */}
            <div className="flex justify-center py-4">
              <div className="h-1.5 w-12 rounded-full bg-slate-200"></div>
            </div>

            {/* Header */}
            <div className="px-6 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Qidiruv tarixi</h2>
                <p className="text-xs text-slate-500 font-medium">Oxirgi so&apos;rovlaringiz</p>
              </div>
              <button 
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold active:scale-95 transition-all"
              >
                <Trash2 size={14} />
                Tozalash
              </button>
            </div>

            {/* Search History */}
            <div className="px-6 mb-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchHistoryQuery}
                  onChange={(e) => setSearchHistoryQuery(e.target.value)}
                  placeholder="Tarixdan qidirish..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border-none text-sm focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* History Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistory.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleHistoryClick(item.query)}
                      className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === 'voice' ? 'bg-blue-50 text-blue-600' : 
                        item.type === 'image' ? 'bg-purple-50 text-purple-600' : 
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.type === 'voice' ? <Mic size={18} /> : 
                         item.type === 'image' ? <ImageIcon size={18} /> : 
                         <SearchIcon size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.query}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.timestamp}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                    <Clock size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Tarix bo&apos;sh</p>
                  <p className="text-xs text-slate-400 mt-1">Hali hech qanday qidiruv amalga oshirilmagan</p>
                </div>
              )}

              <div className="pt-4 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Barcha tarix yuklandi</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
