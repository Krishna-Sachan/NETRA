import React, { useRef } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { CaseIntelligenceReport, renderReportHTML } from '../services/reportService';
import { canExport } from '../services/accessPolicy';
import { recordAuditEvent } from '../services/auditService';
import { UserRole } from '../types';

interface CaseReportPaneProps {
  isOpen: boolean;
  onClose: () => void;
  report: CaseIntelligenceReport | null;
  currentRole: UserRole;
}

export const CaseReportPane: React.FC<CaseReportPaneProps> = ({
  isOpen,
  onClose,
  report,
  currentRole,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    const html = renderReportHTML(report);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
      recordAuditEvent({ action: 'EXPORTED_REPORT', role: currentRole, metadata: { method: 'print' } });
    }
  };

  const handleExportHTML = () => {
    const html = renderReportHTML(report);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netra_report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    recordAuditEvent({ action: 'EXPORTED_REPORT', role: currentRole, metadata: { method: 'html' } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0f19] border border-slate-700/80 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                Case Intelligence Report
              </h2>
              <div className="flex items-center space-x-2 text-[10px] font-mono">
                <span className="text-slate-400">
                  Generated: {new Date(report.generatedAt).toLocaleString()}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Role: {report.generatedByRole}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-[11px] rounded border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
              title="Print report"
            >
              <Printer className="w-3 h-3" />
              <span>Print</span>
            </button>
            {canExport(currentRole) && (
              <button
                onClick={handleExportHTML}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-[11px] rounded border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
                title="Export as HTML file"
              >
                <Download className="w-3 h-3" />
                <span>Export HTML</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6" ref={reportRef}>
          {/* Disclaimer Banner */}
          <div className="mb-6 p-3 rounded-lg bg-amber-950/20 border border-amber-700/40 text-xs text-amber-300/80 flex items-start space-x-2">
            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold font-mono text-[11px]">DECISION-SUPPORT DOCUMENT — NOT A LEGAL DETERMINATION</p>
              <p className="text-[10px] text-amber-400/60 mt-0.5">
                This report was generated from demo case data. It contains AI-assisted analysis for investigative support only.
                All conclusions require independent verification and human judgment.
              </p>
            </div>
          </div>

          {/* Sections */}
          {report.sections.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-800/60">
                {section.title}
              </h3>
              <div
                className="report-content text-xs text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Global report styles */}
      <style>{`
        .report-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.5rem 0;
          font-size: 0.75rem;
        }
        .report-content th,
        .report-content td {
          border: 1px solid rgba(51, 65, 85, 0.5);
          padding: 0.35rem 0.5rem;
          text-align: left;
        }
        .report-content th {
          background: rgba(15, 23, 42, 0.6);
          font-weight: 600;
          color: #94a3b8;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .report-content td {
          color: #cbd5e1;
        }
        .report-content code {
          background: rgba(15, 23, 42, 0.6);
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-size: 0.7rem;
          word-break: break-all;
          color: #67e8f9;
        }
        .report-content ul {
          padding-left: 1.2rem;
          margin: 0.3rem 0;
        }
        .report-content li {
          margin: 0.2rem 0;
        }
        .report-content .disclaimer {
          color: #ef4444;
          font-weight: 600;
          margin-top: 0.5rem;
          font-size: 0.7rem;
        }
        .report-content .cluster-block,
        .report-content .anomaly-block,
        .report-content .insight-block {
          border-left: 3px solid #0e7490;
          padding-left: 0.8rem;
          margin: 0.5rem 0;
        }
        .report-content .disclaimer-block p {
          color: #f59e0b;
          font-weight: 600;
          font-size: 0.7rem;
        }
        .report-content h4 {
          color: #e2e8f0;
          font-size: 0.8rem;
          margin: 0.3rem 0;
        }
        .report-content strong {
          color: #e2e8f0;
        }
        .report-content p {
          margin: 0.3rem 0;
        }
      `}</style>
    </div>
  );
};
