const fs = require('fs');
const path = require('path');

const audioDataPath = path.join(__dirname, '../src/features/notes-to-video/demoAudioData.json');
const audioData = JSON.parse(fs.readFileSync(audioDataPath, 'utf8'));

const totalSec = Math.round(audioData.reduce((acc, a) => acc + a.duration, 0) * 10) / 10;

const content = `import type { VideoLesson } from "./types";

// Clean, Minimalist Solvd-Themed Micro-Lecture with Studio Indian Tutor Audio
export const DEMO_LESSON: VideoLesson = {
  id: "demo_krebs_cycle",
  title: "Krebs Cycle & ATP Yield",
  subject: "Biology",
  summary: "5-step pedagogical breakdown of mitochondrial respiration for NEET 2026",
  totalDurationSeconds: ${totalSec},
  createdAt: new Date().toISOString(),
  scenes: [
    {
      sceneNumber: 1,
      title: "Entry of Acetyl-CoA into Matrix",
      narration:
        "Welcome to the Krebs Cycle breakdown. Pyruvate from glycolysis is decarboxylated into two-carbon Acetyl-CoA, which enters the inner mitochondrial matrix.",
      visualType: "cycle_mechanism",
      diagramTitle: "Condensation Step",
      durationSeconds: ${audioData[0].duration},
      audioUrl: ${JSON.stringify(audioData[0].base64)},
      highlightKeyword: "Citrate Synthase",
      formula: "Acetyl-CoA (2C) + Oxaloacetate (4C) → Citrate (6C)",
      mnemonic: "Can I Keep Some Succulent Fruit Overtime?",
      bulletPoints: [
        "Location: Inner Mitochondrial Matrix",
        "Enzyme: Citrate Synthase (Condensation)",
        "Combines 2C Acetyl-CoA + 4C Oxaloacetate to form 6C Citrate"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="450" fill="#0f172a" rx="16"/>
        
        <!-- Subtle Grid & Matrix Boundary -->
        <ellipse cx="400" cy="225" rx="360" ry="190" fill="#0b1329" stroke="#1e293b" stroke-width="2"/>
        <text x="400" y="70" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="12" text-anchor="middle" font-weight="700" letter-spacing="2">MITOCHONDRIAL MATRIX</text>

        <!-- Node 1: Acetyl-CoA (2C) -->
        <g transform="translate(300, 100)">
          <rect width="200" height="56" rx="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <text x="100" y="34" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="700">Acetyl-CoA (2C)</text>
        </g>

        <!-- Node 2: Oxaloacetate (4C) -->
        <g transform="translate(100, 240)">
          <rect width="200" height="56" rx="14" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="100" y="34" fill="#f59e0b" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="700">Oxaloacetate (4C)</text>
        </g>

        <!-- Node 3: Citrate (6C) -->
        <g transform="translate(500, 240)">
          <rect width="200" height="56" rx="14" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="100" y="34" fill="#10b981" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="700">Citrate (6C)</text>
        </g>

        <!-- Connecting Flow Lines -->
        <path d="M400 156 Q470 180 540 240" stroke="#38bdf8" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M260 240 Q330 180 400 156" stroke="#f59e0b" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M540 296 Q400 370 260 296" stroke="#10b981" stroke-width="3" fill="none" stroke-dasharray="6,6"/>

        <!-- Center Catalyst Label -->
        <g transform="translate(400, 245)">
          <rect x="-75" y="-18" width="150" height="36" rx="10" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
          <text x="0" y="4" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="11" text-anchor="middle" font-weight="700">Citrate Synthase</text>
        </g>
      </svg>\`
    },
    {
      sceneNumber: 2,
      title: "Isomerization & First CO2 Loss",
      narration:
        "Citrate is isomerized to isocitrate by aconitase. Then isocitrate dehydrogenase carries out oxidative decarboxylation, releasing the first molecule of carbon dioxide and yielding NADH.",
      visualType: "cycle_mechanism",
      diagramTitle: "1st Decarboxylation",
      durationSeconds: ${audioData[1].duration},
      audioUrl: ${JSON.stringify(audioData[1].base64)},
      highlightKeyword: "Isocitrate Dehydrogenase",
      formula: "Isocitrate (6C) + NAD⁺ → α-Ketoglutarate (5C) + CO₂ + NADH",
      mnemonic: "1st Decarboxylation yields 1 NADH + 1 CO₂",
      bulletPoints: [
        "Aconitase isomerizes Citrate → Isocitrate",
        "Isocitrate Dehydrogenase catalyzes oxidative decarboxylation",
        "Produces 1 NADH (3 ATP equiv) + 1 CO₂ gas released"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="450" fill="#0f172a" rx="16"/>
        
        <!-- Step 1 -->
        <g transform="translate(80, 140)">
          <rect width="180" height="64" rx="14" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="90" y="38" fill="#10b981" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="700">Citrate (6C)</text>
        </g>

        <!-- Step 2 -->
        <g transform="translate(320, 140)">
          <rect width="180" height="64" rx="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <text x="90" y="38" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="700">Isocitrate (6C)</text>
        </g>

        <!-- Step 3 -->
        <g transform="translate(200, 290)">
          <rect width="220" height="64" rx="14" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="110" y="38" fill="#f59e0b" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="700">α-Ketoglutarate (5C)</text>
        </g>

        <!-- Reaction Arrows -->
        <path d="M260 172 L320 172" stroke="#64748b" stroke-width="3" fill="none"/>
        <path d="M410 204 Q410 260 350 290" stroke="#f59e0b" stroke-width="3" fill="none"/>

        <!-- Energy Output Box -->
        <g transform="translate(560, 200)">
          <rect width="160" height="90" rx="16" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
          <text x="80" y="38" fill="#ef4444" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="800">+ 1 NADH</text>
          <text x="80" y="66" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle" font-weight="600">+ 1 CO₂ released</text>
        </g>
      </svg>\`
    },
    {
      sceneNumber: 3,
      title: "Substrate-Level Phosphorylation (GTP)",
      narration:
        "Succinyl-CoA is cleaved by succinyl-CoA synthetase into succinate. This is the only step in the Krebs cycle with direct substrate level phosphorylation, yielding one GTP.",
      visualType: "formula_derivation",
      diagramTitle: "Direct High-Energy Yield",
      durationSeconds: ${audioData[2].duration},
      audioUrl: ${JSON.stringify(audioData[2].base64)},
      highlightKeyword: "Substrate Level Phosphorylation",
      formula: "Succinyl-CoA + GDP + Pi → Succinate + GTP + CoA-SH",
      mnemonic: "Only direct high-energy phosphate step in TCA cycle",
      bulletPoints: [
        "Enzyme: Succinyl-CoA Synthetase",
        "Direct Substrate-Level Phosphorylation generates 1 GTP",
        "GTP readily transfers phosphate to ADP → ATP"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="450" fill="#0f172a" rx="16"/>

        <g transform="translate(80, 180)">
          <rect width="210" height="70" rx="16" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
          <text x="105" y="42" fill="#818cf8" font-family="system-ui, -apple-system, sans-serif" font-size="17" text-anchor="middle" font-weight="700">Succinyl-CoA (4C)</text>
        </g>

        <g transform="translate(510, 180)">
          <rect width="210" height="70" rx="16" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="105" y="42" fill="#10b981" font-family="system-ui, -apple-system, sans-serif" font-size="17" text-anchor="middle" font-weight="700">Succinate (4C)</text>
        </g>

        <path d="M290 215 L510 215" stroke="#10b981" stroke-width="4" fill="none"/>

        <!-- GTP Callout Core -->
        <g transform="translate(400, 215)">
          <circle cx="0" cy="0" r="48" fill="#1e293b" stroke="#f59e0b" stroke-width="2.5"/>
          <text x="0" y="2" fill="#f59e0b" font-family="system-ui, -apple-system, sans-serif" font-size="15" text-anchor="middle" font-weight="800">+ 1 GTP</text>
          <text x="0" y="20" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="11" text-anchor="middle" font-weight="600">(= 1 ATP)</text>
        </g>
      </svg>\`
    },
    {
      sceneNumber: 4,
      title: "FADH2 Generation & Complex II",
      narration:
        "Succinate dehydrogenase oxidizes succinate into fumarate. Remember for NEET: this enzyme is attached to the inner mitochondrial membrane, directly acting as Complex Two of the ETS.",
      visualType: "diagram",
      diagramTitle: "Membrane-Bound Enzyme",
      durationSeconds: ${audioData[3].duration},
      audioUrl: ${JSON.stringify(audioData[3].base64)},
      highlightKeyword: "Complex II (Succinate Dehydrogenase)",
      formula: "Succinate + FAD → Fumarate + FADH₂",
      mnemonic: "Only membrane-bound enzyme of Krebs Cycle",
      bulletPoints: [
        "Only enzyme located on Inner Mitochondrial Membrane",
        "Directly participates as Complex II in ETS",
        "FADH₂ yields 2 ATP equivalents in oxidative phosphorylation"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="450" fill="#0f172a" rx="16"/>

        <!-- Membrane Bar -->
        <rect x="60" y="140" width="680" height="60" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
        <text x="400" y="175" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="12" text-anchor="middle" font-weight="700" letter-spacing="2">INNER MITOCHONDRIAL MEMBRANE</text>

        <!-- Complex II Embedded -->
        <g transform="translate(280, 110)">
          <rect width="240" height="110" rx="18" fill="#064e3b" stroke="#10b981" stroke-width="2.5"/>
          <text x="120" y="48" fill="#6ee7b7" font-family="system-ui, -apple-system, sans-serif" font-size="18" text-anchor="middle" font-weight="800">Complex II</text>
          <text x="120" y="74" fill="#a7f3d0" font-family="system-ui, -apple-system, sans-serif" font-size="12" text-anchor="middle" font-weight="600">(Succinate Dehydrogenase)</text>
        </g>

        <!-- Reaction Arc -->
        <path d="M260 280 Q400 340 540 280" stroke="#f59e0b" stroke-width="3" fill="none"/>
        <text x="260" y="270" fill="#fde047" font-family="system-ui, -apple-system, sans-serif" font-size="14" text-anchor="middle" font-weight="700">FAD</text>
        <text x="540" y="270" fill="#f59e0b" font-family="system-ui, -apple-system, sans-serif" font-size="15" text-anchor="middle" font-weight="700">FADH₂ (+2 ATP)</text>
      </svg>\`
    },
    {
      sceneNumber: 5,
      title: "Total NEET Energy Ledger per Glucose",
      narration:
        "Let's calculate the total energy per glucose molecule. Two turns of the Krebs cycle yield 6 NADH, 2 FADH2, and 2 GTP, totaling 24 ATP through oxidative phosphorylation.",
      visualType: "key_summary",
      diagramTitle: "Total Energy Ledger",
      durationSeconds: ${audioData[4].duration},
      audioUrl: ${JSON.stringify(audioData[4].base64)},
      highlightKeyword: "24 ATP per Glucose",
      formula: "2 Turns = 6 NADH (18 ATP) + 2 FADH₂ (4 ATP) + 2 GTP (2 ATP) = 24 ATP",
      mnemonic: "1 NADH = 3 ATP, 1 FADH₂ = 2 ATP in classic NEET syllabus",
      bulletPoints: [
        "6 NADH × 3 = 18 ATP",
        "2 FADH₂ × 2 = 4 ATP",
        "2 GTP (Substrate level) = 2 ATP",
        "Total = 24 ATP from Krebs Cycle"
      ],
      svgMarkup: \`<svg viewBox="0 0 800 450" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="450" fill="#0f172a" rx="16"/>

        <!-- 3 Clean Summary Cards -->
        <g transform="translate(60, 90)">
          <rect width="200" height="150" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <text x="100" y="60" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="28" text-anchor="middle" font-weight="800">6 NADH</text>
          <text x="100" y="105" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="600">= 18 ATP</text>
        </g>

        <g transform="translate(300, 90)">
          <rect width="200" height="150" rx="16" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="100" y="60" fill="#f59e0b" font-family="system-ui, -apple-system, sans-serif" font-size="28" text-anchor="middle" font-weight="800">2 FADH₂</text>
          <text x="100" y="105" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="600">= 4 ATP</text>
        </g>

        <g transform="translate(540, 90)">
          <rect width="200" height="150" rx="16" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="100" y="60" fill="#10b981" font-family="system-ui, -apple-system, sans-serif" font-size="28" text-anchor="middle" font-weight="800">2 GTP</text>
          <text x="100" y="105" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle" font-weight="600">= 2 ATP</text>
        </g>

        <!-- Grand Total Banner -->
        <g transform="translate(60, 275)">
          <rect width="680" height="95" rx="18" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
          <text x="340" y="44" fill="#a7f3d0" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle" font-weight="700" letter-spacing="1">TOTAL ENERGY PER GLUCOSE</text>
          <text x="340" y="78" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="26" text-anchor="middle" font-weight="900">24 ATP (From Krebs Cycle)</text>
        </g>
      </svg>\`
    }
  ]
};
`;

const targetPath = path.join(__dirname, '../src/features/notes-to-video/demoLesson.ts');
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully wrote clean demoLesson.ts!');
