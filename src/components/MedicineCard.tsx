'use client';

import { useState } from 'react';
import { Medicine } from '@/data/medicines';
import styles from './MedicineCard.module.css';

const tabletSvg = (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <rect x="12" y="24" width="56" height="32" rx="16" fill="#7dd3fc" opacity="0.3" />
    <rect x="14" y="26" width="52" height="28" rx="14" fill="#38bdf8" opacity="0.5" />
    <rect x="14" y="26" width="26" height="28" rx="14" fill="#0ea5e9" />
    <rect x="16" y="30" width="8" height="20" rx="4" fill="#f8fafc" opacity="0.6" />
    <rect x="28" y="30" width="8" height="20" rx="4" fill="#f8fafc" opacity="0.6" />
  </svg>
);

const syrupSvg = (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
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
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
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
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
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
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
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
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="30" fill="#e2e8f0" opacity="0.5" />
    <rect x="36" y="22" width="8" height="36" rx="4" fill="#94a3b8" />
    <rect x="22" y="36" width="36" height="8" rx="4" fill="#94a3b8" />
  </svg>
);

function FormPlaceholderIcon({ form }: { form: string }) {
  const f = form.toLowerCase();
  if (f.includes('tablet') || f.includes('capsule') || f.includes('caplet') || f.includes('pill')) return tabletSvg;
  if (f.includes('syrup') || f.includes('liquid') || f.includes('solution') || f.includes('suspension')) return syrupSvg;
  if (f.includes('inhal') || f.includes('aerosol') || f.includes('spray')) return inhalerSvg;
  if (f.includes('gel') || f.includes('cream') || f.includes('ointment') || f.includes('paste')) return gelSvg;
  if (f.includes('drop') || f.includes('ophthalmic') || f.includes('otic')) return dropsSvg;
  return defaultMedSvg;
}

interface MedicineCardProps {
  medicine: Medicine;
  onClick: () => void;
}

export default function MedicineCard({ medicine, onClick }: MedicineCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!medicine.imageUrl);

  const badgeClass = (cat: string) => {
    const normalized = cat.toLowerCase();
    if (normalized.includes('pain')) return 'badge-primary';
    if (normalized.includes('allergy')) return 'badge-secondary';
    if (normalized.includes('digestive')) return 'badge-warning';
    if (normalized.includes('respiratory')) return 'badge-primary';
    if (normalized.includes('cardio')) return 'badge-danger';
    return 'badge-primary';
  };

  const hasImage = medicine.imageUrl && !imageError;

  return (
    <div className={`${styles.card} glass-panel`} onClick={onClick} suppressHydrationWarning>
      <div className={styles.cardImageContainer}>
        {hasImage ? (
          <>
            {imageLoading && (
              <div className={styles.imageLoader}>
                <div className={styles.spinner}></div>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={medicine.imageUrl!}
              alt={medicine.name}
              className={styles.cardImage}
              style={{ display: imageLoaded ? 'block' : 'none' }}
              onLoad={() => { setImageLoaded(true); setImageLoading(false); }}
              onError={() => { setImageError(true); setImageLoading(false); }}
            />
          </>
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <FormPlaceholderIcon form={medicine.form} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--medium-slate)' }}>
              {medicine.form}
            </span>
          </div>
        )}
        {medicine.isBangladeshi && (
          <span className={styles.bdBadge}>BD</span>
        )}
      </div>

      <div className={styles.cardHeader}>
        <span className={`${badgeClass(medicine.category)} badge`}>
          {medicine.category}
        </span>
        {medicine.prescriptionRequired ? (
          <span className="badge badge-danger">Rx</span>
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
        <div>
          {medicine.priceBDT ? (
            <span className={styles.cardPrice}>৳{medicine.priceBDT.toFixed(2)}</span>
          ) : medicine.price > 0 ? (
            <span className={styles.cardPrice}>${medicine.price.toFixed(2)}</span>
          ) : (
            <span className={styles.cardPrice} style={{ fontSize: '0.85rem' }}>Price varies</span>
          )}
          {medicine.priceBDT && medicine.price > 0 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--light-slate)', display: 'block' }}>
              ~${medicine.price.toFixed(2)}
            </span>
          )}
        </div>
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
          View Details
        </button>
      </div>
    </div>
  );
}
