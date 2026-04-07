# Patent Claim Scope Analyzer (OpenEnv)

A professional OpenEnv-compliant environment for evaluating AI agents on patent claim analysis, limitation extraction, and literal infringement assessment.

## 🚀 Overview

The **Patent Claim Scope Analyzer** simulates the real-world workflow of a patent attorney or IP analyst. It challenges agents to process complex legal-technical language, map claim elements to product features, and provide structured legal opinions.

### Key Features
- **OpenEnv Optimized**: Implements full `step()`, `reset()`, and `state()` API.
- **Durable State**: Tracks analysis history and partial rewards throughout the episode.
- **Premium UI**: Built with React + Tailwind + Framer Motion for a stunning visual experience.
- **Real-World Utility**: Models the "All Elements Rule" used in US patent law.

---

## 🛠 Action & Observation Spaces

### Action Space
Agents interact using the following actions:
1. `list_claims`: Scans the document to identify claim boundaries.
2. `analyze_claim`: (id: int) Deep dive into a specific claim to understand its structure.
3. `search_definition`: (term: string) Lookup legal terms like "comprising" or "consisting of" in the built-in dictionary.
4. `submit_final`: Submits the final analysis for the task.

### Observation Space
- `document_text`: The full patent or claim snippet.
- `task_description`: The specific objective (e.g., "Extract limitations from Claim 1").
- `history`: A record of all previous actions and environment echos.

---

## 📋 Tasks

| Task ID | Name | Difficulty | Description |
| :--- | :--- | :--- | :--- |
| `easy-claim-mapping` | Claim Mapping | Easy | Identify independent claims in a multi-claim document. |
| `medium-limitation-extraction` | Limitation Extraction | Medium | Extract specific technical features (limitations) from a robotic claim. |
| `hard-infringement-audit` | Infringement Audit | Hard | Determine if 'SafeSafe' product infringes a claim, requiring "All Elements" check. |

---

## 🚦 Getting Started

### Local Setup
1. **Install Node & Python**: Ensure you have Node 20+ and Python 3.9+.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Environment**:
   ```bash
   npm start
   ```

### Running Inference
1. Set your environment variables:
   ```bash
   export API_BASE_URL="http://localhost:3000"
   export OPENAI_API_KEY="your-key"
   export MODEL_NAME="gpt-4o"
   ```
2. Run the baseline script:
   ```bash
   python3 inference.py
   ```

### Docker
Build and run the containerized environment:
```bash
docker build -t patent-env .
docker run -p 3000:3000 patent-env
```

---

## 📊 Evaluation & Grader
Each task includes a programmatic grader that rewards:
- **Accuracy**: Correct identification of claims/limitations.
- **Reasoning**: In the hard task, the agent must identify the "Missing Element" for full marks.
- **Efficiency**: Partial rewards for using "Search" and "Analyze" actions before submission.

---

## 📜 License
MIT License. Built for the OpenEnv Hackathon 2026.
