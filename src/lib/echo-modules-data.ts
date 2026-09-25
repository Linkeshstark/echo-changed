import { clients, employees } from "./echo-data";
import type { Satisfaction } from "./echo-ops-data";

/* ---------------- Shared types ---------------- */

export type ReviewStatus = "Pending Review" | "Approved" | "Rejected";

export interface ChecklistItem {
  label: string;
  completed: boolean;
}

export interface UploadedFile {
  kind: "Before" | "After" | "Photo" | "Video" | "Voice" | "Signature" | "Mark";
  label: string;
  meta: string;
}

export interface TaskSubmission {
  id: number;
  title: string;
  client: string;
  date: string;
  checkIn: string;
  checkOut: string;
  narrative: string;
  checklist: ChecklistItem[];
  files: UploadedFile[];
  review: ReviewStatus;
  note?: string;
  submittedOn: string;
  satisfaction?: Satisfaction;
}

/* ---------------- Task submissions ---------------- */

const checklist = (
  before: boolean,
  after: boolean,
  voice: boolean,
  signature: boolean,
  mark: boolean,
  photos: boolean,
  video: boolean,
): ChecklistItem[] => [
  { label: "Before Photo", completed: before },
  { label: "After Photo", completed: after },
  { label: "Voice Reply", completed: voice },
  { label: "Signature", completed: signature },
  { label: "Mark", completed: mark },
  { label: "Photos (4)", completed: photos },
  { label: "Video", completed: video },
];

const gallery = (start: number, count: number): UploadedFile[] =>
  Array.from({ length: count }, (_, i) => ({
    kind: "Photo",
    label: `Photo ${i + 1}`,
    meta: `IMG_${String(start + i).padStart(4, "0")}.jpeg · 2.4 MB`,
  }));

const beforeAfter = (): UploadedFile[] => [
  { kind: "Before", label: "Before", meta: "Before_State.jpeg · 1.8 MB" },
  { kind: "After", label: "After", meta: "After_State.jpeg · 1.9 MB" },
];

