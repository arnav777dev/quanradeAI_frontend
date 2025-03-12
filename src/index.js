import React, { createContext, useReducer } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import ThemeContext from './context/ThemeContext';

// Initial State
const initialState = {
  count: 0,
};

// Reducer Function
const reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
};

// Create Context
export const AppContext = createContext();

// AppProvider Component
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Render Application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter basename='/'>
        <ThemeContext>
          <App />
        </ThemeContext>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);

reportWebVitals();
