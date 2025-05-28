export const createAudioContext = (): AudioContext => {
  return new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
};

export const playMorseCodeWithFrequency = (
  text: string,
  audioContext: AudioContext,
  wpm: number = 20,
  frequency: number = 700,
  startTime: number = audioContext.currentTime
) => {
  const MORSE_CODE_MAP: { [key: string]: string } = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
    'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.',
    '-': '-....-', '(': '-.--.', ')': '-.--.-', '&': '.-...',
    ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  };

  const dotDuration = 1.2 / wpm; // ドットの長さ (秒)
  const dashDuration = dotDuration * 3; // ダッシュの長さ (秒)
  const elementSpace = dotDuration; // 要素間のスペース
  const charSpace = dotDuration * 3; // 文字間のスペース
  const wordSpace = dotDuration * 7; // 単語間のスペース

  let currentTime = startTime;

  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    const morse = MORSE_CODE_MAP[char];

    if (morse) {
      for (let j = 0; j < morse.length; j++) {
        const signal = morse[j];
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, currentTime); // 周波数設定

        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.01); // 音の立ち上がり

        if (signal === '.') {
          gainNode.gain.linearRampToValueAtTime(0.2, currentTime + dotDuration - 0.01);
          gainNode.gain.linearRampToValueAtTime(0, currentTime + dotDuration); // 音の立ち下がり
          oscillator.start(currentTime);
          oscillator.stop(currentTime + dotDuration);
          currentTime += dotDuration;
        } else if (signal === '-') {
          gainNode.gain.linearRampToValueAtTime(0.2, currentTime + dashDuration - 0.01);
          gainNode.gain.linearRampToValueAtTime(0, currentTime + dashDuration);
          oscillator.start(currentTime);
          oscillator.stop(currentTime + dashDuration);
          currentTime += dashDuration;
        }
        currentTime += elementSpace; // 要素間のスペース
      }
      currentTime += charSpace - elementSpace; // 文字間のスペース (最後の要素スペースを差し引く)
    } else if (char === ' ') {
      currentTime += wordSpace; // 単語間のスペース
    }
  }
  return currentTime; // Return the end time of this Morse code playback
};

export const playBackgroundNoise = (audioContext: AudioContext) => {
  const bufferSize = audioContext.sampleRate * 2; // 2 seconds of noise
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1; // White noise
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true; // Loop the noise

  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, audioContext.currentTime); // Center frequency (200 + 3000) / 2
  filter.Q.setValueAtTime(10, audioContext.currentTime); // Q factor for bandwidth

  source.connect(filter);
  filter.connect(audioContext.destination);
  source.start();
};

export const generateCallsign = (length: number = 5): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'; // Include numbers for callsigns
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
