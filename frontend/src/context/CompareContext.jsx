import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [selectedColleges, setSelectedColleges] = useState(() => {
    try {
      const saved = sessionStorage.getItem('edufind_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem('edufind_compare', JSON.stringify(selectedColleges));
  }, [selectedColleges]);

  const addCollege = (college) => {
    if (selectedColleges.some((c) => c.id === college.id)) {
      return { success: false, message: 'College is already in comparison.' };
    }
    if (selectedColleges.length >= 3) {
      return { success: false, message: 'You can compare a maximum of 3 colleges at a time.' };
    }
    setSelectedColleges([...selectedColleges, college]);
    return { success: true };
  };

  const removeCollege = (collegeId) => {
    setSelectedColleges(selectedColleges.filter((c) => c.id !== collegeId));
  };

  const clearCompare = () => {
    setSelectedColleges([]);
  };

  const isSelected = (collegeId) => {
    return selectedColleges.some((c) => c.id === collegeId);
  };

  return (
    <CompareContext.Provider
      value={{
        selectedColleges,
        addCollege,
        removeCollege,
        clearCompare,
        isSelected,
        count: selectedColleges.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
