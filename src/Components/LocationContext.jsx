import React, { createContext, useState, useEffect } from "react";

// Create the context
export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);

  // Load locations from localStorage on initial load
  useEffect(() => {
    const storedLocations = localStorage.getItem("locations");
    if (storedLocations) {
      setLocations(JSON.parse(storedLocations));
    }
  }, []);

  // Function to add a new location
  const addLocation = (newLocation) => {
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    localStorage.setItem("locations", JSON.stringify(updatedLocations)); // Save to localStorage
  };

  // Function to remove a location
  const removeLocation = (index) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
    localStorage.setItem("locations", JSON.stringify(updatedLocations)); // Save to localStorage
  };

  return (
    <LocationContext.Provider
      value={{ locations, addLocation, removeLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};
