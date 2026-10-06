// Wave Music · FORMA DE ONDA
// Decodes the audio once and keeps an energy envelope (RMS per bucket),
// so the manual-adjust strip can show where the voice starts.
(function (WM) {
  /**
   * @returns {Promise<{ peaks: Float32Array, perSecond: number, duration: number }>}
   */
  async function computePeaks(arrayBuffer, perSecond = 200) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    try {
      const buf = await ctx.decodeAudioData(arrayBuffer);
      const n = Math.ceil(buf.duration * perSecond);
      const size = buf.sampleRate / perSecond;
      // RMS energy per bucket (not raw peaks): a loud, compressed master
      // has peaks near full scale everywhere, while RMS still shows where
      // the singing starts and stops.
      const sum = new Float64Array(n);
      for (let c = 0; c < buf.numberOfChannels; c++) {
        const data = buf.getChannelData(c);
        for (let i = 0; i < n; i++) {
          const from = Math.floor(i * size);
          const to = Math.min(data.length, Math.floor((i + 1) * size));
          let acc = 0;
          for (let j = from; j < to; j++) acc += data[j] * data[j];
          sum[i] += to > from ? acc / (to - from) : 0;
        }
      }
      const peaks = new Float32Array(n);
      for (let i = 0; i < n; i++) peaks[i] = Math.sqrt(sum[i] / buf.numberOfChannels);
      // Normalise to the loud end (98th percentile) and expand contrast.
      const sorted = Array.from(peaks).sort((a, b) => a - b);
      const ref = sorted[Math.floor(sorted.length * 0.98)] || 1;
      for (let i = 0; i < n; i++) peaks[i] = Math.pow(Math.min(1, peaks[i] / ref), 1.6);
      return { peaks, perSecond, duration: buf.duration };
    } finally {
      ctx.close && ctx.close();
    }
  }

  WM.Waveform = { computePeaks };
})((window.WaveMusic = window.WaveMusic || {}));
