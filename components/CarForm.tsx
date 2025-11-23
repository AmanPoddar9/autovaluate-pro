import React, { useState } from 'react';
import { CarDetails, FuelType, Transmission } from '../types';
import { Car, MapPin, Calendar, Gauge, Settings, Tag } from 'lucide-react';

interface CarFormProps {
  onSubmit: (data: CarDetails) => void;
  isLoading: boolean;
}

const CarForm: React.FC<CarFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CarDetails>({
    brand: '',
    model: '',
    variant: '',
    year: new Date().getFullYear() - 2,
    fuel: FuelType.PETROL,
    transmission: Transmission.MANUAL,
    ownership: 1,
    kmDriven: 25000,
    location: 'Mumbai, Maharashtra'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'ownership' || name === 'kmDriven' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <Car className="text-orange-600 w-6 h-6" />
        <h2 className="text-xl font-semibold text-gray-800">Vehicle Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            required
            name="brand"
            type="text"
            placeholder="e.g. Maruti Suzuki"
            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>

        {/* Model */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <input
            required
            name="model"
            type="text"
            placeholder="e.g. Swift"
            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            value={formData.model}
            onChange={handleChange}
          />
        </div>

        {/* Variant */}
        <div className="relative md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Variant / Trim</label>
          <div className="relative">
             <Tag className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              required
              name="variant"
              type="text"
              placeholder="e.g. VXI or ZDI Plus"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              value={formData.variant}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Year</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              required
              name="year"
              type="number"
              min="2000"
              max={new Date().getFullYear()}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              value={formData.year}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* KM Driven */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">KM Driven</label>
          <div className="relative">
            <Gauge className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              required
              name="kmDriven"
              type="number"
              min="0"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              value={formData.kmDriven}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Fuel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
          <select
            name="fuel"
            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
            value={formData.fuel}
            onChange={handleChange}
          >
            {Object.values(FuelType).map((fuel) => (
              <option key={fuel} value={fuel}>{fuel}</option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
          <div className="relative">
             <Settings className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
             <select
              name="transmission"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
              value={formData.transmission}
              onChange={handleChange}
            >
              {Object.values(Transmission).map((trans) => (
                <option key={trans} value={trans}>{trans}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ownership */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">No. of Owners</label>
           <select
              name="ownership"
              className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
              value={formData.ownership}
              onChange={handleChange}
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num}{num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'} Owner</option>
              ))}
            </select>
        </div>

        {/* Location */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">RTO / City</label>
           <div className="relative">
             <MapPin className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
             <input
              required
              name="location"
              type="text"
              placeholder="e.g. Bangalore, KA"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              value={formData.location}
              onChange={handleChange}
            />
           </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full mt-6 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 hover:shadow-xl'
          }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analysing Indian Market...</span>
          </>
        ) : (
          <span>Get Price Estimate</span>
        )}
      </button>
    </form>
  );
};

export default CarForm;