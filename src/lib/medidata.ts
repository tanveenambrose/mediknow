import { Medicine } from '@/data/medicines';
import { medicineCache } from './cache';

const PARSE_API_URL = process.env.PARSE_API_URL || 'https://api.parse.bot';
const PARSE_SCRAPER_ID = process.env.PARSE_SCRAPER_ID || '';
const PARSE_API_KEY = process.env.PARSE_API_KEY || '';
const CACHE_TTL = parseInt(process.env.MEDIDATA_CACHE_TTL || '300', 10);

/* ── Raw API response types ── */

interface ParseSearchBrand {
  id: string;
  slug: string;
  name: string;
  generic: string;
  company: string;
  url: string;
}

interface ParseListBrandItem {
  id: string;
  slug: string;
  name: string;
  strength: string;
  generic: string;
  company: string;
  price: number | null;
  dosage_form?: string;
  url: string;
}

interface ParseBrandDetail {
  name: string;
  brand_id: string;
  slug: string;
  dosage_form: string;
  generic_name: string;
  manufacturer: string;
  strength: string;
  unit_price: string | null;
  strip_price: string | null;
  pack_size: string | null;
  sections: Record<string, string>;
}

interface ParseSearchResponse {
  status: 'success' | 'error';
  data: { brands: ParseSearchBrand[] };
}

interface ParseListBrandsResponse {
  status: 'success' | 'error';
  data: { brands: ParseListBrandItem[]; pagination: { current: number; total: number; next: boolean; prev: boolean } };
}

interface ParseBrandDetailResponse {
  status: 'success' | 'error';
  data: ParseBrandDetail;
}

/* ── Helpers ── */

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

function extractSymptoms(text: string): string[] {
  const s = new Set<string>();
  const lower = text.toLowerCase();
  const map: Record<string, string[]> = {
    headache: ['headache', 'migraine', 'head ache'],
    fever: ['fever', 'pyrexia'],
    cough: ['cough', 'cold', 'congestion'],
    allergy: ['allergy', 'allergic', 'antihistamine', 'runny nose', 'sneezing'],
    pain: ['pain', 'analgesic', 'aching', 'myalgia', 'neuralgia', 'toothache', 'bodyache'],
    nausea: ['nausea', 'vomiting'],
    diarrhea: ['diarrhea', 'loose stool'],
    infection: ['infection', 'bacterial', 'antibiotic'],
    inflammation: ['inflammation', 'swelling'],
    heartburn: ['heartburn', 'acid reflux', 'gerd'],
    hypertension: ['hypertension', 'high blood pressure'],
    diabetes: ['diabetes', 'blood sugar'],
    asthma: ['asthma', 'wheezing', 'bronchodilator'],
  };
  for (const [sym, kws] of Object.entries(map)) {
    for (const kw of kws) {
      if (lower.includes(kw)) { s.add(sym); break; }
    }
  }
  return Array.from(s);
}

function determineCategory(sections: Record<string, string>, genericName: string): string {
  const text = `${genericName} ${Object.values(sections).join(' ')}`.toLowerCase();
  if (text.includes('antibiotic') || text.includes('bacterial') || text.includes('amoxicillin') || text.includes('cephalosporin') || text.includes('azithromycin') || text.includes('ciprofloxacin')) return 'Antibiotic';
  if (text.includes('pain') || text.includes('analgesic') || text.includes('nsaid') || text.includes('paracetamol') || text.includes('ibuprofen') || text.includes('naproxen') || text.includes('diclofenac')) return 'Pain Relief';
  if (text.includes('antihistamine') || text.includes('allergy') || text.includes('cetirizine') || text.includes('loratadine')) return 'Allergy';
  if (text.includes('acid') || text.includes('heartburn') || text.includes('omeprazole') || text.includes('pantoprazole') || text.includes('antacid') || text.includes('domperidone')) return 'Digestive';
  if (text.includes('cough') || text.includes('asthma') || text.includes('salbutamol') || text.includes('montelukast') || text.includes('expectorant') || text.includes('mucus')) return 'Respiratory';
  if (text.includes('cholesterol') || text.includes('statin') || text.includes('atorvastatin') || text.includes('amlodipine') || text.includes('losartan') || text.includes('hypertension')) return 'Cardio';
  if (text.includes('diabetes') || text.includes('metformin') || text.includes('insulin') || text.includes('glibenclamide')) return 'Diabetes';
  if (text.includes('vitamin') || text.includes('mineral') || text.includes('supplement')) return 'Supplement';
  return 'General Health';
}

