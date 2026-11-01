import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { ROLES } from "../constants/roles.js";
import { DoctorSchedule } from "../models/doctor-schedule.model.js";
import { LabTestCatalogue } from "../models/lab-test-catalogue.model.js";
import { Medicine } from "../models/medicine.model.js";
import { NotificationTemplate } from "../models/notification-template.model.js";
import { Supplier } from "../models/supplier.model.js";
import { User } from "../models/user.model.js";
import { Vaccine } from "../models/vaccine.model.js";
import { VaccinationSchedule } from "../models/vaccination-schedule.model.js";
import { generateMedicineCode, generateSupplierCode, generateVaccineCode } from "../utils/id-generator.js";

export const seedService = {
  async ensureDefaultAdmin() {
    const existingAdmin = await User.findOne({ email: env.defaultAdminEmail.toLowerCase() });

    if (existingAdmin) {
      return existingAdmin;
    }

    const passwordHash = await bcrypt.hash(env.defaultAdminPassword, 12);

    return User.create({
      fullName: "District Health Administrator",
      email: env.defaultAdminEmail.toLowerCase(),
      passwordHash,
      role: ROLES.ADMIN,
      phone: "9876543210",
    });
  },

  async seedDevelopmentReferenceData() {
    const entries = [
      {
        fullName: "Dr. Priya N",
        email: "doctor@rphc.gov",
        phone: "9876500001",
        role: ROLES.DOCTOR,
      },
      {
        fullName: "Reception Desk One",
        email: "reception@rphc.gov",
        phone: "9876500002",
        role: ROLES.RECEPTIONIST,
      },
      {
        fullName: "Pharmacist Kannan",
        email: "pharmacy@rphc.gov",
        phone: "9876500003",
        role: ROLES.PHARMACIST,
      },
      {
        fullName: "Lab Technician Meena",
        email: "lab@rphc.gov",
        phone: "9876500004",
        role: ROLES.LAB_TECHNICIAN,
      },
      {
        fullName: "Health Worker Anitha",
        email: "healthworker@rphc.gov",
        phone: "9876500005",
        role: ROLES.HEALTH_WORKER,
      },
    ];

    const passwordHash = await bcrypt.hash(env.defaultAdminPassword, 12);
    const createdUsers = [];

    for (const entry of entries) {
      let user = await User.findOne({ email: entry.email });

      if (!user) {
        user = await User.create({
          ...entry,
          passwordHash,
        });
      }

      createdUsers.push(user);
    }

    const doctor = createdUsers.find((item) => item.role === ROLES.DOCTOR);

    if (doctor) {
      const existingSchedule = await DoctorSchedule.findOne({ doctorRef: doctor._id });

      if (!existingSchedule) {
        await DoctorSchedule.create({
          doctorRef: doctor._id,
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          shiftStart: "09:00",
          shiftEnd: "16:00",
          breakPeriods: [{ start: "13:00", end: "14:00" }],
          slotDuration: 15,
          maximumAppointments: 20,
          department: "General OP",
          consultationRoom: "Room 1",
          unavailableDates: [],
          leaveDates: [],
          activeStatus: true,
        });
      }
    }

    let supplier = await Supplier.findOne({ name: "District Medical Supplier" });
    if (!supplier) {
      supplier = await Supplier.create({
        supplierCode: generateSupplierCode(),
        name: "District Medical Supplier",
        contactPerson: "Arun Stores",
        phone: "9876500100",
        activeStatus: true,
      });
    }

    const medicines = [
      {
        genericName: "Paracetamol",
        brandName: "Paracare",
        category: "Analgesic",
        dosageForm: "tablet",
        strength: "500mg",
        unit: "tablet",
        manufacturer: "Tamil Pharma",
        minimumStockLevel: 20,
        reorderLevel: 50,
      },
      {
        genericName: "Amoxicillin",
        brandName: "Moxcare",
        category: "Antibiotic",
        dosageForm: "capsule",
        strength: "250mg",
        unit: "capsule",
        manufacturer: "Tamil Pharma",
        minimumStockLevel: 10,
        reorderLevel: 25,
      },
    ];

    for (const entry of medicines) {
      const existing = await Medicine.findOne({ genericName: entry.genericName });
      if (!existing) {
        await Medicine.create({
          ...entry,
          medicineCode: generateMedicineCode(),
          activeStatus: true,
          prescriptionRequired: true,
        });
      }
    }

    const tests = [
      { testCode: "CBC", testName: "Complete Blood Count", category: "hematology", specimenType: "Blood" },
      { testCode: "RBS", testName: "Random Blood Sugar", category: "biochemistry", specimenType: "Blood" },
    ];

    for (const entry of tests) {
      const existing = await LabTestCatalogue.findOne({ testCode: entry.testCode });
      if (!existing) {
        await LabTestCatalogue.create({
          ...entry,
          activeStatus: true,
          estimatedCompletionTime: 12,
          parameters: [],
        });
      }
    }

    let vaccine = await Vaccine.findOne({ vaccineName: "TT Vaccine" });
    if (!vaccine) {
      vaccine = await Vaccine.create({
        vaccineCode: generateVaccineCode(),
        vaccineName: "TT Vaccine",
        diseaseProtected: "Tetanus",
        manufacturer: "State Immunization Unit",
        route: "IM",
        dosage: "0.5ml",
        storageTemperature: "2-8C",
        ageEligibility: { minMonths: 120, maxMonths: 600 },
        doseSchedule: ["Dose 1", "Dose 2"],
        activeStatus: true,
      });
    }

    const existingSchedule = await VaccinationSchedule.findOne({ vaccineRef: vaccine._id, doseNumber: 1 });
    if (!existingSchedule) {
      await VaccinationSchedule.create({
        scheduleName: "TT Adults Dose 1",
        targetGroup: "adult",
        ageFrom: 120,
        ageTo: 600,
        genderRestriction: "any",
        pregnancyRequirement: false,
        vaccineRef: vaccine._id,
        doseNumber: 1,
        minimumIntervalDays: 0,
        recommendedIntervalDays: 30,
        nextDoseRules: "Dose 2 after 30 days",
        activeStatus: true,
      });
      await VaccinationSchedule.create({
        scheduleName: "TT Adults Dose 2",
        targetGroup: "adult",
        ageFrom: 120,
        ageTo: 600,
        genderRestriction: "any",
        pregnancyRequirement: false,
        vaccineRef: vaccine._id,
        doseNumber: 2,
        minimumIntervalDays: 30,
        recommendedIntervalDays: 180,
        nextDoseRules: "Booster after 6 months",
        activeStatus: true,
      });
    }
  },

  async ensureNotificationTemplates() {
    const indexes = await NotificationTemplate.collection.indexes().catch(() => []);
    const legacyTemplateCodeIndex = indexes.find(
      (index) => index.name === "templateCode_1" && index.unique,
    );

    if (legacyTemplateCodeIndex) {
      await NotificationTemplate.collection.dropIndex("templateCode_1");
    }

    await NotificationTemplate.syncIndexes();

    const templates = [
      {
        templateCode: "appointment-reminder",
        category: "appointment",
        channel: "sms",
        language: "en",
        subject: "Appointment reminder",
        body: "RHMS reminder: {{patientName}}, your appointment is scheduled for {{appointmentDate}} at {{startTime}}.",
        variables: ["patientName", "appointmentDate", "startTime"],
      },
      {
        templateCode: "appointment-reminder",
        category: "appointment",
        channel: "sms",
        language: "ta",
        subject: "Appointment reminder",
        body: "RHMS ninaivu: {{patientName}}, ungal appointment {{appointmentDate}} {{startTime}} manikku ullathu.",
        variables: ["patientName", "appointmentDate", "startTime"],
      },
      {
        templateCode: "lab-report-ready",
        category: "laboratory",
        channel: "email",
        language: "en",
        subject: "Lab report available",
        body: "Your RHMS lab report is available. Please sign in to view the report securely.",
        variables: [],
      },
    ];

    for (const template of templates) {
      const existing = await NotificationTemplate.findOne({
        templateCode: template.templateCode,
        channel: template.channel,
        language: template.language,
      });

      if (!existing) {
        await NotificationTemplate.create(template);
      }
    }
  },
};
