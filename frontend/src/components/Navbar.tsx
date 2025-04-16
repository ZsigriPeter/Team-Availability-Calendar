// components/Navbar.tsx
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav className="bg-gray-100 p-4 shadow-md mb-4 flex gap-4">
      <Link to="/">Home</Link>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
      <Link to="/events">Availability</Link>
    </nav>
  )
}
