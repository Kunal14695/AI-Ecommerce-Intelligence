import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('delivery_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      pincode: '302022',
      city: 'Jaipur',
      state: 'Rajasthan',
      area: 'Sitapura',
      isServiceable: true,
      deliveryDays: 1,
      deliveryMessage: 'Free delivery by Tomorrow'
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    localStorage.setItem('delivery_location', JSON.stringify(location));
  }, [location]);

  const updatePincode = async (pincode) => {
    try {
      const serv = await api.checkServiceability(pincode);
      const newLoc = {
        pincode,
        city: serv.city || 'Jaipur',
        state: serv.state || 'Rajasthan',
        area: serv.area_name || '',
        isServiceable: serv.serviceable,
        deliveryDays: serv.estimated_delivery_days || (serv.serviceable ? 1 : null),
        deliveryMessage: serv.serviceable
          ? `Free delivery in ${serv.estimated_delivery_days || 1} day(s)`
          : 'Currently not serviceable'
      };
      setLocation(newLoc);
      return { success: true, ...newLoc };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const detectGps = async () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }
    setDetecting(true);
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const geoRes = await api.reverseGeocode(latitude, longitude);
            const pin = geoRes.pincode || '302022';
            const res = await updatePincode(pin);
            setDetecting(false);
            resolve(res);
          } catch (e) {
            setDetecting(false);
            // Default fallback
            await updatePincode('302022');
            resolve({ success: true, pincode: '302022', city: 'Jaipur' });
          }
        },
        (error) => {
          setDetecting(false);
          reject(error);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isModalOpen,
        setIsModalOpen,
        detecting,
        updatePincode,
        detectGps
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
