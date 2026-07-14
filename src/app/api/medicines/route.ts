import { NextRequest, NextResponse } from 'next/server';
import { MEDICINES_DB, Medicine } from '@/data/medicines';

// Simple helper to capitalize strings nicely
function capitalize(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

// Deterministic price generator based on medicine ID string
function getDeterministicPrice(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate a price between $5.99 and $45.99
  const price = Math.abs(hash % 40) + 5.99;
  return parseFloat(price.toFixed(2));
}

// Clean text by removing common FDA boilerplate tags or headings
function cleanFdaText(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/^(Warnings|Warning|Uses|Directions|Purpose|Active ingredient|Inactive ingredients|Other information|Directions for use|Storage and handling)\s*/gi, '')
    .trim();
}

// Extract strength (e.g. "500 mg", "10mg/5mL") from active ingredient string
function extractStrength(activeIngredientText: string | undefined): string {
  if (!activeIngredientText) return '';
  // Match common drug strength formats like "500 mg", "10 mg", "10mg/5mL", "0.05%"
  const strengthRegex = /(\d+\s*(?:mg|mcg|g|%)(?:\/\d+\s*(?:mL|g|mg))?)/gi;
  const match = activeIngredientText.match(strengthRegex);
  return match ? match[0] : '';
}

// Categorize drug based on keywords in purpose/indications/ingredients
function determineCategory(
  purpose: string = '',
  indications: string = '',
  ingredients: string = ''
): string {
  const text = `${purpose} ${indications} ${ingredients}`.toLowerCase();
  
  if (
    text.includes('pain') ||
    text.includes('fever') ||
    text.includes('analgesic') ||
    text.includes('headache') ||
    text.includes('migraine') ||
    text.includes('arthritis') ||
    text.includes('nsaid') ||
    text.includes('acetaminophen') ||
    text.includes('ibuprofen') ||
    text.includes('aspirin') ||
    text.includes('naproxen')
  ) {
    return 'Pain Relief';
  }
  
  if (
    text.includes('allergy') ||
    text.includes('antihistamine') ||
    text.includes('sneezing') ||
    text.includes('runny nose') ||
    text.includes('itchy') ||
    text.includes('hives') ||
    text.includes('cetirizine') ||
    text.includes('loratadine') ||
    text.includes('fexofenadine') ||
    text.includes('diphenhydramine')
  ) {
    return 'Allergy';
  }
  
  if (
    text.includes('acid') ||
    text.includes('heartburn') ||
    text.includes('antacid') ||
    text.includes('diarrhea') ||
    text.includes('constipation') ||
    text.includes('laxative') ||
    text.includes('stomach') ||
    text.includes('indigestion') ||
    text.includes('omeprazole') ||
    text.includes('famotidine') ||
    text.includes('loperamide') ||
    text.includes('calcium carbonate')
  ) {
    return 'Digestive';
  }
  
  if (
    text.includes('cough') ||
    text.includes('congestion') ||
    text.includes('expectorant') ||
    text.includes('bronchodilator') ||
    text.includes('asthma') ||
    text.includes('cold') ||
    text.includes('mucus') ||
    text.includes('nasal') ||
    text.includes('albuterol') ||
    text.includes('salbutamol') ||
    text.includes('dextromethorphan') ||
    text.includes('guaifenesin')
  ) {
    return 'Respiratory';
  }
  
  if (
    text.includes('cholesterol') ||
    text.includes('statin') ||
    text.includes('blood pressure') ||
    text.includes('hypertension') ||
    text.includes('cardio') ||
    text.includes('heart') ||
    text.includes('atorvastatin') ||
    text.includes('simvastatin') ||
    text.includes('lisinopril') ||
    text.includes('metoprolol') ||
    text.includes('amlodipine')
  ) {
    return 'Cardio';
  }
  
  return 'General Health';
}

