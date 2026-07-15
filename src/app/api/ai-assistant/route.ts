import { NextRequest, NextResponse } from 'next/server';
import { fetchMediData } from '@/lib/medidata';
import { MEDICINES_DB, Medicine } from '@/data/medicines';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

async function searchOpenFda(query: string, limit: number): Promise<Medicine[]> {
  try {
    const escapedQ = query.replace(/["\\]/g, '\\$&');
    const searchQuery = `(openfda.brand_name:"${escapedQ}" OR openfda.generic_name:"${escapedQ}" OR openfda.substance_name:"${escapedQ}" OR active_ingredient:"${escapedQ}" OR purpose:"${escapedQ}" OR indications_and_usage:"${escapedQ}") AND (openfda.product_type:"HUMAN OTC DRUG" OR openfda.product_type:"HUMAN PRESCRIPTION DRUG")`;
    const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(searchQuery)}&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item: any) => {
      const ofda = item.openfda || {};
      return {
        id: item.id || ofda.spl_set_id?.[0] || `fda-${Math.random()}`,
        name: (ofda.brand_name?.[0] || ofda.generic_name?.[0] || 'Unknown'),
        genericName: ofda.generic_name?.[0] || '',
        category: 'General Health',
        form: 'Tablet',
        description: (item.indications_and_usage?.[0] || item.purpose?.[0] || '').slice(0, 200),
        uses: [item.indications_and_usage?.[0] || ''].filter(Boolean),
        sideEffects: [item.adverse_reactions?.[0] || ''].filter(Boolean),
        warnings: [item.warnings?.[0] || ''].filter(Boolean),
        dosage: item.dosage_and_administration?.[0] || '',
        prescriptionRequired: (ofda.product_type?.[0] || '').toUpperCase().includes('PRESCRIPTION'),
        price: 0,
        symptoms: [],
        manufacturer: ofda.manufacturer_name?.[0] || '',
        isBangladeshi: false,
        source: 'openfda' as const,
      } satisfies Medicine;
    });
  } catch {
    return [];
  }
}

function searchLocal(query: string, limit: number): Medicine[] {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(t => t.length > 2);
  if (terms.length === 0) return [];
  return MEDICINES_DB
    .filter(m => {
      const haystack = `${m.name} ${m.genericName} ${m.description} ${m.symptoms.join(' ')} ${m.uses.join(' ')} ${m.category}`.toLowerCase();
      return terms.some(t => haystack.includes(t));
    })
    .slice(0, limit);
}

async function searchAllSources(query: string, limit: number): Promise<Medicine[]> {
  const q = query.trim();
  if (!q) return [];

  const [fdaResults, medidataResults, localResults] = await Promise.all([
    searchOpenFda(q, limit),
    fetchMediData({ q, limit: Math.min(limit, 10) }).then(r => r.results).catch(() => [] as Medicine[]),
    Promise.resolve(searchLocal(q, limit)),
  ]);

  const seen = new Set<string>();
  const combined: Medicine[] = [];
  for (const med of [...fdaResults, ...medidataResults, ...localResults]) {
    if (!seen.has(med.id)) { seen.add(med.id); combined.push(med); }
  }
  return combined.slice(0, limit);
}

const SYSTEM_PROMPT_BASE = `You are MediBot, the clinical AI assistant for Mediknow — a medical directory with data from openFDA (US), MediData Bangladesh (BD), and a local medicine database.

RULES:
1. If the user describes emergency symptoms (chest pain, difficulty breathing, stroke signs), IMMEDIATELY advise calling 911 — do NOT recommend any products.
2. ONLY recommend products from the "AVAILABLE PRODUCTS" list below. Never make up products.
3. For each recommendation, reference actual data: uses, dosage, warnings from the product listing.
4. If no product matches, say so honestly.
5. Always end with: "⚠️ This information is for reference only. Consult a healthcare professional before taking any medication."
6. Keep responses concise, use bullet points for recommendations.`;

function buildSystemPrompt(products: Medicine[]): string {
  if (products.length === 0) {
    return `${SYSTEM_PROMPT_BASE}\n\nAVAILABLE PRODUCTS: None found matching the user's query. Be honest that no matching products were found in our database.`;
  }
  const productList = products.map((p, i) =>
    `${i + 1}. ${p.name}${p.genericName ? ` (${p.genericName})` : ''}
   - Category: ${p.category} | Form: ${p.form}${p.isBangladeshi ? ' | 🇧🇩 Bangladesh' : ''}
   - Source: ${p.source === 'medidata' ? 'MediData BD' : p.source === 'openfda' ? 'FDA (US)' : 'Local DB'}
   - ${p.prescriptionRequired ? 'Rx required' : 'OTC'}
   - Description: ${p.description.slice(0, 150)}
   - Uses: ${(p.uses || []).join('; ').slice(0, 200)}
   - Dosage: ${(p.dosage || '').slice(0, 150)}
   - Side Effects: ${(p.sideEffects || []).join('; ').slice(0, 150)}
   - Warnings: ${(p.warnings || []).join('; ').slice(0, 150)}`
  ).join('\n');

  return `${SYSTEM_PROMPT_BASE}\n\nAVAILABLE PRODUCTS:\n${productList}`;
}

