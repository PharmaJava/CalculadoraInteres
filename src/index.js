import { CompoundInterestCalculator } from './App.js';

// ReactDOM.render ya no existe en React 18, pero sí en 17
const rootElement = document.getElementById('root');
ReactDOM.render(
  React.createElement(CompoundInterestCalculator),
  rootElement
);
