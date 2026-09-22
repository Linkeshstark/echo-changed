import { clients, employees } from "./echo-data";

/* ---------------- Activity status lifecycle ---------------- */

export const activityStatuses = [
  "Raised",
  "Acknowledged",
  "Assigned",
  "In Progress",
  "Awaiting Parts / Information",
  "Work Completed",
  "Awaiting Admin Verification",
  "Resolved",
  "Closed",
  "Reopened",
] as const;

export type ActivityStatus = (typeof activityStatuses)[number];

export const closedStatuses: readonly ActivityStatus[] = ["Resolved", "Closed"];

export interface ActivityAttachment {
  kind: "Photo" | "Voice" | "Document";
  label: string;
  meta: string;
  duration?: string;
}

export interface ActivityTimelineEntry {
  time: string;
  status: string;
  updatedBy: string;
  note?: string;
}

export interface RaisedActivity {
  code: string;
  client: string;
  site: string;
  siteAddress: string;
  problem: string;
  description: string;
  notes: string;
  raisedDate: string;
  raisedTime: string;
  priority: "High" | "Medium" | "Low";
  status: ActivityStatus;
  assignee?: string;
  expectedCompletion?: { date: string; time: string };
  attachments: ActivityAttachment[];
  timeline: ActivityTimelineEntry[];
}

