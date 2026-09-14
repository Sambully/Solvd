import { prisma } from "@/lib/prisma";
import type { Difficulty } from "@prisma/client";

export interface BankQuestionInput {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  diagramSvg?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  subject: "Physics" | "Chemistry" | "Biology";
  chapter?: string;
  topic?: string;
}

export interface CuratedModuleSeed {
  id: string;
  title: string;
  description: string;
  subject: "Physics" | "Chemistry" | "Biology" | "Full Syllabus";
  chapter: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  questions: BankQuestionInput[];
}

export const CURATED_MODULES_SEED: CuratedModuleSeed[] = [
  {
    id: "curated-bio-genetics-ncert",
    title: "NCERT Line-by-Line: Genetics & Molecular Inheritance",
    description: "High-yield conceptual drill on Mendel's laws, DNA replication, transcription, translation, and genetic disorders based strictly on NCERT.",
    subject: "Biology",
    chapter: "Genetics and Evolution",
    difficulty: "MEDIUM",
    tags: ["NCERT High-Yield", "Genetics", "Repeated 2024", "Botany & Zoology"],
    questions: [
      {
        questionText: "In a dihybrid cross, if two genes are linked and present on the same chromosome with zero recombination, the F2 phenotypic ratio will be:",
        options: ["9:3:3:1", "3:1", "1:2:1", "9:7"],
        correctOptionIndex: 1,
        explanation: "When two genes are completely linked (0% recombination), they segregate together as a single unit, yielding a monohybrid F2 phenotypic ratio of 3:1.",
        difficulty: "MEDIUM",
        subject: "Biology",
        chapter: "Principles of Inheritance and Variation",
        topic: "Linkage and Recombination",
      },
      {
        questionText: "Which of the following nitrogenous bases is present in DNA but absent in RNA?",
        options: ["Uracil", "Thymine (5-methyl uracil)", "Cytosine", "Adenine"],
        correctOptionIndex: 1,
        explanation: "Thymine (chemically 5-methyl uracil) provides additional chemical stability to DNA and is replaced by Uracil in RNA molecules.",
        difficulty: "EASY",
        subject: "Biology",
        chapter: "Molecular Basis of Inheritance",
        topic: "Structure of Polynucleotide Chain",
      },
      {
        questionText: "The enzyme responsible for unwinding the DNA double helix during prokaryotic DNA replication is:",
        options: ["DNA Polymerase III", "DNA Ligase", "DNA Helicase", "Topoisomerase"],
        correctOptionIndex: 2,
        explanation: "DNA Helicase breaks the hydrogen bonds between complementary base pairs to unwind the double helix and form the replication fork.",
        difficulty: "EASY",
        subject: "Biology",
        chapter: "Molecular Basis of Inheritance",
        topic: "DNA Replication",
      },
      {
        questionText: "A person with Turner's syndrome exhibits which of the following karyotypic abnormalities?",
        options: ["47, XXY", "45, X0", "47, +21", "47, XYY"],
        correctOptionIndex: 1,
        explanation: "Turner's syndrome is caused by the monosomy of sex chromosomes (45 with X0), causing sterile females with rudimentary ovaries and webbed neck.",
        difficulty: "EASY",
        subject: "Biology",
        chapter: "Principles of Inheritance and Variation",
        topic: "Chromosomal Disorders",
      },
      {
        questionText: "Which initiation codon in eukaryotic translation also codes for the amino acid Methionine?",
        options: ["UAA", "AUG", "UAG", "UGA"],
        correctOptionIndex: 1,
        explanation: "AUG is the dual-function codon: it acts as the initiation codon for translation and codes for Methionine (Met).",
        difficulty: "EASY",
        subject: "Biology",
        chapter: "Molecular Basis of Inheritance",
        topic: "Genetic Code",
      },
      {
        questionText: "In the lac operon model, the repressor protein binds to which specific region of DNA to block RNA polymerase transcription?",
        options: ["Promoter region (p)", "Structural gene z", "Operator region (o)", "Regulator gene i"],
        correctOptionIndex: 2,
        explanation: "The active repressor protein synthesized by the i-gene binds to the operator (o) region, preventing RNA polymerase from transcribing the structural genes.",
        difficulty: "MEDIUM",
        subject: "Biology",
        chapter: "Molecular Basis of Inheritance",
        topic: "Regulation of Gene Expression",
      },
      {
        questionText: "During DNA replication, Okazaki fragments synthesized on the lagging strand are joined covalently by:",
        options: ["DNA Polymerase I", "DNA Ligase", "Primase", "RNA Helicase"],
        correctOptionIndex: 1,
        explanation: "DNA Ligase catalyzes the formation of phosphodiester bonds between discontinuous Okazaki fragments on the lagging strand.",
        difficulty: "EASY",
        subject: "Biology",
        chapter: "Molecular Basis of Inheritance",
        topic: "Replication Machinery",
      },
      {
        questionText: "Klinefelter's syndrome is characterized by which chromosome complement?",
        options: ["45, X0", "47, XXY", "47, XYY", "46, XX"],
        correctOptionIndex: 1,
        explanation: "Klinefelter's syndrome is an aneuploid condition resulting from the addition of an extra X chromosome in males (47, XXY), causing gynecomastia and sterility.",
        difficulty: "EASY",
        subject: "Biology",
        chapter: "Principles of Inheritance and Variation",
        topic: "Genetic Disorders",
      },
      {
        questionText: "Which experimental model organism was extensively used by Thomas Hunt Morgan to establish the chromosomal theory of linkage and sex linkage?",
        options: ["Pisum sativum", "Escherichia coli", "Drosophila melanogaster", "Neurospora crassa"],
        correctOptionIndex: 2,
        explanation: "T.H. Morgan worked with Drosophila melanogaster (fruit fly) because of its short two-week life cycle, clear sexual dimorphism, and distinct hereditary variations.",
        difficulty: "EASY",
        subject: "Biology",
        chapter: "Principles of Inheritance and Variation",
        topic: "Sex Determination and Linkage",
      },
      {
        questionText: "In transcription, the non-template strand whose sequence matches the transcribed mRNA (with T instead of U) is termed the:",
        options: ["Antisense strand", "Coding strand", "Template strand", "Primer strand"],
        correctOptionIndex: 1,
        explanation: "The coding strand (5' -> 3') has the same polarity and nucleotide sequence as the synthesized RNA transcript (replacing Thymine with Uracil).",
        difficulty: "MEDIUM",
        subject: "Biology",
        chapter: "Molecular Basis of Inheritance",
        topic: "Transcription Unit",
      },
    ],
  },
  {
    id: "curated-phy-mechanics-optics",
    title: "Physics Rank Booster: Mechanics & Ray Optics",
    description: "Multi-concept numericals on Rotational Motion, Torque, Moment of Inertia, Lens Formula, and Prism Refraction calibrated to NTA NEET difficulty.",
    subject: "Physics",
    chapter: "Mechanics and Optics",
    difficulty: "HARD",
    tags: ["Rank Booster", "Mechanics", "Ray Optics", "Calculations"],
    questions: [
      {
        questionText: "A solid sphere of mass M and radius R rolls without slipping down an inclined plane of angle θ. The linear acceleration of its center of mass is:",
        options: ["(5/7) g sin θ", "(2/3) g sin θ", "(1/2) g sin θ", "(3/5) g sin θ"],
        correctOptionIndex: 0,
        explanation: "For rolling without slipping: a = (g sin θ) / (1 + I/(M R^2)). Since I = (2/5) M R^2 for a solid sphere, a = (g sin θ)/(1 + 2/5) = (5/7) g sin θ.",
        difficulty: "HARD",
        subject: "Physics",
        chapter: "System of Particles and Rotational Motion",
        topic: "Rolling Motion",
      },
      {
        questionText: "A ray of light is incident on an equilateral glass prism (refractive index μ = √3) at the angle of minimum deviation. The angle of incidence is:",
        options: ["30°", "45°", "60°", "75°"],
        correctOptionIndex: 2,
        explanation: "For equilateral prism, A = 60°. At minimum deviation, r = A/2 = 30°. Using Snell's law: sin i = μ sin r = √3 * sin(30°) = √3 * (1/2) = √3/2 => i = 60°.",
        difficulty: "MEDIUM",
        subject: "Physics",
        chapter: "Ray Optics and Optical Instruments",
        topic: "Prism Refraction",
      },
      {
        questionText: "A convex lens of focal length 20 cm is placed in contact with a concave lens of focal length 30 cm. The equivalent power of the lens combination is:",
        options: ["+1.67 D", "+2.5 D", "-1.67 D", "+5.0 D"],
        correctOptionIndex: 0,
        explanation: "P1 = 100/20 = +5 D; P2 = -100/30 = -3.33 D. Total power P = P1 + P2 = +5 - 3.33 = +1.67 Diopters.",
        difficulty: "EASY",
        subject: "Physics",
        chapter: "Ray Optics",
        topic: "Combination of Thin Lenses",
      },
      {
        questionText: "The moment of inertia of a uniform circular disc of mass M and radius R about a tangent in its plane is:",
        options: ["(1/4) M R^2", "(1/2) M R^2", "(5/4) M R^2", "(3/2) M R^2"],
        correctOptionIndex: 2,
        explanation: "By parallel axes theorem: I_tangent = I_diameter + M R^2 = (1/4) M R^2 + M R^2 = (5/4) M R^2.",
        difficulty: "MEDIUM",
        subject: "Physics",
        chapter: "Rotational Motion",
        topic: "Moment of Inertia Theorems",
      },
      {
        questionText: "Two particles of mass 1 kg and 3 kg have position vectors (2î + 3ĵ + 4k̂) m and (-2î + 3ĵ - 4k̂) m respectively. The center of mass of the system is at:",
        options: ["(-î + 3ĵ - 2k̂) m", "(0î + 3ĵ + 0k̂) m", "(-î + 3ĵ + 0k̂) m", "(î + 2ĵ - k̂) m"],
        correctOptionIndex: 0,
        explanation: "R_cm = (m1 r1 + m2 r2) / (m1 + m2) = [1*(2î+3ĵ+4k̂) + 3*(-2î+3ĵ-4k̂)] / 4 = [ (2-6)î + (3+9)ĵ + (4-12)k̂ ] / 4 = (-4î + 12ĵ - 8k̂)/4 = -î + 3ĵ - 2k̂ m.",
        difficulty: "MEDIUM",
        subject: "Physics",
        chapter: "Center of Mass",
        topic: "Discrete Mass Distribution",
      },
      {
        questionText: "An astronomical telescope has an objective of focal length 100 cm and an eyepiece of focal length 5 cm. In normal adjustment, its magnifying power is:",
        options: ["20", "500", "95", "105"],
        correctOptionIndex: 0,
        explanation: "Magnification in normal adjustment M = f_o / f_e = 100 cm / 5 cm = 20.",
        difficulty: "EASY",
        subject: "Physics",
        chapter: "Optical Instruments",
        topic: "Astronomical Telescope",
      },
      {
        questionText: "A body of mass 2 kg falls from a height of 20 m onto the ground and comes to rest. Taking g = 10 m/s², the work done by gravitational force on the body is:",
        options: ["-400 J", "+400 J", "-200 J", "+200 J"],
        correctOptionIndex: 1,
        explanation: "Work done by gravity = m g h = 2 kg * 10 m/s² * 20 m = +400 J (displacement is in the direction of the gravitational force).",
        difficulty: "EASY",
        subject: "Physics",
        chapter: "Work, Energy and Power",
        topic: "Work Done by Constant Force",
      },
      {
        questionText: "If the angular momentum of a rotating body is increased by 200%, its rotational kinetic energy increases by:",
        options: ["200%", "400%", "800%", "300%"],
        correctOptionIndex: 2,
        explanation: "Rotational kinetic energy K = L^2 / (2I). If L becomes 3L (200% increase), K' = (3L)^2 / (2I) = 9 K. The percentage increase = ((9K - K)/K) * 100% = 800%.",
        difficulty: "HARD",
        subject: "Physics",
        chapter: "Rotational Motion",
        topic: "Angular Momentum and Kinetic Energy",
      },
    ],
  },
  {
    id: "curated-chem-organic-bonding",
    title: "Chemistry High-Yield: Organic Reactions & Chemical Bonding",
    description: "Rapid test on Aldol condensation, Cannizzaro reaction, Grignard reagents, hybridization, and dipole moments for NEET 2026.",
    subject: "Chemistry",
    chapter: "Organic Chemistry & Bonding",
    difficulty: "MEDIUM",
    tags: ["Organic Chemistry", "Chemical Bonding", "Named Reactions", "High-Yield"],
    questions: [
      {
        questionText: "Which of the following carbonyl compounds undergoes the Cannizzaro reaction when treated with concentrated NaOH?",
        options: ["Acetaldehyde (CH3CHO)", "Benzaldehyde (C6H5CHO)", "Acetone (CH3COCH3)", "Propanal (CH3CH2CHO)"],
        correctOptionIndex: 1,
        explanation: "Aldehydes lacking α-hydrogen atoms (such as Benzaldehyde C6H5CHO and Formaldehyde HCHO) undergo disproportionation (Cannizzaro reaction) in concentrated alkali.",
        difficulty: "EASY",
        subject: "Chemistry",
        chapter: "Aldehydes, Ketones and Carboxylic Acids",
        topic: "Cannizzaro Reaction",
      },
      {
        questionText: "According to VSEPR theory, the geometry and hybridization of the Xenon tetrafluoride (XeF4) molecule are respectively:",
        options: ["Tetrahedral, sp3", "Square planar, sp3d2", "Octahedral, sp3d2", "See-saw, sp3d"],
        correctOptionIndex: 1,
        explanation: "Xe has 8 valence electrons. With 4 bonding pairs and 2 lone pairs (steric number = 6), the hybridization is sp3d2 with a Square Planar molecular geometry.",
        difficulty: "MEDIUM",
        subject: "Chemistry",
        chapter: "Chemical Bonding and Molecular Structure",
        topic: "VSEPR and Hybridization",
      },
      {
        questionText: "Which of the following diatomic molecules is paramagnetic according to Molecular Orbital Theory (MOT)?",
        options: ["N2", "C2", "O2", "F2"],
        correctOptionIndex: 2,
        explanation: "Oxygen (O2) contains 16 electrons. Its electronic configuration in MOT leaves 2 unpaired electrons in degenerate antibonding π*2px and π*2py orbitals, making it paramagnetic.",
        difficulty: "EASY",
        subject: "Chemistry",
        chapter: "Chemical Bonding",
        topic: "Molecular Orbital Theory",
      },
      {
        questionText: "Treatment of ethyl magnesium bromide (CH3CH2MgBr) with dry ice (solid CO2) followed by acid hydrolysis yields:",
        options: ["Propanoic acid", "Ethanoic acid", "Propanone", "Ethanol"],
        correctOptionIndex: 0,
        explanation: "Grignard reagent addition to CO2 forms a magnesium halocarboxylate salt which upon acid hydrolysis produces Propanoic acid (CH3CH2COOH).",
        difficulty: "MEDIUM",
        subject: "Chemistry",
        chapter: "Carboxylic Acids",
        topic: "Preparation from Grignard Reagent",
      },
      {
        questionText: "The correct order of increasing dipole moment among the following molecules is:",
        options: ["CCl4 < NF3 < NH3", "NH3 < NF3 < CCl4", "NF3 < NH3 < CCl4", "CCl4 < NH3 < NF3"],
        correctOptionIndex: 0,
        explanation: "CCl4 is symmetrical (μ = 0). In NF3, the fluorine bond dipoles oppose the lone pair dipole, whereas in NH3, N-H bond dipoles reinforce the lone pair dipole (μ_NH3 > μ_NF3 > μ_CCl4).",
        difficulty: "MEDIUM",
        subject: "Chemistry",
        chapter: "Chemical Bonding",
        topic: "Dipole Moment",
      },
      {
        questionText: "When Phenol is treated with chloroform (CHCl3) in the presence of aqueous NaOH at 340 K, the electrophile involved in the Reimer-Tiemann reaction is:",
        options: ["Dichlorocarbene (:CCl2)", "Trichloromethyl anion (:CCl3-)", "Formyl cation (CHO+)", "Chloromethyl cation (+CH2Cl)"],
        correctOptionIndex: 0,
        explanation: "In the Reimer-Tiemann reaction, basic dehydrohalogenation of chloroform generates the neutral, electron-deficient electrophile Dichlorocarbene (:CCl2).",
        difficulty: "MEDIUM",
        subject: "Chemistry",
        chapter: "Alcohols, Phenols and Ethers",
        topic: "Reimer-Tiemann Reaction",
      },
    ],
  },
  {
    id: "curated-pyq-full-neet-drill",
    title: "NEET All-India PYQ Rapid Marathon",
    description: "Repeated high-probability questions from NEET 2021-2025 across Physics, Chemistry, Botany, and Zoology with authentic NTA marking.",
    subject: "Full Syllabus",
    chapter: "Comprehensive NEET Syllabus",
    difficulty: "MEDIUM",
    tags: ["PYQ 2021-2025", "NTA Pattern", "All India Mock", "Full Syllabus"],
    questions: [
      {
        questionText: "The primary carbon dioxide acceptor in C4 photosynthetic plants is:",
        options: ["Phosphoenolpyruvate (PEP)", "Ribulose-1,5-bisphosphate (RuBP)", "Oxaloacetate (OAA)", "Phosphoglyceric acid (PGA)"],
        correctOptionIndex: 0,
        explanation: "In C4 mesophyll cells, PEP (3-carbon molecule) acts as the primary CO2 acceptor, catalyzed by PEP carboxylase.",
        difficulty: "EASY",
        subject: "Biology",
        chapter: "Photosynthesis in Higher Plants",
        topic: "C4 Pathway",
      },
      {
        questionText: "The de Broglie wavelength associated with an electron accelerated through a potential difference of 100 Volts is approximately:",
        options: ["0.123 nm", "1.227 nm", "12.27 nm", "0.012 nm"],
        correctOptionIndex: 0,
        explanation: "λ = 1.227 / √V nm = 1.227 / √100 = 1.227 / 10 = 0.1227 nm ≈ 0.123 nm.",
        difficulty: "EASY",
        subject: "Physics",
        chapter: "Dual Nature of Radiation and Matter",
        topic: "de Broglie Wavelength",
      },
      {
        questionText: "Which of the following transition metal ions has the highest magnetic moment in spin-only value (μ_s = √[n(n+2)] BM)?",
        options: ["Fe2+ (d6)", "Mn2+ (d5)", "Cr3+ (d3)", "Cu2+ (d9)"],
        correctOptionIndex: 1,
        explanation: "Mn2+ has 5 unpaired d-electrons (n=5). μ_s = √[5(5+2)] = √35 ≈ 5.92 BM, which is the highest among the given ions.",
        difficulty: "EASY",
        subject: "Chemistry",
        chapter: "d and f Block Elements",
        topic: "Magnetic Properties",
      },
      {
        questionText: "In human females, the primary oocytes are arrested at which specific stage of cell division during embryonic development until puberty?",
        options: ["Metaphase I", "Prophase I (Diplotene)", "Anaphase II", "Telophase I"],
        correctOptionIndex: 1,
        explanation: "Primary oocytes enter Prophase I of meiotic division and remain arrested at the Diplotene stage until puberty when follicular development resumes.",
        difficulty: "MEDIUM",
        subject: "Biology",
        chapter: "Human Reproduction",
        topic: "Oogenesis",
      },
    ],
  },
];

