import { useState, useEffect} from 'react';

export default function NavItem (props) {

    const [open, setOpen] = useState(false);

  return (
    <li className="nav-item">
        <a href = "#" className="icon-button" onClick={(e) => {
          e.preventDefault();
          setOpen(!open)
        }}>
            {props.icon}
        </a>

        {open && props.children}
    </li>
  )
}
