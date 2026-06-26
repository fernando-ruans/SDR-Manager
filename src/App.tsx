import { Navigate, Route, Routes } from 'react-router-dom';
import { HomeRoute } from './routes/HomeRoute';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/station/:stationId" element={<HomeRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}