import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiImage, FiX } from 'react-icons/fi';
import { createPost } from '../api/posts';
import './CreatePost.css';

export default function CreatePost() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editorTab, setEditorTab] = useState('write');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    function removeImage() {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('content', content.trim());
            if (image) {
                formData.append('image', image);
            }

            await createPost(formData);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to create post.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="create-post">
            <div className="create-post__header">
                <h1 className="create-post__title">Create a Thread</h1>
                <p className="create-post__subtitle">Share your thoughts with the dev community</p>
            </div>

            {error && (
                <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'rgba(230,57,70,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                    {error}
                </div>
            )}

            <form className="create-post__form" onSubmit={handleSubmit}>
                <div className="create-post__field">
                    <label className="create-post__label" htmlFor="post-title">Title</label>
                    <input
                        id="post-title"
                        className="create-post__input create-post__input--title"
                        type="text"
                        placeholder="An interesting title..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        maxLength={200}
                    />
                </div>

                <div className="create-post__field">
                    <label className="create-post__label">Content</label>
                    <div className="create-post__editor-container">
                        <div className="create-post__editor-tabs">
                            <button
                                type="button"
                                className={`create-post__editor-tab ${editorTab === 'write' ? 'create-post__editor-tab--active' : ''}`}
                                onClick={() => setEditorTab('write')}
                            >
                                Write
                            </button>
                            <button
                                type="button"
                                className={`create-post__editor-tab ${editorTab === 'preview' ? 'create-post__editor-tab--active' : ''}`}
                                onClick={() => setEditorTab('preview')}
                            >
                                Preview
                            </button>
                        </div>

                        {editorTab === 'write' ? (
                            <textarea
                                className="create-post__textarea"
                                placeholder="Write your post content here... Markdown is supported!"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                            />
                        ) : (
                            <div className="create-post__preview markdown-content">
                                {content ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content}
                                    </ReactMarkdown>
                                ) : (
                                    <p style={{ color: 'var(--color-text-muted)' }}>Nothing to preview yet...</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="create-post__field">
                    <label className="create-post__label">Cover Image (optional)</label>
                    <div className="create-post__image-upload">
                        <label className="create-post__image-btn">
                            <FiImage />
                            {image ? 'Change Image' : 'Add Image'}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {imagePreview && (
                            <>
                                <img src={imagePreview} alt="Preview" className="create-post__image-preview" />
                                <button type="button" onClick={removeImage} style={{ color: 'var(--color-text-muted)' }}>
                                    <FiX />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="create-post__actions">
                    <button
                        type="button"
                        className="create-post__cancel-btn"
                        onClick={() => navigate('/')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="create-post__submit-btn"
                        disabled={!title.trim() || !content.trim() || submitting}
                    >
                        {submitting ? 'Publishing...' : 'Publish Thread'}
                    </button>
                </div>
            </form>
        </div>
    );
}
