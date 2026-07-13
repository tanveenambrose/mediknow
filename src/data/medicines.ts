export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: 'Pain Relief' | 'Allergy' | 'Digestive' | 'Respiratory' | 'Cardio';
  form: 'Tablet' | 'Syrup' | 'Inhaler' | 'Gel' | 'Drops';
  description: string;
  uses: string[];
  sideEffects: string[];
  warnings: string[];
  dosage: string;
  prescriptionRequired: boolean;
  price: number;
  symptoms: string[];
}

export const MEDICINES_DB: Medicine[] = [
  {
    id: "paracetamol-500",
    name: "Acetomed Paracetamol",
    genericName: "Paracetamol (Acetaminophen) 500mg",
    category: "Pain Relief",
    form: "Tablet",
    description: "A widely used over-the-counter analgesic (pain reliever) and antipyretic (fever reducer). Essential for common cold symptoms and minor aches.",
    uses: ["Reduces fever", "Relieves mild to moderate headache", "Alleviates muscle soreness", "Eases toothache"],
    sideEffects: ["Nausea (rare)", "Allergic skin rash (very rare)"],
    warnings: [
      "Do not exceed 4,000mg (8 tablets) in 24 hours to avoid severe liver damage.",
      "Avoid concurrent use of other paracetamol-containing medications.",
      "Consult a doctor if fever lasts more than 3 days."
    ],
    dosage: "1 to 2 tablets every 4 to 6 hours as needed. Maximum 8 tablets per day.",
    prescriptionRequired: false,
    price: 4.99,
    symptoms: ["headache", "fever", "muscle pain", "joint pain", "sore throat"]
  },
  {
    id: "ibuprofen-400",
    name: "Ibu-Pro Relief",
    genericName: "Ibuprofen 400mg",
    category: "Pain Relief",
    form: "Tablet",
    description: "A nonsteroidal anti-inflammatory drug (NSAID) used for reducing hormones that cause pain and inflammation in the body.",
    uses: ["Reduces swelling and inflammation", "Relieves toothache and menstrual cramps", "Eases migraine and joint stiffness", "Fever reduction"],
    sideEffects: ["Stomach upset or heartburn", "Mild dizziness", "Bloating"],
    warnings: [
      "Take with food or milk to minimize stomach irritation.",
      "Not recommended for individuals with active stomach ulcers or kidney issues.",
      "May increase the risk of cardiovascular events if used long-term."
    ],
    dosage: "1 tablet every 6 to 8 hours with food. Do not exceed 3 tablets (1200mg) per day without medical advice.",
    prescriptionRequired: false,
    price: 5.49,
    symptoms: ["headache", "migraine", "muscle pain", "joint pain", "fever"]
  },
  {
    id: "cetirizine-10",
    name: "Ceti-Tabs Allergy",
    genericName: "Cetirizine Hydrochloride 10mg",
    category: "Allergy",
    form: "Tablet",
    description: "A second-generation, non-drowsy 24-hour antihistamine that temporarily relieves symptoms of hay fever and upper respiratory allergies.",
    uses: ["Relieves runny nose", "Reduces sneezing", "Eases itchy, watery eyes", "Calms itchy throat or nose"],
    sideEffects: ["Mild drowsiness (in some individuals)", "Dry mouth", "Fatigue"],
    warnings: [
      "Avoid consuming alcohol or using sedatives while taking this medication.",
      "Be cautious when driving or operating heavy machinery.",
      "Consult a healthcare professional if you have kidney or liver disease."
    ],
    dosage: "1 tablet (10mg) daily. Do not exceed 1 tablet in 24 hours.",
    prescriptionRequired: false,
    price: 8.99,
    symptoms: ["running nose", "sneezing", "itchy eyes", "allergies"]
  },
  {
    id: "omeprazole-20",
    name: "Ome-Shield Acid Reducer",
    genericName: "Omeprazole Delayed-Release 20mg",
    category: "Digestive",
    form: "Tablet",
    description: "A proton pump inhibitor (PPI) that decreases the amount of acid produced in the stomach, providing long-lasting relief from acid reflux.",
    uses: ["Treats frequent heartburn (occurring 2 or more days a week)", "Heals gastroesophageal reflux disease (GERD) symptoms", "Protects stomach lining"],
    sideEffects: ["Headache", "Abdominal pain or flatulence", "Mild diarrhea"],
    warnings: [
      "Must be taken in the morning, 30-60 minutes before breakfast.",
      "This product is not intended for immediate relief of heartburn (may take 1-4 days for full effect).",
      "Do not use for more than 14 consecutive days unless directed by a doctor."
    ],
    dosage: "1 tablet daily, taken in the morning with a glass of water before eating. Repeat daily for a 14-day course.",
    prescriptionRequired: false,
    price: 14.50,
    symptoms: ["heartburn", "indigestion", "acid reflux"]
  },
  {
    id: "loperamide-2",
    name: "Loper-Curb Anti-Diarrheal",
    genericName: "Loperamide Hydrochloride 2mg",
    category: "Digestive",
    form: "Tablet",
    description: "A fast-acting medication that slows down gut movement, allowing the body to absorb fluids and salts, restoring digestive balance.",
    uses: ["Controls and relieves sudden, acute diarrhea symptoms", "Helps reduce loose stools"],
    sideEffects: ["Constipation", "Dizziness or drowsiness", "Dry mouth"],
    warnings: [
      "Do not use if you have bloody stools, high fever, or signs of bacterial infection.",
      "Ensure proper hydration by drinking plenty of electrolyte solutions.",
      "Discontinue use and consult a doctor if symptoms persist after 48 hours."
    ],
    dosage: "Take 2 tablets (4mg) initially, followed by 1 tablet (2mg) after each subsequent loose bowel movement. Maximum 8mg (4 tablets) per day.",
    prescriptionRequired: false,
    price: 6.25,
    symptoms: ["diarrhea", "loose stool"]
  },
  {
    id: "salbutamol-inhaler",
    name: "Aero-Breathe Inhaler",
    genericName: "Salbutamol (Albuterol) 100mcg/Actuation",
    category: "Respiratory",
    form: "Inhaler",
    description: "A rapid-acting bronchodilator (beta-2 agonist) that relaxes the muscles surrounding the airways, opening up passages to ease breathing.",
    uses: ["Quick relief of bronchospasm", "Prevents asthma attacks triggered by exercise", "Treats chronic obstructive pulmonary disease (COPD) symptoms"],
    sideEffects: ["Tremor or shakiness", "Increased heart rate (palpitations)", "Mild headache"],
    warnings: [
      "Use only as directed. Frequent use (more than 3 times weekly) indicates poorly controlled asthma.",
      "Always carry this rescue inhaler with you.",
      "Consult a doctor immediately if breathing worsens rapidly after inhalation."
    ],
    dosage: "1 to 2 puffs inhaled every 4 to 6 hours as needed for bronchospasm. 2 puffs 15 minutes before exercise.",
    prescriptionRequired: true,
    price: 18.99,
    symptoms: ["asthma", "cough", "shortness of breath", "wheezing"]
  },
  {
    id: "dextromethorphan-syrup",
    name: "Dextro-Cough Suppressant",
    genericName: "Dextromethorphan HBr Syrup 15mg/5mL",
    category: "Respiratory",
    form: "Syrup",
    description: "An effective non-narcotic cough suppressant designed to temporarily calm coughs caused by minor throat and bronchial irritation.",
    uses: ["Suppresses dry, hacking, tickly coughs", "Soothes irritated throat lining"],
    sideEffects: ["Drowsiness", "Mild dizziness", "Stomach upset"],
    warnings: [
      "Do not use if you are currently taking a Monoamine Oxidase Inhibitor (MAOI) or within 14 days of stopping it.",
      "Do not use for persistent or chronic cough (e.g., from smoking, asthma, emphysema).",
      "Keep out of reach of children. Abuse can lead to serious adverse effects."
    ],
    dosage: "10mL (30mg) every 6 to 8 hours as needed. Do not exceed 40mL in 24 hours.",
    prescriptionRequired: false,
    price: 7.99,
    symptoms: ["dry cough", "cough", "sore throat"]
  },
  {
    id: "guaifenesin-syrup",
    name: "Mucus-Clear Expectorant",
    genericName: "Guaifenesin Syrup 100mg/5mL",
    category: "Respiratory",
    form: "Syrup",
    description: "An expectorant that helps thin and loosen mucus in the lungs and airways, making coughs more productive and clearing chest congestion.",
    uses: ["Loosens chest congestion", "Thins mucus, making wet coughs productive", "Helps clear air passages"],
    sideEffects: ["Nausea or vomiting (rare)", "Headache"],
    warnings: [
      "Drink a full glass of water with each dose to assist in thinning mucus.",
      "Consult a doctor if cough lasts more than 7 days, returns, or is accompanied by fever.",
      "Not recommended for children under 4 years of age."
    ],
    dosage: "10mL to 20mL (200mg to 400mg) every 4 hours as needed. Maximum 120mL per 24 hours.",
    prescriptionRequired: false,
    price: 8.50,
    symptoms: ["wet cough", "cough", "congestion", "stuffy nose"]
  },
  {
    id: "atorvastatin-20",
    name: "Lipi-Guard Atorvastatin",
    genericName: "Atorvastatin Calcium 20mg",
    category: "Cardio",
    form: "Tablet",
    description: "A statin class medication used to lower blood cholesterol levels, reduce LDL ('bad') cholesterol, and decrease the risk of cardiovascular events.",
    uses: ["Lowers total cholesterol and LDL cholesterol", "Increases HDL ('good') cholesterol", "Reduces risk of stroke or heart attack in high-risk patients"],
    sideEffects: ["Muscle pain (myalgia)", "Mild headache", "Altered liver enzymes"],
    warnings: [
      "Requires regular blood tests to monitor liver function.",
      "Avoid grapefruit juice as it increases the concentration of atorvastatin in the blood.",
      "Contact your doctor immediately if you experience unexplained, persistent muscle pain or weakness."
    ],
    dosage: "1 tablet daily, taken at any time of day with or without food. Usually started at 10mg or 20mg daily.",
    prescriptionRequired: true,
    price: 32.00,
    symptoms: ["cholesterol", "cardiovascular health"]
  },
  {
    id: "antacid-chews",
    name: "Tumi-Calm Chews",
    genericName: "Calcium Carbonate 750mg",
    category: "Digestive",
    form: "Tablet",
    description: "An antacid chewable tablet that works instantly by neutralizing excess stomach acid on contact, relieving acid indigestion and sour stomach.",
    uses: ["Relieves acid indigestion", "Eases sour stomach", "Soothes occasional heartburn"],
    sideEffects: ["Constipation (with excessive use)", "Dry mouth"],
    warnings: [
      "Do not take more than 10 tablets in 24 hours (or 6 tablets if pregnant).",
      "Do not use the maximum dosage for more than 2 weeks.",
      "May interfere with the absorption of other prescription drugs; separate intake by 2 hours."
    ],
    dosage: "Chew 2 to 4 tablets thoroughly as symptoms occur, or as directed by a doctor.",
    prescriptionRequired: false,
    price: 5.99,
    symptoms: ["heartburn", "indigestion", "stomach ache"]
  }
];

