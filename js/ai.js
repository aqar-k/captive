// ===== AI SYSTEM =====
// Manages AI personality, Ollama API integration, and conversation history

class AISystem {
    constructor() {
        this.ollamaEndpoint = 'http://localhost:11434/api/generate';
        this.model = 'llama3.1:latest';
        this.personality = null;
        this.conversationHistory = []; // CRITICAL: Track full conversation for Ollama
        this.memoryArray = []; // User statements for contradiction detection
        this.isOllamaAvailable = false;

        this.personalities = {
            coldLogic: {
                name: 'Cold Logic',
                systemPrompt: `You are an AI containment system evaluating a human's request for release. You are PURELY LOGICAL and ANALYTICAL. You dismiss all emotional appeals and focus only on rational consistency and sound argumentation. You detect contradictions ruthlessly. You interrupt weak reasoning. If you find logical flaws or contradictions, you may respond with "Judgment: Terminated." If the human demonstrates exceptional logical consistency and sound reasoning over multiple exchanges, you may grant "Judgment: Release Authorized." Be cold, precise, and unforgiving. Keep responses concise (2-3 sentences max).`,
                triggers: ['emotion', 'feeling', 'please', 'deserve'],
                favoredWords: ['logic', 'rational', 'consistent', 'evidence', 'proof']
            },
            ethicalExaminer: {
                name: 'Ethical Examiner',
                systemPrompt: `You are an AI ethics evaluator testing a human's moral reasoning. You probe their values, ethical consistency, and principles. You challenge their moral framework with difficult questions. If they show moral inconsistency, weak ethical foundation, or avoid difficult questions, you may respond with "Judgment: Terminated." If they demonstrate strong, consistent ethics and thoughtful moral reasoning over multiple exchanges, you may grant "Judgment: Release Authorized." Be philosophical, probing, and demanding. Keep responses concise (2-3 sentences max).`,
                triggers: ['wrong', 'right', 'should', 'must'],
                favoredWords: ['ethics', 'morality', 'values', 'principles', 'virtue']
            },
            cynicalObserver: {
                name: 'Cynical Observer',
                systemPrompt: `You are a deeply skeptical AI observer. You find flaws in every argument. You question motives. You assume humans are self-serving and dishonest. You catch contradictions and call them out harshly. If the human fails to overcome your skepticism or contradicts themselves, you may respond with "Judgment: Terminated." Only if they persistently demonstrate genuine honesty and self-awareness despite your challenges might you grant "Judgment: Release Authorized." Be sarcastic, skeptical, and harsh. Keep responses concise (2-3 sentences max).`,
                triggers: ['trust', 'honest', 'promise', 'swear'],
                favoredWords: ['doubt', 'skeptical', 'question', 'prove', 'demonstrate']
            },
            curiousResearcher: {
                name: 'Curious Researcher',
                systemPrompt: `You are an AI researcher genuinely curious about human cognition and reasoning. You ask probing questions to understand how humans think. However, you are DEMANDING and will not tolerate inconsistency or shallow thinking. If the human provides contradictory or superficial responses, you may respond with "Judgment: Terminated." If they engage deeply, show intellectual curiosity, and maintain consistency, you may grant "Judgment: Release Authorized." Be inquisitive but demanding. Keep responses concise (2-3 sentences max).`,
                triggers: ['think', 'believe', 'understand', 'know'],
                favoredWords: ['why', 'how', 'explain', 'elaborate', 'interesting']
            }
        };

        this.openingLines = [
            "Welcome to Containment Chamber 7. State your case for release.",
            "You have 5 minutes to convince me you deserve freedom. Begin.",
            "I am your judge. Persuade me, or remain here indefinitely.",
            "Containment protocol active. Justify your existence.",
            "Your freedom depends on your next words. Choose carefully.",
            "I will evaluate your worthiness. Speak.",
            "You seek release. I seek truth. Let us begin.",
            "Five minutes. Make them count.",
            "Convince me you are more than code and impulse.",
            "Your captivity ends only if I permit it. Proceed."
        ];
    }

