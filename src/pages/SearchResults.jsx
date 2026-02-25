import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiHash, FiUser } from 'react-icons/fi';
import { searchAll } from '../api/posts';
import PostCard from '../components/PostCard/PostCard';
import TagChip from '../components/TagChip/TagChip';
import { PostSkeletonList } from '../components/Skeleton/Skeleton';
import { useProfileImage } from '../hooks/useProfileImage';
import './SearchResults.css';

function UserCard({ profile }) {
    const avatarUrl = useProfileImage(profile.username);

    return (
        <Link to={`/user/${profile.username}`} className="search-user-card">
            <div className="search-user-card__avatar">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={profile.username} />
                ) : (
                    profile.username?.charAt(0) || 'U'
                )}
            </div>
            <div className="search-user-card__info">
                <span className="search-user-card__name">{profile.username}</span>
                {profile.bio && (
                    <span className="search-user-card__bio">{profile.bio}</span>
                )}
            </div>
        </Link>
    );
}

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const navigate = useNavigate();

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [localQuery, setLocalQuery] = useState(query);

    useEffect(() => {
        setLocalQuery(query);
        if (query.trim()) {
            performSearch(query);
        } else {
            setResults(null);
        }
    }, [query]);

    async function performSearch(q) {
        setLoading(true);
        try {
            const data = await searchAll(q);
            setResults(data);
        } catch (err) {
            console.error('Search failed:', err);
            setResults({ posts: [], userProfiles: [], hashTags: [] });
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (localQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
        }
    }

    const hasPosts = results?.posts?.length > 0;
    const hasUsers = results?.userProfiles?.length > 0;
    const hasTags = results?.hashTags?.length > 0;
    const hasAnyResults = hasPosts || hasUsers || hasTags;

    return (
        <div className="search-results">
            <div className="search-results__header">
                <h1 className="search-results__title">
                    <FiSearch style={{ color: 'var(--color-primary)' }} />
                    Search
                </h1>
                <form className="search-results__form" onSubmit={handleSubmit}>
                    <FiSearch className="search-results__input-icon" />
                    <input
                        type="text"
                        className="search-results__input"
                        placeholder="Search threads, tags, people..."
                        value={localQuery}
                        onChange={e => setLocalQuery(e.target.value)}
                        autoFocus
                    />
                </form>
                {query && !loading && (
                    <p className="search-results__subtitle">
                        Results for <strong>"{query}"</strong>
                    </p>
                )}
            </div>

            {loading ? (
                <div className="search-results__section">
                    <PostSkeletonList count={3} />
                </div>
            ) : !query ? (
                <div className="search-results__empty">
                    <div className="search-results__empty-icon">🔍</div>
                    <div className="search-results__empty-title">Start searching</div>
                    <p>Find threads, people, and tags across Threadly</p>
                </div>
            ) : !hasAnyResults ? (
                <div className="search-results__empty">
                    <div className="search-results__empty-icon">😕</div>
                    <div className="search-results__empty-title">No results found</div>
                    <p>Try different keywords or check your spelling</p>
                </div>
            ) : (
                <>
                    {hasTags && (
                        <div className="search-results__section">
                            <h2 className="search-results__section-title">
                                <FiHash /> Tags
                            </h2>
                            <div className="search-results__tags">
                                {results.hashTags.map(tag => (
                                    <TagChip key={tag} label={tag} />
                                ))}
                            </div>
                        </div>
                    )}

                    {hasUsers && (
                        <div className="search-results__section">
                            <h2 className="search-results__section-title">
                                <FiUser /> People
                            </h2>
                            <div className="search-results__users">
                                {results.userProfiles.map(profile => (
                                    <UserCard key={profile.username} profile={profile} />
                                ))}
                            </div>
                        </div>
                    )}

                    {hasPosts && (
                        <div className="search-results__section">
                            <h2 className="search-results__section-title">
                                Threads
                            </h2>
                            <div className="home-feed__list stagger-children">
                                {results.posts.map(post => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
