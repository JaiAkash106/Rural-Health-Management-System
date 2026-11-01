import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { seedService } from "../services/seed.service.js";
import { ROLES } from "../constants/roles.js";
import { Alert } from "../models/alert.model.js";
import { Appointment } from "../models/appointment.model.js";
import { AuditLog } from "../models/audit-log.model.js";
import { Consent } from "../models/consent.model.js";
import { Device } from "../models/device.model.js";
import { DispensingRecord } from "../models/dispensing-record.model.js";
import { FeatureFlag } from "../models/feature-flag.model.js";
import { Facility } from "../models/facility.model.js";
import { FollowUpTask } from "../models/follow-up-task.model.js";
import { Household } from "../models/household.model.js";
import { IntegrationConnection } from "../models/integration-connection.model.js";
import { LabRequest } from "../models/lab-request.model.js";
import { LabResult } from "../models/lab-result.model.js";
import { LabSample } from "../models/lab-sample.model.js";
import { LabTestCatalogue } from "../models/lab-test-catalogue.model.js";
import { Medicine } from "../models/medicine.model.js";
import { MedicineBatch } from "../models/medicine-batch.model.js";
import { Notification } from "../models/notification.model.js";
import { Organization } from "../models/organization.model.js";
import { OutreachCamp } from "../models/outreach-camp.model.js";
import { Patient } from "../models/patient.model.js";
import { Prescription } from "../models/prescription.model.js";
import { QueueEntry } from "../models/queue-entry.model.js";
import { Referral } from "../models/referral.model.js";
import { SavedReport } from "../models/saved-report.model.js";
import { ShiftHandover } from "../models/shift-handover.model.js";
import { StockMovement } from "../models/stock-movement.model.js";
import { SystemSetting } from "../models/system-setting.model.js";
import { User } from "../models/user.model.js";
import { Vaccine } from "../models/vaccine.model.js";
import { VaccineBatch } from "../models/vaccine-batch.model.js";
import { VaccinationRecord } from "../models/vaccination-record.model.js";
import { VaccinationSchedule } from "../models/vaccination-schedule.model.js";
import { Visit } from "../models/visit.model.js";

// All people and records below are fictional, internally consistent demo data.
const DAY = 24 * 60 * 60 * 1000;
const now = new Date();
const dateAt = (daysFromToday, hour = 10, minute = 0) => {
  const result = new Date(now.getTime() + daysFromToday * DAY);
  result.setHours(hour, minute, 0, 0);
  return result;
};

async function createIfAbsent(Model, filter, document) {
  const existing = await Model.findOne(filter);
  return existing || Model.create(document);
}

