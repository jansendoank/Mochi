/**
 * Synthetic sound generator using Web Audio API
 */

class SoundService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private async playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Cute pop sound for messages
  public playPop() {
    this.playTone(600, 'sine', 0.15, 0.2);
    setTimeout(() => this.playTone(800, 'sine', 0.1, 0.15), 50);
  }

  // Soft tick for buttons
  public playTick() {
    this.playTone(1200, 'triangle', 0.05, 0.1);
  }

  // Win confetti sound
  public playWin() {
    this.playTone(400, 'sine', 0.1, 0.2);
    setTimeout(() => this.playTone(600, 'sine', 0.1, 0.2), 100);
    setTimeout(() => this.playTone(800, 'sine', 0.2, 0.2), 200);
  }
}

export const sounds = new SoundService();