// Map FDA dosage forms to Mediknow standard forms
function determineForm(fdaDosageForm: string[] = []): string {
  if (!fdaDosageForm || fdaDosageForm.length === 0) return 'Tablet';
  
  const formText = fdaDosageForm.join(' ').toLowerCase();
  
  if (formText.includes('tablet') || formText.includes('capsule') || formText.includes('caplet') || formText.includes('pill')) {
    return 'Tablet';
  }
  if (formText.includes('syrup') || formText.includes('liquid') || formText.includes('solution') || formText.includes('elixir') || formText.includes('suspension')) {
    return 'Syrup';
  }
  if (formText.includes('inhalation') || formText.includes('inhaler') || formText.includes('aerosol') || formText.includes('spray')) {
    return 'Inhaler';
  }
  if (formText.includes('gel') || formText.includes('cream') || formText.includes('ointment') || formText.includes('paste')) {
    return 'Gel';
  }
  if (formText.includes('drop') || formText.includes('ophthalmic') || formText.includes('otic')) {
    return 'Drops';
  }
  
  return capitalize(fdaDosageForm[0]);
}

// Map descriptions and text to extract matching symptoms
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
      if (text.includes(kw)) {
        matched.add(item.id);
        break;
      }
    }
  }
  
  return Array.from(matched);
}

