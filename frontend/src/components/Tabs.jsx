import React, { useState } from 'react';

const TabsContext = React.createContext();

const Tabs = ({ defaultValue, children }) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>{children}</TabsContext.Provider>
  );
};

export const TabsList = ({ children }) => (
  <div className="flex space-x-4 border-b border-gray-200 pb-2">{children}</div>
);

export const TabsTrigger = ({ value, children }) => {
  const { value: active, setValue } = React.useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      className={`text-sm pb-2 border-b-2 transition font-medium ${
        isActive ? 'border-pink-400 text-pink-500' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
};

export default Tabs;
