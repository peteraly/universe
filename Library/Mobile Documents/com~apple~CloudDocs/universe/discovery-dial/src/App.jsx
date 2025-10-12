import EventCompassFinal from './components/EventCompassFinal';
import categoriesData from './data/categories.json';

/**
 * Main application component.
 * FINAL PRODUCTION VERSION - Clean compass dial
 */
function App() {
  return (
    <EventCompassFinal categories={categoriesData.categories} />
  );
}

export default App;
