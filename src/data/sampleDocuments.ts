import { CaseDocument } from '../types';

export const SAMPLE_DOCUMENTS: CaseDocument[] = [
  {
    id: 'DOC-FIR-142',
    title: 'FIR No. 142/2024: Bhiwandi Logistics Raid & Contraband Seizure',
    type: 'FIR',
    date: '2024-10-14',
    sourceAuthority: 'Crime Branch Mumbai (Zone II Special Task Force)',
    classification: 'CONFIDENTIAL',
    summary: 'Raid on Godown 4 at Bhiwandi Logistics Hub leading to interception of commercial vehicle MH-04-AX-8821 and documentation linking freight handler Vikram Sharma with fugitive broker Tariq Merchant.',
    content: `FIRST INFORMATION REPORT (Under Sec 154 Cr.P.C.)
Police Station: Crime Branch Anti-Extortion & Organized Crime Unit, Mumbai
Case FIR No: 142/2024 | Date of Occurrence: 14-Oct-2024 at 02:30 hrs
Complainant: Inspector R. K. Sawant (STF Mumbai)

1. DETAILS OF INCIDENT & SEIZURE:
Acting upon actionable source intelligence, a tactical raid was executed at Godown 4, Bhiwandi Logistics Hub, Thane Rural. Upon cordoning the perimeter, officers intercepted a dark blue Mahindra Scorpio bearing registration number MH-04-AX-8821 loaded with concealed false-bottom consignment crates.

2. SUSPECT INTERCEPTION & VEHICULAR CUSTODY:
The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane, who claimed to be operating under direct freight forwarding instructions from Apex Freight Forwarders Pvt Ltd. Search of the vehicle yielded two mobile handsets, including primary burner device +91-98201-44719, which registered frequent incoming encrypted VoIP pings from an overseas IP gateway attributed to Tariq "Raza" Merchant.

3. RECOVERED INVOICES & HAWALA CORRESPONDENCE:
Documentary examination of consignment bill APX-8819 recovered inside the vehicle glovebox listed consignor as Apex Freight Forwarders Pvt Ltd with delivery coordinates specified for coastal transport staging. Accused Vikram Sharma confessed during preliminary questioning that Tariq "Raza" Merchant financed the procurement of vehicle MH-04-AX-8821 and orchestrated night logistics dispatching from Godown 4, Bhiwandi Logistics Hub.`
  },
  {
    id: 'DOC-CDR-88',
    title: 'CDR Intercept Analysis: Burner Link Matrix & Coastal Tower Dumps',
    type: 'CDR',
    date: '2024-11-02',
    sourceAuthority: 'Technical Intelligence Wing (Cyber Cell & Telecom Intercept Unit)',
    classification: 'RESTRICTED',
    summary: 'Cellular triangulation and multi-subscriber analysis exposing direct telephonic handshake between western logistics operator and eastern port stevedore.',
    content: `TECHNICAL SURVEILLANCE REPORT: TELECOM LINK MATRIX
Target Identifier: +91-98201-44719 (Subscriber Name: Ramesh Yadav, forged identity)
Report Ref: CR-88-CDR-STF | Date: 02-Nov-2024

1. TELECOMMUNICATION PROFILE & INTERCEPT SUMMARY:
Burner MSISDN +91-98201-44719, recovered from accused Vikram "Vicky" Sharma, exhibits severe operational security protocols (short burst calls < 45 seconds, zero outgoing SMS, device active primarily during 23:00 - 04:00 window).

2. KEY CALL PAIRINGS IDENTIFIED:
a) Handshake 1: 42 cellular calls logged between +91-98201-44719 and overseas satellite terminal used by Tariq "Raza" Merchant between 15-Sep-2024 and 12-Oct-2024.
b) Handshake 2 (Cross-Regional Bridge): 19 direct calls logged between +91-98201-44719 and Kolkata cellular node +91-97330-89102 registered under port handling contractor Subhash "Bhai" Nayak.
c) Geographic Tower Clustering: Cell tower dump at Alibaug Coastal Tower shows burner +91-98201-44719 and secondary device +91-97330-89102 latching on identical sector transceiver on the night of 12-Nov-2024 between 21:10 and 23:45 hrs, confirming physical proximity during Meeting at Hotel Sea Breeze, Alibaug.`
  },
  {
    id: 'DOC-FIN-091',
    title: 'FinIntel Suspicious Activity Audit: Wire Conduits & Shell Invoicing',
    type: 'Financial',
    date: '2024-11-16',
    sourceAuthority: 'Financial Intelligence Unit (FIU-IND) Liaison Cell',
    classification: 'CONFIDENTIAL',
    summary: 'Audit of structured wire transfers tracing ₹45,00,000 moving from Mumbai commercial account through maritime unions to Haldia dock operatives.',
    content: `FINANCIAL INTELLIGENCE STR AUDIT REPORT
Subject: Layered Transaction Flow Ref: STR-2024/091
Originating Entity: Apex Freight Forwarders Pvt Ltd (Current A/c: HDFC-0091823)

1. SUSPICIOUS TRANSACTION DETAILS:
On 24-Oct-2024, transaction reference TXN-2024-H7810 was initiated in the amount of ₹45,00,000 debited from Apex Freight Forwarders Pvt Ltd under the ledger narration "Machinery Overhaul Spare Parts". The remitted funds were disbursed in split tranches into the bank account of Eastern Maritime Stevedores Union.

2. SUBSEQUENT DISBURSAL & CASH CONDUIT:
Within 36 hours of receipt, ₹22,00,000 was withdrawn via bearer self-cheques authorized by union secretary Subhash "Bhai" Nayak. A supplementary electronic transfer of ₹8,50,000 was traced directly to logistics courier Rohit "Montu" Sen under the justification of coastal transport freightage.

3. CORROBORATION WITH PHYSICAL LOGISTICS:
The timing of transaction TXN-2024-H7810 closely correlates with the mobilization of vehicle fleets between Bhiwandi and eastern coastal receiving points, evidencing that Apex Freight Forwarders Pvt Ltd acted as a financial conduit for Eastern Maritime Stevedores Union.`
  },
  {
    id: 'DOC-SURV-305',
    title: 'Special Field Surveillance: Alibaug Meeting & Haldia Offloading',
    type: 'Surveillance',
    date: '2024-11-28',
    sourceAuthority: 'State Intelligence Department (Counter-Transnational Cell)',
    classification: 'CONFIDENTIAL',
    summary: 'Human intelligence and physical surveillance verifying handover between western transport runners and eastern dock labor syndicate.',
    content: `FIELD SURVEILLANCE REPORT (OPERATIONAL LOG SOC-305)
Dates: 12-Nov-2024 to 26-Nov-2024 | Unit: Team Bravo Counter-Cell

1. VISUAL IDENTIFICATION AT ALIBAUG:
On 12-Nov-2024 at 21:30 hrs, surveillance team stationed outside Meeting at Hotel Sea Breeze, Alibaug observed vehicle MH-04-AX-8821 arrive carrying Vikram "Vicky" Sharma. Fifteen minutes later, port contractor Subhash "Bhai" Nayak arrived accompanied by driver Rohit "Montu" Sen. The parties engaged in private discussions in seaside cottage #4 until 23:20 hrs.

2. TRANSSHIPMENT & CARGO TRANSFER AT HALDIA:
Follow-up mobile surveillance tracked courier Rohit "Montu" Sen driving a white Tata Ace cargo truck bearing registration WB-02-KL-4091 into Jetty 3, Haldia Port Docks on 24-Nov-2024. Accused Subhash "Bhai" Nayak personally supervised labor from Eastern Maritime Stevedores Union loading waterproof tarpaulin crates into fishing trawler M.V. Sagar Jyoti.

3. RECOVERED PHYSICAL EVIDENCE:
Officers documented a secure Cash Delivery ₹22,00,000 executed in corrugated packaging handed by Rohit "Montu" Sen directly to dock foreman at Jetty 3, Haldia Port Docks, matching amounts flagged in financial STR-2024/091.`
  }
];
