import { get, post, del } from './client';

export function getFeed(page = 0, size = 10) {
    return get('/posts', { page, size });
}

export function getFollowingFeed(page = 0, size = 10) {
    return get('/posts/feed/following', { page, size });
}

export async function getTrendingFeed() {
    const posts = await get('/posts/feed/trending');
    // Endpoint returns a plain List, wrap into page-like shape
    return { content: posts || [], totalPages: 1 };
}

export function createPost(formData) {
    return post('/posts', formData);
}

export function getPostsByTag(tag, page = 0, size = 10) {
    return get(`/posts/tags/${encodeURIComponent(tag)}`, { page, size });
}

export function deletePost(postId) {
    return del(`/posts/${postId}`);
}

export function getTrendingTags(limit = 10) {
    return get('/tags/trending', { limit });
}

export function searchAll(q) {
    return get('/api/search', { q });
}
