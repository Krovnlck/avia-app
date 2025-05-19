import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../store/sortSlice';
import { SORT_TYPES } from '../constants/structures';
import './TabFilter.css';

const TabFilter = () => {
  const activeTab = useSelector(state => state.sort.activeTab);
  const dispatch = useDispatch();

  const tabs = [
    { id: SORT_TYPES.CHEAPEST, label: 'САМЫЙ ДЕШЕВЫЙ' },
    { id: SORT_TYPES.FASTEST, label: 'САМЫЙ БЫСТРЫЙ' },
    { id: SORT_TYPES.OPTIMAL, label: 'ОПТИМАЛЬНЫЙ' }
  ];

  return (
    <div className="tab-filter">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-filter__button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => dispatch(setActiveTab(tab.id))}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabFilter; 