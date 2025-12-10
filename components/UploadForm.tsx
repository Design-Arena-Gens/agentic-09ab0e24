'use client';

import { useCallback, useMemo, useState } from 'react';

type UploadResponse = {
  success: boolean;
  message?: string;
  summary?: UploadSummary;
};

type UploadSummary = {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  thumbnailPrompt: string;
  scheduledPublishAt?: string | null;
  youtubeId?: string;
  youtubeUrl?: string;
};

const categories = [
  { value: 'tech', label: 'Tech' },
  { value: 'vlog', label: 'Vlog' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'tutorial', label: 'Tutorial' }
];

const monetizationOptions = [
  { value: 'enabled', label: 'Enable Monetization' },
  { value: 'disabled', label: 'Disable Monetization' },
  { value: 'limited', label: 'Limited Ads' }
];

export default function UploadForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('tech');
  const [language, setLanguage] = useState('en');
  const [monetization, setMonetization] = useState('enabled');
  const [schedule, setSchedule] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadSummary | null>(null);

  const canSubmit = useMemo(() => {
    if (uploading) return false;
    if (!videoFile && !videoUrl) return false;
    if (videoFile && videoUrl) return false;
    return Boolean(category && language && monetization);
  }, [uploading, videoFile, videoUrl, category, language, monetization]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus(null);
      setResult(null);

      if (!canSubmit) {
        setStatus('Provide exactly one video source: either a file or URL.');
        return;
      }

      const formData = new FormData();
      if (videoFile) {
        formData.append('videoFile', videoFile);
      }
      if (videoUrl) {
        formData.append('videoUrl', videoUrl.trim());
      }
      formData.append('category', category);
      formData.append('language', language.trim());
      formData.append('monetization', monetization);
      if (schedule) {
        formData.append('scheduleTime', schedule);
      }

      setUploading(true);
      try {
        const response = await fetch('/api/process', {
          method: 'POST',
          body: formData
        });

        const payload: UploadResponse = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Upload failed.');
        }

        setResult(payload.summary ?? null);
        setStatus('Upload complete.');
      } catch (error) {
        if (error instanceof Error) {
          setStatus(error.message);
        } else {
          setStatus('Unexpected error during upload.');
        }
      } finally {
        setUploading(false);
      }
    },
    [canSubmit, category, language, monetization, schedule, videoFile, videoUrl]
  );

  return (
    <div className="mx-auto max-w-3xl rounded-3xl bg-slate-900/60 p-10 shadow-xl backdrop-blur">
      <h1 className="text-3xl font-semibold text-white">Automated YouTube Upload Agent</h1>
      <p className="mt-2 text-sm text-slate-300">
        Provide either a video file or a public URL. We handle SEO optimization, thumbnails, and publishing for you.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">Upload Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setVideoFile(file);
              if (file) {
                setVideoUrl('');
              }
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
          <p className="text-xs text-slate-500">Max 500MB per upload.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">Or Provide Video URL</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(event) => {
              setVideoUrl(event.target.value);
              if (event.target.value) {
                setVideoFile(null);
              }
            }}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
          <p className="text-xs text-slate-500">Provide a direct download link or public video source.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
            >
              {categories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">Language (ISO code)</label>
            <input
              type="text"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              placeholder="en"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">Monetization Preference</label>
            <select
              value={monetization}
              onChange={(event) => setMonetization(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
            >
              {monetizationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">Schedule (optional)</label>
            <input
              type="datetime-local"
              value={schedule}
              onChange={(event) => setSchedule(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
            />
            <p className="text-xs text-slate-500">Leave empty to publish immediately.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {uploading ? 'Uploading…' : 'Generate & Publish'}
        </button>
      </form>

      {status && (
        <p className="mt-6 text-sm text-slate-300">{status}</p>
      )}

      {result && (
        <div className="mt-10 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Final Upload Summary</h2>
          <dl className="space-y-3 text-sm text-slate-200">
            <div>
              <dt className="font-medium text-slate-300">Video Title</dt>
              <dd className="text-slate-100">{result.title}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-300">Video Description</dt>
              <dd className="whitespace-pre-line text-slate-100">{result.description}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-300">Tags</dt>
              <dd className="text-slate-100">{result.tags.join(', ')}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-300">Hashtags</dt>
              <dd className="text-slate-100">{result.hashtags.join(' ')}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-300">Thumbnail Prompt</dt>
              <dd className="text-slate-100">{result.thumbnailPrompt}</dd>
            </div>
            {result.youtubeUrl && (
              <div>
                <dt className="font-medium text-slate-300">YouTube Link</dt>
                <dd>
                  <a
                    href={result.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 underline"
                  >
                    {result.youtubeUrl}
                  </a>
                </dd>
              </div>
            )}
            {result.scheduledPublishAt && (
              <div>
                <dt className="font-medium text-slate-300">Scheduled Publish At</dt>
                <dd className="text-slate-100">{result.scheduledPublishAt}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
