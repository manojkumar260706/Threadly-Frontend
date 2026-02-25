import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHash } from 'react-icons/fi';
import { getPostsByTag } from '../api/posts';
import PostCard from '../components/PostCard/PostCard';
import { PostSkeletonList } from '../components/Skeleton/Skeleton';
import './HomeFeed.css';

export default function TagFeed() {
    const { tag } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        setPage(0);
    }, [tag]);

    useEffect(() => {
        loadPosts();
    }, [tag, page]);

    async function loadPosts() {
        setLoading(true);
        try {
            const data = await getPostsByTag(tag, page, 10);
            setPosts(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error('Failed to load posts for tag:', err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="home-feed">
            <div className="home-feed__header">
                <button className="post-detail__back" onClick={() => navigate('/')} style={{ marginBottom: 'var(--space-4)' }}>
                    <FiArrowLeft /> Back to feed
                </button>
                <h1 className="home-feed__title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <FiHash style={{ color: 'var(--color-primary)' }} />
                    {decodeURIComponent(tag)}
                </h1>
                <p className="home-feed__subtitle">
                    All threads tagged with <strong>{decodeURIComponent(tag)}</strong>
                </p>
            </div>

            {loading ? (
                <div className="home-feed__list">
                    <PostSkeletonList count={5} />
                </div>
            ) : posts.length === 0 ? (
                <div className="home-feed__empty">
                    <div className="home-feed__empty-icon">🏷️</div>
                    <div className="home-feed__empty-title">No threads with this tag</div>
                    <p>Be the first to post something with <strong>#{decodeURIComponent(tag)}</strong>!</p>
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
