import { get } from './client';

export function getNotifications() {
    return get('/notifications');
}
