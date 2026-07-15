import { NextRequest, NextResponse } from 'next/server';
import { MEDICINES_DB, Medicine } from '@/data/medicines';
import { fetchMediData, getMediDataStatus } from '@/lib/medidata';

function capitalize(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

function getDeterministicPrice(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return parseFloat((Math.abs(hash % 40) + 5.99).toFixed(2));
}

function cleanFdaText(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/^(Warnings|Warning|Uses|Directions|Purpose|Active ingredient|Inactive ingredients|Other information|Directions for use|Storage and handling)\s*/gi, '')
    .trim();
}

function extractStrength(activeIngredientText: string | undefined): string {
  if (!activeIngredientText) return '';
  const strengthRegex = /(\d+\s*(?:mg|mcg|g|%)(?:\/\d+\s*(?:mL|g|mg))?)/gi;
  const match = activeIngredientText.match(strengthRegex);
  return match ? match[0] : '';
}

function determineCategory(
  purpose: string = '',
  indications: string = '',
  ingredients: string = ''
): string {
  const text = `${purpose} ${indications} ${ingredients}`.toLowerCase();
  if (text.includes('pain') || text.includes('fever') || text.includes('analgesic') || text.includes('headache') || text.includes('migraine') || text.includes('arthritis') || text.includes('nsaid') || text.includes('acetaminophen') || text.includes('ibuprofen') || text.includes('aspirin') || text.includes('naproxen')) return 'Pain Relief';
  if (text.includes('allergy') || text.includes('antihistamine') || text.includes('sneezing') || text.includes('runny nose') || text.includes('itchy') || text.includes('hives') || text.includes('cetirizine') || text.includes('loratadine') || text.includes('fexofenadine') || text.includes('diphenhydramine')) return 'Allergy';
  if (text.includes('acid') || text.includes('heartburn') || text.includes('antacid') || text.includes('diarrhea') || text.includes('constipation') || text.includes('laxative') || text.includes('stomach') || text.includes('indigestion') || text.includes('omeprazole') || text.includes('famotidine') || text.includes('loperamide') || text.includes('calcium carbonate')) return 'Digestive';
  if (text.includes('cough') || text.includes('congestion') || text.includes('expectorant') || text.includes('bronchodilator') || text.includes('asthma') || text.includes('cold') || text.includes('mucus') || text.includes('nasal') || text.includes('albuterol') || text.includes('salbutamol') || text.includes('dextromethorphan') || text.includes('guaifenesin')) return 'Respiratory';
  if (text.includes('cholesterol') || text.includes('statin') || text.includes('blood pressure') || text.includes('hypertension') || text.includes('cardio') || text.includes('heart') || text.includes('atorvastatin') || text.includes('simvastatin') || text.includes('lisinopril') || text.includes('metoprolol') || text.includes('amlodipine')) return 'Cardio';
  return 'General Health';
}

function determineForm(fdaDosageForm: string[] = []): string {
  if (!fdaDosageForm || fdaDosageForm.length === 0) return 'Tablet';
  const formText = fdaDosageForm.join(' ').toLowerCase();
  if (formText.includes('tablet') || formText.includes('capsule') || formText.includes('caplet') || formText.includes('pill')) return 'Tablet';
  if (formText.includes('syrup') || formText.includes('liquid') || formText.includes('solution') || formText.includes('elixir') || formText.includes('suspension')) return 'Syrup';
  if (formText.includes('inhalation') || formText.includes('inhaler') || formText.includes('aerosol') || formText.includes('spray')) return 'Inhaler';
  if (formText.includes('gel') || formText.includes('cream') || formText.includes('ointment') || formText.includes('paste')) return 'Gel';
  if (formText.includes('drop') || formText.includes('ophthalmic') || formText.includes('otic')) return 'Drops';
  return capitalize(fdaDosageForm[0]);
}

