import { ExtractionResponse } from '../types';

/**
 * Verified synthetic baseline extraction fallback for the 4 built-in case documents.
 * Used when Gemini API is offline or unconfigured.
 * Every snippet must be an exact verbatim substring of the corresponding document in SAMPLE_DOCUMENTS.
 */
export const SYNTHETIC_PREPARSED_DOCS: Record<string, ExtractionResponse> = {
  'DOC-FIR-142': {
    entities: [
      {
        type: 'PERSON',
        label: 'Vikram "Vicky" Sharma',
        aliases: ['Vicky Sharma', 'Kalwa Vicky'],
        evidenceSnippet: 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane, who claimed to be operating under direct freight forwarding instructions from Apex Freight Forwarders Pvt Ltd.'
      },
      {
        type: 'PERSON',
        label: 'Tariq "Raza" Merchant',
        aliases: ['Raza Merchant', 'Tariq Bhai'],
        evidenceSnippet: 'Search of the vehicle yielded two mobile handsets, including primary burner device +91-98201-44719, which registered frequent incoming encrypted VoIP pings from an overseas IP gateway attributed to Tariq "Raza" Merchant.'
      },
      {
        type: 'PHONE',
        label: '+91-98201-44719',
        aliases: ['Burner Line Alpha', 'Ramesh Yadav SIM'],
        evidenceSnippet: 'primary burner device +91-98201-44719, which registered frequent incoming encrypted VoIP pings'
      },
      {
        type: 'VEHICLE',
        label: 'MH-04-AX-8821',
        aliases: ['Mahindra Scorpio', 'Scorpio-8821'],
        evidenceSnippet: 'officers intercepted a dark blue Mahindra Scorpio bearing registration number MH-04-AX-8821 loaded with concealed false-bottom consignment crates.'
      },
      {
        type: 'LOCATION',
        label: 'Godown 4, Bhiwandi Hub',
        aliases: ['Bhiwandi Logistics Hub'],
        evidenceSnippet: 'tactical raid was executed at Godown 4, Bhiwandi Logistics Hub, Thane Rural.'
      },
      {
        type: 'ORGANIZATION',
        label: 'Apex Freight Forwarders',
        aliases: ['Apex Freight Forwarders Pvt Ltd'],
        evidenceSnippet: 'operating under direct freight forwarding instructions from Apex Freight Forwarders Pvt Ltd.'
      },
      {
        type: 'TRANSACTION',
        label: 'Consignment Bill APX-8819',
        aliases: ['Bill APX-8819'],
        evidenceSnippet: 'Documentary examination of consignment bill APX-8819 recovered inside the vehicle glovebox listed consignor as Apex Freight Forwarders Pvt Ltd'
      }
    ],
    relationships: [
      {
        sourceLabel: 'Vikram "Vicky" Sharma',
        targetLabel: 'MH-04-AX-8821',
        type: 'operates_vehicle',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane'
      },
      {
        sourceLabel: 'Vikram "Vicky" Sharma',
        targetLabel: '+91-98201-44719',
        type: 'possesses_device',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'Search of the vehicle yielded two mobile handsets, including primary burner device +91-98201-44719'
      },
      {
        sourceLabel: 'Tariq "Raza" Merchant',
        targetLabel: '+91-98201-44719',
        type: 'communicated_with',
        confidenceLabel: 'CORROBORATED',
        evidenceSnippet: 'registered frequent incoming encrypted VoIP pings from an overseas IP gateway attributed to Tariq "Raza" Merchant.'
      },
      {
        sourceLabel: 'MH-04-AX-8821',
        targetLabel: 'Godown 4, Bhiwandi Hub',
        type: 'present_at',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'tactical raid was executed at Godown 4, Bhiwandi Logistics Hub, Thane Rural. Upon cordoning the perimeter, officers intercepted a dark blue Mahindra Scorpio bearing registration number MH-04-AX-8821'
      },
      {
        sourceLabel: 'Vikram "Vicky" Sharma',
        targetLabel: 'Apex Freight Forwarders',
        type: 'affiliated_to',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'operating under direct freight forwarding instructions from Apex Freight Forwarders Pvt Ltd.'
      }
    ],
    caseSummary: 'Interception of modified transport vehicle at Bhiwandi staging depot exposing ties between local operative Vikram Sharma, shell firm Apex Freight Forwarders, and overseas coordinator Tariq Merchant.'
  },
  'DOC-CDR-88': {
    entities: [
      {
        type: 'PERSON',
        label: 'Vikram "Vicky" Sharma',
        aliases: ['Vicky Sharma'],
        evidenceSnippet: 'Burner MSISDN +91-98201-44719, recovered from accused Vikram "Vicky" Sharma, exhibits severe operational security protocols'
      },
      {
        type: 'PHONE',
        label: '+91-98201-44719',
        aliases: ['Ramesh Yadav SIM'],
        evidenceSnippet: 'Target Identifier: +91-98201-44719 (Subscriber Name: Ramesh Yadav, forged identity)'
      },
      {
        type: 'PERSON',
        label: 'Tariq "Raza" Merchant',
        aliases: ['Raza Merchant'],
        evidenceSnippet: '42 cellular calls logged between +91-98201-44719 and overseas satellite terminal used by Tariq "Raza" Merchant between 15-Sep-2024 and 12-Oct-2024.'
      },
      {
        type: 'PHONE',
        label: '+91-97330-89102',
        aliases: ['Kolkata Node'],
        evidenceSnippet: 'Kolkata cellular node +91-97330-89102 registered under port handling contractor Subhash "Bhai" Nayak.'
      },
      {
        type: 'PERSON',
        label: 'Subhash "Bhai" Nayak',
        aliases: ['Subhash Nayak', 'Bhai Nayak'],
        evidenceSnippet: 'port handling contractor Subhash "Bhai" Nayak.'
      },
      {
        type: 'LOCATION',
        label: 'Alibaug Coastal Tower',
        aliases: ['Sector Transceiver Alibaug'],
        evidenceSnippet: 'Cell tower dump at Alibaug Coastal Tower shows burner +91-98201-44719 and secondary device +91-97330-89102 latching on identical sector transceiver'
      },
      {
        type: 'EVENT',
        label: 'Meeting at Hotel Sea Breeze, Alibaug',
        aliases: ['Alibaug Conclave'],
        evidenceSnippet: 'confirming physical proximity during Meeting at Hotel Sea Breeze, Alibaug.'
      }
    ],
    relationships: [
      {
        sourceLabel: '+91-98201-44719',
        targetLabel: 'Tariq "Raza" Merchant',
        type: 'communicated_with',
        confidenceLabel: 'HIGH',
        evidenceSnippet: '42 cellular calls logged between +91-98201-44719 and overseas satellite terminal used by Tariq "Raza" Merchant between 15-Sep-2024 and 12-Oct-2024.'
      },
      {
        sourceLabel: '+91-98201-44719',
        targetLabel: '+91-97330-89102',
        type: 'communicated_with',
        confidenceLabel: 'HIGH',
        evidenceSnippet: '19 direct calls logged between +91-98201-44719 and Kolkata cellular node +91-97330-89102 registered under port handling contractor Subhash "Bhai" Nayak.'
      },
      {
        sourceLabel: 'Subhash "Bhai" Nayak',
        targetLabel: '+91-97330-89102',
        type: 'possesses_device',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'Kolkata cellular node +91-97330-89102 registered under port handling contractor Subhash "Bhai" Nayak.'
      },
      {
        sourceLabel: 'Vikram "Vicky" Sharma',
        targetLabel: '+91-98201-44719',
        type: 'possesses_device',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'Burner MSISDN +91-98201-44719, recovered from accused Vikram "Vicky" Sharma'
      },
      {
        sourceLabel: '+91-98201-44719',
        targetLabel: 'Alibaug Coastal Tower',
        type: 'present_at',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'Cell tower dump at Alibaug Coastal Tower shows burner +91-98201-44719 and secondary device +91-97330-89102 latching on identical sector transceiver'
      },
      {
        sourceLabel: '+91-98201-44719',
        targetLabel: 'Meeting at Hotel Sea Breeze, Alibaug',
        type: 'present_at',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'confirming physical proximity during Meeting at Hotel Sea Breeze, Alibaug.'
      }
    ],
    caseSummary: 'Cellular analysis establishes tactical telecom link between western logistics operative Vikram Sharma, Kolkata port contractor Subhash Nayak, and overseas coordinator Tariq Merchant, corroborated by tower transceiver latching.'
  },
  'DOC-FIN-091': {
    entities: [
      {
        type: 'ORGANIZATION',
        label: 'Apex Freight Forwarders',
        aliases: ['Apex Freight Forwarders Pvt Ltd'],
        evidenceSnippet: 'Apex Freight Forwarders Pvt Ltd (Current A/c: HDFC-0091823)'
      },
      {
        type: 'TRANSACTION',
        label: 'TXN-2024-H7810 (₹45,00,000)',
        aliases: ['Wire TXN-2024-H7810'],
        evidenceSnippet: 'On 24-Oct-2024, transaction reference TXN-2024-H7810 was initiated in the amount of ₹45,00,000 debited from Apex Freight Forwarders Pvt Ltd'
      },
      {
        type: 'ORGANIZATION',
        label: 'Eastern Maritime Stevedores Union',
        aliases: ['EMSU'],
        evidenceSnippet: 'disbursed in split tranches into the bank account of Eastern Maritime Stevedores Union.'
      },
      {
        type: 'PERSON',
        label: 'Subhash "Bhai" Nayak',
        aliases: ['Subhash Nayak'],
        evidenceSnippet: 'withdrawn via bearer self-cheques authorized by union secretary Subhash "Bhai" Nayak.'
      },
      {
        type: 'TRANSACTION',
        label: 'Cash Withdrawal ₹22,00,000',
        aliases: ['Bearer Cheque Liquidation'],
        evidenceSnippet: 'Within 36 hours of receipt, ₹22,00,000 was withdrawn via bearer self-cheques'
      },
      {
        type: 'PERSON',
        label: 'Rohit "Montu" Sen',
        aliases: ['Rohit Sen', 'Montu Sen'],
        evidenceSnippet: 'supplementary electronic transfer of ₹8,50,000 was traced directly to logistics courier Rohit "Montu" Sen'
      }
    ],
    relationships: [
      {
        sourceLabel: 'Apex Freight Forwarders',
        targetLabel: 'TXN-2024-H7810 (₹45,00,000)',
        type: 'initiated_transaction',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'On 24-Oct-2024, transaction reference TXN-2024-H7810 was initiated in the amount of ₹45,00,000 debited from Apex Freight Forwarders Pvt Ltd'
      },
      {
        sourceLabel: 'TXN-2024-H7810 (₹45,00,000)',
        targetLabel: 'Eastern Maritime Stevedores Union',
        type: 'disbursed_to',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'The remitted funds were disbursed in split tranches into the bank account of Eastern Maritime Stevedores Union.'
      },
      {
        sourceLabel: 'Subhash "Bhai" Nayak',
        targetLabel: 'Eastern Maritime Stevedores Union',
        type: 'controls_entity',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'withdrawn via bearer self-cheques authorized by union secretary Subhash "Bhai" Nayak.'
      },
      {
        sourceLabel: 'Eastern Maritime Stevedores Union',
        targetLabel: 'Cash Withdrawal ₹22,00,000',
        type: 'liquidated_cash',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'Within 36 hours of receipt, ₹22,00,000 was withdrawn via bearer self-cheques'
      },
      {
        sourceLabel: 'Apex Freight Forwarders',
        targetLabel: 'Eastern Maritime Stevedores Union',
        type: 'affiliated_to',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'evidencing that Apex Freight Forwarders Pvt Ltd acted as a financial conduit for Eastern Maritime Stevedores Union.'
      }
    ],
    caseSummary: 'Suspicious transaction audit traces ₹45,00,000 transfer from Apex Freight Forwarders into Eastern Maritime Stevedores Union account, rapidly liquidated into bearer cash by Subhash Nayak and courier Rohit Sen.'
  },
  'DOC-SURV-305': {
    entities: [
      {
        type: 'EVENT',
        label: 'Meeting at Hotel Sea Breeze, Alibaug',
        aliases: ['Alibaug Meeting'],
        evidenceSnippet: 'surveillance team stationed outside Meeting at Hotel Sea Breeze, Alibaug observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma.'
      },
      {
        type: 'VEHICLE',
        label: 'MH-04-AX-8821',
        aliases: ['Mahindra Scorpio'],
        evidenceSnippet: 'observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma.'
      },
      {
        type: 'PERSON',
        label: 'Vikram "Vicky" Sharma',
        aliases: ['Vicky Sharma'],
        evidenceSnippet: 'arrive carrying Vikram "Vicky" Sharma. Fifteen minutes later, port contractor Subhash "Bhai" Nayak arrived'
      },
      {
        type: 'PERSON',
        label: 'Subhash "Bhai" Nayak',
        aliases: ['Subhash Nayak'],
        evidenceSnippet: 'port contractor Subhash "Bhai" Nayak arrived accompanied by driver Rohit "Montu" Sen.'
      },
      {
        type: 'PERSON',
        label: 'Rohit "Montu" Sen',
        aliases: ['Rohit Sen', 'Montu Sen'],
        evidenceSnippet: 'tracked courier Rohit "Montu" Sen driving a white Tata Ace cargo truck bearing registration WB-02-KL-4091'
      },
      {
        type: 'VEHICLE',
        label: 'WB-02-KL-4091',
        aliases: ['Tata Ace WB-02-KL-4091'],
        evidenceSnippet: 'white Tata Ace cargo truck bearing registration WB-02-KL-4091 into Jetty 3, Haldia Port Docks'
      },
      {
        type: 'LOCATION',
        label: 'Jetty 3, Haldia Port Docks',
        aliases: ['Haldia Docks'],
        evidenceSnippet: 'handed by Rohit "Montu" Sen directly to dock foreman at Jetty 3, Haldia Port Docks'
      },
      {
        type: 'ORGANIZATION',
        label: 'Eastern Maritime Stevedores Union',
        aliases: ['EMSU'],
        evidenceSnippet: 'supervised labor from Eastern Maritime Stevedores Union loading waterproof tarpaulin crates into fishing trawler M.V. Sagar Jyoti.'
      },
      {
        type: 'EVENT',
        label: 'Haldia Transshipment',
        aliases: ['Vessel Loading'],
        evidenceSnippet: 'loading waterproof tarpaulin crates into fishing trawler M.V. Sagar Jyoti.'
      },
      {
        type: 'TRANSACTION',
        label: 'Cash Delivery ₹22,00,000',
        aliases: ['Handover ₹22L'],
        evidenceSnippet: 'Officers documented a secure Cash Delivery ₹22,00,000 executed in corrugated packaging'
      }
    ],
    relationships: [
      {
        sourceLabel: 'Vikram "Vicky" Sharma',
        targetLabel: 'Meeting at Hotel Sea Breeze, Alibaug',
        type: 'attended_event',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'surveillance team stationed outside Meeting at Hotel Sea Breeze, Alibaug observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma.'
      },
      {
        sourceLabel: 'Subhash "Bhai" Nayak',
        targetLabel: 'Meeting at Hotel Sea Breeze, Alibaug',
        type: 'attended_event',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'port contractor Subhash "Bhai" Nayak arrived accompanied by driver Rohit "Montu" Sen. The parties engaged in private discussions in seaside cottage #4'
      },
      {
        sourceLabel: 'Rohit "Montu" Sen',
        targetLabel: 'Subhash "Bhai" Nayak',
        type: 'associated_with',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'port contractor Subhash "Bhai" Nayak arrived accompanied by driver Rohit "Montu" Sen.'
      },
      {
        sourceLabel: 'Rohit "Montu" Sen',
        targetLabel: 'WB-02-KL-4091',
        type: 'operates_vehicle',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'tracked courier Rohit "Montu" Sen driving a white Tata Ace cargo truck bearing registration WB-02-KL-4091'
      },
      {
        sourceLabel: 'WB-02-KL-4091',
        targetLabel: 'Jetty 3, Haldia Port Docks',
        type: 'present_at',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'cargo truck bearing registration WB-02-KL-4091 into Jetty 3, Haldia Port Docks on 24-Nov-2024.'
      },
      {
        sourceLabel: 'Subhash "Bhai" Nayak',
        targetLabel: 'Haldia Transshipment',
        type: 'supervised_event',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'Subhash "Bhai" Nayak personally supervised labor from Eastern Maritime Stevedores Union loading waterproof tarpaulin crates into fishing trawler M.V. Sagar Jyoti.'
      },
      {
        sourceLabel: 'Rohit "Montu" Sen',
        targetLabel: 'Cash Delivery ₹22,00,000',
        type: 'delivered_payment',
        confidenceLabel: 'HIGH',
        evidenceSnippet: 'secure Cash Delivery ₹22,00,000 executed in corrugated packaging handed by Rohit "Montu" Sen directly to dock foreman at Jetty 3'
      }
    ],
    caseSummary: 'Physical surveillance documents inter-state conclave between western operative Vikram Sharma and eastern contractor Subhash Nayak at Alibaug, followed by maritime transshipment and cash delivery at Haldia docks.'
  }
};
