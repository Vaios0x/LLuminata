import '@testing-library/jest-dom';
import 'jest-extended';
import 'whatwg-fetch';

// Mock global fetch
global.fetch = jest.fn();

// Configurar fake timers
jest.useFakeTimers();

// Configurar act para evitar warnings de React
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: An update to') ||
     args[0].includes('Warning: ReactDOM.render is deprecated'))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock de IndexedDB
const indexedDBMock = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};
global.indexedDB = indexedDBMock;

// Mock de Web Audio API
const audioContextMock = {
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn() },
  })),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn(),
  })),
  createAnalyser: jest.fn(() => ({
    connect: jest.fn(),
    frequencyBinCount: 256,
    getByteFrequencyData: jest.fn(),
  })),
  decodeAudioData: jest.fn(),
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  })),
  destination: {},
};
global.AudioContext = jest.fn(() => audioContextMock);
global.webkitAudioContext = global.AudioContext;

// Mock de Speech Recognition API
const speechRecognitionMock = jest.fn(() => ({
  continuous: false,
  interimResults: false,
  lang: 'es-MX',
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));
global.SpeechRecognition = speechRecognitionMock;
global.webkitSpeechRecognition = speechRecognitionMock;

// Mock de MediaDevices API
const mediaDevicesMock = {
  getUserMedia: jest.fn(() => Promise.resolve({})),
  enumerateDevices: jest.fn(() => Promise.resolve([])),
};
global.navigator.mediaDevices = mediaDevicesMock;

// Mock de Service Worker API
const serviceWorkerMock = {
  register: jest.fn(() => Promise.resolve({})),
  ready: Promise.resolve({}),
  controller: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
global.navigator.serviceWorker = serviceWorkerMock;

// Mock de PWA APIs
global.window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock de Intersection Observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de Resize Observer
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de Mutation Observer
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de Canvas API
const canvasMock = {
  getContext: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Array(4) })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  })),
  toDataURL: jest.fn(() => 'data:image/png;base64,test'),
  width: 100,
  height: 100,
};
global.HTMLCanvasElement.prototype.getContext = canvasMock.getContext;
global.HTMLCanvasElement.prototype.toDataURL = canvasMock.toDataURL;

// Mock de WebGL
const webGLMock = {
  createBuffer: jest.fn(),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  createShader: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  getAttribLocation: jest.fn(),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  drawArrays: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn(),
  viewport: jest.fn(),
};
global.WebGLRenderingContext = jest.fn(() => webGLMock);

// Mock de TensorFlow.js
global.tf = {
  tensor: jest.fn(),
  loadLayersModel: jest.fn(),
  ready: jest.fn(),
  tidy: jest.fn(),
  dispose: jest.fn(),
};

// Configurar console.warn para suprimir warnings específicos
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('componentWillReceiveProps') ||
     args[0].includes('componentWillUpdate'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Configurar timeouts para tests
jest.setTimeout(30000);

// Mock de fetch global
global.fetch = jest.fn();

// Mock de URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock de crypto API
global.crypto = {
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  subtle: {
    digest: jest.fn(),
    generateKey: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  },
};

// Mock de performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock de requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();



// Configurar environment variables para tests
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.DATABASE_URL = 'file:./test.db';