const SYMPTOMS_KEYWORDS = [
  { id: 'headache', keywords: ['headache', 'head ache', 'migraine'] },
  { id: 'migraine', keywords: ['migraine'] },
  { id: 'fever', keywords: ['fever', 'pyrexia', 'high temperature'] },
  { id: 'sore throat', keywords: ['sore throat', 'throat irritation', 'pharyngitis'] },
  { id: 'dry cough', keywords: ['dry cough', 'hacking cough'] },
  { id: 'wet cough', keywords: ['wet cough', 'productive cough', 'chest congestion', 'mucus'] },
  { id: 'running nose', keywords: ['runny nose', 'running nose', 'rhinorrhea'] },
  { id: 'stuffy nose', keywords: ['stuffy nose', 'nasal congestion', 'blocked nose'] },
  { id: 'heartburn', keywords: ['heartburn', 'acid reflux', 'gerd'] },
  { id: 'indigestion', keywords: ['indigestion', 'dyspepsia', 'sour stomach'] },
  { id: 'diarrhea', keywords: ['diarrhea', 'loose stool', 'runny bowel'] },
  { id: 'muscle pain', keywords: ['muscle pain', 'myalgia', 'body aches', 'soreness'] },
  { id: 'joint pain', keywords: ['joint pain', 'arthritis', 'joint stiffness'] },
  { id: 'sneezing', keywords: ['sneezing', 'sneeze'] },
  { id: 'itchy eyes', keywords: ['itchy eyes', 'watery eyes', 'eye irritation'] }
];

function extractSymptoms(usesText: string = '', descriptionText: string = ''): string[] {
  const text = `${usesText} ${descriptionText}`.toLowerCase();
  const matched = new Set<string>();
  for (const item of SYMPTOMS_KEYWORDS) {
    for (const kw of item.keywords) {
      if (text.includes(kw)) { matched.add(item.id); break; }
    }
  }
  return Array.from(matched);
}

function mapFdaResultToMedicine(item: any): Medicine {
  const openfda = item.openfda || {};
  const rawId = item.id || openfda.spl_set_id?.[0] || (openfda.brand_name?.[0] || '') + '-' + (openfda.generic_name?.[0] || '') + '-' + (openfda.manufacturer_name?.[0] || '');
  const id = rawId || 'unknown-drug';
  const rawBrandName = openfda.brand_name?.[0] || openfda.generic_name?.[0] || 'Unknown Medicine';
  const brandName = capitalize(rawBrandName);
  const rawGenericName = openfda.generic_name?.[0] || openfda.substance_name?.[0] || 'Active Ingredients Unavailable';
  const genericName = capitalize(rawGenericName);
  const manufacturer = openfda.manufacturer_name?.[0] || 'Unknown Manufacturer';
  const activeIngredient = item.active_ingredient?.[0] || '';
  const strength = extractStrength(activeIngredient);
  const purpose = item.purpose?.[0] || '';
  const indications = item.indications_and_usage?.[0] || '';
  const description = cleanFdaText(indications || purpose || item.description?.[0] || 'No clinical description available.');
  let uses: string[] = [];
  const rawUses = cleanFdaText(indications || purpose || '');
  if (rawUses) {
    uses = rawUses.split(/(?:\.|\b(?:and|or)\b)\s+/g).map(u => u.trim()).filter(u => u.length > 8 && !u.toLowerCase().startsWith('uses') && !u.toLowerCase().startsWith('temporarily')).slice(0, 4);
    if (uses.length === 0) uses = [rawUses.slice(0, 100) + '...'];
  } else { uses = ['Relief of indicated symptoms.']; }
  let sideEffects: string[] = [];
  const rawAdverse = cleanFdaText(item.adverse_reactions?.[0] || '');
  if (rawAdverse) { sideEffects = rawAdverse.split(/[.;:]\s+/g).map(s => s.trim()).filter(s => s.length > 10 && s.length < 150).slice(0, 3); }
  if (sideEffects.length === 0) sideEffects = ['Mild drowsiness (rare)', 'Headache (rare)', 'Mild nausea (rare)'];
  let warnings: string[] = [];
  const rawWarnings = cleanFdaText(item.warnings?.[0] || item.warnings_and_precautions?.[0] || '');
  if (rawWarnings) {
    warnings = rawWarnings.split(/(?:•|\b(?:stop use and ask a doctor if|do not use if|ask a doctor before use if)\b)/gi).map(w => w.trim()).filter(w => w.length > 15 && w.length < 200).slice(0, 3);
    if (warnings.length === 0) warnings = rawWarnings.split(/[.;]\s+/g).map(w => w.trim()).filter(w => w.length > 15).slice(0, 3);
  }
  if (warnings.length === 0) warnings = ['Do not exceed the recommended dose.', 'Keep out of reach of children.', 'Consult a physician if symptoms persist or worsen.'];
  const rawDosage = cleanFdaText(item.dosage_and_administration?.[0] || 'Take as directed by a healthcare professional.');
  const dosage = rawDosage.length > 250 ? rawDosage.slice(0, 250) + '...' : rawDosage;
  const category = determineCategory(purpose, indications, rawGenericName);
  const dosageForms = openfda.dosage_form || [];
  const form = determineForm(dosageForms);
  const productType = openfda.product_type?.[0] || '';
  const prescriptionRequired = productType.toUpperCase().includes('PRESCRIPTION');
  const price = getDeterministicPrice(id);
  const symptoms = extractSymptoms(indications || purpose, description);
  return {
    id, name: brandName, genericName: rawGenericName ? `${genericName} ${strength}`.trim() : brandName,
    category, form, description: description.length > 180 ? description.slice(0, 180) + '...' : description,
    uses, sideEffects, warnings, dosage, prescriptionRequired, price, symptoms, strength, manufacturer,
    dosageForms: dosageForms.map((df: string) => capitalize(df)), images: [], isExternal: true,
  };
}

