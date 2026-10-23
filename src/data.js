import {
  BookOpen,
  Briefcase,
  FolderKanban,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";

const dayMs = 86400000;
export const isoDaysAgo = (n) => new Date(Date.now() - n * dayMs).toISOString().slice(0, 10);

export const brand = { name: "Thinkfotech" };

export const currentUser = {
  id: "u1",
  name: "Noah Castell",
  email: "noah@thinkfotech.app",
  initials: "NC",
};

/* ---------- navigation (`to` is the URL for each page) ---------- */
export const menuNav = [
  { id: "dashboard", to: "/dashboard", label: "Dashboard", icon: LayoutGrid, placeholder: "Search projects, users or groups" },
  { id: "users", to: "/users", label: "Users", icon: Users, placeholder: "Search users by name, email or phone" },
  { id: "groups", to: "/groups", label: "Groups", icon: UsersRound, placeholder: "Search groups" },
  { id: "projects", to: "/projects", label: "Projects", icon: FolderKanban, placeholder: "Search projects" },
  { id: "materials", to: "/materials", label: "Study Materials", icon: BookOpen, placeholder: "Search study materials" },
];

export const generalNav = [
  { id: "employees", to: "/employees", label: "Employees", icon: Briefcase },
  { id: "help", to: "/help", label: "Help", icon: LifeBuoy },
  { label: "Logout", icon: LogOut },
];

export const appPromo = {
  title: "Thinkfotech for iOS & Android",
  text: "Your board, in your pocket",
  cta: "Download",
};

/* ---------- option lists used by forms and filters ---------- */
export const roles = ["Admin", "Manager", "Member", "Viewer"];
export const userStatuses = ["Active", "Invited", "Suspended"];
export const projectStatuses = ["Running", "Pending", "Ended"];
export const projectCategories = ["IoT", "Software"];
export const projectLevels = ["School", "College"];
export const departments = ["Engineering", "Design", "Product", "People", "Sales"];
export const employeeStatuses = ["Active", "On leave"];
export const materialTypes = ["PDF", "Doc", "Video", "Slides", "Link"];

/* ---------- seed data ---------- */
// registeredAt is relative to today so the weekly chart always has data
const mk = (id, name, role, status, phone, address, days) => ({
  id, name, role, status, phone, address, image: "",
  email: `${name.split(" ")[0].toLowerCase()}@thinkfotech.app`,
  registeredAt: isoDaysAgo(days),
});

export const users = [
  mk("u1", "Noah Castell", "Admin", "Active", "+91 98470 11201", "Vazhuthacaud, Thiruvananthapuram", 52),
  mk("u2", "Priya Nair", "Manager", "Active", "+91 98950 22418", "Kowdiar, Thiruvananthapuram", 45),
  mk("u3", "Arjun Menon", "Member", "Active", "+91 94470 33582", "Pattom, Thiruvananthapuram", 38),
  mk("u4", "Meera Krishnan", "Member", "Invited", "+91 97460 44190", "Kazhakkoottam, Thiruvananthapuram", 2),
  mk("u5", "Rahul Varma", "Member", "Active", "+91 99610 55073", "Nedumangad, Thiruvananthapuram", 30),
  mk("u6", "Sana Iqbal", "Viewer", "Suspended", "+91 98460 66821", "Attingal, Thiruvananthapuram", 24),
  mk("u7", "Daniel Joseph", "Manager", "Active", "+91 94960 77345", "Technopark, Thiruvananthapuram", 22),
  mk("u8", "Anjali Pillai", "Member", "Active", "+91 98470 88026", "Sreekariyam, Thiruvananthapuram", 17),
  mk("u9", "Kiran Das", "Member", "Active", "+91 95390 99112", "Neyyattinkara, Thiruvananthapuram", 15),
  mk("u10", "Fathima Noor", "Member", "Active", "+91 98950 10437", "Varkala, Thiruvananthapuram", 12),
  mk("u11", "Joel Mathew", "Member", "Active", "+91 94470 21658", "Peroorkada, Thiruvananthapuram", 9),
  mk("u12", "Ishaan Rao", "Viewer", "Active", "+91 97780 32094", "Vellayambalam, Thiruvananthapuram", 8),
  mk("u13", "Teena George", "Member", "Active", "+91 98460 43571", "Thampanoor, Thiruvananthapuram", 36),
  mk("u14", "Varun Nair", "Member", "Active", "+91 99950 54286", "Pothencode, Thiruvananthapuram", 5),
];

export const groups = [
  { id: "g1", name: "IoT Lab", description: "Builds sensor kits and embedded projects for colleges.", memberIds: ["u1", "u2", "u3", "u5", "u11"] },
  { id: "g2", name: "Software Studio", description: "Web and mobile projects for schools and colleges.", memberIds: ["u2", "u7", "u8", "u9"] },
  { id: "g3", name: "Training Team", description: "Runs workshops and mentoring sessions on campus.", memberIds: ["u7", "u10", "u13"] },
  { id: "g4", name: "Campus Delivery", description: "Handles handover, demos and final-year submissions.", memberIds: ["u1", "u12", "u14", "u4"] },
];

export const projects = [
  { id: "p1", name: "Smart Attendance System", client: "Govt. Engineering College", category: "IoT", level: "College", due: isoDaysAgo(9), status: "Ended", progress: 100, groupId: "g4" },
  { id: "p2", name: "Weather Station Kit", client: "Holy Cross School", category: "IoT", level: "School", due: isoDaysAgo(-5), status: "Running", progress: 72, groupId: "g1" },
  { id: "p3", name: "Library Management Portal", client: "Mar Ivanios College", category: "Software", level: "College", due: isoDaysAgo(-9), status: "Running", progress: 55, groupId: "g2" },
  { id: "p4", name: "Smart Irrigation Monitor", client: "College of Engineering", category: "IoT", level: "College", due: isoDaysAgo(-14), status: "Running", progress: 38, groupId: "g1" },
  { id: "p5", name: "School ERP Dashboard", client: "St. Thomas School", category: "Software", level: "School", due: isoDaysAgo(-20), status: "Running", progress: 64, groupId: "g2" },
  { id: "p6", name: "Line-Follower Robot Workshop", client: "Navodaya Vidyalaya", category: "IoT", level: "School", due: isoDaysAgo(-26), status: "Pending", progress: 0, groupId: "g3" },
  { id: "p7", name: "Online Exam Platform", client: "University College", category: "Software", level: "College", due: isoDaysAgo(-40), status: "Pending", progress: 5, groupId: null },
  { id: "p8", name: "Student Result Portal", client: "Little Flower School", category: "Software", level: "School", due: isoDaysAgo(25), status: "Ended", progress: 100, groupId: "g2" },
  { id: "p9", name: "RFID Lab Access Control", client: "CET Electronics Dept.", category: "IoT", level: "College", due: isoDaysAgo(-12), status: "Running", progress: 82, groupId: "g1" },
  { id: "p10", name: "Smart Energy Meter", client: "Sree Chitra College", category: "IoT", level: "College", due: isoDaysAgo(-33), status: "Running", progress: 47, groupId: "g4" },
];

export const employees = [
  { id: "e1", name: "Kavya Suresh", title: "Frontend Engineer", department: "Engineering", email: "kavya@thinkfotech.app", status: "Active", joined: "2023-03-14" },
  { id: "e2", name: "Vishnu Prasad", title: "Embedded Engineer", department: "Engineering", email: "vishnu@thinkfotech.app", status: "Active", joined: "2022-08-01" },
  { id: "e3", name: "Lakshmi Das", title: "Product Designer", department: "Design", email: "lakshmi@thinkfotech.app", status: "Active", joined: "2024-01-22" },
  { id: "e4", name: "Hari Narayan", title: "IoT Hardware Lead", department: "Engineering", email: "hari@thinkfotech.app", status: "Active", joined: "2021-11-09" },
  { id: "e5", name: "Neha Thomas", title: "Product Manager", department: "Product", email: "neha@thinkfotech.app", status: "Active", joined: "2023-06-05" },
  { id: "e6", name: "Farhan Ali", title: "Institution Relations", department: "Sales", email: "farhan@thinkfotech.app", status: "On leave", joined: "2022-02-18" },
  { id: "e7", name: "Sreya Menon", title: "HR Partner", department: "People", email: "sreya@thinkfotech.app", status: "Active", joined: "2024-04-02" },
  { id: "e8", name: "Jishnu Raj", title: "UX Researcher", department: "Design", email: "jishnu@thinkfotech.app", status: "Active", joined: "2025-01-13" },
];

export const materials = [
  { id: "m1", title: "Arduino basics workbook", type: "PDF", category: "IoT", groupId: "g1", detail: "3.2 MB", added: isoDaysAgo(12), url: "#" },
  { id: "m2", title: "ESP32 sensor wiring guide", type: "Doc", category: "IoT", groupId: "g1", detail: "14 pages", added: isoDaysAgo(10), url: "#" },
  { id: "m3", title: "MQTT in 20 minutes", type: "Video", category: "IoT", groupId: "g1", detail: "20 min", added: isoDaysAgo(6), url: "#" },
  { id: "m4", title: "React for beginners", type: "Video", category: "Software", groupId: "g2", detail: "42 min", added: isoDaysAgo(8), url: "#" },
  { id: "m5", title: "Project report template", type: "Doc", category: "Project reports", groupId: null, detail: "8 pages", added: isoDaysAgo(20), url: "#" },
  { id: "m6", title: "Viva preparation checklist", type: "PDF", category: "Project reports", groupId: null, detail: "1.1 MB", added: isoDaysAgo(18), url: "#" },
  { id: "m7", title: "Raspberry Pi classroom setup", type: "Slides", category: "IoT", groupId: "g3", detail: "28 slides", added: isoDaysAgo(3), url: "#" },
  { id: "m8", title: "Git and GitHub for students", type: "Link", category: "Software", groupId: "g2", detail: "External", added: isoDaysAgo(15), url: "#" },
];

/* ---------- dashboard-only content ---------- */
export const pageHeader = {
  title: "Dashboard",
  subtitle: "Your school and college IoT and software projects, in one place.",
};