function determineForm(dosageForm: string): string {
  if (!dosageForm) return 'Tablet';
  const f = dosageForm.toLowerCase();
  if (f.includes('tablet') || f.includes('capsule') || f.includes('caplet')) return 'Tablet';
  if (f.includes('syrup') || f.includes('liquid') || f.includes('suspension') || f.includes('elixir') || f.includes('drop')) return 'Syrup';
  if (f.includes('inhal') || f.includes('aerosol') || f.includes('spray')) return 'Inhaler';
  if (f.includes('cream') || f.includes('gel') || f.includes('ointment')) return 'Gel';
  if (f.includes('inject') || f.includes('vial') || f.includes('infusion')) return 'Injection';
  if (f.includes('suppository')) return 'Suppository';
  if (f.includes('powder') || f.includes('sachet')) return 'Powder';
  return dosageForm;
}

function extractList(section: string): string[] {
  if (!section) return [];
  return section.split(/[.;]\s+/).map(s => s.trim()).filter(s => s.length > 10 && s.length < 250).slice(0, 5);
}

/* ── Mapping ── */

function mapToMedicine(
  brand: { id: string; slug: string; name: string; generic: string; company: string },
  detail?: ParseBrandDetail
): Medicine {
  const sections = detail?.sections || {};
  const usesText = sections['Indications'] || sections['Therapeutic Class'] || '';
  const sideEffectsText = sections['Side Effects'] || '';
  const warningsText = sections['Precautions & Warnings'] || sections['Contraindications'] || '';
  const dosageText = sections['Dosage & Administration'] || sections['Administration'] || '';

  const uses = extractList(usesText);
  const sideEffects = extractList(sideEffectsText);
  const warnings = extractList(warningsText);
  const allText = `${brand.name} ${brand.generic} ${Object.values(sections).join(' ')}`;
  const symptoms = extractSymptoms(allText);
  const category = detail ? determineCategory(sections, detail.generic_name) : 'General Health';
  const form = detail ? determineForm(detail.dosage_form) : 'Tablet';
  const unitPrice = detail?.unit_price ? parseFloat(detail.unit_price) : null;
  const usdPrice = unitPrice ? parseFloat((unitPrice / 120).toFixed(2)) : 0;

  return {
    id: `medidata-${brand.id}`,
    name: brand.name,
    genericName: `${brand.generic}${detail?.strength ? ' ' + detail.strength : ''}`,
    category,
    form,
    description: usesText ? stripHtml(usesText).slice(0, 200) : `Medicine information for ${brand.name}`,
    uses: uses.length > 0 ? uses : ['Consult a healthcare professional.'],
    sideEffects: sideEffects.length > 0 ? sideEffects : ['No common side effects reported.'],
    warnings: warnings.length > 0 ? warnings : ['Consult a physician before use.'],
    dosage: dosageText ? stripHtml(dosageText).slice(0, 300) : 'As directed by a healthcare professional.',
    prescriptionRequired: false,
    price: usdPrice,
    priceBDT: unitPrice ?? undefined,
    symptoms,
    strength: detail?.strength,
    manufacturer: detail?.manufacturer || brand.company,
    dosageForms: detail?.dosage_form ? [detail.dosage_form] : [],
    isExternal: true,
    isBangladeshi: true,
    source: 'medidata',
  };
}

/* ── API call ── */

export function getMediDataStatus(): { configured: boolean; keyValid: boolean; message: string } {
  const hasKey = !!PARSE_API_KEY;
  const hasScraper = !!PARSE_SCRAPER_ID;
  const validFormat = hasKey && PARSE_API_KEY.startsWith('pmx_');
  return {
    configured: hasKey && hasScraper,
    keyValid: validFormat,
    message: !hasKey ? 'No API key set (PARSE_API_KEY)'
      : !validFormat ? 'Key should start with "pmx_"'
      : !hasScraper ? 'Missing scraper ID'
      : 'Ready',
  };
}

