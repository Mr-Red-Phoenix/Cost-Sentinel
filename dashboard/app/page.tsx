"use client";

import React, { useState } from 'react';
import { useSentinelData } from './hooks/useSentinelData';
import { Navbar } from './components/Navbar';
import { StatusBanner } from './components/StatusBanner';
import { MetricCards } from './components/MetricCards';
import { SimulatorPanel } from './components/SimulatorPanel';
import { AnalyticsGrid } from './components/AnalyticsGrid';
import { AnomalyFeed } from './components/AnomalyFeed';
import { FixDrawer } from './components/FixDrawer';
import { Anomaly } from './types/sentinel';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

export default function Dashboard() {
  const { data, isRefreshing, error, refresh } = useSentinelData();
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-6 rounded-xl max-w-lg text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-sm opacity-80">{error}</p>
          <button 
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-200 selection:bg-indigo-500/30">
      <Navbar 
        status={data.status} 
        isSimulated={data.isSimulated} 
        onRefresh={refresh} 
        isRefreshing={isRefreshing} 
      />
      
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0"
      >
        {/* Banner */}
        <motion.div variants={itemVariants}>
          <StatusBanner 
            status={data.status} 
            totalAnomalies={data.summary.totalAnomalies} 
          />
        </motion.div>
        
        {/* Top KPIs */}
        <motion.div variants={itemVariants}>
          <MetricCards 
            summary={data.summary} 
            isLoading={false} 
          />
        </motion.div>
        
        {/* Interactive Simulator */}
        <motion.div variants={itemVariants}>
          <SimulatorPanel 
            onScenarioTriggered={refresh} 
          />
        </motion.div>
        
        {/* Analytics Charts */}
        <motion.div variants={itemVariants}>
          <AnalyticsGrid 
            summary={data.summary} 
          />
        </motion.div>
        
        {/* Live Anomaly Feed */}
        <motion.div variants={itemVariants}>
          <AnomalyFeed 
            anomalies={data.anomalies} 
            onSelectAnomaly={setSelectedAnomaly} 
          />
        </motion.div>
      </motion.main>

      {/* Slide-over Modal for Code Fixes */}
      <FixDrawer 
        anomaly={selectedAnomaly} 
        onClose={() => setSelectedAnomaly(null)} 
      />
    </div>
  );
}
