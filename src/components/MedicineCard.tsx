'use client';

import { useState, useEffect } from 'react';
import { Medicine } from '@/data/medicines';
import styles from '@/app/page.module.css';

// SVG icons for different categories
const CategoryPlaceholderIcon = ({ category }: { category: string }) => {
  const normalized = category.toLowerCase();
  
  if (normalized.includes('pain')) {
    // Pill/Capsule SVG
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
      </svg>
    );
  }
  
  if (normalized.includes('allergy')) {
    // Shield/Allergy protection SVG
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  
  if (normalized.includes('digestive')) {
    // Activity/Stomach/Digestion SVG
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
        <path d="M12 6v12M8 10h8" />
      </svg>
    );
  }
  
  if (normalized.includes('respiratory')) {
    // Breath/Lungs/Wind SVG
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    );
  }
  
  if (normalized.includes('cardio')) {
    // Heart/Pulse SVG
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M3.22 12H7l2-5 3 10 2-7 1.5 4h3.78" />
      </svg>
    );
  }
  
  // Default: Medical Cross
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M2 12h20" />
    </svg>
  );
};

interface MedicineCardProps {
  medicine: Medicine;
  onClick: () => void;
}

export default function MedicineCard({ medicine, onClick }: MedicineCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!medicine.isExternal) return;

    // Safely check session cache (sessionStorage may not be available in all envs)
    try {
      const cachedUrl = sessionStorage.getItem(`med-img-${medicine.id}`);
      if (cachedUrl) {
        if (cachedUrl !== 'none') {
          setImageUrl(cachedUrl);
        }
        return;
      }
    } catch {
      // sessionStorage unavailable
    }

    let isMounted = true;
    setLoading(true);

    fetch(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${medicine.id}/media.json`)
      .then((res) => {
        if (!res.ok) throw new Error('DailyMed media not found');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        
        // Find the first image url in the media list
        const image = data?.data?.media?.find((m: any) => 
          m.mime_type && m.mime_type.toLowerCase().startsWith('image/')
        );
        
        if (image && image.url) {
          setImageUrl(image.url);
          try { sessionStorage.setItem(`med-img-${medicine.id}`, image.url); } catch {}
        } else {
          try { sessionStorage.setItem(`med-img-${medicine.id}`, 'none'); } catch {}
        }
      })
      .catch(() => {
        // Silently catch and cache as 'none' to avoid spamming the NLM server
        if (isMounted) {
          try { sessionStorage.setItem(`med-img-${medicine.id}`, 'none'); } catch {}
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [medicine]);

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
    <div className={`${styles.card} glass-panel`} onClick={onClick} suppressHydrationWarning>
      <div className={styles.cardImageContainer}>
        {loading ? (
          <div className={styles.imageLoader}>
            <div className={styles.spinner}></div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={medicine.name}
            className={styles.cardImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <CategoryPlaceholderIcon category={medicine.category} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--medium-slate)' }}>
              {medicine.form}
            </span>
          </div>
        )}
      </div>

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
      <p className={styles.cardGeneric} title={medicine.genericName}>
        {medicine.genericName}
      </p>
      
      {medicine.manufacturer && (
        <p style={{ fontSize: '0.75rem', color: 'var(--light-slate)', marginTop: '-0.75rem' }}>
          By: {medicine.manufacturer}
        </p>
      )}

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
  );
}