export const raisedActivities: RaisedActivity[] = [
  {
    code: "RA-001",
    client: clients[0] ?? "Aster Labs",
    site: "Aster HQ · OMR",
    siteAddress: "Level 3, Aster Tower, Old Mahabalipuram Road, Chennai",
    problem: "Irrigation issue",
    description:
      "The landscape irrigation line near the main entrance has low pressure and is leaking intermittently. Water pools near the reception walkway.",
    notes: "Client shared two photos and a voice note. Urgent before peak hours.",
    raisedDate: "22 Sep 2026",
    raisedTime: "10:42 AM",
    priority: "High",
    status: "Raised",
    attachments: [
      { kind: "Photo", label: "Entrance leak", meta: "IMG_0421.jpeg · 2.1 MB" },
      { kind: "Photo", label: "Pressure gauge", meta: "IMG_0422.jpeg · 1.8 MB" },
      { kind: "Voice", label: "Voice note", meta: "voice_note.m4a · 0.3 MB", duration: "0:09" },
    ],
    timeline: [
      {
        time: "10:42 AM",
        status: "Raised",
        updatedBy: "Client",
        note: "Irrigation issue reported",
      },
      { time: "11:05 AM", status: "Acknowledged", updatedBy: "Admin", note: "Complaint reviewed" },
      { time: "11:30 AM", status: "Assigned", updatedBy: "Admin", note: "Assigned to Dev Kumar" },
      { time: "12:15 PM", status: "In Progress", updatedBy: "Dev", note: "Work started on site" },
    ],
  },
  {
    code: "RA-002",
    client: clients[2] ?? "Meridian House",
    site: "Meridian Campus",
    siteAddress: "Block B, Meridian House, Anna Nagar, Chennai",
    problem: "Pump problem",
    description:
      "The overhead water pump in Block B cuts out intermittently. Output drops below acceptable levels and the tank does not refill overnight.",
    notes: "Client reported hearing loud cycling from the motor room.",
    raisedDate: "22 Sep 2026",
    raisedTime: "1:15 PM",
    priority: "Medium",
    status: "In Progress",
    assignee: "Dev Kumar",
    attachments: [
      { kind: "Photo", label: "Motor room", meta: "IMG_0388.jpeg · 2.4 MB" },
      { kind: "Document", label: "Pump spec sheet", meta: "pump_spec.pdf · 0.6 MB" },
    ],
    timeline: [
      { time: "1:15 PM", status: "Raised", updatedBy: "Client", note: "Pump problem reported" },
      { time: "1:28 PM", status: "Acknowledged", updatedBy: "Admin", note: "Complaint reviewed" },
      { time: "1:48 PM", status: "Assigned", updatedBy: "Admin", note: "Assigned to Dev Kumar" },
      { time: "2:05 PM", status: "In Progress", updatedBy: "Dev", note: "Diagnosis started" },
    ],
  },
  {
    code: "RA-003",
    client: clients[1] ?? "Nova Retail",
    site: "Nova Warehouse",
    siteAddress: "Plot 14, Puzhal Industrial Estate, Chennai",
    problem: "AC not cooling",
    description:
      "Two of the four rooftop AC units are pushing warm air. Coolant appears low and the condenser fins are heavily fouled.",
    notes: "Client attached a video of the units from the service catwalk.",
    raisedDate: "22 Sep 2026",
    raisedTime: "9:10 AM",
    priority: "High",
    status: "Assigned",
    assignee: "Arjun Mehta",
    attachments: [
      { kind: "Photo", label: "Unit A", meta: "IMG_0455.jpeg · 2.6 MB" },
      { kind: "Photo", label: "Condenser fins", meta: "IMG_0456.jpeg · 2.2 MB" },
      {
        kind: "Voice",
        label: "Client voice note",
        meta: "nova_noise.m4a · 0.4 MB",
        duration: "0:14",
      },
    ],
    timeline: [
      { time: "9:10 AM", status: "Raised", updatedBy: "Client", note: "AC not cooling reported" },
      { time: "9:40 AM", status: "Acknowledged", updatedBy: "Admin", note: "Complaint reviewed" },
      { time: "10:05 AM", status: "Assigned", updatedBy: "Admin", note: "Assigned to Arjun Mehta" },
    ],
  },
  {
    code: "RA-004",
    client: clients[3] ?? "Arc Systems",
    site: "Arc Factory Floor",
    siteAddress: "Sector 21, Maraimalai Nagar, Chennai",
    problem: "Compressor noise",
    description:
      "The air compressor on the factory floor is unusually noisy under load. Suspected worn bearing in the drive assembly.",
    notes: "Non-urgent — production is not blocked. Scheduling a routine visit.",
    raisedDate: "22 Sep 2026",
    raisedTime: "11:05 AM",
    priority: "Low",
    status: "Acknowledged",
    attachments: [
      {
        kind: "Voice",
        label: "Audio sample",
        meta: "compressor_noise.m4a · 0.5 MB",
        duration: "0:22",
      },
    ],
    timeline: [
      {
        time: "11:05 AM",
        status: "Raised",
        updatedBy: "Client",
        note: "Compressor noise reported",
      },
      { time: "11:22 AM", status: "Acknowledged", updatedBy: "Admin", note: "Complaint reviewed" },
    ],
  },
  {
    code: "RA-005",
    client: clients[0] ?? "Aster Labs",
    site: "Aster HQ · OMR",
    siteAddress: "Level 3, Aster Tower, Old Mahabalipuram Road, Chennai",
    problem: "Water seepage",
    description:
      "Seepage marks appeared on the service corridor ceiling after the recent rains. Drainage tray overflow suspected near the AHU.",
    notes: "Closed earlier; reopened by client as stains returned.",
    raisedDate: "18 Sep 2026",
    raisedTime: "4:30 PM",
    priority: "Medium",
    status: "Resolved",
    assignee: "Dev Kumar",
    attachments: [
      { kind: "Photo", label: "Ceiling stain", meta: "IMG_0411.jpeg · 2.0 MB" },
      { kind: "Photo", label: "After repair", meta: "IMG_0412.jpeg · 1.9 MB" },
      { kind: "Document", label: "Sealant invoice", meta: "sealant_inv.pdf · 0.4 MB" },
    ],
    timeline: [
      { time: "4:30 PM", status: "Raised", updatedBy: "Client", note: "Water seepage reported" },
      { time: "4:55 PM", status: "Acknowledged", updatedBy: "Admin", note: "Complaint reviewed" },
      { time: "9:10 AM", status: "Assigned", updatedBy: "Admin", note: "Assigned to Dev Kumar" },
      { time: "11:20 AM", status: "In Progress", updatedBy: "Dev", note: "Work started" },
      { time: "2:45 PM", status: "Work Completed", updatedBy: "Dev", note: "Repair completed" },
      {
        time: "3:00 PM",
        status: "Awaiting Admin Verification",
        updatedBy: "Dev",
        note: "Photos submitted",
      },
      {
        time: "3:20 PM",
        status: "Resolved",
        updatedBy: "Admin",
        note: "Work verified with client",
      },
      { time: "4:10 PM", status: "Closed", updatedBy: "Admin", note: "Activity closed" },
    ],
  },
];

const nowTime = () =>
  new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).format(
    new Date(),
  );

export const findActivity = (code: string): RaisedActivity | undefined =>
  raisedActivities.find((a) => a.code.toLowerCase() === code.trim().toLowerCase());