export const submissionReviews: { employeeId: string; tasks: TaskSubmission[] }[] = [
  {
    employeeId: "E-1042",
    tasks: [
      {
        id: 21,
        title: "Aster Labs site inspection",
        client: clients[0] ?? "Aster Labs",
        date: "22 Sep 2026",
        checkIn: "09:04",
        checkOut: "12:30",
        narrative:
          "Completed the full site inspection. Both floors checked, service ducts cleared, and the power panel logged. Two light fixtures need a follow-up visit.",
        checklist: checklist(true, true, true, true, true, true, true),
        files: [
          ...beforeAfter(),
          ...gallery(41, 4),
          { kind: "Video", label: "Walkthrough", meta: "site_tour.mp4 · 48 MB" },
          { kind: "Voice", label: "Voice reply", meta: "voice_reply.m4a · 0.4 MB" },
          { kind: "Signature", label: "Site sign-off", meta: "signature.png · 0.1 MB" },
          { kind: "Mark", label: "Inspection mark", meta: "mark.png · 0.1 MB" },
        ],
        review: "Pending Review",
        submittedOn: "Today",
      },
      {
        id: 20,
        title: "Aster Labs maintenance round",
        client: clients[0] ?? "Aster Labs",
        date: "20 Sep 2026",
        checkIn: "10:12",
        checkOut: "13:45",
        narrative:
          "Routine maintenance round complete. Filters replaced and lubrication done on the service units.",
        checklist: checklist(true, true, true, false, true, true, true),
        files: [
          ...beforeAfter(),
          ...gallery(30, 4),
          { kind: "Video", label: "Round summary", meta: "round_20.mp4 · 31 MB" },
          { kind: "Voice", label: "Status update", meta: "note_20.m4a · 0.3 MB" },
          { kind: "Mark", label: "Maintenance mark", meta: "mark_20.png · 0.1 MB" },
        ],
        review: "Approved",
        submittedOn: "20 Sep 2026",
        note: "All evidence verified. Approved.",
        satisfaction: {
          rating: 4,
          comment: "Team arrived on time and cleaned up before leaving. Filters working well.",
          ratedBy: "Meera Raghavan",
          ratedOn: "21 Sep 2026",
        },
      },
      {
        id: 19,
        title: "Nova Retail duct audit",
        client: clients[1] ?? "Nova Retail",
        date: "18 Sep 2026",
        checkIn: "14:20",
        checkOut: "17:05",
        narrative:
          "Duct audit carried out but the after photo set was incomplete and the voice reply did not record.",
        checklist: checklist(true, false, false, true, true, true, false),
        files: [
          ...gallery(12, 3),
          { kind: "Signature", label: "Client sign-off", meta: "signature.png · 0.1 MB" },
          { kind: "Mark", label: "Audit mark", meta: "mark.png · 0.1 MB" },
        ],
        review: "Rejected",
        submittedOn: "18 Sep 2026",
        note: "Rejected — missing after photos and voice reply.",
      },
    ],
  },
  {
    employeeId: "E-1078",
    tasks: [
      {
        id: 18,
        title: "Invoice reconciliation review",
        client: clients[0] ?? "Aster Labs",
        date: "21 Sep 2026",
        checkIn: "09:02",
        checkOut: "18:31",
        narrative:
          "Reconciled the September ledger with the bank statement. Two entries flagged for approval.",
        checklist: checklist(true, true, true, true, true, true, true),
        files: [
          ...gallery(55, 4),
          { kind: "Video", label: "Ledger walkthrough", meta: "ledger.mp4 · 22 MB" },
          { kind: "Voice", label: "Findings", meta: "findings.m4a · 0.5 MB" },
        ],
        review: "Approved",
        submittedOn: "21 Sep 2026",
        note: "Numbers match. Approved.",
        satisfaction: {
          rating: 5,
          ratedBy: "Vikram Desai",
          ratedOn: "21 Sep 2026",
        },
      },
      {
        id: 17,
        title: "Bank statement verification",
        client: clients[1] ?? "Nova Retail",
        date: "22 Sep 2026",
        checkIn: "10:40",
        checkOut: "16:20",
        narrative:
          "NEFT credits verified against the client ledger. Awaiting signature on the confirmation sheet.",
        checklist: checklist(true, true, true, false, true, true, false),
        files: [
          ...gallery(61, 4),
          { kind: "Voice", label: "Verification note", meta: "verify.m4a · 0.3 MB" },
        ],
        review: "Pending Review",
        submittedOn: "Today",
      },
    ],
  },
  {
    employeeId: "E-1121",
    tasks: [
      {
        id: 16,
        title: "AC service — Arc Systems",
        client: clients[3] ?? "Arc Systems",
        date: "22 Sep 2026",
        checkIn: "08:55",
        checkOut: "12:10",
        narrative:
          "Recharged two units, cleaned filters, and tested cooling across the floor. Refill log updated.",
        checklist: checklist(true, true, true, true, true, true, true),
        files: [
          ...beforeAfter(),
          ...gallery(71, 4),
          { kind: "Video", label: "Service video", meta: "ac_service.mp4 · 54 MB" },
          { kind: "Voice", label: "Service summary", meta: "ac_note.m4a · 0.4 MB" },
          { kind: "Signature", label: "Client sign-off", meta: "signature.png · 0.1 MB" },
          { kind: "Mark", label: "Unit mark", meta: "mark.png · 0.1 MB" },
        ],
        review: "Pending Review",
        submittedOn: "Today",
      },
      {
        id: 15,
        title: "Plumbing — Meridian House",
        client: clients[2] ?? "Meridian House",
        date: "19 Sep 2026",
        checkIn: "09:30",
        checkOut: "13:15",
        narrative:
          "Replaced the washroom valve set and sealed the inlet joints. Pressure test passed.",
        checklist: checklist(true, true, true, true, false, true, false),
        files: [
          ...beforeAfter(),
          ...gallery(19, 4),
          { kind: "Voice", label: "Handover note", meta: "plumb.m4a · 0.3 MB" },
        ],
        review: "Approved",
        submittedOn: "19 Sep 2026",
        note: "Verified with client. Approved.",
      },
      {
        id: 14,
        title: "Equipment install — Aster Labs",
        client: clients[0] ?? "Aster Labs",
        date: "17 Sep 2026",
        checkIn: "11:05",
        checkOut: "16:40",
        narrative:
          "Installed and commissioned the new compressor bank. Safety wiring re-terminated.",
        checklist: checklist(true, true, true, true, true, true, true),
        files: [
          ...beforeAfter(),
          ...gallery(9, 4),
          { kind: "Video", label: "Commissioning", meta: "commission.mp4 · 61 MB" },
          { kind: "Voice", label: "Setup note", meta: "setup.m4a · 0.4 MB" },
          { kind: "Signature", label: "Commission sign-off", meta: "signature.png · 0.1 MB" },
          { kind: "Mark", label: "Install mark", meta: "mark.png · 0.1 MB" },
        ],
        review: "Approved",
        submittedOn: "17 Sep 2026",
        note: "Commissioning verified. Approved.",
        satisfaction: {
          rating: 4,
          comment: "Install clean and tidy. Would recommend the team again.",
          ratedBy: "Meera Raghavan",
          ratedOn: "18 Sep 2026",
        },
      },
    ],
  },
  {
    employeeId: "E-1150",
    tasks: [
      {
        id: 13,
        title: "Nova Retail renewal meeting",
        client: clients[1] ?? "Nova Retail",
        date: "21 Sep 2026",
        checkIn: "15:00",
        checkOut: "17:30",
        narrative:
          "Renewal walkthrough held with the client. Next year's scope drafted and shared.",
        checklist: checklist(true, true, true, true, true, true, true),
        files: [
          ...gallery(47, 4),
          { kind: "Video", label: "Meeting recap", meta: "renewal.mp4 · 18 MB" },
          { kind: "Voice", label: "Client remarks", meta: "remarks.m4a · 0.4 MB" },
          { kind: "Signature", label: "Meeting sign-off", meta: "signature.png · 0.1 MB" },
        ],
        review: "Approved",
        submittedOn: "21 Sep 2026",
        note: "Scope confirmed by client. Approved.",
      },
      {
        id: 12,
        title: "Meridian House onboarding docs",
        client: clients[2] ?? "Meridian House",
        date: "22 Sep 2026",
        checkIn: "09:15",
        checkOut: "13:25",
        narrative: "Collected and digitised the onboarding documents. Bank file pending upload.",
        checklist: checklist(true, true, true, true, false, true, false),
        files: [
          ...gallery(66, 4),
          { kind: "Voice", label: "Docs status", meta: "docs.m4a · 0.3 MB" },
        ],
        review: "Pending Review",
        submittedOn: "Today",
      },
    ],
  },
];

