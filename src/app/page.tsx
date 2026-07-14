'use client';

import { useState, useEffect } from 'react';
import { Medicine } from '@/data/medicines';
import MedicineCard from '@/components/MedicineCard';
import cardStyles from '@/components/MedicineCard.module.css';
import styles from './page.module.css';

// SVG Category Icons for fallback in Modal
const CategoryPlaceholderIcon = ({ category }: { category: string }) => {
  const normalized = category.toLowerCase();
  
  if (normalized.includes('pain')) {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
      </svg>
    );
  }
  
  if (normalized.includes('allergy')) {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  
  if (normalized.includes('digestive')) {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
        <path d="M12 6v12M8 10h8" />
      </svg>
    );
  }
  
  if (normalized.includes('respiratory')) {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    );
  }
  
  if (normalized.includes('cardio')) {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M3.22 12H7l2-5 3 10 2-7 1.5 4h3.78" />
      </svg>
    );
  }
  
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M2 12h20" />
    </svg>
  );
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedForm, setSelectedForm] = useState<string>('All');
  const [prescriptionFilter, setPrescriptionFilter] = useState<string>('All');
  
  // Modal details
  const [activeModalMedicine, setActiveModalMedicine] = useState<Medicine | null>(null);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [loadingModalImages, setLoadingModalImages] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // API State
  const [loadedProducts, setLoadedProducts] = useState<Medicine[]>([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  // Dynamic filter options matching API mappings
  const categories = ['All', 'Pain Relief', 'Allergy', 'Digestive', 'Respiratory', 'Cardio'];
  const forms = ['All', 'Tablet', 'Syrup', 'Inhaler', 'Gel', 'Drops'];

  // Debounce search query input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch initial batch when filters or debounced query change
  useEffect(() => {
    let isMounted = true;
    
    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          q: debouncedQuery,
          category: selectedCategory,
          form: selectedForm,
          prescription: prescriptionFilter,
          limit: '30',
          skip: '0'
        });
        
        const res = await fetch(`/api/medicines?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to load medicines');
        
        const data = await res.json();
        
        if (isMounted) {
          setLoadedProducts(data.results || []);
          setTotalProducts(data.total || 0);
          setIsFallback(!!data.fallback);
          setVisibleCount(30); // reset visibility back to first 30
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'An error occurred while connecting to Mediknow Directory.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, selectedCategory, selectedForm, prescriptionFilter]);

  // Fetch further products for pagination on "Show More"
  const handleShowMore = async () => {
    const nextSkip = loadedProducts.length;
    const newVisibleCount = visibleCount + 30;
    
    // Check if we need to fetch more from API
    if (newVisibleCount > loadedProducts.length && loadedProducts.length < totalProducts) {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          q: debouncedQuery,
          category: selectedCategory,
          form: selectedForm,
          prescription: prescriptionFilter,
          limit: '30',
          skip: nextSkip.toString()
        });
        
        const res = await fetch(`/api/medicines?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch further products');
        
        const data = await res.json();
        setLoadedProducts(prev => [...prev, ...data.results]);
        setTotalProducts(data.total);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch further products from the server.');
      } finally {
        setLoading(false);
      }
    }
    
    setVisibleCount(newVisibleCount);
  };

  // Show Less handler
  const handleShowLess = () => {
    setVisibleCount(prev => Math.max(30, prev - 30));
  };

  // Modal images fetch
  useEffect(() => {
    if (!activeModalMedicine) {
      setModalImages([]);
      setActiveImageIndex(0);
      return;
    }

    if (!activeModalMedicine.isExternal) {
      setModalImages([]);
      setActiveImageIndex(0);
      return;
    }

    let isMounted = true;
    setLoadingModalImages(true);
    
    const cachedSingle = sessionStorage.getItem(`med-img-${activeModalMedicine.id}`);

    fetch(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${activeModalMedicine.id}/media.json`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const urls = data?.data?.media
          ?.filter((m: any) => m.mime_type && m.mime_type.toLowerCase().startsWith('image/'))
          ?.map((m: any) => m.url) || [];
        setModalImages(urls);
      })
      .catch(err => {
        console.error("Error loading modal images:", err);
        if (cachedSingle && cachedSingle !== 'none') {
          setModalImages([cachedSingle]);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingModalImages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeModalMedicine]);

  // Clear all filters handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedForm('All');
    setPrescriptionFilter('All');
  };

  // Determine badge colors based on category
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p className={styles.resultsCount}>
                  Showing <strong>{Math.min(visibleCount, loadedProducts.length)}</strong> of <strong>{totalProducts}</strong> {totalProducts === 1 ? 'medicine' : 'medicines'}
                </p>
                {isFallback && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 500 }}>
                    ⚠️ Network Fallback: Showing results from offline database
                  </span>
                )}
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
              // Shimmer skeleton loading
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

                {/* Pagination Controls */}
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
                {/* Image Gallery */}
                <div className={styles.modalGalleryContainer}>
                  <h4 className={styles.modalSectionTitle} style={{ marginBottom: '0.5rem' }}>Product Images</h4>
                  {loadingModalImages ? (
                    <div className={styles.modalMainImageContainer}>
                      <div className={cardStyles.spinner} style={{ margin: 'auto' }}></div>
                    </div>
                  ) : modalImages.length > 0 ? (
                    <>
                      <div className={styles.modalMainImageContainer}>
                        <img
                          src={modalImages[activeImageIndex]}
                          alt={activeModalMedicine.name}
                          className={styles.modalMainImage}
                        />
                      </div>
                      {modalImages.length > 1 && (
                        <div className={styles.modalThumbnails}>
                          {modalImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="thumbnail"
                              className={`${styles.modalThumb} ${activeImageIndex === idx ? styles.modalThumbActive : ''}`}
                              onClick={() => setActiveImageIndex(idx)}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.modalMainImageContainer} style={{ background: 'var(--bg-main)', color: 'var(--light-slate)' }}>
                      <div className={styles.cardImagePlaceholder}>
                        <CategoryPlaceholderIcon category={activeModalMedicine.category} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, marginTop: '0.5rem' }}>No Packaging Photos</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Warnings */}
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
