import React, { useState } from 'react';

const NPAddressSelector = ({ onAddressChange, disabled }) => {
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCities = async (value) => {
    if (value.length < 3) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/np/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search: value })
      });
      const data = await response.json();
      setCities(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Місто *</label>
        <input
          type="text"
          placeholder="Почніть вводити місто..."
          className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-black outline-none text-xs"
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            fetchCities(e.target.value);
          }}
          disabled={disabled}
        />
        {cities.length > 0 && (
          <div className="absolute z-50 bg-white border border-gray-200 w-[300px] max-h-40 overflow-y-auto shadow-lg">
            {cities.map(city => (
              <div key={city.Ref} className="p-2 text-xs hover:bg-gray-100 cursor-pointer" onClick={() => {
                setCityQuery(city.Description);
                onAddressChange(city.Description);
                setCities([]);
              }}>
                {city.Description}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default NPAddressSelector;