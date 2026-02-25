import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiArrowLeft, FiTrash2, FiShare2 } from 'react-icons/fi';
import { getFeed, deletePost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import VoteButton from '../components/VoteButton/VoteButton';
import CommentThread from '../components/CommentThread/CommentThread';
import { formatRelativeTime } from '../utils/time';
import { useProfileImage } from '../hooks/useProfileImage';
import ShareModal from '../components/ShareModal/ShareModal';
import './PostDetail.css';

export default function PostDetail() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPost();
    }, [postId]);

    async function loadPost() {
        try {
            // Since there's no single-post endpoint, we load feed and find the post
            // In a real app, you'd have a GET /posts/{id} endpoint
            const data = await getFeed(0, 50);
            const found = (data.content || []).find(p => p.id === parseInt(postId, 10));
            setPost(found || null);
        } catch (err) {
            console.error('Failed to load post:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm('Are you sure you want to delete this thread?')) return;
        try {
            await deletePost(postId);
            navigate('/');
        } catch (err) {
            console.error('Failed to delete post:', err);
        }
    }

    if (loading) {
        return (
            <div className="post-detail">
                <div style={{ color: 'var(--color-text-muted)', padding: 'var(--space-8)', textAlign: 'center' }}>
                    Loading thread...
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="post-detail">
                <button className="post-detail__back" onClick={() => navigate('/')}>
                    <FiArrowLeft /> Back to feed
                </button>
                <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Thread not found</p>
                    <p>It may have been deleted or doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="post-detail">
            <button className="post-detail__back" onClick={() => navigate('/')}>
                <FiArrowLeft /> Back to feed
            </button>

            <PostDetailContent post={post} user={user} onDelete={handleDelete} />

            <div className="post-detail__comments">
                <CommentThread postId={parseInt(postId, 10)} />
            </div>
        </div>
    );
}

function PostDetailContent({ post, user, onDelete }) {
    const authorImage = useProfileImage(post.author);
    const [showShareModal, setShowShareModal] = useState(false);

    return (
        <div className="post-detail__card">
            <div className="post-detail__header">
                <h1 className="post-detail__title">{post.title}</h1>
                <div className="post-detail__meta">
                    <Link to={`/user/${post.author}`} className="post-detail__author">
                        <span className="post-detail__author-avatar">
                            {authorImage ? (
                                <img src={authorImage} alt={post.author} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            ) : (
                                post.author?.charAt(0) || 'U'
                            )}
                        </span>
                        {post.author || 'Anonymous'}
                    </Link>
                    <span className="post-detail__dot" />
                    <span className="post-detail__time">{formatRelativeTime(post.createdAt)}</span>
                </div>
            </div>

            {post.imageUrl && (
                <img src={post.imageUrl} alt="" className="post-detail__image" loading="lazy" />
            )}

            <div className="post-detail__content markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                </ReactMarkdown>
            </div>

            <div className="post-detail__actions">
                <VoteButton
                    postId={post.id}
                    upVotes={post.upVotes || 0}
                    downVotes={post.downVotes || 0}
                    userVoteType={post.userVoteType}
                />
                <button className="post-detail__action-btn" onClick={() => setShowShareModal(true)}>
                    <FiShare2 /> Share
                </button>
                {user?.username === post.author && (
                    <button className="post-detail__action-btn post-detail__action-btn--danger" onClick={onDelete}>
                        <FiTrash2 /> Delete
                    </button>
                )}
            </div>

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                url={window.location.href}
                title={post.title}
            />
        </div>
    );
}
