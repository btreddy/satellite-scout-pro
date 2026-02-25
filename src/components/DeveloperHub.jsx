import React from 'react';
import RealityBrainWidget from './RealityBrainWidget';
import PlotSurveyWidget from './PlotSurveyWidget';

const DeveloperHub = () => {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#38bdf8', marginBottom: '10px' }}>Safe Land Developer Ecosystem</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Next-Generation Real Estate Tools Built by Our Elite Tech Partners.</p>
      </div>

      {/* THE APP STORE GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', justifyContent: 'center' }}>
        
        {/* Rendering your two separate files! */}
        <RealityBrainWidget />
        <PlotSurveyWidget />

      </div>
    </div>
  );
};

export default DeveloperHub;