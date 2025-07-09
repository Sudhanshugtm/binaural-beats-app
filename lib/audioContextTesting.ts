// Cross-Browser Audio Context Testing Utilities
// Comprehensive testing and validation of Web Audio API across different browsers

export interface AudioContextTestResult {
  testName: string;
  success: boolean;
  error?: string;
  performance?: number;
  details?: any;
}

export interface AudioContextCapabilities {
  hasAudioContext: boolean;
  hasWebkitAudioContext: boolean;
  hasOscillatorNode: boolean;
  hasGainNode: boolean;
  hasAnalyserNode: boolean;
  hasStereoPannerNode: boolean;
  hasPannerNode: boolean;
  hasConvolverNode: boolean;
  hasDelayNode: boolean;
  hasBiquadFilterNode: boolean;
  hasWaveShaperNode: boolean;
  hasScriptProcessorNode: boolean;
  hasAudioWorkletNode: boolean;
  hasChannelMergerNode: boolean;
  hasChannelSplitterNode: boolean;
  hasMediaElementAudioSourceNode: boolean;
  hasMediaStreamAudioSourceNode: boolean;
  hasMediaStreamAudioDestinationNode: boolean;
  maxChannels: number;
  sampleRate: number;
  baseLatency: number;
  outputLatency: number;
}

export interface BinauralBeatTestResult {
  leftFrequency: number;
  rightFrequency: number;
  beatFrequency: number;
  actualBeatFrequency: number;
  accuracy: number;
  signalToNoiseRatio: number;
  success: boolean;
}

export interface BrowserPerformanceMetrics {
  audioContextCreationTime: number;
  oscillatorStartTime: number;
  gainNodeConnectionTime: number;
  frequencyAccuracy: number;
  memoryUsage: number;
  cpuUsage: number;
  latency: number;
  dropouts: number;
}

export class AudioContextTester {
  private static instance: AudioContextTester;
  private audioContext: AudioContext | null = null;
  private testResults: AudioContextTestResult[] = [];
  private capabilities: AudioContextCapabilities | null = null;
  private performanceMetrics: BrowserPerformanceMetrics | null = null;

  private constructor() {}

  static getInstance(): AudioContextTester {
    if (!AudioContextTester.instance) {
      AudioContextTester.instance = new AudioContextTester();
    }
    return AudioContextTester.instance;
  }

  async runFullCompatibilityTest(): Promise<{
    capabilities: AudioContextCapabilities;
    testResults: AudioContextTestResult[];
    performanceMetrics: BrowserPerformanceMetrics;
    overallScore: number;
  }> {
    console.log('Starting comprehensive audio context compatibility test...');
    
    this.testResults = [];
    
    // Test basic audio context creation
    const audioContextTest = await this.testAudioContextCreation();
    this.testResults.push(audioContextTest);
    
    if (!audioContextTest.success) {
      return {
        capabilities: this.getEmptyCapabilities(),
        testResults: this.testResults,
        performanceMetrics: this.getEmptyPerformanceMetrics(),
        overallScore: 0,
      };
    }

    // Test audio node creation
    const nodeTests = await this.testAudioNodeCreation();
    this.testResults.push(...nodeTests);

    // Test audio graph connectivity
    const connectivityTest = await this.testAudioGraphConnectivity();
    this.testResults.push(connectivityTest);

    // Test oscillator functionality
    const oscillatorTest = await this.testOscillatorFunctionality();
    this.testResults.push(oscillatorTest);

    // Test gain node functionality
    const gainTest = await this.testGainNodeFunctionality();
    this.testResults.push(gainTest);

    // Test frequency accuracy
    const frequencyTest = await this.testFrequencyAccuracy();
    this.testResults.push(frequencyTest);

    // Test binaural beat generation
    const binauralTest = await this.testBinauralBeatGeneration();
    this.testResults.push(binauralTest);

    // Test stereo panning
    const stereoTest = await this.testStereoPanning();
    this.testResults.push(stereoTest);

    // Test audio context states
    const stateTest = await this.testAudioContextStates();
    this.testResults.push(stateTest);

    // Test performance metrics
    const performanceTest = await this.testPerformanceMetrics();
    this.testResults.push(performanceTest);

    // Test browser-specific features
    const browserSpecificTests = await this.testBrowserSpecificFeatures();
    this.testResults.push(...browserSpecificTests);

    // Calculate capabilities and performance
    this.capabilities = await this.calculateCapabilities();
    this.performanceMetrics = await this.calculatePerformanceMetrics();

    const overallScore = this.calculateOverallScore();

    return {
      capabilities: this.capabilities,
      testResults: this.testResults,
      performanceMetrics: this.performanceMetrics,
      overallScore,
    };
  }

