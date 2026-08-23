import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Live } from "./pages/Live";
import { Proof } from "./pages/Proof";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
      <Routes>
        <Route path="/" element={<Live />} />
        <Route path="/proof" element={<Proof />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
