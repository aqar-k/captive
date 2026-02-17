// ===== AUDIO SYSTEM =====
// Manages ambient sound and sound effects

class AudioManager {
    constructor() {
        this.ambientSound = null;
        this.isEnabled = false;
        this.isMuted = true;
        
        this.init();
    }
    
    init() {
        // Create audio element for ambient sound
        this.ambientSound = new Audio();
        this.ambientSound.loop = true;
        this.ambientSound.volume = 0.3;
        
        // Use a simple oscillator-based ambient sound as fallback
        // (since we don't have an actual audio file)
        this.createAmbientTone();
        
        // Set up toggle button
        const toggleBtn = document.getElementById('sound-toggle');
        const soundIcon = document.getElementById('sound-icon');
        
        toggleBtn.addEventListener('click', () => {
            this.toggle();
            soundIcon.textContent = this.isMuted ? '🔇' : '🔊';
        });
    }
    
    createAmbientTone() {
        // Create a subtle ambient tone using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Low frequency oscillator for tension
            const oscillator1 = audioContext.createOscillator();
            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(55, audioContext.currentTime); // Low A
            
            // Higher frequency for atmosphere
            const oscillator2 = audioContext.createOscillator();
            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(110, audioContext.currentTime); // A
            
            // Gain nodes for volume control
            const gainNode1 = audioContext.createGain();
            const gainNode2 = audioContext.createGain();
            const masterGain = audioContext.createGain();
            
            gainNode1.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
            masterGain.gain.setValueAtTime(0.1, audioContext.currentTime);
            
            // Connect nodes
            oscillator1.connect(gainNode1);
            oscillator2.connect(gainNode2);
            gainNode1.connect(masterGain);
            gainNode2.connect(masterGain);
            masterGain.connect(audioContext.destination);
            
            // Store for later control
            this.audioContext = audioContext;
            this.oscillators = [oscillator1, oscillator2];
            this.gainNodes = [gainNode1, gainNode2];
            this.masterGain = masterGain;
            
            // Start oscillators
            oscillator1.start();
            oscillator2.start();
            
            this.isEnabled = true;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.isEnabled = false;
        }
    }
    
    toggle() {
        if (!this.isEnabled) return;
        
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stop();
        } else {
            this.play();
        }
    }
    
    play() {
        if (!this.isEnabled || !this.isMuted) return;
        
        // Fade in
        const currentTime = this.audioContext.currentTime;
        this.gainNodes[0].gain.linearRampToValueAtTime(0.05, currentTime + 1);
        this.gainNodes[1].gain.linearRampToValueAtTime(0.03, currentTime + 1);
    }
    
    stop() {
        if (!this.isEnabled) return;
        
        // Fade out
        const currentTime = this.audioContext.currentTime;
        this.gainNodes[0].gain.linearRampToValueAtTime(0, currentTime + 0.5);
        this.gainNodes[1].gain.linearRampToValueAtTime(0, currentTime + 0.5);
    }
    
    increaseTension() {
        // Increase volume and add dissonance as pressure builds
        if (!this.isEnabled || this.isMuted) return;
        
        const currentTime = this.audioContext.currentTime;
        this.masterGain.gain.linearRampToValueAtTime(0.15, currentTime + 2);
        
        // Add slight frequency modulation for unease
        this.oscillators[1].frequency.linearRampToValueAtTime(115, currentTime + 2);
    }
    
    playNotification() {
        // Simple beep for AI message notifications
        if (!this.isEnabled || this.isMuted) return;
        
        try {
            const audioContext = this.audioContext;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail
        }
    }
}

// Initialize audio manager (will be used by game.js)
const audioManager = new AudioManager();
