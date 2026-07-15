import React, { createContext, useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  // Aquí podemos ir agregando luego clients, orders, etc.

  useEffect(() => {
    // Escucha en tiempo real la colección "productos"
    const unsub = onSnapshot(collection(db, "productos"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() }));// Agrega esta línea
setProducts(data);
    });
    return () => unsub();
  }, []);

  return (
    <InventoryContext.Provider value={{ products }}>
      {children}
    </InventoryContext.Provider>
  );
};