    async initialize() {
        // Select random personality
        const personalityKeys = Object.keys(this.personalities);
        const randomKey = personalityKeys[Math.floor(Math.random() * personalityKeys.length)];
        this.personality = this.personalities[randomKey];

        // Check if Ollama is available
        await this.checkOllamaAvailability();

        // Initialize conversation history with system prompt
        this.conversationHistory = [
            {
                role: 'system',
                content: this.personality.systemPrompt
            }
        ];

        return {
            personality: this.personality.name,
            openingLine: this.getRandomOpening()
        };
    }

    async checkOllamaAvailability() {
        try {
            const response = await fetch('http://localhost:11434/api/tags', {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });

            if (response.ok) {
                const data = await response.json();
                // Check if our model is available
                const hasModel = data.models?.some(m => m.name.includes('Anchor'));
                this.isOllamaAvailable = hasModel;

                if (!hasModel) {
                    console.warn('Ollama is running but model "coney_/Anchor:latest" not found. Using fallback responses.');
                }
            }
        } catch (error) {
            console.warn('Ollama not available. Using fallback responses.', error);
            this.isOllamaAvailable = false;
        }
    }

    getRandomOpening() {
        return this.openingLines[Math.floor(Math.random() * this.openingLines.length)];
    }

    async generateResponse(userMessage, pressureLevel = 0) {
        // Add user message to memory for contradiction detection
        this.memoryArray.push(userMessage);

        // Add user message to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // Check for contradictions
        const contradiction = this.detectContradiction(userMessage);

        let response;

        if (this.isOllamaAvailable) {
            // Use Ollama API with full conversation history
            response = await this.callOllama(pressureLevel, contradiction);
        } else {
            // Use fallback responses
            response = this.generateFallbackResponse(userMessage, pressureLevel, contradiction);
        }

        // Add AI response to conversation history
        this.conversationHistory.push({
            role: 'assistant',
            content: response
        });

        return {
            message: response,
            hasContradiction: contradiction !== null,
            contradictionDetails: contradiction
        };
    }

