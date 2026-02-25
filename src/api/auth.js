import { get, post, BACKEND_URL } from './client';

export async function login(username, password) {
    return post('/auth/login', { username, password });
}

export async function register(data) {
    return post('/auth/register', data);
}

export function getGoogleOAuthUrl() {
    return `${BACKEND_URL}/oauth2/authorization/google`;
}

export function getGithubOAuthUrl() {
    return `${BACKEND_URL}/oauth2/authorization/github`;
}
