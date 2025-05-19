import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleAll, toggleFilter } from '../store/filtersSlice';
import './FilterPanel.css';

const FilterPanel = () => {
  const filters = useSelector(state => state.filters);
  const dispatch = useDispatch();

  const handleFilterChange = (filterType) => {
    if (filterType === 'all') {
      dispatch(toggleAll());
    } else {
      dispatch(toggleFilter(filterType));
    }
  };

  return (
    <div className="filter-panel">
      <h3 className="filter-panel__title">КОЛИЧЕСТВО ПЕРЕСАДОК</h3>
      <div className="filter-options">
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.all}
            onChange={() => handleFilterChange('all')}
          />
          <span>Все</span>
        </label>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.direct}
            onChange={() => handleFilterChange('direct')}
          />
          <span>Без пересадок</span>
        </label>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.oneStop}
            onChange={() => handleFilterChange('oneStop')}
          />
          <span>1 пересадка</span>
        </label>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.twoStops}
            onChange={() => handleFilterChange('twoStops')}
          />
          <span>2 пересадки</span>
        </label>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.threeStops}
            onChange={() => handleFilterChange('threeStops')}
          />
          <span>3 пересадки</span>
        </label>
      </div>
    </div>
  );
};

export default FilterPanel; 