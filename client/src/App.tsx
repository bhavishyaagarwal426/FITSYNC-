import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AdminRoute from '@/components/common/AdminRoute';
import AuthLayout from '@/components/layout/AuthLayout';

// Lazy loaded pages - they will be built by the pages agent
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Wardrobe = lazy(() => import('@/pages/Wardrobe'));
const WardrobeUpload = lazy(() => import('@/pages/WardrobeUpload'));
const WardrobeItem = lazy(() => import('@/pages/WardrobeItem'));
const StyleMe = lazy(() => import('@/pages/StyleMe'));
const OutfitView = lazy(() => import('@/pages/OutfitView'));
const BucketList = lazy(() => import('@/pages/BucketList'));
const Explore = lazy(() => import('@/pages/Explore'));
const ExploreDetail = lazy(() => import('@/pages/ExploreDetail'));
const Community = lazy(() => import('@/pages/Community'));
const CommunityCreate = lazy(() => import('@/pages/CommunityCreate'));
const CommunityPost = lazy(() => import('@/pages/CommunityPost'));
const SavedOutfits = lazy(() => import('@/pages/SavedOutfits'));
const Collections = lazy(() => import('@/pages/Collections'));
const CollectionDetail = lazy(() => import('@/pages/CollectionDetail'));
const History = lazy(() => import('@/pages/History'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const Admin = lazy(() => import('@/pages/Admin'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const PrivacyConsent = lazy(() => import('@/pages/PrivacyConsent'));
const PrivacyDownload = lazy(() => import('@/pages/PrivacyDownload'));
const PrivacyDelete = lazy(() => import('@/pages/PrivacyDelete'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Cookies = lazy(() => import('@/pages/Cookies'));
const About = lazy(() => import('@/pages/About'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-burgundy-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-charcoal-400 font-medium">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/about" element={<About />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Onboarding */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>

        {/* Protected app pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/wardrobe/upload" element={<WardrobeUpload />} />
          <Route path="/wardrobe/:id" element={<WardrobeItem />} />
          <Route path="/style-me" element={<StyleMe />} />
          <Route path="/outfit/:id" element={<OutfitView />} />
          <Route path="/bucket-list" element={<BucketList />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:id" element={<ExploreDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/create" element={<CommunityCreate />} />
          <Route path="/community/:id" element={<CommunityPost />} />
          <Route path="/saved-outfits" element={<SavedOutfits />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/privacy/consent" element={<PrivacyConsent />} />
          <Route path="/privacy/download" element={<PrivacyDownload />} />
          <Route path="/privacy/delete" element={<PrivacyDelete />} />

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
