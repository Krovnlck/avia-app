const BASE_URL = 'https://aviasales-test-api.kata.academy';

/**
 * Получение идентификатора поиска
 */
export const getSearchId = async () => {
  try {
    const response = await fetch(`${BASE_URL}/search`);
    if (!response.ok) {
      throw new Error('Failed to get search ID');
    }
    const data = await response.json();
    return data.searchId;
  } catch (error) {
    console.error('Error getting search ID:', error);
    throw error;
  }
};

/**
 * Получение пачки билетов
 * @param {string} searchId - Идентификатор поиска
 */
export const getTickets = async (searchId) => {
  if (!searchId) {
    throw new Error('SearchId is required');
  }

  try {
    const response = await fetch(`${BASE_URL}/tickets?searchId=${searchId}`);
    
    // Обработка ошибки 500 как части нормального процесса
    if (response.status === 500) {
      return {
        tickets: [],
        stop: false
      };
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      tickets: Array.isArray(data.tickets) ? data.tickets : [],
      stop: Boolean(data.stop)
    };
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return {
      tickets: [],
      stop: false
    };
  }
}; 