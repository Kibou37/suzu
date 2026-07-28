'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import {
  mediaApi,
  uploadMedia,
  type MediaAsset,
  type MediaFolder,
} from '@/lib/admin-api';
import { withBasePath } from '@/lib/base-path';

function resolvePreviewUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return withBasePath(url.startsWith('/') ? url : `/${url}`);
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

type AdminMediaPickerProps = {
  open: boolean;
  folder: MediaFolder;
  onClose: () => void;
  onSelect: (url: string) => void;
};

export function AdminMediaPicker({ open, folder, onClose, onSelect }: AdminMediaPickerProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      setItems(await mediaApi.list(folder));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, folder]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await uploadMedia(file, folder);
      onSelect(uploaded.url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  if (!open) return null;

  const filtered = items.filter((item) => {
    const haystack = `${item.originalName ?? ''} ${item.filename} ${item.url}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="admin-media-picker" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="admin-media-picker__backdrop" aria-label="Close" onClick={onClose} />
      <div className="admin-media-picker__dialog">
        <div className="admin-media-picker__head">
          <h2 id={titleId} className="admin-media-picker__title">
            Media library
          </h2>
          <button type="button" className="admin-link-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="admin-media-picker__toolbar">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files…"
            className="admin-field__input"
          />
          <button
            type="button"
            className="btn btn-secondary"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? 'Uploading…' : 'Upload new'}
          </button>
        </div>

        {error && <p className="admin-alert">{error}</p>}

        {isLoading ? (
          <p className="admin-empty">Loading media…</p>
        ) : filtered.length === 0 ? (
          <p className="admin-empty">No images in this folder yet. Upload one to get started.</p>
        ) : (
          <ul className="admin-media-picker__grid">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="admin-media-picker__item"
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolvePreviewUrl(item.url)} alt="" className="admin-media-picker__img" />
                  <span className="admin-media-picker__meta">
                    {item.originalName || item.filename}
                    <small>{formatBytes(item.size)}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="admin-image-upload__input"
          onChange={handleUpload}
        />
      </div>
    </div>
  );
}