export const submissionCounts = (employeeId: string) => {
  const set = submissionReviews.find((s) => s.employeeId === employeeId);
  return set
    ? {
        pending: set.tasks.filter((t) => t.review === "Pending Review").length,
        approved: set.tasks.filter((t) => t.review === "Approved").length,
        rejected: set.tasks.filter((t) => t.review === "Rejected").length,
        last: set.tasks[0]?.submittedOn ?? "—",
      }
    : { pending: 0, approved: 0, rejected: 0, last: "—" };
};

/* ---------------- Payroll ---------------- */

export interface PayrollRecord {
  employeeId: string;
  department: string;
  monthly: number;
  status: "Pending" | "Paid";
  attendance: string;
  leaveDeduction: number;
  advanceDeduction: number;
  bonus: number;
  history: { month: string; amount: number; status: string }[];
  payment?: { txId: string; date: string; time: string; method: string };
}

export const payroll: PayrollRecord[] = [
  {
    employeeId: "E-1042",
    department: "Operations",
    monthly: 62000,
    status: "Paid",
    attendance: "23 days · 97.2%",
    leaveDeduction: 0,
    advanceDeduction: 5000,
    bonus: 2000,
    history: [
      { month: "Sep", amount: 59000, status: "Paid" },
      { month: "Aug", amount: 62000, status: "Paid" },
      { month: "Jul", amount: 62000, status: "Paid" },
    ],
    payment: {
      txId: "PAY-837241",
      date: "22 Sep 2026",
      time: "11:42 AM",
      method: "Razorpay Payouts",
    },
  },
  {
    employeeId: "E-1078",
    department: "Finance",
    monthly: 58000,
    status: "Paid",
    attendance: "24 days · 98.6%",
    leaveDeduction: 0,
    advanceDeduction: 8500,
    bonus: 1500,
    history: [
      { month: "Sep", amount: 51000, status: "Paid" },
      { month: "Aug", amount: 58000, status: "Paid" },
      { month: "Jul", amount: 58000, status: "Paid" },
    ],
    payment: {
      txId: "PAY-837182",
      date: "21 Sep 2026",
      time: "10:05 AM",
      method: "Bank Transfer API",
    },
  },
  {
    employeeId: "E-1121",
    department: "Service",
    monthly: 46000,
    status: "Pending",
    attendance: "26 days · 100%",
    leaveDeduction: 0,
    advanceDeduction: 2000,
    bonus: 1000,
    history: [
      { month: "Aug", amount: 46000, status: "Paid" },
      { month: "Jul", amount: 46000, status: "Paid" },
    ],
  },
  {
    employeeId: "E-1150",
    department: "Client Success",
    monthly: 54000,
    status: "Pending",
    attendance: "21 days · 92.4%",
    leaveDeduction: 2400,
    advanceDeduction: 0,
    bonus: 1000,
    history: [
      { month: "Aug", amount: 54000, status: "Paid" },
      { month: "Jul", amount: 54000, status: "Paid" },
    ],
  },
];

