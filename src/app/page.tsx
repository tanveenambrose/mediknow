'use client';

import { useState, useMemo } from 'react';
import { MEDICINES_DB, Medicine } from '@/data/medicines';
import styles from './page.module.css';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedForm, setSelectedForm] = useState<string>('All');
  const [prescriptionFilter, setPrescriptionFilter] = useState<string>('All');
  const [activeModalMedicine, setActiveModalMedicine] = useState<Medicine | null>(null);

  // Dynamic filter lists
  const categories = ['All', 'Pain Relief', 'Allergy', 'Digestive', 'Respiratory', 'Cardio'];
  const forms = ['All', 'Tablet', 'Syrup', 'Inhaler', 'Gel', 'Drops'];

  // Filtered medicines based on search queries and side filters
  const filteredMedicines = useMemo(() => {
    return MEDICINES_DB.filter((medicine) => {
      // Search text match
      const matchesSearch =
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter match
      const matchesCategory =
        selectedCategory === 'All' || medicine.category === selectedCategory;

      // Form filter match
      const matchesForm =
        selectedForm === 'All' || medicine.form === selectedForm;

      // Prescription filter match
      const matchesPrescription =
        prescriptionFilter === 'All' ||
        (prescriptionFilter === 'OTC' && !medicine.prescriptionRequired) ||
        (prescriptionFilter === 'Rx' && medicine.prescriptionRequired);

      return matchesSearch && matchesCategory && matchesForm && matchesPrescription;
    });
  }, [searchQuery, selectedCategory, selectedForm, prescriptionFilter]);

  // Clear all filters handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedForm('All');
    setPrescriptionFilter('All');
  };

  return (
    <div className={styles.wrapper}>
      {/* Clinical Hero Section */}
      <section className={styles.heroSection}>
        <div className={`${styles.heroContainer} container`}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            Trusted Medical Directory & Decision Tool
          </div>
          <h1 className={styles.heroTitle}>
            Empowering Health Decisions with <span className={styles.titleGradient}>Verified Knowledge</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Search clinical pharmaceutical products, verify indicated symptoms, and consult with our secure medical AI assistant.
          </p>

          {/* Prominent Center Search Bar */}
          <div className={`${styles.searchBarWrapper} glass-panel`}>
            <div className={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by medicine name, chemical compound, or symptoms (e.g. Paracetamol, heartburn, cough)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery('')} aria-label="Clear search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Browse Section with Side Filters */}
      <section className={`${styles.browseSection} container`}>
        <div className={styles.browseLayout}>
          {/* Side Filters Panel */}
          <aside className={`${styles.filterPanel} glass-panel`}>
            <div className={styles.filterPanelHeader}>
              <h3 className={styles.filterTitle}>Filter Products</h3>
              {(selectedCategory !== 'All' || selectedForm !== 'All' || prescriptionFilter !== 'All' || searchQuery !== '') && (
                <button className={styles.resetButton} onClick={handleResetFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupLabel}>Medical Category</h4>
              <div className={styles.filterOptions}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.filterChip} ${selectedCategory === cat ? styles.filterChipActive : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Dosage Form Filters */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupLabel}>Dosage Form</h4>
              <div className={styles.filterOptions}>
                {forms.map((formOption) => (
                  <button
                    key={formOption}
                    className={`${styles.filterChip} ${selectedForm === formOption ? styles.filterChipActive : ''}`}
                    onClick={() => setSelectedForm(formOption)}
                  >
                    {formOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Prescription Requirement */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupLabel}>Prescription Status</h4>
              <div className={styles.filterRadioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="prescription"
                    checked={prescriptionFilter === 'All'}
                    onChange={() => setPrescriptionFilter('All')}
                  />
                  <span>All Medicines</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="prescription"
                    checked={prescriptionFilter === 'OTC'}
                    onChange={() => setPrescriptionFilter('OTC')}
                  />
                  <span>Over-The-Counter (OTC)</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="prescription"
                    checked={prescriptionFilter === 'Rx'}
                    onChange={() => setPrescriptionFilter('Rx')}
                  />
                  <span>Prescription Required (Rx)</span>
                </label>
              </div>
            </div>

            {/* Info Notice */}
            <div className={styles.filterNotice}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12.01" y1="8" y2="8" />
              </svg>
              <span>Consult a pharmacist before mixing active compounds.</span>
            </div>
          </aside>

          {/* Results Grid Area */}
          <div className={styles.resultsArea}>
            <div className={styles.resultsHeader}>
              <p className={styles.resultsCount}>
                Showing <strong>{filteredMedicines.length}</strong> {filteredMedicines.length === 1 ? 'medicine' : 'medicines'}
              </p>
              {searchQuery && (
                <span className={styles.searchTermTag}>
                  Search: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {filteredMedicines.length > 0 ? (
              <div className={styles.grid}>
                {filteredMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className={`${styles.card} glass-panel`}
                    onClick={() => setActiveModalMedicine(medicine)}
                  >
                    <div className={styles.cardHeader}>
                      <span className={`${badgeClass(medicine.category)} badge`}>
                        {medicine.category}
                      </span>
                      {medicine.prescriptionRequired ? (
                        <span className="badge badge-danger">Rx Required</span>
                      ) : (
                        <span className="badge badge-secondary">OTC</span>
                      )}
                    </div>

                    <h3 className={styles.cardName}>{medicine.name}</h3>
                    <p className={styles.cardGeneric}>{medicine.genericName}</p>
                    <p className={styles.cardDesc}>{medicine.description}</p>

                    <div className={styles.symptomsTags}>
                      {medicine.symptoms.slice(0, 3).map((sym) => (
                        <span key={sym} className={styles.symTag}>
                          {sym}
                        </span>
                      ))}
                      {medicine.symptoms.length > 3 && (
                        <span className={styles.symTagMore}>+{medicine.symptoms.length - 3} more</span>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.cardPrice}>${medicine.price.toFixed(2)}</span>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" x2="16.65" y1="21" y2="16.65" />
                    <line x1="8" x2="14" y1="11" y2="11" />
                  </svg>
                </div>
                <h3>No medicines matched your criteria</h3>
                <p>Try clearing some filters, editing your search query, or checking our Symptom Checker.</p>
                <button className="btn btn-primary" onClick={handleResetFilters}>
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Clinical Medicine Details Modal */}
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
