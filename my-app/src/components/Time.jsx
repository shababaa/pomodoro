import { useEffect, useState } from 'react';
import '../App.css';

export default function Time({ time, isRunning, onStart }) {
  // local inputs
  const [t, setT] = useState({ h: '0', m: '00', s: '00' });

  // When not running, keep inputs in sync with the current time
  useEffect(() => {
    if (isRunning) return;
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    setT({ h: String(h), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') });
  }, [time, isRunning]);

  const onChange = (e) => {
    const { name, value } = e.target;
    const digits = value.replace(/\D/g, '');
    if (name === 'h') {
      setT(p => ({ ...p, h: digits === '' ? '0' : String(Number(digits)).slice(0, 3) }));
    } else {
      const v = String(Math.min(59, Number(digits || 0))).padStart(2, '0');
      setT(p => ({ ...p, [name]: v }));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const h = Number(t.h) || 0, m = Math.min(59, Number(t.m) || 0), s = Math.min(59, Number(t.s) || 0);
    const total = h * 3600 + m * 60 + s;
    if (total > 0) onStart?.(total);
  };

  // formatted live display
  const hh = Math.floor(time / 3600);
  const mm = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
  const ss = String(time % 60).padStart(2, '0');

  return (
    <div className='time-form'>
      {isRunning ? (
        // SAME SPOT: show ticking display while running
        <div className='show-time'>
          <h1 className='hours-o'>{hh}</h1>
          <h1 className='minutes-o'>:{mm}:</h1>
          <h1 className='seconds-o'> {ss}</h1>
        </div>
      ) : (
        // SAME SPOT: show inputs when not running
        <form onSubmit={submit}>
          <div className='time'>
            <input
              className='hours' name='h' id='time-hours' placeholder='0' maxLength={2}
              inputMode='numeric' value={t.h} onChange={onChange}
            />:
            <input
              className='minutes' name='m' id='time-minutes' placeholder='00' maxLength={2}
              inputMode='numeric' value={t.m} onChange={onChange}
            />:
            <input
              className='seconds' name='s' id='time-seconds' placeholder='00' maxLength={2}
              inputMode='numeric' value={t.s} onChange={onChange}
            />
          </div>
          <div className='button-container'>
            <button className='time-button'>Begin</button>
          </div>
        </form>
      )}
    </div>
  );
}