async function callParseApi<T>(endpoint: string, params: Record<string, string>): Promise<{ data: T | null; error?: string }> {
  const status = getMediDataStatus();
  if (!status.keyValid) return { data: null, error: status.message };

  const url = `${PARSE_API_URL}/scraper/${PARSE_SCRAPER_ID}/${endpoint}?${new URLSearchParams(params).toString()}`;

  try {
    const response = await fetch(url, {
      headers: { 'X-API-Key': PARSE_API_KEY, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 401) return { data: null, error: 'Invalid API key' };
    if (!response.ok) return { data: null, error: `HTTP ${response.status}` };
    const json = await response.json() as any;
    if (json.status === 'error') return { data: null, error: 'API returned error status' };
    return { data: json.data as T };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error' };
  }
}

/* ── Lightweight browse mapper (skip detail calls) ── */

function mapListBrandToMedicine(brand: ParseListBrandItem): Medicine {
  const category = determineCategory({}, brand.generic);
  const form = determineForm(brand.dosage_form || '');
  const symptoms = extractSymptoms(`${brand.name} ${brand.generic}`);
  const usdPrice = brand.price ? parseFloat((brand.price / 120).toFixed(2)) : 0;

  return {
    id: `medidata-${brand.id}`,
    name: brand.name,
    genericName: `${brand.generic}${brand.strength ? ' ' + brand.strength : ''}`,
    category,
    form,
    description: `Medicine information for ${brand.name} manufactured by ${brand.company}.`,
    uses: ['Consult a healthcare professional.'],
    sideEffects: ['No common side effects reported.'],
    warnings: ['Consult a physician before use.'],
    dosage: 'As directed by a healthcare professional.',
    prescriptionRequired: false,
    price: usdPrice,
    priceBDT: brand.price ?? undefined,
    symptoms,
    strength: brand.strength,
    manufacturer: brand.company,
    dosageForms: brand.dosage_form ? [brand.dosage_form] : [],
    isExternal: true,
    isBangladeshi: true,
    source: 'medidata',
  };
}

/* ── Public fetch ── */

export async function fetchMediData(params: {
  q?: string;
  category?: string;
  form?: string;
  prescription?: string;
  limit?: number;
  skip?: number;
}): Promise<{ results: Medicine[]; total: number; fallback: boolean; error?: string }> {
  const cacheKey = `medidata:${JSON.stringify(params)}`;
  const cached = medicineCache.get<{ results: Medicine[]; total: number }>(cacheKey);
  if (cached) return { ...cached, fallback: false };

  const query = (params.q || '').trim();
  const maxResults = params.limit || 30;

  if (!query) {
    const page = Math.floor((params.skip || 0) / 30) + 1;
    const { data, error } = await callParseApi<ParseListBrandsResponse['data']>('list_brands', { page: String(page) });
    if (!data || error) return { results: [], total: 0, fallback: true, error };

    const brands = (data.brands || []).slice(0, maxResults);
    const results = brands.map(mapListBrandToMedicine);
    const total = data.pagination?.total || results.length;

    const out = { results, total };
    medicineCache.set(cacheKey, out, CACHE_TTL);
    return { ...out, fallback: false };
  }

  const { data: searchData, error } = await callParseApi<ParseSearchResponse['data']>('search_medicines', { query });
  if (!searchData || error) return { results: [], total: 0, fallback: true, error };

  const brands = (searchData.brands || []).slice(0, maxResults);
  const detailResults: ({ data: ParseBrandDetail | null; error?: string })[] = [];
  for (let i = 0; i < brands.length; i += 5) {
    const batch = brands.slice(i, i + 5).map(b =>
      callParseApi<ParseBrandDetail>('get_brand_detail', { brand_id: b.id, slug: b.slug })
    );
    detailResults.push(...await Promise.all(batch));
  }
  const results = brands.map((b, i) =>
    mapToMedicine(
      { id: b.id, slug: b.slug, name: b.name, generic: b.generic, company: b.company },
      detailResults[i].data || undefined
    )
  );

  const out = { results, total: results.length };
  medicineCache.set(cacheKey, out, CACHE_TTL);
  return { ...out, fallback: false };
}

export function clearMediDataCache(pattern?: string): void {
  medicineCache.invalidate(pattern ? `medidata:${pattern}` : 'medidata');
}
