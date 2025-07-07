import React from 'react';
import UploadWithLanguage from './components/UploadWithLanguage';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '40px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '36px', textAlign: 'center', color: '#2563eb', marginBottom: '24px' }}>
          🎬 Reely — Auto-Caption Videos (Login Optional)
        </h1>
        <UploadWithLanguage />
      </div>
    </div>
  );
}

export default App;