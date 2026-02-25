import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFeed, getFollowingFeed, getTrendingFeed } from '../api/posts';
import PostCard from '../components/PostCard/PostCard';
import { PostSkeletonList } from '../components/Skeleton/Skeleton';
import './HomeFeed.css';

const GREETINGS = [
    { title: 'Your Feed', subtitle: 'Stay up to date with the dev community' },
    { title: 'What\'s New?', subtitle: 'Catch up on the latest threads from devs like you' },
    { title: 'Welcome Back!', subtitle: 'Here\'s what you missed while you were away' },
    { title: 'Hey, Dev! 👋', subtitle: 'Dive into today\'s hottest discussions' },
    { title: 'Fresh Threads', subtitle: 'New ideas and conversations are waiting for you' },
    { title: 'Good to See You!', subtitle: 'The community has been buzzing — check it out' },
    { title: 'Let\'s Go! 🚀', subtitle: 'Explore what the dev world is talking about' },
    { title: 'Dev Central', subtitle: 'Your one-stop feed for everything tech' },
    { title: 'Code & Connect', subtitle: 'Share, learn, and grow with fellow developers' },
    { title: 'What\'s Trending?', subtitle: 'See what\'s sparking conversation right now' },
];

const TABS = [
    { id: 'all', path: '/', label: 'All Posts' },
    { id: 'following', path: '/following', label: 'Following' },
    { id: 'trending', path: '/trending', label: 'Trending' },
];

function getTabFromPath(pathname) {
    if (pathname === '/following') return 'following';
    if (pathname === '/trending') return 'trending';
    return 'all';
}

function getFetcher(tab) {
    if (tab === 'following') return getFollowingFeed;
    if (tab === 'trending') return getTrendingFeed;
    return getFeed;
}

export default function HomeFeed() {
    const location = useLocation();
    const navigate = useNavigate();
    const activeTab = getTabFromPath(location.pathname);

    const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        setPage(0);
    }, [activeTab]);

    useEffect(() => {
        loadPosts();
    }, [activeTab, page]);

    async function loadPosts() {
        setLoading(true);
        try {
            const fetcher = getFetcher(activeTab);
            const data = await fetcher(page, 10);
            setPosts(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error('Failed to load posts:', err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }

    function handleTabChange(tab) {
        navigate(tab.path);
    }

    return (
        <div className="home-feed">
            <div className="home-feed__header">
                <h1 className="home-feed__title">{greeting.title}</h1>
                <p className="home-feed__subtitle">{greeting.subtitle}</p>
            </div>

            <div className="home-feed__tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`home-feed__tab ${activeTab === tab.id ? 'home-feed__tab--active' : ''}`}
                        onClick={() => handleTabChange(tab)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="home-feed__list">
                    <PostSkeletonList count={5} />
                </div>
            ) : posts.length === 0 ? (
                <div className="home-feed__empty">
                    <div className="home-feed__empty-icon">📭</div>
                    <div className="home-feed__empty-title">No threads yet</div>
                    <p>Be the first to start a conversation!</p>
                </div>
            ) : (
                <>
                    <div className="home-feed__list stagger-children">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="home-feed__pagination">
                            <button
                                className="home-feed__page-btn"
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 0}
                            >
                                ← Previous
                            </button>
                            <span className="home-feed__page-info">
                                Page {page + 1} of {totalPages}
                            </span>
                            <button
                                className="home-feed__page-btn"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages - 1}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

