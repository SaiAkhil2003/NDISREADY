type DemoWorkerRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

type DemoParticipantRecord = {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  ndis_number: string | null;
  status: string;
  goals: Array<{ title: string }>;
  created_at: string;
};

type DemoProgressNoteRecord = {
  id: string;
  participant_id: string;
  worker_id: string | null;
  title: string;
  body: string;
  raw_input: string;
  ai_draft: string;
  final_note: string;
  goals_addressed: string[];
  approved_at: string | null;
  created_at: string;
  note_date: string;
};

type DemoClaimRecord = {
  id: string;
  participant_id: string;
  worker_id: string | null;
  reference: string;
  claim_date: string;
  amount: number;
  status: string;
  support_hours: number | null;
  service_code: string | null;
  notes: string | null;
  created_at: string;
};

export const demoWorkers: DemoWorkerRecord[] = [
  {
    id: "0f4f15b6-3f8a-4a30-8f06-2b77d8f31a01",
    first_name: "Olivia",
    last_name: "Harris",
    email: "olivia.harris@ndisready.com.au",
    phone: "+61 412 684 195",
    role: "support_worker",
    status: "active",
    created_at: "2025-11-04T09:15:00Z",
  },
  {
    id: "1c6d7e82-1b27-4d98-9f7d-13a73d0abf02",
    first_name: "Ethan",
    last_name: "Nguyen",
    email: "ethan.nguyen@ndisready.com.au",
    phone: "+61 438 271 604",
    role: "support_worker",
    status: "active",
    created_at: "2025-12-18T01:40:00Z",
  },
  {
    id: "2a91c5e4-7d61-4c53-bb70-5e1f6a24cc03",
    first_name: "Sarah",
    last_name: "O'Connell",
    email: "sarah.oconnell@ndisready.com.au",
    phone: "+61 423 590 118",
    role: "nurse",
    status: "active",
    created_at: "2025-10-22T22:20:00Z",
  },
  {
    id: "39d3b4f1-0f9a-4e85-a8c9-8b7c3f92de04",
    first_name: "Jacob",
    last_name: "Patel",
    email: "jacob.patel@ndisready.com.au",
    phone: "+61 451 804 337",
    role: "coordinator",
    status: "active",
    created_at: "2026-01-07T03:05:00Z",
  },
  {
    id: "4be7a9c8-6d44-4b1b-9df4-c1a6b5e17f05",
    first_name: "Chloe",
    last_name: "Williams",
    email: "chloe.williams@ndisready.com.au",
    phone: "+61 478 216 945",
    role: "support_worker",
    status: "inactive",
    created_at: "2025-08-14T06:50:00Z",
  },
  {
    id: "5f28d1aa-8c32-4f4e-a9a1-4d2e0b73a106",
    first_name: "Daniel",
    last_name: "Murphy",
    email: "daniel.murphy@ndisready.com.au",
    phone: "+61 466 932 581",
    role: "support_worker",
    status: "active",
    created_at: "2025-09-29T00:30:00Z",
  },
  {
    id: "6ac4e7d9-2b0f-4d91-bf78-7a9d2c5e4b07",
    first_name: "Priya",
    last_name: "Singh",
    email: "priya.singh@ndisready.com.au",
    phone: "+61 414 775 260",
    role: "nurse",
    status: "active",
    created_at: "2026-02-11T04:25:00Z",
  },
  {
    id: "7d59f3c1-5e62-4ab8-8c3a-9f2d1e6b8c08",
    first_name: "Matthew",
    last_name: "Brown",
    email: "matthew.brown@ndisready.com.au",
    phone: "+61 452 319 808",
    role: "coordinator",
    status: "active",
    created_at: "2025-11-30T07:10:00Z",
  },
  {
    id: "8ea1b6d4-9f73-4c2e-a5d9-2c8f7b1a3d09",
    first_name: "Emily",
    last_name: "Taylor",
    email: "emily.taylor@ndisready.com.au",
    phone: "+61 487 640 223",
    role: "support_worker",
    status: "active",
    created_at: "2026-03-03T02:55:00Z",
  },
  {
    id: "9fb2c7e5-4a81-4f6d-b3e7-6d1c9a2b4f10",
    first_name: "Lucas",
    last_name: "Johnson",
    email: "lucas.johnson@ndisready.com.au",
    phone: "+61 421 558 974",
    role: "coordinator",
    status: "inactive",
    created_at: "2025-07-21T05:45:00Z",
  },
];