export const payrollOf = (employeeId: string) =>
  payroll.find((p) => p.employeeId === employeeId) ?? payroll[0]!;

export const finalPayable = (p: PayrollRecord) =>
  p.monthly + p.bonus - p.leaveDeduction - p.advanceDeduction;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* ---------------- Employee monitor ---------------- */

export type EmployeeStatus = "Working" | "Active" | "On Leave";

export interface AssignedTask {
  id: number;
  title: string;
  client: string;
  due: string;
  checkIn: string;
  checkOut: string;
  status: "Pending" | "In Progress" | "Waiting Review" | "Approved" | "Rejected";
}

export interface TimelineDay {
  date: string;
  events: string[];
}

export interface EmployeeExtended {
  employee: (typeof employees)[number];
  status: EmployeeStatus;
  statusDetail: string;
  phone: string;
  email: string;
  aadhaarMasked: string;
  panMasked: string;
  bankMasked: string;
  ifsc: string;
  joinDate: string;
  agreementStart: string;
  agreementEnd: string;
  currentActiveTask: string;
  nextScheduledTask: string;
  lastCompletedTask: string;
  assignedTasks: AssignedTask[];
  attendance: {
    present: number[];
    absent: number[];
    late: number[];
    hours: number;
    checkInToday: string;
    checkOutToday: string;
  };
  payroll: {
    monthly: number;
    bonuses: number;
    deductions: number;
    advanceDeductions: number;
    final: number;
  };
  advances: { date: string; amount: number; status: string }[];
  leave: {
    balance: number;
    history: { date: string; reason: string; status: string }[];
    upcoming: string;
  };
  documents: { folder: string; items: string[] }[];
  performance: {
    completion: number;
    onTime: number;
    satisfaction: number;
    attendancePct: number;
    tasksTrend: number[];
    hoursTrend: number[];
  };
  timeline: TimelineDay[];
}

