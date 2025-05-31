import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './App.css';
import FilterPanel from './components/FilterPanel';
import TabFilter from './components/TabFilter';
import FlightCard from './components/FlightCard';
import { fetchTickets, selectFilteredAndSortedTickets, selectTicketsStatus, selectTicketsError, setDisplayCount, selectDisplayCount } from './store/ticketsSlice';

function App() {
  const dispatch = useDispatch();
  const tickets = useSelector(selectFilteredAndSortedTickets);
  const status = useSelector(selectTicketsStatus);
  const error = useSelector(selectTicketsError);
  const displayCount = useSelector(selectDisplayCount);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleLoadMore = () => {
    dispatch(setDisplayCount(displayCount + 5));
  };

  return (
    <div className="app">
      <header className="app-header">
        <img src="/images/logo.svg" alt="Aviasales" className="app-logo" />
      </header>
      
      <main className="main-content">
        <aside className="sidebar">
          <FilterPanel />
        </aside>
        
        <div className="content">
          <TabFilter />
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {status === 'loading' && (
            <div className="loading-container">
              <div className="loading-message">
                Ищем билеты...
              </div>
            </div>
          )}
          
          {tickets.length === 0 && status === 'succeeded' && !error && (
            <div className="no-tickets-message">
              Билеты не найдены. Попробуйте изменить параметры фильтрации.
            </div>
          )}
          
          <div className="flights-list">
            {tickets.map(ticket => (
              <FlightCard
                key={`${ticket.carrier}-${ticket.price}-${ticket.segments[0].date}`}
                price={ticket.price}
                airline={ticket.carrier}
                segments={ticket.segments.map(segment => ({
                  from: segment.origin,
                  to: segment.destination,
                  departureTime: new Date(segment.date).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
                  arrivalTime: new Date(new Date(segment.date).getTime() + segment.duration * 60000)
                    .toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
                  duration: `${Math.floor(segment.duration / 60)}ч ${segment.duration % 60}м`,
                  stops: segment.stops.length,
                  stopPoints: segment.stops
                }))}
              />
            ))}
          </div>
          
          {tickets.length > 0 && (
            <button 
              className="load-more-button"
              onClick={handleLoadMore}
            >
              ПОКАЗАТЬ ЕЩЕ 5 БИЛЕТОВ!
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