export const demoParticipants: DemoParticipantRecord[] = [
  {
    id: "aa10f4c2-1d3b-4a7e-9c11-5e2f7a8b9c01",
    first_name: "Ava",
    last_name: "Walker",
    preferred_name: "Ava",
    ndis_number: "430187562",
    date_of_birth: "1994-07-18",
    status: "active",
    goals: [
      { title: "Improve daily living skills" },
      { title: "Increase community participation" },
    ],
    created_at: "2025-11-08T05:10:00Z",
  },
  {
    id: "bb21e5d3-2f4c-4b8f-a222-6f3a8b9c0d02",
    first_name: "Noah",
    last_name: "Bennett",
    preferred_name: "Noah",
    ndis_number: "518204973",
    date_of_birth: "2001-02-09",
    status: "active",
    goals: [
      { title: "Build confidence using public transport" },
      { title: "Maintain regular exercise routine" },
    ],
    created_at: "2025-11-14T04:35:00Z",
  },
  {
    id: "cc32a6e4-3a5d-4c90-b333-7a4b9c0d1e03",
    first_name: "Charlotte",
    last_name: "Ali",
    preferred_name: "Charlie",
    ndis_number: "672935104",
    date_of_birth: "1988-11-25",
    status: "active",
    goals: [
      { title: "Improve meal preparation skills" },
      { title: "Strengthen social connections" },
    ],
    created_at: "2025-12-02T00:45:00Z",
  },
  {
    id: "dd43b7f5-4b6e-4da1-8444-8b5c0d1e2f04",
    first_name: "Liam",
    last_name: "Russo",
    preferred_name: "Liam",
    ndis_number: "384761259",
    date_of_birth: "1979-05-14",
    status: "inactive",
    goals: [
      { title: "Maintain mobility and balance" },
      { title: "Attend community appointments independently" },
    ],
    created_at: "2026-01-10T03:20:00Z",
  },
  {
    id: "ee54c8a6-5c7f-4eb2-8555-9c6d1e2f3a05",
    first_name: "Isla",
    last_name: "Thompson",
    preferred_name: "Izzy",
    ndis_number: "905126438",
    date_of_birth: "2010-09-03",
    status: "active",
    goals: [
      { title: "Develop communication skills" },
      { title: "Participate in after-school activities" },
    ],
    created_at: "2026-02-03T06:15:00Z",
  },
  {
    id: "ff65d9b7-6d80-4fc3-8666-ad7e2f3a4b06",
    first_name: "Mason",
    last_name: "Clarke",
    preferred_name: "Mason",
    ndis_number: "741508296",
    date_of_birth: "1996-01-27",
    status: "active",
    goals: [
      { title: "Manage household routines independently" },
      { title: "Increase participation in local sports" },
    ],
    created_at: "2026-02-18T01:05:00Z",
  },
  {
    id: "0a76eac8-7e91-40d4-8777-be8f3a4b5c07",
    first_name: "Grace",
    last_name: "Chen",
    preferred_name: "Grace",
    ndis_number: "286419705",
    date_of_birth: "1985-03-31",
    status: "active",
    goals: [
      { title: "Improve personal care routines" },
      { title: "Re-engage with volunteering" },
    ],
    created_at: "2026-03-01T02:40:00Z",
  },
  {
    id: "1b87fbd9-8fa2-41e5-a888-cf9a4b5c6d08",
    first_name: "Jackson",
    last_name: "O'Brien",
    preferred_name: "Jack",
    ndis_number: "813670524",
    date_of_birth: "1992-12-12",
    status: "inactive",
    goals: [
      { title: "Reduce anxiety in community settings" },
      { title: "Build budgeting skills" },
    ],
    created_at: "2026-03-08T08:20:00Z",
  },
  {
    id: "2c98acea-9ab3-42f6-b999-d0ab5c6d7e09",
    first_name: "Sophia",
    last_name: "Kaur",
    preferred_name: "Sophie",
    ndis_number: "659241837",
    date_of_birth: "2004-06-20",
    status: "active",
    goals: [
      { title: "Travel to TAFE independently" },
      { title: "Build confidence in social situations" },
    ],
    created_at: "2026-03-12T07:05:00Z",
  },
  {
    id: "3da9bdfb-acc4-43a7-8aaa-e1bc6d7e8f10",
    first_name: "Henry",
    last_name: "Wallace",
    preferred_name: "Henry",
    ndis_number: "497358162",
    date_of_birth: "1974-08-08",
    status: "active",
    goals: [
      { title: "Maintain medication routines" },
      { title: "Increase involvement in community groups" },
    ],
    created_at: "2026-03-18T03:30:00Z",
  },
];

