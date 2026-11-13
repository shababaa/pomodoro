import { FaVolumeHigh } from "react-icons/fa6";
import { IoVolumeMute } from "react-icons/io5";

export default function Header({ isSoundOn, setIsSoundOn }) {
  return (
    <button
      type="button"
      className="sound-toggle"
      aria-label={isSoundOn ? 'Mute sound' : 'Unmute sound'}
      aria-pressed={isSoundOn}
      onClick={() => setIsSoundOn((prev) => !prev)}
    >
      {isSoundOn ? <FaVolumeHigh size={18} /> : <IoVolumeMute size={18} />}
    </button>
  )
}