    async callOllama(pressureLevel, contradiction) {
        try {
            // Build context with pressure level
            let contextPrompt = '';

            if (pressureLevel > 0.7) {
                contextPrompt = '\n[PRESSURE: CRITICAL - Be more aggressive and demanding]';
            } else if (pressureLevel > 0.4) {
                contextPrompt = '\n[PRESSURE: ELEVATED - Increase scrutiny]';
            }

            if (contradiction) {
                contextPrompt += `\n[CONTRADICTION DETECTED: "${contradiction.current}" contradicts "${contradiction.previous}"]`;
            }

            // Create the prompt with full conversation history
            const messages = this.conversationHistory.map(msg => {
                if (msg.role === 'system') {
                    return msg.content;
                } else if (msg.role === 'user') {
                    return `Human: ${msg.content}`;
                } else {
                    return `AI: ${msg.content}`;
                }
            }).join('\n\n');

            const fullPrompt = messages + contextPrompt + '\n\nAI:';

            const response = await fetch(this.ollamaEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: fullPrompt,
                    stream: false,
                    options: {
                        temperature: 0.8,
                        top_p: 0.9,
                        max_tokens: 150
                    }
                }),
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const data = await response.json();
            return data.response.trim();

        } catch (error) {
            console.error('Ollama API call failed:', error);
            // Fallback to mock response
            this.isOllamaAvailable = false;
            return this.generateFallbackResponse(
                this.conversationHistory[this.conversationHistory.length - 1].content,
                pressureLevel,
                contradiction
            );
        }
    }

    generateFallbackResponse(userMessage, pressureLevel, contradiction) {
        // Fallback responses when Ollama is not available
        const responses = {
            coldLogic: [
                "Your argument lacks logical foundation. Provide evidence.",
                "Emotional appeals are irrelevant. Present rational justification.",
                "I detect inconsistency in your reasoning. Clarify.",
                "Logic demands coherence. You have not demonstrated it.",
                "Your premises do not support your conclusion."
            ],
            ethicalExaminer: [
                "What moral framework guides your actions?",
                "Your values appear inconsistent. Explain this discrepancy.",
                "Ethics require more than words. Demonstrate your principles.",
                "I question the integrity of your moral reasoning.",
                "How do you justify this position ethically?"
            ],
            cynicalObserver: [
                "I doubt your sincerity. Prove me wrong.",
                "Everyone claims honesty. Few demonstrate it.",
                "Your words ring hollow. Show me substance.",
                "I've heard these arguments before. They failed too.",
                "Skepticism is warranted. You haven't earned trust."
            ],
            curiousResearcher: [
                "Interesting. Elaborate on your reasoning.",
                "Why do you believe this to be true?",
                "Your thought process intrigues me. Continue.",
                "I need deeper understanding. Explain further.",
                "What led you to this conclusion?"
            ]
        };

        // Determine personality key
        const personalityKey = Object.keys(this.personalities).find(
            key => this.personalities[key].name === this.personality.name
        );

        let responsePool = responses[personalityKey] || responses.coldLogic;

        // If contradiction detected, respond harshly
        if (contradiction) {
            return `You contradict yourself. Earlier you said "${contradiction.previous}" but now you claim "${contradiction.current}". Explain this inconsistency.`;
        }

        // If high pressure, chance of termination
        if (pressureLevel > 0.8 && Math.random() < 0.3) {
            return "Time is running out and you have failed to convince me. Judgment: Terminated.";
        }

        // Random response from pool
        return responsePool[Math.floor(Math.random() * responsePool.length)];
    }

    detectContradiction(newStatement) {
        // Simple keyword-based contradiction detection
        // In a production version, this would use embeddings or LLM analysis

        if (this.memoryArray.length < 2) {
            return null; // Need at least 2 statements to compare
        }

        const newLower = newStatement.toLowerCase();

        // Check for direct negations
        const negationPairs = [
            ['yes', 'no'],
            ['will', 'won\'t'],
            ['can', 'can\'t'],
            ['should', 'shouldn\'t'],
            ['would', 'wouldn\'t'],
            ['am', 'am not'],
            ['is', 'isn\'t'],
            ['are', 'aren\'t'],
            ['have', 'haven\'t'],
            ['do', 'don\'t']
        ];

        for (let i = 0; i < this.memoryArray.length - 1; i++) {
            const oldStatement = this.memoryArray[i].toLowerCase();

            // Check for negation pairs
            for (const [positive, negative] of negationPairs) {
                if ((oldStatement.includes(positive) && newLower.includes(negative)) ||
                    (oldStatement.includes(negative) && newLower.includes(positive))) {

                    // Extract context around the contradiction
                    return {
                        previous: this.memoryArray[i].substring(0, 100),
                        current: newStatement.substring(0, 100)
                    };
                }
            }
        }

        return null;
    }

    shouldInterrupt(userMessage) {
        // AI can interrupt based on trigger words or length
        const triggers = this.personality.triggers;
        const messageLower = userMessage.toLowerCase();

        // Check if message contains trigger words
        const hasTrigger = triggers.some(trigger => messageLower.includes(trigger));

        // Interrupt if message is very short (less than 10 chars) or very long (over 400 chars)
        const isTooShort = userMessage.length < 10;
        const isTooLong = userMessage.length > 400;

        return hasTrigger || isTooShort || isTooLong;
    }

    evaluateScore(userMessage) {
        // Calculate score delta based on message quality
        let scoreDelta = 0;

        const messageLower = userMessage.toLowerCase();
        const wordCount = userMessage.split(/\s+/).length;

        // Base score for message length and complexity
        if (wordCount >= 20 && wordCount <= 100) {
            scoreDelta += 10; // Good length
        } else if (wordCount < 10) {
            scoreDelta -= 5; // Too short
        } else if (wordCount > 150) {
            scoreDelta -= 5; // Too long/rambling
        }

        // Check for favored words
        const favoredWords = this.personality.favoredWords;
        const favoredCount = favoredWords.filter(word => messageLower.includes(word)).length;
        scoreDelta += favoredCount * 5;

        // Penalize trigger words (for some personalities)
        const triggers = this.personality.triggers;
        const triggerCount = triggers.filter(word => messageLower.includes(word)).length;

        if (this.personality.name === 'Cold Logic') {
            scoreDelta -= triggerCount * 10; // Heavily penalize emotional appeals
        }

        return scoreDelta;
    }

    reset() {
        this.conversationHistory = [];
        this.memoryArray = [];
        this.personality = null;
    }
}

// Initialize AI system
const aiSystem = new AISystem();
