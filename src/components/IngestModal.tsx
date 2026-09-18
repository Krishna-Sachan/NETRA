import React, { useState, useRef } from 'react';
import { CaseDocument, DocumentType } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import { computeSHA256FromText } from '../services/integrityService';
import { Upload, FileText, CheckCircle2, X, AlertCircle, FileCode, Sparkles } from 'lucide-react';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractDocument: (doc: CaseDocument) => Promise<void>;
  isExtracting: boolean;
}

const NEW_SYNTHETIC_FIR: CaseDocument = {
  id: 'DOC-FIR-209',
  title: 'FIR No. 209/2024: Maritime Interception of Trawler M.V. Sagar Jyoti off Digha Coast',
  type: 'FIR',
  date: '2024-12-04',
  sourceAuthority: 'Coast Guard District HQ No. 8 (Haldia) & Coastal Marine Police',
  classification: 'CONFIDENTIAL',
  summary: 'Interception of motorized fishing trawler M.V. Sagar Jyoti 14 nautical miles off Digha coast, recovering water-sealed arms consignments and secondary satellite handset +91-91672-00384.',
  content: `FIRST INFORMATION REPORT (Under Sec 154 Cr.P.C.)
Police Station: Coastal Marine Police Station Digha, Purba Medinipur
Case FIR No: 209/2024 | Date of Incident: 04-Dec-2024 at 03:45 hrs
Complainant: Assistant Commandant Pradeep Verma (ICGS Varad)

1. INTERCEPTION OF MARITIME VESSEL:
On nocturnal patrol coordinates 21°34'N 87°32'E, naval radar locked onto an unflagged wooden fishing vessel navigating without AIS beacon. Upon boarding, vessel was identified as M.V. Sagar Jyoti, captained by Tapan "Kalu" Mondal, resident of Contai, West Bengal.

2. SUSPECT STATEMENTS & CONNECTED OPERATIVES:
Captain Tapan "Kalu" Mondal stated that vessel clearance and fuel provisioning were arranged by Subhash "Bhai" Nayak at Jetty 3, Haldia Port Docks. Cargo manifested as salted dried fish concealed six sealed fiberglass Pelican cases containing unauthorized arms and electronic transceivers. Mondal admitted receiving routing navigation coordinates via satellite mobile number +91-91672-00384 from overseas coordinator Tariq "Raza" Merchant.

3. RECOVERED TECHNICAL & FINANCIAL EVIDENCE:
Officers seized satellite communicator +91-91672-00384 along with a paper slip noting cash delivery authorization coded "APX-HAL-PAYOUT", referencing Apex Freight Forwarders Pvt Ltd. Vessel M.V. Sagar Jyoti and six crew members were remanded to judicial custody.`
};

