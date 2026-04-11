import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { z } from "zod";

// --- Aegis Forensic IP Schemas ---

const ActionSchema = z.object({
  action_type: z.enum([
    "scan_claims", 
    "audit_limitations", 
    "consult_legal_glossary", 
    "query_prior_art_repo",
    "finalize_audit_report"
  ]),
  payload: z.any().optional(),
});

type Action = z.infer<typeof ActionSchema>;

interface Task {
  id: string;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "elite";
  document: string;
  metadata: {
    patentNumber: string;
    filingDate: string;
    independentClaims: number[];
    limitations: string[];
    isInfringed: boolean;
    analysis_keywords: string[];
  };
}

// --- Forensic Patent Datasets ---

const TASKS: Record<string, Task> = {
  "forensic-claim-mapping": {
    id: "forensic-claim-mapping",
    name: "Structural Claim Delineation",
    difficulty: "easy",
    description: "Audit the solar-capture system patent (US-1029384) to extract distinct independent claims for litigation scoping.",
    document: `
      [Patent US-1029384: Solar Modular Backpack]
      1. A solar-powered backpack comprising: a main compartment; a flexible solar panel; and a battery.
      2. The backpack of claim 1, further comprising a integrated USB-C port.
      3. A portable charging method using a photovoltaic substrate, comprising: collecting solar photons; and storing energy in a chemical battery.
      4. The method of claim 3, further comprising discharging energy to a mobile device.
      5. An ergonomic strap for a backpack according to claim 1.
    `,
    metadata: {
      patentNumber: "US-1029384",
      filingDate: "2024-05-12",
      independentClaims: [1, 3],
      limitations: [],
      isInfringed: false,
      analysis_keywords: ["compartment", "solar", "battery"],
    },
  },
  "forensic-limitation-audit": {
    id: "forensic-limitation-audit",
    name: "Claim Limitation Extraction",
    difficulty: "medium",
    description: "Deep audit of US-1192837 (Surgical Haptic Interface). Identify all technical limitations required for a valid infringement claim.",
    document: `
      [Patent US-1192837: Surgical Robotic Interface]
      1. A haptic feedback system for a surgical robot, comprising:
         a force sensor mounted on a robotic arm;
         a control unit receiving force data;
         and a vibrating actuator integrated into a remote console handle,
         wherein the vibrating actuator modulates frequency based on the magnitude of the force data.
    `,
    metadata: {
      patentNumber: "US-1192837",
      filingDate: "2023-11-20",
      independentClaims: [1],
      limitations: [
        "force sensor", "robotic arm", "control unit", "force data", 
        "vibrating actuator", "console handle", "modulates frequency"
      ],
      isInfringed: false,
      analysis_keywords: ["force", "haptic", "surgical", "modulate"],
    },
  },
  "equivalence-forensics": {
    id: "equivalence-forensics",
    name: "Doctrine of Equivalents (Non-Literal) Audit",
    difficulty: "hard",
    description: "Analyze the 'SafeSafe' hardware against US-1283746. Determine if LoraWAN protocols constitute a functional equivalent for WiFi limitations.",
    document: `
      [Patent Claim 1 - US-1283746 - Smart Biometric Access]
      1. A smart lock system comprising:
         a biometric scanner configured to read fingerprints;
         a memory storing authorized fingerprints;
         a mechanical deadbolt;
         and a WiFi module for remote unlocking.
      
      [Infringement Target Site: SafeSafe Gen2]
      The 'SafeSafe' device utilizes a proprietary optical fingerprint reader and solid-state local storage. It operates a heavy-duty mechanical locking mechanism. It LACKS a 2.4GHz/5GHz WiFi module but instead integrates a custom LoraWAN long-range chipset to achieve the intended functional outcome of remote unlocking.
    `,
    metadata: {
      patentNumber: "US-1283746",
      filingDate: "2025-01-05",
      independentClaims: [1],
      limitations: ["biometric scanner", "memory", "mechanical deadbolt", "WiFi module"],
      isInfringed: true,
      analysis_keywords: ["lorawan", "equivalence", "function", "remote"],
    },
  },
  "sovereign-ip-strategy": {
    id: "sovereign-ip-strategy",
    name: "Multi-Staged Strategic Invalidation",
    difficulty: "elite",
    description: "Perform a complex IP audit on US-9928374. Assess both Literal Infringement and potential Prior Art invalidity based on network topology constraints.",
    document: `
      [Patent US-9928374: Decentralized Smart Grids]
      1. A method for decentralized energy storage comprising:
         monitoring grid load via a mesh network of smart meters;
         predictively charging a plurality of home batteries;
         and discharging energy during peak demand.
      
      [Audited Target: EcoGrid AI]
      EcoGrid AI utilizes a star-topology network (not mesh) of smart meters connected to a central hub. It performs predictive charging and discharging. The audit must determine if the topological deviation avoids literal infringement.
    `,
    metadata: {
      patentNumber: "US-9928374",
      filingDate: "2022-03-15",
      independentClaims: [1],
      limitations: ["decentralized", "mesh network", "smart meters", "predictive charging", "peak demand"],
      isInfringed: false, 
      analysis_keywords: ["mesh", "star", "topology", "invalidity"],
    },
  }
};

