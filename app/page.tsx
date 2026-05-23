"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';

const CleyFlowAI = dynamic(() => import('./cleyflow-ai').then(mod => mod.default), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const LandingPage = ({ onEnterDemo }: { onEnterDemo: () => void }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#080C14', color: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 930, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.25em', color: '#00D4FF', fontSize: 12, fontWeight: 700, marginBottom: 18 }}>CleyFlow AI</div>
          <h1 style={{ fontSize: 56, lineHeight: 1.05, margin: 0, fontWeight: 800 }}>Turn guest interactions into bookings with an AI-powered hospitality workspace.</h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: '#A7B4D1', margin: '24px 0 32px' }}>
            Manage leads, conversations, bookings and campaigns from a single dashboard built for short stay rentals and hospitality brands.
            Launch the live demo to explore client workflows, AI tools, and high-conversion messaging.
          </p>
          <button onClick={onEnterDemo} style={{ background: '#00D4FF', color: '#000', border: 'none', borderRadius: 12, padding: '16px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Enter Demo Workspace
          </button>
        </div>

        <div style={{ borderRadius: 28, background: '#0D1321', border: '1px solid rgba(255,255,255,0.06)', padding: 32, boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ padding: 18, borderRadius: 20, background: '#09121C', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ color: '#00D4FF', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Live Demo Preview</div>
              <div style={{ height: 220, borderRadius: 18, background: 'linear-gradient(180deg, rgba(0,212,255,0.16), rgba(13,19,33,1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8AA8D3', fontSize: 14, textAlign: 'center', padding: 24 }}>
                Preview the AI inbox, bookings pipeline, and performance metrics in one interactive workspace.
              </div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {['AI-powered messaging', 'Multi-channel lead capture', 'Booking & trial management', 'Customizable demo settings'].map((feature) => (
                <div key={feature} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ width: 28, height: 28, borderRadius: 999, background: '#00D4FF22', display: 'grid', placeItems: 'center', color: '#00D4FF', fontSize: 14 }}>✓</span>
                  <span style={{ color: '#E8F0FE', fontSize: 14 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);

  return showDemo ? <CleyFlowAI /> : <LandingPage onEnterDemo={() => setShowDemo(true)} />;
}
