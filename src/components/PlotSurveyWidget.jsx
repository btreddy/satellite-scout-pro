import React from 'react';

const PlotSurveyWidget = () => {
  return (
    <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', border: '1px solid #334155' }}>
      <div style={{ padding: '15px 20px', backgroundColor: '#0f172a', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#e2e8f0' }}>Plot Measurement & Survey</h3>
        <span style={{ backgroundColor: '#f59e0b', color: '#000', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Baas Original Tool</span>
      </div>
      
      {/* THE VITE LOCALHOST IFRAME */}
      <div style={{ width: '100%', height: '600px' }}>
        <iframe 
          src="http://localhost:3000/" 
          title="Plot Measurement Tool" width="100%" height="100%" style={{ border: 'none' }}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
      
      <div style={{ padding: '15px 20px', backgroundColor: '#1e293b' }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Instantly calculate plot dimensions and verify survey boundaries.</p>
      </div>
    </div>
  );
};

export default PlotSurveyWidget;