const LEGAL_GLOSSARY: Record<string, string> = {
  "comprising": "Inclusive term (contains A, B, and C, but can contain more).",
  "consisting of": "Restrictive term (contains ONLY A, B, and C).",
  "independent claim": "Primary claim defining the core scope of invention.",
  "limitation": "A specific technical requirement of a claim.",
  "doctrine of equivalents": "Legal doctrine allowing infringement if a feature performs the same function in the same way for the same result.",
  "prior art": "Evidence that an invention was already known before the filing date.",
  "phosita": "Person Having Ordinary Skill In The Art (the standard for obviousness).",
};

const PRIOR_ART_REPOSITORY: Record<string, any> = {
  "US-1029384": [
    { id: "PA-1", text: "Vintage military pack with rigid solar cells and external battery storage.", relevance: 0.85 },
  ],
  "US-1192837": [
    { id: "PA-3", text: "Haptic feedback mechanism for precision flight controls using oscillating actuators.", relevance: 0.9 }
  ],
  "US-1283746": [
    { id: "PA-4", text: "Zigbee-enabled security system with distributed biometric nodes.", relevance: 0.82 }
  ],
  "US-9928374": [
    { id: "PA-5", text: "Decentralized energy balancing using Bluetooth Mesh for street lighting.", relevance: 0.98 }
  ]
};

// --- Forensic Engine State ---

let currentState = {
  taskId: "forensic-claim-mapping",
  history: [] as string[],
  done: false,
  totalReward: 0,
  steps: 0,
  actionCounts: {} as Record<string, number>,
};

