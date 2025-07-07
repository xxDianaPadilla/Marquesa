// src/components/Tabs.jsx
import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

export const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || '');

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const TabsTrigger = ({ value, children }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex-1 px-4 py-2 text-center transition-all duration-200 rounded-md ${
        isActive
          ? 'bg-white text-black font-semibold shadow-sm'
          : 'text-gray-500 hover:text-[#CD5277]'
      }`}
    >
      {children}
    </button>
  );
};


export const TabsContent = ({ value, children }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return <div className="mt-4">{children}</div>;
};
