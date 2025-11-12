export default function AddFive({ setTime }) {
  
  const handleClick = () => {
    setTime((prev) => prev + 300)
  }
  
  return (
    <button className = "add-five" onClick={handleClick}>
      + 5 minutes
    </button>
  )
}