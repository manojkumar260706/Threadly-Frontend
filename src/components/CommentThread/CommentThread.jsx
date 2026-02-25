import { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { getComments, createComment, deleteComment } from '../../api/comments';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/time';
import './CommentThread.css';

export default function CommentThread({ postId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComments();
    }, [postId]);

    async function loadComments() {
        try {
            const data = await getComments(postId);
            setComments(data || []);
        } catch {
            setComments([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const comment = await createComment(postId, newComment.trim());
            setComments(prev => [...prev, comment]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to post comment:', err);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(commentId) {
        try {
            await deleteComment(postId, commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    }

    if (loading) {
        return <div style={{ color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>Loading comments...</div>;
    }

    return (
        <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
                Comments ({comments.length})
            </h3>

            <div className="comment-thread stagger-children">
                {comments.length === 0 && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                        No comments yet. Be the first to join the discussion!
                    </p>
                )}
                {comments.map(comment => (
                    <div key={comment.id} className="comment">
                        <div className="comment__avatar">
                            {comment.profileImageUrl ? (
                                <img src={comment.profileImageUrl} alt={comment.authorUsername} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            ) : (
                                comment.authorUsername?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className="comment__body">
                            <div className="comment__header">
                                <span className="comment__author">{comment.authorUsername}</span>
                                <span className="comment__time">{formatRelativeTime(comment.createdAt)}</span>
                            </div>
                            <p className="comment__content">{comment.content}</p>
                            <div className="comment__actions">
                                {user?.username === comment.authorUsername && (
                                    <button
                                        className="comment__action-btn"
                                        onClick={() => handleDelete(comment.id)}
                                    >
                                        <FiTrash2 size={12} /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <form className="comment-form" onSubmit={handleSubmit}>
                <textarea
                    className="comment-form__input"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    rows={1}
                />
                <button
                    type="submit"
                    className="comment-form__submit"
                    disabled={!newComment.trim() || submitting}
                >
                    {submitting ? 'Posting...' : 'Comment'}
                </button>
            </form>
        </div>
    );
}
