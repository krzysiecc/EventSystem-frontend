import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";

// --- LAYOUTS ---
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import MobileScannerLayout from "../layouts/MobileScannerLayout"; // Specjalny layout bez nawigacji, full screen

// --- COMPONENTS ---
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorBoundary from "../components/ui/ErrorBoundary";

// Ochrona tras (przygotowane pod Phase 2)
import ProtectedRoute from "./ProtectedRoute";

// --- LAZY LOADED VIEWS ---
// Public & Auth
const Home = lazy(() => import("../features/public/Home"));
const Login = lazy(() => import("../features/auth/Login"));
const RegisterStudent = lazy(() => import("../features/auth/RegisterStudent"));
const RegisterOrganizer = lazy(
  () => import("../features/auth/RegisterOrganizer"),
);
const Unauthorized = lazy(() => import("../features/public/Unauthorized"));

// Student
const StudentDashboard = lazy(() => import("../features/student/Dashboard"));
const EventBrowser = lazy(() => import("../features/student/EventBrowser"));
const EventDetailsStudent = lazy(
  () => import("../features/student/EventDetails"),
);
const MyTickets = lazy(() => import("../features/student/MyTickets"));
const TicketQRView = lazy(() => import("../features/student/TicketQRView")); // Bilet na cały ekran

// Organizer
const OrganizerDashboard = lazy(
  () => import("../features/organizer/Dashboard"),
);
const ManageEvents = lazy(() => import("../features/organizer/ManageEvents"));
const CreateEvent = lazy(() => import("../features/organizer/CreateEvent"));
const EventDetailsOrg = lazy(
  () => import("../features/organizer/EventDetails"),
);
const AttendeeList = lazy(() => import("../features/organizer/AttendeeList"));
const QRScanner = lazy(() => import("../features/organizer/QRScanner")); // Moduł WebRTC

// Admin
const AdminDashboard = lazy(() => import("../features/admin/Dashboard"));
const ManageUsers = lazy(() => import("../features/admin/ManageUsers"));
const SystemLogs = lazy(() => import("../features/admin/SystemLogs"));

// --- ROUTER CONFIG ---
export const router = createBrowserRouter([
  {
    element: <RootLayout />, // Główny kontener (np. trzymający Toasty i Context)
    errorElement: <ErrorBoundary />,
    children: [
      // PUBLICZNE TRASY
      { path: "/", element: <Home /> },
      { path: "/unauthorized", element: <Unauthorized /> },

      // AUTORYZACJA
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <RegisterStudent /> },
          { path: "register-organizer", element: <RegisterOrganizer /> }, // Tu wejdzie Organization Token
        ],
      },

      // --- STREFA STUDENTA ---
      {
        path: "/student",
        element: (
          <ProtectedRoute allowedRoles={["Student"]}>
            <DashboardLayout role="Student" />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: "events", element: <EventBrowser /> },
          { path: "events/:id", element: <EventDetailsStudent /> },
          { path: "tickets", element: <MyTickets /> },
          { path: "tickets/:id", element: <TicketQRView /> }, // Mobile friendly
        ],
      },

      // --- STREFA ORGANIZATORA ---
      {
        path: "/organizer",
        element: (
          <ProtectedRoute allowedRoles={["Organizer", "Admin"]}>
            <DashboardLayout role="Organizer" />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <OrganizerDashboard /> },
          { path: "events", element: <ManageEvents /> },
          { path: "events/new", element: <CreateEvent /> },
          { path: "events/:id", element: <EventDetailsOrg /> },
          { path: "events/:id/attendees", element: <AttendeeList /> }, // Tu będą modale do ręcznego sprawdzania obecności
        ],
      },

      // Specjalna trasa dla Skanera (bez sidebaru, full ekran kamery)
      {
        path: "/organizer/scanner/:eventId",
        element: (
          <ProtectedRoute allowedRoles={["Organizer", "Admin"]}>
            <MobileScannerLayout />
          </ProtectedRoute>
        ),
        children: [{ index: true, element: <QRScanner /> }],
      },

      // --- STREFA ADMINA ---
      {
        path: "/admin",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout role="Admin" />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "users", element: <ManageUsers /> },
          { path: "logs", element: <SystemLogs /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
