import { useState, useEffect, useRef } from 'react';
import { FiX, FiCode } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookF, FaXTwitter, FaRedditAlien, FaLinkedinIn } from 'react-icons/fa6';
import { HiOutlineMail } from 'react-icons/hi';
import './ShareModal.css';

const SHARE_OPTIONS = [
    {
        name: 'Embed',
        icon: FiCode,
        color: '#6b7280',
        action: (url, title) => {
            const embed = `<iframe src="${url}" title="${title}" width="600" height="400"></iframe>`;
            navigator.clipboard.writeText(embed);
        },
    },
    {
        name: 'WhatsApp',
        icon: FaWhatsapp,
        color: '#25D366',
        action: (url, title) => {
            window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        },
    },
    {
        name: 'Facebook',
        icon: FaFacebookF,
        color: '#1877F2',
        action: (url) => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        },
    },
    {
        name: 'X',
        icon: FaXTwitter,
        color: '#000000',
        action: (url, title) => {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        },
    },
    {
        name: 'Email',
        icon: HiOutlineMail,
        color: '#6b7280',
        action: (url, title) => {
            window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Check out this post: ' + url)}`, '_self');
        },
    },
    {
        name: 'Reddit',
        icon: FaRedditAlien,
        color: '#FF4500',
        action: (url, title) => {
            window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
        },
    },
    {
        name: 'LinkedIn',
        icon: FaLinkedinIn,
        color: '#0A66C2',
        action: (url) => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        },
    },
];

export default function ShareModal({ isOpen, onClose, url, title }) {
    const [copied, setCopied] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        setCopied(false);

        function handleEsc(e) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) onClose();
    }

    return (
        <div className="share-modal__overlay" onClick={handleOverlayClick}>
            <div className="share-modal" ref={modalRef}>
                <div className="share-modal__header">
                    <h3 className="share-modal__title">Share</h3>
                    <button className="share-modal__close" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="share-modal__options">
                    {SHARE_OPTIONS.map((opt) => (
                        <button
                            key={opt.name}
                            className="share-modal__option"
                            onClick={() => opt.action(url, title)}
                            title={opt.name}
                        >
                            <span
                                className="share-modal__icon"
                                style={{ background: opt.color }}
                            >
                                <opt.icon size={20} />
                            </span>
                            <span className="share-modal__label">{opt.name}</span>
                        </button>
                    ))}
                </div>

                <div className="share-modal__link-bar">
                    <input
                        className="share-modal__link-input"
                        type="text"
                        value={url}
                        readOnly
                        onClick={(e) => e.target.select()}
                    />
                    <button
                        className={`share-modal__copy-btn ${copied ? 'share-modal__copy-btn--copied' : ''}`}
                        onClick={handleCopy}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
}