function buildFallbackResponse(products: Medicine[], userMessage: string): string {
  const q = userMessage.toLowerCase();
  const EMERGENCY_TERMS = ['chest pain', 'difficulty breathing', 'shortness of breath', 'slurred speech', 'heart attack', 'stroke', 'loss of consciousness', 'severe abdominal pain'];
  if (EMERGENCY_TERMS.some(t => q.includes(t))) {
    return "**CRITICAL WARNING: EMERGENCY STATE DETECTED**\n\nThe symptoms you describe may indicate a **life-threatening medical emergency**.\n\n- **Action Required:** Stop reading and dial **911** immediately or go to the nearest emergency room.\n- **Do NOT** attempt self-medication for these symptoms.\n- This AI tool is not a substitute for emergency medical care.";
  }

  if (products.length === 0) {
    return `I searched our database but couldn't find products matching your description. Try being more specific about your symptoms (e.g., "headache and fever" instead of "I feel sick").\n\n⚠️ This information is for reference only. Consult a healthcare professional before taking any medication.`;
  }

  const scored = products.map(p => {
    const haystack = `${p.name} ${p.genericName} ${p.description} ${(p.uses || []).join(' ')} ${(p.symptoms || []).join(' ')}`.toLowerCase();
    const terms = q.split(/\s+/).filter(t => t.length > 2);
    const score = terms.filter(t => haystack.includes(t)).length;
    return { product: p, score };
  }).sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 5);

  return `Based on your query, here are the most relevant products from our database:\n\n${top.map(({ product: p }) =>
    `**${p.name}**${p.genericName ? ` (${p.genericName})` : ''} — ${p.category}${p.isBangladeshi ? ' 🇧🇩' : ''}\n- ${(p.description || '').slice(0, 120)}\n- ${p.prescriptionRequired ? '⚠️ Prescription required' : '✅ OTC'}\n- ${(p.dosage || 'Consult a physician for dosage.').slice(0, 100)}`
  ).join('\n\n')}\n\n⚠️ This information is for reference only. Always consult a qualified healthcare professional before taking any medication.`;
}

async function callGemini(systemPrompt: string, userMessage: string, history: ChatMessage[]): Promise<string | null> {
  try {
    const contents = [];
    for (const msg of (history || []).slice(-10)) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        contents.push({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] });
      }
    }
    contents.push({ role: 'user', parts: [{ text: `CONTEXT:\n${systemPrompt}\n\nUSER QUERY:\n${userMessage}` }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 1024, temperature: 0.3 } }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`[Gemini] ${res.status}:`, err.slice(0, 200));
      return null;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e: any) {
    console.error('[Gemini] Error:', e?.message || e);
    return null;
  }
}

async function callOpenAi(systemPrompt: string, userMessage: string, history: ChatMessage[]): Promise<string | null> {
  const models = ['gpt-4o-mini', 'gpt-3.5-turbo'];
  for (const model of models) {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...(history || []).slice(-10),
        { role: 'user', content: userMessage },
      ];
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.3 }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch { /* try next model */ }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const products = await searchAllSources(message, 15);
    const systemPrompt = buildSystemPrompt(products);

    // Try Gemini first (free, no billing needed)
    if (GEMINI_API_KEY) {
      const geminiResult = await callGemini(systemPrompt, message, history || []);
      if (geminiResult) {
        return NextResponse.json({ text: geminiResult, source: 'gemini', products: products.slice(0, 8) });
      }
    }

    // Try OpenAI if configured
    if (OPENAI_API_KEY.startsWith('sk-')) {
      const openaiResult = await callOpenAi(systemPrompt, message, history || []);
      if (openaiResult) {
        return NextResponse.json({ text: openaiResult, source: 'openai', products: products.slice(0, 8) });
      }
    }

    // Fallback (always works)
    return NextResponse.json({
      text: buildFallbackResponse(products, message),
      source: 'fallback',
      products: products.slice(0, 8),
    });
  } catch (err: any) {
    console.error('[AI Assistant] Error:', err);
    return NextResponse.json({
      text: 'I encountered an error processing your request. Please try again.',
      source: 'error',
      products: [],
    });
  }
}
