import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InputPage from './pages/InputPage';
import ResultLayout from './pages/result/ResultLayout';
import MyDashboard from './pages/result/MyDashboard';
import ConstellationOverview from './pages/result/ConstellationOverview';
import RelationshipChart from './pages/result/RelationshipChart';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InputPage />} />
        <Route path="/result" element={<ResultLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MyDashboard />} />
          <Route path="overview" element={<ConstellationOverview />} />
          <Route path="chart" element={<RelationshipChart />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
