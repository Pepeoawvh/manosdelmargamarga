'use client'
import { useState } from 'react';

const TabSystem = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="rounded-sm border border-emerald-100 bg-emerald-50/60 p-2">
        <nav className="flex flex-wrap gap-2" aria-label="Secciones del panel admin">
          {tabs.map((tab, index) => (
            <button
              key={index}
              role="tab" // Agregar este atributo
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 text-sm font-medium rounded-sm border transition-all ${
                activeTab === index
                  ? 'bg-white border-emerald-300 text-emerald-800 shadow-sm'
                  : 'bg-transparent border-transparent text-gray-600 hover:text-gray-800 hover:bg-white/80 hover:border-emerald-100'
              }`}
              suppressHydrationWarning
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default TabSystem;