function searchLocal(q: string, category: string, form: string, prescription: string, limit: number, skip: number) {
  let filtered = MEDICINES_DB;
  if (q) {
    const qLower = q.toLowerCase();
    filtered = filtered.filter((med) => med.name.toLowerCase().includes(qLower) || med.genericName.toLowerCase().includes(qLower) || med.description.toLowerCase().includes(qLower) || med.symptoms.some(s => s.toLowerCase().includes(qLower)));
  }
  if (category !== 'All') filtered = filtered.filter(med => med.category === category);
  if (form !== 'All') filtered = filtered.filter(med => med.form === form);
  if (prescription !== 'All') filtered = filtered.filter(med => (prescription === 'OTC' && !med.prescriptionRequired) || (prescription === 'Rx' && med.prescriptionRequired));
  return { results: filtered.slice(skip, skip + limit), total: filtered.length, fallback: true };
}

async function searchOpenFda(q: string, category: string, form: string, prescription: string, limit: number, skip: number): Promise<{ results: Medicine[]; total: number } | null> {
  try {
    const searchParts: string[] = [];
    if (q) {
      const escapedQ = q.replace(/["\\]/g, '\\$&');
      searchParts.push(`(openfda.brand_name:"${escapedQ}" OR openfda.generic_name:"${escapedQ}" OR openfda.substance_name:"${escapedQ}" OR active_ingredient:"${escapedQ}" OR purpose:"${escapedQ}" OR indications_and_usage:"${escapedQ}")`);
    } else {
      searchParts.push('_exists_:openfda.brand_name');
    }
    if (prescription === 'Rx') searchParts.push('openfda.product_type:"HUMAN PRESCRIPTION DRUG"');
    else if (prescription === 'OTC') searchParts.push('openfda.product_type:"HUMAN OTC DRUG"');
    else searchParts.push('(openfda.product_type:"HUMAN OTC DRUG" OR openfda.product_type:"HUMAN PRESCRIPTION DRUG")');
    if (category === 'Pain Relief') searchParts.push('(purpose:pain OR purpose:fever OR purpose:analgesic OR indications_and_usage:pain OR indications_and_usage:fever)');
    else if (category === 'Allergy') searchParts.push('(purpose:allergy OR purpose:antihistamine OR purpose:sneezing OR indications_and_usage:allergy OR indications_and_usage:antihistamine)');
    else if (category === 'Digestive') searchParts.push('(purpose:acid OR purpose:heartburn OR purpose:antacid OR purpose:diarrhea OR purpose:laxative OR indications_and_usage:heartburn OR indications_and_usage:indigestion)');
    else if (category === 'Respiratory') searchParts.push('(purpose:cough OR purpose:congestion OR purpose:expectorant OR indications_and_usage:cough OR indications_and_usage:bronchitis)');
    else if (category === 'Cardio') searchParts.push('(openfda.generic_name:atorvastatin OR openfda.generic_name:metoprolol OR openfda.generic_name:amlodipine OR indications_and_usage:cholesterol OR indications_and_usage:hypertension)');
    if (form === 'Tablet') searchParts.push('(openfda.dosage_form:tablet OR openfda.dosage_form:capsule OR openfda.dosage_form:caplet)');
    else if (form === 'Syrup') searchParts.push('(openfda.dosage_form:syrup OR openfda.dosage_form:liquid OR openfda.dosage_form:solution OR openfda.dosage_form:suspension)');
    else if (form === 'Inhaler') searchParts.push('(openfda.dosage_form:inhalation OR openfda.dosage_form:inhaler OR openfda.dosage_form:aerosol)');
    else if (form === 'Gel') searchParts.push('(openfda.dosage_form:gel OR openfda.dosage_form:cream OR openfda.dosage_form:ointment)');
    else if (form === 'Drops') searchParts.push('(openfda.dosage_form:drops OR openfda.dosage_form:ophthalmic OR openfda.dosage_form:otic)');

    const searchQuery = searchParts.join(' AND ');
    const apiKey = process.env.OPENFDA_API_KEY;
    const apiKeyParam = apiKey ? `&api_key=${apiKey}` : '';
    const openFdaUrl = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(searchQuery)}&limit=${limit}&skip=${skip}${apiKeyParam}`;

    const fdaResponse = await fetch(openFdaUrl, { signal: AbortSignal.timeout(10000) });
    if (fdaResponse.status === 404) return { results: [], total: 0 };
    if (!fdaResponse.ok) throw new Error(`openFDA error: ${fdaResponse.status}`);
    const data = await fdaResponse.json();
    const fdaResults = data.results || [];
    return { results: fdaResults.map(mapFdaResultToMedicine), total: data.meta?.results?.total || fdaResults.length };
  } catch (error) {
    console.error('[openFDA] Error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '30', 10);
  const skip = parseInt(searchParams.get('skip') || '0', 10);
  const category = searchParams.get('category') || 'All';
  const form = searchParams.get('form') || 'All';
  const prescription = searchParams.get('prescription') || 'All';
  const source = searchParams.get('source') || 'all';

  // source=medidata → only MediData
  if (source === 'medidata') {
    const r = await fetchMediData({ q, category, form, prescription, limit, skip });
    return NextResponse.json({ results: r.results, total: r.total, fallback: r.fallback, source: 'medidata', error: r.error });
  }

  // source=local → only local DB
  if (source === 'local') {
    return NextResponse.json({ ...searchLocal(q, category, form, prescription, limit, skip), source: 'local' });
  }

  // source=all: try openFDA → MediData → local
  if (!q && category === 'All' && form === 'All' && prescription === 'All') {
    // Empty browse: try MediData first (fast, paginated), then openFDA, then local
    const mdResult = await fetchMediData({ q: '', category: 'All', form: 'All', prescription: 'All', limit, skip });
    if (mdResult.results.length > 0 && !mdResult.error) {
      return NextResponse.json({ results: mdResult.results, total: mdResult.total, fallback: false, source: 'medidata' });
    }
    const fdaResult = await searchOpenFda(q, category, form, prescription, limit, skip);
    if (fdaResult && fdaResult.results.length > 0) {
      return NextResponse.json({ results: fdaResult.results, total: fdaResult.total, fallback: false, source: 'openfda' });
    }
    return NextResponse.json({ ...searchLocal(q, category, form, prescription, limit, skip), source: 'local' });
  }

  // With query/filters: try openFDA → MediData → local
  const fdaResult = await searchOpenFda(q, category, form, prescription, limit, skip);
  if (fdaResult && fdaResult.results.length > 0) {
    return NextResponse.json({ results: fdaResult.results, total: fdaResult.total, fallback: false, source: 'openfda' });
  }

  const mdResult = await fetchMediData({ q, category, form, prescription, limit, skip });
  if (mdResult.results.length > 0) {
    return NextResponse.json({ results: mdResult.results, total: mdResult.total, fallback: false, source: 'medidata' });
  }

  return NextResponse.json({ ...searchLocal(q, category, form, prescription, limit, skip), source: 'local' });
}
