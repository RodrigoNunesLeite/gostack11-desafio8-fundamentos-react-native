import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsStorage = await AsyncStorage.getItem(
        `@GoMarketplace:products`,
      );

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productExist = products.find(p => p.id === product.id);

      let reqProd: Product;

      if (productExist) {
        reqProd = {
          id: product.id,
          image_url: product.image_url,
          price: product.price,
          quantity: productExist.quantity + 1,
          title: product.title,
        };
      } else {
        reqProd = {
          id: product.id,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
          title: product.title,
        };
      }

      if (productExist) {
        setProducts(
          products.map(p =>
            p.id === reqProd.id
              ? {
                ...reqProd,
              }
              : p,
          ),
        );
      } else {
        setProducts([...products, { ...reqProd }]);
      }
      /*
    if (productExist) {
      setProducts(
        products.map(p =>
          p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
        ),
      );
    } else {
      setProducts([...products, { ...product, quantity: 1 }]);
    } */
      await AsyncStorage.setItem(
        `@GoMarketplace:products`,
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productExist = products.find(p => p.id === id);
      if (productExist) {
        setProducts(
          products.map(p =>
            p.id === id
              ? {
                ...p,
                quantity: p.quantity + 1,
              }
              : p,
          ),
        );

        await AsyncStorage.setItem(
          `@GoMarketplace:products`,
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productExist = products.find(p => p.id === id);
      if (productExist) {
        setProducts(
          products.map(p =>
            p.id === id
              ? {
                ...p,
                quantity: p.quantity - 1,
              }
              : p,
          ),
        );

        await AsyncStorage.setItem(
          `@GoMarketplace:products`,
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
