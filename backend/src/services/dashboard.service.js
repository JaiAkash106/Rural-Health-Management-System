import { patientRepository } from "../repositories/patient.repository.js";
import { auditLogRepository } from "../repositories/audit-log.repository.js";
import { visitRepository } from "../repositories/visit.repository.js";
import { Appointment } from "../models/appointment.model.js";
import { QueueEntry } from "../models/queue-entry.model.js";
import { DoctorSchedule } from "../models/doctor-schedule.model.js";
import { Prescription } from "../models/prescription.model.js";
import { MedicineBatch } from "../models/medicine-batch.model.js";
import { LabRequest } from "../models/lab-request.model.js";
import { LabResult } from "../models/lab-result.model.js";
import { User } from "../models/user.model.js";
import { VaccinationRecord } from "../models/vaccination-record.model.js";
import { VaccineBatch } from "../models/vaccine-batch.model.js";
import { notificationRepository } from "../repositories/notification.repository.js";

function buildDayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function formatMinutes(value) {
  return `${Math.max(0, Math.round(value))} min`;
}

export const dashboardService = {
  async getSummary(actor) {
    const { start: todayStart, end: tomorrow } = buildDayRange();

    const [
      totalPatients,
      todaysPatients,
      recentRegistrations,
      recentActivities,
      todaysVisits,
      todaysAppointments,
      waitingPatients,
      currentConsultations,
      completedConsultations,
      missedAppointments,
      emergencyCases,
      doctorAvailabilityCount,
      pendingPrescriptions,
      criticalLabResults,
      todaysVaccinations,
      lowMedicineBatches,
      lowVaccineBatches,
      doctorSchedules,
      notificationResult,
      activeQueueEntries,
      queuePerformance,
    ] = await Promise.all([
      patientRepository.countAll(),
      patientRepository.countToday(),
      patientRepository.recentRegistrations(4),
      auditLogRepository.recentVisibleTo(actor, 5),
      visitRepository.countToday(),
      Appointment.countDocuments({ appointmentDate: { $gte: todayStart, $lt: tomorrow }, isArchived: false }),
      QueueEntry.countDocuments({ queueDate: { $gte: todayStart, $lt: tomorrow }, status: { $in: ["waiting", "called", "skipped"] } }),
      QueueEntry.countDocuments({ queueDate: { $gte: todayStart, $lt: tomorrow }, status: "in_consultation" }),
      QueueEntry.countDocuments({ queueDate: { $gte: todayStart, $lt: tomorrow }, status: "completed" }),
      Appointment.countDocuments({ appointmentDate: { $gte: todayStart, $lt: tomorrow }, status: "missed", isArchived: false }),
      QueueEntry.countDocuments({ queueDate: { $gte: todayStart, $lt: tomorrow }, priority: "emergency", status: { $nin: ["cancelled", "completed", "no_show"] } }),
      DoctorSchedule.countDocuments({ activeStatus: true }),
      Prescription.countDocuments({ status: { $in: ["created", "pending_pharmacy", "partially_dispensed"] } }),
      LabResult.countDocuments({ criticalFlag: true, updatedAt: { $gte: todayStart, $lt: tomorrow } }),
      VaccinationRecord.countDocuments({ administeredDate: { $gte: todayStart, $lt: tomorrow } }),
      MedicineBatch.countDocuments({ status: "low_stock" }),
      VaccineBatch.countDocuments({ status: "low_stock" }),
      DoctorSchedule.find({ activeStatus: true })
        .populate({ path: "doctorRef", match: { role: "doctor", isActive: true }, select: "fullName email" })
        .sort({ updatedAt: -1 })
        .limit(4)
        .lean(),
      notificationRepository.listForUser(actor, { limit: 4 }),
      QueueEntry.find({
        queueDate: { $gte: todayStart, $lt: tomorrow },
        status: { $in: ["waiting", "called", "in_consultation", "skipped"] },
      })
        .sort({ position: 1, checkedInAt: 1 })
        .limit(5)
        .lean(),
      QueueEntry.aggregate([
        {
          $match: {
            queueDate: { $gte: todayStart, $lt: tomorrow },
            status: "completed",
            checkedInAt: { $ne: null },
            completedAt: { $ne: null },
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$department", "Unassigned"] },
            averageMinutes: { $avg: { $divide: [{ $subtract: ["$completedAt", "$checkedInAt"] }, 60000] } },
            throughput: { $sum: 1 },
          },
        },
        { $sort: { throughput: -1, _id: 1 } },
        { $limit: 5 },
      ]),
    ]);

    return {
      metrics: [
        { label: "Total Patients", value: String(totalPatients), detail: "All active records", accent: "linear-gradient(135deg, #2E7D32 0%, #6bd388 100%)" },
        { label: "Today's Appointments", value: String(todaysAppointments), detail: `${todaysPatients} new registrations today`, accent: "linear-gradient(135deg, #00879a 0%, #6bd8e2 100%)" },
        { label: "Waiting Patients", value: String(waitingPatients), detail: `${currentConsultations} in consultation`, accent: "linear-gradient(135deg, #d89812 0%, #f7d27d 100%)" },
        { label: "Emergency Cases", value: String(emergencyCases), detail: `${missedAppointments} missed appointments`, accent: "linear-gradient(135deg, #c83f3f 0%, #f6a09e 100%)" },
      ],
      operations: {
        todaysVisits,
        completedConsultations,
        currentConsultations,
        doctorAvailabilityCount,
        recentRegistrations: recentRegistrations.length,
        pendingPrescriptions,
        criticalLabResults,
        todaysVaccinations,
        lowMedicineBatches,
        lowVaccineBatches,
      },
      recentActivities: recentActivities.map((activity) => ({
        time: new Date(activity.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        title: activity.action.replaceAll("_", " "),
        note: activity.resourceType || "Operational event",
      })),
      recentRegistrations: recentRegistrations.map((patient) => ({
        token: patient.patientId.slice(-6),
        name: patient.fullName,
        reason: patient.address?.village || "Village pending",
        status: patient.status,
      })),
      queueEntries: activeQueueEntries.map((entry) => ({
        id: String(entry._id),
        token: entry.displayToken,
        patientName: entry.patientName,
        department: entry.department,
        priority: entry.priority,
        status: entry.status,
        estimatedWaitMinutes: entry.estimatedWaitMinutes,
      })),
      queuePerformance: queuePerformance.map((item) => ({
        id: item._id,
        service: item._id,
        average: formatMinutes(item.averageMinutes),
        throughput: `${item.throughput} completed`,
      })),
      doctorAvailability: doctorSchedules
        .filter((schedule) => schedule.doctorRef)
        .map((schedule) => ({
          id: String(schedule.doctorRef._id),
          name: schedule.doctorRef.fullName,
          specialty: schedule.department || "Department not recorded",
          availability: schedule.consultationRoom
            ? `Active schedule · ${schedule.consultationRoom}`
            : "Active schedule",
        })),
      recentNotifications: notificationResult.items.map((item) => ({
        id: String(item._id),
        title: item.title,
        description: item.message,
        tone:
          item.priority === "critical"
            ? "danger"
            : item.priority === "high"
              ? "warning"
              : item.priority === "low"
                ? "neutral"
                : "info",
      })),
    };
  },
};
