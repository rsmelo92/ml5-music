import { useEffect, useState } from 'react';
import ml5 from 'ml5';
import './App.css';

const MODEL_PATH = `${process.env.PUBLIC_URL}/model`;
const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const calculateNote = (frequency: number) => {
  // Magic calculation fetched from https://github.com/cwilso/PitchDetect/blob/4190bc705747fbb3f82eb465ea18a2dfb5873080/js/pitchdetect.js#L207-L212
  const noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2));
  const note = Math.round( noteNum ) + 69;
  return note;
}

function App() {
  const [audio, setAudio] = useState<MediaStream | null>();
  const [tab, setTab] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const mediaAudio = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      setAudio(mediaAudio);
    })();
  }, []);

  const onModelLoaded = () => {
    setIsLoading(false);
    getPitch();
  };

  const audioContext = new AudioContext();
  const pitch = audio && ml5.pitchDetection(
    MODEL_PATH, 
    audioContext,
    audio, 
    onModelLoaded
  );

  const getPitch = () => {
    pitch.getPitch((err: Error, frequency?: number) => {
      if (err) {
        console.warn({ err });
      }

      if (frequency) {
        const note = calculateNote(frequency);
        console.log(NOTE_STRINGS[note%12]);
        setTab(NOTE_STRINGS[note%12]);
      }

      getPitch();
    });
  }

  
  return (
    <div className="App">
      <header className="App-header">
        {isLoading && !tab ? (
          <div className="loader" />
        ) : (
          <p>Note {tab}</p>
        )}
      </header>
    </div>
  );
}

export default App;
