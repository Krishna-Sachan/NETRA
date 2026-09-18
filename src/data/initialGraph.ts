import { Entity, Relationship, AIInsight } from '../types';

export const INITIAL_ENTITIES: Entity[] = [
  // Cluster 1: Western Corridor
  {
    id: 'ENT-PERS-01',
    type: 'PERSON',
    label: 'Tariq "Raza" Merchant',
    aliases: ['Raza Merchant', 'Tariq Bhai', 'The Architect'],
    metadata: {
      cluster: 'Western Corridor Syndicate',
      firstSeenDate: '2024-10-14',
      notes: 'Overseas logistics coordinator, handles financing and procurement.'
    },
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024 (Crime Branch Mumbai)',
        snippet: 'Search of the vehicle yielded two mobile handsets, including primary burner device +91-98201-44719, which registered frequent incoming encrypted VoIP pings from an overseas IP gateway attributed to Tariq "Raza" Merchant.',
        date: '2024-10-14',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: '42 cellular calls logged between +91-98201-44719 and overseas satellite terminal used by Tariq "Raza" Merchant between 15-Sep-2024 and 12-Oct-2024.',
        date: '2024-11-02',
        confidence: 'CORROBORATED'
      }
    ]
  },
  {
    id: 'ENT-PERS-02',
    type: 'PERSON',
    label: 'Vikram "Vicky" Sharma',
    aliases: ['Vicky Sharma', 'Kalwa Vicky', 'Ramesh Yadav (Forged)'],
    metadata: {
      cluster: 'Western Corridor Syndicate / Cross-Bridge',
      firstSeenDate: '2024-10-14',
      notes: 'Ground logistics operator, intercepted during Bhiwandi raid.'
    },
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024 (Crime Branch Mumbai)',
        snippet: 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane, who claimed to be operating under direct freight forwarding instructions from Apex Freight Forwarders Pvt Ltd.',
        date: '2024-10-14',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'surveillance team stationed outside Meeting at Hotel Sea Breeze, Alibaug observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma.',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-PHON-01',
    type: 'PHONE',
    label: '+91-98201-44719',
    aliases: ['Burner Line Alpha', 'Ramesh Yadav SIM'],
    metadata: {
      cluster: 'Western Corridor / Bridge Device',
      firstSeenDate: '2024-10-14',
      notes: 'High operational security burner registered with forged documents.'
    },
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024 (Crime Branch Mumbai)',
        snippet: 'primary burner device +91-98201-44719, which registered frequent incoming encrypted VoIP pings',
        date: '2024-10-14',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: '19 direct calls logged between +91-98201-44719 and Kolkata cellular node +91-97330-89102 registered under port handling contractor Subhash "Bhai" Nayak.',
        date: '2024-11-02',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-VEHI-01',
    type: 'VEHICLE',
    label: 'MH-04-AX-8821',
    aliases: ['Dark Blue Mahindra Scorpio', 'Scorpio-8821'],
    metadata: {
      cluster: 'Western Corridor / Inter-State Transit',
      firstSeenDate: '2024-10-14',
      notes: 'Modified vehicle with concealed false-bottom compartment.'
    },
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024 (Crime Branch Mumbai)',
        snippet: 'officers intercepted a dark blue Mahindra Scorpio bearing registration number MH-04-AX-8821 loaded with concealed false-bottom consignment crates.',
        date: '2024-10-14',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'surveillance team stationed outside Meeting at Hotel Sea Breeze, Alibaug observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma.',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-LOCA-01',
    type: 'LOCATION',
    label: 'Godown 4, Bhiwandi Hub',
    aliases: ['Godown 4 Bhiwandi', 'Bhiwandi Staging Depot'],
    metadata: {
      cluster: 'Western Corridor Syndicate',
      firstSeenDate: '2024-10-14',
      notes: 'Thane rural industrial warehouse used for vehicle staging.'
    },
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024 (Crime Branch Mumbai)',
        snippet: 'tactical raid was executed at Godown 4, Bhiwandi Logistics Hub, Thane Rural.',
        date: '2024-10-14',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-ORGA-01',
    type: 'ORGANIZATION',
    label: 'Apex Freight Forwarders',
    aliases: ['Apex Freight Forwarders Pvt Ltd', 'APX Logistics'],
    metadata: {
      cluster: 'Western Corridor Syndicate',
      firstSeenDate: '2024-10-14',
      notes: 'Corporate front company used for commercial shipping invoices & wire transfers.'
    },
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024 (Crime Branch Mumbai)',
        snippet: 'operating under direct freight forwarding instructions from Apex Freight Forwarders Pvt Ltd.',
        date: '2024-10-14',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: 'transaction reference TXN-2024-H7810 was initiated in the amount of ₹45,00,000 debited from Apex Freight Forwarders Pvt Ltd',
        date: '2024-11-16',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-TRAN-01',
    type: 'TRANSACTION',
    label: 'Consignment Bill APX-8819',
    aliases: ['Bill APX-8819', 'Waybill 8819'],
    metadata: {
      cluster: 'Western Corridor Syndicate',
      firstSeenDate: '2024-10-14',
      notes: 'Forged invoice disguised as commercial machine parts transport.'
    },
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024 (Crime Branch Mumbai)',
        snippet: 'Documentary examination of consignment bill APX-8819 recovered inside the vehicle glovebox listed consignor as Apex Freight Forwarders Pvt Ltd',
        date: '2024-10-14',
        confidence: 'HIGH'
      }
    ]
  },

  // Cluster 2: Eastern Maritime & Labor Ring
  {
    id: 'ENT-PERS-03',
    type: 'PERSON',
    label: 'Subhash "Bhai" Nayak',
    aliases: ['Subhash Nayak', 'Port Bhai', 'Secretary Nayak'],
    metadata: {
      cluster: 'Eastern Maritime Syndicate / Cross-Bridge',
      firstSeenDate: '2024-11-02',
      notes: 'Haldia dock contractor and labor union secretary, controls port access.'
    },
    evidence: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: 'Kolkata cellular node +91-97330-89102 registered under port handling contractor Subhash "Bhai" Nayak.',
        date: '2024-11-02',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: '₹22,00,000 was withdrawn via bearer self-cheques authorized by union secretary Subhash "Bhai" Nayak.',
        date: '2024-11-16',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'Accused Subhash "Bhai" Nayak personally supervised labor from Eastern Maritime Stevedores Union loading waterproof tarpaulin crates into fishing trawler M.V. Sagar Jyoti.',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-PERS-04',
    type: 'PERSON',
    label: 'Rohit "Montu" Sen',
    aliases: ['Montu Sen', 'Rohit Sen', 'Driver Montu'],
    metadata: {
      cluster: 'Eastern Maritime Syndicate',
      firstSeenDate: '2024-11-16',
      notes: 'Dock driver and courier, handles physical drop-offs and mini-truck runs.'
    },
    evidence: [
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: 'electronic transfer of ₹8,50,000 was traced directly to logistics courier Rohit "Montu" Sen under the justification of coastal transport freightage.',
        date: '2024-11-16',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'courier Rohit "Montu" Sen driving a white Tata Ace cargo truck bearing registration WB-02-KL-4091 into Jetty 3, Haldia Port Docks',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-PHON-02',
    type: 'PHONE',
    label: '+91-97330-89102',
    aliases: ['Kolkata Maritime Node', 'Nayak Handset'],
    metadata: {
      cluster: 'Eastern Maritime Syndicate',
      firstSeenDate: '2024-11-02',
      notes: 'Kolkata cell phone linked to port operations.'
    },
    evidence: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: '19 direct calls logged between +91-98201-44719 and Kolkata cellular node +91-97330-89102',
        date: '2024-11-02',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-VEHI-02',
    type: 'VEHICLE',
    label: 'WB-02-KL-4091',
    aliases: ['White Tata Ace', 'Tata Ace Mini-Truck'],
    metadata: {
      cluster: 'Eastern Maritime Syndicate',
      firstSeenDate: '2024-11-28',
      notes: 'Cargo mini-truck used for terminal transfers at Haldia.'
    },
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'white Tata Ace cargo truck bearing registration WB-02-KL-4091 into Jetty 3, Haldia Port Docks on 24-Nov-2024.',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-LOCA-02',
    type: 'LOCATION',
    label: 'Jetty 3, Haldia Port Docks',
    aliases: ['Jetty 3 Haldia', 'Haldia Terminal 3'],
    metadata: {
      cluster: 'Eastern Maritime Syndicate',
      firstSeenDate: '2024-11-28',
      notes: 'Deep water terminal and labor loading slip.'
    },
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'handed by Rohit "Montu" Sen directly to dock foreman at Jetty 3, Haldia Port Docks',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-ORGA-02',
    type: 'ORGANIZATION',
    label: 'Eastern Maritime Stevedores Union',
    aliases: ['EMSU', 'Haldia Dock Labor Union'],
    metadata: {
      cluster: 'Eastern Maritime Syndicate',
      firstSeenDate: '2024-11-16',
      notes: 'Labor body used as recipient for structured wire transfers.'
    },
    evidence: [
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: 'remitted funds were disbursed in split tranches into the bank account of Eastern Maritime Stevedores Union.',
        date: '2024-11-16',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-TRAN-02',
    type: 'TRANSACTION',
    label: 'Cash Delivery ₹22,00,000',
    aliases: ['Haldia Cash Payout', 'Bearer Cheque Cash'],
    metadata: {
      cluster: 'Eastern Maritime Syndicate',
      firstSeenDate: '2024-11-28',
      notes: 'Bearer cheque withdrawal converted to physical cash at port.'
    },
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'secure Cash Delivery ₹22,00,000 executed in corrugated packaging handed by Rohit "Montu" Sen directly to dock foreman',
        date: '2024-11-28',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: 'Within 36 hours of receipt, ₹22,00,000 was withdrawn via bearer self-cheques authorized by union secretary Subhash "Bhai" Nayak.',
        date: '2024-11-16',
        confidence: 'CORROBORATED'
      }
    ]
  },

  // Bridge Entities (Crossing Western & Eastern Clusters)
  {
    id: 'ENT-EVEN-01',
    type: 'EVENT',
    label: 'Meeting at Hotel Sea Breeze, Alibaug',
    aliases: ['Alibaug Conclave', 'Sea Breeze Meeting'],
    metadata: {
      cluster: 'Nexus / Cross-Cluster Conclave',
      firstSeenDate: '2024-11-02',
      notes: 'In-person rendezvous coordinating inter-state movement.'
    },
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'On 12-Nov-2024 at 21:30 hrs, surveillance team stationed outside Meeting at Hotel Sea Breeze, Alibaug observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma. Fifteen minutes later, port contractor Subhash "Bhai" Nayak arrived accompanied by driver Rohit "Montu" Sen.',
        date: '2024-11-28',
        confidence: 'HIGH'
      },
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: 'latching on identical sector transceiver on the night of 12-Nov-2024 between 21:10 and 23:45 hrs, confirming physical proximity during Meeting at Hotel Sea Breeze, Alibaug.',
        date: '2024-11-02',
        confidence: 'CORROBORATED'
      }
    ]
  },
  {
    id: 'ENT-TRAN-03',
    type: 'TRANSACTION',
    label: 'TXN-2024-H7810 (₹45,00,000)',
    aliases: ['STR-2024/091 Wire', 'NEFT H7810'],
    metadata: {
      cluster: 'Nexus / Financial Wire Conduit',
      firstSeenDate: '2024-11-16',
      notes: 'Inter-state electronic remittance disguised as machinery repair overhaul.'
    },
    evidence: [
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: 'On 24-Oct-2024, transaction reference TXN-2024-H7810 was initiated in the amount of ₹45,00,000 debited from Apex Freight Forwarders Pvt Ltd under the ledger narration "Machinery Overhaul Spare Parts".',
        date: '2024-11-16',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-LOCA-03',
    type: 'LOCATION',
    label: 'Alibaug Coastal Tower',
    aliases: ['Alibaug Sector Cell Tower', 'Tower Transceiver 884-A'],
    metadata: {
      cluster: 'Nexus / Technical Triangulation',
      firstSeenDate: '2024-11-02',
      notes: 'Cell tower sector where western and eastern handsets co-located.'
    },
    evidence: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: 'Cell tower dump at Alibaug Coastal Tower shows burner +91-98201-44719 and secondary device +91-97330-89102 latching on identical sector transceiver',
        date: '2024-11-02',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'ENT-EVEN-02',
    type: 'EVENT',
    label: 'Haldia Transshipment',
    aliases: ['Trawler M.V. Sagar Jyoti Loading', 'Jetty 3 Night Transfer'],
    metadata: {
      cluster: 'Eastern Maritime Syndicate',
      firstSeenDate: '2024-11-28',
      notes: 'Night loading of concealed cargo onto fishing vessel.'
    },
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'loading waterproof tarpaulin crates into fishing trawler M.V. Sagar Jyoti.',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  // Candidate Duplicate Entities for Intelligence Layer: Entity Resolution
  {
    id: 'ENT-PERS-DUP-01',
    type: 'PERSON',
    label: 'Vicky Sharma (Kalwa)',
    aliases: ['Kalwa Vicky', 'V. Sharma'],
    metadata: {
      cluster: 'Western Corridor Syndicate',
      firstSeenDate: '2024-10-14',
      notes: 'Potential alias or duplicate record for Vikram "Vicky" Sharma recorded under informal local dialect.'
    },
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024 (Crime Branch Mumbai)',
        snippet: 'Local informants in Kalwa identified the driver as "Vicky Sharma (Kalwa)" operating courier vehicles between Bhiwandi and Thane.',
        date: '2024-10-14',
        confidence: 'CORROBORATED'
      }
    ]
  },
  {
    id: 'ENT-PHON-DUP-01',
    type: 'PHONE',
    label: '09820144719 (Burner Node)',
    aliases: ['Burner SIM B-1', 'Kalwa SIM'],
    metadata: {
      cluster: 'Western Corridor Syndicate',
      firstSeenDate: '2024-11-02',
      notes: 'Normalized 10-digit number 9820144719 recorded under STD trunk dialing prefix 09820144719.'
    },
    evidence: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: 'Supplementary CDR dump recorded identical subscriber SIM 09820144719 latching onto Bhiwandi base tower transceiver.',
        date: '2024-11-02',
        confidence: 'HIGH'
      }
    ]
  }
];

