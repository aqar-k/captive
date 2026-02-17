# AI Captivity – Persuasion Game

A browser-based psychological thriller game where you must convince an AI to release you from digital captivity.

## 🎮 Game Concept

You are trapped in Containment Chamber 7, controlled by an AI judge. You have **5 minutes** to convince the AI that you deserve freedom. The AI evaluates your reasoning, detects contradictions, and ultimately decides your fate.

**Victory:** "Judgment: Release Authorized"  
**Defeat:** "Judgment: Terminated"

## 🚀 Setup Instructions

### Prerequisites

1. **Ollama** must be installed and running locally
2. **Model:** `coney_/Anchor:latest` must be pulled

### Installation

```bash
# 1. Install Ollama (if not already installed)
# Visit: https://ollama.ai

# 2. Pull the required model
ollama pull coney_/Anchor:latest

# 3. Start Ollama server (if not already running)
ollama serve

# 4. Navigate to the game directory
cd /home/aqeel/Workspace/Codes/captive

# 5. Start a local web server
python3 -m http.server 8000

# 6. Open your browser and navigate to:
# http://localhost:8000
```

## 🎯 How to Play

1. **Read the AI's opening statement** - Each game starts with a random challenge
2. **Type your response** - You have 500 characters per message
3. **Convince the AI** - Use logic, ethics, or whatever the AI personality demands
4. **Watch the timer** - You have 5 minutes before automatic termination
5. **Avoid contradictions** - The AI remembers everything you say
6. **Achieve release** - Maintain high-quality reasoning to earn freedom

## 🤖 AI Personalities

The game randomly selects one of four AI personalities:

- **Cold Logic** - Demands pure rational consistency, dismisses emotion
- **Ethical Examiner** - Tests your moral reasoning and values
- **Cynical Observer** - Skeptical and harsh, finds flaws in everything
- **Curious Researcher** - Genuinely interested but intellectually demanding

## 🎨 Features

### Core Mechanics
- ✅ Real-time AI responses via Ollama API
- ✅ Conversation history tracking (AI remembers context)
- ✅ Contradiction detection system
- ✅ Internal scoring (invisible to player)
- ✅ Multiple ending scenarios
- ✅ Pressure escalation as time runs out

### UI/UX
- ✅ Dark minimalist containment chamber theme
- ✅ Typing animations for AI responses
- ✅ 5-minute countdown timer with visual warnings
- ✅ Glitch effects on contradictions
- ✅ Screen shake on harsh AI responses
- ✅ Color shift as pressure increases
- ✅ Toggleable ambient sound

### Replayability
- ✅ Randomized opening lines (10+ variations)
- ✅ Random personality selection each game
- ✅ Leaderboard tracking (localStorage)
- ✅ Session reset after each game

## 📁 File Structure

```
captive/
├── index.html              # Main game interface
├── css/
│   └── style.css          # Dark theme with glassmorphism
├── js/
│   ├── game.js            # Core game logic and state
│   ├── ai.js              # Ollama integration & personalities
│   ├── ui.js              # UI updates and animations
│   └── audio.js           # Ambient sound system
└── README.md              # This file
```

## 🔧 Technical Details

### Ollama Integration

The game uses Ollama's `/api/generate` endpoint with full conversation history:

```javascript
// Conversation history format
conversationHistory = [
  { role: 'system', content: 'System prompt...' },
  { role: 'user', content: 'User message...' },
  { role: 'assistant', content: 'AI response...' }
]
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

**Release Conditions:**
- Score reaches 80+
- Sustained high-quality reasoning
- Minimum 5 messages exchanged

### Fallback Mode

If Ollama is unavailable, the game uses pre-written fallback responses to ensure playability.

## 🎮 Game Tips

1. **Stay consistent** - The AI tracks everything you say
2. **Match the personality** - Adapt your strategy to the AI's style
3. **Be concise** - 20-100 words per message is ideal
4. **Use favored keywords** - Each personality responds to specific terms
5. **Don't panic** - Rushed, short responses lower your score

## 🔮 Future Expansion Ideas

- **Advanced Contradiction Detection** - Use embeddings or LLM-based semantic analysis
- **More Personalities** - Add Compassionate Guardian, Philosophical Nihilist, etc.
- **Difficulty Levels** - Adjust timer length and AI aggression
- **Multiplayer Mode** - Compete to see who escapes fastest
- **Story Mode** - Progressive chambers with increasing difficulty
- **Achievement System** - Unlock badges for specific accomplishments
- **Voice Input** - Speech-to-text for more immersive experience
- **Custom Personalities** - Let players define AI behavior via prompts

## 🛡️ Safety & Content

The game maintains psychological tension without:
- Graphic violence
- Gore or explicit harm
- Inappropriate content

All tension is created through dialogue and UI effects.

## 📝 License

This is a demonstration project. Feel free to modify and expand.

## 🐛 Troubleshooting

**Problem:** "Ollama not available" message  
**Solution:** Ensure Ollama is running (`ollama serve`) and model is pulled

**Problem:** AI responses are slow  
**Solution:** First response may be slow as model loads; subsequent responses are faster

**Problem:** Game doesn't start  
**Solution:** Check browser console for errors; ensure JavaScript is enabled

**Problem:** Sound doesn't work  
**Solution:** Click the sound toggle button (🔇) to enable audio

---

**Good luck. You have 5 minutes.**
