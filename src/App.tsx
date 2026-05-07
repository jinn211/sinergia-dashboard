import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewProcess from './pages/NewProcess';
import ProcessDetail from './pages/ProcessDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/nuevo" element={<Layout><NewProcess /></Layout>} />
        <Route path="/proceso/:id" element={<Layout><ProcessDetail /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
