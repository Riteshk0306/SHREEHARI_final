import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CartItem, Product } from './types';

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      cart: [],
            addToCart: (product, quantity) =>
        set((state) => {
          const existing = state.cart.find((item) => item.productId === product.id);
          const currentQty = existing ? existing.quantity : 0;
          const requestedQty = currentQty + quantity;
          
          let finalQty = requestedQty;
          if (requestedQty > product.stock) {
            alert('Only ' + product.stock + ' units available in stock. Limit reached.');
            finalQty = product.stock;
          }

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: finalQty }
                  : item
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              {
                productId: product.id,
                name: product.name,
                sellingPrice: product.sellingPrice,
                purchasePrice: product.purchasePrice,
                quantity: finalQty,
                image: product.images?.[0] || '',
              },
            ],
          };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        })),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.productId !== productId),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'shree-hari-store',
    }
  )
);
