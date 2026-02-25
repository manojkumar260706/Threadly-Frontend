import { useState, useEffect, useRef } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { vote as voteApi } from '../../api/votes';
import './VoteButton.css';

export default function VoteButton({ postId, upVotes = 0, downVotes = 0, userVoteType = null }) {
    const [currentVote, setCurrentVote] = useState(userVoteType);
    const [ups, setUps] = useState(upVotes);
    const [downs, setDowns] = useState(downVotes);
    const votingRef = useRef(false);

    // Sync state when the parent provides fresh data for this post
    useEffect(() => {
        if (!votingRef.current) {
            setCurrentVote(userVoteType);
            setUps(upVotes);
            setDowns(downVotes);
        }
    }, [postId, userVoteType, upVotes, downVotes]);

    async function handleVote(type) {
        if (votingRef.current) return;     // prevent double-fire
        votingRef.current = true;

        const prevVote = currentVote;
        const prevUps = ups;
        const prevDowns = downs;

        // Optimistic update
        if (currentVote === type) {
            setCurrentVote(null);
            if (type === 'UP') setUps(u => u - 1);
            else setDowns(d => d - 1);
        } else {
            if (currentVote === 'UP') setUps(u => u - 1);
            if (currentVote === 'DOWN') setDowns(d => d - 1);
            setCurrentVote(type);
            if (type === 'UP') setUps(u => u + 1);
            else setDowns(d => d + 1);
        }

        try {
            await voteApi(postId, type);
        } catch {
            setCurrentVote(prevVote);
            setUps(prevUps);
            setDowns(prevDowns);
        } finally {
            votingRef.current = false;
        }
    }

    const score = ups - downs;

    return (
        <div className="vote-button" onClick={e => e.stopPropagation()}>
            <button
                className={`vote-button__btn vote-button__btn--up ${currentVote === 'UP' ? 'vote-button__btn--active' : ''}`}
                onClick={() => handleVote('UP')}
                aria-label="Upvote"
            >
                <FiChevronUp />
            </button>
            <span className="vote-button__count">{score}</span>
            <button
                className={`vote-button__btn vote-button__btn--down ${currentVote === 'DOWN' ? 'vote-button__btn--active' : ''}`}
                onClick={() => handleVote('DOWN')}
                aria-label="Downvote"
            >
                <FiChevronDown />
            </button>
        </div>
    );
}
