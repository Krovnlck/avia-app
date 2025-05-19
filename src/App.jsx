import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import './App.css';
import FilterPanel from './components/FilterPanel';
import TabFilter from './components/TabFilter';
import FlightCard from './components/FlightCard';
import { getSearchId, getTickets } from './services/api';

function App() {
  const filters = useSelector(state => state.filters);
  const activeTab = useSelector(state => state.sort.activeTab);

  const [searchId, setSearchId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchComplete, setIsSearchComplete] = useState(false);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    const initSearch = async () => {
      try {
        const id = await getSearchId();
        setSearchId(id);
      } catch (err) {
        setError('Не удалось начать поиск билетов. Пожалуйста, обновите страницу.');
        setIsLoading(false);
      }
    };

    initSearch();
  }, []);

  const filterTickets = useCallback((tickets) => {
    return tickets.filter(ticket => {
      const maxStops = Math.max(...ticket.segments.map(segment => segment.stops.length));
      return (
        (maxStops === 0 && filters.direct) ||
        (maxStops === 1 && filters.oneStop) ||
        (maxStops === 2 && filters.twoStops) ||
        (maxStops === 3 && filters.threeStops)
      );
    });
  }, [filters]);

  const sortTickets = useCallback((tickets) => {
    return [...tickets].sort((a, b) => {
      switch (activeTab) {
        case 'cheapest':
          return a.price - b.price;
        case 'fastest':
          const aDuration = a.segments.reduce((sum, segment) => sum + segment.duration, 0);
          const bDuration = b.segments.reduce((sum, segment) => sum + segment.duration, 0);
          return aDuration - bDuration;
        case 'optimal':
          const aScore = a.price / 100 + a.segments.reduce((sum, segment) => sum + segment.duration, 0) / 60;
          const bScore = b.price / 100 + b.segments.reduce((sum, segment) => sum + segment.duration, 0) / 60;
          return aScore - bScore;
        default:
          return 0;
      }
    });
  }, [activeTab]);

  useEffect(() => {
    if (!searchId) return;

    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    const BASE_RETRY_DELAY = 1000;

    const fetchTickets = async () => {
      try {
        const response = await getTickets(searchId);
        
        if (!mounted) return;

        if (response.tickets && response.tickets.length > 0) {
          setTickets(prevTickets => {
            const uniqueTickets = [...prevTickets];
            response.tickets.forEach(ticket => {
              const isDuplicate = uniqueTickets.some(t => 
                t.carrier === ticket.carrier && 
                t.price === ticket.price && 
                t.segments.every((segment, index) => 
                  segment.date === ticket.segments[index].date &&
                  segment.origin === ticket.segments[index].origin &&
                  segment.destination === ticket.segments[index].destination &&
                  segment.duration === ticket.segments[index].duration &&
                  segment.stops.length === ticket.segments[index].stops.length &&
                  segment.stops.every((stop, i) => stop === ticket.segments[index].stops[i])
                )
              );
              if (!isDuplicate) {
                uniqueTickets.push(ticket);
              }
            });
            return uniqueTickets;
          });
          retryCount = 0;
        }

        if (!response.stop) {
          const delay = retryCount === 0 ? 0 : BASE_RETRY_DELAY * Math.pow(2, retryCount - 1);
          setTimeout(() => {
            if (mounted) fetchTickets();
          }, delay);
        } else {
          setIsSearchComplete(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        if (retryCount < MAX_RETRIES && mounted) {
          retryCount++;
          setTimeout(() => {
            if (mounted) fetchTickets();
          }, BASE_RETRY_DELAY * Math.pow(2, retryCount));
        } else if (mounted) {
          if (tickets.length > 0) {
            setIsSearchComplete(true);
            setIsLoading(false);
          } else {
            setError('Произошла ошибка при загрузке билетов. Попробуйте обновить страницу.');
            setIsLoading(false);
          }
        }
      }
    };

    fetchTickets();

    return () => {
      mounted = false;
    };
  }, [searchId]);

  const processedTickets = useMemo(() => {
    return sortTickets(filterTickets(tickets));
  }, [tickets, filterTickets, sortTickets]);

  const displayedTickets = processedTickets.slice(0, displayCount);

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

          {isLoading && (
            <div className="loading-container">
              <div className="loading-message">
                {isSearchComplete ? 'Поиск завершен!' : 'Ищем билеты...'}
              </div>
              <div className="loading-stats">
                Найдено билетов: {tickets.length}
                {!isSearchComplete && ' (поиск продолжается...)'}
              </div>
            </div>
          )}
          
          {processedTickets.length === 0 && !isLoading && !error && (
            <div className="no-tickets-message">
              Билеты не найдены. Попробуйте изменить параметры фильтрации.
            </div>
          )}
          
          <div className="flights-list">
            {displayedTickets.map(ticket => (
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
          
          {displayedTickets.length > 0 && displayedTickets.length < processedTickets.length && (
            <button 
              className="load-more-button"
              onClick={() => setDisplayCount(prev => prev + 5)}
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
