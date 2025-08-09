// @ts-ignore
import { CisTest } from './components/CisTest.jsx';
// @ts-ignore
import { InteractionTester } from './components/InteractionTester.jsx';
// @ts-ignore
import { CisDashboard } from './components/CisDashboard.jsx';
// @ts-ignore
import { ContentCards } from './components/ContentCards.jsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <header style={{
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
          CIS React Integration Demo
        </p>
      </footer>
    </div>
  );
}

export default App;