export function updateActivity(
  code: string,
  patch: {
    status?: ActivityStatus;
    note?: string;
    assignee?: string;
    expectedCompletion?: { date: string; time: string };
    attachments?: ActivityAttachment[];
  },
): RaisedActivity | undefined {
  const activity = findActivity(code);
  if (!activity) return undefined;

  if (patch.assignee && patch.assignee !== activity.assignee) {
    if (!patch.note) patch.note = `Assigned to ${patch.assignee}`;
  }
  if (patch.status && patch.status !== activity.status) {
    activity.timeline.push({
      time: nowTime(),
      status: patch.status,
      updatedBy: "Admin",
      ...(patch.note ? { note: patch.note } : {}),
    });
    activity.status = patch.status;
  } else if (patch.note) {
    activity.timeline.push({
      time: nowTime(),
      status: activity.status,
      updatedBy: "Admin",
      note: patch.note,
    });
  }

  if (patch.assignee) activity.assignee = patch.assignee;
  if (patch.expectedCompletion) activity.expectedCompletion = patch.expectedCompletion;
  if (patch.attachments?.length) activity.attachments.push(...patch.attachments);

  return activity;
}

export const raisedActivityForClient = (client: string) =>
  raisedActivities.filter((a) => a.client === client);

export const currentIssuesForClient = (client: string) =>
  raisedActivities.filter((a) => a.client === client && !closedStatuses.includes(a.status));

export const resolvedIssuesForClient = (client: string) =>
  raisedActivities.filter((a) => a.client === client && closedStatuses.includes(a.status));

export const assignedActivitiesForEmployee = (name: string) =>
  raisedActivities.filter((a) => a.assignee === name);

export const employeeNameOf = (id: string) => employees.find((e) => e.id === id)?.name;

/* ---------------- Maintenance Chart ---------------- */

export type MaintenanceStatus = "Pending" | "In Progress" | "Completed";

export interface MaintenanceRecord {
  code: string;
  client: string;
  what: string;
  description: string;
  site: string;
  employee: string;
  date: string;
  time: string;
  cost: number;
  currency: "INR";
  notes: string;
  before?: string;
  after?: string;
  status: MaintenanceStatus;
}

export const maintenanceRecords: MaintenanceRecord[] = [
  {
    code: "MNT-001",
    client: clients[0] ?? "Aster Labs",
    what: "Chiller plant filter replacement",
    description: "Replaced the air-side filters and flushed the cooling loop.",
    site: "Aster HQ · OMR",
    employee: "Dev Kumar",
    date: "21 Sep 2026",
    time: "10:30 AM",
    cost: 18500,
    currency: "INR",
    notes: "Pressure restored to spec. Disk washing scheduled for next quarter.",
    before: "Before_Chiller_01.jpeg",
    after: "After_Chiller_01.jpeg",
    status: "Completed",
  },
  {
    code: "MNT-002",
    client: clients[1] ?? "Nova Retail",
    what: "Duct cleaning & audit",
    description: "Duct audit with pre and post particulate readings.",
    site: "Nova Warehouse",
    employee: "Arjun Mehta",
    date: "20 Sep 2026",
    time: "02:00 PM",
    cost: 12750,
    currency: "INR",
    notes: "Second pass scheduled on the cold storage section.",
    before: "Before_Duct_02.jpeg",
    after: "After_Duct_02.jpeg",
    status: "In Progress",
  },
  {
    code: "MNT-003",
    client: clients[2] ?? "Meridian House",
    what: "Water pump servicing",
    description: "Bearing lubrication, gland repacking and coupling check.",
    site: "Meridian Campus",
    employee: "Dev Kumar",
    date: "19 Sep 2026",
    time: "09:15 AM",
    cost: 9300,
    currency: "INR",
    notes: "Cavitation noise reduced. Monitoring pressure for the week.",
    status: "Completed",
  },
  {
    code: "MNT-004",
    client: clients[3] ?? "Arc Systems",
    what: "AC condenser coil cleaning",
    description: "Chemical coil clean and fin straightening on both condensers.",
    site: "Arc Factory Floor",
    employee: "Arjun Mehta",
    date: "22 Sep 2026",
    time: "11:45 AM",
    cost: 22400,
    currency: "INR",
    notes: "Cooling restored. Condensate tray drains verified clear.",
    before: "Before_Coil_04.jpeg",
    after: "After_Coil_04.jpeg",
    status: "Completed",
  },
  {
    code: "MNT-005",
    client: clients[0] ?? "Aster Labs",
    what: "Rooftop cooling tower inspection",
    description: "Annual cooling tower inspection and fill media assessment.",
    site: "Aster HQ · OMR",
    employee: "Dev Kumar",
    date: "23 Sep 2026",
    time: "08:30 AM",
    cost: 15000,
    currency: "INR",
    notes: "Ridder report will be shared after the inspection.",
    status: "Pending",
  },
];

