"use client";
import dynamic from 'next/dynamic';

const CleyFlowAI = dynamic(() => import('./cleyflow-ai').then(mod => mod.default), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return <CleyFlowAI />;
}
