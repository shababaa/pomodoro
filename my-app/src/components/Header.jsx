import { FaBell, FaBellSlash } from "react-icons/fa6";

export default function Header({ isSoundOn, setIsSoundOn }) {
  return (
    <button
      type="button"
      className="sound-toggle"
      aria-label={isSoundOn ? 'Turn completion chime off' : 'Turn completion chime on'}
      aria-pressed={isSoundOn}
      title={isSoundOn ? 'Completion chime on' : 'Completion chime off'}
      onClick={() => setIsSoundOn((prev) => !prev)}
    >
      {isSoundOn ? <FaBell size={16} /> : <FaBellSlash size={16} />}
    </button>
  )
}
