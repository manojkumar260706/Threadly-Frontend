import { get, post, del } from './client';

export function getComments(postId) {
    return get(`/posts/${postId}/comment`);
}

export function createComment(postId, comment) {
    return post(`/posts/${postId}/comment`, { comment });
}

export function deleteComment(postId, commentId) {
    return del(`/posts/${postId}/comment/${commentId}`);
}