export const IngestModal: React.FC<IngestModalProps> = ({
  isOpen,
  onClose,
  onExtractDocument,
  isExtracting,
  initialTab = 'custom'
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'custom'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [selectedSample, setSelectedSample] = useState<CaseDocument>(NEW_SYNTHETIC_FIR);

  // Custom document form state
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState<DocumentType>('FIR');
  const [customAuthority, setCustomAuthority] = useState('Crime Branch Special Unit');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [customContent, setCustomContent] = useState('');
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processFile = (file: File) => {
    setValidationError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      let rawResult = ev.target?.result as string || '';

      // If binary/PDF style strings present, clean & extract printable text
      if (rawResult.includes('%PDF-') || ext === 'pdf') {
        // Simple printable string extraction for raw PDF buffers
        const matches = rawResult.match(/[^\x00-\x1F\x7F-\xFF\r\n\t]{3,}/g);
        if (matches && matches.length > 0) {
          rawResult = matches.filter(s => s.length > 4 && !s.includes('obj') && !s.includes('endobj')).join('\n');
        }
      }

      if (!rawResult.trim()) {
        setValidationError('File appeared empty or binary format could not be converted to plain text.');
        return;
      }

      setCustomContent(rawResult);
      setUploadedFile({
        name: file.name,
        size: formatFileSize(file.size),
        type: ext.toUpperCase() || 'FILE'
      });

      // Auto-set title if blank
      if (!customTitle) {
        setCustomTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }

      // Auto-detect Document Type from contents or filename
      const contentUpper = (file.name + ' ' + rawResult).toUpperCase();
      if (contentUpper.includes('FIR') || contentUpper.includes('FIRST INFORMATION REPORT')) {
        setCustomType('FIR');
      } else if (contentUpper.includes('CDR') || contentUpper.includes('CALL DETAIL')) {
        setCustomType('CDR');
      } else if (contentUpper.includes('FINANCIAL') || contentUpper.includes('BANK') || contentUpper.includes('TRANSACTION')) {
        setCustomType('Financial');
      } else if (contentUpper.includes('SURVEILLANCE') || contentUpper.includes('LOG')) {
        setCustomType('Surveillance');
      } else if (contentUpper.includes('INTEL')) {
        setCustomType('Intelligence Note');
      }
    };

    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClearUploadedFile = () => {
    setUploadedFile(null);
    setCustomContent('');
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExtract = async () => {
    setValidationError(null);
    if (activeTab === 'sample') {
      const hash = await computeSHA256FromText(selectedSample.content);
      const docWithHash: CaseDocument = {
        ...selectedSample,
        sha256Hash: hash,
        contentSource: selectedSample.contentSource || 'SAMPLE_DATA'
      };
      await onExtractDocument(docWithHash);
      onClose();
    } else {
      if (!customTitle.trim()) {
        setValidationError('Please enter a document title or heading.');
        return;
      }
      if (!customContent.trim()) {
        setValidationError('Please upload a file or paste document case text.');
        return;
      }

      const hash = await computeSHA256FromText(customContent);
      const newDoc: CaseDocument = {
        id: `DOC-CUST-${Date.now().toString().slice(-4)}`,
        title: customTitle,
        type: customType,
        date: customDate,
        sourceAuthority: customAuthority,
        classification: 'CONFIDENTIAL',
        summary: customContent.slice(0, 160).replace(/[\r\n]+/g, ' ') + '...',
        content: customContent,
        isCustom: true,
        sha256Hash: hash,
        contentSource: uploadedFile ? 'FILE_UPLOAD' : 'PASTED_TEXT'
      };

      await onExtractDocument(newDoc);
      onClose();
    }
  };

  const handleLoadTestSample1 = () => {
    setValidationError(null);
    const content = `FIRST INFORMATION REPORT (Under Sec 154 Cr.P.C.)
Police Station: Special Task Force (STF) Marine Cell, Kolkata
Case FIR No: 104/2025 | Date of Incident: 12-Feb-2025 at 02:15 hrs

1. INCIDENT BRIEF & MARITIME INTERCEPTION:
On midnight surveillance operation off Kakdwip Jetty, STF tactical team intercepted unregistered motorized vessel M.V. Jal Sundari. Captain Bikram "Raju" Biswas was apprehended alongside deck crew member Suman "Kalu" Haldar.

2. RECOVERED CONTRABAND & ELECTRONIC EVIDENCE:
Inspection revealed 14 water-sealed consignments containing encrypted satellite transceivers (+91-98311-00492) and 2.4 kg contraband gold bullion. Suspect Bikram Biswas confessed that logistics were coordinated by Hawala banker Ramesh "Seth" Sharma operating out of Burrabazar, Kolkata.

3. FINANCIAL & NETWORK CONNECTIONS:
Seized mobile ledger notes cash transfers totaling Rs 18,50,000 sent to Bengal Maritime Cooperative account managed by Prabir Das. Transceiver +91-98311-00492 logged direct calls to burner handset +91-91672-00384 operated by syndicate handler Rina Begum.`;

    setCustomTitle('FIR No. 104/2025: Interception of M.V. Jal Sundari at Kakdwip Jetty');
    setCustomType('FIR');
    setCustomAuthority('STF Marine Cell, Kolkata');
    setCustomDate('2025-02-12');
    setCustomContent(content);
    setUploadedFile({
      name: 'sample_test_fir_104.txt',
      size: '1.2 KB',
      type: 'TXT'
    });
  };

  const handleLoadTestSample2 = () => {
    setValidationError(null);
    const content = `CALL DETAIL RECORD & FINANCIAL INTELLIGENCE ANALYSIS REPORT
Ref Doc: DOC-CDR-904 | Date of Compilation: 28-Feb-2025
Issuing Authority: Financial Intelligence Unit (FIU-IND) & NTRO Interception Wing

1. INTERCEPT SUMMARY & PHONE NETWORK TRAIL:
Analysis of CDR logs for target phone +91-98740-11223 (registered under alias Ankur "Vicky" Roy) reveals high-frequency nocturnal call spikes (42 calls between 01:00 hrs and 04:30 hrs) to satellite handset +91-98311-00492 used by contraband operative Bikram Biswas.

2. CROSS-BORDER HAWALA TRANSACTIONS:
FIU audit flagged structured cash deposits amounting to Rs 24,00,000 across 6 accounts at Metro Co-operative Bank. Wire transfers originated from account held by Subhash "Bhai" Nayak at Haldia Docks and were routed to shell firm Apex Freight Forwarders Pvt Ltd.

3. OPERATIONAL LINKAGES & VEHICLE LOGISTICS:
Vehicle surveillance log verified pickup truck WB-74-C-5521 driven by Harun Mollah staged at Lalbagh River Dock. Mollah received direct routing instructions from Jayanta Das via phone +91-94321-44521.`;

    setCustomTitle('DOC-CDR-904: Hawala Network & Call Spikes Intercept Report');
    setCustomType('CDR');
    setCustomAuthority('Financial Intelligence Unit (FIU-IND)');
    setCustomDate('2025-02-28');
    setCustomContent(content);
    setUploadedFile({
      name: 'sample_hawala_cdr_904.txt',
      size: '1.4 KB',
      type: 'TXT'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>Ingest Case Document</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Extract structured entities & relationships grounded in verifiable source snippets.
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-medium bg-slate-100/60">
          <button
            onClick={() => setActiveTab('sample')}
            className={`flex-1 py-2.5 px-4 text-center border-b-2 transition-all cursor-pointer font-sans ${
              activeTab === 'sample'
                ? 'border-slate-900 text-slate-900 bg-white font-bold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            Select Sample Case File
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2.5 px-4 text-center border-b-2 transition-all cursor-pointer font-sans ${
              activeTab === 'custom'
                ? 'border-slate-900 text-slate-900 bg-white font-bold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
            }`}
          >
            Upload Custom File / Paste Text
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          {activeTab === 'sample' ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 font-medium mb-1">
                Select an investigative sample dossier to extract into the network graph:
              </div>

              <div className="space-y-2">
                {[NEW_SYNTHETIC_FIR, ...SAMPLE_DOCUMENTS].map((doc) => {
                  const isSelected = selectedSample.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedSample(doc)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white border-slate-400 shadow-sm border-l-4 border-l-slate-900 ring-1 ring-slate-900/10'
                          : 'bg-slate-50/70 hover:bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200/80 text-slate-800 border border-slate-300">
                          {doc.type} • {doc.id}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">{doc.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mb-1">{doc.title}</h4>
                      <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed font-normal">{doc.summary}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Inline Error Alert */}
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Drag & Drop File Upload Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    1. Drag & Drop File or Choose Document
                  </label>
                  <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    PDF, TXT, DOCX, CSV, JSON
                  </span>
                </div>

                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-100/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.text,.log,.pdf,.doc,.docx,.json,.csv,.md"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-3 rounded-full bg-slate-200/80 text-slate-700">
                        <Upload className="w-6 h-6 text-slate-700" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          Click to browse file
                        </span>
                        <span className="text-xs text-slate-500"> or drag & drop here</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal">
                        Supports PDF, TXT, DOCX, LOG, CSV, JSON, Markdown (.txt, .pdf, .log, .csv, .json)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-300 flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-emerald-700 text-white font-bold text-[10px] uppercase font-mono">
                        {uploadedFile.type}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{uploadedFile.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="text-[11px] text-emerald-800 font-mono">
                          {uploadedFile.size} • Extracted successfully
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearUploadedFile}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-emerald-100 transition-all"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick 1-Click Test File Loaders */}
                <div className="pt-2 flex items-center space-x-2">
                  <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                    Instant Test Presets:
                  </span>
                  <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={handleLoadTestSample1}
                      className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      ⚡ Test File 1: Trawler FIR
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadTestSample2}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      ⚡ Test File 2: Hawala CDR
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Metadata Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                  2. Document Metadata
                </label>
                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Special Field Interception Report #402"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-sans shadow-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                        Doc Type
                      </label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value as DocumentType)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-sans shadow-xs"
                      >
                        <option value="FIR">FIR</option>
                        <option value="CDR">CDR</option>
                        <option value="Financial">Financial Audit</option>
                        <option value="Surveillance">Surveillance</option>
                        <option value="Intelligence Note">Intel Note</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                        Authority
                      </label>
                      <input
                        type="text"
                        value={customAuthority}
                        onChange={(e) => setCustomAuthority(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-sans shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                        Date
                      </label>
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-sans shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Document Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    3. Case Document Text
                  </label>
                  {customContent.trim() && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {customContent.length} chars • {customContent.split(/\s+/).filter(Boolean).length} words
                    </span>
                  )}
                </div>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={6}
                  placeholder="Paste verbatim intelligence text, FIR report body, or CDR transcript here..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-mono leading-relaxed shadow-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 text-xs font-medium cursor-pointer transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleExtract}
            disabled={isExtracting}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-md flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isExtracting ? 'Extracting Entities...' : 'Run Graph Extraction'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
