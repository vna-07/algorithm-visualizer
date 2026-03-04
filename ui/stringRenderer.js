// ui/stringRenderer.js
// Animates string search steps character by character.

import { naiveSearch } from '../core/string/naiveSearch.js';
import { kmpSearch, getLPS } from '../core/string/kmp.js';

const SPEED_MAP = [500, 300, 180, 100, 60, 35, 20, 12, 6, 2];

const SAMPLES = {
  dna:     { label: 'DNA Sequence', text: 'AGTACGTAGCTAGCTAGTACGTAGCTAGTACGTAGCTAGCTAGTACG', pattern: 'AGTACG' },
  lorem:   { label: 'Lorem Ipsum',  text: 'the quick brown fox jumps over the lazy dog and the fox ran away', pattern: 'fox' },
  repeat:  { label: 'Repeated Pattern', text: 'ababababababababababababababab', pattern: 'ababab' },
  binary:  { label: 'Binary String', text: '10110101011010110101101011010110101101', pattern: '10110' },
  custom:  { label: 'Custom', text: '', pattern: '' },
};

export class StringRenderer {
  constructor() {
    const panel      = document.getElementById('mode-string');
    const q          = id => panel.querySelector('#' + id);

    this.textDisplay  = q('str-text-display');
    this.patDisplay   = q('str-pat-display');
    this.textInput    = q('str-text-input');
    this.patInput     = q('str-pat-input');
    this.selectSample = q('str-sample');
    this.selectAlgo   = q('str-algo');
    this.sliderSpeed  = q('slider-speed-string');
    this.lblSpeed     = q('lbl-speed-string');
    this.btnPlay      = q('btn-play-string');
    this.btnReset     = q('btn-reset-string');
    this.lpsDisplay   = q('str-lps-display');
    this.chipStatus   = document.getElementById('chip-status');
    this.chipComplex  = document.getElementById('chip-complexity');
    this.statComp     = document.getElementById('stat-comparisons');
    this.statMatches  = document.getElementById('stat-swaps');
    this.statSize     = document.getElementById('stat-size');
    this.statTime     = document.getElementById('stat-time');

    this.steps      = [];
    this.stepIdx    = 0;
    this.running    = false;
    this.timer      = null;
    this.startTime  = null;
    this.algoKey    = 'naive';

    this._bindControls();
    this._loadSample('dna');
  }

  // ── Controls ────────────────────────────────────────────

  _bindControls() {
    this.selectSample?.addEventListener('change', () => {
      const key = this.selectSample.value;
      this._loadSample(key);
    });

    this.textInput?.addEventListener('input', () => {
      this._renderText(this.textInput.value, [], -1, -1);
      this._stop();
    });

    this.patInput?.addEventListener('input', () => {
      this._stop();
      this._updateLPS();
    });

    this.selectAlgo?.addEventListener('change', () => {
      this.algoKey = this.selectAlgo.value;
      this._stop();
      this._updateChips();
      this._updateLPS();
      if (this.lpsDisplay)
        this.lpsDisplay.style.display = this.algoKey === 'kmp' ? 'flex' : 'none';
    });

    this.sliderSpeed?.addEventListener('input', () => {
      if (this.lblSpeed) this.lblSpeed.textContent = this.sliderSpeed.value;
    });

    this.btnPlay?.addEventListener('click',  () => this.running ? this._pause() : this._play());
    this.btnReset?.addEventListener('click', () => this._stop());
  }

  _loadSample(key) {
    const s = SAMPLES[key];
    if (!s) return;
    if (s.text)    this.textInput.value = s.text;
    if (s.pattern) this.patInput.value  = s.pattern;
    this._stop();
    this._renderText(this.textInput.value, [], -1, -1);
    this._renderPat(this.patInput.value, -1, 'idle');
    this._updateLPS();
    this.statSize.textContent = this.textInput.value.length + ' chars';
  }

  // ── Run ──────────────────────────────────────────────────

  _play() {
    const text = this.textInput?.value ?? '';
    const pat  = this.patInput?.value  ?? '';
    if (!text || !pat) return;

    if (this.stepIdx === 0 || this.stepIdx >= this.steps.length) {
      this.steps   = this.algoKey === 'kmp'
        ? kmpSearch(text, pat)
        : naiveSearch(text, pat);
      this.stepIdx = 0;
    }

    this.running   = true;
    this.startTime = this.startTime ?? Date.now();
    this.btnPlay.textContent = '⏸ Pause';
    this.btnPlay.classList.add('primary');
    this._setStatus('running');
    this._updateChips();

    const delay = SPEED_MAP[parseInt(this.sliderSpeed?.value ?? 5) - 1];
    this.timer = setInterval(() => this._tick(), delay);
  }

  _pause() {
    clearInterval(this.timer);
    this.running = false;
    this.btnPlay.textContent = '▶ Play';
    this.btnPlay.classList.remove('primary');
    this._setStatus('paused');
  }

