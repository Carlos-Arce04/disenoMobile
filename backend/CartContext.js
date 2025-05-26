// backend/CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  updateDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../hooks/firebaseConfig';
import { getProductById } from './platziapi';

export const CartContext = createContext();

export const SIZED_CATEGORIES = [1, 4];
export const SIZE_SETS = { 1: ['XS','S','M','L','XL'], 4: ['38','39','40','41','42'] };

export function CartProvider({ children, user }) {
  const [cartItems, setCartItems] = useState([]);
  const [stocks, setStocks] = useState({});

  // Suscripción al carrito en Firestore
  useEffect(() => {
    if (!user) { setCartItems([]); return; }
    const cartRef = doc(db, 'carts', user.uid);
    return onSnapshot(cartRef, snap => {
      setCartItems(snap.exists() ? snap.data().items || [] : []);
    });
  }, [user]);

  // Stock init
  const initializeStock = async (productId, categoryId) => {
    const stockRef = doc(db, 'stocks', productId.toString());
    const snap = await getDoc(stockRef);
    if (snap.exists()) {
      setStocks(prev => ({ ...prev, [productId]: snap.data() }));
      return;
    }
    let initial = {};
    if (SIZED_CATEGORIES.includes(categoryId)) {
      SIZE_SETS[categoryId].forEach(sz => { initial[sz] = 5; });
    } else {
      initial.default = 5;
    }
    await setDoc(stockRef, initial);
    setStocks(prev => ({ ...prev, [productId]: initial }));
  };

  // Reserve stock transaction
  const reserveStock = async (productId, size = 'default') => {
    const stockRef = doc(db, 'stocks', productId.toString());
    try {
      await runTransaction(db, async tx => {
        const snap = await tx.get(stockRef);
        if (!snap.exists()) throw new Error('No stock document');
        const data = snap.data();
        const avail = data[size] ?? 0;
        if (avail < 1) throw new Error('Out of stock');
        tx.update(stockRef, { [size]: avail - 1 });
      });
      setStocks(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [size]: (prev[productId][size] || 0) -1
        }
      }));
      return true;
    } catch {
      return false;
    }
  };

  const releaseStock = async (productId, size = 'default') => {
    const stockRef = doc(db, 'stocks', productId.toString());
    const snap = await getDoc(stockRef);
    const curr = snap.exists() ? (snap.data()[size] ?? 0) : 0;
    await updateDoc(stockRef, { [size]: curr + 1 });
    setStocks(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: curr + 1
      }
    }));
  };

  const saveCart = async items => {
    if (!user) return;
    const cartRef = doc(db, 'carts', user.uid);
    await setDoc(cartRef, { items }, { merge: true });
  };

  // Add to cart: fetch full product to get image URL
  const addToCart = async (stub, categoryId, size = 'default') => {
    const full = await getProductById(stub.id);
    const imageUrl = Array.isArray(full.images) && full.images.length
      ? full.images[0]
      : full.image;
    await initializeStock(full.id, categoryId);
    const ok = await reserveStock(full.id, size);
    if (!ok) return false;
    const key = `${full.id}_${size}`;
    const exist = cartItems.find(i => i.key === key);
    let updated;
    if (exist) {
      updated = cartItems.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      updated = [
        ...cartItems,
        { key, id: full.id, title: full.title, price: full.price, size, quantity: 1, categoryId, image: imageUrl }
      ];
    }
    setCartItems(updated);
    await saveCart(updated);
    return true;
  };

  const updateQuantity = async (productId, categoryId, size = 'default', delta) => {
    const key = `${productId}_${size}`;
    const exist = cartItems.find(i => i.key === key);
    if (!exist) return;
    if (delta > 0) {
      const ok = await reserveStock(productId, size);
      if (!ok) return;
    } else {
      await releaseStock(productId, size);
    }
    const newQty = exist.quantity + delta;
    const updated = newQty > 0
      ? cartItems.map(i => i.key===key?{...i,quantity:newQty}:i)
      : cartItems.filter(i=>i.key!==key);
    setCartItems(updated);
    await saveCart(updated);
  };

  const removeFromCart = async (productId, size='default') => {
    const key = `${productId}_${size}`;
    const exist = cartItems.find(i=>i.key===key);
    if (!exist) return;
    for (let i=0;i<exist.quantity;i++) await releaseStock(productId,size);
    const updated=cartItems.filter(i=>i.key!==key);
    setCartItems(updated); await saveCart(updated);
  };

  const clearCart = async () => {
    for (const i of cartItems) for(let j=0;j<i.quantity;j++) await releaseStock(i.id,i.size);
    setCartItems([]); await saveCart([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, stocks, addToCart, updateQuantity, removeFromCart, clearCart, initializeStock, SIZED_CATEGORIES, SIZE_SETS }}>
      {children}
    </CartContext.Provider>
  );
}
