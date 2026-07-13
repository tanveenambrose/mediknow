'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const SAMPLE_PROMPTS = [
  { id: 'fever', label: 'What is the dosage for Paracetamol in adults?', text: 'What is the standard dosage of Paracetamol for adults, and what precautions should I take?' },
  { id: 'mixing', label: 'Can I take Ibuprofen with Paracetamol?', text: 'Is it safe to take Ibuprofen and Paracetamol together for pain relief?' },
  { id: 'allergies', label: 'OTC recommendation for a runny nose', text: 'Which OTC medicines are recommended for a runny nose and sneezing due to allergies?' },
  { id: 'sideeffects', label: 'What are Atorvastatin side effects?', text: 'What are the common side effects and warnings associated with Atorvastatin?' }
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am MediBot, your clinical AI assistant. I can help answer questions about general medicine dosages, usages, side effects, and precautions. \n\n**Please note:** I am an AI, not a doctor. My answers are for informational purposes only. What medical query can I assist you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle message sending
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // 2. Set typing state
    setIsTyping(true);

    // 3. Simulate bot response after a brief delay
    setTimeout(() => {
      const responseText = getSimulatedResponse(text);
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputVal);
  };

  // Helper function to format bot markdown text
  const formatBotText = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => {
      // Bold markdown **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
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

      // Check if it's a list
      if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
        const items = paragraph.split('\n').map((line, idx) => {
          const cleanLine = line.replace(/^[-*]\s+/, '');
          return <li key={idx}>{cleanLine}</li>;
        });
        return <ul key={index} className={styles.msgList}>{items}</ul>;
      }

      // Render standard paragraph
      return <p key={index} className={styles.msgParagraph}>{parts.length > 0 ? parts : paragraph}</p>;
    });
  };

  return (
    <div className={styles.chatPageWrapper}>
      <div className={`${styles.chatContainer} container`}>
        <div className={styles.chatLayout}>
          
          {/* Sidebar Panel */}
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
              Click one of our sample queries below to see how our AI handles clinical calculations.
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

          {/* Main Chat Interface */}
          <div className={`${styles.chatWindow} glass-panel`}>
            
            {/* Header */}
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

            {/* Messages Scroll Area */}
            <div className={styles.messagesArea}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageWrapper} ${
                    msg.sender === 'user' ? styles.messageUser : styles.messageBot
                  }`}
                >
                  <div className={styles.messageBubble}>
                    {msg.sender === 'bot' ? (
                      <div className={styles.markdownContent}>
                        {formatBotText(msg.text)}
                      </div>
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
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Area */}
            <form onSubmit={handleSubmit} className={styles.inputArea}>
              <input
                type="text"
                placeholder="Ask about dosage, medicine symptoms, warnings (e.g. Is Paracetamol safe for headaches?)..."
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

// Simulated Intelligent Clinical Response Parser
function getSimulatedResponse(query: string): string {
  const q = query.toLowerCase();

  // 1. Check for emergency red flags
  if (
    q.includes('chest pain') ||
    q.includes('breathing difficulty') ||
    q.includes('breath shortness') ||
    q.includes('slurred speech') ||
    q.includes('heart attack') ||
    q.includes('stroke')
  ) {
    return "**CRITICAL WARNING: EMERGENCY STATE DETECTED**\n\nThe symptoms you are describing are indicators of a **life-threatening medical emergency**.\n\n- **Action Required:** Stop reading immediately and dial **911** or visit the nearest emergency room.\n- **Do NOT** attempt to take self-prescribed medication (like paracetamol, ibuprofen, or antacids) for these symptoms.";
  }

  // 2. Paracetamol / Acetaminophen
  if (q.includes('paracetamol') || q.includes('acetaminophen')) {
    if (q.includes('dosage') || q.includes('dose') || q.includes('take')) {
      return "**Clinical Dosage Guidelines for Paracetamol (500mg Tablets):**\n\n- **For Adults:** The standard dosage is **1 to 2 tablets (500mg - 1000mg)** every 4 to 6 hours as needed.\n- **Maximum Daily Limit:** Do NOT exceed **4,000mg (8 tablets)** in any 24-hour period.\n- **Liver Warning:** Exceeding the maximum dose can lead to severe, irreversible liver damage.\n\n**Important Precautions:**\n- Avoid combining this with other medications that contain paracetamol (such as cough & cold syrups).\n- Speak to a doctor if you consume more than 3 alcoholic drinks daily.";
    }
    return "**Acetomed Paracetamol Information:**\n\n- **Indication:** Used to manage mild to moderate pain (headaches, muscular aches, toothaches) and reduce fever.\n- **Safety Profile:** Highly effective, but poses a **severe liver risk** if taken in excess.\n- **Availability:** Over-The-Counter (OTC). No prescription required.\n\nIs there a specific query you have about paracetamol (e.g. dosage, side effects)?";
  }

  // 3. Ibuprofen
  if (q.includes('ibuprofen') || q.includes('advil')) {
    if (q.includes('dosage') || q.includes('dose') || q.includes('take')) {
      return "**Clinical Dosage Guidelines for Ibuprofen (400mg):**\n\n- **For Adults:** Take **1 tablet (400mg)** every 6 to 8 hours as needed.\n- **Food Intake:** Always take ibuprofen with food or a glass of milk to reduce stomach lining irritation.\n- **Maximum Daily Limit:** Do not exceed **3 tablets (1200mg)** in 24 hours unless directed by a physician.\n\n**Stomach Ulcer Warning:** Long term use or high doses can cause gastrointestinal bleeding and kidney impairment.";
    }
    return "**Ibu-Pro Relief (Ibuprofen) Information:**\n\n- **Indication:** A Nonsteroidal Anti-Inflammatory Drug (NSAID) used to relieve pain, swelling, inflammation, and stiffness associated with arthritis, muscle strains, or menstrual pain.\n- **Safety Warning:** Avoid if you have active stomach ulcers, kidney diseases, or heart conditions.\n\nWould you like details on ibuprofen dosage, warnings, or how it differs from paracetamol?";
  }

  // 4. Mixing Paracetamol and Ibuprofen
  if (
    (q.includes('paracetamol') && q.includes('ibuprofen')) ||
    (q.includes('acetaminophen') && q.includes('ibuprofen')) ||
    (q.includes('mix') || q.includes('together') || q.includes('combine'))
  ) {
    return "**Combining Paracetamol and Ibuprofen:**\n\n- **Yes, it is generally safe:** Because they belong to different drug classes and are processed by different organs (paracetamol by the liver, ibuprofen by the kidneys), adults can take them together.\n- **Alternating Schedule:** It is often clinically recommended to alternate them (e.g., take Paracetamol, wait 3 hours, take Ibuprofen, wait 3 hours) to provide continuous pain coverage.\n- **Crucial Caution:** Ensure you do not exceed the individual daily maximums of either drug: **4000mg for Paracetamol** and **1200mg for Ibuprofen**.";
  }

  // 5. Allergy / Runny Nose / Antihistamines
  if (
    q.includes('runny nose') ||
    q.includes('sneezing') ||
    q.includes('allergy') ||
    q.includes('allergies') ||
    q.includes('cetirizine')
  ) {
    return "**Allergy & Rhinitis Recommendations:**\n\n- **Recommended Medicine:** **Ceti-Tabs (Cetirizine Hydrochloride 10mg)** is an effective 24-hour non-drowsy antihistamine.\n- **Action:** Blocks histamines to relieve runny nose, sneezing, itchy/watery eyes, and nasal allergies.\n- **Dosage:** **1 tablet (10mg) daily**. Do not exceed 1 tablet in 24 hours.\n\n**Clinical Advisory:**\n- May cause mild drowsiness in some individuals. Avoid alcohol and driving until you know how it affects you.\n- If congestion (stuffy nose) is also present, an expectorant like **Guaifenesin** or a nasal spray may be more appropriate.";
  }

  // 6. Cough / Chest Congestion
  if (q.includes('cough') || q.includes('congestion') || q.includes('mucus') || q.includes('guaifenesin')) {
    if (q.includes('dry') || q.includes('tickly')) {
      return "**Dry Cough Relief:**\n\n- **Recommended Medicine:** **Dextro-Cough Suppressant (Dextromethorphan HBr Syrup)**.\n- **Action:** Suppresses the cough reflex in the brain to quiet hacking coughs.\n- **Dosage:** **10mL (30mg)** every 6 to 8 hours. Max 40mL in 24 hours.\n- **Warning:** Do not take if you are on MAOIs (certain anti-depressants).";
    }
    return "**Wet Cough / Chest Congestion Relief:**\n\n- **Recommended Medicine:** **Mucus-Clear Expectorant (Guaifenesin Syrup)**.\n- **Action:** Thins and loosens mucus in the lungs, making wet coughs more productive to clear air passages.\n- **Dosage:** **10mL to 20mL** every 4 hours. Max 120mL per 24 hours.\n- **Tip:** Drink a full glass of water with each dose to help thin the mucus.";
  }

  // 7. Stomach / Acid Reflux / Heartburn
  if (q.includes('heartburn') || q.includes('acid reflux') || q.includes('indigestion') || q.includes('omeprazole')) {
    return "**Acid Reflux & Heartburn Relief:**\n\n- **For Fast Relief:** **Tumi-Calm Chews (Calcium Carbonate 750mg)** works immediately by neutralizing acid on contact. Chew 2-4 tablets as symptoms occur.\n- **For Long-Term Control:** **Ome-Shield (Omeprazole 20mg)** reduces acid production. Take **1 tablet daily in the morning** 30-60 minutes before breakfast. (Takes 1-4 days for full effect, use for a 14-day course).\n\n**Warning:** Do not take Omeprazole for more than 14 days without consulting a gastroenterologist.";
  }

  // 8. Atorvastatin / Cholesterol
  if (q.includes('atorvastatin') || q.includes('cholesterol') || q.includes('lipitor')) {
    return "**Lipi-Guard Atorvastatin Calcium (20mg) Clinical Details:**\n\n- **Indication:** A prescription-only statin used to lower blood cholesterol, LDL ('bad') cholesterol, and reduce cardiovascular risks.\n- **Dosage:** Usually **1 tablet daily**, taken at the same time every day, with or without food.\n- **Critical Warnings:**\n  - **Muscle Risk:** Contact your doctor immediately if you experience unexplained muscle pain, tenderness, or weakness (myalgia).\n  - **Dietary:** Avoid Grapefruit juice, which increases atorvastatin blood levels to unsafe limits.\n  - **Pregnancy:** Atorvastatin is contraindicated during pregnancy.";
  }

  // 9. Generic Medicine Question
  return "**General Medical Advice:**\n\nFor most common conditions:\n- **Pain & Fever:** Paracetamol (Analgesic) or Ibuprofen (NSAID/Anti-inflammatory).\n- **Allergies:** Cetirizine (Antihistamine).\n- **Cough:** Dextromethorphan (for Dry cough) or Guaifenesin (for Wet/productive cough).\n- **Stomach Issues:** Calcium Carbonate (instant relief) or Omeprazole (long-term PPI).\n\n**Safety Checklist:**\n1. Always review the **Active Ingredients** to avoid double-dosing.\n2. Check if a drug is **OTC** (Over-The-Counter) or **Rx** (Prescription Required).\n3. Consult your pharmacist or physician before starting any new pharmacological regimen.";
}
