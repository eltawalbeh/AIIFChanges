import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import BoardPage from './pages/public/BoardPage';
import MediaCenterPage from './pages/public/MediaCenterPage';
import ContactPage from './pages/public/ContactPage';
import MediaListPage from './pages/public/MediaListPage';
import MediaArticlePage from './pages/public/MediaArticlePage';
import CmsDashboardPage from './pages/cms/CmsDashboardPage';
import CmsCollectionPage from './pages/cms/CmsCollectionPage';
import CmsLeadershipPage from './pages/cms/CmsLeadershipPage';
import CmsMediaPage from './pages/cms/CmsMediaPage';
import CmsContactPage from './pages/cms/CmsContactPage';
import CmsPagesPage from './pages/cms/CmsPagesPage';
import CmsGlobalSettingsPage from './pages/cms/CmsGlobalSettingsPage';
import CmsUsersPage from './pages/cms/CmsUsersPage';
import LoginPage from './pages/cms/LoginPage';
import { RequireAdmin } from './context/AuthContext';

export default function AppRoutes(){return <Routes>
  <Route path="/" element={<HomePage/>}/>
  <Route path="/about-us" element={<AboutPage/>}/>
  <Route path="/board" element={<BoardPage/>}/>
  <Route path="/media-center" element={<MediaCenterPage/>}/>
  <Route path="/contact-us" element={<ContactPage/>}/>
  <Route path="/media-center/item/:slug" element={<MediaArticlePage/>}/>
  <Route path="/media-center/:type" element={<MediaListPage/>}/>
  <Route path="/cms/login" element={<LoginPage/>}/>
  <Route path="/cms" element={<RequireAdmin><CmsDashboardPage/></RequireAdmin>}/>
  <Route path="/cms/leadership" element={<RequireAdmin><CmsLeadershipPage/></RequireAdmin>}/>
  <Route path="/cms/media" element={<RequireAdmin><CmsMediaPage/></RequireAdmin>}/>
  <Route path="/cms/contact" element={<RequireAdmin><CmsContactPage/></RequireAdmin>}/>
  <Route path="/cms/pages" element={<RequireAdmin><CmsPagesPage/></RequireAdmin>}/>
  <Route path="/cms/about" element={<RequireAdmin><Navigate to="/cms/pages?page=about-us" replace/></RequireAdmin>}/>
  <Route path="/cms/brand" element={<RequireAdmin><CmsGlobalSettingsPage/></RequireAdmin>}/>
  <Route path="/cms/users" element={<RequireAdmin><CmsUsersPage/></RequireAdmin>}/>
  <Route path="/cms/:collection(brand|pages|about|leadership|media|contact|users)" element={<RequireAdmin><CmsCollectionPage/></RequireAdmin>}/>
</Routes>}