/**
 * Ensures curated modules exist in the PostgreSQL database.
 * If not present, inserts them with full question relations.
 */
export async function ensureCuratedModulesInDb() {
  for (const moduleSeed of CURATED_MODULES_SEED) {
    const existing = await prisma.questionBankModule.findUnique({
      where: { id: moduleSeed.id },
      include: { _count: { select: { questions: true } } },
    });

    if (!existing || existing._count.questions === 0) {
      await prisma.questionBankModule.upsert({
        where: { id: moduleSeed.id },
        update: {
          title: moduleSeed.title,
          description: moduleSeed.description,
          subject: moduleSeed.subject,
          chapter: moduleSeed.chapter,
          difficulty: moduleSeed.difficulty,
          isOfficial: true,
          tags: moduleSeed.tags,
        },
        create: {
          id: moduleSeed.id,
          title: moduleSeed.title,
          description: moduleSeed.description,
          subject: moduleSeed.subject,
          chapter: moduleSeed.chapter,
          difficulty: moduleSeed.difficulty,
          isOfficial: true,
          tags: moduleSeed.tags,
          questions: {
            create: moduleSeed.questions.map((q) => ({
              questionText: q.questionText,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              explanation: q.explanation,
              diagramSvg: q.diagramSvg ?? null,
              difficulty: q.difficulty,
              subject: q.subject,
              chapter: q.chapter ?? null,
              topic: q.topic ?? null,
            })),
          },
        },
      });
    }
  }
}

