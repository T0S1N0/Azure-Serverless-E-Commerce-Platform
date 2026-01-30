import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProduct, type Product } from '../api/products'
import { useCart } from '../hooks/useCart'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    if (!id) return
    fetchProduct(id)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p>Loading…</p>
  if (error || !product) return <p>{error ?? 'Product not found'}</p>

  return (
    <div style={containerStyle}>
      <Link to="/" style={backStyle}>← Back to products</Link>
      <div style={detailStyle}>
        <img src={product.imageUrl} alt={product.name} style={imgStyle} />
        <div>
          <h1 style={titleStyle}>{product.name}</h1>
          <p style={priceStyle}>${product.price.toFixed(2)}</p>
          <p style={descStyle}>{product.description}</p>
          <button
            type="button"
            onClick={() => addToCart(product)}
            style={btnStyle}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = { maxWidth: 800 }

const backStyle: React.CSSProperties = {
  display: 'inline-block',
  marginBottom: '1.5rem',
  color: '#2563eb',
}

const detailStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2rem',
  alignItems: 'start',
}

const imgStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 12,
  aspectRatio: '1',
  objectFit: 'cover',
}

const titleStyle: React.CSSProperties = { fontSize: '1.75rem', marginBottom: '0.5rem' }
const priceStyle: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 600, color: '#2563eb', marginBottom: '1rem' }
const descStyle: React.CSSProperties = { marginBottom: '1.5rem', color: '#555' }
const btnStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
}
