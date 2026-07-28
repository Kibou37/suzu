'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  AdminAlert,
  AdminEmpty,
  AdminPageActions,
  AdminPageHeader,
  AdminToolbar,
} from '@/components/admin/AdminUi';
import {
  mediaApi,
  uploadMedia,
  type MediaAsset,
  type MediaFolder,
} from '@/lib/admin-api';
import { withBasePath } from '@/lib/base-path';

const FOLDERS: Array<{ value: MediaFolder | ''; label: string }> = [
  { value: '', label: 'All folders' },
  { value: 'banners', label: 'Banners' },
  { value: 'cars', label: 'Cars' },
  { value: 'blog', label: 'Blog' },
  { value: 'promotions', label: 'Promotions' },
];

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

export function MediaLibraryPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState<MediaFolder | ''>('banners');
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      setItems(await mediaApi.list(folder || undefined));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    const targetFolder: MediaFolder = folder || 'cars';
    setIsUploading(true);
    setError(null);
    setNotice(null);

    try {
      for (const file of Array.from(files)) {
        await uploadMedia(file, targetFolder);
      }
      await load();
      setNotice(`Uploaded ${files.length} file${files.length === 1 ? '' : 's'} to ${targetFolder}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete(item: MediaAsset) {
    if (!confirm(`Delete ${item.originalName || item.filename}?`)) return;
    try {
      const result = await mediaApi.remove(item.id);
      setNotice(result.warning ?? 'File deleted');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  }

  const filtered = items.filter((item) => {
    const haystack = `${item.originalName ?? ''} ${item.filename} ${item.folder}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div>
      <AdminPageHeader
        title="Media library"
        description="Upload once and reuse images across banners, cars, blog and promotions."
      />

      <AdminPageActions>
        <button
          type="button"
          className="btn btn-primary"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? 'Uploading…' : 'Upload images'}
        </button>
      </AdminPageActions>

      {error && <AdminAlert message={error} />}
      {notice && <p className="admin-notice">{notice}</p>}

      <AdminToolbar>
        <label className="admin-field">
          <span className="admin-field__label">Folder</span>
          <select
            value={folder}
            onChange={(event) => setFolder(event.target.value as MediaFolder | '')}
            className="admin-field__select"
          >
            {FOLDERS.map((item) => (
              <option key={item.value || 'all'} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="admin-field__input"
            placeholder="Filename…"
          />
        </label>
      </AdminToolbar>

      {isLoading ? (
        <AdminEmpty>Loading media…</AdminEmpty>
      ) : filtered.length === 0 ? (
        <AdminEmpty>No media files found in this folder.</AdminEmpty>
      ) : (
        <ul className="admin-media-grid">
          {filtered.map((item) => (
            <li key={item.id} className="admin-media-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolvePreviewUrl(item.url)} alt="" className="admin-media-card__img" />
              <div className="admin-media-card__body">
                <p className="admin-media-card__name">{item.originalName || item.filename}</p>
                <p className="admin-media-card__meta">
                  {item.folder} · {formatBytes(item.size)}
                </p>
                <p className="admin-media-card__url">{item.url}</p>
                <div className="admin-media-card__actions">
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => {
                      void navigator.clipboard.writeText(item.url);
                      setNotice('URL copied');
                    }}
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    className="admin-link-btn admin-link-btn--danger"
                    onClick={() => void handleDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="admin-image-upload__input"
        onChange={handleUpload}
      />
    </div>
  );
}