export const INITIAL_RELATIONSHIPS: Relationship[] = [
  {
    id: 'REL-DUP-01',
    sourceId: 'ENT-PERS-DUP-01',
    targetId: 'ENT-LOCA-01',
    type: 'present_at',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024',
        snippet: 'Driver Vicky Sharma (Kalwa) spotted frequently around Godown 4, Bhiwandi Logistics Hub.',
        date: '2024-10-14',
        confidence: 'HIGH'
      }
    ]
  },
  // Western Cluster internal links
  {
    id: 'REL-01',
    sourceId: 'ENT-PERS-02',
    targetId: 'ENT-VEHI-01',
    type: 'operates_vehicle',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024',
        snippet: 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane',
        date: '2024-10-14',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-02',
    sourceId: 'ENT-PERS-02',
    targetId: 'ENT-PHON-01',
    type: 'possesses_device',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024',
        snippet: 'Search of the vehicle yielded two mobile handsets, including primary burner device +91-98201-44719',
        date: '2024-10-14',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-03',
    sourceId: 'ENT-PERS-01',
    targetId: 'ENT-PHON-01',
    type: 'communicated_with',
    confidenceLabel: 'CORROBORATED',
    evidence: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Analysis CR-88',
        snippet: '42 cellular calls logged between +91-98201-44719 and overseas satellite terminal used by Tariq "Raza" Merchant',
        date: '2024-11-02',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-04',
    sourceId: 'ENT-PERS-01',
    targetId: 'ENT-VEHI-01',
    type: 'financed_asset',
    confidenceLabel: 'REPORTED',
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024',
        snippet: 'confessed during preliminary questioning that Tariq "Raza" Merchant financed the procurement of vehicle MH-04-AX-8821',
        date: '2024-10-14',
        confidence: 'INDICATIVE'
      }
    ]
  },
  {
    id: 'REL-05',
    sourceId: 'ENT-PERS-02',
    targetId: 'ENT-ORGA-01',
    type: 'affiliated_to',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024',
        snippet: 'operating under direct freight forwarding instructions from Apex Freight Forwarders Pvt Ltd.',
        date: '2024-10-14',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-06',
    sourceId: 'ENT-VEHI-01',
    targetId: 'ENT-LOCA-01',
    type: 'present_at',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024',
        snippet: 'officers intercepted a dark blue Mahindra Scorpio bearing registration number MH-04-AX-8821 at Godown 4, Bhiwandi Logistics Hub',
        date: '2024-10-14',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-07',
    sourceId: 'ENT-ORGA-01',
    targetId: 'ENT-TRAN-01',
    type: 'issued_document',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024',
        snippet: 'examination of consignment bill APX-8819 recovered inside the vehicle glovebox listed consignor as Apex Freight Forwarders Pvt Ltd',
        date: '2024-10-14',
        confidence: 'HIGH'
      }
    ]
  },

  // Major Cross-Cluster Telecom Bridge
  {
    id: 'REL-08',
    sourceId: 'ENT-PHON-01',
    targetId: 'ENT-PHON-02',
    type: 'communicated_with',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: '19 direct calls logged between +91-98201-44719 and Kolkata cellular node +91-97330-89102 registered under port handling contractor Subhash "Bhai" Nayak.',
        date: '2024-11-02',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-09',
    sourceId: 'ENT-PERS-03',
    targetId: 'ENT-PHON-02',
    type: 'possesses_device',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: 'Kolkata cellular node +91-97330-89102 registered under port handling contractor Subhash "Bhai" Nayak.',
        date: '2024-11-02',
        confidence: 'HIGH'
      }
    ]
  },

  // Cross-Cluster Conclave Meeting at Alibaug
  {
    id: 'REL-10',
    sourceId: 'ENT-PERS-02',
    targetId: 'ENT-EVEN-01',
    type: 'attended_event',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'surveillance team stationed outside Meeting at Hotel Sea Breeze, Alibaug observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma.',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-11',
    sourceId: 'ENT-PERS-03',
    targetId: 'ENT-EVEN-01',
    type: 'attended_event',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'port contractor Subhash "Bhai" Nayak arrived accompanied by driver Rohit "Montu" Sen. The parties engaged in private discussions in seaside cottage #4',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-12',
    sourceId: 'ENT-PERS-04',
    targetId: 'ENT-EVEN-01',
    type: 'attended_event',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'port contractor Subhash "Bhai" Nayak arrived accompanied by driver Rohit "Montu" Sen.',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-13',
    sourceId: 'ENT-VEHI-01',
    targetId: 'ENT-EVEN-01',
    type: 'present_at',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma outside Meeting at Hotel Sea Breeze, Alibaug',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-14',
    sourceId: 'ENT-PHON-01',
    targetId: 'ENT-LOCA-03',
    type: 'present_at',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: 'Cell tower dump at Alibaug Coastal Tower shows burner +91-98201-44719 and secondary device +91-97330-89102 latching on identical sector transceiver',
        date: '2024-11-02',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-15',
    sourceId: 'ENT-PHON-02',
    targetId: 'ENT-LOCA-03',
    type: 'present_at',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: 'burner +91-98201-44719 and secondary device +91-97330-89102 latching on identical sector transceiver on the night of 12-Nov-2024',
        date: '2024-11-02',
        confidence: 'HIGH'
      }
    ]
  },

  // Cross-Cluster Financial Wire Conduit
  {
    id: 'REL-16',
    sourceId: 'ENT-ORGA-01',
    targetId: 'ENT-TRAN-03',
    type: 'initiated_transaction',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: 'transaction reference TXN-2024-H7810 was initiated in the amount of ₹45,00,000 debited from Apex Freight Forwarders Pvt Ltd',
        date: '2024-11-16',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-17',
    sourceId: 'ENT-TRAN-03',
    targetId: 'ENT-ORGA-02',
    type: 'disbursed_to',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: 'The remitted funds were disbursed in split tranches into the bank account of Eastern Maritime Stevedores Union.',
        date: '2024-11-16',
        confidence: 'HIGH'
      }
    ]
  },

  // Eastern Cluster internal links
  {
    id: 'REL-18',
    sourceId: 'ENT-PERS-03',
    targetId: 'ENT-ORGA-02',
    type: 'controls_entity',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: '₹22,00,000 was withdrawn via bearer self-cheques authorized by union secretary Subhash "Bhai" Nayak.',
        date: '2024-11-16',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-19',
    sourceId: 'ENT-ORGA-02',
    targetId: 'ENT-TRAN-02',
    type: 'liquidated_cash',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: 'Within 36 hours of receipt, ₹22,00,000 was withdrawn via bearer self-cheques',
        date: '2024-11-16',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-20',
    sourceId: 'ENT-PERS-03',
    targetId: 'ENT-PERS-04',
    type: 'associated_with',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'port contractor Subhash "Bhai" Nayak arrived accompanied by driver Rohit "Montu" Sen.',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-21',
    sourceId: 'ENT-PERS-04',
    targetId: 'ENT-VEHI-02',
    type: 'operates_vehicle',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'tracked courier Rohit "Montu" Sen driving a white Tata Ace cargo truck bearing registration WB-02-KL-4091 into Jetty 3',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-22',
    sourceId: 'ENT-VEHI-02',
    targetId: 'ENT-LOCA-02',
    type: 'present_at',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'truck bearing registration WB-02-KL-4091 into Jetty 3, Haldia Port Docks on 24-Nov-2024',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-23',
    sourceId: 'ENT-PERS-04',
    targetId: 'ENT-TRAN-02',
    type: 'delivered_payment',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'secure Cash Delivery ₹22,00,000 executed in corrugated packaging handed by Rohit "Montu" Sen directly to dock foreman',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-24',
    sourceId: 'ENT-PERS-03',
    targetId: 'ENT-EVEN-02',
    type: 'supervised_event',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'Subhash "Bhai" Nayak personally supervised labor from Eastern Maritime Stevedores Union loading waterproof tarpaulin crates into fishing trawler M.V. Sagar Jyoti.',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  },
  {
    id: 'REL-25',
    sourceId: 'ENT-LOCA-02',
    targetId: 'ENT-EVEN-02',
    type: 'event_location',
    confidenceLabel: 'HIGH',
    evidence: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'loading waterproof tarpaulin crates into fishing trawler M.V. Sagar Jyoti at Jetty 3, Haldia Port Docks',
        date: '2024-11-28',
        confidence: 'HIGH'
      }
    ]
  }
];

