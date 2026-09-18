import React, { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Search, 
  Sliders, 
  Layers, 
  Eye, 
  Sparkles,
  Share2,
  Filter,
  User,
  Phone,
  Car,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Radio
} from 'lucide-react';
import { Entity, Relationship, EntityType, CaseDocument, UserRole } from '../types';
import { TimelineBar } from './TimelineBar';
import { normalizeDate } from '../services/timelineService';
import { getDisplayLabel } from '../services/accessPolicy';

interface CrimeNetworkPaneProps {
  documents?: CaseDocument[];
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  selectedRelationshipId: string | null;
  highlightedEntityIds?: string[];
  currentCutoffDate?: string | null;
  timelineRange?: { startDate: string | null; endDate: string | null } | null;
  communityColorMap?: Record<string, string>;
  onSelectEntity: (entity: Entity | null) => void;
  onSelectRelationship: (rel: Relationship | null) => void;
  onCutoffDateChange?: (date: string | null) => void;
  onClearTimelineFilter?: () => void;
  onTriggerXRay?: (mode: 'INFLUENCERS' | 'BRIDGES' | 'CLUSTERS' | 'ISOLATED') => void;
  onHighlightEntities?: (ids: string[]) => void;
  currentRole: UserRole;
}

const ENTITY_CONFIG: Record<EntityType, { label: string; color: string; bgClass: string; shape: string }> = {
  PERSON: { label: 'Person', color: '#06b6d4', bgClass: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40', shape: 'ellipse' },
  PHONE: { label: 'Phone', color: '#10b981', bgClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40', shape: 'round-rectangle' },
  VEHICLE: { label: 'Vehicle', color: '#f59e0b', bgClass: 'text-amber-400 border-amber-500/40 bg-amber-950/40', shape: 'diamond' },
  LOCATION: { label: 'Location', color: '#f43f5e', bgClass: 'text-rose-400 border-rose-500/40 bg-rose-950/40', shape: 'hexagon' },
  ORGANIZATION: { label: 'Organization', color: '#8b5cf6', bgClass: 'text-purple-400 border-purple-500/40 bg-purple-950/40', shape: 'round-diamond' },
  EVENT: { label: 'Event', color: '#38bdf8', bgClass: 'text-sky-400 border-sky-500/40 bg-sky-950/40', shape: 'octagon' },
  TRANSACTION: { label: 'Transaction', color: '#eab308', bgClass: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/40', shape: 'pentagon' }
};

export const CrimeNetworkPane: React.FC<CrimeNetworkPaneProps> = ({
  documents = [],
  entities,
  relationships,
  selectedEntityId,
  selectedRelationshipId,
  highlightedEntityIds = [],
  currentCutoffDate = null,
  timelineRange = null,
  communityColorMap = {},
  onSelectEntity,
  onSelectRelationship,
  onCutoffDateChange,
  onClearTimelineFilter,
  onTriggerXRay,
  onHighlightEntities,
  currentRole,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [activeLayout, setActiveLayout] = useState<'cose' | 'concentric' | 'circle' | 'breadthfirst'>('cose');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleTypes, setVisibleTypes] = useState<Record<EntityType, boolean>>({
    PERSON: true,
    PHONE: true,
    VEHICLE: true,
    LOCATION: true,
    ORGANIZATION: true,
    EVENT: true,
    TRANSACTION: true,
  });

  const [includeUndatedInTimeline, setIncludeUndatedInTimeline] = useState<boolean>(true);

  // Chronological verification: count resolved vs undated entities
  const temporalBreakdown = useMemo(() => {
    let resolvedCount = 0;
    let unknownCount = 0;
    entities.forEach(e => {
      const dates = [
        e.metadata?.firstSeenDate,
        ...(e.evidence || []).map(ev => ev.date)
      ].map(d => normalizeDate(d)).filter((d): d is string => d !== null);

      if (dates.length > 0) {
        if (timelineRange && (timelineRange.startDate || timelineRange.endDate)) {
          const inRange = dates.some(d => 
            (!timelineRange.startDate || d >= timelineRange.startDate) &&
            (!timelineRange.endDate || d <= timelineRange.endDate)
          );
          if (inRange) resolvedCount++;
        } else if (!currentCutoffDate || dates.some(d => d <= currentCutoffDate)) {
          resolvedCount++;
        }
      } else {
        unknownCount++;
      }
    });
    return { resolvedCount, unknownCount };
  }, [entities, currentCutoffDate, timelineRange]);

  // Filtered entities and relationships by type and timeline cutoff/range
  const visibleEntities = useMemo(() => {
    return entities.filter(e => {
      if (!visibleTypes[e.type]) return false;

      const dates = [
        e.metadata?.firstSeenDate,
        ...(e.evidence || []).map(ev => ev.date)
      ].map(d => normalizeDate(d)).filter((d): d is string => d !== null);

      if (timelineRange && (timelineRange.startDate || timelineRange.endDate)) {
        if (dates.length > 0) {
          const inRange = dates.some(d => 
            (!timelineRange.startDate || d >= timelineRange.startDate) &&
            (!timelineRange.endDate || d <= timelineRange.endDate)
          );
          if (!inRange) return false;
        } else {
          // Entity is undated / temporally unresolved
          if (!includeUndatedInTimeline) return false;
        }
      } else if (currentCutoffDate) {
        if (dates.length > 0) {
          const earliestDate = [...dates].sort()[0];
          if (earliestDate > currentCutoffDate) return false;
        } else {
          // Entity is undated / temporally unresolved
          if (!includeUndatedInTimeline) return false;
        }
      }
      return true;
    });
  }, [entities, visibleTypes, currentCutoffDate, timelineRange, includeUndatedInTimeline]);

  const visibleRelationships = useMemo(() => {
    const validIds = new Set(visibleEntities.map(e => e.id));
    return relationships.filter(r => {
      if (!validIds.has(r.sourceId) || !validIds.has(r.targetId)) return false;

      const dates = (r.evidence || [])
        .map(ev => normalizeDate(ev.date))
        .filter((d): d is string => d !== null);

      if (timelineRange && (timelineRange.startDate || timelineRange.endDate)) {
        if (dates.length > 0) {
          const inRange = dates.some(d => 
            (!timelineRange.startDate || d >= timelineRange.startDate) &&
            (!timelineRange.endDate || d <= timelineRange.endDate)
          );
          if (!inRange) return false;
        }
      } else if (currentCutoffDate) {
        if (dates.length > 0) {
          const earliestDate = [...dates].sort()[0];
          if (earliestDate > currentCutoffDate) return false;
        }
      }
      return true;
    });
  }, [relationships, visibleEntities, currentCutoffDate, timelineRange]);

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    // Build elements
    const elements: cytoscape.ElementDefinition[] = [];

    visibleEntities.forEach((entity) => {
      const isBridge = entity.metadata?.cluster?.includes('Bridge') || entity.metadata?.cluster?.includes('Nexus');
      const cfg = ENTITY_CONFIG[entity.type] || ENTITY_CONFIG.PERSON;
      const nodeColor = communityColorMap[entity.id] || cfg.color;

      const dates = [
        entity.metadata?.firstSeenDate,
        ...(entity.evidence || []).map(ev => ev.date)
      ].map(d => normalizeDate(d)).filter((d): d is string => d !== null);
      const isUndated = dates.length === 0;

      elements.push({
        group: 'nodes',
        data: {
          id: entity.id,
          label: isUndated && currentCutoffDate ? `${getDisplayLabel(currentRole, entity)} [?]` : getDisplayLabel(currentRole, entity),
          type: entity.type,
          isBridge: isBridge ? 'true' : 'false',
          isUndated: isUndated && currentCutoffDate ? 'true' : 'false',
          cluster: entity.metadata?.cluster || 'Unknown',
          color: nodeColor,
          shape: cfg.shape,
        },
      });
    });

    visibleRelationships.forEach((rel) => {
      elements.push({
        group: 'edges',
        data: {
          id: rel.id,
          source: rel.sourceId,
          target: rel.targetId,
          label: rel.type.replace(/_/g, ' '),
          confidence: rel.confidenceLabel,
        },
      });
    });

    // Destroy existing instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Create new Cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'border-color': '#0f172a',
            'border-width': 2,
            'label': 'data(label)',
            'color': '#cbd5e1',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'text-background-color': '#090e17',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'text-border-color': '#1e293b',
            'text-border-width': 1,
            'text-border-opacity': 0.8,
            'width': 28,
            'height': 28,
            'shape': 'data(shape)' as any,
            'transition-property': 'background-color, line-color, target-arrow-color, width, height',
            'transition-duration': 250,
          },
        },
        {
          selector: 'node[isBridge = "true"]',
          style: {
            'border-color': '#06b6d4',
            'border-width': 3,
            'width': 34,
            'height': 34,
          },
        },
        {
          selector: 'node[isUndated = "true"]',
          style: {
            'border-style': 'dashed',
            'border-color': '#94a3b8',
            'border-width': 2,
            'opacity': 0.65,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.8,
            'line-color': '#334155',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-family': 'Plus Jakarta Sans, sans-serif',
            'font-size': '8px',
            'color': '#94a3b8',
            'text-background-color': '#090e17',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
            'text-rotation': 'autorotate',
            'arrow-scale': 0.9,
          },
        },
        // Selected node highlight
        {
          selector: 'node:selected, node.selected-highlight',
          style: {
            'border-color': '#ffffff',
            'border-width': 4,
            'width': 38,
            'height': 38,
            'color': '#ffffff',
            'font-size': '11px',
            'font-weight': 'bold',
            'text-background-color': '#0f172a',
            'text-border-color': '#06b6d4',
            'text-border-width': 1.5,
          },
        },
        // Neighbor highlight
        {
          selector: 'node.neighbor-highlight',
          style: {
            'border-color': '#38bdf8',
            'border-width': 2.5,
            'opacity': 1,
          },
        },
        // Selected edge highlight
        {
          selector: 'edge:selected, edge.selected-highlight',
          style: {
            'width': 3.5,
            'line-color': '#06b6d4',
            'target-arrow-color': '#06b6d4',
            'color': '#38bdf8',
            'font-size': '9px',
            'font-weight': 'bold',
            'z-index': 99,
          },
        },
        // Dimmed when searching or focusing
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.18,
          },
        },
        // AI Insight Highlight
        {
          selector: 'node.ai-highlight',
          style: {
            'border-color': '#f59e0b',
            'border-width': 4,
            'width': 40,
            'height': 40,
            'color': '#fbbf24',
          },
        },
      ],
      layout: {
        name: activeLayout,
        animate: true,
        animationDuration: 500,
        // cose layout fine-tuning for non-overlapping graph
        idealEdgeLength: () => 100,
        nodeRepulsion: () => 45000,
        nodeOverlap: 20,
        gravity: 0.25,
      } as any,
    });

    cyRef.current = cy;

    // Node click
    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target;
      const clickedId = node.id();
      const entity = entities.find(e => e.id === clickedId) || null;
      onSelectEntity(entity);
      onSelectRelationship(null);

      // Highlight 1-hop neighborhood
      cy.elements().removeClass('selected-highlight neighbor-highlight dimmed ai-highlight');
      node.addClass('selected-highlight');
      const neighborhood = node.neighborhood();
      neighborhood.nodes().addClass('neighbor-highlight');
      neighborhood.edges().addClass('selected-highlight');
      cy.elements().not(node).not(neighborhood).addClass('dimmed');
    });

    // Edge click
    cy.on('tap', 'edge', (evt: EventObject) => {
      const edge = evt.target;
      const clickedId = edge.id();
      const rel = relationships.find(r => r.id === clickedId) || null;
      onSelectRelationship(rel);
      onSelectEntity(null);

      cy.elements().removeClass('selected-highlight neighbor-highlight dimmed ai-highlight');
      edge.addClass('selected-highlight');
      edge.connectedNodes().addClass('neighbor-highlight');
      cy.elements().not(edge).not(edge.connectedNodes()).addClass('dimmed');
    });

    // Canvas click (deselect)
    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        onSelectEntity(null);
        onSelectRelationship(null);
        cy.elements().removeClass('selected-highlight neighbor-highlight dimmed ai-highlight');
      }
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [visibleEntities, visibleRelationships, activeLayout, communityColorMap]);

  // Handle external selection update
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('selected-highlight neighbor-highlight dimmed ai-highlight');

    if (selectedEntityId) {
      const node = cy.getElementById(selectedEntityId);
      if (node.length > 0) {
        node.addClass('selected-highlight');
        const neighborhood = node.neighborhood();
        neighborhood.nodes().addClass('neighbor-highlight');
        neighborhood.edges().addClass('selected-highlight');
        cy.elements().not(node).not(neighborhood).addClass('dimmed');
        cy.animate({
          center: { eles: node },
          zoom: 1.25,
          duration: 400,
        });
      }
    } else if (selectedRelationshipId) {
      const edge = cy.getElementById(selectedRelationshipId);
      if (edge.length > 0) {
        edge.addClass('selected-highlight');
        edge.connectedNodes().addClass('neighbor-highlight');
        cy.elements().not(edge).not(edge.connectedNodes()).addClass('dimmed');
        cy.animate({
          center: { eles: edge },
          zoom: 1.25,
          duration: 400,
        });
      }
    } else if (highlightedEntityIds.length > 0) {
      const highlightedNodes = cy.nodes().filter(n => highlightedEntityIds.includes(n.id()));
      if (highlightedNodes.length > 0) {
        highlightedNodes.addClass('ai-highlight');
        const connectedEdges = highlightedNodes.connectedEdges();
        connectedEdges.addClass('selected-highlight');
        cy.elements().not(highlightedNodes).not(connectedEdges).addClass('dimmed');
        cy.animate({
          fit: { eles: highlightedNodes, padding: 80 },
          duration: 500,
        });
      }
    }
  }, [selectedEntityId, selectedRelationshipId, highlightedEntityIds]);

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cy = cyRef.current;
    if (!cy || !searchQuery.trim()) return;

    const matched = cy.nodes().filter(n => 
      n.data('label').toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.data('id').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matched.length > 0) {
      cy.elements().removeClass('selected-highlight neighbor-highlight dimmed');
      matched.addClass('selected-highlight');
      cy.elements().not(matched).addClass('dimmed');
      cy.animate({
        center: { eles: matched.first() },
        zoom: 1.4,
        duration: 400,
      });
      const ent = entities.find(x => x.id === matched.first().id()) || null;
      onSelectEntity(ent);
    }
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out' | 'fit') => {
    const cy = cyRef.current;
    if (!cy) return;
    if (direction === 'in') {
      cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    } else if (direction === 'out') {
      cy.zoom({ level: cy.zoom() / 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    } else {
      cy.elements().removeClass('dimmed selected-highlight neighbor-highlight ai-highlight');
      cy.fit(undefined, 50);
      onSelectEntity(null);
      onSelectRelationship(null);
    }
  };

  // Highlight bridge nodes
  const handleHighlightBridges = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const bridges = cy.nodes('[isBridge = "true"]');
    cy.elements().removeClass('dimmed selected-highlight neighbor-highlight ai-highlight');
    bridges.addClass('ai-highlight');
    bridges.connectedEdges().addClass('selected-highlight');
    cy.elements().not(bridges).not(bridges.connectedEdges()).addClass('dimmed');
    cy.fit(bridges, 60);
  };

  const toggleType = (t: EntityType) => {
    setVisibleTypes(prev => ({ ...prev, [t]: !prev[t] }));
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] relative overflow-hidden font-sans">
      {/* Top Controls Toolbar */}
      <div className="h-12 border-b border-slate-800/80 px-3.5 bg-[#0b0f19]/90 backdrop-blur-xl flex items-center justify-between z-10 select-none text-slate-200">
        {/* Left: Search Bar */}
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Locate entity..."
              className="bg-[#131927] border border-slate-700/80 rounded-lg px-3 py-1 text-xs text-slate-100 placeholder-slate-500 w-44 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 shadow-xs font-sans transition-all"
            />
          </form>
        </div>

        {/* Right: Layout Switcher & Zoom */}
        <div className="flex items-center space-x-2">
          {/* Layout Switcher */}
          <div className="flex items-center space-x-1 bg-[#131927] border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            {(['cose', 'concentric', 'breadthfirst', 'circle'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setActiveLayout(l)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeLayout === l
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {l === 'cose' ? 'Force' : l === 'breadthfirst' ? 'Tree' : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          {/* Zoom Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleZoom('in')}
              className="px-2 py-1 rounded-md bg-[#131927] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer transition-all"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="px-2 py-1 rounded-md bg-[#131927] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer transition-all"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => handleZoom('fit')}
              className="px-2.5 py-1 rounded-md bg-[#131927] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer transition-all"
              title="Fit View"
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      {/* Entity Type Filter Bar */}
      <div className="px-3.5 py-1.5 bg-[#0b0f19]/70 border-b border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar select-none z-10 text-xs font-sans">
        <span className="text-xs font-medium text-slate-400 mr-1">
          Filter:
        </span>
        {(Object.keys(ENTITY_CONFIG) as EntityType[]).map((type) => {
          const cfg = ENTITY_CONFIG[type];
          const isVisible = visibleTypes[type];
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border transition-all whitespace-nowrap cursor-pointer ${
                isVisible
                  ? 'bg-[#1a2336] border-slate-700 text-slate-100 shadow-xs'
                  : 'bg-[#131927]/60 text-slate-500 border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: isVisible ? cfg.color : '#64748b' }}
              />
              <span>{cfg.label}</span>
            </button>
          );
        })}

        {/* Temporal Cutoff Resolution Status & Toggle */}
        {currentCutoffDate && (
          <div className="flex items-center space-x-1.5 pl-2 ml-auto border-l border-slate-800 text-[10px] font-mono whitespace-nowrap">
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
              RESOLVED ≤ {currentCutoffDate}: {temporalBreakdown.resolvedCount}
            </span>
            <button
              onClick={() => setIncludeUndatedInTimeline(prev => !prev)}
              className={`px-2 py-0.5 rounded border transition-colors font-mono text-[10px] flex items-center space-x-1 ${
                includeUndatedInTimeline
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-900/60'
              }`}
              title="Toggle visibility of entities with no dated evidence in the current case file"
            >
              <span>{includeUndatedInTimeline ? 'UNDATED INCLUDED' : 'UNDATED HIDDEN'}</span>
              <span className="opacity-70">({temporalBreakdown.unknownCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Timeline Range Filter Banner */}
      {timelineRange && (timelineRange.startDate || timelineRange.endDate) && (
        <div className="px-3 py-1.5 bg-cyan-950/80 border-b border-cyan-500/40 flex items-center justify-between text-[11px] font-mono text-cyan-200 z-10">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>
              Active Timeline Filter: <strong className="text-white">{timelineRange.startDate || 'Earliest'}</strong> to <strong className="text-white">{timelineRange.endDate || 'Latest'}</strong>
            </span>
            <span className="text-[10px] text-cyan-400/80">
              ({visibleEntities.length} entities, {visibleRelationships.length} relationships in range)
            </span>
          </div>
          <button
            onClick={() => onClearTimelineFilter?.()}
            className="px-2 py-0.5 rounded bg-cyan-800/80 hover:bg-cyan-700 text-white text-[10px] font-mono transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Interactive Cytoscape Canvas */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full bg-command-grid bg-radial-glow cursor-grab active:cursor-grabbing"
      />

      {/* Horizontal Timeline Reconstruction Bar */}
      <div className="w-full z-20">
        <TimelineBar
          documents={documents}
          entities={entities}
          relationships={relationships}
          currentCutoffDate={currentCutoffDate}
          onCutoffDateChange={(d) => onCutoffDateChange?.(d)}
          onHighlightEntities={(ids) => onHighlightEntities?.(ids)}
          onSelectEntity={(id) => onSelectEntity(entities.find(e => e.id === id) || null)}
        />
      </div>
    </div>
  );
};
