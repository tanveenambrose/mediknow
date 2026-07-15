'use client';

import { useState, useEffect } from 'react';
import { Medicine } from '@/data/medicines';
import MedicineCard from '@/components/MedicineCard';
import ApiMonitor from '@/components/ApiMonitor';
import { useApiMonitor } from '@/hooks/useApiMonitor';
import cardStyles from '@/components/MedicineCard.module.css';
import styles from './page.module.css';

const tabletSvg = (
  <svg width="120" height="120" viewBox="0 0 80 80" fill="none">
    <rect x="12" y="24" width="56" height="32" rx="16" fill="#7dd3fc" opacity="0.3" />
    <rect x="14" y="26" width="52" height="28" rx="14" fill="#38bdf8" opacity="0.5" />
    <rect x="14" y="26" width="26" height="28" rx="14" fill="#0ea5e9" />
    <rect x="16" y="30" width="8" height="20" rx="4" fill="#f8fafc" opacity="0.6" />
    <rect x="28" y="30" width="8" height="20" rx="4" fill="#f8fafc" opacity="0.6" />
  </svg>
);

const syrupSvg = (
  <svg width="120" height="120" viewBox="0 0 80 80" fill="none">
    <rect x="24" y="6" width="32" height="10" rx="3" fill="#94a3b8" />
    <rect x="30" y="14" width="20" height="6" rx="2" fill="#cbd5e1" />
    <path d="M22 20 h36 l-4 50 h-28 z" fill="#f0abfc" opacity="0.4" />
    <path d="M24 22 h32 l-3 46 h-26 z" fill="#d946ef" opacity="0.5" />
    <path d="M24 22 h32 l-1 36 h-30 z" fill="#c026d3" opacity="0.3" />
    <rect x="32" y="46" width="16" height="4" rx="2" fill="#f8fafc" opacity="0.5" />
    <rect x="34" y="54" width="12" height="3" rx="1.5" fill="#f8fafc" opacity="0.5" />
  </svg>
);

const inhalerSvg = (
  <svg width="120" height="120" viewBox="0 0 80 80" fill="none">
    <rect x="20" y="10" width="40" height="36" rx="8" fill="#f87171" opacity="0.3" />
    <rect x="22" y="14" width="36" height="28" rx="6" fill="#ef4444" opacity="0.5" />
    <rect x="22" y="14" width="18" height="28" rx="6" fill="#dc2626" />
    <rect x="26" y="20" width="10" height="16" rx="4" fill="#f8fafc" opacity="0.6" />
    <rect x="10" y="36" width="12" height="20" rx="4" fill="#cbd5e1" />
    <rect x="8" y="52" width="16" height="6" rx="3" fill="#94a3b8" />
    <rect x="14" y="42" width="4" height="8" rx="2" fill="#f8fafc" opacity="0.5" />
  </svg>
);

const gelSvg = (
  <svg width="120" height="120" viewBox="0 0 80 80" fill="none">
    <rect x="14" y="16" width="52" height="48" rx="10" fill="#fde047" opacity="0.3" />
    <rect x="16" y="18" width="48" height="44" rx="8" fill="#facc15" opacity="0.5" />
    <rect x="16" y="18" width="24" height="44" rx="8" fill="#eab308" />
    <circle cx="40" cy="40" r="6" fill="#f8fafc" opacity="0.4" />
    <circle cx="30" cy="50" r="4" fill="#f8fafc" opacity="0.4" />
    <circle cx="48" cy="32" r="5" fill="#f8fafc" opacity="0.4" />
    <rect x="28" y="14" width="24" height="6" rx="3" fill="#94a3b8" />
  </svg>
);

const dropsSvg = (
  <svg width="120" height="120" viewBox="0 0 80 80" fill="none">
    <rect x="26" y="4" width="28" height="12" rx="4" fill="#94a3b8" />
    <rect x="30" y="14" width="20" height="6" rx="2" fill="#cbd5e1" />
    <path d="M34 20 h12 q6 28 2 42 h-16 q-4 -14 2 -42 z" fill="#67e8f9" opacity="0.4" />
    <path d="M35 22 h10 q5 26 2 40 h-14 q-3 -14 2 -40 z" fill="#22d3ee" opacity="0.5" />
    <path d="M35 22 h10 l1 18 h-12 z" fill="#06b6d4" opacity="0.3" />
    <path d="M34 62 q-2 4 2 6 h8 q4 -2 2 -6 z" fill="#94a3b8" />
    <circle cx="40" cy="72" r="3" fill="#cbd5e1" />
  </svg>
);

