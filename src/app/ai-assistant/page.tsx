'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import MedicineCard from '@/components/MedicineCard';
import { Medicine } from '@/data/medicines';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  products?: Medicine[];
  timestamp: Date;
}

interface ApiResponse {
  text: string;
  source: string;
  products: Medicine[];
}

const SAMPLE_PROMPTS = [
  { id: 'headache-fever', label: 'What to take for headache & fever?', text: 'I have a headache and mild fever. What medicine should I take?' },
  { id: 'cough', label: 'Best medicine for dry cough', text: 'What is the best OTC medicine for a dry, tickly cough?' },
  { id: 'allergies', label: 'OTC recommendation for runny nose', text: 'Which OTC medicines are recommended for a runny nose and sneezing due to allergies?' },
  { id: 'stomach', label: 'Remedy for heartburn & indigestion', text: 'What can I take for heartburn and indigestion after meals?' },
  { id: 'sideeffects', label: 'Common side effects of common drugs', text: 'What are common side effects of pain relievers like ibuprofen and paracetamol?' }
];

function formatBotText(text: string) {
  return text.split('\n\n').map((paragraph, index) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(paragraph)) !== null) {
      if (match.index > lastIndex) {
        parts.push(paragraph.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < paragraph.length) {
      parts.push(paragraph.substring(lastIndex));
    }

    if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
      const items = paragraph.split('\n').map((line, idx) => {
        const cleanLine = line.replace(/^[-*]\s+/, '');
        return <li key={idx}>{cleanLine}</li>;
      });
      return <ul key={index} className={styles.msgList}>{items}</ul>;
    }

    return <p key={index} className={styles.msgParagraph}>{parts.length > 0 ? parts : paragraph}</p>;
  });
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am **MediBot**, your clinical AI assistant. I have access to our full pharmaceutical database including **FDA (US)**, **MediData Bangladesh**, and our local directory.\n\nI can help you find the right medicine for your symptoms, check dosages, and understand side effects. **What symptoms or condition are you experiencing?**",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.sender === 'user' ? 'user' as const : 'assistant' as const, content: m.text }));

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: ApiResponse = await res.json();

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.text,
        products: data.products || [],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputVal);
  };

  return (
    <div className={styles.chatPageWrapper}>
      <div className={`${styles.chatContainer} container`}>
        <div className={styles.chatLayout}>
          <aside className={`${styles.sidebar} glass-panel`}>
            <div className={styles.sidebarHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12.01" y1="8" y2="8" />
              </svg>
              <h3>Consultation Center</h3>
            </div>
            <p className={styles.sidebarDesc}>
              Try a sample query below, or type your own symptoms/condition. The AI searches our full product database to find relevant medicines.
            </p>

            <div className={styles.promptsList}>
              {SAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  className={styles.promptBtn}
                  onClick={() => handleSendMessage(prompt.text)}
                  disabled={isTyping}
                >
                  <span className={styles.promptBtnText}>{prompt.label}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" x2="19" y1="12" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ))}
            </div>

            <div className={styles.safeShieldBox}>
              <div className={styles.safeTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Mediknow Shield</span>
              </div>
              <p className={styles.safeDesc}>
                This conversation is fully encrypted. We prioritize clinical privacy and patient data safety.
              </p>
            </div>
          </aside>

          <div className={`${styles.chatWindow} glass-panel`}>
            <div className={styles.chatHeader}>
              <div className={styles.botProfile}>
                <div className={styles.avatarIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" x2="8.01" y1="16" y2="16" />
                    <line x1="16" x2="16.01" y1="16" y2="16" />
                  </svg>
                </div>
                <div className={styles.botInfo}>
                  <span className={styles.botName}>MediBot Assistant</span>
                  <div className={styles.botStatus}>
                    <span className={styles.statusDot}></span>
                    <span>Online & Ready</span>
                  </div>
                </div>
              </div>
              <div className={styles.infoBadge}>
                AI Guidance Only
              </div>
            </div>

            <div className={styles.messagesArea}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.messageUser : styles.messageBot}`}
                >
                  <div className={styles.messageBubble}>
                    {msg.sender === 'bot' ? (
                      <>
                        <div className={styles.markdownContent}>
                          {formatBotText(msg.text)}
                        </div>
                        {msg.products && msg.products.length > 0 && (
                          <div className={styles.productCards}>
                            <p className={styles.productCardsLabel}>
                              Related products from our database:
                            </p>
                            <div className={styles.productCardsGrid}>
                              {msg.products.slice(0, 4).map((med) => (
                                <div key={med.id} className={styles.miniCard}>
                                  <div className={styles.miniCardHeader}>
                                    <span className={styles.miniCardBadge}>{med.category}</span>
                                    {med.isBangladeshi && <span className={styles.miniCardBd}>BD</span>}
                                  </div>
                                  <p className={styles.miniCardName}>{med.name}</p>
                                  <p className={styles.miniCardGeneric}>{med.genericName}</p>
                                  {med.priceBDT ? (
                                    <p className={styles.miniCardPrice}>৳{med.priceBDT.toFixed(2)}</p>
                                  ) : med.price > 0 ? (
                                    <p className={styles.miniCardPrice}>${med.price.toFixed(2)}</p>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className={styles.userText}>{msg.text}</p>
                    )}
                    <span className={styles.messageTime}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className={`${styles.messageWrapper} ${styles.messageBot}`}>
                  <div className={styles.messageBubble}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--light-slate)', marginTop: '0.25rem' }}>
                      Searching database & generating response...
                    </p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSubmit} className={styles.inputArea}>
              <input
                type="text"
                placeholder="Describe your symptoms or ask about a medicine (e.g. I have headache and fever)..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={isTyping}
                className={styles.chatInput}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!inputVal.trim() || isTyping}
                style={{ borderRadius: 'var(--radius-md)', padding: '0.75rem 1.25rem' }}
              >
                Send
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" x2="11" y1="2" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
