/**
 * NETRA Phase 4 — Fictional Demo Case Scenarios
 *
 * FICTIONAL DEMO DATA — These scenarios are entirely synthetic.
 * They do NOT represent real people, real phone numbers, or real investigations.
 * Each case is an isolated fixture that can be loaded independently.
 */

import { SampleCase } from '../types';

export const SAMPLE_CASES: SampleCase[] = [
  // ===== CASE 1: Western Corridor Syndicate (Default — uses existing data) =====
  // The default case is loaded from initialGraph.ts and sampleDocuments.ts
  // This entry serves as the menu descriptor only.
  {
    id: 'CASE-WESTERN-CORRIDOR',
    name: 'Western Corridor Syndicate',
    description: 'Cross-border logistics network intercepted during Bhiwandi raid. Involves freight handlers, overseas coordinators, and shell company financing.',
    documents: [], // Loaded from sampleDocuments.ts
    entities: [],  // Loaded from initialGraph.ts
    relationships: [],
    insights: [],
  },

  // ===== CASE 2: Eastern Riverine Network =====
  {
    id: 'CASE-EASTERN-RIVERINE',
    name: 'Eastern Riverine Smuggling Ring',
    description: 'Waterway-based contraband movement along riverine border crossings with involvement of fishing trawler operators and local middlemen.',
    documents: [
      {
        id: 'DOC-FIR-301',
        title: 'FIR No. 301/2025: Riverine Intercept at Farakka Barrage Checkpoint',
        type: 'FIR',
        date: '2025-01-18',
        sourceAuthority: 'BSF River Division (South Bengal Frontier)',
        classification: 'CONFIDENTIAL',
        summary: 'Interception of motorized country boat near Farakka carrying undeclared cargo and satellite communication devices.',
        contentSource: 'SAMPLE_DATA',
        content: `FIRST INFORMATION REPORT
Case FIR No: 301/2025 | Date: 18-Jan-2025
Complainant: Sub Inspector Debashis Mukherjee (BSF)

1. INTERCEPTION DETAILS:
During routine river patrol near Farakka Barrage, BSF personnel intercepted a motorized country boat operated by Harun Mollah of Murshidabad. The vessel carried undeclared cargo concealed under fishing nets. Satellite phone device +91-70012-99877 was recovered from the boat cabin.

2. SUSPECT INTERROGATION:
Harun Mollah stated he received cargo pickup instructions from Bimal Sardar who operates from Baharampur fish market. Mollah admitted to three prior deliveries during monsoon season coordinated through encrypted messaging app.

3. CARGO EXAMINATION:
Inspection revealed 14 sealed waterproof packages containing electronic components and undeclared pharmaceutical materials. Delivery was intended for Rina Begum at Lalbagh river dock.`,
      },
      {
        id: 'DOC-CDR-302',
        title: 'CDR Analysis: Riverine Communication Network Intercept',
        type: 'CDR',
        date: '2025-02-05',
        sourceAuthority: 'NTRO Signal Intelligence Unit',
        classification: 'CONFIDENTIAL',
        summary: 'Communication intercept analysis showing encrypted messaging patterns between riverine operatives.',
        contentSource: 'SAMPLE_DATA',
        content: `CDR INTERCEPT ANALYSIS REPORT
Reference: CDR-RIV-302/2025

1. COMMUNICATION PATTERN ANALYSIS:
Analysis of satellite phone +91-70012-99877 recovered from Harun Mollah reveals 28 calls to fixed contact Bimal Sardar mobile +91-94321-66782 between Dec-2024 and Jan-2025. Tower pings locate calls primarily near Baharampur and Farakka corridors.

2. SECOND TIER CONTACTS:
Bimal Sardar device +91-94321-66782 shows upstream calls to unregistered device +91-88001-45521 attributed to logistics coordinator known as Jayanta Das based in Malda district. Jayanta Das also contacted Rina Begum via messaging app with delivery coordinates.

3. FINANCIAL MESSAGING:
Text messages from +91-88001-45521 reference cash codes "RIV-PAY-050" and "DOCK-CLEAR" suggesting pre-arranged payment confirmations for cargo clearances.`,
      },
      {
        id: 'DOC-FIN-303',
        title: 'Financial Intelligence: Suspicious Cash Deposits in Baharampur District',
        type: 'Financial',
        date: '2025-02-20',
        sourceAuthority: 'Financial Intelligence Unit (FIU-IND)',
        classification: 'RESTRICTED',
        summary: 'Pattern of structured cash deposits across multiple cooperative bank accounts linked to riverine network operatives.',
        contentSource: 'SAMPLE_DATA',
        content: `SUSPICIOUS TRANSACTION REPORT
Reference: STR-FIU-2025-0303

1. ACCOUNT ACTIVITY:
Multiple cooperative bank accounts in Baharampur branch show structured deposits of Rs 48,000 each (below reporting threshold) from Bimal Sardar and associate Paresh Ghosh between October 2024 and January 2025. Total deposited: Rs 5,76,000.

2. BENEFICIARY ACCOUNTS:
Deposits were subsequently wire-transferred to account held by Maa Ganga Fisheries Cooperative (Reg: WB-FISH-2019-4401), a registered entity with Paresh Ghosh as secretary. Account shows outflows to equipment suppliers in Kolkata and Siliguri.

3. FINANCIAL NETWORK:
Rina Begum account at separate branch received three inward transfers of Rs 1,20,000 each from Maa Ganga Fisheries Cooperative during November-December 2024.`,
      },
      {
        id: 'DOC-SURV-304',
        title: 'Surveillance Log: Baharampur Fish Market Operations',
        type: 'Surveillance',
        date: '2025-03-01',
        sourceAuthority: 'CID Special Branch (West Bengal)',
        classification: 'CONFIDENTIAL',
        summary: 'Physical surveillance of fish market operations revealing cargo staging and operative meetings.',
        contentSource: 'SAMPLE_DATA',
        content: `SURVEILLANCE OPERATION LOG
Operation: NADI WATCH | Reference: SURV-304/2025

1. OBSERVATION SUMMARY:
Surveillance team observed Bimal Sardar conducting regular meetings at Stall 14, Baharampur Central Fish Market with various individuals between 0500-0700 hours. On 22-Feb-2025, Sardar was seen receiving a sealed packet from Jayanta Das who arrived in a white Tata Ace mini truck bearing registration WB-74-C-5521.

2. VEHICLE TRACKING:
Vehicle WB-74-C-5521 registered to Jayanta Das of Malda was subsequently tracked to Lalbagh river dock where goods were transferred to Rina Begum warehouse adjacent to Lalbagh Ghat. Warehouse operates under signage of Maa Ganga Fisheries Cooperative.

3. COMMUNICATION OBSERVATION:
During market meeting on 28-Feb-2025, Bimal Sardar was observed using device +91-94321-66782 in conversation lasting 12 minutes. Post-call, Sardar dispatched two assistants toward river loading area with cargo manifests.`,
      },
    ],
    entities: [
      {
        id: 'ENT-PERS-R01', type: 'PERSON', label: 'Harun Mollah',
        aliases: ['Mollah', 'Harun Boatman'],
        metadata: { cluster: 'Riverine Transport Cell', firstSeenDate: '2025-01-18', notes: 'Country boat operator intercepted at Farakka.' },
        evidence: [{ documentId: 'DOC-FIR-301', documentTitle: 'FIR No. 301/2025', snippet: 'BSF personnel intercepted a motorized country boat operated by Harun Mollah of Murshidabad', date: '2025-01-18', confidence: 'HIGH' }],
      },
      {
        id: 'ENT-PERS-R02', type: 'PERSON', label: 'Bimal Sardar',
        aliases: ['Bimal Da'],
        metadata: { cluster: 'Riverine Transport Cell', firstSeenDate: '2025-01-18', notes: 'Fish market coordinator.' },
        evidence: [
          { documentId: 'DOC-FIR-301', documentTitle: 'FIR No. 301/2025', snippet: 'Harun Mollah stated he received cargo pickup instructions from Bimal Sardar who operates from Baharampur fish market', date: '2025-01-18', confidence: 'CORROBORATED' },
          { documentId: 'DOC-SURV-304', documentTitle: 'Surveillance Log', snippet: 'Surveillance team observed Bimal Sardar conducting regular meetings at Stall 14, Baharampur Central Fish Market', date: '2025-03-01', confidence: 'CORROBORATED' },
        ],
      },
      {
        id: 'ENT-PERS-R03', type: 'PERSON', label: 'Jayanta Das',
        aliases: ['Jay', 'Malda Jay'],
        metadata: { cluster: 'Logistics Coordination', firstSeenDate: '2025-02-05', notes: 'Logistics coordinator in Malda district.' },
        evidence: [
          { documentId: 'DOC-CDR-302', documentTitle: 'CDR Analysis', snippet: 'unregistered device +91-88001-45521 attributed to logistics coordinator known as Jayanta Das based in Malda district', date: '2025-02-05', confidence: 'INDICATIVE' },
          { documentId: 'DOC-SURV-304', documentTitle: 'Surveillance Log', snippet: 'Sardar was seen receiving a sealed packet from Jayanta Das who arrived in a white Tata Ace mini truck bearing registration WB-74-C-5521', date: '2025-03-01', confidence: 'CORROBORATED' },
        ],
      },
      {
        id: 'ENT-PERS-R04', type: 'PERSON', label: 'Rina Begum',
        aliases: ['Rina Bibi'],
        metadata: { cluster: 'Lalbagh Distribution', firstSeenDate: '2025-01-18', notes: 'Warehouse operator at Lalbagh Ghat.' },
        evidence: [
          { documentId: 'DOC-FIR-301', documentTitle: 'FIR No. 301/2025', snippet: 'Delivery was intended for Rina Begum at Lalbagh river dock', date: '2025-01-18', confidence: 'REPORTED' },
          { documentId: 'DOC-FIN-303', documentTitle: 'Financial Intelligence', snippet: 'Rina Begum account at separate branch received three inward transfers of Rs 1,20,000 each from Maa Ganga Fisheries Cooperative', date: '2025-02-20', confidence: 'CORROBORATED' },
        ],
      },
      {
        id: 'ENT-PERS-R05', type: 'PERSON', label: 'Paresh Ghosh',
        aliases: [],
        metadata: { cluster: 'Financial Shell', firstSeenDate: '2025-02-20', notes: 'Secretary of Maa Ganga Fisheries Cooperative.' },
        evidence: [{ documentId: 'DOC-FIN-303', documentTitle: 'Financial Intelligence', snippet: 'structured deposits of Rs 48,000 each (below reporting threshold) from Bimal Sardar and associate Paresh Ghosh', date: '2025-02-20', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-PHONE-R01', type: 'PHONE', label: '+91-70012-99877',
        aliases: ['Harun Sat Phone'],
        metadata: { firstSeenDate: '2025-01-18' },
        evidence: [{ documentId: 'DOC-FIR-301', documentTitle: 'FIR No. 301/2025', snippet: 'Satellite phone device +91-70012-99877 was recovered from the boat cabin', date: '2025-01-18', confidence: 'HIGH' }],
      },
      {
        id: 'ENT-PHONE-R02', type: 'PHONE', label: '+91-94321-66782',
        aliases: ['Bimal Mobile'],
        metadata: { firstSeenDate: '2025-02-05' },
        evidence: [{ documentId: 'DOC-CDR-302', documentTitle: 'CDR Analysis', snippet: 'satellite phone +91-70012-99877 recovered from Harun Mollah reveals 28 calls to fixed contact Bimal Sardar mobile +91-94321-66782', date: '2025-02-05', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-PHONE-R03', type: 'PHONE', label: '+91-88001-45521',
        aliases: ['Jayanta Device'],
        metadata: { firstSeenDate: '2025-02-05' },
        evidence: [{ documentId: 'DOC-CDR-302', documentTitle: 'CDR Analysis', snippet: 'unregistered device +91-88001-45521 attributed to logistics coordinator known as Jayanta Das', date: '2025-02-05', confidence: 'INDICATIVE' }],
      },
      {
        id: 'ENT-VEH-R01', type: 'VEHICLE', label: 'WB-74-C-5521',
        aliases: ['White Tata Ace'],
        metadata: { firstSeenDate: '2025-03-01' },
        evidence: [{ documentId: 'DOC-SURV-304', documentTitle: 'Surveillance Log', snippet: 'Jayanta Das who arrived in a white Tata Ace mini truck bearing registration WB-74-C-5521', date: '2025-03-01', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-LOC-R01', type: 'LOCATION', label: 'Farakka Barrage Checkpoint',
        aliases: ['Farakka'],
        metadata: { firstSeenDate: '2025-01-18' },
        evidence: [{ documentId: 'DOC-FIR-301', documentTitle: 'FIR No. 301/2025', snippet: 'During routine river patrol near Farakka Barrage, BSF personnel intercepted a motorized country boat', date: '2025-01-18', confidence: 'HIGH' }],
      },
      {
        id: 'ENT-LOC-R02', type: 'LOCATION', label: 'Baharampur Fish Market',
        aliases: ['Stall 14'],
        metadata: { firstSeenDate: '2025-03-01' },
        evidence: [{ documentId: 'DOC-SURV-304', documentTitle: 'Surveillance Log', snippet: 'Surveillance team observed Bimal Sardar conducting regular meetings at Stall 14, Baharampur Central Fish Market', date: '2025-03-01', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-LOC-R03', type: 'LOCATION', label: 'Lalbagh River Dock',
        aliases: ['Lalbagh Ghat'],
        metadata: { firstSeenDate: '2025-03-01' },
        evidence: [{ documentId: 'DOC-SURV-304', documentTitle: 'Surveillance Log', snippet: 'Vehicle WB-74-C-5521 registered to Jayanta Das of Malda was subsequently tracked to Lalbagh river dock', date: '2025-03-01', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-ORG-R01', type: 'ORGANIZATION', label: 'Maa Ganga Fisheries Cooperative',
        aliases: ['MGFC'],
        metadata: { firstSeenDate: '2025-02-20', notes: 'Registered cooperative used as financial front.' },
        evidence: [{ documentId: 'DOC-FIN-303', documentTitle: 'Financial Intelligence', snippet: 'Maa Ganga Fisheries Cooperative (Reg: WB-FISH-2019-4401), a registered entity with Paresh Ghosh as secretary', date: '2025-02-20', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-TXN-R01', type: 'TRANSACTION', label: 'Structured Deposits (Rs 5,76,000)',
        aliases: [],
        metadata: { firstSeenDate: '2025-02-20' },
        evidence: [{ documentId: 'DOC-FIN-303', documentTitle: 'Financial Intelligence', snippet: 'structured deposits of Rs 48,000 each (below reporting threshold) from Bimal Sardar and associate Paresh Ghosh between October 2024 and January 2025. Total deposited: Rs 5,76,000', date: '2025-02-20', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-TXN-R02', type: 'TRANSACTION', label: 'Wire Transfers to Rina Begum (Rs 3,60,000)',
        aliases: [],
        metadata: { firstSeenDate: '2025-02-20' },
        evidence: [{ documentId: 'DOC-FIN-303', documentTitle: 'Financial Intelligence', snippet: 'Rina Begum account at separate branch received three inward transfers of Rs 1,20,000 each from Maa Ganga Fisheries Cooperative during November-December 2024', date: '2025-02-20', confidence: 'CORROBORATED' }],
      },
    ],
    relationships: [
      { id: 'REL-R01', sourceId: 'ENT-PERS-R01', targetId: 'ENT-PERS-R02', type: 'communicated_with', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-FIR-301', snippet: 'Harun Mollah stated he received cargo pickup instructions from Bimal Sardar', date: '2025-01-18', confidence: 'CORROBORATED' }] },
      { id: 'REL-R02', sourceId: 'ENT-PERS-R01', targetId: 'ENT-PHONE-R01', type: 'possesses_device', confidenceLabel: 'HIGH', evidence: [{ documentId: 'DOC-FIR-301', snippet: 'Satellite phone device +91-70012-99877 was recovered from the boat cabin', date: '2025-01-18', confidence: 'HIGH' }] },
      { id: 'REL-R03', sourceId: 'ENT-PHONE-R01', targetId: 'ENT-PHONE-R02', type: 'communicated_with', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-CDR-302', snippet: 'satellite phone +91-70012-99877 recovered from Harun Mollah reveals 28 calls to fixed contact Bimal Sardar mobile +91-94321-66782', date: '2025-02-05', confidence: 'CORROBORATED' }] },
      { id: 'REL-R04', sourceId: 'ENT-PERS-R02', targetId: 'ENT-PHONE-R02', type: 'possesses_device', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-CDR-302', snippet: 'fixed contact Bimal Sardar mobile +91-94321-66782', date: '2025-02-05', confidence: 'CORROBORATED' }] },
      { id: 'REL-R05', sourceId: 'ENT-PERS-R03', targetId: 'ENT-PHONE-R03', type: 'possesses_device', confidenceLabel: 'INDICATIVE', evidence: [{ documentId: 'DOC-CDR-302', snippet: 'unregistered device +91-88001-45521 attributed to logistics coordinator known as Jayanta Das', date: '2025-02-05', confidence: 'INDICATIVE' }] },
      { id: 'REL-R06', sourceId: 'ENT-PHONE-R02', targetId: 'ENT-PHONE-R03', type: 'communicated_with', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-CDR-302', snippet: 'Bimal Sardar device +91-94321-66782 shows upstream calls to unregistered device +91-88001-45521', date: '2025-02-05', confidence: 'CORROBORATED' }] },
      { id: 'REL-R07', sourceId: 'ENT-PERS-R03', targetId: 'ENT-PERS-R04', type: 'communicated_with', confidenceLabel: 'INDICATIVE', evidence: [{ documentId: 'DOC-CDR-302', snippet: 'Jayanta Das also contacted Rina Begum via messaging app with delivery coordinates', date: '2025-02-05', confidence: 'INDICATIVE' }] },
      { id: 'REL-R08', sourceId: 'ENT-PERS-R03', targetId: 'ENT-VEH-R01', type: 'operates_vehicle', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-SURV-304', snippet: 'Jayanta Das who arrived in a white Tata Ace mini truck bearing registration WB-74-C-5521', date: '2025-03-01', confidence: 'CORROBORATED' }] },
      { id: 'REL-R09', sourceId: 'ENT-PERS-R02', targetId: 'ENT-LOC-R02', type: 'present_at', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-SURV-304', snippet: 'Surveillance team observed Bimal Sardar conducting regular meetings at Stall 14, Baharampur Central Fish Market', date: '2025-03-01', confidence: 'CORROBORATED' }] },
      { id: 'REL-R10', sourceId: 'ENT-PERS-R03', targetId: 'ENT-PERS-R02', type: 'associated_with', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-SURV-304', snippet: 'Sardar was seen receiving a sealed packet from Jayanta Das', date: '2025-03-01', confidence: 'CORROBORATED' }] },
      { id: 'REL-R11', sourceId: 'ENT-PERS-R01', targetId: 'ENT-LOC-R01', type: 'present_at', confidenceLabel: 'HIGH', evidence: [{ documentId: 'DOC-FIR-301', snippet: 'During routine river patrol near Farakka Barrage, BSF personnel intercepted a motorized country boat', date: '2025-01-18', confidence: 'HIGH' }] },
      { id: 'REL-R12', sourceId: 'ENT-VEH-R01', targetId: 'ENT-LOC-R03', type: 'present_at', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-SURV-304', snippet: 'Vehicle WB-74-C-5521 registered to Jayanta Das of Malda was subsequently tracked to Lalbagh river dock', date: '2025-03-01', confidence: 'CORROBORATED' }] },
      { id: 'REL-R13', sourceId: 'ENT-PERS-R04', targetId: 'ENT-LOC-R03', type: 'present_at', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-SURV-304', snippet: 'goods were transferred to Rina Begum warehouse adjacent to Lalbagh Ghat', date: '2025-03-01', confidence: 'CORROBORATED' }] },
      { id: 'REL-R14', sourceId: 'ENT-PERS-R05', targetId: 'ENT-ORG-R01', type: 'affiliated_to', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-FIN-303', snippet: 'Maa Ganga Fisheries Cooperative (Reg: WB-FISH-2019-4401), a registered entity with Paresh Ghosh as secretary', date: '2025-02-20', confidence: 'CORROBORATED' }] },
      { id: 'REL-R15', sourceId: 'ENT-PERS-R02', targetId: 'ENT-TXN-R01', type: 'initiated_transaction', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-FIN-303', snippet: 'structured deposits of Rs 48,000 each (below reporting threshold) from Bimal Sardar and associate Paresh Ghosh', date: '2025-02-20', confidence: 'CORROBORATED' }] },
      { id: 'REL-R16', sourceId: 'ENT-ORG-R01', targetId: 'ENT-TXN-R02', type: 'initiated_transaction', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-FIN-303', snippet: 'Rina Begum account at separate branch received three inward transfers of Rs 1,20,000 each from Maa Ganga Fisheries Cooperative', date: '2025-02-20', confidence: 'CORROBORATED' }] },
      { id: 'REL-R17', sourceId: 'ENT-TXN-R02', targetId: 'ENT-PERS-R04', type: 'disbursed_to', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-FIN-303', snippet: 'Rina Begum account at separate branch received three inward transfers of Rs 1,20,000 each', date: '2025-02-20', confidence: 'CORROBORATED' }] },
    ],
    insights: [],
  },

  // ===== CASE 3: Northern Highway Narcotics Pipeline =====
  {
    id: 'CASE-NORTHERN-HIGHWAY',
    name: 'Northern Highway Narcotics Pipeline',
    description: 'Drug trafficking network operating along NH-44 highway corridor using commercial transport and layered distribution. Cross-references with Tariq Merchant from Western Corridor case.',
    documents: [
      {
        id: 'DOC-FIR-401',
        title: 'FIR No. 401/2025: NH-44 Toll Plaza Seizure and Vehicle Intercept',
        type: 'FIR',
        date: '2025-03-12',
        sourceAuthority: 'Anti-Narcotics Task Force (Haryana Police)',
        classification: 'CONFIDENTIAL',
        summary: 'Seizure of narcotics from commercial vehicle at NH-44 toll plaza near Panipat with arrest of driver and recovery of distribution ledger.',
        contentSource: 'SAMPLE_DATA',
        content: `FIRST INFORMATION REPORT
Case FIR No: 401/2025 | Date: 12-Mar-2025
Complainant: Inspector Suresh Tanwar (ANTF Haryana)

1. VEHICLE INTERCEPTION:
On 12-Mar-2025 at 22:15 hours, ANTF checkpoint at Panipat Toll Plaza on NH-44 flagged commercial truck HR-26-D-9912 operated by Rajveer Singh of Sonipat for secondary inspection. K-9 unit alerted to concealed compartment behind driver cabin.

2. SEIZURE AND RECOVERY:
Officers recovered 4.2 kg contraband substance from concealed compartment along with distribution ledger notebook listing eight delivery points across Delhi NCR. Also recovered was mobile device +91-81009-32145 containing encrypted communication with contact saved as "Pandit Ji".

3. SUSPECT STATEMENT:
Driver Rajveer Singh stated he collected cargo from Naresh Pandit at warehouse located in Sector 34 Industrial Area, Sonipat. Singh confessed to six prior deliveries over four months following identical route pattern.`,
      },
      {
        id: 'DOC-CDR-402',
        title: 'CDR Intercept: Northern Highway Communication Chain',
        type: 'CDR',
        date: '2025-03-25',
        sourceAuthority: 'Directorate of Revenue Intelligence (DRI)',
        classification: 'CONFIDENTIAL',
        summary: 'Communication analysis revealing upstream coordination chain linking highway courier to warehousing and financing operatives.',
        contentSource: 'SAMPLE_DATA',
        content: `CDR INTERCEPT ANALYSIS REPORT
Reference: CDR-NH44-402/2025

1. PRIMARY LINK ANALYSIS:
Device +91-81009-32145 seized from Rajveer Singh shows 34 calls to Naresh Pandit device +91-99101-78234 between Jan-2025 and Mar-2025. Calls cluster around 20:00-23:00 hours preceding known delivery dates.

2. UPSTREAM COORDINATION:
Naresh Pandit device shows regular weekly calls to overseas VoIP gateway matching pattern previously attributed to Tariq "Raza" Merchant. Additionally, Pandit communicated with financial handler Deepak Chaudhary device +91-70881-55612 regarding cash collection schedules.

3. DISTRIBUTION TIER:
Downstream from Rajveer Singh, calls detected to Mohini Devi device +91-98765-11223 who operates as distribution coordinator in East Delhi. Mohini Devi appears to manage last-mile delivery across three zones.`,
      },
      {
        id: 'DOC-FIN-403',
        title: 'Financial Intelligence: Hawala Transfers via Sonipat Industrial Network',
        type: 'Financial',
        date: '2025-04-02',
        sourceAuthority: 'Enforcement Directorate (ED)',
        classification: 'RESTRICTED',
        summary: 'Hawala-based fund transfers through industrial shell companies in Sonipat linked to narcotics proceeds.',
        contentSource: 'SAMPLE_DATA',
        content: `FINANCIAL INVESTIGATION REPORT
Reference: ED-FIN-403/2025

1. SHELL COMPANY ANALYSIS:
Naresh Pandit listed as authorized signatory of Shivam Agro Traders Pvt Ltd (CIN: U01100HR2022PTC099012) registered at Sector 34 Industrial Area, Sonipat. Company shows minimal legitimate agricultural trade but significant cash turnover of Rs 42,00,000 in preceding 6 months.

2. HAWALA MECHANISM:
Deepak Chaudhary operates as hawala conduit channeling proceeds through three intermediary current accounts. Cash collections from distribution points routed through Chaudhary to Shivam Agro Traders account.

3. OVERSEAS REMITTANCE:
Shivam Agro Traders made three foreign remittances totaling Rs 18,00,000 to Dubai-based import-export firm Al-Rashid Trading LLC. Remittance memos cite "agricultural equipment procurement" with no corresponding import documentation.`,
      },
      {
        id: 'DOC-SURV-404',
        title: 'Surveillance Log: Sonipat Industrial Area Operations',
        type: 'Surveillance',
        date: '2025-04-10',
        sourceAuthority: 'NCB Intelligence Division',
        classification: 'CONFIDENTIAL',
        summary: 'Physical and technical surveillance of Sonipat warehouse and operative movements.',
        contentSource: 'SAMPLE_DATA',
        content: `SURVEILLANCE OPERATION LOG
Operation: HIGHWAY WATCH | Reference: SURV-404/2025

1. WAREHOUSE OBSERVATION:
Sector 34 warehouse observed receiving unmarked cargo deliveries between 01:00-04:00 hours on 5 occasions during March 2025. Naresh Pandit personally supervised unloading on three occasions. Warehouse equipped with CCTV countermeasures and signal jammers.

2. OPERATIVE MOVEMENTS:
Deepak Chaudhary observed visiting warehouse on 08-Apr-2025 carrying briefcase. Subsequently visited three bank branches in Sonipat. On 09-Apr-2025, Chaudhary met Mohini Devi at Connaught Place metro station exchanging sealed envelope.

3. VEHICLE FLEET:
Four vehicles identified in rotation for deliveries from Sector 34 warehouse, including HR-26-D-9912 operated by Rajveer Singh. Additional vehicle HR-55-B-2201 registered to Shivam Agro Traders observed on multiple delivery runs.`,
      },
    ],
    entities: [
      {
        id: 'ENT-PERS-N01', type: 'PERSON', label: 'Rajveer Singh',
        aliases: ['Rajveer Driver'],
        metadata: { cluster: 'Highway Courier Cell', firstSeenDate: '2025-03-12' },
        evidence: [{ documentId: 'DOC-FIR-401', documentTitle: 'FIR No. 401/2025', snippet: 'ANTF checkpoint at Panipat Toll Plaza on NH-44 flagged commercial truck HR-26-D-9912 operated by Rajveer Singh of Sonipat', date: '2025-03-12', confidence: 'HIGH' }],
      },
      {
        id: 'ENT-PERS-N02', type: 'PERSON', label: 'Naresh Pandit',
        aliases: ['Pandit Ji'],
        metadata: { cluster: 'Warehousing & Procurement', firstSeenDate: '2025-03-12' },
        evidence: [
          { documentId: 'DOC-FIR-401', documentTitle: 'FIR No. 401/2025', snippet: 'Rajveer Singh stated he collected cargo from Naresh Pandit at warehouse located in Sector 34 Industrial Area, Sonipat', date: '2025-03-12', confidence: 'CORROBORATED' },
          { documentId: 'DOC-SURV-404', documentTitle: 'Surveillance Log', snippet: 'Naresh Pandit personally supervised unloading on three occasions', date: '2025-04-10', confidence: 'CORROBORATED' },
        ],
      },
      {
        id: 'ENT-PERS-N03', type: 'PERSON', label: 'Deepak Chaudhary',
        aliases: ['DC'],
        metadata: { cluster: 'Financial Operations', firstSeenDate: '2025-03-25' },
        evidence: [
          { documentId: 'DOC-CDR-402', documentTitle: 'CDR Intercept', snippet: 'Pandit communicated with financial handler Deepak Chaudhary device +91-70881-55612 regarding cash collection schedules', date: '2025-03-25', confidence: 'CORROBORATED' },
          { documentId: 'DOC-SURV-404', documentTitle: 'Surveillance Log', snippet: 'Deepak Chaudhary observed visiting warehouse on 08-Apr-2025 carrying briefcase', date: '2025-04-10', confidence: 'CORROBORATED' },
        ],
      },
      {
        id: 'ENT-PERS-N04', type: 'PERSON', label: 'Mohini Devi',
        aliases: ['East Delhi Mohini'],
        metadata: { cluster: 'Distribution Network', firstSeenDate: '2025-03-25' },
        evidence: [
          { documentId: 'DOC-CDR-402', documentTitle: 'CDR Intercept', snippet: 'calls detected to Mohini Devi device +91-98765-11223 who operates as distribution coordinator in East Delhi', date: '2025-03-25', confidence: 'INDICATIVE' },
          { documentId: 'DOC-SURV-404', documentTitle: 'Surveillance Log', snippet: 'Chaudhary met Mohini Devi at Connaught Place metro station exchanging sealed envelope', date: '2025-04-10', confidence: 'CORROBORATED' },
        ],
      },
      {
        id: 'ENT-PERS-N05', type: 'PERSON', label: 'Tariq "Raza" Merchant',
        aliases: ['Raza Merchant', 'The Architect'],
        metadata: { cluster: 'Overseas Command', firstSeenDate: '2025-03-25', notes: 'Cross-case entity — also appears in Western Corridor Syndicate.' },
        evidence: [{ documentId: 'DOC-CDR-402', documentTitle: 'CDR Intercept', snippet: 'Naresh Pandit device shows regular weekly calls to overseas VoIP gateway matching pattern previously attributed to Tariq "Raza" Merchant', date: '2025-03-25', confidence: 'INDICATIVE' }],
      },
      {
        id: 'ENT-PHONE-N01', type: 'PHONE', label: '+91-81009-32145',
        aliases: ['Rajveer Phone'],
        metadata: { firstSeenDate: '2025-03-12' },
        evidence: [{ documentId: 'DOC-FIR-401', documentTitle: 'FIR No. 401/2025', snippet: 'mobile device +91-81009-32145 containing encrypted communication with contact saved as "Pandit Ji"', date: '2025-03-12', confidence: 'HIGH' }],
      },
      {
        id: 'ENT-PHONE-N02', type: 'PHONE', label: '+91-99101-78234',
        aliases: ['Naresh Device'],
        metadata: { firstSeenDate: '2025-03-25' },
        evidence: [{ documentId: 'DOC-CDR-402', documentTitle: 'CDR Intercept', snippet: 'Device +91-81009-32145 seized from Rajveer Singh shows 34 calls to Naresh Pandit device +91-99101-78234', date: '2025-03-25', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-PHONE-N03', type: 'PHONE', label: '+91-70881-55612',
        aliases: ['Deepak Phone'],
        metadata: { firstSeenDate: '2025-03-25' },
        evidence: [{ documentId: 'DOC-CDR-402', documentTitle: 'CDR Intercept', snippet: 'financial handler Deepak Chaudhary device +91-70881-55612', date: '2025-03-25', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-PHONE-N04', type: 'PHONE', label: '+91-98765-11223',
        aliases: ['Mohini Device'],
        metadata: { firstSeenDate: '2025-03-25' },
        evidence: [{ documentId: 'DOC-CDR-402', documentTitle: 'CDR Intercept', snippet: 'Mohini Devi device +91-98765-11223 who operates as distribution coordinator', date: '2025-03-25', confidence: 'INDICATIVE' }],
      },
      {
        id: 'ENT-VEH-N01', type: 'VEHICLE', label: 'HR-26-D-9912',
        aliases: [],
        metadata: { firstSeenDate: '2025-03-12' },
        evidence: [{ documentId: 'DOC-FIR-401', documentTitle: 'FIR No. 401/2025', snippet: 'commercial truck HR-26-D-9912 operated by Rajveer Singh', date: '2025-03-12', confidence: 'HIGH' }],
      },
      {
        id: 'ENT-VEH-N02', type: 'VEHICLE', label: 'HR-55-B-2201',
        aliases: [],
        metadata: { firstSeenDate: '2025-04-10' },
        evidence: [{ documentId: 'DOC-SURV-404', documentTitle: 'Surveillance Log', snippet: 'Additional vehicle HR-55-B-2201 registered to Shivam Agro Traders observed on multiple delivery runs', date: '2025-04-10', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-LOC-N01', type: 'LOCATION', label: 'Sector 34 Industrial Area, Sonipat',
        aliases: ['Sonipat Warehouse'],
        metadata: { firstSeenDate: '2025-03-12' },
        evidence: [{ documentId: 'DOC-FIR-401', documentTitle: 'FIR No. 401/2025', snippet: 'warehouse located in Sector 34 Industrial Area, Sonipat', date: '2025-03-12', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-LOC-N02', type: 'LOCATION', label: 'Panipat Toll Plaza NH-44',
        aliases: ['Panipat Toll'],
        metadata: { firstSeenDate: '2025-03-12' },
        evidence: [{ documentId: 'DOC-FIR-401', documentTitle: 'FIR No. 401/2025', snippet: 'ANTF checkpoint at Panipat Toll Plaza on NH-44', date: '2025-03-12', confidence: 'HIGH' }],
      },
      {
        id: 'ENT-ORG-N01', type: 'ORGANIZATION', label: 'Shivam Agro Traders Pvt Ltd',
        aliases: ['SAT'],
        metadata: { firstSeenDate: '2025-04-02' },
        evidence: [{ documentId: 'DOC-FIN-403', documentTitle: 'Financial Investigation', snippet: 'Naresh Pandit listed as authorized signatory of Shivam Agro Traders Pvt Ltd (CIN: U01100HR2022PTC099012)', date: '2025-04-02', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-ORG-N02', type: 'ORGANIZATION', label: 'Al-Rashid Trading LLC',
        aliases: [],
        metadata: { firstSeenDate: '2025-04-02' },
        evidence: [{ documentId: 'DOC-FIN-403', documentTitle: 'Financial Investigation', snippet: 'three foreign remittances totaling Rs 18,00,000 to Dubai-based import-export firm Al-Rashid Trading LLC', date: '2025-04-02', confidence: 'CORROBORATED' }],
      },
      {
        id: 'ENT-TXN-N01', type: 'TRANSACTION', label: 'Overseas Remittance (Rs 18,00,000)',
        aliases: [],
        metadata: { firstSeenDate: '2025-04-02' },
        evidence: [{ documentId: 'DOC-FIN-403', documentTitle: 'Financial Investigation', snippet: 'three foreign remittances totaling Rs 18,00,000 to Dubai-based import-export firm Al-Rashid Trading LLC', date: '2025-04-02', confidence: 'CORROBORATED' }],
      },
    ],
    relationships: [
      { id: 'REL-N01', sourceId: 'ENT-PERS-N01', targetId: 'ENT-VEH-N01', type: 'operates_vehicle', confidenceLabel: 'HIGH', evidence: [{ documentId: 'DOC-FIR-401', snippet: 'commercial truck HR-26-D-9912 operated by Rajveer Singh', date: '2025-03-12', confidence: 'HIGH' }] },
      { id: 'REL-N02', sourceId: 'ENT-PERS-N01', targetId: 'ENT-PHONE-N01', type: 'possesses_device', confidenceLabel: 'HIGH', evidence: [{ documentId: 'DOC-FIR-401', snippet: 'mobile device +91-81009-32145 containing encrypted communication', date: '2025-03-12', confidence: 'HIGH' }] },
      { id: 'REL-N03', sourceId: 'ENT-PERS-N01', targetId: 'ENT-PERS-N02', type: 'associated_with', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-FIR-401', snippet: 'Rajveer Singh stated he collected cargo from Naresh Pandit', date: '2025-03-12', confidence: 'CORROBORATED' }] },
      { id: 'REL-N04', sourceId: 'ENT-PHONE-N01', targetId: 'ENT-PHONE-N02', type: 'communicated_with', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-CDR-402', snippet: 'Device +91-81009-32145 seized from Rajveer Singh shows 34 calls to Naresh Pandit device +91-99101-78234', date: '2025-03-25', confidence: 'CORROBORATED' }] },
      { id: 'REL-N05', sourceId: 'ENT-PERS-N02', targetId: 'ENT-PHONE-N02', type: 'possesses_device', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-CDR-402', snippet: 'Naresh Pandit device +91-99101-78234', date: '2025-03-25', confidence: 'CORROBORATED' }] },
      { id: 'REL-N06', sourceId: 'ENT-PERS-N02', targetId: 'ENT-PERS-N05', type: 'communicated_with', confidenceLabel: 'INDICATIVE', evidence: [{ documentId: 'DOC-CDR-402', snippet: 'Naresh Pandit device shows regular weekly calls to overseas VoIP gateway matching pattern previously attributed to Tariq "Raza" Merchant', date: '2025-03-25', confidence: 'INDICATIVE' }] },
      { id: 'REL-N07', sourceId: 'ENT-PERS-N02', targetId: 'ENT-PERS-N03', type: 'communicated_with', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-CDR-402', snippet: 'Pandit communicated with financial handler Deepak Chaudhary', date: '2025-03-25', confidence: 'CORROBORATED' }] },
      { id: 'REL-N08', sourceId: 'ENT-PERS-N03', targetId: 'ENT-PHONE-N03', type: 'possesses_device', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-CDR-402', snippet: 'Deepak Chaudhary device +91-70881-55612', date: '2025-03-25', confidence: 'CORROBORATED' }] },
      { id: 'REL-N09', sourceId: 'ENT-PERS-N01', targetId: 'ENT-PERS-N04', type: 'communicated_with', confidenceLabel: 'INDICATIVE', evidence: [{ documentId: 'DOC-CDR-402', snippet: 'calls detected to Mohini Devi device +91-98765-11223', date: '2025-03-25', confidence: 'INDICATIVE' }] },
      { id: 'REL-N10', sourceId: 'ENT-PERS-N04', targetId: 'ENT-PHONE-N04', type: 'possesses_device', confidenceLabel: 'INDICATIVE', evidence: [{ documentId: 'DOC-CDR-402', snippet: 'Mohini Devi device +91-98765-11223', date: '2025-03-25', confidence: 'INDICATIVE' }] },
      { id: 'REL-N11', sourceId: 'ENT-PERS-N02', targetId: 'ENT-LOC-N01', type: 'present_at', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-SURV-404', snippet: 'Naresh Pandit personally supervised unloading on three occasions', date: '2025-04-10', confidence: 'CORROBORATED' }] },
      { id: 'REL-N12', sourceId: 'ENT-PERS-N01', targetId: 'ENT-LOC-N02', type: 'present_at', confidenceLabel: 'HIGH', evidence: [{ documentId: 'DOC-FIR-401', snippet: 'ANTF checkpoint at Panipat Toll Plaza on NH-44', date: '2025-03-12', confidence: 'HIGH' }] },
      { id: 'REL-N13', sourceId: 'ENT-PERS-N02', targetId: 'ENT-ORG-N01', type: 'affiliated_to', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-FIN-403', snippet: 'Naresh Pandit listed as authorized signatory of Shivam Agro Traders Pvt Ltd', date: '2025-04-02', confidence: 'CORROBORATED' }] },
      { id: 'REL-N14', sourceId: 'ENT-ORG-N01', targetId: 'ENT-TXN-N01', type: 'initiated_transaction', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-FIN-403', snippet: 'three foreign remittances totaling Rs 18,00,000 to Dubai-based import-export firm Al-Rashid Trading LLC', date: '2025-04-02', confidence: 'CORROBORATED' }] },
      { id: 'REL-N15', sourceId: 'ENT-TXN-N01', targetId: 'ENT-ORG-N02', type: 'disbursed_to', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-FIN-403', snippet: 'three foreign remittances totaling Rs 18,00,000 to Dubai-based import-export firm Al-Rashid Trading LLC', date: '2025-04-02', confidence: 'CORROBORATED' }] },
      { id: 'REL-N16', sourceId: 'ENT-VEH-N02', targetId: 'ENT-ORG-N01', type: 'associated_with', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-SURV-404', snippet: 'vehicle HR-55-B-2201 registered to Shivam Agro Traders', date: '2025-04-10', confidence: 'CORROBORATED' }] },
      { id: 'REL-N17', sourceId: 'ENT-PERS-N03', targetId: 'ENT-PERS-N04', type: 'associated_with', confidenceLabel: 'CORROBORATED', evidence: [{ documentId: 'DOC-SURV-404', snippet: 'Chaudhary met Mohini Devi at Connaught Place metro station exchanging sealed envelope', date: '2025-04-10', confidence: 'CORROBORATED' }] },
    ],
    insights: [],
  },
];
