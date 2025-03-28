'use client'
import { useState } from 'react';

const TabSystem = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === index
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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