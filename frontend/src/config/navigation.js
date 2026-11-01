import {
  FiActivity,
  FiBell,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiCpu,
  FiDatabase,
  FiGitBranch,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiInfo,
  FiLayers,
  FiPackage,
  FiPlayCircle,
  FiPlusCircle,
  FiSearch,
  FiSmartphone,
  FiSettings,
  FiShield,
  FiTool,
  FiUsers,
} from "react-icons/fi";
import { ALL_ROLES, ROLES, canAccess } from "./access";

const { ADMIN, DOCTOR, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, HEALTH_WORKER } = ROLES;

export const appNavigation = [
  {
    labelKey: "navigation.patientCare",
    icon: FiUsers,
    children: [
      { labelKey: "navigation.patients", to: "/patients", icon: FiUsers, allowedRoles: ALL_ROLES },
      { labelKey: "navigation.registerPatient", to: "/patients/register", icon: FiPlusCircle, allowedRoles: [ADMIN, RECEPTIONIST, HEALTH_WORKER] },
      { labelKey: "navigation.visitHistory", to: "/patients/visits", icon: FiClipboard, allowedRoles: [ADMIN, DOCTOR, RECEPTIONIST, HEALTH_WORKER] },
      { labelKey: "navigation.appointments", to: "/appointments", icon: FiCalendar, allowedRoles: [ADMIN, DOCTOR, RECEPTIONIST, HEALTH_WORKER] },
      { labelKey: "navigation.queue", to: "/appointments/queue", icon: FiClipboard, allowedRoles: [ADMIN, DOCTOR, RECEPTIONIST] },
      { labelKey: "navigation.publicQueue", to: "/appointments/waiting", icon: FiUsers, allowedRoles: [ADMIN, DOCTOR, RECEPTIONIST] },
      { labelKey: "navigation.consultation", to: "/doctors", icon: FiClipboard, allowedRoles: [ADMIN, DOCTOR] },
    ],
  },
  {
    labelKey: "navigation.clinicalServices",
    icon: FiPackage,
    children: [
      { labelKey: "navigation.pharmacy", to: "/pharmacy", icon: FiPackage, allowedRoles: [ADMIN, PHARMACIST] },
      { labelKey: "navigation.laboratory", to: "/laboratory", icon: FiTool, allowedRoles: [ADMIN, LAB_TECHNICIAN] },
      { labelKey: "navigation.vaccination", to: "/vaccination", icon: FiShield, allowedRoles: [ADMIN, HEALTH_WORKER] },
    ],
  },
  {
    labelKey: "navigation.insights",
    icon: FiActivity,
    children: [
      { labelKey: "navigation.reports", to: "/reports", icon: FiFileText, allowedRoles: ALL_ROLES },
      { labelKey: "navigation.analytics", to: "/analytics", icon: FiActivity, allowedRoles: [ADMIN] },
      { labelKey: "navigation.villageHealth", to: "/outreach", icon: FiShield, allowedRoles: [ADMIN, HEALTH_WORKER] },
    ],
  },
  {
    labelKey: "navigation.operations",
    icon: FiHome,
    children: [
      { labelKey: "navigation.todayAtPhc", to: "/operations", icon: FiHome, allowedRoles: [ADMIN, RECEPTIONIST, HEALTH_WORKER] },
      { labelKey: "navigation.households", to: "/operations/households", icon: FiLayers, allowedRoles: [ADMIN, HEALTH_WORKER] },
      { labelKey: "navigation.followUpBoard", to: "/operations/follow-ups", icon: FiCheckSquare, allowedRoles: [ADMIN, DOCTOR, HEALTH_WORKER] },
      { labelKey: "navigation.shiftHandovers", to: "/operations/handovers", icon: FiClipboard, allowedRoles: [ADMIN, DOCTOR, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, HEALTH_WORKER] },
      { labelKey: "navigation.alertCenter", to: "/operations/alerts", icon: FiBell, allowedRoles: [ADMIN, DOCTOR, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, HEALTH_WORKER] },
      { labelKey: "navigation.verification", to: "/operations/verification", icon: FiSearch, allowedRoles: [ADMIN, RECEPTIONIST, HEALTH_WORKER] },
    ],
  },
  {
    labelKey: "navigation.administration",
    icon: FiSettings,
    children: [
      { labelKey: "navigation.staffRoles", to: "/doctors", icon: FiUsers, allowedRoles: [ADMIN] },
      { labelKey: "common.notifications", to: "/notifications", icon: FiBell, allowedRoles: ALL_ROLES },
      { labelKey: "common.settings", to: "/settings", icon: FiSettings, allowedRoles: [ADMIN] },
      { labelKey: "navigation.auditLogs", to: "/platform", icon: FiDatabase, allowedRoles: [ADMIN] },
    ],
  },
  {
    labelKey: "navigation.support",
    icon: FiHelpCircle,
    children: [
      { labelKey: "common.helpCenter", to: "/help", icon: FiHelpCircle, allowedRoles: ALL_ROLES },
      { labelKey: "navigation.aboutProject", to: "/about-project", icon: FiInfo, allowedRoles: ALL_ROLES },
    ],
  },
];

