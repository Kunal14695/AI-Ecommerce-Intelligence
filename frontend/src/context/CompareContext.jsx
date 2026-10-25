import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  // Holds array of selected products: [prodA, prodB] (max 2)
  const [selectedProducts, setSelectedProducts] = useState([]);

  const toggleProduct = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 2) {
        // Replace second product
        return [prev[0], product];
      }
      return [...prev, product];
    });
  };

  const setComparePair = (prodA, prodB) => {
    setSelectedProducts([prodA, prodB].filter(Boolean));
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setSelectedProducts([]);
  };

  const isSelected = (productId) => {
    return selectedProducts.some(p => p.id === productId);
  };

  return (
    <CompareContext.Provider value={{
      selectedProducts,
      toggleProduct,
      setComparePair,
      removeProduct,
      clearCompare,
      isSelected,
      canCompare: selectedProducts.length === 2
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
