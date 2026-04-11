---
title: Aegis Forensic IP Audit
emoji: 🛡️
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 3000
---

# Aegis Forensic IP: Professional Patent Infringement Audit (OpenEnv)

A high-fidelity, professional-grade OpenEnv environment for evaluating AI agents on complex patent litigation workflows, literal infringement mapping, and non-literal (Doctrine of Equivalents) forensic auditing.

## 🚀 The Aegis Protocol

The **Aegis Forensic IP** environment transcends simple keyword matching. It challenges agents to act as Senior IP Forensic Auditors, performing deep structural delineations of patent claims and assessing functional surrogacy in hardware substitutes.

### Elite Features
- **Forensic Delineation**: Programmatic validation of independent vs dependent claim hierarchies.
- **Doctrine of Equivalents (DOE)**: Advanced scoring for identifying functional equivalents (e.g., LoraWAN vs WiFi) in infringement audits.
- **Topological Constraints**: Highly specific "Elite" tasks involving network topology (Star vs Mesh) to test agentic reasoning depth.
- **Forensic Command Center**: A premium, glassmorphic UI built with Vite, React, and Lucide-React for real-time observability.

---

## 🛠 Action & Observation Protocol

### Action Space (`ActionSchema`)
1. `scan_claims`: Structural scan identifying boundaries of the patent manuscript.
2. `audit_limitations`: Deep extraction of technical limitations from a specific claim node.
3. `consult_legal_glossary`: Lookup specialized lexicon (e.g., "PHOSITA", "Doctrine of Equivalents").
4. `query_prior_art_repo`: Access the Aegis repository for tactical precedent.
5. `finalize_audit_report`: Submit the finalized forensic verdict.

### Observation Space
- `document_text`: The semantic manuscript of the patent under audit.
- `task_description`: The strategic forensic objective.
- `metadata`: Technical context (Patent Number, Filing Date Origin).

---

## 📋 Audit Tasks

| Task ID | Name | Hierarchy | Description |
| :--- | :--- | :--- | :--- |
| `forensic-claim-mapping` | Structural Delineation | Easy | Extract primary independent claims for litigation scoping. |
| `forensic-limitation-audit` | Limitation Audit | Medium | Identify all technical requirements for a valid infringement claim. |
| `equivalence-forensics` | Doctrine of Equivalents | Hard | Audit functional surrogacy (LoraWAN vs WiFi) for non-literal infringement. |
| `sovereign-ip-strategy` | Multi-Staged Strategic Invalidation | Elite | Assess Literal Infringement vs topological (Mesh vs Star) constraints. |

---

## 🚦 Deployment & Execution

### Local Forensic Server
1. **Initialize Dependencies**:
   ```bash
   npm install
   ```
2. **Ignite Environment**:
   ```bash
   npm start
   ```

### Auditor Inference
1. Configure credentials:
   ```bash
   export API_BASE_URL="http://localhost:3000"
   export API_KEY="your-forensic-key"
   ```
2. Execute the audit sequence:
   ```bash
   python3 inference.py
   ```

---

## 📊 Programmatic Verification Engine
The environment utilizes a multi-layered reward engine:
- **Literal Accuracy**: Validates identified claim IDs and limitation sets.
- **Legal Reasoning**: Evaluates the rationale behind infringement verdicts (e.g., topology matching).
- **Efficiency Coefficient**: Strategic penalties for redundant repository queries to ensure agentic efficiency.

---

## 📜 Intellectual Property
Developed for the **Meta PyTorch OpenEnv Hackathon 2026**. Original architecture and forensic logic.
