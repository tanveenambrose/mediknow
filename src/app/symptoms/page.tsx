'use client';

import { useState, useMemo } from 'react';
import { MEDICINES_DB, SYMPTOMS_LIST, URGENT_SYMPTOMS, Medicine } from '@/data/medicines';
import styles from './page.module.css';

export default function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [activeModalMedicine, setActiveModalMedicine] = useState<Medicine | null>(null);

  // Suggestions for symptom search
  const symptomSearchSuggestions = useMemo(() => {
    if (!customSymptomInput.trim()) return [];
    const query = customSymptomInput.toLowerCase();
    return SYMPTOMS_LIST.filter(
      (sym) =>
        sym.name.toLowerCase().includes(query) &&
        !selectedSymptoms.includes(sym.id)
    );
  }, [customSymptomInput, selectedSymptoms]);

  // Handle adding symptom
  const handleAddSymptom = (symptomId: string) => {
    if (!selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    }
    setCustomSymptomInput('');
  };

  // Handle adding custom input symptom (typed directly by user)
  const handleAddCustomSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = customSymptomInput.trim().toLowerCase();
    if (!cleanInput) return;

    if (!selectedSymptoms.includes(cleanInput)) {
      setSelectedSymptoms([...selectedSymptoms, cleanInput]);
    }
    setCustomSymptomInput('');
  };

  // Handle removing symptom
  const handleRemoveSymptom = (symptomId: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((id) => id !== symptomId));
  };

  // Check if any of the selected symptoms are considered urgent triggers
  const hasUrgentSymptom = useMemo(() => {
    return selectedSymptoms.some((symptom) =>
      URGENT_SYMPTOMS.some(
        (urgent) =>
          symptom.toLowerCase().includes(urgent) ||
          urgent.toLowerCase().includes(symptom)
      )
    );
  }, [selectedSymptoms]);

  // Map and score medicines based on symptom matches
  const medicineSuggestions = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];

    const suggestions = MEDICINES_DB.map((med) => {
      // Find overlap between medicine symptoms and selected symptoms
      const matchingSymptoms = med.symptoms.filter((sym) =>
        selectedSymptoms.some(
          (sel) =>
            sel.toLowerCase().includes(sym.toLowerCase()) ||
            sym.toLowerCase().includes(sel.toLowerCase())
        )
      );

      // Score is ratio of matching symptoms
      const score = matchingSymptoms.length;

      return {
        medicine: med,
        score,
        matchingSymptoms,
      };
    })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return suggestions;
  }, [selectedSymptoms]);

  return (
    <div className={styles.container}>
      {/* Sub-Hero Header */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.badge}>Symptom Analysis Engine</div>
          <h1 className={styles.title}>Symptom Checker</h1>
          <p className={styles.subtitle}>
            Select or type your symptoms to receive clinical suggestions. This tool is purely informational.
          </p>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className={`${styles.mainContent} container`}>
        {/* Urgent Emergency Warning Banner */}
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
          {/* Left Column: Selector */}
          <div className={`${styles.inputPanel} glass-panel`}>
            <h3 className={styles.panelTitle}>Identify Your Symptoms</h3>
            <p className={styles.panelDesc}>Select from common conditions or search below.</p>

            {/* Predefined Quick Select Grid */}
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

            {/* Custom Input Search Bar */}
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

              {/* Autocomplete Dropdown */}
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

            {/* Selected Symptoms List */}
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

          {/* Right Column: Recommendations */}
          <div className={styles.recommendationsPanel}>
            <div className={styles.resultsHeader}>
              <h3 className={styles.resultsTitle}>Medication Matches</h3>
              <p className={styles.resultsDesc}>Ranked by overlap matching. Confirm details before use.</p>
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
                <p>Click on symptoms on the left or type your conditions to get real-time medicine suggestions.</p>
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
                <p>We don&apos;t have pre-configured medications for this exact set of symptoms. Consider searching for general categories or talking to our AI Assistant.</p>
              </div>
            ) : (
              <div className={styles.suggestionsListContainer}>
                {medicineSuggestions.map(({ medicine, score, matchingSymptoms }) => (
                  <div key={medicine.id} className={`${styles.recommendationCard} glass-panel`}>
                    <div className={styles.recCardHeader}>
                      <div>
                        <span className={`${badgeClass(medicine.category)} badge`} style={{ marginRight: '0.5rem' }}>
                          {medicine.category}
                        </span>
                        <span className="badge badge-secondary">{medicine.form}</span>
                      </div>
                      <span className={styles.matchScoreBadge}>
                        {score} {score === 1 ? 'symptom' : 'symptoms'} matched
                      </span>
                    </div>

                    <h4 className={styles.recCardName}>{medicine.name}</h4>
                    <p className={styles.recCardGeneric}>{medicine.genericName}</p>

                    <div className={styles.matchingOverlay}>
                      <span className={styles.matchingLabel}>Matching: </span>
                      <div className={styles.matchingChips}>
                        {matchingSymptoms.map((sym) => (
                          <span key={sym} className={styles.matchingChip}>
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className={styles.recCardDesc}>{medicine.description}</p>

                    <div className={styles.recCardDosage}>
                      <strong>Recommended Dosage: </strong> {medicine.dosage}
                    </div>

                    <div className={styles.recCardFooter}>
                      <div className={styles.recWarnings}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        </svg>
                        <span>{medicine.warnings[0]}</span>
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Medicine Details Modal (Reused) */}
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
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalMainCol}>
                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Description</h4>
                  <p className={styles.modalText}>{activeModalMedicine.description}</p>
                </div>

                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Primary Uses & Indications</h4>
                  <ul className={styles.modalList}>
                    {activeModalMedicine.uses.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
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
                    {activeModalMedicine.sideEffects.map((effect, index) => (
                      <li key={index}>{effect}</li>
                    ))}
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
                    {activeModalMedicine.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.modalPriceBox}>
                  <div className={styles.priceLabel}>Estimated Price</div>
                  <div className={styles.priceVal}>${activeModalMedicine.price.toFixed(2)}</div>
                  <p className={styles.priceTax}>Excluding local pharmacy taxes</p>
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
  switch (category) {
    case 'Pain Relief':
      return 'badge-primary';
    case 'Allergy':
      return 'badge-secondary';
    case 'Digestive':
      return 'badge-warning';
    case 'Respiratory':
      return 'badge-primary';
    case 'Cardio':
      return 'badge-danger';
    default:
      return 'badge-primary';
  }
}
