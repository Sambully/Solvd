const fs = require('fs');
const path = require('path');

const audioDataPath = path.join(__dirname, '../src/features/notes-to-video/demoAudioData.json');
const audioData = JSON.parse(fs.readFileSync(audioDataPath, 'utf8'));

const totalSec = Math.round(audioData.reduce((acc, a) => acc + a.duration, 0) * 10) / 10;

const content = `import type { VideoLesson } from "./types";

export const DEMO_LESSON: VideoLesson = {
  id: "demo_krebs_cycle",
  title: "Krebs Cycle (Citric Acid Cycle) & ATP Yield",
  subject: "Biology",
  summary: "Complete 5-stage breakdown of mitochondrial oxidation & energy ledger for NEET 2026",
  totalDurationSeconds: ${totalSec},
  createdAt: new Date().toISOString(),
  scenes: [
    {
      sceneNumber: 1,
      title: "Entry of Acetyl-CoA into Mitochondrial Matrix",
      narration:
        "Welcome to the Krebs Cycle breakdown. Pyruvate from glycolysis is decarboxylated into two-carbon Acetyl-CoA, which enters the inner mitochondrial matrix.",
      visualType: "cycle_mechanism",
      diagramTitle: "Mitochondrial Matrix & Condensation",
      durationSeconds: ${audioData[0].duration},
      audioUrl: ${JSON.stringify(audioData[0].base64)},
      highlightKeyword: "Citrate Synthase",
      formula: "Acetyl-CoA (2C) + OAA (4C) → Citrate (6C)",
      mnemonic: "Can I Keep Some Succulent Fruit Overtime?",
      bulletPoints: [
        "Occurs in Mitochondrial Matrix",
        "Citrate Synthase enzyme catalyzes 2C + 4C condensation",
        "Water molecule is utilized (Hydrolysis step)"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mitoglow1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#064e3b" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#022c22" stop-opacity="0.95"/>
          </linearGradient>
          <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <rect width="800" height="450" fill="#060913" rx="16"/>
        <ellipse cx="400" cy="225" rx="350" ry="190" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-dasharray="8,8"/>
        <ellipse cx="400" cy="225" rx="290" ry="150" fill="url(#mitoglow1)" stroke="#10b981" stroke-width="3" filter="url(#glow1)"/>
        
        <text x="400" y="115" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle" font-weight="800" letter-spacing="2">INNER MITOCHONDRIAL MATRIX</text>

        <!-- Node 1: Acetyl-CoA -->
        <g transform="translate(290, 130)">
          <rect width="220" height="54" rx="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" filter="url(#glow1)"/>
          <text x="110" y="34" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">Acetyl-CoA (2C)</text>
        </g>

        <!-- Node 2: Oxaloacetate -->
        <g transform="translate(130, 250)">
          <rect width="210" height="54" rx="16" fill="#0f172a" stroke="#f59e0b" stroke-width="2.5" filter="url(#glow1)"/>
          <text x="105" y="34" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="15" text-anchor="middle" font-weight="bold">Oxaloacetate (4C)</text>
        </g>

        <!-- Node 3: Citrate -->
        <g transform="translate(460, 250)">
          <rect width="210" height="54" rx="16" fill="#0f172a" stroke="#10b981" stroke-width="2.5" filter="url(#glow1)"/>
          <text x="105" y="34" fill="#10b981" font-family="system-ui, sans-serif" font-size="15" text-anchor="middle" font-weight="bold">Citrate (6C)</text>
        </g>

        <!-- Flow Paths with Arrows -->
        <path d="M400 185 Q490 200 550 250" stroke="#38bdf8" stroke-width="3.5" fill="none" stroke-dasharray="6,6"/>
        <path d="M235 250 Q280 200 370 185" stroke="#f59e0b" stroke-width="3.5" fill="none" stroke-dasharray="6,6"/>
        <path d="M565 305 Q400 375 235 305" stroke="#10b981" stroke-width="3.5" fill="none" stroke-dasharray="6,6"/>

        <!-- Enzyme Center Badge -->
        <circle cx="400" cy="245" r="36" fill="#1e293b" stroke="#e2e8f0" stroke-width="2"/>
        <text x="400" y="242" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle" font-weight="900">CITRATE</text>
        <text x="400" y="256" fill="#34d399" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle" font-weight="900">SYNTHASE</text>
      </svg>\`
    },
    {
      sceneNumber: 2,
      title: "Isomerization to Isocitrate & First CO2 Decarboxylation",
      narration:
        "Citrate is isomerized to isocitrate by aconitase. Then isocitrate dehydrogenase carries out oxidative decarboxylation, releasing the first molecule of carbon dioxide and yielding NADH.",
      visualType: "cycle_mechanism",
      diagramTitle: "Oxidative Decarboxylation (Step 1)",
      durationSeconds: ${audioData[1].duration},
      audioUrl: ${JSON.stringify(audioData[1].base64)},
      highlightKeyword: "Isocitrate Dehydrogenase",
      formula: "Isocitrate (6C) + NAD⁺ → α-Ketoglutarate (5C) + CO₂ + NADH",
      mnemonic: "1st Decarboxylation gives 1 NADH + 1 CO₂",
      bulletPoints: [
        "Aconitase converts Citrate → Isocitrate",
        "Isocitrate Dehydrogenase is the rate-limiting enzyme",
        "Generates 1 NADH (equivalent to 3 ATP)"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <rect width="800" height="450" fill="#060913" rx="16"/>

        <g transform="translate(80, 150)">
          <rect width="200" height="60" rx="16" fill="#0f172a" stroke="#10b981" stroke-width="2.5" filter="url(#glow2)"/>
          <text x="100" y="36" fill="#10b981" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">Citrate (6C)</text>
        </g>

        <g transform="translate(350, 150)">
          <rect width="200" height="60" rx="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" filter="url(#glow2)"/>
          <text x="100" y="36" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">Isocitrate (6C)</text>
        </g>

        <g transform="translate(215, 290)">
          <rect width="240" height="60" rx="16" fill="#0f172a" stroke="#f59e0b" stroke-width="2.5" filter="url(#glow2)"/>
          <text x="120" y="36" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">α-Ketoglutarate (5C)</text>
        </g>

        <path d="M280 180 L350 180" stroke="#64748b" stroke-width="3.5" fill="none"/>
        <path d="M450 210 Q450 260 380 290" stroke="#f59e0b" stroke-width="3.5" fill="none" stroke-dasharray="6,6"/>

        <g transform="translate(600, 190)">
          <circle cx="50" cy="50" r="48" fill="#ef4444" fill-opacity="0.15" stroke="#ef4444" stroke-width="2" filter="url(#glow2)"/>
          <text x="50" y="42" fill="#f87171" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="900">+NADH</text>
          <text x="50" y="66" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle" font-weight="bold">+CO₂ ↑</text>
        </g>
      </svg>\`
    },
    {
      sceneNumber: 3,
      title: "Substrate-Level Phosphorylation (GTP Generation)",
      narration:
        "Succinyl-CoA is cleaved by succinyl-CoA synthetase into succinate. This is the only step in the Krebs cycle with direct substrate level phosphorylation, yielding one GTP.",
      visualType: "formula_derivation",
      diagramTitle: "Substrate Level Phosphorylation",
      durationSeconds: ${audioData[2].duration},
      audioUrl: ${JSON.stringify(audioData[2].base64)},
      highlightKeyword: "Substrate Level Phosphorylation",
      formula: "Succinyl-CoA + GDP + Pi → Succinate + GTP + CoA-SH",
      mnemonic: "Only direct high-energy phosphate in Krebs cycle",
      bulletPoints: [
        "Enzyme: Succinyl-CoA Synthetase",
        "Direct Substrate-Level Phosphorylation creates 1 GTP",
        "GTP readily transfers phosphate to ADP → ATP"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow3" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <rect width="800" height="450" fill="#060913" rx="16"/>

        <g transform="translate(90, 180)">
          <rect width="220" height="64" rx="16" fill="#0f172a" stroke="#818cf8" stroke-width="2.5" filter="url(#glow3)"/>
          <text x="110" y="38" fill="#818cf8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">Succinyl-CoA (4C)</text>
        </g>

        <g transform="translate(490, 180)">
          <rect width="220" height="64" rx="16" fill="#0f172a" stroke="#10b981" stroke-width="2.5" filter="url(#glow3)"/>
          <text x="110" y="38" fill="#10b981" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">Succinate (4C)</text>
        </g>

        <path d="M310 212 L490 212" stroke="#10b981" stroke-width="4" fill="none"/>

        <g transform="translate(400, 212)">
          <circle cx="0" cy="0" r="50" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="2.5" filter="url(#glow3)"/>
          <polygon points="0,-32 10,-10 32,-10 14,4 20,26 0,12 -20,26 -14,4 -32,-10 -10,-10" fill="#f59e0b"/>
          <text x="0" y="42" fill="#fef08a" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle" font-weight="900">1 GTP (ATP)</text>
        </g>
      </svg>\`
    },
    {
      sceneNumber: 4,
      title: "FADH2 Generation & Succinate Dehydrogenase",
      narration:
        "Succinate dehydrogenase oxidizes succinate into fumarate. Remember for NEET: this enzyme is attached to the inner mitochondrial membrane, directly acting as Complex Two of the ETS.",
      visualType: "diagram",
      diagramTitle: "Membrane-Bound Complex II Step",
      durationSeconds: ${audioData[3].duration},
      audioUrl: ${JSON.stringify(audioData[3].base64)},
      highlightKeyword: "Complex II (Succinate Dehydrogenase)",
      formula: "Succinate + FAD → Fumarate + FADH₂",
      mnemonic: "Succinate Dehydrogenase is the ONLY membrane-bound enzyme in TCA cycle",
      bulletPoints: [
        "Only enzyme located on Inner Mitochondrial Membrane",
        "Directly participates as Complex II in ETS",
        "FADH₂ yields 2 ATP equivalents in oxidative phosphorylation"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow4" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <rect width="800" height="450" fill="#060913" rx="16"/>

        <rect x="60" y="130" width="680" height="60" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <text x="400" y="165" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle" font-weight="800" letter-spacing="2">INNER MITOCHONDRIAL MEMBRANE</text>

        <g transform="translate(280, 100)">
          <rect width="240" height="110" rx="20" fill="#064e3b" stroke="#10b981" stroke-width="3" filter="url(#glow4)"/>
          <text x="120" y="48" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" font-weight="900">Complex II</text>
          <text x="120" y="78" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="bold">(Succinate Dehydrogenase)</text>
        </g>

        <path d="M260 270 Q400 330 540 270" stroke="#f59e0b" stroke-width="4" fill="none" stroke-dasharray="6,6"/>
        <text x="260" y="260" fill="#fde047" font-family="system-ui, sans-serif" font-size="15" text-anchor="middle" font-weight="bold">FAD</text>
        <text x="540" y="260" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">FADH₂ (+2 ATP)</text>
      </svg>\`
    },
    {
      sceneNumber: 5,
      title: "Total NEET Energy Ledger per Glucose Molecule",
      narration:
        "Let's calculate the total energy per glucose molecule. Two turns of the Krebs cycle yield 6 NADH, 2 FADH2, and 2 GTP, totaling 24 ATP through oxidative phosphorylation.",
      visualType: "key_summary",
      diagramTitle: "Total ATP Yield per Glucose",
      durationSeconds: ${audioData[4].duration},
      audioUrl: ${JSON.stringify(audioData[4].base64)},
      highlightKeyword: "24 ATP per Glucose",
      formula: "2 Turns of Krebs Cycle = 6 NADH (18 ATP) + 2 FADH₂ (4 ATP) + 2 GTP (2 ATP) = 24 ATP",
      mnemonic: "1 NADH = 3 ATP, 1 FADH₂ = 2 ATP in classic NEET NTA syllabus",
      bulletPoints: [
        "6 NADH × 3 = 18 ATP",
        "2 FADH₂ × 2 = 4 ATP",
        "2 GTP (Substrate level) = 2 ATP",
        "Grand Total = 24 ATP from Krebs Cycle"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow5" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <rect width="800" height="450" fill="#060913" rx="16"/>

        <!-- Card 1: 6 NADH -->
        <g transform="translate(80, 80)">
          <rect width="180" height="150" rx="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" filter="url(#glow5)"/>
          <text x="90" y="58" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="26" text-anchor="middle" font-weight="900">6 NADH</text>
          <text x="90" y="100" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">= 18 ATP</text>
          <rect x="30" y="118" width="120" height="20" rx="6" fill="#0284c7" fill-opacity="0.3"/>
          <text x="90" y="132" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle" font-weight="bold">3 ATP each</text>
        </g>

        <!-- Card 2: 2 FADH2 -->
        <g transform="translate(310, 80)">
          <rect width="180" height="150" rx="20" fill="#0f172a" stroke="#f59e0b" stroke-width="2.5" filter="url(#glow5)"/>
          <text x="90" y="58" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="24" text-anchor="middle" font-weight="900">2 FADH₂</text>
          <text x="90" y="100" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">= 4 ATP</text>
          <rect x="30" y="118" width="120" height="20" rx="6" fill="#d97706" fill-opacity="0.3"/>
          <text x="90" y="132" fill="#fef3c7" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle" font-weight="bold">2 ATP each</text>
        </g>

        <!-- Card 3: 2 GTP -->
        <g transform="translate(540, 80)">
          <rect width="180" height="150" rx="20" fill="#0f172a" stroke="#10b981" stroke-width="2.5" filter="url(#glow5)"/>
          <text x="90" y="58" fill="#10b981" font-family="system-ui, sans-serif" font-size="26" text-anchor="middle" font-weight="900">2 GTP</text>
          <text x="90" y="100" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">= 2 ATP</text>
          <rect x="30" y="118" width="120" height="20" rx="6" fill="#059669" fill-opacity="0.3"/>
          <text x="90" y="132" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle" font-weight="bold">Direct SLP</text>
        </g>

        <!-- Grand Total Banner (Properly spaced so it never cuts off) -->
        <g transform="translate(80, 270)">
          <rect width="640" height="95" rx="22" fill="#064e3b" stroke="#34d399" stroke-width="3" filter="url(#glow5)"/>
          <text x="320" y="46" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle" font-weight="bold" letter-spacing="1">KREBS CYCLE ENERGY LEDGER</text>
          <text x="320" y="80" fill="#ffffff" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle" font-weight="900">TOTAL = 24 ATP PER GLUCOSE</text>
        </g>
      </svg>\`
    }
  ]
};
`;

const targetPath = path.join(__dirname, '../src/features/notes-to-video/demoLesson.ts');
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully wrote demoLesson.ts!');
