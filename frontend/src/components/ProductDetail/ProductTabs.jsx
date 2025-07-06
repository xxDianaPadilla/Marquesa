import React from 'react';

const ProductTabs = ({ tab, setTab, product }) => {
  const renderTab = () => {
    if (tab === 'description') return product.description;
    if (tab === 'details') return product.details;
    if (tab === 'shipping') return product.shipping;
  };

  return (
    <div className="border-t border-gray-200 mt-6 pt-4 ">
      <div className="flex gap-2 bg-gray-100 rounded-md text-sm font-medium overflow-hidden cursor-pointer">
        {['description', 'details', 'shipping'].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 px-4 py-2 text-center ${
              tab === key ? 'bg-white text-black font-semibold shadow-sm' : 'text-gray-500 hover:text-[#CD5277] cursor-pointer'
            }`}
          >
            {key === 'description' ? 'Descripción' : key === 'details' ? 'Detalles' : 'Envío'}
          </button>
        ))}
      </div>
      <div className="bg-white p-4 rounded-b-md text-sm text-gray-700 mt-1 shadow-sm">
        {renderTab()}
      </div>
    </div>
  );
};

export default ProductTabs;
