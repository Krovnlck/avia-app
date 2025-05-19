import React, { useState } from 'react';
import './FlightCard.css';

const FlightCard = ({ price, airline, segments }) => {
  const [imageError, setImageError] = useState(false);
  const airlineLogoUrl = `//pics.avs.io/99/36/${airline}.png`;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flight-card">
      <div className="flight-card__header">
        <div className="flight-card__price">{price.toLocaleString('ru-RU')} ₽</div>
        <div className="flight-card__airline">
          {!imageError ? (
            <img 
              src={airlineLogoUrl} 
              alt={`${airline} Airlines`} 
              className="airline-logo"
              onError={handleImageError}
            />
          ) : (
            <span className="airline-code">{airline}</span>
          )}
        </div>
      </div>
      
      {segments.map((segment, index) => (
        <div key={index} className="flight-segment">
          <div className="flight-info">
            <div className="flight-route">
              <span>{segment.from} – {segment.to}</span>
              <span className="flight-time">В ПУТИ</span>
            </div>
            <div className="flight-details">
              <span>{segment.departureTime} – {segment.arrivalTime}</span>
              <span>{segment.duration}</span>
            </div>
          </div>
          
          {segment.stops > 0 && (
            <div className="flight-stops">
              <span>{segment.stops} {getStopsText(segment.stops)}</span>
              <span>{segment.stopPoints.join(', ')}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const getStopsText = (stops) => {
  if (stops === 1) return 'ПЕРЕСАДКА';
  if (stops >= 2 && stops <= 4) return 'ПЕРЕСАДКИ';
  return 'ПЕРЕСАДОК';
};

export default FlightCard; 