import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Layout } from './components/Layout';
import { Listings } from './pages/Listings';
import { ListingDetail } from './pages/ListingDetail';
import { MyBookings } from './pages/MyBookings';
import { Dashboard } from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Listings />} />
            <Route path="listings/:id" element={<ListingDetail />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
