const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${baseUrl}/api/products`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${baseUrl}/api/products/${id}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Product not found')
    throw new Error('Failed to fetch product')
  }
  return res.json()
}