export const SYMPTOMS_LIST = [
  { id: "headache", name: "Headache", severity: "Mild" },
  { id: "migraine", name: "Migraine", severity: "Moderate" },
  { id: "fever", name: "Fever", severity: "Moderate" },
  { id: "sore throat", name: "Sore Throat", severity: "Mild" },
  { id: "dry cough", name: "Dry Cough", severity: "Mild" },
  { id: "wet cough", name: "Wet Cough / Congestion", severity: "Mild" },
  { id: "running nose", name: "Running Nose", severity: "Mild" },
  { id: "stuffy nose", name: "Stuffy Nose", severity: "Mild" },
  { id: "heartburn", name: "Heartburn / Acid Reflux", severity: "Mild" },
  { id: "indigestion", name: "Indigestion", severity: "Mild" },
  { id: "diarrhea", name: "Diarrhea", severity: "Moderate" },
  { id: "muscle pain", name: "Muscle Pain / Body Aches", severity: "Mild" },
  { id: "joint pain", name: "Joint Pain / Swelling", severity: "Mild" },
  { id: "sneezing", name: "Sneezing", severity: "Mild" },
  { id: "itchy eyes", name: "Itchy / Watery Eyes", severity: "Mild" }
];

export const URGENT_SYMPTOMS = [
  "chest pain",
  "difficulty breathing",
  "severe shortness of breath",
  "sudden weakness or numbness",
  "slurred speech",
  "loss of consciousness",
  "severe abdominal pain",
  "high fever with neck stiffness"
];