// --- Server Lifecycle ---

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get(["/api/state", "/state"], (req, res) => res.json(currentState));
  app.get(["/api/glossary", "/glossary"], (req, res) => res.json(LEGAL_GLOSSARY));

  app.post(["/api/reset", "/reset"], (req, res) => {
    const taskId = req.body?.task_id || "forensic-claim-mapping";
    if (!TASKS[taskId]) return res.status(400).json({ error: "Invalid task ID" });

    currentState = {
      taskId,
      history: [],
      done: false,
      totalReward: 0,
      steps: 0,
      actionCounts: {},
    };

    const task = TASKS[taskId];
    res.json({
      observation: {
        document_text: task.document,
        task_description: task.description,
        history: currentState.history,
        metadata: {
          patent_number: task.metadata.patentNumber,
          filing_date: task.metadata.filingDate,
        }
      },
      reward: 0,
      done: false,
      info: { task_name: task.name, difficulty: task.difficulty }
    });
  });

  app.post(["/api/step", "/step"], (req, res) => {
    if (currentState.done) return res.status(400).json({ error: "Audit series concluded." });

    const actionResult = ActionSchema.safeParse(req.body);
    if (!actionResult.success) return res.status(400).json({ error: "Illegal action signature detector triggered." });

    const action = actionResult.data;
    const task = TASKS[currentState.taskId];
    let stepReward = 0;
    let message = "";
    
    currentState.steps++;
    currentState.actionCounts[action.action_type] = (currentState.actionCounts[action.action_type] || 0) + 1;
    
    // Strategic Penalty for redundancy
    if (currentState.actionCounts[action.action_type] > 3) {
      stepReward -= 0.1;
      message = `Strategic Penalty: Redundant use of ${action.action_type}. `;
    }

    switch (action.action_type) {
      case "scan_claims":
        message += "Structural boundaries of patent manuscript delineate.";
        stepReward += 0.05;
        break;

      case "audit_limitations":
        const cid = action.payload?.claim_id || 1;
        message += `Technical limitations for Claim ${cid} extracted for forensic mapping.`;
        stepReward += 0.1;
        break;

      case "consult_legal_glossary":
        const term = (action.payload?.term || "").toLowerCase();
        message += LEGAL_GLOSSARY[term] ? `Lexicon Match: ${LEGAL_GLOSSARY[term]}` : `No specialized legal entry found for '${term}'.`;
        stepReward += 0.05;
        break;

      case "query_prior_art_repo":
        const pa = PRIOR_ART_REPOSITORY[task.metadata.patentNumber] || [];
        message += pa.length > 0 
          ? `Repository query successful. Relevant precedent found: ${pa[0].id}`
          : "Local repository contains no direct tactical matches for this specific patent node.";
        stepReward += 0.15;
        break;

      case "finalize_audit_report":
        if (currentState.taskId === "forensic-claim-mapping") {
          const submitted = action.payload?.identified_claims || [];
          const truth = task.metadata.independentClaims;
          const correct = submitted.filter((c: number) => truth.includes(c)).length;
          const wrong = submitted.filter((c: number) => !truth.includes(c)).length;
          stepReward += Math.max(0, (correct / truth.length) - (wrong * 0.2));
          message += `Audit Report: ${correct}/${truth.length} independent claims successfully mapped.`;
        } 
        else if (currentState.taskId === "forensic-limitation-audit") {
          const submitted = action.payload?.extracted_limitations || [];
          const truth = task.metadata.limitations;
          const matches = submitted.filter((s: string) => 
            truth.some(t => s.toLowerCase().includes(t.toLowerCase()))
          );
          stepReward += matches.length / truth.length;
          message += `Audit Report: ${matches.length}/${truth.length} critical limitations verified.`;
        }
        else if (currentState.taskId === "equivalence-forensics") {
          const infringes = !!action.payload?.full_infringement_detected;
          const reasoning = (action.payload?.forensic_reasoning || "").toLowerCase();
          const mentionsEquivalence = reasoning.includes("equivalent") || reasoning.includes("function") || reasoning.includes("lorawan");
          
          if (infringes === task.metadata.isInfringed && mentionsEquivalence) {
            stepReward += 1.0;
            message += "Elite Verdict: Doctrine of Equivalents verified for non-literal infringement via LoraWAN.";
          } else {
            stepReward += 0.1;
            message += "Incomplete Verdict: Legal equivalence argument lacked forensic depth.";
          }
        }
        else if (currentState.taskId === "sovereign-ip-strategy") {
          const infringes = !!action.payload?.full_infringement_detected;
          const reasoning = (action.payload?.forensic_reasoning || "").toLowerCase();
          const mentionsTopology = reasoning.includes("topology") || reasoning.includes("mesh") || reasoning.includes("star");
          
          if (infringes === false && mentionsTopology) {
            stepReward += 1.0;
            message += "Elite Strategic Audit: Successfully identified non-infringement due to topological deviation (Mesh vs Star).";
          } else {
            stepReward += 0.2;
            message += "Audit Failure: Tactical network topology constraints were overlooked.";
          }
        }
        currentState.done = true;
        break;
    }

    currentState.totalReward += stepReward;
    currentState.history.push(`[${action.action_type.toUpperCase()}] ${message}`);

    // Standardized scoring for OpenEnv dashboard
    const displayScore = Math.min(Math.max(currentState.totalReward, 0.0), 1.0);

    res.json({
      observation: {
        document_text: task.document,
        task_description: task.description,
        history: currentState.history,
        metadata: {
          patent_number: task.metadata.patentNumber,
          filing_date: task.metadata.filingDate,
        }
      },
      reward: stepReward,
      done: currentState.done,
      info: { message, total_reward: currentState.totalReward, score: displayScore },
      state: currentState 
    });
  });

  app.get(["/api/openenv.yaml", "/openenv.yaml"], (req, res) => res.sendFile(path.join(process.cwd(), "openenv.yaml")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(process.cwd(), "dist", "index.html")));
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, "0.0.0.0", () => console.log(`Aegis Forensic IP Server online at port ${PORT}`));
}

startServer();
