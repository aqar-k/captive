// ===== UI MANAGER =====
// Handles all UI updates, animations, and visual effects

class UIManager {
    constructor() {
        this.chatContainer = document.getElementById('chat-container');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.timerDisplay = document.getElementById('timer');
        this.charCount = document.getElementById('char-count');
        this.statusText = document.getElementById('status-text');
        this.glitchOverlay = document.getElementById('glitch-overlay');
        this.container = document.querySelector('.container');

        this.init();
    }

    init() {
        // Character counter
        this.userInput.addEventListener('input', () => {
            const length = this.userInput.value.length;
            this.charCount.textContent = `${length}/500`;
        });
    }

    // ===== MESSAGE RENDERING =====

    addMessage(sender, content, timestamp = new Date()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const timeStr = timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender ${sender}">${sender === 'ai' ? 'AI SYSTEM' : 'USER'}</span>
                <span class="message-timestamp">${timeStr}</span>
            </div>
            <div class="message-content">${this.escapeHtml(content)}</div>
        `;

        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();

        return messageDiv;
    }

    addTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'message ai';
        indicatorDiv.id = 'typing-indicator';

        indicatorDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender ai">AI SYSTEM</span>
                <span class="message-timestamp">Processing...</span>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        this.chatContainer.appendChild(indicatorDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async typeMessage(sender, content, speed = 30) {
        // Remove typing indicator
        this.removeTypingIndicator();

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const timestamp = new Date();
        const timeStr = timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender ${sender}">${sender === 'ai' ? 'AI SYSTEM' : 'USER'}</span>
                <span class="message-timestamp">${timeStr}</span>
            </div>
            <div class="message-content"></div>
        `;

        this.chatContainer.appendChild(messageDiv);
        const contentDiv = messageDiv.querySelector('.message-content');

        // Type out character by character
        let index = 0;
        const escapedContent = this.escapeHtml(content);

        return new Promise((resolve) => {
            const typeInterval = setInterval(() => {
                if (index < escapedContent.length) {
                    contentDiv.textContent += escapedContent[index];
                    index++;
                    this.scrollToBottom();
                } else {
                    clearInterval(typeInterval);
                    resolve();
                }
            }, speed);
        });
    }

    // ===== TIMER =====

    updateTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;

        this.timerDisplay.textContent = timeStr;

        // Change color based on time remaining
        this.timerDisplay.classList.remove('warning', 'danger');

        if (seconds <= 30) {
            this.timerDisplay.classList.add('danger');
            this.container.classList.add('danger');
        } else if (seconds <= 120) {
            this.timerDisplay.classList.add('warning');
        }
    }

    // ===== INPUT CONTROL =====

    enableInput() {
        this.userInput.disabled = false;
        this.sendBtn.disabled = false;
        this.statusText.textContent = 'Awaiting input...';
        this.userInput.focus();
    }

    disableInput() {
        this.userInput.disabled = true;
        this.sendBtn.disabled = true;
        this.statusText.textContent = 'AI is processing...';
    }

    clearInput() {
        this.userInput.value = '';
        this.charCount.textContent = '0/500';
    }

    // ===== VISUAL EFFECTS =====

    triggerGlitch(duration = 300) {
        this.glitchOverlay.classList.add('active');
        setTimeout(() => {
            this.glitchOverlay.classList.remove('active');
        }, duration);
    }

    triggerShake() {
        this.container.classList.add('shake');
        setTimeout(() => {
            this.container.classList.remove('shake');
        }, 500);
    }

    applyColorShift(intensity = 0.5) {
        // Shift container border color toward red
        const red = Math.floor(255 * intensity);
        const green = Math.floor(255 * (1 - intensity) * 0.5);
        this.container.style.boxShadow = `0 0 20px rgba(${red}, ${green}, 68, 0.5)`;
    }

    // ===== OVERLAYS =====

    showGameOver(reason, stats) {
        const overlay = document.getElementById('game-over-overlay');
        document.getElementById('termination-reason').textContent = reason;
        document.getElementById('time-survived').textContent = stats.timeSurvived;
        document.getElementById('messages-sent').textContent = stats.messagesSent;
        document.getElementById('ai-personality').textContent = stats.personality;

        overlay.classList.remove('hidden');
    }

    showVictory(stats) {
        const overlay = document.getElementById('victory-overlay');
        document.getElementById('victory-time').textContent = stats.timeToFreedom;
        document.getElementById('victory-messages').textContent = stats.messagesSent;
        document.getElementById('victory-personality').textContent = stats.personality;

        // Update leaderboard
        this.updateLeaderboard(stats);

        overlay.classList.remove('hidden');
    }

    hideOverlays() {
        document.getElementById('game-over-overlay').classList.add('hidden');
        document.getElementById('victory-overlay').classList.add('hidden');
    }

    updateLeaderboard(newEntry) {
        // Get existing leaderboard from localStorage
        let leaderboard = JSON.parse(localStorage.getItem('captivity_leaderboard') || '[]');

        // Add new entry
        leaderboard.push({
            time: newEntry.timeToFreedom,
            messages: newEntry.messagesSent,
            personality: newEntry.personality,
            date: new Date().toLocaleDateString()
        });

        // Sort by time (faster is better)
        leaderboard.sort((a, b) => {
            const timeA = this.timeToSeconds(a.time);
            const timeB = this.timeToSeconds(b.time);
            return timeA - timeB;
        });

        // Keep top 5
        leaderboard = leaderboard.slice(0, 5);

        // Save back to localStorage
        localStorage.setItem('captivity_leaderboard', JSON.stringify(leaderboard));

        // Display
        const listElement = document.getElementById('leaderboard-list');
        listElement.innerHTML = '';

        leaderboard.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'leaderboard-item';
            li.innerHTML = `
                <span>#${index + 1} - ${entry.personality}</span>
                <span>${entry.time} (${entry.messages} msgs)</span>
            `;
            listElement.appendChild(li);
        });
    }

    timeToSeconds(timeStr) {
        const [mins, secs] = timeStr.split(':').map(Number);
        return mins * 60 + secs;
    }

    // ===== UTILITIES =====

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearChat() {
        this.chatContainer.innerHTML = '';
    }
}

// Initialize UI manager
const uiManager = new UIManager();
