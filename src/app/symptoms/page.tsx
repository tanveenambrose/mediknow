'use client';

import { useState, useEffect, useMemo } from 'react';
import { MEDICINES_DB, SYMPTOMS_LIST, URGENT_SYMPTOMS, Medicine } from '@/data/medicines';
import styles from './page.module.css';

const SYMPTOM_QUERY_MAP: Record<string, string[]> = {
  headache: ['headache', 'head ache', 'migraine', 'analgesic', 'pain'],
  migraine: ['migraine', 'headache'],
  fever: ['fever', 'pyrexia', 'antipyretic'],
  'sore throat': ['sore throat', 'throat', 'pharyngitis'],
  'dry cough': ['dry cough', 'cough suppressant', 'dextromethorphan', 'cough'],
  'wet cough': ['wet cough', 'productive cough', 'expectorant', 'guaifenesin', 'mucus', 'congestion'],
  'running nose': ['runny nose', 'rhinorrhea', 'allergy', 'antihistamine'],
  'stuffy nose': ['nasal congestion', 'stuffy nose', 'decongestant', 'pseudoephedrine'],
  heartburn: ['heartburn', 'acid reflux', 'antacid', 'gerd', 'omeprazole'],
  indigestion: ['indigestion', 'dyspepsia', 'digestive', 'antacid'],
  diarrhea: ['diarrhea', 'loperamide', 'loose stool'],
  'muscle pain': ['muscle pain', 'muscle ache', 'myalgia', 'analgesic', 'pain relief'],
  'joint pain': ['joint pain', 'arthritis', 'inflammation', 'analgesic'],
  sneezing: ['sneezing', 'allergy', 'antihistamine'],
  'itchy eyes': ['itchy eyes', 'watery eyes', 'allergy', 'antihistamine'],
};

function symptomToSearchQuery(symptomId: string): string {
  const terms = SYMPTOM_QUERY_MAP[symptomId];
  if (!terms) return symptomId;
  return terms.join(' ');
}

function matchesSymptom(med: Medicine, symptomId: string): boolean {
  const s = symptomId.toLowerCase().trim();
  if (!s) return false;

  const haystack = [
    med.name,
    med.genericName,
    med.description,
    med.category,
    med.manufacturer || '',
    ...med.uses,
    ...med.sideEffects,
    ...med.warnings,
    ...med.symptoms,
  ]
    .join(' ')
    .toLowerCase();

  const searchTerms = SYMPTOM_QUERY_MAP[symptomId] || [symptomId];
  return searchTerms.some(term => haystack.includes(term));
}

