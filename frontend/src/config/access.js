export const ROLES = Object.freeze({
  ADMIN: "admin",
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  PHARMACIST: "pharmacist",
  LAB_TECHNICIAN: "lab_technician",
  HEALTH_WORKER: "health_worker",
});

export const ALL_ROLES = Object.freeze(Object.values(ROLES));

export function canAccess(allowedRoles, role) {
  return !allowedRoles?.length || allowedRoles.includes(role);
}
