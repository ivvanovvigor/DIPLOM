import React, { useState } from 'react';

const NPAddressSelector = ({ onCityChange, onWarehouseChange, disabled }) => {
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCities = async (value) => {
    if (value.length < 3) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/np/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search: value })
      });
      const data = await response.json();
      setCities(data || []);
    } catch (e) { console.error("Помилка пошуку міст:", e); }
  };

  const fetchWarehouses = async (cityRef) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/np/warehouses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityRef })
      });
      const data = await response.json();
      setWarehouses(data || []);
    } catch (e) { console.error("Помилка завантаження відділень:", e); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Вибір міста */}
      <div className="relative">
        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Місто *</label>
        <input
          type="text"
          placeholder="Почніть вводити місто..."
          className="w-full p-2.5 bg-gray-50 border border-gray-200 outline-none text-xs"
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            fetchCities(e.target.value);
          }}
          disabled={disabled}
        />
        {cities.length > 0 && (
          <div className="absolute z-50 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto shadow-lg">
            {cities.map(city => (
              <div key={city.Ref} className="p-2 text-xs hover:bg-gray-100 cursor-pointer" onClick={() => {
                setCityQuery(city.Description);
                onCityChange(city.Description); // Передаємо місто в Cart
                setCities([]);
                setWarehouses([]); // Скидаємо старі відділення
                fetchWarehouses(city.Ref);
              }}>
                {city.Description}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Вибір відділення */}
      {warehouses.length > 0 && (
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Відділення *</label>
          <select 
            className="w-full p-2.5 bg-gray-50 border border-gray-200 text-xs outline-none"
            onChange={(e) => onWarehouseChange(e.target.value)}
          >
            <option value="">Оберіть відділення</option>
            {warehouses.map(w => (
              <option key={w.Ref} value={w.Description}>{w.Description}</option>
            ))}
          </select>
        </div>
      )}
      
      {loading && <p className="text-[10px] text-gray-400">Завантаження відділень...</p>}
    </div>
  );
};

export default NPAddressSelector;