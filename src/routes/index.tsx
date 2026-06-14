import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense, lazy } from "react";

// --- LAYOUTS ---
import RootLayout from "@/layouts/RootLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import MobileScannerLayout from "@/layouts/MobileScannerLayout";

// --- COMPONENTS ---
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ProtectedRoute from "@/routes/ProtectedRoute";

// --- LAZY LOADED VIEWS ---
// Public & Auth
const Home = lazy(() => import("@/features/public/Home"));
const Login = lazy(() => import("@/features/auth/Login"));
const RegisterStudent = lazy(() => import("@/features/auth/RegisterStudent"));
const RegisterOrganizer = lazy(
  () => import("@/features/auth/RegisterOrganizer"),
);
const ForgotPassword = lazy(() => import("@/features/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/features/auth/ResetPassword"));
const Unauthorized = lazy(() => import("@/features/public/Unauthorized"));
const PublicProfile = lazy(() => import("@/features/shared/PublicProfile"));

// Student
const StudentDashboard = lazy(() => import("@/features/student/Dashboard"));
const EventBrowser = lazy(() => import("@/features/student/EventBrowser"));
const EventDetailsStudent = lazy(
  () => import("@/features/student/EventDetails"),
);
const MyTickets = lazy(() => import("@/features/student/MyTickets"));
const TicketQRView = lazy(() => import("@/features/student/TicketQRView"));
const Profile = lazy(() => import("@/features/shared/Profile"));

// Organizer
const OrganizerDashboard = lazy(() => import("@/features/organizer/Dashboard"));
const ManageEvents = lazy(() => import("@/features/organizer/ManageEvents"));
const CreateEvent = lazy(() => import("@/features/organizer/CreateEvent"));
const EventDetailsOrg = lazy(() => import("@/features/organizer/EventDetails"));
const AttendeeList = lazy(() => import("@/features/organizer/AttendeeList"));
const QRScanner = lazy(() => import("@/features/organizer/QRScanner"));
const EditEvent = lazy(() => import("@/features/organizer/EditEvent"));

// Admin
const AdminDashboard = lazy(() => import("@/features/admin/Dashboard"));
const ManageUsers = lazy(() => import("@/features/admin/ManageUsers"));
const SystemLogs = lazy(() => import("@/features/admin/SystemLogs"));
const Tokens = lazy(() => import("@/features/admin/AdminTokens"));
const AllEvents = lazy(() => import("@/features/admin/AllEvents"));

// --- ROUTER CONFIG ---
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      // PUBLIC
      { path: "/", element: <Home /> },
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      // Publiczny profil użytkownika (cel kodu QR biletu)
      { path: "users/:userId", element: <PublicProfile /> },

      // AUTH
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <RegisterStudent /> },
          { path: "register-organizer", element: <RegisterOrganizer /> },
        ],
      },

      // --- STUDENT ---
      {
        path: "/student",
        element: (
          <ProtectedRoute allowedRoles={["Student"]}>
            <DashboardLayout role="Student" />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: "profile", element: <Profile /> },
          { path: "events", element: <EventBrowser /> },
          { path: "events/:id", element: <EventDetailsStudent /> },
          { path: "tickets", element: <MyTickets /> },
          { path: "tickets/:id", element: <TicketQRView /> },
          { path: "users/:userId", element: <PublicProfile /> },
        ],
      },

      // --- ORGANIZER ---
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
          { path: "events/:id/attendees", element: <AttendeeList /> },
          { path: "events/:id/edit", element: <EditEvent /> },
          { path: "profile", element: <Profile /> },
          { path: "users/:userId", element: <PublicProfile /> },
        ],
      },

      {
        path: "/organizer/scanner/:eventId",
        element: (
          <ProtectedRoute allowedRoles={["Organizer", "Admin"]}>
            <MobileScannerLayout />
          </ProtectedRoute>
        ),
        children: [{ index: true, element: <QRScanner /> }],
      },

      // --- ADMIN ---
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
          { path: "tokens", element: <Tokens /> },
          { path: "events", element: <AllEvents /> },
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
