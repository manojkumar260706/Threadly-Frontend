import { useState, useEffect } from 'react';
import { getUserProfile } from '../api/users';

// Simple in-memory cache for profile images
const profileCache = {};
const pendingRequests = {};

export function useProfileImage(username) {
    const [imageUrl, setImageUrl] = useState(() => profileCache[username] || null);

    useEffect(() => {
        if (!username) return;

        // Already cached
        if (profileCache[username] !== undefined) {
            setImageUrl(profileCache[username]);
            return;
        }

        // Deduplicate concurrent requests for the same user
        if (!pendingRequests[username]) {
            pendingRequests[username] = getUserProfile(username)
                .then(profile => {
                    profileCache[username] = profile.profileImageUrl || '';
                    return profileCache[username];
                })
                .catch(() => {
                    profileCache[username] = '';
                    return '';
                })
                .finally(() => {
                    delete pendingRequests[username];
                });
        }

        pendingRequests[username].then(url => setImageUrl(url));
    }, [username]);

    return imageUrl;
}