const defaultMedSvg = (
  <svg width="120" height="120" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="30" fill="#e2e8f0" opacity="0.5" />
    <rect x="36" y="22" width="8" height="36" rx="4" fill="#94a3b8" />
    <rect x="22" y="36" width="36" height="8" rx="4" fill="#94a3b8" />
  </svg>
);

function FormPlaceholderIcon({ form, size }: { form: string; size?: number }) {
  const f = form.toLowerCase();
  const svg = f.includes('tablet') || f.includes('capsule') || f.includes('caplet') || f.includes('pill') ? tabletSvg
    : f.includes('syrup') || f.includes('liquid') || f.includes('solution') || f.includes('suspension') ? syrupSvg
    : f.includes('inhal') || f.includes('aerosol') || f.includes('spray') ? inhalerSvg
    : f.includes('gel') || f.includes('cream') || f.includes('ointment') || f.includes('paste') ? gelSvg
    : f.includes('drop') || f.includes('ophthalmic') || f.includes('otic') ? dropsSvg
    : defaultMedSvg;
  return <div style={{ width: size || 120, height: size || 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{svg}</div>;
}

const FLOATING_ICONS = [
  { icon: tabletSvg, style: { top: '10%', left: '5%', width: '60px', opacity: 0.15, animationDelay: '0s' } as const },
  { icon: syrupSvg, style: { top: '60%', left: '8%', width: '50px', opacity: 0.1, animationDelay: '1.5s' } as const },
  { icon: inhalerSvg, style: { top: '15%', right: '8%', width: '55px', opacity: 0.12, animationDelay: '0.8s' } as const },
  { icon: dropsSvg, style: { top: '65%', right: '5%', width: '45px', opacity: 0.1, animationDelay: '2.2s' } as const },
  { icon: gelSvg, style: { top: '40%', left: '2%', width: '40px', opacity: 0.08, animationDelay: '3s' } as const },
];

const SUBTITLE_TEXT = 'Search clinical pharmaceutical products, verify indicated symptoms, and consult with our secure medical AI assistant.';

function AnimatedSubtitle() {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(SUBTITLE_TEXT.slice(0, i));
      if (i >= SUBTITLE_TEXT.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 18);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className={styles.heroSubtitle}>
      {displayed}
      {!done && <span className={styles.cursor} />}
    </p>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedForm, setSelectedForm] = useState<string>('All');
  const [prescriptionFilter, setPrescriptionFilter] = useState<string>('All');
  const [dataSource, setDataSource] = useState<string>('all');

  const [activeModalMedicine, setActiveModalMedicine] = useState<Medicine | null>(null);

  const [loadedProducts, setLoadedProducts] = useState<Medicine[]>([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [activeSource, setActiveSource] = useState<'local' | 'openfda' | 'medidata'>('local');

  const { logs, addLog, clearLogs } = useApiMonitor();

  const categories = ['All', 'Pain Relief', 'Allergy', 'Digestive', 'Respiratory', 'Cardio'];
  const forms = ['All', 'Tablet', 'Syrup', 'Inhaler', 'Gel', 'Drops'];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      setLoading(true);
      setError(null);

      const sourceLabel = dataSource === 'medidata' ? 'MediData' : dataSource === 'all' ? 'All Sources' : 'Local DB';
      addLog({ source: dataSource === 'medidata' ? 'medidata' : 'local', type: 'request', message: `Fetching medicines — ${sourceLabel}`, details: `q="${debouncedQuery}" category=${selectedCategory} form=${selectedForm}` });

      try {
        const queryParams = new URLSearchParams({
          q: debouncedQuery,
          category: selectedCategory,
          form: selectedForm,
          prescription: prescriptionFilter,
          limit: '30',
          skip: '0',
          source: dataSource
        });

        const res = await fetch(`/api/medicines?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to load medicines');

        const data = await res.json();
        const source: 'local' | 'openfda' | 'medidata' = data.source || 'local';

        if (isMounted) {
          setLoadedProducts(data.results || []);
          setTotalProducts(data.total || 0);
          setIsFallback(!!data.fallback);
          setActiveSource(source);
          setVisibleCount(30);

          if (data.fallback) {
            addLog({ source, type: 'fallback', message: `Returned ${data.results?.length || 0} results from fallback ${source}`, details: `total: ${data.total || 0}` });
          } else {
            addLog({ source, type: 'success', message: `Loaded ${data.results?.length || 0} medicines`, details: `total: ${data.total || 0}` });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'An error occurred while connecting to Mediknow Directory.');
          addLog({ source: 'local', type: 'error', message: 'Failed to fetch medicines', details: err.message });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitial();

    return () => { isMounted = false; };
  }, [debouncedQuery, selectedCategory, selectedForm, prescriptionFilter, dataSource, addLog]);

  const handleShowMore = async () => {
    const nextSkip = loadedProducts.length;
    const newVisibleCount = visibleCount + 30;

    if (newVisibleCount > loadedProducts.length && loadedProducts.length < totalProducts) {
      setLoading(true);
      addLog({ source: activeSource, type: 'request', message: `Paginating — skip ${nextSkip}`, details: `loading next 30 results` });

      try {
        const queryParams = new URLSearchParams({
          q: debouncedQuery,
          category: selectedCategory,
          form: selectedForm,
          prescription: prescriptionFilter,
          limit: '30',
          skip: nextSkip.toString(),
          source: dataSource
        });

        const res = await fetch(`/api/medicines?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch further products');

        const data = await res.json();
        setLoadedProducts(prev => [...prev, ...data.results]);
        setTotalProducts(data.total);
        addLog({ source: activeSource, type: 'success', message: `Loaded ${data.results?.length} more medicines` });
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch further products from the server.');
        addLog({ source: activeSource, type: 'error', message: 'Pagination failed', details: err.message });
      } finally {
        setLoading(false);
      }
    }

    setVisibleCount(newVisibleCount);
  };

  const handleShowLess = () => {
    setVisibleCount(prev => Math.max(30, prev - 30));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedForm('All');
    setPrescriptionFilter('All');
    setDataSource('all');
  };

  const badgeClass = (cat: string) => {
    const normalized = cat.toLowerCase();
    if (normalized.includes('pain')) return 'badge-primary';
    if (normalized.includes('allergy')) return 'badge-secondary';
    if (normalized.includes('digestive')) return 'badge-warning';
    if (normalized.includes('respiratory')) return 'badge-primary';
    if (normalized.includes('cardio')) return 'badge-danger';
    return 'badge-primary';
  };

  return (
    <div className={styles.wrapper} suppressHydrationWarning>
      <section className={styles.heroSection}>
        <div className={styles.heroBgGlow} />
        <div className={styles.floatingIconsContainer}>
          {FLOATING_ICONS.map((item, i) => (
            <div key={i} className={styles.floatingIcon} style={item.style}>
              {item.icon}
            </div>
          ))}
        </div>
        <div className={`${styles.heroContainer} container`}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            Trusted Medical Directory & Decision Tool
          </div>
          <h1 className={styles.heroTitle}>
            Empowering Health Decisions with{' '}
            <span className={styles.titleGradient}>Verified Knowledge</span>
          </h1>
          <AnimatedSubtitle />
          <div className={`${styles.searchBarWrapper} glass-panel`}>
            <div className={styles.searchGlow} />
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

      <section className={`${styles.browseSection} container`}>
        <div className={styles.browseLayout}>
          <aside className={`${styles.filterPanel} glass-panel`}>
            <div className={styles.filterPanelHeader}>
              <h3 className={styles.filterTitle}>Filter Products</h3>
              {(selectedCategory !== 'All' || selectedForm !== 'All' || prescriptionFilter !== 'All' || searchQuery !== '') && (
                <button className={styles.resetButton} onClick={handleResetFilters}>
                  Clear All
                </button>
              )}
            </div>

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

            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupLabel}>Data Source</h4>
              <div className={styles.filterOptions}>
                {[
                  { value: 'all', label: 'All Sources' },
                  { value: 'local', label: 'Local Database' },
                  { value: 'medidata', label: 'MediData (BD)' },
                ].map((src) => (
                  <button
                    key={src.value}
                    className={`${styles.filterChip} ${dataSource === src.value ? styles.filterChipActive : ''}`}
                    onClick={() => setDataSource(src.value)}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterNotice}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12.01" y1="8" y2="8" />
              </svg>
              <span>Consult a pharmacist before mixing active compounds.</span>
            </div>
          </aside>

          <div className={styles.resultsArea}>
            <div className={styles.resultsHeader}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p className={styles.resultsCount}>
                  Showing <strong>{Math.min(visibleCount, loadedProducts.length)}</strong> of <strong>{totalProducts}</strong> {totalProducts === 1 ? 'medicine' : 'medicines'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {activeSource === 'medidata' && (
                    <span className="badge badge-secondary" style={{ backgroundColor: '#006a4e', color: '#ffffff' }}>
                      MediData Bangladesh
                    </span>
                  )}
                  {dataSource === 'medidata' && (
                    <span className="badge badge-secondary" style={{ backgroundColor: '#006a4e', color: '#ffffff' }}>
                      MediData Bangladesh
                    </span>
                  )}
                  {isFallback && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 500 }}>
                      Fallback Mode
                    </span>
                  )}
                </div>
              </div>
              {searchQuery && (
                <span className={styles.searchTermTag}>
                  Search: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {error && (
              <div className={styles.emptyState} style={{ borderColor: 'var(--danger)', padding: '3rem 2rem' }}>
                <h3 style={{ color: 'var(--danger)' }}>Connection Error</h3>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={handleResetFilters}>
                  Reset Search & Filters
                </button>
              </div>
            )}

            {!error && loading && loadedProducts.length === 0 ? (
              <div className={styles.grid}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`${cardStyles.card} glass-panel ${styles.skeletonCard}`}>
                    <div className={styles.skeletonImage}></div>
                    <div className={styles.skeletonBadge}></div>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonText} style={{ width: '80%' }}></div>
                    <div className={styles.skeletonText} style={{ width: '90%' }}></div>
                    <div className={styles.skeletonFooter}></div>
                  </div>
                ))}
              </div>
            ) : !error && loadedProducts.length > 0 ? (
              <>
                <div className={styles.grid}>
                  {loadedProducts.slice(0, visibleCount).map((medicine) => (
                    <MedicineCard
                      key={medicine.id}
                      medicine={medicine}
                      onClick={() => setActiveModalMedicine(medicine)}
                    />
                  ))}
                </div>

                <div className={styles.paginationContainer}>
                  {visibleCount > 30 && (
                    <button className="btn btn-secondary" onClick={handleShowLess}>
                      Show Less
                    </button>
                  )}
                  <span className={styles.paginationInfo}>
                    Showing {Math.min(visibleCount, loadedProducts.length)} of {totalProducts}
                  </span>
                  {visibleCount < totalProducts && (
                    <button className="btn btn-primary" onClick={handleShowMore} disabled={loading}>
                      {loading ? (
                        <>
                          <div className={cardStyles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                          Loading...
                        </>
                      ) : (
                        'See More'
                      )}
                    </button>
                  )}
                </div>
              </>
            ) : (
              !error && (
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
              )
            )}
          </div>
        </div>
      </section>

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
              <p className={styles.modalGeneric}>
                {activeModalMedicine.genericName}
              </p>
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

                {activeModalMedicine.dosageForms && activeModalMedicine.dosageForms.length > 0 && (
                  <div className={styles.modalSection}>
                    <h4 className={styles.modalSectionTitle}>Available Dosage Forms</h4>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {activeModalMedicine.dosageForms.map((df, index) => (
                        <span key={index} className="badge badge-secondary" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--dark-slate)', border: '1px solid var(--border-color)' }}>
                          {df}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalSideCol}>
                <div className={styles.modalGalleryContainer}>
                  <h4 className={styles.modalSectionTitle} style={{ marginBottom: '0.5rem' }}>Product Image</h4>
                  <div className={styles.modalMainImageContainer}>
                    {activeModalMedicine.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeModalMedicine.imageUrl}
                        alt={activeModalMedicine.name}
                        className={styles.modalMainImage}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const plc = img.parentElement?.querySelector('[data-placeholder]');
                          if (plc) (plc as HTMLElement).style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      data-placeholder
                      className={styles.modalImagePlaceholder}
                      style={{ display: activeModalMedicine.imageUrl ? 'none' : 'flex' }}
                    >
                      <FormPlaceholderIcon form={activeModalMedicine.form} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--medium-slate)', marginTop: '0.5rem' }}>
                        {activeModalMedicine.form}
                      </span>
                    </div>
                  </div>
                </div>

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
                  {activeModalMedicine.priceBDT ? (
                    <>
                      <div className={styles.priceVal}>৳{activeModalMedicine.priceBDT.toFixed(2)}</div>
                      {activeModalMedicine.price > 0 && (
                        <p className={styles.priceTax}>≈ ${activeModalMedicine.price.toFixed(2)} USD</p>
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

      <ApiMonitor logs={logs} onClear={clearLogs} />
    </div>
  );
}
