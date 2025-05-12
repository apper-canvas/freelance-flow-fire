import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Initialize the Redux store with data
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// Create mock data reducers
const initialState = {
  clients: [
    { id: '1', name: 'Acme Corp', contactInfo: { email: 'contact@acmecorp.com', phone: '123-456-7890' }, status: 'active' },
    { id: '2', name: 'Globex Inc', contactInfo: { email: 'info@globex.com', phone: '234-567-8901' }, status: 'active' },
    { id: '3', name: 'Stark Industries', contactInfo: { email: 'hello@stark.com', phone: '345-678-9012' }, status: 'inactive' }
  ],
  projects: [
    { id: '1', name: 'Website Redesign', clientId: '1', status: 'active', hourlyRate: 75, budget: { amount: 5000, type: 'fixed' } },
    { id: '2', name: 'Mobile App Development', clientId: '1', status: 'on_hold', hourlyRate: 90, budget: { amount: 10000, type: 'hourly' } },
    { id: '3', name: 'Logo Design', clientId: '2', status: 'completed', hourlyRate: 60, budget: { amount: 1200, type: 'fixed' } },
    { id: '4', name: 'Marketing Campaign', clientId: '3', status: 'active', hourlyRate: 85, budget: { amount: 7500, type: 'fixed' } }
  ],
  timeEntries: [
    { id: '1', projectId: '1', clientId: '1', startTime: '2023-07-01T09:00:00', endTime: '2023-07-01T12:30:00', duration: 12600, description: 'Initial wireframes', hourlyRate: 75, billable: true },
    { id: '2', projectId: '2', clientId: '1', startTime: '2023-07-02T13:00:00', endTime: '2023-07-02T17:00:00', duration: 14400, description: 'API Integration', hourlyRate: 90, billable: true },
    { id: '3', projectId: '3', clientId: '2', startTime: '2023-07-03T10:00:00', endTime: '2023-07-03T15:00:00', duration: 18000, description: 'Initial concepts', hourlyRate: 60, billable: true }
  ],
  invoices: [
    { id: '1', clientId: '1', projectIds: ['1'], status: 'sent', issueDate: '2023-07-15', dueDate: '2023-07-30', amount: 1500 },
    { id: '2', clientId: '2', projectIds: ['3'], status: 'paid', issueDate: '2023-06-20', dueDate: '2023-07-05', amount: 1200 }
  ],
  expenses: [
    { id: '1', projectId: '1', clientId: '1', date: '2023-07-05', amount: 120, category: 'Software', description: 'Premium plugin licenses', billable: true },
    { id: '2', projectId: '2', clientId: '1', date: '2023-07-08', amount: 50, category: 'Hosting', description: 'Test server', billable: true }
  ],
  documents: [
    { id: '1', name: 'Contract.pdf', projectId: '1', clientId: '1', fileType: 'application/pdf', folder: 'Contracts' },
    { id: '2', name: 'Logo Assets.zip', projectId: '3', clientId: '2', fileType: 'application/zip', folder: 'Deliverables' }
  ],
  user: {
    name: 'Alex Johnson',
    email: 'alex@freelanceflow.com',
    businessDetails: {
      name: 'AJ Creative Solutions',
      address: '123 Creative St, Design City',
      logo: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=100&auto=format&fit=crop'
    },
    defaultHourlyRate: 85
  }
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case 'ADD_TIME_ENTRY':
      return {
        ...state,
        timeEntries: [...state.timeEntries, action.payload]
      };
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload]
      };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client => client.id === action.payload.id ? action.payload : client)
      };
    default:
      return state;
  }
}

const store = configureStore({
  reducer: rootReducer
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)