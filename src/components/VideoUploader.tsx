'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/lib/toast';

interface VideoUploaderProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
}

export default function VideoUploader({ onUpload, currentUrl }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const upload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      addToast('Please select a video file', 'error');
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      const result = await new Promise<{ url: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try { reject(new Error(JSON.parse(xhr.responseText).error)); }
            catch { reject(new Error('Upload failed')); }
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      onUpload(result.url);
      addToast('Video uploaded successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <label className="block text-gray-400 text-[10px] uppercase tracking-wider mb-1">Upload Video</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          dragOver ? 'border-ufc-red bg-ufc-red/5' : uploading ? 'border-ufc-red/50 bg-ufc-red/5' : 'border-gray-700 hover:border-gray-500 bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
      >
        <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/mkv,video/quicktime,video/x-msvideo" onChange={handleFile} className="hidden" />

        {uploading ? (
          <div className="space-y-2">
            <div className="w-8 h-8 border-2 border-ufc-red border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-ufc-red text-xs font-semibold">Uploading... {progress}%</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 max-w-xs mx-auto">
              <div className="bg-ufc-red h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-500 text-xs">Drop a video file or click to browse</p>
            <p className="text-gray-600 text-[10px]">MP4, WebM, MOV up to 500MB</p>
          </div>
        )}
      </div>

      {currentUrl && !uploading && (
        <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-xl px-3 py-2">
          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          <span className="text-green-400 text-[10px] truncate flex-1">{currentUrl.split('/').pop()}</span>
        </div>
      )}
    </div>
  );
}
