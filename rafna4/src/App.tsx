import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import ScrollToTop from "./components/ScrollToTop";
import RequireAdmin from "./components/RequireAdmin";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public storefront */}
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="/shop" element={<Shop />} />
        </Route>

        {/* Admin — login first, dashboard guarded by a live session check */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
