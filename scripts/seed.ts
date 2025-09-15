import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const diseaseData = [
  {
    name: "Common Cold",
    description: "A viral infection of the upper respiratory tract",
    symptoms: JSON.stringify(["runny nose", "sneezing", "cough", "sore throat", "congestion", "mild headache"]),
    causes: JSON.stringify(["Rhinovirus", "Coronavirus", "Respiratory syncytial virus"]),
    precautions: JSON.stringify(["Rest", "Stay hydrated", "Avoid close contact with others", "Cover mouth when coughing"]),
    medicines: JSON.stringify(["Pain relievers", "Decongestants", "Throat lozenges", "Vitamin C"]),
    severity: "low",
    category: "Respiratory"
  },
  {
    name: "Influenza",
    description: "A viral infection that attacks the respiratory system",
    symptoms: JSON.stringify(["fever", "chills", "muscle aches", "cough", "congestion", "runny nose", "headache", "fatigue"]),
    causes: JSON.stringify(["Influenza A virus", "Influenza B virus", "Influenza C virus"]),
    precautions: JSON.stringify(["Get annual flu vaccine", "Wash hands frequently", "Avoid crowds during flu season", "Stay home when sick"]),
    medicines: JSON.stringify(["Antiviral medications", "Pain relievers", "Fever reducers", "Rest and fluids"]),
    severity: "medium",
    category: "Respiratory"
  },
  {
    name: "Migraine",
    description: "A neurological condition causing severe headaches",
    symptoms: JSON.stringify(["severe headache", "nausea", "vomiting", "sensitivity to light", "sensitivity to sound", "visual disturbances"]),
    causes: JSON.stringify(["Stress", "Hormonal changes", "Certain foods", "Sleep changes", "Weather changes"]),
    precautions: JSON.stringify(["Identify triggers", "Maintain regular sleep schedule", "Manage stress", "Stay hydrated"]),
    medicines: JSON.stringify(["Triptans", "Pain relievers", "Anti-nausea medications", "Preventive medications"]),
    severity: "medium",
    category: "Neurological"
  },
  {
    name: "Gastroenteritis",
    description: "Inflammation of the stomach and intestines",
    symptoms: JSON.stringify(["nausea", "vomiting", "diarrhea", "stomach cramps", "fever", "loss of appetite"]),
    causes: JSON.stringify(["Viral infection", "Bacterial infection", "Food poisoning", "Parasites"]),
    precautions: JSON.stringify(["Stay hydrated", "Eat bland foods", "Avoid dairy", "Practice good hygiene"]),
    medicines: JSON.stringify(["Oral rehydration solutions", "Anti-diarrheal medications", "Probiotics", "Electrolyte supplements"]),
    severity: "medium",
    category: "Gastrointestinal"
  },
  {
    name: "Hypertension",
    description: "High blood pressure condition",
    symptoms: JSON.stringify(["headache", "dizziness", "shortness of breath", "chest pain", "visual changes", "fatigue"]),
    causes: JSON.stringify(["Poor diet", "Lack of exercise", "Stress", "Genetics", "Age", "Obesity"]),
    precautions: JSON.stringify(["Regular exercise", "Healthy diet", "Limit sodium", "Manage stress", "Avoid smoking"]),
    medicines: JSON.stringify(["ACE inhibitors", "Diuretics", "Beta blockers", "Calcium channel blockers"]),
    severity: "high",
    category: "Cardiovascular"
  },
  {
    name: "Diabetes Type 2",
    description: "A metabolic disorder characterized by high blood sugar",
    symptoms: JSON.stringify(["increased thirst", "frequent urination", "fatigue", "blurred vision", "slow healing", "numbness"]),
    causes: JSON.stringify(["Insulin resistance", "Poor diet", "Obesity", "Genetics", "Sedentary lifestyle"]),
    precautions: JSON.stringify(["Healthy diet", "Regular exercise", "Weight management", "Regular monitoring"]),
    medicines: JSON.stringify(["Metformin", "Insulin", "Sulfonylureas", "DPP-4 inhibitors"]),
    severity: "high",
    category: "Endocrine"
  },
  {
    name: "Asthma",
    description: "A respiratory condition causing difficulty breathing",
    symptoms: JSON.stringify(["shortness of breath", "wheezing", "chest tightness", "cough", "rapid breathing"]),
    causes: JSON.stringify(["Allergens", "Air pollution", "Exercise", "Stress", "Weather changes", "Genetics"]),
    precautions: JSON.stringify(["Avoid triggers", "Use prescribed inhalers", "Regular checkups", "Air quality monitoring"]),
    medicines: JSON.stringify(["Bronchodilators", "Corticosteroids", "Leukotriene modifiers", "Rescue inhalers"]),
    severity: "medium",
    category: "Respiratory"
  },
  {
    name: "Pneumonia",
    description: "An infection that inflames air sacs in lungs",
    symptoms: JSON.stringify(["chest pain", "fever", "chills", "cough", "shortness of breath", "fatigue", "confusion"]),
    causes: JSON.stringify(["Bacterial infection", "Viral infection", "Fungal infection", "Aspiration"]),
    precautions: JSON.stringify(["Get vaccinated", "Practice good hygiene", "Don't smoke", "Boost immunity"]),
    medicines: JSON.stringify(["Antibiotics", "Antivirals", "Pain relievers", "Oxygen therapy"]),
    severity: "high",
    category: "Respiratory"
  },
  {
    name: "Urinary Tract Infection",
    description: "An infection in any part of the urinary system",
    symptoms: JSON.stringify(["burning urination", "frequent urination", "cloudy urine", "pelvic pain", "strong-smelling urine"]),
    causes: JSON.stringify(["Bacterial infection", "Poor hygiene", "Sexual activity", "Kidney stones"]),
    precautions: JSON.stringify(["Stay hydrated", "Urinate after intercourse", "Wipe front to back", "Avoid irritants"]),
    medicines: JSON.stringify(["Antibiotics", "Pain relievers", "Urinary alkalizers", "Cranberry supplements"]),
    severity: "medium",
    category: "Urological"
  },
  {
    name: "Depression",
    description: "A mental health disorder causing persistent sadness",
    symptoms: JSON.stringify(["persistent sadness", "loss of interest", "fatigue", "sleep changes", "appetite changes", "difficulty concentrating"]),
    causes: JSON.stringify(["Brain chemistry", "Genetics", "Life events", "Medical conditions", "Medications"]),
    precautions: JSON.stringify(["Regular exercise", "Social support", "Stress management", "Adequate sleep"]),
    medicines: JSON.stringify(["Antidepressants", "Mood stabilizers", "Anti-anxiety medications", "Therapy"]),
    severity: "medium",
    category: "Mental Health"
  }
]

async function seedDatabase() {
  console.log('🌱 Seeding database with disease data...')
  
  for (const disease of diseaseData) {
    await prisma.disease.upsert({
      where: { name: disease.name },
      update: disease,
      create: disease,
    })
  }
  
  console.log('✅ Database seeded successfully!')
}

async function main() {
  try {
    await seedDatabase()
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { seedDatabase }