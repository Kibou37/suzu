'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { AdminMediaPicker } from '@/components/admin/AdminMediaPicker';
import { uploadMedia, type MediaFolder } from '@/lib/admin-api';
import { withBasePath } from '@/lib/base-path';

function resolvePreviewUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return withBasePath(url.startsWith('/') ? url : `/${url}`);
}

type AdminImageUploadProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  folder: MediaFolder;
};

export function AdminImageUpload({ label, hint, value, onChange, folder }: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const result = await uploadMedia(file, folder);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFiles(event.target.files);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="admin-image-field">
      <span className="admin-field__label">{label}</span>
      {hint && <p className="admin-image-field__hint">{hint}</p>}

      <div
        className="admin-image-upload"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        {value ? (
          <div className="admin-image-upload__preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolvePreviewUrl(value)} alt="" className="admin-image-upload__img" />
            <div className="admin-image-upload__preview-actions">
              <button type="button" className="btn btn-secondary" onClick={() => inputRef.current?.click()}>
                Replace
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>
                Library
              </button>
              <button type="button" className="admin-link-btn admin-link-btn--danger" onClick={() => onChange('')}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-image-upload__empty">
            <p className="admin-image-upload__text">Drop an image here or choose a file</p>
            <p className="admin-image-upload__meta">JPG, PNG, or WebP up to 5 MB</p>
            <div className="admin-image-upload__actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
              >
                {isUploading ? 'Uploading…' : 'Choose file'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>
                From library
              </button>
            </div>
          </div>
        )}
      </div>

      <label className="admin-image-field__url">
        <span className="admin-image-field__url-label">Or paste image URL</span>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://… or /uploads/cars/…"
          className="admin-field__input"
        />
      </label>

      {error && <p className="admin-image-field__error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="admin-image-upload__input"
        onChange={onInputChange}
      />

      <AdminMediaPicker
        open={pickerOpen}
        folder={folder}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
      />
    </div>
  );
}

type AdminImageGalleryProps = {
  label: string;
  hint?: string;
  images: string[];
  onChange: (images: string[]) => void;
  folder: MediaFolder;
};

export function AdminImageGallery({ label, hint, images, onChange, folder }: AdminImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadMedia(file, folder);
        uploaded.push(result.url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const next = [...images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  return (
    <div className="admin-image-field admin-image-field--full">
      <span className="admin-field__label">{label}</span>
      {hint && <p className="admin-image-field__hint">{hint}</p>}

      <div
        className="admin-image-upload admin-image-upload--gallery"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFiles(event.dataTransfer.files);
        }}
      >
        <div className="admin-image-upload__empty">
          <p className="admin-image-upload__text">Drop images here or choose files</p>
          <p className="admin-image-upload__meta">First image is used as the main catalog photo</p>
          <div className="admin-image-upload__actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? 'Uploading…' : 'Upload images'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>
              From library
            </button>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <ul className="admin-image-gallery">
          {images.map((url, index) => (
            <li key={`${url}-${index}`} className="admin-image-gallery__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolvePreviewUrl(url)} alt="" className="admin-image-gallery__img" />
              <div className="admin-image-gallery__meta">
                {index === 0 ? 'Main photo' : `Photo ${index + 1}`}
              </div>
              <div className="admin-image-gallery__actions">
                <button type="button" className="admin-link-btn" disabled={index === 0} onClick={() => move(index, -1)}>
                  Up
                </button>
                <button
                  type="button"
                  className="admin-link-btn"
                  disabled={index === images.length - 1}
                  onClick={() => move(index, 1)}
                >
                  Down
                </button>
                <button type="button" className="admin-link-btn admin-link-btn--danger" onClick={() => removeAt(index)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="admin-image-field__error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="admin-image-upload__input"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <AdminMediaPicker
        open={pickerOpen}
        folder={folder}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange([...images, url])}
      />
    </div>
  );
}
