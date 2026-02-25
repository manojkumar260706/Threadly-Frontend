import './Skeleton.css';

export function PostSkeleton() {
    return (
        <div className="skeleton-post">
            <div className="skeleton-post__votes">
                <div className="skeleton" />
                <div className="skeleton" style={{ width: 20, height: 16 }} />
                <div className="skeleton" />
            </div>
            <div className="skeleton-post__body">
                <div className="skeleton skeleton-post__title" />
                <div className="skeleton skeleton-post__content" />
                <div className="skeleton skeleton-post__content" />
                <div className="skeleton skeleton-post__meta" />
            </div>
        </div>
    );
}

export function PostSkeletonList({ count = 5 }) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <PostSkeleton key={i} />
            ))}
        </>
    );
}
