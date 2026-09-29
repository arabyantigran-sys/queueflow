import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { BookingPage } from './pages/booking/BookingPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { CalendarPage } from './pages/admin/CalendarPage';
import { QueuePage } from './pages/admin/QueuePage';
import { AppointmentsPage } from './pages/admin/AppointmentsPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { EmployeesPage } from './pages/admin/EmployeesPage';
import { ServicesPage } from './pages/admin/ServicesPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { QRPage } from './pages/admin/QRPage';
import { BillingPage } from './pages/admin/BillingPage';
import { SettingsPage } from './pages/admin/SettingsPage';

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="qr" element={<QRPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