export interface QuestionBankModuleSummary {
  id: string;
  title: string;
  description: string;
  subject: string;
  chapter: string | null;
  difficulty: Difficulty;
  isOfficial: boolean;
  tags: string[];
  questionCount: number;
  creatorName: string;
  createdAt: Date;
}

/**
 * Fetches all curated and community-shared modules with question counts.
 */
export async function getQuestionBankModules(options?: {
  subject?: string;
  search?: string;
  tab?: "ALL" | "CURATED" | "COMMUNITY";
}): Promise<QuestionBankModuleSummary[]> {
  await ensureCuratedModulesInDb();

  const where: Record<string, any> = {};

  if (options?.tab === "CURATED") {
    where.isOfficial = true;
  } else if (options?.tab === "COMMUNITY") {
    where.isOfficial = false;
  }

  if (options?.subject && options.subject !== "ALL") {
    where.subject = options.subject;
  }

  const modules = await prisma.questionBankModule.findMany({
    where,
    include: {
      creatorUser: { select: { name: true } },
      _count: { select: { questions: true } },
    },
    orderBy: [{ isOfficial: "desc" }, { createdAt: "desc" }],
  });

  const query = options?.search?.toLowerCase().trim();

  return modules
    .map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      subject: m.subject,
      chapter: m.chapter,
      difficulty: m.difficulty,
      isOfficial: m.isOfficial,
      tags: Array.isArray(m.tags) ? (m.tags as string[]) : [],
      questionCount: m._count.questions,
      creatorName: m.isOfficial ? "Solvd Academic Team" : (m.creatorUser?.name ?? "NEET Aspirant"),
      createdAt: m.createdAt,
    }))
    .filter((m) => {
      if (!query) return true;
      return (
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.subject.toLowerCase().includes(query) ||
        m.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
}
