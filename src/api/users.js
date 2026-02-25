import { get, put, post, del } from './client';

export function getUserProfile(username) {
    return get(`/users/${username}`);
}

export function getUserPosts(username, page = 0, size = 10) {
    return get(`/users/${username}/posts`, { page, size });
}

export function updateProfile(formData) {
    return put('/users/me', formData);
}

export function followUser(targetId) {
    return post(`/users/${targetId}/follow`);
}

export function deleteAccount() {
    return del('/users/me');
}
