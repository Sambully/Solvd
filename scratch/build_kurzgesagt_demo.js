const fs = require('fs');
const path = require('path');

const audioDataPath = path.join(__dirname, '../src/features/notes-to-video/demoAudioData.json');
const audioData = JSON.parse(fs.readFileSync(audioDataPath, 'utf8'));

const totalSec = Math.round(audioData.reduce((acc, a) => acc + a.duration, 0) * 10) / 10;

const content = `import type { VideoLesson } from "./types";

// Kurzgesagt-Style Animated NEET Micro-Lecture with Studio Edge-TTS Narration
export const DEMO_LESSON: VideoLesson = {
  id: "demo_krebs_cycle",
  title: "Krebs Cycle & Total 24 ATP Energy Ledger",
  subject: "Biology",
  summary: "Cinematic step-by-step molecular mechanism of mitochondrial oxidation for NEET 2026",
  totalDurationSeconds: ${totalSec},
  createdAt: new Date().toISOString(),
  scenes: [
    {
      sceneNumber: 1,
      title: "Entry of Acetyl-CoA into Mitochondrial Matrix",
      narration:
        "Welcome to the Krebs Cycle breakdown. Pyruvate from glycolysis is decarboxylated into two-carbon Acetyl-CoA, which enters the inner mitochondrial matrix.",
      visualType: "cycle_mechanism",
      diagramTitle: "Mitochondrial Condensation Chamber",
      durationSeconds: ${audioData[0].duration},
      audioUrl: ${JSON.stringify(audioData[0].base64)},
      highlightKeyword: "Citrate Synthase",
      formula: "Acetyl-CoA (2C) + Oxaloacetate (4C) + H₂O → Citrate (6C) + CoA-SH",
      mnemonic: "Can I Keep Some Succulent Fruit Overtime?",
      bulletPoints: [
        "Occurs in the Inner Mitochondrial Matrix",
        "Catalyzed by Citrate Synthase (Condensation step)",
        "Combines 2-Carbon and 4-Carbon intermediates into Citrate (6C)"
      ],
      svgMarkup: \`<svg viewBox="0 0 960 540" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bgGlow1" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#0a1d37"/>
            <stop offset="60%" stop-color="#060b18"/>
            <stop offset="100%" stop-color="#03060f"/>
          </radialGradient>
          <linearGradient id="mitoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#064e3b" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#022c22" stop-opacity="0.95"/>
          </linearGradient>
          <filter id="neon1" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <!-- Full-Bleed Cinema Canvas Background -->
        <rect width="960" height="540" fill="url(#bgGlow1)"/>

        <!-- Ambient Particle Grid -->
        <circle cx="480" cy="270" r="380" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="8,12" opacity="0.4"/>
        <circle cx="480" cy="270" r="260" fill="none" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4,8" opacity="0.3"/>

        <!-- Mitochondria Matrix Oval -->
        <ellipse cx="480" cy="270" rx="410" ry="215" fill="none" stroke="#334155" stroke-width="3" stroke-dasharray="10,10"/>
        <ellipse cx="480" cy="270" rx="340" ry="170" fill="url(#mitoGrad)" stroke="#10b981" stroke-width="3.5" filter="url(#neon1)"/>
        
        <text x="480" y="135" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle" font-weight="900" letter-spacing="3">INNER MITOCHONDRIAL MATRIX</text>

        <!-- Kinetic Orbit Energy Paths -->
        <path d="M480 200 C580 200 660 250 660 290 C660 350 480 380 300 290 C300 240 380 200 480 200" stroke="#38bdf8" stroke-width="3" fill="none" stroke-dasharray="8,8" opacity="0.7"/>

        <!-- Acetyl-CoA Molecule (2C) -->
        <g transform="translate(370, 165)" filter="url(#neon1)">
          <rect width="220" height="60" rx="18" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
          <circle cx="35" cy="30" r="16" fill="#0284c7"/>
          <text x="35" y="35" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="900">2C</text>
          <text x="125" y="36" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="17" text-anchor="middle" font-weight="bold">Acetyl-CoA</text>
        </g>

        <!-- Oxaloacetate Molecule (4C) -->
        <g transform="translate(140, 290)" filter="url(#neon1)">
          <rect width="220" height="60" rx="18" fill="#0f172a" stroke="#f59e0b" stroke-width="3"/>
          <circle cx="35" cy="30" r="16" fill="#d97706"/>
          <text x="35" y="35" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="900">4C</text>
          <text x="125" y="36" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold">Oxaloacetate</text>
        </g>

        <!-- Citrate Molecule (6C) -->
        <g transform="translate(600, 290)" filter="url(#neon1)">
          <rect width="220" height="60" rx="18" fill="#0f172a" stroke="#10b981" stroke-width="3"/>
          <circle cx="35" cy="30" r="16" fill="#059669"/>
          <text x="35" y="35" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="900">6C</text>
          <text x="125" y="36" fill="#10b981" font-family="system-ui, sans-serif" font-size="17" text-anchor="middle" font-weight="bold">Citrate</text>
        </g>

        <!-- Active Site Enzyme Center Core -->
        <g transform="translate(480, 305)">
          <circle cx="0" cy="0" r="44" fill="#0f172a" stroke="#ffffff" stroke-width="3" filter="url(#neon1)"/>
          <circle cx="0" cy="0" r="36" fill="#1e293b"/>
          <text x="0" y="-4" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle" font-weight="900" letter-spacing="1">CITRATE</text>
          <text x="0" y="12" fill="#34d399" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle" font-weight="900" letter-spacing="1">SYNTHASE</text>
        </g>

        <!-- Dynamic Energy Beads flowing -->
        <circle cx="560" cy="225" r="5" fill="#38bdf8" filter="url(#neon1)"/>
        <circle cx="340" cy="245" r="5" fill="#f59e0b" filter="url(#neon1)"/>
        <circle cx="480" cy="380" r="5" fill="#10b981" filter="url(#neon1)"/>
      </svg>\`
    },
    {
      sceneNumber: 2,
      title: "Isomerization to Isocitrate & First CO2 Decarboxylation",
      narration:
        "Citrate is isomerized to isocitrate by aconitase. Then isocitrate dehydrogenase carries out oxidative decarboxylation, releasing the first molecule of carbon dioxide and yielding NADH.",
      visualType: "cycle_mechanism",
      diagramTitle: "1st Oxidative Decarboxylation Step",
      durationSeconds: ${audioData[1].duration},
      audioUrl: ${JSON.stringify(audioData[1].base64)},
      highlightKeyword: "Isocitrate Dehydrogenase",
      formula: "Isocitrate (6C) + NAD⁺ → α-Ketoglutarate (5C) + CO₂↑ + NADH + H⁺",
      mnemonic: "First CO₂ release reduces 6C to 5C and yields 1 NADH (= 3 ATP)",
      bulletPoints: [
        "Aconitase converts Citrate (6C) → Isocitrate (6C)",
        "Isocitrate Dehydrogenase is the rate-limiting enzyme",
        "Generates 1 NADH (equivalent to 3 ATP) with 1st CO₂ release"
      ],
      svgMarkup: \`<svg viewBox="0 0 960 540" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bgGlow2" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#111827"/>
            <stop offset="60%" stop-color="#070b16"/>
            <stop offset="100%" stop-color="#03060f"/>
          </radialGradient>
          <filter id="neon2" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <rect width="960" height="540" fill="url(#bgGlow2)"/>

        <!-- Step Flow Containers -->
        <g transform="translate(100, 160)" filter="url(#neon2)">
          <rect width="220" height="70" rx="18" fill="#0f172a" stroke="#10b981" stroke-width="3"/>
          <text x="110" y="42" fill="#10b981" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" font-weight="900">Citrate (6C)</text>
        </g>

        <g transform="translate(420, 160)" filter="url(#neon2)">
          <rect width="220" height="70" rx="18" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
          <text x="110" y="42" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" font-weight="900">Isocitrate (6C)</text>
        </g>

        <g transform="translate(260, 320)" filter="url(#neon2)">
          <rect width="260" height="70" rx="18" fill="#0f172a" stroke="#f59e0b" stroke-width="3"/>
          <text x="130" y="42" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" font-weight="900">α-Ketoglutarate (5C)</text>
        </g>

        <!-- Kinetic Reaction Flow Lines -->
        <path d="M320 195 L420 195" stroke="#64748b" stroke-width="4" fill="none"/>
        <path d="M530 230 Q530 300 450 320" stroke="#f59e0b" stroke-width="4" fill="none" stroke-dasharray="8,8"/>

        <!-- Energy Flash Badge: +NADH & +CO2 -->
        <g transform="translate(730, 240)" filter="url(#neon2)">
          <circle cx="60" cy="60" r="56" fill="#ef4444" fill-opacity="0.15" stroke="#ef4444" stroke-width="3"/>
          <text x="60" y="50" fill="#f87171" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" font-weight="900">+NADH</text>
          <text x="60" y="78" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle" font-weight="bold">+CO₂ ↑</text>
        </g>
      </svg>\`
    },
    {
      sceneNumber: 3,
      title: "Substrate-Level Phosphorylation (GTP Generation)",
      narration:
        "Succinyl-CoA is cleaved by succinyl-CoA synthetase into succinate. This is the only step in the Krebs cycle with direct substrate level phosphorylation, yielding one GTP.",
      visualType: "formula_derivation",
      diagramTitle: "Direct High-Energy Phosphate Generation",
      durationSeconds: ${audioData[2].duration},
      audioUrl: ${JSON.stringify(audioData[2].base64)},
      highlightKeyword: "Substrate Level Phosphorylation",
      formula: "Succinyl-CoA + GDP + Pi → Succinate + GTP + CoA-SH",
      mnemonic: "The ONLY substrate-level phosphorylation step in TCA cycle",
      bulletPoints: [
        "Enzyme: Succinyl-CoA Synthetase (Succinate Thiokinase)",
        "Direct substrate-level phosphorylation generates 1 GTP",
        "GTP readily phosphorylates ADP into ATP"
      ],
      svgMarkup: \`<svg viewBox="0 0 960 540" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bgGlow3" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#14112e"/>
            <stop offset="60%" stop-color="#080718"/>
            <stop offset="100%" stop-color="#03020a"/>
          </radialGradient>
          <filter id="neon3" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <rect width="960" height="540" fill="url(#bgGlow3)"/>

        <!-- Left Reactant -->
        <g transform="translate(100, 200)" filter="url(#neon3)">
          <rect width="250" height="75" rx="20" fill="#0f172a" stroke="#818cf8" stroke-width="3"/>
          <text x="125" y="45" fill="#818cf8" font-family="system-ui, sans-serif" font-size="19" text-anchor="middle" font-weight="900">Succinyl-CoA (4C)</text>
        </g>

        <!-- Right Product -->
        <g transform="translate(610, 200)" filter="url(#neon3)">
          <rect width="250" height="75" rx="20" fill="#0f172a" stroke="#10b981" stroke-width="3"/>
          <text x="125" y="45" fill="#10b981" font-family="system-ui, sans-serif" font-size="19" text-anchor="middle" font-weight="900">Succinate (4C)</text>
        </g>

        <!-- Reaction Vector Beam -->
        <path d="M350 237 L610 237" stroke="#10b981" stroke-width="5" fill="none"/>

        <!-- Energy Core Burst Star -->
        <g transform="translate(480, 237)" filter="url(#neon3)">
          <circle cx="0" cy="0" r="62" fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-width="3"/>
          <polygon points="0,-38 12,-12 38,-12 18,6 25,32 0,16 -25,32 -18,6 -38,-12 -12,-12" fill="#f59e0b"/>
          <text x="0" y="52" fill="#fef08a" font-family="system-ui, sans-serif" font-size="15" text-anchor="middle" font-weight="900">1 GTP (ATP)</text>
        </g>
      </svg>\`
    },
    {
      sceneNumber: 4,
      title: "FADH2 Generation & Succinate Dehydrogenase",
      narration:
        "Succinate dehydrogenase oxidizes succinate into fumarate. Remember for NEET: this enzyme is attached to the inner mitochondrial membrane, directly acting as Complex Two of the ETS.",
      visualType: "diagram",
      diagramTitle: "Membrane-Bound Complex II Oxidation",
      durationSeconds: ${audioData[3].duration},
      audioUrl: ${JSON.stringify(audioData[3].base64)},
      highlightKeyword: "Complex II (Succinate Dehydrogenase)",
      formula: "Succinate + FAD → Fumarate + FADH₂ (yields 2 ATP equivalents)",
      mnemonic: "Succinate Dehydrogenase is the ONLY membrane-bound enzyme of the Krebs cycle",
      bulletPoints: [
        "Only enzyme embedded directly in the Inner Mitochondrial Membrane",
        "Serves as Complex II of the Electron Transport System",
        "FADH₂ yields 2 ATP equivalents in oxidative phosphorylation"
      ],
      svgMarkup: \`<svg viewBox="0 0 960 540" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bgGlow4" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#062e24"/>
            <stop offset="60%" stop-color="#051410"/>
            <stop offset="100%" stop-color="#020806"/>
          </radialGradient>
          <filter id="neon4" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <rect width="960" height="540" fill="url(#bgGlow4)"/>

        <!-- Lipid Bilayer Membrane -->
        <rect x="60" y="150" width="840" height="70" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2.5"/>
        <text x="480" y="192" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle" font-weight="900" letter-spacing="3">INNER MITOCHONDRIAL MEMBRANE</text>

        <!-- Embedded Complex II Protein -->
        <g transform="translate(340, 115)" filter="url(#neon4)">
          <rect width="280" height="135" rx="24" fill="#064e3b" stroke="#10b981" stroke-width="3.5"/>
          <text x="140" y="55" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="22" text-anchor="middle" font-weight="900">Complex II</text>
          <text x="140" y="90" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle" font-weight="bold">(Succinate Dehydrogenase)</text>
        </g>

        <!-- FAD to FADH2 Curve -->
        <path d="M300 330 Q480 400 660 330" stroke="#f59e0b" stroke-width="4.5" fill="none" stroke-dasharray="8,8"/>
        <text x="300" y="320" fill="#fde047" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" font-weight="900">FAD</text>
        <text x="660" y="320" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="19" text-anchor="middle" font-weight="900">FADH₂ (+2 ATP)</text>
      </svg>\`
    },
    {
      sceneNumber: 5,
      title: "Total NEET Energy Ledger per Glucose Molecule",
      narration:
        "Let's calculate the total energy per glucose molecule. Two turns of the Krebs cycle yield 6 NADH, 2 FADH2, and 2 GTP, totaling 24 ATP through oxidative phosphorylation.",
      visualType: "key_summary",
      diagramTitle: "Total ATP Ledger (2 Turns per Glucose)",
      durationSeconds: ${audioData[4].duration},
      audioUrl: ${JSON.stringify(audioData[4].base64)},
      highlightKeyword: "24 ATP per Glucose",
      formula: "2 Turns of Krebs Cycle = 6 NADH (18 ATP) + 2 FADH₂ (4 ATP) + 2 GTP (2 ATP) = 24 ATP",
      mnemonic: "1 NADH = 3 ATP, 1 FADH₂ = 2 ATP in classic NEET NTA syllabus",
      bulletPoints: [
        "6 NADH × 3 = 18 ATP",
        "2 FADH₂ × 2 = 4 ATP",
        "2 GTP (Substrate level) = 2 ATP",
        "Total Energy Yield = 24 ATP from Krebs Cycle alone"
      ],
      svgMarkup: \`<svg viewBox="0 0 960 540" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bgGlow5" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#0a2a1e"/>
            <stop offset="60%" stop-color="#05140e"/>
            <stop offset="100%" stop-color="#020806"/>
          </radialGradient>
          <filter id="neon5" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <rect width="960" height="540" fill="url(#bgGlow5)"/>

        <!-- Reactor Core 1: 6 NADH -->
        <g transform="translate(80, 90)" filter="url(#neon5)">
          <rect width="230" height="180" rx="24" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
          <text x="115" y="68" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="32" text-anchor="middle" font-weight="900">6 NADH</text>
          <text x="115" y="115" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" font-weight="bold">= 18 ATP</text>
          <rect x="40" y="132" width="150" height="26" rx="8" fill="#0284c7" fill-opacity="0.3"/>
          <text x="115" y="150" fill="#bae6fd" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="bold">3 ATP each (ETS)</text>
        </g>

        <!-- Reactor Core 2: 2 FADH2 -->
        <g transform="translate(365, 90)" filter="url(#neon5)">
          <rect width="230" height="180" rx="24" fill="#0f172a" stroke="#f59e0b" stroke-width="3"/>
          <text x="115" y="68" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="30" text-anchor="middle" font-weight="900">2 FADH₂</text>
          <text x="115" y="115" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" font-weight="bold">= 4 ATP</text>
          <rect x="40" y="132" width="150" height="26" rx="8" fill="#d97706" fill-opacity="0.3"/>
          <text x="115" y="150" fill="#fef3c7" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="bold">2 ATP each (ETS)</text>
        </g>

        <!-- Reactor Core 3: 2 GTP -->
        <g transform="translate(650, 90)" filter="url(#neon5)">
          <rect width="230" height="180" rx="24" fill="#0f172a" stroke="#10b981" stroke-width="3"/>
          <text x="115" y="68" fill="#10b981" font-family="system-ui, sans-serif" font-size="32" text-anchor="middle" font-weight="900">2 GTP</text>
          <text x="115" y="115" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" font-weight="bold">= 2 ATP</text>
          <rect x="40" y="132" width="150" height="26" rx="8" fill="#059669" fill-opacity="0.3"/>
          <text x="115" y="150" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="bold">Direct SLP Yield</text>
        </g>

        <!-- Grand Total Banner -->
        <g transform="translate(80, 310)" filter="url(#neon5)">
          <rect width="800" height="120" rx="28" fill="#064e3b" stroke="#34d399" stroke-width="3.5"/>
          <text x="400" y="52" fill="#a7f3d0" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="bold" letter-spacing="2">TOTAL NEET ENERGY REVENUE PER GLUCOSE</text>
          <text x="400" y="96" fill="#ffffff" font-family="system-ui, sans-serif" font-size="34" text-anchor="middle" font-weight="900">24 ATP (FROM KREBS CYCLE)</text>
        </g>
      </svg>\`
    }
  ]
};
`;

const targetPath = path.join(__dirname, '../src/features/notes-to-video/demoLesson.ts');
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully wrote Kurzgesagt-style demoLesson.ts!');
