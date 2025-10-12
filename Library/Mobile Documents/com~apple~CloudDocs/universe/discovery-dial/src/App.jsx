import EventCompass from './components/EventCompass';
import categoriesData from './data/categories.json';

/**
 * Main application component.
 * Renders the Event Compass dial interface.
 */
function App() {
  return (
    <EventCompass categories={categoriesData.categories} />
  );
}

export default App;