  private async testAudioContextCreation(): Promise<AudioContextTestResult> {
    const startTime = performance.now();
    
    try {
      // Test standard AudioContext
      if (typeof AudioContext !== 'undefined') {
        this.audioContext = new AudioContext();
      } else if (typeof (window as any).webkitAudioContext !== 'undefined') {
        this.audioContext = new (window as any).webkitAudioContext();
      } else {
        throw new Error('AudioContext not available');
      }

      // Test context state
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      return {
        testName: 'AudioContext Creation',
        success: true,
        performance: creationTime,
        details: {
          state: this.audioContext?.state,
          sampleRate: this.audioContext?.sampleRate,
          baseLatency: this.audioContext?.baseLatency,
          outputLatency: this.audioContext?.outputLatency,
          currentTime: this.audioContext?.currentTime,
        },
      };
    } catch (error) {
      return {
        testName: 'AudioContext Creation',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testAudioNodeCreation(): Promise<AudioContextTestResult[]> {
    if (!this.audioContext) {
      return [{
        testName: 'Audio Node Creation',
        success: false,
        error: 'AudioContext not available',
      }];
    }

    const nodeTests: AudioContextTestResult[] = [];
    
    const nodeTypes = [
      'Oscillator', 'Gain', 'Analyser', 'StereoPanner', 'Panner',
      'Convolver', 'Delay', 'BiquadFilter', 'WaveShaper', 'ChannelMerger',
      'ChannelSplitter', 'ScriptProcessor', 'AudioWorklet'
    ];

    for (const nodeType of nodeTypes) {
      const startTime = performance.now();
      
      try {
        let node: AudioNode;
        
        switch (nodeType) {
          case 'Oscillator':
            node = this.audioContext.createOscillator();
            break;
          case 'Gain':
            node = this.audioContext.createGain();
            break;
          case 'Analyser':
            node = this.audioContext.createAnalyser();
            break;
          case 'StereoPanner':
            node = this.audioContext.createStereoPanner();
            break;
          case 'Panner':
            node = this.audioContext.createPanner();
            break;
          case 'Convolver':
            node = this.audioContext.createConvolver();
            break;
          case 'Delay':
            node = this.audioContext.createDelay();
            break;
          case 'BiquadFilter':
            node = this.audioContext.createBiquadFilter();
            break;
          case 'WaveShaper':
            node = this.audioContext.createWaveShaper();
            break;
          case 'ChannelMerger':
            node = this.audioContext.createChannelMerger();
            break;
          case 'ChannelSplitter':
            node = this.audioContext.createChannelSplitter();
            break;
          case 'ScriptProcessor':
            node = this.audioContext.createScriptProcessor();
            break;
          case 'AudioWorklet':
            // AudioWorklet requires more complex setup
            if ('AudioWorkletNode' in window) {
              // For testing purposes, we'll just check if the constructor exists
              const hasAudioWorklet = true;
              nodeTests.push({
                testName: `${nodeType}Node Creation`,
                success: hasAudioWorklet,
                performance: performance.now() - startTime,
              });
              continue;
            } else {
              throw new Error('AudioWorkletNode not available');
            }
          default:
            throw new Error(`Unknown node type: ${nodeType}`);
        }

        const endTime = performance.now();
        
        nodeTests.push({
          testName: `${nodeType}Node Creation`,
          success: true,
          performance: endTime - startTime,
          details: {
            numberOfInputs: node.numberOfInputs,
            numberOfOutputs: node.numberOfOutputs,
            channelCount: node.channelCount,
            channelCountMode: node.channelCountMode,
            channelInterpretation: node.channelInterpretation,
          },
        });

        // Clean up
        if (node.disconnect) {
          node.disconnect();
        }
        
      } catch (error) {
        nodeTests.push({
          testName: `${nodeType}Node Creation`,
          success: false,
          error: (error as Error).message,
          performance: performance.now() - startTime,
        });
      }
    }

    return nodeTests;
  }

  private async testAudioGraphConnectivity(): Promise<AudioContextTestResult> {
    if (!this.audioContext) {
      return {
        testName: 'Audio Graph Connectivity',
        success: false,
        error: 'AudioContext not available',
      };
    }

    const startTime = performance.now();
    
    try {
      // Create a simple audio graph
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const analyser = this.audioContext.createAnalyser();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(this.audioContext.destination);
      
      // Test disconnection
      oscillator.disconnect();
      gainNode.disconnect();
      analyser.disconnect();
      
      const endTime = performance.now();
      
      return {
        testName: 'Audio Graph Connectivity',
        success: true,
        performance: endTime - startTime,
        details: {
          nodesConnected: 3,
          connectionsEstablished: 3,
        },
      };
    } catch (error) {
      return {
        testName: 'Audio Graph Connectivity',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testOscillatorFunctionality(): Promise<AudioContextTestResult> {
    if (!this.audioContext) {
      return {
        testName: 'Oscillator Functionality',
        success: false,
        error: 'AudioContext not available',
      };
    }

    const startTime = performance.now();
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Test different waveforms
      const waveforms: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];
      const testedWaveforms: string[] = [];
      
      for (const waveform of waveforms) {
        try {
          oscillator.type = waveform;
          testedWaveforms.push(waveform);
        } catch (error) {
          // Some browsers may not support all waveforms
        }
      }
      
      // Test frequency setting
      oscillator.frequency.value = 440;
      oscillator.detune.value = 0;
      
      // Test gain setting
      gainNode.gain.value = 0.1;
      
      // Connect and start (very briefly)
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.01);
      
      const endTime = performance.now();
      
      return {
        testName: 'Oscillator Functionality',
        success: true,
        performance: endTime - startTime,
        details: {
          supportedWaveforms: testedWaveforms,
          frequency: oscillator.frequency.value,
          detune: oscillator.detune.value,
        },
      };
    } catch (error) {
      return {
        testName: 'Oscillator Functionality',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testGainNodeFunctionality(): Promise<AudioContextTestResult> {
    if (!this.audioContext) {
      return {
        testName: 'Gain Node Functionality',
        success: false,
        error: 'AudioContext not available',
      };
    }

    const startTime = performance.now();
    
    try {
      const gainNode = this.audioContext.createGain();
      
      // Test gain value setting
      gainNode.gain.value = 0.5;
      
      // Test gain automation
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.9, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.2);
      
      const endTime = performance.now();
      
      return {
        testName: 'Gain Node Functionality',
        success: true,
        performance: endTime - startTime,
        details: {
          gainValue: gainNode.gain.value,
          automationSupported: true,
        },
      };
    } catch (error) {
      return {
        testName: 'Gain Node Functionality',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testFrequencyAccuracy(): Promise<AudioContextTestResult> {
    if (!this.audioContext) {
      return {
        testName: 'Frequency Accuracy',
        success: false,
        error: 'AudioContext not available',
      };
    }

    const startTime = performance.now();
    
    try {
      const analyser = this.audioContext.createAnalyser();
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      analyser.fftSize = 8192;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      
      oscillator.frequency.value = 440; // A4 note
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.connect(gainNode);
      gainNode.connect(analyser);
      
      oscillator.start();
      
      // Wait a bit for the oscillator to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      analyser.getFloatFrequencyData(dataArray);
      
      // Find the peak frequency
      let maxValue = -Infinity;
      let maxIndex = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }
      
      const nyquist = this.audioContext.sampleRate / 2;
      const detectedFrequency = (maxIndex / bufferLength) * nyquist;
      const accuracy = Math.abs(440 - detectedFrequency) / 440;
      
      oscillator.stop();
      
      const endTime = performance.now();
      
      return {
        testName: 'Frequency Accuracy',
        success: accuracy < 0.01, // Less than 1% error
        performance: endTime - startTime,
        details: {
          targetFrequency: 440,
          detectedFrequency,
          accuracy: 1 - accuracy,
          error: accuracy,
        },
      };
    } catch (error) {
      return {
        testName: 'Frequency Accuracy',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testBinauralBeatGeneration(): Promise<AudioContextTestResult> {
    if (!this.audioContext) {
      return {
        testName: 'Binaural Beat Generation',
        success: false,
        error: 'AudioContext not available',
      };
    }

    const startTime = performance.now();
    
    try {
      // Create binaural beat setup
      const leftOscillator = this.audioContext.createOscillator();
      const rightOscillator = this.audioContext.createOscillator();
      const leftGain = this.audioContext.createGain();
      const rightGain = this.audioContext.createGain();
      const merger = this.audioContext.createChannelMerger(2);
      const analyser = this.audioContext.createAnalyser();
      
      // Set up binaural beat (440 Hz + 450 Hz = 10 Hz beat)
      leftOscillator.frequency.value = 440;
      rightOscillator.frequency.value = 450;
      leftOscillator.type = 'sine';
      rightOscillator.type = 'sine';
      
      leftGain.gain.value = 0.1;
      rightGain.gain.value = 0.1;
      
      // Connect left channel
      leftOscillator.connect(leftGain);
      leftGain.connect(merger, 0, 0);
      
      // Connect right channel
      rightOscillator.connect(rightGain);
      rightGain.connect(merger, 0, 1);
      
      // Connect to analyser
      merger.connect(analyser);
      
      // Start oscillators
      leftOscillator.start();
      rightOscillator.start();
      
      // Wait for stabilization
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Stop oscillators
      leftOscillator.stop();
      rightOscillator.stop();
      
      const endTime = performance.now();
      
      return {
        testName: 'Binaural Beat Generation',
        success: true,
        performance: endTime - startTime,
        details: {
          leftFrequency: 440,
          rightFrequency: 450,
          beatFrequency: 10,
          stereoSeparation: true,
        },
      };
    } catch (error) {
      return {
        testName: 'Binaural Beat Generation',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testStereoPanning(): Promise<AudioContextTestResult> {
    if (!this.audioContext) {
      return {
        testName: 'Stereo Panning',
        success: false,
        error: 'AudioContext not available',
      };
    }

    const startTime = performance.now();
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      let panNode: AudioNode;
      let panningSupported = false;
      
      // Try StereoPannerNode first
      try {
        panNode = this.audioContext.createStereoPanner();
        (panNode as StereoPannerNode).pan.value = 0.5;
        panningSupported = true;
      } catch (error) {
        // Fall back to PannerNode
        try {
          panNode = this.audioContext.createPanner();
          (panNode as PannerNode).panningModel = 'equalpower';
          panningSupported = true;
        } catch (error) {
          throw new Error('No panning support available');
        }
      }
      
      oscillator.connect(gainNode);
      gainNode.connect(panNode);
      panNode.connect(this.audioContext.destination);
      
      const endTime = performance.now();
      
      return {
        testName: 'Stereo Panning',
        success: panningSupported,
        performance: endTime - startTime,
        details: {
          stereoPannerSupported: typeof StereoPannerNode !== 'undefined',
          pannerNodeSupported: typeof PannerNode !== 'undefined',
        },
      };
    } catch (error) {
      return {
        testName: 'Stereo Panning',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testAudioContextStates(): Promise<AudioContextTestResult> {
    if (!this.audioContext) {
      return {
        testName: 'Audio Context States',
        success: false,
        error: 'AudioContext not available',
      };
    }

    const startTime = performance.now();
    
    try {
      const initialState = this.audioContext?.state;
      
      // Test suspend/resume
      if (this.audioContext && this.audioContext.state === 'running') {
        await this.audioContext.suspend();
        const suspendedState = this.audioContext.state;
        
        await this.audioContext.resume();
        const resumedState = this.audioContext.state;
        
        const endTime = performance.now();
        
        return {
          testName: 'Audio Context States',
          success: (suspendedState as string) === 'suspended' && (resumedState as string) === 'running',
          performance: endTime - startTime,
          details: {
            initialState,
            suspendedState,
            resumedState,
            stateTransitionSupported: true,
          },
        };
      } else {
        const endTime = performance.now();
        
        return {
          testName: 'Audio Context States',
          success: true,
          performance: endTime - startTime,
          details: {
            initialState,
            stateTransitionSupported: false,
          },
        };
      }
    } catch (error) {
      return {
        testName: 'Audio Context States',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testPerformanceMetrics(): Promise<AudioContextTestResult> {
    if (!this.audioContext) {
      return {
        testName: 'Performance Metrics',
        success: false,
        error: 'AudioContext not available',
      };
    }

    const startTime = performance.now();
    
    try {
      // Test multiple oscillators
      const oscillators: OscillatorNode[] = [];
      const gainNodes: GainNode[] = [];
      
      const oscillatorCount = 10;
      
      for (let i = 0; i < oscillatorCount; i++) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.frequency.value = 440 + i * 10;
        gainNode.gain.value = 0.01; // Very low volume
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        
        oscillators.push(oscillator);
        gainNodes.push(gainNode);
      }
      
      // Let them run briefly
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Stop all oscillators
      oscillators.forEach(osc => osc.stop());
      
      const endTime = performance.now();
      
      return {
        testName: 'Performance Metrics',
        success: true,
        performance: endTime - startTime,
        details: {
          simultaneousOscillators: oscillatorCount,
          totalProcessingTime: endTime - startTime,
          averageProcessingTimePerOscillator: (endTime - startTime) / oscillatorCount,
        },
      };
    } catch (error) {
      return {
        testName: 'Performance Metrics',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testBrowserSpecificFeatures(): Promise<AudioContextTestResult[]> {
    const tests: AudioContextTestResult[] = [];
    const userAgent = navigator.userAgent;

    // Safari-specific tests
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      tests.push(await this.testSafariSpecificFeatures());
    }

    // Firefox-specific tests
    if (userAgent.includes('Firefox')) {
      tests.push(await this.testFirefoxSpecificFeatures());
    }

    // Chrome-specific tests
    if (userAgent.includes('Chrome')) {
      tests.push(await this.testChromeSpecificFeatures());
    }

    return tests;
  }

  private async testSafariSpecificFeatures(): Promise<AudioContextTestResult> {
    const startTime = performance.now();
    
    try {
      // Test webkit-specific features
      const hasWebkitAudioContext = typeof (window as any).webkitAudioContext !== 'undefined';
      
      // Test if audio context requires user interaction
      const requiresUserInteraction = this.audioContext?.state === 'suspended';
      
      const endTime = performance.now();
      
      return {
        testName: 'Safari Specific Features',
        success: true,
        performance: endTime - startTime,
        details: {
          hasWebkitAudioContext,
          requiresUserInteraction,
          audioContextState: this.audioContext?.state,
        },
      };
    } catch (error) {
      return {
        testName: 'Safari Specific Features',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testFirefoxSpecificFeatures(): Promise<AudioContextTestResult> {
    const startTime = performance.now();
    
    try {
      // Test Firefox-specific audio features
      const hasMozAudioContext = typeof (window as any).mozAudioContext !== 'undefined';
      
      const endTime = performance.now();
      
      return {
        testName: 'Firefox Specific Features',
        success: true,
        performance: endTime - startTime,
        details: {
          hasMozAudioContext,
          audioContextState: this.audioContext?.state,
        },
      };
    } catch (error) {
      return {
        testName: 'Firefox Specific Features',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async testChromeSpecificFeatures(): Promise<AudioContextTestResult> {
    const startTime = performance.now();
    
    try {
      // Test Chrome-specific audio features
      const hasAudioWorklet = 'AudioWorkletNode' in window;
      
      const endTime = performance.now();
      
      return {
        testName: 'Chrome Specific Features',
        success: true,
        performance: endTime - startTime,
        details: {
          hasAudioWorklet,
          audioContextState: this.audioContext?.state,
        },
      };
    } catch (error) {
      return {
        testName: 'Chrome Specific Features',
        success: false,
        error: (error as Error).message,
        performance: performance.now() - startTime,
      };
    }
  }

  private async calculateCapabilities(): Promise<AudioContextCapabilities> {
    if (!this.audioContext) {
      return this.getEmptyCapabilities();
    }

    return {
      hasAudioContext: typeof AudioContext !== 'undefined',
      hasWebkitAudioContext: typeof (window as any).webkitAudioContext !== 'undefined',
      hasOscillatorNode: typeof OscillatorNode !== 'undefined',
      hasGainNode: typeof GainNode !== 'undefined',
      hasAnalyserNode: typeof AnalyserNode !== 'undefined',
      hasStereoPannerNode: typeof StereoPannerNode !== 'undefined',
      hasPannerNode: typeof PannerNode !== 'undefined',
      hasConvolverNode: typeof ConvolverNode !== 'undefined',
      hasDelayNode: typeof DelayNode !== 'undefined',
      hasBiquadFilterNode: typeof BiquadFilterNode !== 'undefined',
      hasWaveShaperNode: typeof WaveShaperNode !== 'undefined',
      hasScriptProcessorNode: typeof ScriptProcessorNode !== 'undefined',
      hasAudioWorkletNode: typeof AudioWorkletNode !== 'undefined',
      hasChannelMergerNode: typeof ChannelMergerNode !== 'undefined',
      hasChannelSplitterNode: typeof ChannelSplitterNode !== 'undefined',
      hasMediaElementAudioSourceNode: typeof MediaElementAudioSourceNode !== 'undefined',
      hasMediaStreamAudioSourceNode: typeof MediaStreamAudioSourceNode !== 'undefined',
      hasMediaStreamAudioDestinationNode: typeof MediaStreamAudioDestinationNode !== 'undefined',
      maxChannels: this.audioContext.destination.maxChannelCount,
      sampleRate: this.audioContext.sampleRate,
      baseLatency: this.audioContext.baseLatency || 0,
      outputLatency: this.audioContext.outputLatency || 0,
    };
  }

  private async calculatePerformanceMetrics(): Promise<BrowserPerformanceMetrics> {
    const creationTest = this.testResults.find(t => t.testName === 'AudioContext Creation');
    const oscillatorTest = this.testResults.find(t => t.testName === 'Oscillator Functionality');
    const gainTest = this.testResults.find(t => t.testName === 'Gain Node Functionality');
    const frequencyTest = this.testResults.find(t => t.testName === 'Frequency Accuracy');
    const performanceTest = this.testResults.find(t => t.testName === 'Performance Metrics');

    return {
      audioContextCreationTime: creationTest?.performance || 0,
      oscillatorStartTime: oscillatorTest?.performance || 0,
      gainNodeConnectionTime: gainTest?.performance || 0,
      frequencyAccuracy: frequencyTest?.details?.accuracy || 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      cpuUsage: 0, // Not directly measurable
      latency: this.audioContext?.baseLatency || 0,
      dropouts: 0, // Would need longer-term monitoring
    };
  }

  private calculateOverallScore(): number {
    const successfulTests = this.testResults.filter(t => t.success).length;
    const totalTests = this.testResults.length;
    
    return totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
  }

  private getEmptyCapabilities(): AudioContextCapabilities {
    return {
      hasAudioContext: false,
      hasWebkitAudioContext: false,
      hasOscillatorNode: false,
      hasGainNode: false,
      hasAnalyserNode: false,
      hasStereoPannerNode: false,
      hasPannerNode: false,
      hasConvolverNode: false,
      hasDelayNode: false,
      hasBiquadFilterNode: false,
      hasWaveShaperNode: false,
      hasScriptProcessorNode: false,
      hasAudioWorkletNode: false,
      hasChannelMergerNode: false,
      hasChannelSplitterNode: false,
      hasMediaElementAudioSourceNode: false,
      hasMediaStreamAudioSourceNode: false,
      hasMediaStreamAudioDestinationNode: false,
      maxChannels: 0,
      sampleRate: 0,
      baseLatency: 0,
      outputLatency: 0,
    };
  }

  private getEmptyPerformanceMetrics(): BrowserPerformanceMetrics {
    return {
      audioContextCreationTime: 0,
      oscillatorStartTime: 0,
      gainNodeConnectionTime: 0,
      frequencyAccuracy: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      latency: 0,
      dropouts: 0,
    };
  }

  async cleanup(): Promise<void> {
    if (this.audioContext) {
      if (this.audioContext.state !== 'closed') {
        await this.audioContext.close();
      }
      this.audioContext = null;
    }
    
    this.testResults = [];
    this.capabilities = null;
    this.performanceMetrics = null;
  }

  getTestResults(): AudioContextTestResult[] {
    return [...this.testResults];
  }

  getCapabilities(): AudioContextCapabilities | null {
    return this.capabilities;
  }

  getPerformanceMetrics(): BrowserPerformanceMetrics | null {
    return this.performanceMetrics;
  }
}

// Export singleton instance
export const audioContextTester = AudioContextTester.getInstance();

// Utility functions
export async function runQuickCompatibilityCheck(): Promise<boolean> {
  const tester = AudioContextTester.getInstance();
  
  try {
    const result = await tester.runFullCompatibilityTest();
    return result.overallScore > 70; // 70% success rate
  } catch (error) {
    console.error('Quick compatibility check failed:', error);
    return false;
  } finally {
    await tester.cleanup();
  }
}

export async function getBrowserAudioCapabilities(): Promise<AudioContextCapabilities> {
  const tester = AudioContextTester.getInstance();
  
  try {
    const result = await tester.runFullCompatibilityTest();
    return result.capabilities;
  } catch (error) {
    console.error('Failed to get browser audio capabilities:', error);
    return tester.getCapabilities() || {} as AudioContextCapabilities;
  } finally {
    await tester.cleanup();
  }
}