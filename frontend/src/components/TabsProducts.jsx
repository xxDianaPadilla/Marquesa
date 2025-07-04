import React, { useState } from 'react';

const Tabs = ({ description, details, shipping }) => {
  const [tab, setTab] = useState('description');

  const renderContent = () => {
    switch (tab) {
      case 'description': return <p>{description}</p>;
      case 'details': return <p>{details}</p>;
      case 'shipping': return <p>{shipping}</p>;
      default: return null;
    }
  };

  return (
    <div>
      <div className="flex gap-6 border-b pb-2 text-sm font-medium text-gray-600">
        <button
          onClick={() => setTab('description')}
          className={`${tab === 'description' ? 'text-pink-500 border-b-2 border-pink-400' : ''}`}
        >
          Descripción
        </button>
        <button
          onClick={() => setTab('details')}
          className={`${tab === 'details' ? 'text-pink-500 border-b-2 border-pink-400' : ''}`}
        >
          Detalles
        </button>
        <button
          onClick={() => setTab('shipping')}
          className={`${tab === 'shipping' ? 'text-pink-500 border-b-2 border-pink-400' : ''}`}
        >
          Envío
        </button>
      </div>
      <div className="mt-3 text-sm text-gray-700">{renderContent()}</div>
    </div>
  );
};

export default Tabs;