const track = (
  defaults: Omit<EmployeeExtended, "employee">,
  employee: (typeof employees)[number],
): EmployeeExtended => ({ ...defaults, employee });

export const extendedEmployees: EmployeeExtended[] = [
  track(
    {
      status: "Working",
      statusDetail: "On site — Aster Labs",
      phone: "+91 98420 11240",
      email: "arjun@echo.in",
      aadhaarMasked: "XXXX-XXXX-4231",
      panMasked: "XXXXX8631K",
      bankMasked: "XXXX-XXXX-4521",
      ifsc: "HDFC0001234",
      joinDate: "12 Mar 2021",
      agreementStart: "01 Apr 2026",
      agreementEnd: "31 Mar 2027",
      currentActiveTask: "#21 Aster Labs site inspection",
      nextScheduledTask: "#22 Nova Retail duct audit — 24 Sep",
      lastCompletedTask: "#19 Nova Retail duct audit · Rejected",
      assignedTasks: [
        {
          id: 22,
          title: "Nova Retail duct audit",
          client: clients[1] ?? "Nova Retail",
          due: "24 Sep 2026",
          checkIn: "—",
          checkOut: "—",
          status: "Pending",
        },
        {
          id: 21,
          title: "Aster Labs site inspection",
          client: clients[0] ?? "Aster Labs",
          due: "22 Sep 2026",
          checkIn: "09:04",
          checkOut: "12:30",
          status: "Waiting Review",
        },
        {
          id: 20,
          title: "Aster Labs maintenance round",
          client: clients[0] ?? "Aster Labs",
          due: "20 Sep 2026",
          checkIn: "10:12",
          checkOut: "13:45",
          status: "Approved",
        },
        {
          id: 19,
          title: "Nova Retail duct audit",
          client: clients[1] ?? "Nova Retail",
          due: "18 Sep 2026",
          checkIn: "14:20",
          checkOut: "17:05",
          status: "Rejected",
        },
      ],
      attendance: {
        present: Array.from({ length: 30 }, (_, i) => i + 1).filter(
          (d) => ![3, 12].includes(d) && ![6, 7, 13, 14, 20, 21, 27, 28].includes(d) && d <= 24,
        ),
        absent: [3, 12],
        late: [5, 19],
        hours: 182.4,
        checkInToday: "09:03 AM",
        checkOutToday: "—",
      },
      payroll: {
        monthly: 62000,
        bonuses: 2000,
        deductions: 0,
        advanceDeductions: 5000,
        final: 59000,
      },
      advances: [
        { date: "22 Sep 2026", amount: 5000, status: "Deducted" },
        { date: "02 Aug 2026", amount: 3000, status: "Pending" },
      ],
      leave: {
        balance: 6,
        history: [
          { date: "02 Aug 2026", reason: "Personal", status: "Approved" },
          { date: "14 Jun 2026", reason: "Sick leave", status: "Approved" },
        ],
        upcoming: "None scheduled",
      },
      documents: [
        { folder: "Aadhaar", items: ["Aadhaar_front.jpeg", "Aadhaar_back.jpeg"] },
        { folder: "PAN", items: ["PAN_card.pdf"] },
        { folder: "Bank Passbook", items: ["Passbook_page1.pdf"] },
        { folder: "Agreement", items: ["Agreement_2026.pdf"] },
        { folder: "Certificates", items: ["Safety_cert.pdf"] },
        { folder: "Employee ID", items: ["ECHO_ID_1042.png"] },
      ],
      performance: {
        completion: 96,
        onTime: 92,
        satisfaction: 4.9,
        attendancePct: 97.2,
        tasksTrend: [70, 76, 82, 89, 94, 96],
        hoursTrend: [7.3, 7.6, 7.2, 8.0, 8.2, 8.4],
      },
      timeline: [
        {
          date: "22 Sep 2026",
          events: [
            "Assigned Aster Labs site inspection.",
            "Uploaded before & after photos.",
            "Uploaded voice reply.",
            "Task #21 awaiting review.",
          ],
        },
        { date: "20 Sep 2026", events: ["Maintenance round submitted.", "Task #20 approved."] },
        {
          date: "18 Sep 2026",
          events: ["Duct audit rejected — missing after photos.", "Received ₹5,000 advance."],
        },
        { date: "01 Sep 2026", events: ["Salary for August paid."] },
      ],
    },
    employees[0]!,
  ),
  track(
    {
      status: "Active",
      statusDetail: "Working from office",
      phone: "+91 99880 22410",
      email: "maya@echo.in",
      aadhaarMasked: "XXXX-XXXX-8890",
      panMasked: "XXXXX1942A",
      bankMasked: "XXXX-XXXX-7833",
      ifsc: "ICIC0007731",
      joinDate: "08 Jun 2021",
      agreementStart: "01 Apr 2026",
      agreementEnd: "31 Mar 2027",
      currentActiveTask: "#18 Invoice reconciliation review",
      nextScheduledTask: "#19 Monthly closing — 25 Sep",
      lastCompletedTask: "#18 Invoice reconciliation review · Approved",
      assignedTasks: [
        {
          id: 18,
          title: "Invoice reconciliation review",
          client: clients[0] ?? "Aster Labs",
          due: "21 Sep 2026",
          checkIn: "09:02",
          checkOut: "18:31",
          status: "Approved",
        },
        {
          id: 17,
          title: "Bank statement verification",
          client: clients[1] ?? "Nova Retail",
          due: "22 Sep 2026",
          checkIn: "10:40",
          checkOut: "16:20",
          status: "Waiting Review",
        },
      ],
      attendance: {
        present: Array.from({ length: 30 }, (_, i) => i + 1).filter(
          (d) => ![4].includes(d) && ![6, 7, 13, 14, 20, 21, 27, 28].includes(d) && d <= 24,
        ),
        absent: [4],
        late: [8],
        hours: 191.2,
        checkInToday: "10:03 AM",
        checkOutToday: "—",
      },
      payroll: {
        monthly: 58000,
        bonuses: 1500,
        deductions: 0,
        advanceDeductions: 8500,
        final: 51000,
      },
      advances: [
        { date: "16 Sep 2026", amount: 8500, status: "Pending" },
        { date: "21 Jul 2026", amount: 4000, status: "Deducted" },
      ],
      leave: {
        balance: 8,
        history: [
          { date: "12 Aug 2026", reason: "Medical", status: "Approved" },
          { date: "27 Jun 2026", reason: "Personal", status: "Approved" },
        ],
        upcoming: "None scheduled",
      },
      documents: [
        { folder: "Aadhaar", items: ["Aadhaar_front.jpeg", "Aadhaar_back.jpeg"] },
        { folder: "PAN", items: ["PAN_card.pdf"] },
        { folder: "Bank Passbook", items: ["Passbook_1.pdf"] },
        { folder: "Agreement", items: ["Agreement_2026.pdf"] },
        { folder: "Certificates", items: ["CA_intermediate.pdf"] },
        { folder: "Employee ID", items: ["ECHO_ID_1078.png"] },
      ],
      performance: {
        completion: 94,
        onTime: 95,
        satisfaction: 4.8,
        attendancePct: 98.6,
        tasksTrend: [72, 78, 80, 87, 91, 94],
        hoursTrend: [7.8, 7.9, 7.6, 8.1, 8.3, 8.6],
      },
      timeline: [
        {
          date: "22 Sep 2026",
          events: ["Bank statement verification submitted.", "Task #17 awaiting review."],
        },
        {
          date: "21 Sep 2026",
          events: ["Invoice reconciliation approved.", "Salary for September paid."],
        },
        { date: "16 Sep 2026", events: ["Received ₹8,500 advance."] },
      ],
    },
    employees[1]!,
  ),
  track(
    {
      status: "Working",
      statusDetail: "On site — Arc Systems",
      phone: "+91 90010 58231",
      email: "dev@echo.in",
      aadhaarMasked: "XXXX-XXXX-7712",
      panMasked: "XXXXX6620D",
      bankMasked: "XXXX-XXXX-1109",
      ifsc: "SBIN0004310",
      joinDate: "03 Nov 2022",
      agreementStart: "01 Apr 2026",
      agreementEnd: "31 Mar 2027",
      currentActiveTask: "#16 AC service — Arc Systems",
      nextScheduledTask: "#17 Compressor audit — 25 Sep",
      lastCompletedTask: "#15 Plumbing — Meridian House · Approved",
      assignedTasks: [
        {
          id: 17,
          title: "Compressor audit",
          client: clients[3] ?? "Arc Systems",
          due: "25 Sep 2026",
          checkIn: "—",
          checkOut: "—",
          status: "Pending",
        },
        {
          id: 16,
          title: "AC service — Arc Systems",
          client: clients[3] ?? "Arc Systems",
          due: "22 Sep 2026",
          checkIn: "08:55",
          checkOut: "12:10",
          status: "Waiting Review",
        },
        {
          id: 15,
          title: "Plumbing — Meridian House",
          client: clients[2] ?? "Meridian House",
          due: "19 Sep 2026",
          checkIn: "09:30",
          checkOut: "13:15",
          status: "Approved",
        },
        {
          id: 14,
          title: "Equipment install — Aster Labs",
          client: clients[0] ?? "Aster Labs",
          due: "17 Sep 2026",
          checkIn: "11:05",
          checkOut: "16:40",
          status: "Approved",
        },
      ],
      attendance: {
        present: Array.from({ length: 30 }, (_, i) => i + 1).filter(
          (d) => ![6, 7, 13, 14, 20, 21, 27, 28].includes(d) && d <= 24,
        ),
        absent: [],
        late: [11],
        hours: 208.0,
        checkInToday: "08:51 AM",
        checkOutToday: "—",
      },
      payroll: {
        monthly: 46000,
        bonuses: 1000,
        deductions: 0,
        advanceDeductions: 2000,
        final: 45000,
      },
      advances: [
        { date: "12 Sep 2026", amount: 5000, status: "Pending" },
        { date: "18 Jun 2026", amount: 2000, status: "Deducted" },
      ],
      leave: {
        balance: 4,
        history: [{ date: "07 Aug 2026", reason: "Family function", status: "Approved" }],
        upcoming: "None scheduled",
      },
      documents: [
        { folder: "Aadhaar", items: ["Aadhaar_front.jpeg"] },
        { folder: "PAN", items: ["PAN_card.pdf"] },
        { folder: "Bank Passbook", items: ["Passbook_1.pdf"] },
        { folder: "Agreement", items: ["Agreement_2026.pdf"] },
        { folder: "Certificates", items: ["HVAC_cert.pdf", "Service_licence.pdf"] },
        { folder: "Employee ID", items: ["ECHO_ID_1121.png"] },
      ],
      performance: {
        completion: 99,
        onTime: 97,
        satisfaction: 4.7,
        attendancePct: 100,
        tasksTrend: [78, 82, 85, 91, 95, 99],
        hoursTrend: [8.1, 8.3, 8.0, 8.4, 8.5, 8.7],
      },
      timeline: [
        {
          date: "22 Sep 2026",
          events: [
            "AC service submitted at Arc Systems.",
            "Uploaded service video and sign-off.",
            "Task #16 awaiting review.",
          ],
        },
        { date: "19 Sep 2026", events: ["Plumbing job approved."] },
        { date: "12 Sep 2026", events: ["Received ₹5,000 advance."] },
      ],
    },
    employees[2]!,
  ),
  track(
    {
      status: "On Leave",
      statusDetail: "Approved leave · Half day",
      phone: "+91 91230 77401",
      email: "sara@echo.in",
      aadhaarMasked: "XXXX-XXXX-2043",
      panMasked: "XXXXX1187F",
      bankMasked: "XXXX-XXXX-3305",
      ifsc: "AXIS0001182",
      joinDate: "05 Jan 2024",
      agreementStart: "01 Apr 2026",
      agreementEnd: "31 Mar 2027",
      currentActiveTask: "#13 Nova Retail renewal meeting",
      nextScheduledTask: "#14 Meridian House review — 24 Sep",
      lastCompletedTask: "#13 Nova Retail renewal meeting · Approved",
      assignedTasks: [
        {
          id: 14,
          title: "Meridian House review",
          client: clients[2] ?? "Meridian House",
          due: "24 Sep 2026",
          checkIn: "—",
          checkOut: "—",
          status: "Pending",
        },
        {
          id: 13,
          title: "Nova Retail renewal meeting",
          client: clients[1] ?? "Nova Retail",
          due: "21 Sep 2026",
          checkIn: "15:00",
          checkOut: "17:30",
          status: "Approved",
        },
        {
          id: 12,
          title: "Meridian House onboarding docs",
          client: clients[2] ?? "Meridian House",
          due: "22 Sep 2026",
          checkIn: "09:15",
          checkOut: "13:25",
          status: "Waiting Review",
        },
      ],
      attendance: {
        present: Array.from({ length: 30 }, (_, i) => i + 1).filter(
          (d) => ![2, 9].includes(d) && ![6, 7, 13, 14, 20, 21, 27, 28].includes(d) && d <= 22,
        ),
        absent: [2, 9],
        late: [16],
        hours: 156.8,
        checkInToday: "—",
        checkOutToday: "—",
      },
      payroll: {
        monthly: 54000,
        bonuses: 1000,
        deductions: 2400,
        advanceDeductions: 0,
        final: 52600,
      },
      advances: [{ date: "28 Aug 2026", amount: 3000, status: "Pending" }],
      leave: {
        balance: 5,
        history: [
          { date: "22 Sep 2026", reason: "Half day — personal", status: "Approved" },
          { date: "02 Aug 2026", reason: "Medical", status: "Approved" },
        ],
        upcoming: "24 Sep 2026 — Medical appointment",
      },
      documents: [
        { folder: "Aadhaar", items: ["Aadhaar_front.jpeg", "Aadhaar_back.jpeg"] },
        { folder: "PAN", items: ["PAN_card.pdf"] },
        { folder: "Bank Passbook", items: ["Passbook_1.pdf"] },
        { folder: "Agreement", items: ["Agreement_2026.pdf"] },
        { folder: "Certificates", items: ["Client_success_cert.pdf"] },
        { folder: "Employee ID", items: ["ECHO_ID_1150.png"] },
      ],
      performance: {
        completion: 90,
        onTime: 93,
        satisfaction: 4.9,
        attendancePct: 92.4,
        tasksTrend: [66, 74, 79, 84, 88, 90],
        hoursTrend: [7.0, 7.2, 7.1, 7.5, 7.6, 7.8],
      },
      timeline: [
        { date: "22 Sep 2026", events: ["Onboarding docs submitted.", "Approved half-day leave."] },
        { date: "21 Sep 2026", events: ["Renewal meeting approved."] },
        { date: "01 Sep 2026", events: ["Salary for August paid."] },
      ],
    },
    employees[3]!,
  ),
];

export const extendedOf = (employeeId: string) =>
  extendedEmployees.find((e) => e.employee.id === employeeId) ?? extendedEmployees[0]!;

/* Phone numbers for the mock call buttons. */
export const employeePhoneOf = (employeeId: string) =>
  extendedEmployees.find((e) => e.employee.id === employeeId)?.phone;

export const employeeByName = (name: string) => employees.find((e) => e.name === name);

export const submissionsOf = (employeeId: string) => {
  const ids = new Set(
    submissionReviews.find((s) => s.employeeId === employeeId)?.tasks.map((t) => t.id) ?? [],
  );
  return extendedOf(employeeId).assignedTasks.filter((t) => ids.has(t.id));
};
