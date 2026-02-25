import { post } from './client';

export function vote(postId, voteType) {
    return post(`/posts/${postId}/vote?voteType=${voteType}`);
}