export const quickActionLinks = [
  { labelKey: "navigation.todayAtPhc", to: "/operations", icon: FiHome, allowedRoles: [ADMIN, RECEPTIONIST, HEALTH_WORKER] },
  { labelKey: "navigation.registerPatient", to: "/patients/register", icon: FiPlusCircle, allowedRoles: [ADMIN, RECEPTIONIST, HEALTH_WORKER] },
  { labelKey: "navigation.bookAppointment", to: "/appointments", icon: FiCalendar, allowedRoles: [ADMIN, DOCTOR, RECEPTIONIST, HEALTH_WORKER] },
  { labelKey: "navigation.generateToken", to: "/appointments/queue", icon: FiClipboard, allowedRoles: [ADMIN, DOCTOR, RECEPTIONIST] },
  { labelKey: "navigation.openQueue", to: "/appointments/waiting", icon: FiUsers, allowedRoles: [ADMIN, DOCTOR, RECEPTIONIST] },
  { labelKey: "navigation.openPharmacy", to: "/pharmacy", icon: FiPackage, allowedRoles: [ADMIN, PHARMACIST] },
  { labelKey: "navigation.uploadLabReport", to: "/laboratory", icon: FiTool, allowedRoles: [ADMIN, LAB_TECHNICIAN] },
  { labelKey: "navigation.analytics", to: "/analytics", icon: FiActivity, allowedRoles: [ADMIN] },
  { labelKey: "navigation.presentation", to: "/presentation", icon: FiPlayCircle, allowedRoles: [ADMIN] },
  { labelKey: "navigation.aboutProject", to: "/about-project", icon: FiInfo, allowedRoles: ALL_ROLES },
  { labelKey: "navigation.platform", to: "/platform", icon: FiDatabase, allowedRoles: [ADMIN] },
  { labelKey: "navigation.referrals", to: "/referrals", icon: FiGitBranch, allowedRoles: [ADMIN, DOCTOR, HEALTH_WORKER] },
  { labelKey: "navigation.aiGovernance", to: "/ai-governance", icon: FiCpu, allowedRoles: [ADMIN] },
  { labelKey: "navigation.devices", to: "/devices", icon: FiSmartphone, allowedRoles: [ADMIN] },
  { labelKey: "navigation.outreach", to: "/outreach", icon: FiShield, allowedRoles: [ADMIN, HEALTH_WORKER] },
  { labelKey: "navigation.verification", to: "/operations/verification", icon: FiSearch, allowedRoles: [ADMIN, RECEPTIONIST, HEALTH_WORKER] },
  { labelKey: "navigation.reports", to: "/reports", icon: FiFileText, allowedRoles: ALL_ROLES },
  { labelKey: "common.settings", to: "/settings", icon: FiSettings, allowedRoles: [ADMIN] },
];

export function filterNavigationForRole(items = appNavigation, role) {
  return items
    .map((item) => {
      const children = item.children?.filter((child) => canAccess(child.allowedRoles, role));
      return children?.length ? { ...item, children } : null;
    })
    .filter(Boolean);
}

export function flattenNavigation(items = appNavigation, role) {
  return filterNavigationForRole(items, role).flatMap((item) => item.children || []);
}