async function seedDemoData() {
  await mongoose.connect(env.mongoUri);
  await seedService.ensureDefaultAdmin();
  await seedService.seedDevelopmentReferenceData();
  await seedService.ensureNotificationTemplates();

  const admin = await User.findOne({ email: env.defaultAdminEmail.toLowerCase() });
  const doctor = await User.findOne({ email: "doctor@rphc.gov" });
  const receptionist = await User.findOne({ email: "reception@rphc.gov" });
  const pharmacist = await User.findOne({ email: "pharmacy@rphc.gov" });
  const technician = await User.findOne({ email: "lab@rphc.gov" });
  const healthWorker = await User.findOne({ email: "healthworker@rphc.gov" });

  const organization = await createIfAbsent(Organization, { organizationCode: "RHMS-DEMO" }, {
    organizationCode: "RHMS-DEMO",
    name: "RHMS Demonstration Health Network",
    type: "demonstration",
    address: { line1: "Community Health Services Campus", district: "Coimbatore", state: "Tamil Nadu", pinCode: "641046" },
    contactDetails: { phone: "0422-555-0140", email: "demo@rhms.example" },
    defaultLanguage: "en",
    timezone: "Asia/Kolkata",
    createdBy: admin._id,
  });

  const phc = await createIfAbsent(Facility, { facilityCode: "RHMS-PHC-001" }, {
    facilityCode: "RHMS-PHC-001",
    organization: organization._id,
    facilityType: "PHC",
    name: "Kovilpalayam Primary Health Centre",
    shortName: "Kovilpalayam PHC",
    address: { line1: "Mettupalayam Road", district: "Coimbatore", block: "Annur", village: "Kovilpalayam", state: "Tamil Nadu", pinCode: "641107" },
    phone: "0422-555-0141",
    email: "kovilpalayam.phc@rhms.example",
    departments: ["General OP", "Pharmacy", "Laboratory", "Immunization"],
    services: ["Outpatient care", "Lab diagnostics", "Pharmacy", "Vaccination", "Follow-up"],
  });
  const referralFacility = await createIfAbsent(Facility, { facilityCode: "RHMS-REF-001" }, {
    facilityCode: "RHMS-REF-001",
    organization: organization._id,
    facilityType: "referral_centre",
    name: "Annur Taluk Referral Centre",
    shortName: "Annur TRC",
    address: { line1: "Taluk Hospital Road", district: "Coimbatore", block: "Annur", village: "Annur", state: "Tamil Nadu", pinCode: "641653" },
    phone: "0422-555-0188",
    departments: ["General Medicine", "Obstetrics", "Emergency"],
    services: ["Specialist referral", "Emergency care"],
  });

  const staff = [admin, doctor, receptionist, pharmacist, technician, healthWorker].filter(Boolean);
  await Promise.all(staff.map((user) => User.updateOne(
    { _id: user._id },
    { $set: { organizationRef: organization._id, primaryFacilityRef: phc._id, activeFacilityRef: phc._id, allowedFacilities: [phc._id], allowedDepartments: user.role === ROLES.DOCTOR ? ["General OP"] : [] } },
  )));

  const patientSpecs = [
    ["RPHC-DEMO-1001", "Kavitha", "Raman", "female", 34, "9000101001", "Kovilpalayam", ["Seasonal allergic rhinitis"], [], "Tailoring"],
    ["RPHC-DEMO-1002", "Arun", "Kumar", "male", 47, "9000101002", "Kovilpalayam", ["Type 2 diabetes"], ["Metformin"], "Farmer"],
    ["RPHC-DEMO-1003", "Meena", "Devi", "female", 28, "9000101003", "Pannimadai", [], [], "Teacher"],
    ["RPHC-DEMO-1004", "Selvam", "M", "male", 62, "9000101004", "Annur", ["Hypertension"], ["Amlodipine"], "Retired"],
    ["RPHC-DEMO-1005", "Nila", "S", "female", 9, "9000101005", "Pannimadai", [], [], "Student"],
    ["RPHC-DEMO-1006", "Ravi", "Shankar", "male", 39, "9000101006", "Kovilpalayam", ["Bronchial asthma"], ["Salbutamol inhaler"], "Driver"],
    ["RPHC-DEMO-1007", "Lakshmi", "P", "female", 54, "9000101007", "Kanjappalli", ["Type 2 diabetes", "Hypertension"], ["Metformin", "Telmisartan"], "Self-employed"],
    ["RPHC-DEMO-1008", "Vignesh", "R", "male", 22, "9000101008", "Kovilpalayam", [], [], "College student"],
    ["RPHC-DEMO-1009", "Saroja", "K", "female", 67, "9000101009", "Kanjappalli", ["Osteoarthritis"], [], "Homemaker"],
    ["RPHC-DEMO-1010", "Pradeep", "N", "male", 31, "9000101010", "Annur", [], [], "Electrician"],
    ["RPHC-DEMO-1011", "Divya", "R", "female", 26, "9000101011", "Pannimadai", [], [], "Nurse"],
    ["RPHC-DEMO-1012", "Mohan", "K", "male", 45, "9000101012", "Kanjappalli", ["Dyslipidemia"], [], "Shop owner"],
  ];
  const patients = [];
  for (const [patientId, firstName, lastName, gender, age, phone, village, conditions, medications, occupation] of patientSpecs) {
    const patient = await createIfAbsent(Patient, { patientId }, {
      patientId, qrCodeValue: `RHMS-QR-${patientId}`, firstName, lastName, fullName: `${firstName} ${lastName}`,
      dateOfBirth: dateAt(-(age * 365 + 120), 12), age, gender, phone, bloodGroup: gender === "female" ? "B+" : "O+",
      address: { village, district: "Coimbatore", state: "Tamil Nadu", pinCode: "641107" },
      guardianName: age < 18 ? "Kavitha Raman" : "", emergencyContact: "9000199999", occupation,
      medicalFlags: { medicalHistory: conditions, allergies: [], chronicDiseases: conditions, currentMedications: medications },
      vitals: { heightCm: age < 18 ? 132 : 164, weightKg: age < 18 ? 29 : 64, bmi: age < 18 ? 16.6 : 23.8 },
      organizationRef: organization._id, facilityRef: phc._id, homeFacilityRef: phc._id, createdBy: receptionist._id, updatedBy: receptionist._id,
    });
    patients.push(patient);
  }

  for (const [index, patient] of patients.entries()) {
    await createIfAbsent(Household, { householdId: `HH-DEMO-${String(index + 1).padStart(3, "0")}` }, {
      householdId: `HH-DEMO-${String(index + 1).padStart(3, "0")}`,
      familyName: `${patient.lastName} Household`, village: patient.address.village, address: `Ward ${(index % 5) + 1}, ${patient.address.village}`,
      headOfHousehold: patient.fullName, contactNumber: patient.phone, assignedHealthWorkerRef: healthWorker._id, assignedHealthWorkerName: healthWorker.fullName,
      members: [{ patientRef: patient._id, patientId: patient.patientId, name: patient.fullName, relationship: "other", lastVisitAt: dateAt(-index - 2), vaccinationStatus: index % 3 === 0 ? "due" : "up_to_date", followUpStatus: index % 4 === 0 ? "pending" : "clear" }],
      organizationRef: organization._id, facilityRef: phc._id, createdBy: healthWorker._id, updatedBy: healthWorker._id,
    });
  }

  const medicines = await Medicine.find({ genericName: { $in: ["Paracetamol", "Amoxicillin"] } });
  const paracetamol = medicines.find((item) => item.genericName === "Paracetamol");
  const amoxicillin = medicines.find((item) => item.genericName === "Amoxicillin");
  const medBatches = [];
  for (const [medicine, batchNumber, quantity, status] of [[paracetamol, "PCM-D24-061", 860, "active"], [amoxicillin, "AMX-D24-042", 18, "low_stock"]]) {
    const batch = await createIfAbsent(MedicineBatch, { medicineRef: medicine._id, batchNumber }, {
      medicineRef: medicine._id, batchNumber, manufactureDate: dateAt(-240), expiryDate: dateAt(365), purchasePrice: quantity * 1.4, unitCost: 1.4,
      receivedQuantity: 1000, availableQuantity: quantity, storageLocation: "Pharmacy Rack A", receivedDate: dateAt(-90), purchaseReference: `PO-DEMO-${batchNumber}`, status, createdBy: pharmacist._id, updatedBy: pharmacist._id,
    });
    medBatches.push(batch);
    await createIfAbsent(StockMovement, { referenceId: `PO-DEMO-${batchNumber}` }, {
      medicineRef: medicine._id, batchRef: batch._id, movementType: "purchase", quantity: 1000, quantityBefore: 0, quantityAfter: 1000,
      referenceType: "purchase_order", referenceId: `PO-DEMO-${batchNumber}`, reason: "Synthetic demo opening stock", performedBy: pharmacist._id,
    });
  }

  const cbc = await LabTestCatalogue.findOne({ testCode: "CBC" });
  const rbs = await LabTestCatalogue.findOne({ testCode: "RBS" });
  const historicalVisits = [];
  for (const [index, patient] of patients.slice(0, 8).entries()) {
    const visitDate = dateAt(-((index + 1) * 4), 10 + (index % 4), 15);
    const isDiabetesReview = patient.patientId === "RPHC-DEMO-1002" || patient.patientId === "RPHC-DEMO-1007";
    const visit = await createIfAbsent(Visit, { visitId: `VIS-DEMO-${String(index + 1).padStart(3, "0")}` }, {
      visitId: `VIS-DEMO-${String(index + 1).padStart(3, "0")}`, patientId: patient.patientId, patientRef: patient._id,
      organizationRef: organization._id, facilityRef: phc._id, doctorRef: doctor._id, doctorName: doctor.fullName,
      symptoms: isDiabetesReview ? ["Increased thirst", "Routine glucose review"] : ["Fever", "Body pain"],
      complaint: isDiabetesReview ? "Scheduled diabetes follow-up" : "Acute febrile illness with body ache",
      symptomDuration: isDiabetesReview ? "Routine review" : "2 days", provisionalDiagnosis: isDiabetesReview ? "Type 2 diabetes follow-up" : "Viral febrile illness",
      diagnosis: isDiabetesReview ? "Type 2 diabetes mellitus - follow-up" : "Acute viral fever", vitals: { heightCm: 164, weightKg: 64, bmi: 23.8, pulse: 78, temperatureC: isDiabetesReview ? 36.7 : 37.8, bloodPressure: "124/80", spo2: 98, bloodGlucose: isDiabetesReview ? 146 : 102 },
      advice: isDiabetesReview ? "Continue diet plan, walking routine and scheduled glucose review." : "Hydration, rest and return if fever persists beyond 48 hours.",
      prescription: [{ name: "Paracetamol", strength: "500mg", form: "tablet", dose: "1 tablet", frequency: "SOS", route: "oral", duration: "3 days", instructions: "Take after food if fever or pain", quantity: 6 }],
      labRequests: isDiabetesReview ? [{ testName: "Random Blood Sugar", priority: "routine", clinicalNotes: "Routine diabetic monitoring", requestedDate: visitDate, status: "completed" }] : [],
      notes: "Synthetic demo clinical record. Not a real patient or clinical record.", followUpDate: isDiabetesReview ? dateAt(28) : null, visitDate, visitStatus: isDiabetesReview ? "follow_up_due" : "completed", createdBy: doctor._id,
    });
    historicalVisits.push(visit);
    const prescription = await createIfAbsent(Prescription, { prescriptionNumber: `RX-DEMO-${String(index + 1).padStart(3, "0")}` }, {
      prescriptionNumber: `RX-DEMO-${String(index + 1).padStart(3, "0")}`, patientId: patient.patientId, patientRef: patient._id, visitRef: visit._id,
      doctorRef: doctor._id, doctorName: doctor.fullName, items: [{ medicineRef: paracetamol._id, name: "Paracetamol", strength: "500mg", form: "tablet", dose: "1 tablet", frequency: "SOS", route: "oral", duration: "3 days", instructions: "After food", quantity: 6, dispensedQuantity: 6, status: "dispensed" }],
      status: "fully_dispensed", issuedAt: visitDate, dispensedAt: new Date(visitDate.getTime() + 20 * 60000), dispensedBy: pharmacist._id, pharmacistNotes: "Counselling completed.",
    });
    await createIfAbsent(DispensingRecord, { prescriptionRef: prescription._id }, {
      prescriptionRef: prescription._id, patientId: patient.patientId, patientRef: patient._id, visitRef: visit._id, pharmacistRef: pharmacist._id,
      items: [{ medicineRef: paracetamol._id, prescribedMedicineName: "Paracetamol", batchRef: medBatches[0]._id, prescribedQuantity: 6, dispensedQuantity: 6, remainingQuantity: 0, expiryDate: medBatches[0].expiryDate, instructions: "After food" }],
      dispensedAt: new Date(visitDate.getTime() + 20 * 60000), notes: "Synthetic demonstration dispensing record.",
    });
    if (isDiabetesReview) {
      const request = await createIfAbsent(LabRequest, { requestNumber: `LAB-DEMO-${String(index + 1).padStart(3, "0")}` }, {
        requestNumber: `LAB-DEMO-${String(index + 1).padStart(3, "0")}`, patientId: patient.patientId, patientRef: patient._id, visitRef: visit._id, doctorRef: doctor._id, doctorName: doctor.fullName,
        tests: [{ testName: "Random Blood Sugar", testRef: rbs._id, priority: "routine", clinicalNotes: "Routine diabetic monitoring", requestedDate: visitDate, status: "completed" }], priority: "routine", clinicalNotes: "Routine diabetic monitoring", requestedAt: visitDate, status: "doctor_reviewed", acknowledgedBy: technician._id, sampleCollectedAt: new Date(visitDate.getTime() + 30 * 60000), completedAt: new Date(visitDate.getTime() + 2 * 60 * 60000), verifiedAt: new Date(visitDate.getTime() + 3 * 60 * 60000), doctorReviewedAt: new Date(visitDate.getTime() + 4 * 60 * 60000),
      });
      await createIfAbsent(LabSample, { sampleId: `SMP-DEMO-${String(index + 1).padStart(3, "0")}` }, { labRequestRef: request._id, sampleId: `SMP-DEMO-${String(index + 1).padStart(3, "0")}`, specimenType: "Blood", collectionDate: request.sampleCollectedAt, collectedBy: technician._id, collectionLocation: "Laboratory collection desk", status: "completed" });
      await createIfAbsent(LabResult, { labRequestRef: request._id, testName: "Random Blood Sugar" }, { labRequestRef: request._id, patientId: patient.patientId, patientRef: patient._id, visitRef: visit._id, testName: "Random Blood Sugar", testRef: rbs._id, parameters: [{ name: "Random Blood Sugar", value: patient.patientId === "RPHC-DEMO-1007" ? "168" : "146", unit: "mg/dL", referenceRange: "70-140", flag: "high", note: "Fictional demo value" }], interpretation: "Mildly elevated random blood sugar; continue planned review.", technicianNotes: "Quality control completed.", abnormalFlags: ["Elevated glucose"], enteredBy: technician._id, verifiedBy: technician._id, verifiedAt: request.verifiedAt, doctorReviewedBy: doctor._id, doctorReviewedAt: request.doctorReviewedAt, reviewNote: "Discussed lifestyle measures and follow-up plan." });
    }
  }

  for (const [index, patient] of patients.slice(0, 6).entries()) {
    const appointmentDate = index < 3 ? dateAt(0, 9 + index, 0) : dateAt(index - 2, 10 + index, 0);
    const status = index === 0 ? "waiting" : index === 1 ? "called" : index === 2 ? "checked_in" : "scheduled";
    const appointment = await createIfAbsent(Appointment, { appointmentNumber: `APT-DEMO-${String(index + 1).padStart(3, "0")}` }, {
      appointmentNumber: `APT-DEMO-${String(index + 1).padStart(3, "0")}`, patientRef: patient._id, patientId: patient.patientId, organizationRef: organization._id, facilityRef: phc._id,
      doctorRef: doctor._id, doctorName: doctor.fullName, department: "General OP", appointmentDate, startTime: `${String(9 + index).padStart(2, "0")}:00`, endTime: `${String(9 + index).padStart(2, "0")}:15`, appointmentType: "general_consultation", bookingSource: "reception", reason: index % 2 ? "Routine follow-up" : "General consultation", symptomsSummary: index % 2 ? "Medication review" : "Fever and body ache", priority: index === 1 ? "senior_citizen" : "normal", status, checkedInAt: status === "scheduled" ? null : appointmentDate, createdBy: receptionist._id, updatedBy: receptionist._id,
    });
    if (index < 3) {
      await createIfAbsent(QueueEntry, { displayToken: `G-${String(index + 1).padStart(2, "0")}`, queueDate: dateAt(0, 0) }, {
        tokenNumber: index + 1, displayToken: `G-${String(index + 1).padStart(2, "0")}`, appointmentRef: appointment._id, patientRef: patient._id, patientId: patient.patientId, patientName: patient.fullName, doctorRef: doctor._id, doctorName: doctor.fullName, department: "General OP", queueDate: dateAt(0, 0), queueType: "appointment", priority: index === 1 ? "senior_citizen" : "normal", status: index === 0 ? "waiting" : index === 1 ? "called" : "in_consultation", checkedInAt: appointmentDate, calledAt: index > 0 ? new Date(appointmentDate.getTime() + 5 * 60000) : null, consultationStartedAt: index === 2 ? new Date(appointmentDate.getTime() + 8 * 60000) : null, estimatedWaitMinutes: (index + 1) * 12, position: index + 1, createdBy: receptionist._id,
      });
    }
  }

  const vaccine = await Vaccine.findOne({ vaccineName: "TT Vaccine" });
  const vaccineBatch = await createIfAbsent(VaccineBatch, { vaccineRef: vaccine._id, batchNumber: "TT-DEMO-2026-08" }, { vaccineRef: vaccine._id, batchNumber: "TT-DEMO-2026-08", manufactureDate: dateAt(-120), expiryDate: dateAt(240), receivedQuantity: 150, availableQuantity: 114, storageLocation: "ILR Shelf 2", coldChainStatus: "maintained", receivedDate: dateAt(-50), status: "active" });
  const doseOne = await VaccinationSchedule.findOne({ vaccineRef: vaccine._id, doseNumber: 1 });
  for (const [index, patient] of patients.slice(0, 4).entries()) {
    await createIfAbsent(VaccinationRecord, { patientId: patient.patientId, vaccineRef: vaccine._id, doseNumber: 1 }, { patientId: patient.patientId, patientRef: patient._id, vaccineRef: vaccine._id, batchRef: vaccineBatch._id, doseNumber: 1, administeredDate: dateAt(-30 - index), route: "IM", site: "Left upper arm", administeredBy: healthWorker._id, facility: phc.name, nextDoseDate: dateAt(0 + index * 7), scheduleReference: doseOne._id, certificateNumber: `VAC-DEMO-${String(index + 1).padStart(3, "0")}`, notes: "Synthetic demonstration immunization record.", village: patient.address.village });
  }

  for (const [index, patient] of patients.slice(0, 5).entries()) {
    await createIfAbsent(FollowUpTask, { taskNumber: `FUP-DEMO-${String(index + 1).padStart(3, "0")}` }, { taskNumber: `FUP-DEMO-${String(index + 1).padStart(3, "0")}`, patientRef: patient._id, patientId: patient.patientId, patientName: patient.fullName, village: patient.address.village, category: index === 0 ? "overdue" : index === 1 ? "lab_review_pending" : "vaccination_due", reason: index === 1 ? "Review glucose report and counselling plan" : index === 0 ? "Chronic disease review is overdue" : "TT dose reminder", dueDate: dateAt(index - 2), assignedUserRef: healthWorker._id, assignedToName: healthWorker.fullName, assignedRole: ROLES.HEALTH_WORKER, status: index === 3 ? "in_progress" : "open", lastContactAt: index === 3 ? dateAt(-1) : null, lastContact: index === 3 ? "Phone reminder acknowledged" : "", organizationRef: organization._id, facilityRef: phc._id, createdBy: healthWorker._id, updatedBy: healthWorker._id });
  }

  const consent = await createIfAbsent(Consent, { patient: patients[3]._id, consentType: "referral", receivingFacility: referralFacility._id }, { patient: patients[3]._id, organization: organization._id, sourceFacility: phc._id, receivingFacility: referralFacility._id, consentType: "referral", purpose: "Specialist review for persistent hypertension", scope: "clinical summary and recent laboratory reports", capturedBy: doctor._id, method: "written", status: "active" });
  await createIfAbsent(Referral, { referralNumber: "REF-DEMO-001" }, { referralNumber: "REF-DEMO-001", patient: patients[3]._id, sourceFacility: phc._id, sourceDoctor: doctor._id, destinationFacility: referralFacility._id, destinationDepartment: "General Medicine", reason: "Specialist hypertension review", urgency: "priority", clinicalSummary: "Persistent elevated blood pressure despite adherence counselling. Fictional demo record.", selectedDocuments: ["Latest visit summary", "Medication list"], consent: consent._id, status: "scheduled", sentAt: dateAt(-2), acceptedAt: dateAt(-1), scheduledAt: dateAt(5), createdBy: doctor._id, updatedBy: doctor._id });

  const notifications = [
    ["NTF-DEMO-001", "laboratory", "Lab report ready for review", "A completed glucose report is ready for clinical review.", "high", doctor],
    ["NTF-DEMO-002", "stock", "Low stock: Amoxicillin", "Available quantity is below the configured reorder level.", "normal", pharmacist],
    ["NTF-DEMO-003", "follow_up", "Five follow-up tasks require action", "Health-worker task list includes overdue and vaccination reminders.", "normal", healthWorker],
    ["NTF-DEMO-004", "appointment", "Today's OP appointments", "Three patients are checked in or waiting for consultation.", "normal", receptionist],
  ];
  for (const [notificationNumber, category, title, message, priority, recipientUser] of notifications) {
    await createIfAbsent(Notification, { notificationNumber }, { notificationNumber, recipientUser: recipientUser._id, recipientRole: recipientUser.role, category, title, message, priority, channels: ["in_app"], status: "delivered", deliveries: [{ channel: "in_app", status: "delivered", deliveredAt: dateAt(-1) }], sentAt: dateAt(-1), deliveredAt: dateAt(-1), createdBy: admin._id });
  }
  await createIfAbsent(Alert, { alertNumber: "ALT-DEMO-001" }, { alertNumber: "ALT-DEMO-001", category: "low_medicine_stock", severity: "medium", title: "Amoxicillin stock below reorder level", description: "Synthetic demonstration alert for pharmacy inventory workflow.", sourceModule: "pharmacy", sourceRecordId: medBatches[1]._id.toString(), assignedToName: pharmacist.fullName, status: "open", organizationRef: organization._id, facilityRef: phc._id, createdBy: admin._id, updatedBy: admin._id });
  await createIfAbsent(Alert, { alertNumber: "ALT-DEMO-002" }, { alertNumber: "ALT-DEMO-002", category: "overdue_follow_up", severity: "high", title: "Chronic care follow-up overdue", description: "Synthetic demonstration alert for follow-up workflow.", sourceModule: "follow_up", sourceRecordId: "FUP-DEMO-001", assignedToName: healthWorker.fullName, status: "acknowledged", acknowledgedAt: dateAt(-1), organizationRef: organization._id, facilityRef: phc._id, createdBy: admin._id, updatedBy: admin._id });

  await createIfAbsent(OutreachCamp, { campNumber: "CAMP-DEMO-001" }, { campNumber: "CAMP-DEMO-001", organization: organization._id, facility: phc._id, village: "Pannimadai", date: dateAt(7, 9), team: [doctor.fullName, healthWorker.fullName, "Community volunteer team"], servicesOffered: ["Screening", "Vaccination counselling", "Medicine refill"], expectedPatients: 45, registeredPatients: 0, vaccinations: 0, screeningsRecorded: 0, referrals: 0, medicinesIssued: 0, stockTransferred: 0, summary: "Planned fictional outreach camp for deployment demonstration.", status: "planned", createdBy: admin._id });
  await createIfAbsent(ShiftHandover, { handoverNumber: "SH-DEMO-001" }, { handoverNumber: "SH-DEMO-001", title: "OP queue and follow-up review", handoverNote: "Three OP tokens are active. Review the low-stock alert and diabetes follow-up list.", priority: "high", assignedPerson: healthWorker.fullName, expectedAction: "Contact overdue follow-up patients and update status.", dueTime: dateAt(0, 16), outgoingStaffRef: receptionist._id, outgoingStaffName: receptionist.fullName, incomingStaffRef: healthWorker._id, incomingStaffName: healthWorker.fullName, status: "acknowledged", module: "operations", acknowledgedAt: dateAt(0, 13), organizationRef: organization._id, facilityRef: phc._id, createdBy: receptionist._id, updatedBy: healthWorker._id });
  await createIfAbsent(Device, { deviceId: "RHMS-DEMO-WS-01" }, { deviceId: "RHMS-DEMO-WS-01", organization: organization._id, facility: phc._id, deviceType: "workstation", assignedUser: receptionist._id, name: "Reception Workstation 01", platform: "Windows 11", appVersion: "1.0.0-rc.1", lastSeen: now, trustedStatus: true });
  await createIfAbsent(IntegrationConnection, { provider: "state-health-sandbox" }, { provider: "state-health-sandbox", environment: "sandbox", enabledStatus: false, lastSuccessfulRequest: dateAt(-3), retryCount: 0, queueDepth: 0, metadata: { note: "Synthetic demo integration status; no external patient data exchanged." } });
  await createIfAbsent(FeatureFlag, { key: "demo-clinical-workflows" }, { key: "demo-clinical-workflows", description: "Shows synthetic clinical workflow records for academic demonstration.", enabled: true, environmentScope: ["production"], organizationScope: [organization._id] });
  await SystemSetting.updateOne({ key: "demo_data_notice" }, { $set: { value: { enabled: true, message: "All records in this deployed environment are synthetic demonstration data." }, updatedBy: admin._id } }, { upsert: true });
  await createIfAbsent(SavedReport, { reportName: "Weekly OP and follow-up overview", ownerId: admin._id.toString() }, { reportName: "Weekly OP and follow-up overview", description: "Synthetic demo report preset", ownerId: admin._id.toString(), ownerRole: ROLES.ADMIN, visibility: "organization", module: "patients", filters: { preset: "this_week" }, columns: ["patientId", "fullName", "village", "createdAt"], grouping: "village", sorting: { field: "createdAt", direction: "desc" }, chartType: "bar", exportFormat: "pdf" });
  for (const [index, action] of ["PATIENT_REGISTERED", "VISIT_COMPLETED", "LAB_RESULT_VERIFIED", "PRESCRIPTION_DISPENSED", "FOLLOW_UP_ASSIGNED"].entries()) {
    await createIfAbsent(AuditLog, { action, resourceId: `DEMO-AUDIT-${index + 1}` }, { actorId: admin._id.toString(), actorRole: ROLES.ADMIN, action, resourceType: "synthetic_demo", resourceId: `DEMO-AUDIT-${index + 1}`, metadata: { note: "Synthetic demo audit event", generatedBy: "seed:demo" } });
  }

  return { patients: patients.length, visits: historicalVisits.length, facility: phc.name };
}

try {
  const result = await seedDemoData();
  logger.info(result, "Synthetic RHMS demo data is ready");
  process.exitCode = 0;
} catch (error) {
  logger.error({ err: error, errorMessage: error.message, stack: error.stack }, "Failed to seed synthetic RHMS demo data");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
