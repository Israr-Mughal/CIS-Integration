import React from 'react';
import { CisTest } from './components/CisTest';
import { InteractionTester } from './components/InteractionTester';
import { CisDashboard } from './components/CisDashboard';
import { ContentCards } from './components/ContentCards';
import './App.css';

function App() {
  return (
    <div className="App">
      <header style={{
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1>🚀 CIS React Integration Demo</h1>
        <p>Content Interaction Service Testing Interface</p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Connection Test */}
        <CisTest />

        {/* Analytics Dashboard */}
        <CisDashboard />

        {/* Interactive Content Cards */}
        <ContentCards />

        {/* Interaction Type Tester */}
        <InteractionTester />
      </main>

      <footer style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center',
        marginTop: '40px',
        borderTop: '1px solid #dee2e6'
      }}>
        <p style={{ margin: 0, color: '#666' }}>
          CIS React Integration Demo - Backend running on localhost:8000
        </p>
      </footer>
    </div>
  );
}

export default App;