export const nextMaintenanceCode = () =>
  `MNT-${String(maintenanceRecords.length + 1).padStart(3, "0")}`;

export function addMaintenanceRecord(
  record: Omit<MaintenanceRecord, "code" | "status">,
): MaintenanceRecord {
  const created: MaintenanceRecord = { ...record, code: nextMaintenanceCode(), status: "Pending" };
  maintenanceRecords.unshift(created);
  return created;
}

export const maintenanceForClient = (client: string) =>
  maintenanceRecords.filter((m) => m.client === client);

/* ---------------- Generated documents (Bill Book) ---------------- */

export type DocType = "Quotation" | "Invoice" | "Bill" | "Voucher";

export const docTypeMeta: Record<DocType, { prefix: string; label: string; eyebrow: string }> = {
  Quotation: { prefix: "QUO", label: "New Quotation", eyebrow: "Bill Book · Quotation" },
  Invoice: { prefix: "INV", label: "New Invoice", eyebrow: "Bill Book · Invoice" },
  Bill: { prefix: "BIL", label: "New Bill", eyebrow: "Bill Book · Bill" },
  Voucher: { prefix: "VCH", label: "New Voucher", eyebrow: "Bill Book · Voucher" },
};

export interface GeneratedDoc {
  id: string;
  type: DocType;
  client: string;
  amount: string;
  date: string;
  status: string;
}

export const generatedDocuments: GeneratedDoc[] = [];

export function addGeneratedDocument(doc: Omit<GeneratedDoc, "id" | "date">): GeneratedDoc {
  const prefix = docTypeMeta[doc.type].prefix;
  const count = generatedDocuments.filter((g) => g.type === doc.type).length + 1;
  const created: GeneratedDoc = {
    ...doc,
    id: `${prefix}-${String(1000 + count)}`,
    date: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date()),
  };
  generatedDocuments.push(created);
  return created;
}

/* ---------------- Client portal profiles ---------------- */

export interface ClientProfile {
  name: string;
  company: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  gst: string;
}

export const clientProfiles: Record<string, ClientProfile> = {
  "Aster Labs": {
    name: "Aster Labs",
    company: "Aster Engineering Ltd",
    code: "CL-0001",
    phone: "+91 98410 22341",
    email: "facilities@asterlabs.in",
    address: "Aster Tower, Old Mahabalipuram Road, Chennai",
    gst: "33AAACA1234C1Z5",
  },
  "Nova Retail": {
    name: "Nova Retail",
    company: "Nova Retail Ventures Pvt Ltd",
    code: "CL-0002",
    phone: "+91 98840 55212",
    email: "ops@novaretail.in",
    address: "Plot 14, Puzhal Industrial Estate, Chennai",
    gst: "33AAACN9012K1Z8",
  },
  "Meridian House": {
    name: "Meridian House",
    company: "Meridian Housing Co-op",
    code: "CL-0003",
    phone: "+91 93440 33478",
    email: "admin@meridianhouse.in",
    address: "Block B, Anna Nagar, Chennai",
    gst: "33AAACM7720M1Z2",
  },
  "Arc Systems": {
    name: "Arc Systems",
    company: "Arc Manufacturing Systems",
    code: "CL-0004",
    phone: "+91 90250 11877",
    email: "maintenance@arcsystems.in",
    address: "Sector 21, Maraimalai Nagar, Chennai",
    gst: "33AAACA8811Q1Z7",
  },
};

export const clientProfile = (name: string): ClientProfile => {
  const cached = Object.values(clientProfiles).find(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
  );
  if (cached) return cached;
  const clean = name.trim() || "Client";
  return {
    name: clean,
    company: clean,
    code: "CL-NEW",
    phone: "—",
    email: "—",
    address: "—",
    gst: "—",
  };
};
