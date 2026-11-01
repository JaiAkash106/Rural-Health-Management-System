import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./components/auth/RouteGuards";
import { AppShell } from "./layouts/AppShell";
import { AppointmentsPage } from "./pages/appointments/AppointmentsPage";
import { QueuePage } from "./pages/appointments/QueuePage";
import { WaitingQueuePage } from "./pages/appointments/WaitingQueuePage";
import { AnalyticsPage } from "./pages/analytics/AnalyticsPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { DoctorDashboardPage } from "./pages/doctors/DoctorDashboardPage";
import { LaboratoryPage } from "./pages/laboratory/LaboratoryPage";
import { AiGovernancePage } from "./pages/system/AiGovernancePage";
import { AboutProjectPage } from "./pages/system/AboutProjectPage";
import { DevicesPage } from "./pages/system/DevicesPage";
import { HelpCenterPage } from "./pages/system/HelpCenterPage";
import { NotificationsPage } from "./pages/system/NotificationsPage";
import {
  AlertCenterPage,
  CommandCenterPage,
  DocumentVerificationPage,
  FollowUpBoardPage,
  HouseholdsPage,
  PublicVerificationPage,
  ShiftHandoverPage,
} from "./pages/system/OperationsWorkbenchPage";
import { OutreachPage } from "./pages/system/OutreachPage";
import { PresentationDashboardPage } from "./pages/system/PresentationDashboardPage";
import { PlatformPage } from "./pages/system/PlatformPage";
import { ReferralsPage } from "./pages/system/ReferralsPage";
import { SettingsPage } from "./pages/system/SettingsPage";
import { NotFoundPage, AccessDeniedPage, LoadingPage } from "./pages/system/StatusPages";
import { PharmacyPage } from "./pages/pharmacy/PharmacyPage";
import {
  CalendarPage,
  RegisterPatientPage,
  VisitHistoryPage,
} from "./pages/modules/ModulePages";
import { PatientListPage } from "./pages/patients/PatientListPage";
import { PatientDetailsPage } from "./pages/patients/PatientDetailsPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { VaccinationPage } from "./pages/vaccination/VaccinationPage";
import { ROLES } from "./config/access";

const { ADMIN, DOCTOR, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, HEALTH_WORKER } = ROLES;

function restrictTo(allowedRoles, route) {
  return {
    element: <ProtectedRoute allowedRoles={allowedRoles} />,
    children: [route],
  };
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/access-denied",
    element: <AccessDeniedPage />,
  },
  {
    path: "/display",
    element: <WaitingQueuePage publicMode />,
  },
  {
    path: "/verify/:publicToken",
    element: <PublicVerificationPage />,
  },
  {
    path: "/loading",
    element: <LoadingPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          restrictTo([ADMIN, RECEPTIONIST, HEALTH_WORKER], {
            path: "patients/register",
            element: <RegisterPatientPage />,
          }),
          {
            path: "patients",
            element: <PatientListPage />,
          },
          {
            path: "patients/:patientId",
            element: <PatientDetailsPage />,
          },
          restrictTo([ADMIN, DOCTOR, RECEPTIONIST, HEALTH_WORKER], {
            path: "patients/visits",
            element: <VisitHistoryPage />,
          }),
          restrictTo([ADMIN, DOCTOR, RECEPTIONIST, HEALTH_WORKER], {
            path: "appointments",
            element: <AppointmentsPage />,
          }),
          restrictTo([ADMIN, DOCTOR, RECEPTIONIST, HEALTH_WORKER], {
            path: "appointments/calendar",
            element: <CalendarPage />,
          }),
          restrictTo([ADMIN, DOCTOR, RECEPTIONIST], {
            path: "appointments/queue",
            element: <QueuePage />,
          }),
          restrictTo([ADMIN, DOCTOR, RECEPTIONIST], {
            path: "appointments/waiting",
            element: <WaitingQueuePage />,
          }),
          restrictTo([ADMIN, DOCTOR], {
            path: "doctors",
            element: <DoctorDashboardPage />,
          }),
          restrictTo([ADMIN, PHARMACIST], {
            path: "pharmacy",
            element: <PharmacyPage />,
          }),
          restrictTo([ADMIN, LAB_TECHNICIAN], {
            path: "laboratory",
            element: <LaboratoryPage />,
          }),
          restrictTo([ADMIN, HEALTH_WORKER], {
            path: "vaccination",
            element: <VaccinationPage />,
          }),
          {
            path: "reports",
            element: <ReportsPage />,
          },
          restrictTo([ADMIN], {
            path: "analytics",
            element: <AnalyticsPage />,
          }),
          restrictTo([ADMIN], {
            path: "presentation",
            element: <PresentationDashboardPage />,
          }),
          {
            path: "about-project",
            element: <AboutProjectPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          restrictTo([ADMIN], {
            path: "settings",
            element: <SettingsPage />,
          }),
          {
            path: "help",
            element: <HelpCenterPage />,
          },
          restrictTo([ADMIN], {
            path: "platform",
            element: <PlatformPage />,
          }),
          restrictTo([ADMIN, DOCTOR, HEALTH_WORKER], {
            path: "referrals",
            element: <ReferralsPage />,
          }),
          restrictTo([ADMIN], {
            path: "ai-governance",
            element: <AiGovernancePage />,
          }),
          restrictTo([ADMIN], {
            path: "devices",
            element: <DevicesPage />,
          }),
          restrictTo([ADMIN, HEALTH_WORKER], {
            path: "outreach",
            element: <OutreachPage />,
          }),
          restrictTo([ADMIN, RECEPTIONIST, HEALTH_WORKER], {
            path: "operations",
            element: <CommandCenterPage />,
          }),
          restrictTo([ADMIN, HEALTH_WORKER], {
            path: "operations/households",
            element: <HouseholdsPage />,
          }),
          restrictTo([ADMIN, DOCTOR, HEALTH_WORKER], {
            path: "operations/follow-ups",
            element: <FollowUpBoardPage />,
          }),
          restrictTo([ADMIN, DOCTOR, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, HEALTH_WORKER], {
            path: "operations/handovers",
            element: <ShiftHandoverPage />,
          }),
          restrictTo([ADMIN, DOCTOR, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, HEALTH_WORKER], {
            path: "operations/alerts",
            element: <AlertCenterPage />,
          }),
          restrictTo([ADMIN, RECEPTIONIST, HEALTH_WORKER], {
            path: "operations/verification",
            element: <DocumentVerificationPage />,
          }),
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
