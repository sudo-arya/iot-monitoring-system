import { useState } from "react";

const FloatInput = ({ minValue, maxValue, onMinChange, onMaxChange }) => {

  const handleMinChange = (event) => {
    const newValue = parseFloat(event.target.value);
    if (newValue <= maxValue) {
      onMinChange(newValue);
    }
  };

  const handleMaxChange = (event) => {
    const newValue = parseFloat(event.target.value);
    if (newValue >= minValue) {
      onMaxChange(newValue);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white p-4 w-full max-w-md">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Select Sensor Range
        </h2>

        {/* Minimum Value Section */}
        <div className="flex flex-col items-center space-y-3">
          <label htmlFor="min" className="text-lg font-medium text-gray-700">
            Min Sensor Value :{" "}
            <span className="text-lg font-semibold text-green-600">
              {minValue.toFixed(1)}
            </span>
          </label>
          <input
            id="min"
            type="range"
            min="0"
            max={maxValue}
            step="0.1"
            value={minValue}
            onChange={handleMinChange}
            className="w-full h-3 bg-green-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Maximum Value Section */}
        <div className="flex flex-col items-center space-y-3">
          <label htmlFor="max" className="text-lg font-medium text-gray-700">
            Max Sensor Value :{" "}
            <span className="text-lg font-semibold text-red-600">
              {maxValue.toFixed(1)}
            </span>
          </label>
          <input
            id="max"
            type="range"
            min={minValue}
            max="100"
            step="0.1"
            value={maxValue}
            onChange={handleMaxChange}
            className="w-full h-3 bg-red-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Display Selected Range */}
        <div className="text-center mt-8 w-fit items-center px-6 py-1 mx-auto text-lg font-medium text-gray-800 bg-gray-100 rounded-full">
          Selected Range:{" "}
          <span className="text-green-600">{minValue.toFixed(1)}</span> -{" "}
          <span className="text-red-600">{maxValue.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};


export default FloatInput;