// Convert openFDA label item to Mediknow Medicine structure
function mapFdaResultToMedicine(item: any): Medicine {
  const openfda = item.openfda || {};
  
  // Use a deterministic fallback ID based on brand name + generic name to avoid non-determinism
  const rawId = item.id || openfda.spl_set_id?.[0] || 
    (openfda.brand_name?.[0] || '') + '-' + (openfda.generic_name?.[0] || '') + '-' + (openfda.manufacturer_name?.[0] || '');
  const id = rawId || 'unknown-drug';
  
  // Extract names
  const rawBrandName = openfda.brand_name?.[0] || openfda.generic_name?.[0] || 'Unknown Medicine';
  const brandName = capitalize(rawBrandName);
  
  const rawGenericName = openfda.generic_name?.[0] || openfda.substance_name?.[0] || 'Active Ingredients Unavailable';
  const genericName = capitalize(rawGenericName);
  
  const manufacturer = openfda.manufacturer_name?.[0] || 'Unknown Manufacturer';
  
  // Extract text fields
  const activeIngredient = item.active_ingredient?.[0] || '';
  const strength = extractStrength(activeIngredient);
  
  const purpose = item.purpose?.[0] || '';
  const indications = item.indications_and_usage?.[0] || '';
  
  const description = cleanFdaText(indications || purpose || item.description?.[0] || 'No clinical description available.');
  
  // Extract uses (split by sentences or common lists)
  let uses: string[] = [];
  const rawUses = cleanFdaText(indications || purpose || '');
  if (rawUses) {
    uses = rawUses
      .split(/(?:\.|\b(?:and|or)\b)\s+/g)
      .map(u => u.trim())
      .filter(u => u.length > 8 && !u.toLowerCase().startsWith('uses') && !u.toLowerCase().startsWith('temporarily'))
      .slice(0, 4);
      
    if (uses.length === 0) {
      uses = [rawUses.slice(0, 100) + '...'];
    }
  } else {
    uses = ['Relief of indicated symptoms.'];
  }
  
  // Extract side effects from adverse reactions
  let sideEffects: string[] = [];
  const rawAdverse = cleanFdaText(item.adverse_reactions?.[0] || '');
  if (rawAdverse) {
    sideEffects = rawAdverse
      .split(/[.;:]\s+/g)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s.length < 150)
      .slice(0, 3);
  }
  if (sideEffects.length === 0) {
    sideEffects = ['Mild drowsiness (rare)', 'Headache (rare)', 'Mild nausea (rare)'];
  }
  
  // Extract warnings
  let warnings: string[] = [];
  const rawWarnings = cleanFdaText(item.warnings?.[0] || item.warnings_and_precautions?.[0] || '');
  if (rawWarnings) {
    warnings = rawWarnings
      .split(/(?:•|\b(?:stop use and ask a doctor if|do not use if|ask a doctor before use if)\b)/gi)
      .map(w => w.trim())
      .filter(w => w.length > 15 && w.length < 200)
      .slice(0, 3);
      
    if (warnings.length === 0) {
      // Split by sentences
      warnings = rawWarnings
        .split(/[.;]\s+/g)
        .map(w => w.trim())
        .filter(w => w.length > 15)
        .slice(0, 3);
    }
  }
  if (warnings.length === 0) {
    warnings = [
      'Do not exceed the recommended dose.',
      'Keep out of reach of children.',
      'Consult a physician if symptoms persist or worsen.'
    ];
  }
  
  // Extract dosage
  const rawDosage = cleanFdaText(item.dosage_and_administration?.[0] || 'Take as directed by a healthcare professional.');
  const dosage = rawDosage.length > 250 ? rawDosage.slice(0, 250) + '...' : rawDosage;
  
  // Determine categories & forms
  const category = determineCategory(purpose, indications, rawGenericName);
  const dosageForms = openfda.dosage_form || [];
  const form = determineForm(dosageForms);
  
  // Prescription requirement
  const productType = openfda.product_type?.[0] || '';
  const prescriptionRequired = productType.toUpperCase().includes('PRESCRIPTION');
  
  // Price
  const price = getDeterministicPrice(id);
  
  // Symptoms
  const symptoms = extractSymptoms(indications || purpose, description);
  
  return {
    id,
    name: brandName,
    genericName: rawGenericName ? `${genericName} ${strength}`.trim() : brandName,
    category,
    form,
    description: description.length > 180 ? description.slice(0, 180) + '...' : description,
    uses,
    sideEffects,
    warnings,
    dosage,
    prescriptionRequired,
    price,
    symptoms,
    strength,
    manufacturer,
    dosageForms: dosageForms.map((df: string) => capitalize(df)),
    images: [], // Client will resolve using DailyMed
    isExternal: true
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '30', 10);
  const skip = parseInt(searchParams.get('skip') || '0', 10);
  const category = searchParams.get('category') || 'All';
  const form = searchParams.get('form') || 'All';
  const prescription = searchParams.get('prescription') || 'All';
  
  // Helper local search function for offline/fallback mode
  const searchLocal = () => {
    let localFiltered = MEDICINES_DB;
    
    if (q) {
      const qLower = q.toLowerCase();
      localFiltered = localFiltered.filter((med) => 
        med.name.toLowerCase().includes(qLower) ||
        med.genericName.toLowerCase().includes(qLower) ||
        med.description.toLowerCase().includes(qLower) ||
        med.symptoms.some(s => s.toLowerCase().includes(qLower))
      );
    }
    
    if (category !== 'All') {
      localFiltered = localFiltered.filter(med => med.category === category);
    }
    
    if (form !== 'All') {
      localFiltered = localFiltered.filter(med => med.form === form);
    }
    
    if (prescription !== 'All') {
      localFiltered = localFiltered.filter(med => 
        (prescription === 'OTC' && !med.prescriptionRequired) ||
        (prescription === 'Rx' && med.prescriptionRequired)
      );
    }
    
    const pageItems = localFiltered.slice(skip, skip + limit);
    return {
      results: pageItems,
      total: localFiltered.length,
      fallback: true
    };
  };

  // For empty search with default filters, use local DB directly (instant vs 10-30s openFDA query)
  if (!q && category === 'All' && form === 'All' && prescription === 'All') {
    return NextResponse.json(searchLocal());
  }

  try {
    // Build openFDA search query
    // Base search terms
    let searchParts: string[] = [];
    
    if (q) {
      // Escape special characters for Lucene/openFDA query syntax
      const escapedQ = q.replace(/["\\]/g, '\\$&');
      // openFDA Elasticsearch: use space-separated OR inside parentheses
      // These will be properly encoded by encodeURIComponent
      searchParts.push(`(openfda.brand_name:"${escapedQ}" OR openfda.generic_name:"${escapedQ}" OR openfda.substance_name:"${escapedQ}" OR active_ingredient:"${escapedQ}" OR purpose:"${escapedQ}" OR indications_and_usage:"${escapedQ}")`);
    } else {
      // If no query, return general finished human drugs
      searchParts.push('_exists_:openfda.brand_name');
    }
    
    // Add Prescription status filter
    // Note: openFDA product_type values use spaces, not + signs
    if (prescription === 'Rx') {
      searchParts.push('openfda.product_type:"HUMAN PRESCRIPTION DRUG"');
    } else if (prescription === 'OTC') {
      searchParts.push('openfda.product_type:"HUMAN OTC DRUG"');
    } else {
      // Keep it to general drugs to filter out veterinary products, etc.
      searchParts.push('(openfda.product_type:"HUMAN OTC DRUG" OR openfda.product_type:"HUMAN PRESCRIPTION DRUG")');
    }
    
    // Add Category filters (mapping Mediknow categories to openFDA purpose keywords)
    if (category === 'Pain Relief') {
      searchParts.push('(purpose:pain OR purpose:fever OR purpose:analgesic OR indications_and_usage:pain OR indications_and_usage:fever)');
    } else if (category === 'Allergy') {
      searchParts.push('(purpose:allergy OR purpose:antihistamine OR purpose:sneezing OR indications_and_usage:allergy OR indications_and_usage:antihistamine)');
    } else if (category === 'Digestive') {
      searchParts.push('(purpose:acid OR purpose:heartburn OR purpose:antacid OR purpose:diarrhea OR purpose:laxative OR indications_and_usage:heartburn OR indications_and_usage:indigestion)');
    } else if (category === 'Respiratory') {
      searchParts.push('(purpose:cough OR purpose:congestion OR purpose:expectorant OR indications_and_usage:cough OR indications_and_usage:bronchitis)');
    } else if (category === 'Cardio') {
      searchParts.push('(openfda.generic_name:atorvastatin OR openfda.generic_name:metoprolol OR openfda.generic_name:amlodipine OR indications_and_usage:cholesterol OR indications_and_usage:hypertension)');
    }
    
    // Add Dosage Form filters
    if (form === 'Tablet') {
      searchParts.push('(openfda.dosage_form:tablet OR openfda.dosage_form:capsule OR openfda.dosage_form:caplet)');
    } else if (form === 'Syrup') {
      searchParts.push('(openfda.dosage_form:syrup OR openfda.dosage_form:liquid OR openfda.dosage_form:solution OR openfda.dosage_form:suspension)');
    } else if (form === 'Inhaler') {
      searchParts.push('(openfda.dosage_form:inhalation OR openfda.dosage_form:inhaler OR openfda.dosage_form:aerosol)');
    } else if (form === 'Gel') {
      searchParts.push('(openfda.dosage_form:gel OR openfda.dosage_form:cream OR openfda.dosage_form:ointment)');
    } else if (form === 'Drops') {
      searchParts.push('(openfda.dosage_form:drops OR openfda.dosage_form:ophthalmic OR openfda.dosage_form:otic)');
    }
    
    // Join the query parts using AND
    const searchQuery = searchParts.join(' AND ');
    
    // Log the query for debugging (will appear in server console)
    console.log('[openFDA] Query:', searchQuery);
    
    // Fetch from openFDA with optional api key
    const apiKey = process.env.OPENFDA_API_KEY;
    const apiKeyParam = apiKey ? `&api_key=${apiKey}` : '';
    const openFdaUrl = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(searchQuery)}&limit=${limit}&skip=${skip}${apiKeyParam}`;
    
    console.log('[openFDA] URL:', openFdaUrl);
    
    const fdaResponse = await fetch(openFdaUrl, {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store'
    });
    
    if (fdaResponse.status === 404) {
      // 404 from openFDA means 0 search results matched the query
      return NextResponse.json({ results: [], total: 0 });
    }
    
    if (!fdaResponse.ok) {
      // If server error or rate limiting, throw to trigger fallback
      throw new Error(`openFDA API error: ${fdaResponse.status} ${fdaResponse.statusText}`);
    }
    
    const data = await fdaResponse.json();
    const fdaResults = data.results || [];
    const total = data.meta?.results?.total || fdaResults.length;
    
    const medicines = fdaResults.map(mapFdaResultToMedicine);
    
    return NextResponse.json({
      results: medicines,
      total,
      fallback: false
    });
  } catch (error) {
    console.error('Error fetching from openFDA, falling back to local database:', error);
    // Graceful fallback to local database search
    return NextResponse.json(searchLocal());
  }
}
