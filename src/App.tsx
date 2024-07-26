import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import LoginLayout from './Layout/LoginLayout';

// Pages Components
import { HomePage } from './Pages/HomePage';
import { ThankYou } from './Pages/ThankYou';
import ContactDetails from './Pages/ContactDetails';
import UploadImages from './Pages/UploadImages';
import FamilyDetails from './Pages/FamilyDetails';
import EduDetails from './Pages/EduDetails';
import HoroDetails from './Pages/HoroDetails';
import PartnerSettings from './Pages/PartnerSettings';
import { MembershipPlan } from './Pages/MembershipPlan';
import { PayNow } from './Pages/PayNow';
import { ThankYouReg } from './Pages/ThankYouReg';
import { LoginHome } from './Pages/AfterLogin/LoginHome';
import Search from './Pages/AfterLogin/Search';
import { DashBoard } from './Pages/AfterLogin/DashBoard';
import { Wishlist } from './Pages/AfterLogin/Wishlist';
import { Messages } from './Pages/AfterLogin/Messages';
import { MyProfile } from './Pages/AfterLogin/MyProfile';
import ProtectedRoute from './Components/ProtectedRoute'; // Adjust the path as necessary

function App() {
  const token = sessionStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={token ? <Navigate to="/LoginHome" replace /> : <HomePage />}
          />
          <Route path="/ThankYou" element={<ThankYou />} />
          <Route path="/ContactDetails" element={<ContactDetails />} />
          <Route path="/UploadImages" element={<UploadImages />} />
          <Route path="/FamilyDetails" element={<FamilyDetails />} />
          <Route path="/EduDetails" element={<EduDetails />} />
          <Route path="/HoroDetails" element={<HoroDetails />} />
          <Route path="/PartnerSettings" element={<PartnerSettings />} />
          <Route path="/MembershipPlan" element={<MembershipPlan />} />
          <Route path="/PayNow" element={<PayNow />} />
          <Route path="/ThankYouReg" element={<ThankYouReg />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute redirectTo="/" />}>
          <Route element={<LoginLayout />}>
            <Route path="/LoginHome" element={<LoginHome />} />
            <Route path="/Search" element={<Search />} />
            <Route path="/DashBoard" element={<DashBoard />} />
            <Route path="/Wishlist" element={<Wishlist />} />
            <Route path="/Messages" element={<Messages />} />
            <Route path="/MyProfile" element={<MyProfile />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route
          path="*"
          element={<Navigate to={token ? "/LoginHome" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
