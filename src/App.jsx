import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SmoothScroll from "./components/SmoothScroll";
import AdminPage from "./pages/AdminPage";

/* Top-level routing. The URL decides which page is open, so a refresh stays on the same page.
   AdminPage owns the sidebar and every dashboard page (lazy loaded). */
export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/*" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