export const demoProgressNotes: DemoProgressNoteRecord[] = [
  {
    id: "41c0e3d2-7f14-4a8b-9d2f-1a6b3c4d5e11",
    participant_id: "aa10f4c2-1d3b-4a7e-9c11-5e2f7a8b9c01",
    worker_id: "0f4f15b6-3f8a-4a30-8f06-2b77d8f31a01",
    title: "Progress update",
    body: "Ava participated in meal preparation by planning lunch and making a sandwich with minimal verbal prompts. She then walked to the local shops and remained engaged throughout the outing.",
    raw_input: "Ava planned lunch, made a sandwich with prompts, and walked to the local shops.",
    ai_draft: "Participant completed meal preparation and community access activities with verbal prompting to build independence.",
    final_note: "Ava participated in meal preparation by planning lunch and making a sandwich with minimal verbal prompts. She then walked to the local shops and remained engaged throughout the outing. Support focused on building independence with daily living tasks and confidence accessing the community.",
    goals_addressed: ["Improve daily living skills", "Increase community participation"],
    approved_at: "2026-04-14T07:20:00Z",
    created_at: "2026-04-14T05:10:00Z",
    note_date: "2026-04-14",
  },
  {
    id: "52d1f4e3-8a25-4b9c-ae30-2b7c4d5e6f12",
    participant_id: "bb21e5d3-2f4c-4b8f-a222-6f3a8b9c0d02",
    worker_id: "1c6d7e82-1b27-4d98-9f7d-13a73d0abf02",
    title: "Progress update",
    body: "Noah used the bus to travel to the gym, checking the timetable and identifying the correct stop with one prompt. He completed his planned exercise session and showed improved confidence navigating the route.",
    raw_input: "Noah caught the bus with me to the gym and checked the timetable himself.",
    ai_draft: "Participant practiced using public transport and followed a planned exercise routine with reduced support.",
    final_note: "Noah used the bus to travel to the gym, checking the timetable and identifying the correct stop with one prompt. He completed his planned exercise session and showed improved confidence navigating the route. Support targeted transport independence and maintaining a regular exercise routine.",
    goals_addressed: ["Build confidence using public transport", "Maintain regular exercise routine"],
    approved_at: "2026-04-15T08:05:00Z",
    created_at: "2026-04-15T06:15:00Z",
    note_date: "2026-04-15",
  },
  {
    id: "63e205f4-9b36-4cad-bf41-3c8d5e6f7a13",
    participant_id: "cc32a6e4-3a5d-4c90-b333-7a4b9c0d1e03",
    worker_id: "2a91c5e4-7d61-4c53-bb70-5e1f6a24cc03",
    title: "Case note",
    body: "Charlotte assisted with preparing soup ingredients, including washing vegetables and organising the kitchen workspace. She also discussed plans to meet her neighbour for coffee later this week.",
    raw_input: "Charlotte helped prep soup ingredients and talked about joining her neighbour for coffee this week.",
    ai_draft: "Participant engaged in meal preparation and discussed social participation goals during support.",
    final_note: "Charlotte assisted with preparing soup ingredients, including washing vegetables and organising the kitchen workspace. She also discussed plans to meet her neighbour for coffee later this week and identified this as a positive step toward increasing social contact. Support reinforced meal preparation skills and strengthening social connections.",
    goals_addressed: ["Improve meal preparation skills", "Strengthen social connections"],
    approved_at: "2026-04-11T04:40:00Z",
    created_at: "2026-04-11T02:50:00Z",
    note_date: "2026-04-11",
  },
  {
    id: "74f31605-ac47-4dbe-8052-4d9e6f7a8b14",
    participant_id: "dd43b7f5-4b6e-4da1-8444-8b5c0d1e2f04",
    worker_id: "5f28d1aa-8c32-4f4e-a9a1-4d2e0b73a106",
    title: "Case note",
    body: "Liam completed a short standing balance program at home before travelling to his GP appointment. He walked into the clinic with standby assistance and followed directions well.",
    raw_input: "Liam practiced standing exercises and we walked into the GP clinic together.",
    ai_draft: "Participant completed mobility exercises and attended a community appointment with support.",
    final_note: "Liam completed a short standing balance program at home before travelling to his GP appointment. He walked into the clinic with standby assistance and followed directions well. The session supported his mobility goals and increased confidence attending appointments.",
    goals_addressed: ["Maintain mobility and balance", "Attend community appointments independently"],
    approved_at: null,
    created_at: "2026-04-09T01:30:00Z",
    note_date: "2026-04-09",
  },
  {
    id: "85042716-bd58-4ecf-9163-5eaf7a8b9c15",
    participant_id: "ee54c8a6-5c7f-4eb2-8555-9c6d1e2f3a05",
    worker_id: "8ea1b6d4-9f73-4c2e-a5d9-2c8f7b1a3d09",
    title: "Progress update",
    body: "Izzy used her visual communication cards to request a snack and responded well to prompting during the interaction. After school, she attended basketball and remained involved for the full session.",
    raw_input: "Izzy used her visual cards to ask for a snack and then joined basketball after school.",
    ai_draft: "Participant used communication supports effectively and participated in a structured after-school activity.",
    final_note: "Izzy used her visual communication cards to request a snack and responded well to prompting during the interaction. After school, she attended basketball and remained involved for the full session with encouragement from staff. Support focused on communication development and participation in after-school activities.",
    goals_addressed: ["Develop communication skills", "Participate in after-school activities"],
    approved_at: "2026-04-16T07:45:00Z",
    created_at: "2026-04-16T05:35:00Z",
    note_date: "2026-04-16",
  },
  {
    id: "96153827-ce69-4fd0-a274-6fb08b9cad16",
    participant_id: "ff65d9b7-6d80-4fc3-8666-ad7e2f3a4b06",
    worker_id: "39d3b4f1-0f9a-4e85-a8c9-8b7c3f92de04",
    title: "Handover",
    body: "Mason collaborated to set up a weekly cleaning roster for his unit and was able to identify which household tasks he can complete independently. He also spoke positively about rejoining indoor soccer.",
    raw_input: "Mason set up a cleaning roster and said he wants to try indoor soccer again.",
    ai_draft: "Participant worked on household organisation and discussed increasing participation in local sport.",
    final_note: "Mason collaborated to set up a weekly cleaning roster for his unit and was able to identify which household tasks he can complete independently. He also spoke positively about rejoining indoor soccer and agreed to review local competition times next week. The session supported routine management and community sport participation goals.",
    goals_addressed: ["Manage household routines independently", "Increase participation in local sports"],
    approved_at: "2026-04-10T10:00:00Z",
    created_at: "2026-04-10T08:10:00Z",
    note_date: "2026-04-10",
  },
  {
    id: "a7264938-df7a-40e1-b385-70c19cadbe17",
    participant_id: "0a76eac8-7e91-40d4-8777-be8f3a4b5c07",
    worker_id: "6ac4e7d9-2b0f-4d91-bf78-7a9d2c5e4b07",
    title: "Case note",
    body: "Grace completed her morning shower and dressing routine with only one reminder to stay on task. She then discussed available volunteer shifts at the local op shop and expressed interest in returning for a short weekly shift.",
    raw_input: "Grace did her morning shower routine with only one reminder and asked about volunteer shifts at the op shop.",
    ai_draft: "Participant demonstrated improved personal care independence and explored volunteering opportunities.",
    final_note: "Grace completed her morning shower and dressing routine with only one reminder to stay on task. She then discussed available volunteer shifts at the local op shop and expressed interest in returning for a short weekly shift. Support addressed personal care independence and re-engagement with volunteering.",
    goals_addressed: ["Improve personal care routines", "Re-engage with volunteering"],
    approved_at: "2026-04-13T02:25:00Z",
    created_at: "2026-04-13T00:40:00Z",
    note_date: "2026-04-13",
  },
  {
    id: "b8375a49-e08b-41f2-8496-81d2adbecf18",
    participant_id: "1b87fbd9-8fa2-41e5-a888-cf9a4b5c6d08",
    worker_id: "7d59f3c1-5e62-4ab8-8c3a-9f2d1e6b8c08",
    title: "Case note",
    body: "Jack attended the supermarket and initially presented as anxious in the busy environment. With grounding prompts, he remained in the store long enough to compare prices on key items and complete a basic spending plan.",
    raw_input: "Jack got anxious at the supermarket but stayed long enough to compare prices and do a basic budget.",
    ai_draft: "Participant managed anxiety in a community setting and practiced simple budgeting skills during shopping.",
    final_note: "Jack attended the supermarket and initially presented as anxious in the busy environment. With grounding prompts, he remained in the store long enough to compare prices on key items and complete a basic spending plan. The session supported anxiety management in community settings and budgeting skill development.",
    goals_addressed: ["Reduce anxiety in community settings", "Build budgeting skills"],
    approved_at: null,
    created_at: "2026-04-08T03:20:00Z",
    note_date: "2026-04-08",
  },
  {
    id: "c9486b5a-f19c-42a3-95a7-92e3becfe019",
    participant_id: "2c98acea-9ab3-42f6-b999-d0ab5c6d7e09",
    worker_id: "1c6d7e82-1b27-4d98-9f7d-13a73d0abf02",
    title: "Progress update",
    body: "Sophie independently checked the platform board before boarding the train to TAFE and required no prompting to locate the correct service. At lunch, she ordered and paid for her meal on her own.",
    raw_input: "Sophie checked the train platform board herself and ordered her lunch without me stepping in.",
    ai_draft: "Participant practiced independent travel and social communication in a community environment.",
    final_note: "Sophie independently checked the platform board before boarding the train to TAFE and required no prompting to locate the correct service. At lunch, she ordered and paid for her meal on her own, showing increased confidence speaking with unfamiliar people. Support targeted independent travel and confidence in social situations.",
    goals_addressed: ["Travel to TAFE independently", "Build confidence in social situations"],
    approved_at: "2026-04-12T06:35:00Z",
    created_at: "2026-04-12T04:45:00Z",
    note_date: "2026-04-12",
  },
  {
    id: "da597c6b-02ad-43b4-a6b8-a3f4cfd0f11a",
    participant_id: "3da9bdfb-acc4-43a7-8aaa-e1bc6d7e8f10",
    worker_id: "2a91c5e4-7d61-4c53-bb70-5e1f6a24cc03",
    title: "Progress update",
    body: "Henry successfully filled his weekly pill organiser using his medication checklist and confirmed the correct timing for each dose. He later attended the local men's shed and remained for the afternoon session.",
    raw_input: "Henry filled his pill organiser and stayed for the men's shed visit this afternoon.",
    ai_draft: "Participant completed medication routine tasks and engaged in a community group activity.",
    final_note: "Henry successfully filled his weekly pill organiser using his medication checklist and confirmed the correct timing for each dose. He later attended the local men's shed and remained for the afternoon session, participating in conversation with other members. Support focused on medication management and increasing community involvement.",
    goals_addressed: ["Maintain medication routines", "Increase involvement in community groups"],
    approved_at: "2026-04-07T05:55:00Z",
    created_at: "2026-04-07T03:50:00Z",
    note_date: "2026-04-07",
  },
];

