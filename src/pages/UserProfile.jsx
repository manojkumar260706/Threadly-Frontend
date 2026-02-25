import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiX, FiCamera, FiCheck } from 'react-icons/fi';
import { getUserProfile, getUserPosts, followUser, updateProfile } from '../api/users';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard/PostCard';
import { PostSkeletonList } from '../components/Skeleton/Skeleton';
import './UserProfile.css';

export default function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [following, setFollowing] = useState(false);

    // Edit profile state
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', bio: '' });
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const fileInputRef = useRef(null);

    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        loadProfile();
        loadPosts();
    }, [username]);

    useEffect(() => {
        loadPosts();
    }, [page]);

    async function loadProfile() {
        try {
            const data = await getUserProfile(username);
            setProfile(data);
            setFollowing(!!data.following);
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    }

    async function loadPosts() {
        setPostsLoading(true);
        try {
            const data = await getUserPosts(username, page, 10);
            setPosts(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error('Failed to load posts:', err);
            setPosts([]);
        } finally {
            setPostsLoading(false);
        }
    }

    async function handleFollow() {
        if (!profile?.id) return;
        const wasFollowing = following;
        // Optimistic update
        setFollowing(!wasFollowing);
        setProfile(prev => ({
            ...prev,
            followersCount: (prev.followersCount || 0) + (wasFollowing ? -1 : 1),
        }));
        try {
            await followUser(profile.id);
        } catch (err) {
            console.error('Follow failed:', err);
            // Revert on error
            setFollowing(wasFollowing);
            setProfile(prev => ({
                ...prev,
                followersCount: (prev.followersCount || 0) + (wasFollowing ? 1 : -1),
            }));
        }
    }

    function openEditForm() {
        setEditForm({
            username: profile?.username || '',
            bio: profile?.bio || '',
        });
        setEditImage(null);
        setEditImagePreview(profile?.profileImageUrl || null);
        setEditError('');
        setEditing(true);
    }

    function cancelEdit() {
        setEditing(false);
        setEditImage(null);
        setEditImagePreview(null);
        setEditError('');
    }

    function handleEditImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            setEditImage(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        setSaving(true);
        setEditError('');
        try {
            const formData = new FormData();
            if (editForm.username.trim()) {
                formData.append('username', editForm.username.trim());
            }
            formData.append('bio', editForm.bio.trim());
            if (editImage) {
                formData.append('image', editImage);
            }
            await updateProfile(formData);

            // Store message for login page, then logout
            localStorage.setItem('threadly_info', 'Profile updated! Please log in again to apply your changes.');
            logout();
            navigate('/login');
        } catch (err) {
            setEditError(err.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="user-profile">
                <div style={{ color: 'var(--color-text-muted)', padding: 'var(--space-8)', textAlign: 'center' }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="user-profile">
                <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>User not found</p>
                    <p>This profile doesn't exist or has been deleted.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-profile">
            <div className="user-profile__header">
                <div className="user-profile__avatar">
                    {profile.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt={profile.username} />
                    ) : (
                        profile.username?.charAt(0) || 'U'
                    )}
                </div>

                <div className="user-profile__info">
                    <h1 className="user-profile__name">{profile.username}</h1>
                    {profile.bio && <p className="user-profile__bio">{profile.bio}</p>}
                    <div className="user-profile__stats">
                        <div className="user-profile__stat">
                            <span className="user-profile__stat-value">{profile.followersCount || 0}</span>
                            <span className="user-profile__stat-label">Followers</span>
                        </div>
                        <div className="user-profile__stat">
                            <span className="user-profile__stat-value">{profile.followingCount || 0}</span>
                            <span className="user-profile__stat-label">Following</span>
                        </div>
                    </div>
                </div>

                <div className="user-profile__actions">
                    {isOwnProfile ? (
                        <button className="user-profile__edit-btn" onClick={openEditForm}>
                            <FiEdit2 style={{ marginRight: '4px' }} /> Edit Profile
                        </button>
                    ) : (
                        <button
                            className={`user-profile__follow-btn ${following ? 'user-profile__follow-btn--following' : ''}`}
                            onClick={handleFollow}
                        >
                            {following ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>

            {editing && (
                <form className="user-profile__edit-form" onSubmit={handleSaveProfile}>
                    <div className="user-profile__edit-header">
                        <h3 className="user-profile__edit-title">Edit Profile</h3>
                        <button type="button" className="user-profile__edit-close" onClick={cancelEdit}>
                            <FiX />
                        </button>
                    </div>

                    {editError && <div className="user-profile__edit-error">{editError}</div>}

                    <div className="user-profile__edit-avatar-section">
                        <div className="user-profile__edit-avatar">
                            {editImagePreview ? (
                                <img src={editImagePreview} alt="Preview" />
                            ) : (
                                <span>{editForm.username?.charAt(0) || 'U'}</span>
                            )}
                            <button
                                type="button"
                                className="user-profile__edit-avatar-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FiCamera />
                            </button>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageChange}
                            style={{ display: 'none' }}
                        />
                        <span className="user-profile__edit-avatar-hint">Click the camera icon to change</span>
                    </div>

                    <div className="user-profile__edit-field">
                        <label className="user-profile__edit-label" htmlFor="edit-username">Username</label>
                        <input
                            id="edit-username"
                            className="user-profile__edit-input"
                            type="text"
                            value={editForm.username}
                            onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Your username"
                            minLength={3}
                            maxLength={20}
                        />
                    </div>

                    <div className="user-profile__edit-field">
                        <label className="user-profile__edit-label" htmlFor="edit-bio">Bio</label>
                        <textarea
                            id="edit-bio"
                            className="user-profile__edit-textarea"
                            value={editForm.bio}
                            onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            maxLength={200}
                        />
                        <span className="user-profile__edit-char-count">{editForm.bio.length}/200</span>
                    </div>

                    <div className="user-profile__edit-actions">
                        <button type="button" className="user-profile__edit-cancel" onClick={cancelEdit}>
                            Cancel
                        </button>
                        <button type="submit" className="user-profile__edit-save" disabled={saving}>
                            <FiCheck style={{ marginRight: '4px' }} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}

            <div className="user-profile__tabs">
                <button className="user-profile__tab user-profile__tab--active">
                    Posts
                </button>
                <button className="user-profile__tab">
                    Activity
                </button>
            </div>

            {postsLoading ? (
                <PostSkeletonList count={3} />
            ) : posts.length === 0 ? (
                <div className="user-profile__empty">
                    {isOwnProfile ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
                </div>
            ) : (
                <div className="user-profile__posts stagger-children">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="home-feed__pagination">
                    <button
                        className="home-feed__page-btn"
                        onClick={() => setPage(p => p - 1)}
                        disabled={page === 0}
                    >
                        ← Previous
                    </button>
                    <span className="home-feed__page-info">Page {page + 1} of {totalPages}</span>
                    <button
                        className="home-feed__page-btn"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages - 1}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
