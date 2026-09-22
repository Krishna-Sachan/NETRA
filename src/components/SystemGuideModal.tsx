import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  Search, 
  Subtitles, 
  Network, 
  Brain, 
  FileText, 
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Calendar,
  Zap
} from 'lucide-react';

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CANVAS' | 'TIMELINE' | 'PANES' | 'COPILOT' | 'METRICS'>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-[#0e1320] border border-cyan-500/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#141b2d] border-b border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/60 text-cyan-300">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider uppercase font-sans flex items-center space-x-2">
                <span>NETRA Executive System & Feature Guide</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  First-Time User Walkthrough
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete guide on case document ingestion, graph topology, timeline story mode, and intelligence panes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 py-2 bg-[#101625] border-b border-slate-800/80 flex items-center space-x-1 overflow-x-auto text-xs font-medium">
          {[
            { id: 'OVERVIEW', label: '👁️ System Overview' },
            { id: 'CANVAS', label: '🕸️ Graph Canvas' },
            { id: 'TIMELINE', label: '🎬 Story & Timeline' },
            { id: 'PANES', label: '🔬 5 Intelligence Panes' },
            { id: 'COPILOT', label: '🤖 Investigator Copilot' },
            { id: 'METRICS', label: '📊 Percentage Metrics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 font-bold shadow-xs'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-slate-300">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Welcome to NETRA (National Entity Tracking & Relationship Analysis)</span>
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  NETRA is designed for law enforcement analysts to transform raw police dossiers, FIRs, Call Detail Records (CDRs), and financial audits into explainable, evidence-grounded criminal network graphs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="text-amber-400 font-bold text-xs uppercase block">1. Left Sidebar</span>
                  <p className="text-slate-300 text-[11px]">
                    Access ingested case dossiers, upload PDFs/TXT files, view SHA-256 tamper-proof document hashes, and trigger AI entity extractions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="text-cyan-400 font-bold text-xs uppercase block">2. Center Canvas</span>
                  <p className="text-slate-300 text-[11px]">
                    Interactive Cytoscape network graph rendering 7 entity types (Person, Phone, Vehicle, Location, Org, Event, Transaction) with temporal cutoff controls.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold text-xs uppercase block">3. Right Intelligence Sidebar</span>
                  <p className="text-slate-300 text-[11px]">
                    Run 5 specialized analysis panes: <strong>Explain Connection</strong>, <strong>AI Insights</strong>, <strong>Network X-Ray</strong>, <strong>Entity Resolution</strong>, and <strong>Anomaly Radar</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CANVAS' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                🕸️ Crime Network Canvas Controls & Navigation
              </h3>
              
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[11px] font-bold">
                    Layout Switcher
                  </span>
                  <div>
                    <strong className="text-white">Force, Concentric, Tree, Circle:</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      <strong>Force</strong> applies physics simulation for organic clusters. <strong>Concentric</strong> places central influencer nodes in the middle ring. <strong>Tree</strong> displays hierarchical structures.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[11px] font-bold">
                    Entity Locator Search
                  </span>
                  <div>
                    <strong className="text-white">Locate Entity... Input:</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Type any suspect name, phone number, vehicle plate, or alias and press Enter to center and zoom on that node.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[11px] font-bold">
                    Filter Pills
                  </span>
                  <div>
                    <strong className="text-white">Entity Visibility Filters:</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Click color pills (Person, Phone, Vehicle, Location, Org, Event, Transaction) to toggle node visibility on the canvas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                🎬 Timeline Reconstruction & Cinematic Story Mode
              </h3>
              
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[11px]">
                  🎬 Cinematic Story Mode
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Converts extracted evidence logs, CDR intercepts, and location sightings into plain English movie-subtitle stories that typewriter-in as time steps forward.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li><strong>Click Yellow Entity Chips:</strong> Clicking any suspect or vehicle mentioned inside the story box immediately focuses the graph on that node.</li>
                  <li><strong>Play / Pause:</strong> Auto-steps through chronological milestones every 2.5 seconds.</li>
                  <li><strong>Time Slider Scrubber:</strong> Drag the slider left or right to scrub through case history in real time.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'PANES' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                🔬 The 5 Specialized Intelligence Panes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-cyan-400 font-bold text-xs">1. Explain Connection</span>
                  <p className="text-slate-400 text-[11px]">
                    Traces multi-hop shortest paths between any two suspects (e.g. Person A → Phone → Person B → Vehicle) with confidence scores.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-amber-400 font-bold text-xs">2. AI Insights Feed</span>
                  <p className="text-slate-400 text-[11px]">
                    Synthesizes cross-cluster bridges, high-frequency burner phone hubs, and financial conduit patterns with cited evidence snippets.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-emerald-400 font-bold text-xs">3. Network X-Ray</span>
                  <p className="text-slate-400 text-[11px]">
                    Evaluates graph topology using Degree Centrality, Betweenness Centrality, and Louvain modularity clustering.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-indigo-400 font-bold text-xs">4. Entity Resolution</span>
                  <p className="text-slate-400 text-[11px]">
                    Identifies potential duplicate suspect profiles or aliases using Jaro-Winkler string similarity for 1-click merging.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 col-span-1 md:col-span-2">
                  <span className="text-rose-400 font-bold text-xs">5. Anomaly Radar</span>
                  <p className="text-slate-400 text-[11px]">
                    Scans for communication frequency spikes, burner phone surges, and location co-presences with severity ratings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COPILOT' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                🤖 Grounded Investigator Copilot
              </h3>
              
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                <strong className="text-cyan-300 text-xs">RAG-Powered Case Inquiry:</strong>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Click the floating Copilot button in the bottom right to open an interactive assistant. All answers are strictly grounded in active case documents with verbatim evidence citations.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 italic">
                  "Copilot strictly rejects non-existent entity IDs and never outputs arbitrary criminality or guilt scores."
                </div>
              </div>
            </div>
          )}

          {activeTab === 'METRICS' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                📊 Percentage Metrics & Confidence Scores
              </h3>
              
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  Percentages in NETRA represent dynamic decision-support confidence scores derived from graph centrality and evidence matching to assist analysts:
                </p>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">80% – 100% (High Confidence)</span>
                    <span className="text-slate-400">High network prominence or strong multi-document evidence match.</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">50% – 79% (Medium Confidence)</span>
                    <span className="text-slate-400">Elevated corroboration requiring standard investigator follow-up.</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 font-bold">0% – 49% (Moderate/Baseline)</span>
                    <span className="text-slate-400">Baseline network presence or single-document lead.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#141b2d] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            NETRA Investigative Support Layer • Confidential
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all cursor-pointer shadow-xs"
          >
            Got It, Start Exploring
          </button>
        </div>

      </div>
    </div>
  );
};
