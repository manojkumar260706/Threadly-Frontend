import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/LoginPage';
import HomeFeed from './pages/HomeFeed';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import UserProfile from './pages/UserProfile';
import TagFeed from './pages/TagFeed';
import SearchResults from './pages/SearchResults';
import OAuthCallback from './pages/OAuthCallback';
import './styles/global.css';

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/oauth/callback" element={<OAuthCallback />} />

                        <Route
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<HomeFeed />} />
                            <Route path="/following" element={<HomeFeed />} />
                            <Route path="/trending" element={<HomeFeed />} />
                            <Route path="/create" element={<CreatePost />} />
                            <Route path="/post/:postId" element={<PostDetail />} />
                            <Route path="/user/:username" element={<UserProfile />} />
                            <Route path="/tags/:tag" element={<TagFeed />} />
                            <Route path="/search" element={<SearchResults />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