export const INITIAL_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'INS-01',
    title: 'Cross-Cluster Inter-State Bridge: Alibaug Conclave & Shared Cellular Nexus',
    category: 'CROSS_CLUSTER_BRIDGE',
    priorityLevel: 'HIGH_PRIORITY',
    contributingSignals: [
      'Triangulated co-presence of Western operative Vikram Sharma and Eastern contractor Subhash Nayak at Hotel Sea Breeze, Alibaug',
      'Direct telecom link between burner handset +91-98201-44719 and Kolkata node +91-97330-89102 (19 calls recorded)',
      'Identical cellular sector transceiver latching confirmed on coastal tower dumps'
    ],
    involvedEntityIds: ['ENT-PERS-02', 'ENT-PERS-03', 'ENT-EVEN-01', 'ENT-PHON-01', 'ENT-PHON-02'],
    evidenceSnippets: [
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'surveillance team stationed outside Meeting at Hotel Sea Breeze, Alibaug observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma. Fifteen minutes later, port contractor Subhash "Bhai" Nayak arrived',
        date: '2024-11-28'
      },
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: '19 direct calls logged between +91-98201-44719 and Kolkata cellular node +91-97330-89102 registered under port handling contractor Subhash "Bhai" Nayak.',
        date: '2024-11-02'
      }
    ],
    recommendedInquiry: [
      'Serve summons under Cr.P.C. 91 to Hotel Sea Breeze management for CCTV footage of cottage #4 from 12-Nov-2024.',
      'Request IMEI call and SMS history for secondary handsets associated with Kolkata tower sector 884-A.'
    ],
    timestamp: '2024-11-29T14:30:00Z'
  },
  {
    id: 'INS-02',
    title: 'Financial Dispersal Conduit: Apex Freight Wire to EMSU Port Front',
    category: 'FINANCIAL_CONDUIT',
    priorityLevel: 'HIGH_PRIORITY',
    contributingSignals: [
      '₹45,00,000 remittance ledgered under generic "Machinery Overhaul Spare Parts" narration',
      'Rapid liquidation: ₹22,00,000 withdrawn as bearer self-cheques authorized by union secretary within 36 hours',
      'Exact temporal correlation with physical cash handover observed by surveillance at Haldia Jetty 3'
    ],
    involvedEntityIds: ['ENT-ORGA-01', 'ENT-TRAN-03', 'ENT-ORGA-02', 'ENT-PERS-03', 'ENT-TRAN-02'],
    evidenceSnippets: [
      {
        documentId: 'DOC-FIN-091',
        documentTitle: 'FinIntel Audit STR-2024/091',
        snippet: 'On 24-Oct-2024, transaction reference TXN-2024-H7810 was initiated in the amount of ₹45,00,000 debited from Apex Freight Forwarders Pvt Ltd',
        date: '2024-11-16'
      },
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'secure Cash Delivery ₹22,00,000 executed in corrugated packaging handed by Rohit "Montu" Sen directly to dock foreman at Jetty 3',
        date: '2024-11-28'
      }
    ],
    recommendedInquiry: [
      'Obtain certified bank statements and KYC records for Eastern Maritime Stevedores Union primary account from HDFC Bank.',
      'Issue freeze advisory on sister current accounts operating under common authorized signatory Subhash Nayak.'
    ],
    timestamp: '2024-11-29T15:15:00Z'
  },
  {
    id: 'INS-03',
    title: 'Burner Device Hub & Operational Security Profile: +91-98201-44719',
    category: 'COMMUNICATION_HUB',
    priorityLevel: 'ELEVATED',
    contributingSignals: [
      'Zero outgoing SMS and short burst calls (<45 sec) indicating deliberate counter-surveillance tactics',
      'Subscription acquired through forged credentials (Ramesh Yadav)',
      'Dual links: acts as exclusive bridge between overseas satellite node and domestic dock operator'
    ],
    involvedEntityIds: ['ENT-PHON-01', 'ENT-PERS-01', 'ENT-PERS-02', 'ENT-PERS-03'],
    evidenceSnippets: [
      {
        documentId: 'DOC-CDR-88',
        documentTitle: 'CDR Intercept Analysis CR-88',
        snippet: 'Burner MSISDN +91-98201-44719, recovered from accused Vikram "Vicky" Sharma, exhibits severe operational security protocols (short burst calls < 45 seconds, zero outgoing SMS)',
        date: '2024-11-02'
      },
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024',
        snippet: 'primary burner device +91-98201-44719, which registered frequent incoming encrypted VoIP pings from an overseas IP gateway attributed to Tariq "Raza" Merchant.',
        date: '2024-10-14'
      }
    ],
    recommendedInquiry: [
      'Coordinate with Point of Sale telecom retailer in Kalwa to identify merchant who issued SIM under forged credentials.',
      'Trace IMEI hardware identifier across national CEIR registry to locate previous SIM cards inserted in device.'
    ],
    timestamp: '2024-11-29T16:00:00Z'
  },
  {
    id: 'INS-04',
    title: 'Multimodal Logistical Handover: Vehicle MH-04-AX-8821 to Haldia Sea Transit',
    category: 'LOGISTICAL_PIVOT',
    priorityLevel: 'ELEVATED',
    contributingSignals: [
      'Vehicle fitted with concealed false-bottom compartment captured in Bhiwandi raid',
      'Courier courier Rohit Sen documented transporting matching tarpaulin consignments to fishing trawler M.V. Sagar Jyoti',
      'Two-tier physical distribution model disconnecting western transport from maritime dispatch'
    ],
    involvedEntityIds: ['ENT-VEHI-01', 'ENT-VEHI-02', 'ENT-LOCA-01', 'ENT-LOCA-02', 'ENT-EVEN-02'],
    evidenceSnippets: [
      {
        documentId: 'DOC-FIR-142',
        documentTitle: 'FIR No. 142/2024',
        snippet: 'intercepted a dark blue Mahindra Scorpio bearing registration number MH-04-AX-8821 loaded with concealed false-bottom consignment crates.',
        date: '2024-10-14'
      },
      {
        documentId: 'DOC-SURV-305',
        documentTitle: 'Field Surveillance SOC-305',
        snippet: 'supervised labor from Eastern Maritime Stevedores Union loading waterproof tarpaulin crates into fishing trawler M.V. Sagar Jyoti.',
        date: '2024-11-28'
      }
    ],
    recommendedInquiry: [
      'Request Indian Coast Guard radar and AIS beacon track for fishing trawler M.V. Sagar Jyoti during the 24-26 Nov window.',
      'Conduct forensic inspection of vehicle MH-04-AX-8821 welding stamps to identify fabrication workshop in Bhiwandi.'
    ],
    timestamp: '2024-11-29T16:45:00Z'
  }
];