  _stop() {
    clearInterval(this.timer);
    this.running   = false;
    this.stepIdx   = 0;
    this.steps     = [];
    this.startTime = null;
    if (this.btnPlay) {
      this.btnPlay.textContent = '▶ Play';
      this.btnPlay.classList.remove('primary');
    }
    this._renderText(this.textInput?.value ?? '', [], -1, -1);
    this._renderPat(this.patInput?.value  ?? '', -1, 'idle');
    this._resetStats();
    this._setStatus('idle');
  }

  _tick() {
    if (this.stepIdx >= this.steps.length) {
      clearInterval(this.timer);
      this.running = false;
      this.btnPlay.textContent = '▶ Play';
      this.btnPlay.classList.remove('primary');
      this._setStatus('done');
      this.statTime.textContent = (Date.now() - this.startTime) + 'ms';
      return;
    }

    const step = this.steps[this.stepIdx++];
    this._applyStep(step);
  }

  _applyStep(step) {
    const text = this.textInput?.value ?? '';
    const pat  = this.patInput?.value  ?? '';

    // Build highlight sets
    const comparing = new Set();
    const found     = new Set(step.matches.flatMap(m =>
      Array.from({ length: pat.length }, (_, i) => m + i)
    ));

    if (step.state !== 'done') {
      for (let k = 0; k < step.patIdx; k++) comparing.add(step.matchStart + k);
      if (step.state === 'found') {
        for (let k = 0; k < pat.length; k++) comparing.add(step.matchStart + k);
      } else {
        comparing.add(step.textIdx);
      }
    }

    this._renderText(text, found, step.textIdx, step.matchStart, step.state, comparing, step.patIdx);
    this._renderPat(pat, step.patIdx, step.state);

    this.statComp.textContent    = step.comparisons;
    this.statMatches.textContent = step.matches.length;
    if (this.startTime) this.statTime.textContent = (Date.now() - this.startTime) + 'ms';
  }

  // ── Rendering ────────────────────────────────────────────

  _renderText(text, foundSet, activeIdx, matchStart, state, comparing, patIdx) {
    if (!this.textDisplay) return;
    this.textDisplay.innerHTML = '';

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      span.className = 'str-char';

      if (foundSet?.has(i))   span.classList.add('str-found');
      if (i === activeIdx) {
        if (state === 'match')    span.classList.add('str-match');
        if (state === 'mismatch') span.classList.add('str-mismatch');
        if (state === 'jump')     span.classList.add('str-jump');
        if (state === 'found')    span.classList.add('str-found');
      }
      if (comparing?.has(i) && !foundSet?.has(i)) span.classList.add('str-comparing');

      this.textDisplay.appendChild(span);
    }
  }

  _renderPat(pat, activeIdx, state) {
    if (!this.patDisplay) return;
    this.patDisplay.innerHTML = '';

    for (let i = 0; i < pat.length; i++) {
      const span = document.createElement('span');
      span.textContent = pat[i] === ' ' ? '\u00A0' : pat[i];
      span.className = 'str-char str-pat-char';

      if (i === activeIdx) {
        if (state === 'match')    span.classList.add('str-match');
        if (state === 'mismatch') span.classList.add('str-mismatch');
        if (state === 'jump')     span.classList.add('str-jump');
        if (state === 'found')    span.classList.add('str-found');
      } else if (i < activeIdx) {
        span.classList.add('str-comparing');
      }

      this.patDisplay.appendChild(span);
    }
  }

  _updateLPS() {
    if (!this.lpsDisplay) return;
    const pat = this.patInput?.value ?? '';
    if (this.algoKey !== 'kmp' || !pat) {
      this.lpsDisplay.innerHTML = '';
      return;
    }
    const lps = getLPS(pat);
    this.lpsDisplay.innerHTML =
      '<span style="font-size:.7rem;color:var(--text-muted);margin-right:.5rem">LPS:</span>' +
      lps.map((v, i) =>
        `<span class="lps-cell" title="${pat[i]}">${v}</span>`
      ).join('');
  }

  // ── Helpers ──────────────────────────────────────────────

  _resetStats() {
    this.statComp.textContent    = '0';
    this.statMatches.textContent = '0';
    this.statTime.textContent    = '0ms';
    this.statSize.textContent    = (this.textInput?.value?.length ?? 0) + ' chars';
  }

  _updateChips() {
    const map = { naive: 'O(nm)', kmp: 'O(n+m)' };
    if (this.chipComplex) this.chipComplex.textContent = map[this.algoKey] ?? '—';
  }

  _setStatus(s) {
    if (!this.chipStatus) return;
    this.chipStatus.textContent = s;
    this.chipStatus.style.color =
      s === 'running' ? 'var(--orange)' :
      s === 'done'    ? 'var(--green)'  :
      s === 'paused'  ? 'var(--blue)'   : 'var(--text-dim)';
  }
}