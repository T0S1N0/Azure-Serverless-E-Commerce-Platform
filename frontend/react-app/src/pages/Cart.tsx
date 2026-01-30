import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

export default function Cart() {
  const { cart, loaded, removeFromCart, updateQuantity } = useCart()

  if (!loaded) return <p>Loading cart…</p>
  if (cart.length === 0) {
    return (
      <div style={emptyStyle}>
        <p>Your cart is empty.</p>
        <Link to="/" style={linkStyle}>Browse products</Link>
      </div>
    )
  }

  const total = cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0)

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Cart</h1>
      <div style={listStyle}>
        {cart.map(({ product, quantity }) => (
          <div key={product.id} style={rowStyle}>
            <img src={product.imageUrl} alt={product.name} style={thumbStyle} />
            <div style={infoStyle}>
              <Link to={`/product/${product.id}`} style={nameStyle}>{product.name}</Link>
              <p style={priceStyle}>${product.price.toFixed(2)}</p>
            </div>
            <div style={qtyStyle}>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                style={qtyBtnStyle}
              >
                −
              </button>
              <span style={{ minWidth: 24, textAlign: 'center' }}>{quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                style={qtyBtnStyle}
              >
                +
              </button>
            </div>
            <p style={subtotalStyle}>${(product.price * quantity).toFixed(2)}</p>
            <button
              type="button"
              onClick={() => removeFromCart(product.id)}
              style={removeStyle}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <p style={totalStyle}>Total: ${total.toFixed(2)}</p>
    </div>
  )
}

const emptyStyle: React.CSSProperties = { textAlign: 'center', padding: '3rem' }
const linkStyle: React.CSSProperties = { color: '#2563eb' }
const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem' }
const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  backgroundColor: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}
const thumbStyle: React.CSSProperties = { width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }
const infoStyle: React.CSSProperties = { flex: 1 }
const nameStyle: React.CSSProperties = { fontWeight: 600, color: '#1a1a1a' }
const priceStyle: React.CSSProperties = { fontSize: '0.9rem', color: '#666', marginTop: 4 }
const qtyStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5rem' }
const qtyBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  border: '1px solid #ccc',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
}
const subtotalStyle: React.CSSProperties = { fontWeight: 600, minWidth: 80, textAlign: 'right' }
const removeStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  border: '1px solid #dc2626',
  color: '#dc2626',
  background: 'transparent',
  borderRadius: 6,
  cursor: 'pointer',
}
const totalStyle: React.CSSProperties = { marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }
