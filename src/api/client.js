const BASE_URL = '/api';
const BACKEND_URL = 'https://threadly-backend-vmvj.onrender.com';

function getToken() {
    return localStorage.getItem('threadly_token');
}

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = { ...options.headers };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('threadly_token');
        localStorage.removeItem('threadly_user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(errorBody || `HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

export function get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return request(url, { method: 'GET' });
}

export function post(endpoint, body) {
    const options = { method: 'POST' };
    if (body instanceof FormData) {
        options.body = body;
    } else if (body) {
        options.body = JSON.stringify(body);
    }
    return request(endpoint, options);
}

export function put(endpoint, body) {
    const options = { method: 'PUT' };
    if (body instanceof FormData) {
        options.body = body;
    } else if (body) {
        options.body = JSON.stringify(body);
    }
    return request(endpoint, options);
}

export function del(endpoint) {
    return request(endpoint, { method: 'DELETE' });
}

export { BASE_URL, BACKEND_URL, getToken };