export default function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [activeModalMedicine, setActiveModalMedicine] = useState<Medicine | null>(null);
  const [apiResults, setApiResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symptomSearchSuggestions = useMemo(() => {
    if (!customSymptomInput.trim()) return [];
    const query = customSymptomInput.toLowerCase();
    return SYMPTOMS_LIST.filter(
      (sym) =>
        sym.name.toLowerCase().includes(query) &&
        !selectedSymptoms.includes(sym.id)
    );
  }, [customSymptomInput, selectedSymptoms]);

  const handleAddSymptom = (symptomId: string) => {
    if (!selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    }
    setCustomSymptomInput('');
  };

  const handleAddCustomSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = customSymptomInput.trim().toLowerCase();
    if (!cleanInput) return;
    if (!selectedSymptoms.includes(cleanInput)) {
      setSelectedSymptoms([...selectedSymptoms, cleanInput]);
    }
    setCustomSymptomInput('');
  };

  const handleRemoveSymptom = (symptomId: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((id) => id !== symptomId));
  };

  const hasUrgentSymptom = useMemo(() => {
    return selectedSymptoms.some((symptom) =>
      URGENT_SYMPTOMS.some(
        (urgent) =>
          symptom.toLowerCase().includes(urgent) ||
          urgent.toLowerCase().includes(symptom)
      )
    );
  }, [selectedSymptoms]);

  useEffect(() => {
    if (selectedSymptoms.length === 0) {
      setApiResults([]);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchMedicines = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchTerms = selectedSymptoms
          .map(symptomToSearchQuery)
          .join(' ');
        const res = await fetch(
          `/api/medicines?q=${encodeURIComponent(searchTerms)}&source=all&limit=80&skip=0`
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setApiResults(data.results || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch medicines');
          setApiResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMedicines();
    return () => { cancelled = true; };
  }, [selectedSymptoms]);

  const medicineSuggestions = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];

    const combined = [...apiResults, ...MEDICINES_DB];
    const seen = new Set<string>();
    const unique: Medicine[] = [];
    for (const med of combined) {
      if (!seen.has(med.id)) {
        seen.add(med.id);
        unique.push(med);
      }
    }

    return unique
      .map(med => {
        const matchingSymptoms = selectedSymptoms.filter(sym => matchesSymptom(med, sym));
        const score = matchingSymptoms.length / selectedSymptoms.length;
        return { medicine: med, score, matchingSymptoms };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.medicine.symptoms?.length || 0) - (a.medicine.symptoms?.length || 0);
      });
  }, [apiResults, selectedSymptoms]);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.badge}>Symptom Analysis Engine</div>
          <h1 className={styles.title}>Symptom Checker</h1>
          <p className={styles.subtitle}>
            Select or type your symptoms to receive clinical suggestions from our global pharmaceutical database (FDA, MediData Bangladesh & local directory).
          </p>
        </div>
      </section>

      <div className={`${styles.mainContent} container`}>
        {hasUrgentSymptom && (
          <div className={styles.urgentWarning}>
            <div className={styles.urgentHeader}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <span>Urgent Medical Attention Required</span>
            </div>
            <p className={styles.urgentText}>
              One or more of your symptoms (such as shortness of breath, chest pain, or slurred speech) may indicate a
              critical medical emergency. Please <strong>stop using this tool and dial 911</strong> or proceed to the
              nearest emergency room immediately.
            </p>
          </div>
        )}

        <div className={styles.checkerLayout}>
          <div className={`${styles.inputPanel} glass-panel`}>
            <h3 className={styles.panelTitle}>Identify Your Symptoms</h3>
            <p className={styles.panelDesc}>Select from common conditions or search below.</p>

            <div className={styles.quickGrid}>
              {SYMPTOMS_LIST.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    className={`${styles.quickBtn} ${isSelected ? styles.quickBtnActive : ''}`}
                    onClick={() =>
                      isSelected ? handleRemoveSymptom(sym.id) : handleAddSymptom(sym.id)
                    }
                  >
                    <span>{sym.name}</span>
                    {isSelected ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className={styles.plusSign}>+</span>
                    )}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddCustomSymptom} className={styles.searchForm}>
              <h4 className={styles.searchLabel}>Type a symptom</h4>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="e.g. chest pain, fatigue, diarrhea..."
                  value={customSymptomInput}
                  onChange={(e) => setCustomSymptomInput(e.target.value)}
                  className={styles.textInput}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
                  Add
                </button>
              </div>

              {symptomSearchSuggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                  {symptomSearchSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleAddSymptom(suggestion.id)}
                      className={styles.suggestionItem}
                    >
                      <span className={styles.suggestionName}>{suggestion.name}</span>
                      <span className={styles.suggestionMeta}>{suggestion.severity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </form>

            {selectedSymptoms.length > 0 && (
              <div className={styles.selectedSection}>
                <h4 className={styles.selectedTitle}>Your Selected Symptoms ({selectedSymptoms.length})</h4>
                <div className={styles.chipsWrapper}>
                  {selectedSymptoms.map((symId) => {
                    const match = SYMPTOMS_LIST.find((s) => s.id === symId);
                    const name = match ? match.name : symId;
                    return (
                      <div key={symId} className={styles.symptomChip}>
                        <span>{name}</span>
                        <button
                          onClick={() => handleRemoveSymptom(symId)}
                          className={styles.chipRemove}
                          aria-label={`Remove ${name}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" x2="6" y1="6" y2="18" />
                            <line x1="6" x2="18" y1="6" y2="18" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button className={styles.clearAllBtn} onClick={() => setSelectedSymptoms([])}>
                  Clear All Symptoms
                </button>
              </div>
            )}
          </div>

          <div className={styles.recommendationsPanel}>
            <div className={styles.resultsHeader}>
              <h3 className={styles.resultsTitle}>Medication Matches</h3>
              <p className={styles.resultsDesc}>
                Ranked by relevance to your symptoms. Results from FDA, MediData Bangladesh & local database.
              </p>
            </div>

            {selectedSymptoms.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="16" y2="12" />
                    <line x1="12" x2="12.01" y1="8" y2="8" />
                  </svg>
                </div>
                <h4>Select symptoms to view recommendations</h4>
                <p>Click on symptoms on the left or type your conditions to get real-time medicine suggestions from our global pharmaceutical database.</p>
              </div>
            ) : loading && apiResults.length === 0 && medicineSuggestions.length === 0 ? (
              <div className={styles.suggestionsListContainer}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`${styles.recommendationCard} glass-panel`} style={{ opacity: 0.5 }}>
                    <div className={styles.recCardHeader}>
                      <div style={{ width: 120, height: 24, background: 'var(--border-color)', borderRadius: 4 }} />
                      <div style={{ width: 100, height: 24, background: 'var(--border-color)', borderRadius: 4 }} />
                    </div>
                    <div style={{ width: '60%', height: 28, background: 'var(--border-color)', borderRadius: 4, marginTop: 4 }} />
                    <div style={{ width: '40%', height: 20, background: 'var(--border-color)', borderRadius: 4 }} />
                    <div style={{ width: '100%', height: 16, background: 'var(--border-color)', borderRadius: 4, marginTop: 8 }} />
                    <div style={{ width: '80%', height: 16, background: 'var(--border-color)', borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className={styles.emptyState} style={{ borderColor: 'var(--danger)', padding: '3rem 2rem' }}>
                <h3 style={{ color: 'var(--danger)' }}>Error Fetching Results</h3>
                <p>{error}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--medium-slate)', marginTop: '0.5rem' }}>
                  Showing local database results instead.
                </p>
              </div>
            ) : medicineSuggestions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="9" r="2" />
                    <circle cx="15" cy="9" r="2" />
                    <path d="M9 17h6a3 3 0 0 0-3-3 3 3 0 0 0-3 3Z" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <h4>No direct matches found</h4>
                <p>We don&apos;t have medications matching this exact set of symptoms. Try fewer symptoms or broader terms.</p>
              </div>
            ) : (
              <div className={styles.suggestionsListContainer}>
                {loading && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--medium-slate)', padding: '0.5rem 0', fontStyle: 'italic' }}>
                    Loading more results from global databases...
                  </div>
                )}
                {medicineSuggestions.map(({ medicine, score, matchingSymptoms }) => {
                  const allMatch = score >= 1;
                  return (
                    <div key={medicine.id} className={`${styles.recommendationCard} glass-panel`}>
                      <div className={styles.recCardHeader}>
                        <div>
                          <span className={`${badgeClass(medicine.category)} badge`} style={{ marginRight: '0.5rem' }}>
                            {medicine.category}
                          </span>
                          <span className="badge badge-secondary">{medicine.form}</span>
                          {medicine.isBangladeshi && (
                            <span className="badge" style={{ backgroundColor: '#006a4e', color: '#ffffff', marginLeft: '0.25rem' }}>
                              BD
                            </span>
                          )}
                        </div>
                        <span className={styles.matchScoreBadge}>
                          {matchingSymptoms.length}/{selectedSymptoms.length} matched
                        </span>
                      </div>

                      <h4 className={styles.recCardName}>{medicine.name}</h4>
                      <p className={styles.recCardGeneric}>{medicine.genericName}</p>

                      <div className={styles.matchingOverlay}>
                        <span className={styles.matchingLabel}>Matching: </span>
                        <div className={styles.matchingChips}>
                          {matchingSymptoms.map((sym) => {
                            const match = SYMPTOMS_LIST.find((s) => s.id === sym);
                            return (
                              <span key={sym} className={`${styles.matchingChip} ${allMatch ? '' : styles.matchingChipPartial}`}>
                                {match ? match.name : sym}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {medicine.manufacturer && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--medium-slate)', marginTop: '-0.25rem' }}>
                          <strong>MFG:</strong> {medicine.manufacturer}
                        </p>
                      )}

                      <p className={styles.recCardDesc}>{medicine.description}</p>

                      {medicine.dosage && (
                        <div className={styles.recCardDosage}>
                          <strong>Dosage: </strong> {medicine.dosage}
                        </div>
                      )}

                      <div className={styles.recCardFooter}>
                        <div className={styles.recWarnings}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          </svg>
                          <span>{medicine.warnings[0] || 'Consult a physician before use.'}</span>
                        </div>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setActiveModalMedicine(medicine)}
                          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                        >
                          Full Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeModalMedicine && (
        <div className={styles.modalOverlay} onClick={() => setActiveModalMedicine(null)}>
          <div className={`${styles.modalContent} glass-panel`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setActiveModalMedicine(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderBadges}>
                <span className={`${badgeClass(activeModalMedicine.category)} badge`}>
                  {activeModalMedicine.category}
                </span>
                <span className="badge badge-secondary">{activeModalMedicine.form}</span>
                {activeModalMedicine.prescriptionRequired ? (
                  <span className="badge badge-danger">Prescription Required (Rx)</span>
                ) : (
                  <span className="badge badge-primary">Over-The-Counter (OTC)</span>
                )}
              </div>
              <h2 className={styles.modalName}>{activeModalMedicine.name}</h2>
              <p className={styles.modalGeneric}>{activeModalMedicine.genericName}</p>
              {activeModalMedicine.manufacturer && (
                <p style={{ fontSize: '0.85rem', color: 'var(--medium-slate)', marginTop: '-0.25rem' }}>
                  <strong>Manufacturer:</strong> {activeModalMedicine.manufacturer}
                </p>
              )}
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalMainCol}>
                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Clinical Description</h4>
                  <p className={styles.modalText}>{activeModalMedicine.description}</p>
                </div>

                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Primary Uses & Indications</h4>
                  <ul className={styles.modalList}>
                    {activeModalMedicine.uses.length > 0 ? activeModalMedicine.uses.map((use, index) => (
                      <li key={index}>{use}</li>
                    )) : <li>Consult a healthcare professional.</li>}
                  </ul>
                </div>

                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Standard Dosage Guidelines</h4>
                  <div className={styles.dosageBox}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{activeModalMedicine.dosage}</span>
                  </div>
                </div>

                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Common Side Effects</h4>
                  <ul className={styles.modalList}>
                    {activeModalMedicine.sideEffects.length > 0 ? activeModalMedicine.sideEffects.map((effect, index) => (
                      <li key={index}>{effect}</li>
                    )) : <li>No common side effects reported.</li>}
                  </ul>
                </div>
              </div>

              <div className={styles.modalSideCol}>
                <div className={styles.modalWarningBox}>
                  <div className={styles.modalWarningTitle}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" x2="12" y1="9" y2="13" />
                      <line x1="12" x2="12.01" y1="17" y2="17" />
                    </svg>
                    <span>Critical Precautions</span>
                  </div>
                  <ul className={styles.modalWarningList}>
                    {activeModalMedicine.warnings.length > 0 ? activeModalMedicine.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    )) : <li>Consult a physician before use.</li>}
                  </ul>
                </div>

                <div className={styles.modalPriceBox}>
                  <div className={styles.priceLabel}>Estimated Price</div>
                  {activeModalMedicine.priceBDT ? (
                    <>
                      <div className={styles.priceVal}>৳{activeModalMedicine.priceBDT.toFixed(2)}</div>
                      {activeModalMedicine.price > 0 && (
                        <p className={styles.priceTax}>~ ${activeModalMedicine.price.toFixed(2)} USD</p>
                      )}
                    </>
                  ) : activeModalMedicine.price > 0 ? (
                    <>
                      <div className={styles.priceVal}>${activeModalMedicine.price.toFixed(2)}</div>
                      <p className={styles.priceTax}>Excluding local pharmacy taxes</p>
                    </>
                  ) : (
                    <>
                      <div className={styles.priceVal} style={{ fontSize: '1.25rem' }}>Price not listed</div>
                      <p className={styles.priceTax}>Consult local pharmacy for pricing</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function badgeClass(category: string) {
  const c = category.toLowerCase();
  if (c.includes('pain')) return 'badge-primary';
  if (c.includes('allergy')) return 'badge-secondary';
  if (c.includes('digestive') || c.includes('acid') || c.includes('heartburn')) return 'badge-warning';
  if (c.includes('respiratory') || c.includes('cough') || c.includes('asthma')) return 'badge-primary';
  if (c.includes('cardio') || c.includes('hypertension') || c.includes('cholesterol')) return 'badge-danger';
  if (c.includes('antibiotic')) return 'badge-danger';
  if (c.includes('diabetes')) return 'badge-warning';
  if (c.includes('supplement') || c.includes('vitamin')) return 'badge-secondary';
  return 'badge-primary';
}
