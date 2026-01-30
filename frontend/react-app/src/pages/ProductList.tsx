import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts, type Product } from '../api/products'
import { useCart } from '../hooks/useCart'

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading products…</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div style={gridStyle}>
      {products.map((p) => (
        <article key={p.id} style={cardStyle}>
          <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <img
              src={p.imageUrl}
              alt={p.name}
              style={imgStyle}
            />
            <h2 style={titleStyle}>{p.name}</h2>
            <p style={priceStyle}>${p.price.toFixed(2)}</p>
          </Link>
          <button
            type="button"
            onClick={() => addToCart(p)}
            style={btnStyle}
          >
            Add to cart
          </button>
        </article>
      ))}
    </div>
  )
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '1.5rem',
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
}

const imgStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1',
  objectFit: 'cover',
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  margin: '0.75rem 1rem 0',
}

const priceStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: '0.25rem 1rem 1rem',
  color: '#2563eb',
}

const btnStyle: React.CSSProperties = {
  margin: '0 1rem 1rem',
  padding: '0.6rem 1rem',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
}
