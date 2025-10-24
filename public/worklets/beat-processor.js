// Simple stereo sine generator with adjustable left/right frequencies
// Parameters: leftFreq (Hz), rightFreq (Hz), gain (0..1)

class BeatProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'leftFreq', defaultValue: 250, minValue: 0, maxValue: 20000, automationRate: 'k-rate' },
      { name: 'rightFreq', defaultValue: 260, minValue: 0, maxValue: 20000, automationRate: 'k-rate' },
      { name: 'gain', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  constructor(options) {
    super(options);
    this._phaseL = 0;
    this._phaseR = 0;
    this._sr = sampleRate;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (output.length < 2) return true;

    const left = output[0];
    const right = output[1];

    const leftFreq = parameters.leftFreq.length > 0 ? parameters.leftFreq[0] : 250;
    const rightFreq = parameters.rightFreq.length > 0 ? parameters.rightFreq[0] : 260;
    const gain = parameters.gain.length > 0 ? parameters.gain[0] : 0.5;

    const incL = 2 * Math.PI * leftFreq / this._sr;
    const incR = 2 * Math.PI * rightFreq / this._sr;

    for (let i = 0; i < left.length; i++) {
      left[i] = Math.sin(this._phaseL) * gain;
      right[i] = Math.sin(this._phaseR) * gain;
      this._phaseL += incL;
      this._phaseR += incR;
      if (this._phaseL > 2 * Math.PI) this._phaseL -= 2 * Math.PI;
      if (this._phaseR > 2 * Math.PI) this._phaseR -= 2 * Math.PI;
    }
    return true;
  }
}

registerProcessor('beat-processor', BeatProcessor);

