import { Link } from 'react-router-dom'
import { useCartCount } from '../hooks/useCart'

export default function Layout({ children }: { children: React.ReactNode }) {
  const count = useCartCount()
  return (
    <>
      <header style={headerStyle}>
        <Link to="/" style={logoStyle}>Serverless Shop</Link>
        <nav style={navStyle}>
          <Link to="/" style={navLinkStyle}>Products</Link>
          <Link to="/cart" style={navLinkStyle}>
            Cart {count > 0 && `(${count})`}
          </Link>
        </nav>
      </header>
      <main style={mainStyle}>{children}</main>
    </>
  )
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 2rem',
  backgroundColor: '#1a1a1a',
  color: '#fff',
}

const logoStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#fff',
  textDecoration: 'none',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
}

const navLinkStyle: React.CSSProperties = {
  color: '#e5e5e5',
  textDecoration: 'none',
}

const mainStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '2rem',
}
