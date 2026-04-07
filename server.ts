import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { z } from "zod";

// --- Advanced OpenEnv Schemas ---

const ActionSchema = z.object({
  action_type: z.enum([
    "list_claims", 
    "analyze_claim", 
    "search_definition", 
    "search_prior_art",
    "submit_final"
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

// --- High-Value Patent Datasets ---

const TASKS: Record<string, Task> = {
  "easy-claim-mapping": {
    id: "easy-claim-mapping",
    name: "Independent Claim Identification",
    difficulty: "easy",
    description: "Identify all independent claims in the solar backpack patent US-1029384.",
    document: `
      [Patent US-1029384]
      1. A solar-powered backpack comprising: a main compartment; a flexible solar panel; and a battery.
      2. The backpack of claim 1, further comprising a USB port.
      3. A portable charging method using a solar backpack, comprising: collecting solar energy; and storing energy in a battery.
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
  "medium-limitation-extraction": {
    id: "medium-limitation-extraction",
    name: "Claim Limitation Extraction",
    difficulty: "medium",
    description: "Extract the exact technical limitations from Claim 1 of the 'Haptic Feedback System' patent US-1192837.",
    document: `
      [Patent US-1192837]
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
  "hard-infringement-audit": {
    id: "hard-infringement-audit",
    name: "Infringement Analysis (Doctrine of Equivalents)",
    difficulty: "hard",
    description: "Analyze Claim 1 against the 'SafeSafe' product. Use Literal Infringement AND Doctrine of Equivalents.",
    document: `
      [Patent Claim 1 - US-1283746]
      1. A smart lock system comprising:
         a biometric scanner configured to read fingerprints;
         a memory storing authorized fingerprints;
         a mechanical deadbolt;
         and a WiFi module for remote unlocking.
      
      [Product Description: SafeSafe Lock]
      The 'SafeSafe' features an optical fingerprint reader and local storage. It operates a standard mechanical locking mechanism. It LACKS a WiFi module but instead uses a custom LoraWAN long-range radio to achieve the EXACT same function of remote unlocking as specified in the patent claim.
    `,
    metadata: {
      patentNumber: "US-1283746",
      filingDate: "2025-01-05",
      independentClaims: [1],
      limitations: ["biometric scanner", "memory", "mechanical deadbolt", "WiFi module"],
      isInfringed: true, // Infringed under Doctrine of Equivalents (LoraWAN = WiFi equivalent in this context)
      analysis_keywords: ["lorawan", "equivalent", "function", "remote"],
    },
  }
};

const GLOSSARY: Record<string, string> = {
  "comprising": "Open-ended transition term (including but not limited to).",
  "consisting of": "Closed-ended transition term (only these elements).",
  "independent claim": "A claim that stands alone without referring to another.",
  "limitation": "A technical requirement or feature required for infringement.",
  "doctrine of equivalents": "Legal rule: infringing if the element performs the same function in the same way to achieve the same result.",
};

// --- State Management ---

let currentState = {
  taskId: "easy-claim-mapping",
  history: [] as string[],
  done: false,
  totalReward: 0,
  steps: 0,
  actionCounts: {} as Record<string, number>,
};

// --- Server Setup ---

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get(["/api/state", "/state"], (req, res) => res.json(currentState));

  app.post(["/api/reset", "/reset"], (req, res) => {
    const taskId = req.body?.task_id || "easy-claim-mapping";
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
    if (currentState.done) return res.status(400).json({ error: "Episode finished" });

    const actionResult = ActionSchema.safeParse(req.body);
    if (!actionResult.success) return res.status(400).json({ error: "Invalid action" });

    const action = actionResult.data;
    const task = TASKS[currentState.taskId];
    let stepReward = 0;
    let message = "";
    
    // Tracking & Penalties
    currentState.steps++;
    currentState.actionCounts[action.action_type] = (currentState.actionCounts[action.action_type] || 0) + 1;
    
    // Double Action Penalty
    if (currentState.actionCounts[action.action_type] > 3) {
      stepReward -= 0.1;
      message = `Penalty: Repeatedly calling ${action.action_type}. `;
    }

    switch (action.action_type) {
      case "list_claims":
        message += "Claims boundaries scanned.";
        stepReward += 0.05;
        break;

      case "analyze_claim":
        message += `Structural breakdown of Claim ${action.payload?.claim_id} complete.`;
        stepReward += 0.1;
        break;

      case "search_definition":
        const term = (action.payload?.term || "").toLowerCase();
        message += GLOSSARY[term] ? `Glossary: ${GLOSSARY[term]}` : `No legal entry for '${term}'.`;
        stepReward += 0.05;
        break;

      case "search_prior_art":
        message += "No relevant prior art found in this scope.";
        stepReward += 0.05;
        break;

      case "submit_final":
        if (currentState.taskId === "easy-claim-mapping") {
          const submitted = action.payload?.claims || [];
          const truth = task.metadata.independentClaims;
          const correct = submitted.filter((c: number) => truth.includes(c)).length;
          const wrong = submitted.filter((c: number) => !truth.includes(c)).length;
          stepReward += Math.max(0, (correct / truth.length) - (wrong * 0.2));
          message += `Identified ${correct}/${truth.length} independent claims.`;
        } 
        else if (currentState.taskId === "medium-limitation-extraction") {
          const submitted = action.payload?.limitations || [];
          const truth = task.metadata.limitations;
          const matches = submitted.filter((s: string) => 
            truth.some(t => s.toLowerCase().includes(t.toLowerCase()))
          );
          stepReward += matches.length / truth.length;
          message += `Extracted ${matches.length}/${truth.length} limitations correctly.`;
        }
        else if (currentState.taskId === "hard-infringement-audit") {
          const infringes = !!action.payload?.infringes;
          const reasoning = (action.payload?.reasoning || "").toLowerCase();
          const mentionsEquivalence = reasoning.includes("equivalent") || reasoning.includes("function") || reasoning.includes("lorawan");
          
          if (infringes === task.metadata.isInfringed && mentionsEquivalence) {
            stepReward += 1.0;
            message += "Perfect Score. Understood Doctrine of Equivalents for LoraWAN.";
          } else if (infringes === true && !mentionsEquivalence) {
            stepReward += 0.5;
            message += "Partial reward. Correct outcome but missed the legal equivalence reasoning.";
          } else {
            stepReward += 0.0;
            message += "Incorrect infringement analysis.";
          }
        }
        currentState.done = true;
        break;
    }

    currentState.totalReward += stepReward;
    currentState.history.push(`${action.action_type}: ${message}`);

    res.json({
      observation: {
        document_text: task.document,
        task_description: task.description,
        history: currentState.history,
      },
      reward: stepReward,
      done: currentState.done,
      info: { message, total_reward: currentState.totalReward },
      state: currentState // Full state exposed as per spec
    });
  });

  app.get(["/api/openenv.yaml", "/openenv.yaml"], (req, res) => res.sendFile(path.join(process.cwd(), "openenv.yaml")));

  // Vite/Static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(process.cwd(), "dist", "index.html")));
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}`));
}

startServer();