export const demoClaims: DemoClaimRecord[] = [
  {
    id: "b10c2d3e-4f51-4a62-8b71-1c2d3e4f5a61",
    participant_id: "aa10f4c2-1d3b-4a7e-9c11-5e2f7a8b9c01",
    worker_id: "0f4f15b6-3f8a-4a30-8f06-2b77d8f31a01",
    reference: "CLM-260414-001",
    claim_date: "2026-04-14",
    amount: 202.68,
    status: "approved",
    support_hours: 3,
    service_code: "01_011_0107_1_1",
    notes: "Community access and meal preparation support completed as scheduled.",
    created_at: "2026-04-14T08:10:00Z",
  },
  {
    id: "c21d3e4f-5a62-4b73-9c82-2d3e4f5a6b72",
    participant_id: "bb21e5d3-2f4c-4b8f-a222-6f3a8b9c0d02",
    worker_id: "1c6d7e82-1b27-4d98-9f7d-13a73d0abf02",
    reference: "CLM-260415-002",
    claim_date: "2026-04-15",
    amount: 168.9,
    status: "draft",
    support_hours: 2.5,
    service_code: "04_104_0136_6_1",
    notes: "Draft claim for bus travel training and gym-based exercise support.",
    created_at: "2026-04-15T09:00:00Z",
  },
  {
    id: "d32e4f5a-6b73-4c84-ad93-3e4f5a6b7c83",
    participant_id: "cc32a6e4-3a5d-4c90-b333-7a4b9c0d1e03",
    worker_id: "2a91c5e4-7d61-4c53-bb70-5e1f6a24cc03",
    reference: "CLM-260411-003",
    claim_date: "2026-04-11",
    amount: 138.15,
    status: "approved",
    support_hours: 1.5,
    service_code: "01_010_0107_1_1",
    notes: "Nursing support for medication review and meal preparation tasks.",
    created_at: "2026-04-11T05:25:00Z",
  },
  {
    id: "e43f5a6b-7c84-4d95-bea4-4f5a6b7c8d94",
    participant_id: "dd43b7f5-4b6e-4da1-8444-8b5c0d1e2f04",
    worker_id: "5f28d1aa-8c32-4f4e-a9a1-4d2e0b73a106",
    reference: "CLM-260409-004",
    claim_date: "2026-04-09",
    amount: 135.12,
    status: "rejected",
    support_hours: 2,
    service_code: "01_020_0107_1_1",
    notes: "Rejected pending clarification of appointment attendance details.",
    created_at: "2026-04-09T04:00:00Z",
  },
  {
    id: "f54a6b7c-8d95-4ea6-8fb5-5a6b7c8d9ea5",
    participant_id: "ee54c8a6-5c7f-4eb2-8555-9c6d1e2f3a05",
    worker_id: "8ea1b6d4-9f73-4c2e-a5d9-2c8f7b1a3d09",
    reference: "CLM-260416-005",
    claim_date: "2026-04-16",
    amount: 135.12,
    status: "approved",
    support_hours: 2,
    service_code: "04_210_0125_6_1",
    notes: "After-school support session including communication prompts and basketball.",
    created_at: "2026-04-16T08:20:00Z",
  },
  {
    id: "065b7c8d-9ea6-4fb7-90c6-6b7c8d9eafb6",
    participant_id: "ff65d9b7-6d80-4fc3-8666-ad7e2f3a4b06",
    worker_id: "39d3b4f1-0f9a-4e85-a8c9-8b7c3f92de04",
    reference: "CLM-260410-006",
    claim_date: "2026-04-10",
    amount: 150.3,
    status: "approved",
    support_hours: 1.5,
    service_code: "06_701_0130_3_3",
    notes: "Support coordination session for household routines and sports re-engagement.",
    created_at: "2026-04-10T10:40:00Z",
  },
];

export function getDemoWorkerById(workerId: string) {
  return demoWorkers.find((worker) => worker.id === workerId) ?? null;
}

export function getDemoParticipantById(participantId: string) {
  return demoParticipants.find((participant) => participant.id === participantId) ?? null;
}

export function getDemoClaimById(claimId: string) {
  return demoClaims.find((claim) => claim.id === claimId) ?? null;
}
