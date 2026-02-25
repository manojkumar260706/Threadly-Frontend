import { useNavigate } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';
import VoteButton from '../VoteButton/VoteButton';
import TagChip from '../TagChip/TagChip';
import { formatRelativeTime } from '../../utils/time';
import { useProfileImage } from '../../hooks/useProfileImage';
import './PostCard.css';

export default function PostCard({ post }) {
    const navigate = useNavigate();

    const { id, title, content, imageUrl, upVotes, downVotes, userVoteType, author, createdAt, commentCount, tags } = post;
    const authorImage = useProfileImage(author);

    return (
        <article className="post-card" onClick={() => navigate(`/post/${id}`)} id={`post-${id}`}>
            <div className="post-card__votes">
                <VoteButton
                    postId={id}
                    upVotes={upVotes || 0}
                    downVotes={downVotes || 0}
                    userVoteType={userVoteType}
                />
            </div>
            <div className="post-card__body">
                <h2 className="post-card__title">{title}</h2>
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt=""
                        className="post-card__image"
                        loading="lazy"
                    />
                )}
                <p className="post-card__content">{content}</p>
                <div className="post-card__meta">
                    <span className="post-card__author">
                        <span className="post-card__author-avatar">
                            {authorImage ? (
                                <img src={authorImage} alt={author} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            ) : (
                                author?.charAt(0) || 'U'
                            )}
                        </span>
                        {author || 'Anonymous'}
                    </span>
                    <span className="post-card__dot" />
                    <time>{formatRelativeTime(createdAt)}</time>
                    <span className="post-card__dot" />
                    <span className="post-card__comments">
                        <FiMessageSquare size={14} />
                        {commentCount}
                    </span>
                </div>
                {tags && tags.length > 0 && (
                    <div className="post-card__tags">
                        {tags.map(t => (
                            <TagChip key={t} label={t} size="small" />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
