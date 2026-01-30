import { useState, useEffect, useCallback } from 'react'
import localforage from 'localforage'
import type { Product } from '../api/products'

const CART_KEY = 'ecommerce-cart'

export interface CartItem {
  product: Product
  quantity: number
}

async function getCart(): Promise<CartItem[]> {
  const cart = await localforage.getItem<CartItem[]>(CART_KEY)
  return cart ?? []
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getCart().then((c) => {
      setCart(c)
      setLoaded(true)
    })
  }, [])

  const persist = useCallback((next: CartItem[]) => {
    setCart(next)
    localforage.setItem(CART_KEY, next)
  }, [])

  const addToCart = useCallback((product: Product, quantity = 1) => {
    getCart().then((items) => {
      const existing = items.find((i) => i.product.id === product.id)
      let next: CartItem[]
      if (existing) {
        next = items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      } else {
        next = [...items, { product, quantity }]
      }
      persist(next)
    })
  }, [persist])

  const removeFromCart = useCallback((productId: string) => {
    getCart().then((items) => {
      const next = items.filter((i) => i.product.id !== productId)
      persist(next)
    })
  }, [persist])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    getCart().then((items) => {
      const next = items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
      persist(next)
    })
  }, [persist, removeFromCart])

  const count = cart.reduce((acc, i) => acc + i.quantity, 0)

  return {
    cart,
    loaded,
    count,
    addToCart,
    removeFromCart,
    updateQuantity,
  }
}

export function useCartCount(): number {
  const { count } = useCart()
  return count
}
