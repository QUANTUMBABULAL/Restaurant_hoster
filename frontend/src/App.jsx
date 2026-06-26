import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Orders from './pages/dashboard/Orders';
import Menu from './pages/dashboard/Menu';
import Categories from './pages/dashboard/Categories';
import Tables from './pages/dashboard/Tables';
import Offers from './pages/dashboard/Offers';
import Analytics from './pages/dashboard/Analytics';
import Settings from './pages/dashboard/Settings';
import CustomerMenu from './pages/customer/CustomerMenu';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/menu" element={<CustomerMenu />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="menu" element={<Menu />} />
            <Route path="categories" element={<Categories />} />
            <Route path="tables" element={<Tables />} />
            <Route path="offers" element={<Offers />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
