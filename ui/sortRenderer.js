// ui/sortRenderer.js
// Animates sorting steps by rendering bars into #viz-area.
// Completely decoupled from algorithm logic — just consumes steps[].

const SPEED_MAP = [500, 300, 200, 120, 80, 50, 30, 18, 10, 4]; // ms per step

export class SortRenderer {
  constructor() {
    this.vizArea     = document.getElementById('viz-area');
    this.btnPlay     = document.getElementById('btn-play');
    this.btnReset    = document.getElementById('btn-reset');
    this.btnGenerate = document.getElementById('btn-generate');
    this.statComp    = document.getElementById('stat-comparisons');
    this.statSwaps   = document.getElementById('stat-swaps');
    this.statSize    = document.getElementById('stat-size');
    this.statTime    = document.getElementById('stat-time');
    this.sliderSize  = document.getElementById('slider-size');
    this.sliderSpeed = document.getElementById('slider-speed');
    this.lblSize     = document.getElementById('lbl-size');
    this.lblSpeed    = document.getElementById('lbl-speed');
    this.chipStatus  = document.getElementById('chip-status');

    this.steps       = [];
    this.stepIdx     = 0;
    this.playing     = false;
    this.timer       = null;
    this.startTime   = null;
    this.array       = [];
    this.algoFn      = null;

    this._bindControls();
  }

  // ── Public API ───────────────────────────────────────

  // Load a new algorithm function and generate a fresh array
  load(algoFn) {
    this.algoFn = algoFn;
    this._stop();
    this._generate();
  }

  // ── Private ──────────────────────────────────────────

  _bindControls() {
    this.btnPlay.addEventListener('click', () => {
      if (this.playing) this._pause();
      else              this._play();
    });

    this.btnReset.addEventListener('click', () => {
      this._stop();
      this._renderStep(0);
    });

    this.btnGenerate.addEventListener('click', () => {
      this._stop();
      this._generate();
    });

    this.sliderSize.addEventListener('input', () => {
      this.lblSize.textContent = this.sliderSize.value;
      this.statSize.textContent = this.sliderSize.value;
      this._stop();
      this._generate();
    });

    this.sliderSpeed.addEventListener('input', () => {
      this.lblSpeed.textContent = this.sliderSpeed.value;
      // If currently playing, restart timer at new speed
      if (this.playing) {
        clearInterval(this.timer);
        this._startTimer();
      }
    });
  }

  _generate() {
    const n = parseInt(this.sliderSize.value);
    this.array = Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
    this.steps = this.algoFn ? this.algoFn(this.array) : [];
    this.stepIdx = 0;
    this._resetStats();
    this._renderBars(this.array, [], [], [], []);
    this._setStatus('idle');
  }

  _play() {
    if (!this.steps.length) return;
    // If we're at the end, restart
    if (this.stepIdx >= this.steps.length) {
      this.stepIdx = 0;
    }
    this.playing = true;
    this.startTime = this.startTime ?? Date.now();
    this.btnPlay.textContent = '⏸ Pause';
    this.btnPlay.classList.add('primary');
    this._setStatus('running');
    this._startTimer();
  }

  _pause() {
    this.playing = false;
    clearInterval(this.timer);
    this.btnPlay.textContent = '▶ Play';
    this._setStatus('paused');
  }

  _stop() {
    this.playing = false;
    clearInterval(this.timer);
    this.stepIdx  = 0;
    this.startTime = null;
    this.btnPlay.textContent = '▶ Play';
    this.btnPlay.classList.remove('primary');
    this._resetStats();
    this._setStatus('idle');
  }

  _startTimer() {
    const delay = SPEED_MAP[parseInt(this.sliderSpeed.value) - 1];
    this.timer = setInterval(() => this._tick(), delay);
  }

  _tick() {
    if (this.stepIdx >= this.steps.length) {
      this._pause();
      this._setStatus('done');
      this.statTime.textContent = (Date.now() - this.startTime) + 'ms';
      return;
    }
    this._renderStep(this.stepIdx++);
  }

  _renderStep(idx) {
    if (!this.steps.length) return;
    const s = this.steps[Math.min(idx, this.steps.length - 1)];
    this._renderBars(s.array, s.comparing, s.swapping, s.sorted, s.pivot ?? []);
    this.statComp.textContent  = s.comparisons;
    this.statSwaps.textContent = s.swaps;
    if (this.startTime) {
      this.statTime.textContent = (Date.now() - this.startTime) + 'ms';
    }
  }

  _renderBars(arr, comparing, swapping, sorted, pivot) {
    const n      = arr.length;
    const max    = Math.max(...arr);
    const compS  = new Set(comparing);
    const swapS  = new Set(swapping);
    const sortS  = new Set(sorted);
    const pivotS = new Set(pivot);

    // Reuse existing bar elements if count matches — avoids full DOM rebuild
    if (this.vizArea.children.length !== n) {
      this.vizArea.innerHTML = '';
      for (let i = 0; i < n; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        this.vizArea.appendChild(bar);
      }
    }

    const bars   = this.vizArea.children;
    const areaH  = this.vizArea.clientHeight || 300;

    for (let i = 0; i < n; i++) {
      const bar = bars[i];
      bar.style.height = ((arr[i] / max) * (areaH - 8)) + 'px';
      bar.className = 'bar'
        + (pivotS.has(i) ? ' pivot'     : '')
        + (compS.has(i)  ? ' comparing' : '')
        + (swapS.has(i)  ? ' swapping'  : '')
        + (sortS.has(i)  ? ' sorted'    : '');
    }
  }

  _resetStats() {
    this.statComp.textContent  = '0';
    this.statSwaps.textContent = '0';
    this.statTime.textContent  = '0ms';
    this.statSize.textContent  = this.sliderSize.value;
  }

  _setStatus(s) {
    this.chipStatus.textContent = s;
    this.chipStatus.style.color =
      s === 'running' ? 'var(--orange)' :
      s === 'done'    ? 'var(--green)'  :
      s === 'paused'  ? 'var(--blue)'   : 'var(--text-dim)';
  }
}