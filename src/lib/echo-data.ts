import {
  Activity,
  BadgeIndianRupee,
  BarChart3,
  Building2,
  CircleUserRound,
  ClipboardList,
  FileText,
  Folder,
  HelpCircle,
  Home,
  MessageSquare,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";

export const employees = [
  {
    id: "E-1042",
    name: "Arjun Mehta",
    department: "Operations",
    role: "Field Manager",
    salary: "₹62,000",
    rating: 4.9,
    years: 5,
    leave: 4,
  },
  {
    id: "E-1078",
    name: "Maya Iyer",
    department: "Finance",
    role: "Accounts Lead",
    salary: "₹58,000",
    rating: 4.8,
    years: 4,
    leave: 6,
  },
  {
    id: "E-1121",
    name: "Dev Kumar",
    department: "Service",
    role: "Service Engineer",
    salary: "₹46,000",
    rating: 4.7,
    years: 3,
    leave: 2,
  },
  {
    id: "E-1150",
    name: "Sara Khan",
    department: "Client Success",
    role: "Account Manager",
    salary: "₹54,000",
    rating: 4.9,
    years: 2,
    leave: 3,
  },
];
export const clients = ["Aster Labs", "Nova Retail", "Meridian House", "Arc Systems"];
export const initialTasks = [
  { id: 1, title: "Visit Aster Labs for site inspection", done: false },
  { id: 2, title: "Prepare Nova Retail invoice", done: false },
  { id: 3, title: "Review weekly attendance", done: false },
  { id: 4, title: "Approve equipment purchase", done: true },
];
export const advances = [
  {
    employee: "Arjun Mehta",
    id: "E-1042",
    amount: "₹12,000",
    date: "18 Sep 2026",
    time: "10:42 AM",
  },
  { employee: "Maya Iyer", id: "E-1078", amount: "₹8,500", date: "16 Sep 2026", time: "2:18 PM" },
  { employee: "Dev Kumar", id: "E-1121", amount: "₹5,000", date: "12 Sep 2026", time: "9:05 AM" },
];
export const bills = [
  { id: "INV-2048", client: "Aster Labs", amount: "₹84,200", type: "Invoice", status: "Paid" },
  {
    id: "QUO-1083",
    client: "Nova Retail",
    amount: "₹32,000",
    type: "Quotation",
    status: "Pending",
  },
  { id: "BIL-0921", client: "Arc Systems", amount: "₹18,450", type: "Bill", status: "Draft" },
];
export const navItems = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Personal Vault", to: "/vault", icon: Folder },
  { label: "Bill Book", to: "/bill-book", icon: FileText },
  { label: "Group Chats", to: "/chats", icon: MessageSquare },
  { label: "Profile Settings", to: "/settings", icon: Settings },
  { label: "Help", to: "/help", icon: HelpCircle },
] as const;
export const quickActions = [
  {
    title: "Create New Task",
    detail: "Assign and schedule work",
    to: "/tasks/new",
    icon: ClipboardList,
  },
  {
    title: "Create New Employee",
    detail: "Add a team member",
    to: "/employees/new",
    icon: UserPlus,
  },
  {
    title: "Create New Client",
    detail: "Open a client workspace",
    to: "/clients/new",
    icon: Building2,
  },
  {
    title: "Create New Activity",
    detail: "Log a service request",
    to: "/activities/new",
    icon: Activity,
  },
  {
    title: "Create New Advance",
    detail: "Manage salary advances",
    to: "/advances",
    icon: BadgeIndianRupee,
  },
  { title: "Overall Data", detail: "View company performance", to: "/analytics", icon: BarChart3 },
] as const;
export const searchRecords = [
  ...employees.map((x) => ({
    type: "Employee",
    label: x.name,
    detail: `${x.id} · ${x.role}`,
    to: `/employees/${x.id}`,
  })),
  ...clients.map((x) => ({
    type: "Client",
    label: x,
    detail: "Client workspace",
    to: "/clients/new",
  })),
  ...initialTasks.map((x) => ({
    type: "Task",
    label: x.title,
    detail: x.done ? "Completed" : "Pending",
    to: "/dashboard",
  })),
  ...advances.map((x) => ({
    type: "Advance",
    label: x.employee,
    detail: x.amount,
    to: "/advances",
  })),
  ...bills.map((x) => ({
    type: "Bill",
    label: x.id,
    detail: `${x.client} · ${x.amount}`,
    to: "/bill-book",
  })),
  { type: "Vault", label: "FY26 Contracts", detail: "Folder · 12 files", to: "/vault" },
  {
    type: "Activity",
    label: "AC maintenance complaint",
    detail: "Aster Labs",
    to: "/activities/new",
  },
];
export const metrics = [
  ["Total Employees", "128", "+6 this month"],
  ["Active Employees", "119", "93% of workforce"],
  ["Clients", "42", "+4 this quarter"],
  ["Open Tasks", "37", "8 due today"],
  ["Completed Tasks", "1,284", "+12.4%"],
  ["Activities Today", "18", "5 in progress"],
  ["Total Advances", "₹2.84L", "18 employees"],
  ["Monthly Revenue", "₹18.6L", "+8.7%"],
  ["Attendance Rate", "96.4%", "+1.2%"],
  ["Leave Requests", "7", "3 awaiting review"],
];
export { CircleUserRound, Users };
