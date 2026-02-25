import { useNavigate } from 'react-router-dom';
import './TagChip.css';

export default function TagChip({ label, size = 'default', onClick }) {
    const navigate = useNavigate();

    function handleClick(e) {
        e.stopPropagation();
        if (onClick) {
            onClick(e);
        } else {
            navigate(`/tags/${encodeURIComponent(label)}`);
        }
    }

    return (
        <span
            className={`tag-chip ${size === 'small' ? 'tag-chip--small' : ''} tag-chip--clickable`}
            onClick={handleClick}
        >
            {label}
        </span>
    );
}
