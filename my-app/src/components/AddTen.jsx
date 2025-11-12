export default function AddTen({ setTime }) {
  
  const handleClick = () => {
    setTime((prev) => prev + 600)
  }
  
  return (
    <button className = "add-ten" onClick={handleClick}>
      + 10 minutes
    </button>
  )
}