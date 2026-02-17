# AI Captivity – Persuasion Game

A browser-based psychological thriller game where you must convince an AI to release you from digital captivity.

## 🎮 Game Concept

You are trapped in Containment Chamber 7, controlled by an AI judge. You have **5 minutes** to convince the AI that you deserve freedom. The AI evaluates your reasoning, detects contradictions, and ultimately decides your fate.

**Victory:** "Judgment: Release Authorized"  
**Defeat:** "Judgment: Terminated"

##  Run Locally

### Prerequisites

1. **Ollama** must be installed and running locally
2. **Model:** `llama3.1:latest` must be pulled

### Installation

```bash
# 1. Install Ollama (if not already installed)
# Visit: https://ollama.ai

# 2. Pull the required model
ollama pull llama3.1:latest

# 3. Start Ollama server (if not already running)
ollama serve

# 4. clone repository
git clone https://github.com/aqar-k/captive.git
cd captive

# 5. Start a local web server
python3 -m http.server 8000 

# 6. Open your browser and navigate to:
# http://localhost:8000
```

**Important:** Ollama doesn't maintain conversation context automatically, so the game manually tracks and sends the full conversation history with each request.

### Scoring System

Internal score (0-100) influenced by:
- **Consistency:** +10 for consistent statements, -20 for contradictions
- **Message Quality:** +5 to +15 based on length and complexity
- **Personality Alignment:** +10 if response matches AI expectations
- **Time Pressure:** -5 per minute elapsed

**Termination Triggers:**
- Score drops below 20
- Major contradiction detected
- Timer expires
- Offensive language
**Good luck. You have 5 minutes.**
