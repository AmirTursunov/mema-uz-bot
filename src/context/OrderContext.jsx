import React, { createContext, useContext, useState, useCallback } from 'react';

const OrderContext = createContext(null);

const INITIAL_STATE = {
  color: 'white',
  placements: {
    front: { image: null, position: { x: 0, y: 0, scale: 1 } },
    back: { image: null, position: { x: 0, y: 0, scale: 1 } },
    leftSleeve: { image: null, position: { x: 0, y: 0, scale: 1 } },
    rightSleeve: { image: null, position: { x: 0, y: 0, scale: 1 } },
  },
  size: null,
  customerInfo: {
    name: '',
    phone: '',
    deliveryType: 'delivery',
    address: '',
  },
};

// Pricing in UZS
export const PRICES = {
  tshirt: 89000,
  firstPrint: 15000,
  extraPrint: 10000,
  delivery: 15000,
  pickup: 0,
};

export function calculateTotal(state) {
  let total = PRICES.tshirt;
  const activePlacements = Object.values(state.placements).filter(p => p.image);
  if (activePlacements.length > 0) {
    total += PRICES.firstPrint;
    total += Math.max(0, activePlacements.length - 1) * PRICES.extraPrint;
  }
  if (state.customerInfo.deliveryType === 'delivery') {
    total += PRICES.delivery;
  }
  return total;
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
}

export function OrderProvider({ children }) {
  const [order, setOrder] = useState(INITIAL_STATE);

  const setColor = useCallback((color) => {
    setOrder(prev => ({ ...prev, color }));
  }, []);

  const setPlacementImage = useCallback((zone, imageData) => {
    setOrder(prev => ({
      ...prev,
      placements: {
        ...prev.placements,
        [zone]: { ...prev.placements[zone], image: imageData },
      },
    }));
  }, []);

  const setPlacementPosition = useCallback((zone, position) => {
    setOrder(prev => ({
      ...prev,
      placements: {
        ...prev.placements,
        [zone]: { ...prev.placements[zone], position },
      },
    }));
  }, []);

  const removePlacementImage = useCallback((zone) => {
    setOrder(prev => ({
      ...prev,
      placements: {
        ...prev.placements,
        [zone]: { image: null, position: { x: 0, y: 0, scale: 1 } },
      },
    }));
  }, []);

  const setSize = useCallback((size) => {
    setOrder(prev => ({ ...prev, size }));
  }, []);

  const setCustomerInfo = useCallback((info) => {
    setOrder(prev => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, ...info },
    }));
  }, []);

  const resetOrder = useCallback(() => {
    setOrder(INITIAL_STATE);
  }, []);

  const getActivePlacements = useCallback(() => {
    return Object.entries(order.placements)
      .filter(([, p]) => p.image)
      .map(([zone, p]) => ({ zone, ...p }));
  }, [order.placements]);

  return (
    <OrderContext.Provider value={{
      order,
      setColor,
      setPlacementImage,
      setPlacementPosition,
      removePlacementImage,
      setSize,
      setCustomerInfo,
      resetOrder,
      getActivePlacements,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
}
