'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Asset, Category, DailyReflection, Note } from '@/app/types';
import { formatBytes, getStorageInfo } from '@/app/lib/storageUtils';

type OSKey = 'windows' | 'macos' | 'linux' | 'unknown';

const detectPlatform = (): OSKey => {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }
  const platform = (navigator.platform || '').toLowerCase();
  const userAgent = (navigator.userAgent || '').toLowerCase();
  if (platform.includes('win') || userAgent.includes('windows')) {
    return 'windows';
  }
  if (platform.includes('mac') || userAgent.includes('mac os')) {
    return 'macos';
  }
  if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux';
  }
  return 'unknown';
};

const PlatformIcon: React.FC<{ os: OSKey }> = ({ os }) => {
  const commonProps = { className: 'h-5 w-5', 'aria-hidden': true };
  if (os === 'windows') {
    return (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path fill="#00A4EF" d="M1 3.5 10.5 2v9H1z" />
        <path fill="#6fc0ff" d="M12 1.8 23 0v11H12z" />
        <path fill="#0078d4" d="M1 13h9.5v9L1 20.6z" />
        <path fill="#005ea2" d="M12 13h11v11l-11-1.4z" />
      </svg>
    );
  }
  if (os === 'macos') {
    return (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          fill="#111827"
          d="M16.7 12.7c0-2.4 2-3.6 2.1-3.7-1.2-1.8-3-2.1-3.6-2.1-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.9-1.7 0-3.2 1-4.1 2.5-1.8 3.1-.5 7.8 1.3 10.3.9 1.2 1.9 2.6 3.3 2.5 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.2 3.2-2.4 1-1.4 1.4-2.8 1.4-2.9-.1 0-3.5-1.4-3.5-4.2Zm-2.4-7.4c.7-.8 1.2-1.9 1-3-.9 0-2 .6-2.6 1.3-.6.7-1.2 1.8-1 2.9 1 .1 2-.5 2.6-1.2Z"
        />
      </svg>
    );
  }
  if (os === 'linux') {
    return (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          fill="#111827"
          d="M12 2c-2.2 0-3.7 2-3.7 4.8 0 .9.2 1.9.5 2.7-1.9.9-3.1 3.3-3.1 5.9 0 3.5 2.2 6.6 6.3 6.6s6.3-3.1 6.3-6.6c0-2.6-1.2-5-3.1-5.9.3-.8.5-1.8.5-2.7C15.7 4 14.2 2 12 2Z"
        />
        <ellipse cx="10" cy="8.5" rx="0.9" ry="1.1" fill="#fff" />
        <ellipse cx="14" cy="8.5" rx="0.9" ry="1.1" fill="#fff" />
        <path fill="#F59E0B" d="M12 10.2c-.9 0-1.6.4-1.6.9 0 .6.7 1 1.6 1s1.6-.4 1.6-1c0-.5-.7-.9-1.6-.9Z" />
      </svg>
    );
  }
  return <span className="h-5 w-5 rounded-full bg-stone-200" aria-hidden="true" />;
};

interface SettingsViewProps {
  notes: Note[];
  categories: Category[];
  assets: Asset[];
  reflections: DailyReflection[];
  onOpenFeedback: () => void;
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  notes,
  categories,
  assets,
  reflections,
  onOpenFeedback
}) => {
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setStorageInfo(getStorageInfo());
  }, []);

  const handleBackupSnapshot = () => {
    if (typeof window === 'undefined') return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const payload = {
      notes,
      categories,
      assets,
      reflections,
      recordedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    downloadBlob(blob, `pulm-backup-${timestamp}.json`);
  };

  const handleExportMarkdown = async () => {
    if (typeof window === 'undefined') return;
    const zip = new JSZip();
    notes.forEach((note) => {
      const name = note.title ? note.title.trim() : 'Untitled';
      const safeName = name.replace(/[^a-z0-9-_ ]/gi, '').slice(0, 120) || 'note';
      const markdown = note.blocks.map((block) => block.content).join('\n\n');
      zip.file(`${safeName || 'note'}.md`, markdown);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadBlob(content, `pulm-markdown-export-${timestamp}.zip`);
  };

  const [selectedBackupFile, setSelectedBackupFile] = useState<string | null>(null);

  const handleBackupFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedBackupFile(file.name);

    if (typeof window === 'undefined') {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const { notes: importedNotes, categories: importedCategories, assets: importedAssets, reflections: importedReflections } =
        parsed ?? {};

      if (!Array.isArray(importedNotes) || !Array.isArray(importedCategories)) {
        throw new Error('Missing notes or categories in the snapshot');
      }

      const persist = (key: string, payload: unknown[]) => {
        window.localStorage.setItem(key, JSON.stringify(payload));
      };

      persist('pulm-notes', importedNotes);
      persist('pulm-categories', importedCategories);

      if (Array.isArray(importedAssets)) {
        persist('pulm-assets', importedAssets);
      }

      if (Array.isArray(importedReflections)) {
        persist('pulm-reflections', importedReflections);
      }

      window.location.reload();
    } catch (error) {
      console.error('Unable to import snapshot', error);
      if (typeof window !== 'undefined') {
        window.alert('Unable to import the selected snapshot. Make sure it is a valid Pulm backup file.');
      }
    } finally {
      // Clear the input to allow re-selecting the same file later.
      event.target.value = '';
    }
  };

  const handleClearLibrary = () => {
    if (typeof window === 'undefined') return;
    const confirmed = window.confirm(
      'This will remove all notes, categories, assets, reflections, and activity logs from this device. This cannot be undone.'
    );
    if (!confirmed) {
      return;
    }
    window.localStorage.removeItem('pulm-notes');
    window.localStorage.removeItem('pulm-categories');
    window.localStorage.removeItem('pulm-assets');
    window.localStorage.removeItem('pulm-reflections');
    window.localStorage.removeItem('pulm_preferences');
    window.location.reload();
  };

  const hasTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__;
  const storageLocationText = hasTauri
    ? 'Tauri local filesystem (desktop) Â· Browser local storage (web)'
    : 'Browser local storage';

  const activeNotesCount = useMemo(
    () => notes.filter((note) => !note.isDeleted).length,
    [notes]
  );
  const archivedNotesCount = notes.length - activeNotesCount;
  const platformKey = useMemo(() => detectPlatform(), []);
  const platformLabelMap: Record<OSKey, string> = {
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    unknown: 'Unknown'
  };
  const platformLabel = platformLabelMap[platformKey];

  return (
    <div className="flex-1 overflow-y-auto bg-[#f4f2f0] text-stone-900">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6 min-h-full">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.4em] text-stone-600 font-bold">
            Settings
          </p>
          <p className="text-sm text-stone-500 max-w-2xl leading-relaxed">
            Pulm keeps everything rooted on this device. No tracking, no analytics, no cloud; only
            the quiet reflection you choose to log.
          </p>
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-[0_15px_30px_rgba(15,23,42,0.04)] space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-stone-500 font-semibold">General</p>
              <h2 className="text-xl font-semibold text-stone-900 mt-2">Description</h2>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Notes stay in your care. Nothing leaves the device unless you choose to export or backup.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              Pulm places your notes in your device.
              Nothing leaves the device unless you export or share it. Settings here are about keeping
              that world calm choose when to surface reflections and how to keep the workspace gentle,
              not to chase productivity stats.
            </p>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-[0_15px_30px_rgba(15,23,42,0.04)] space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-stone-500 font-semibold">Data</p>
              <h2 className="text-xl font-semibold text-stone-900 mt-2">Library snapshot</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100">
                <p className="text-xs uppercase tracking-[0.4em] text-stone-500">Notes</p>
              <p className="text-lg font-semibold text-stone-900 mt-2">
                {activeNotesCount} active
              </p>
              <p className="text-sm text-stone-500 mt-1">
                {archivedNotesCount} archived
              </p>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100">
                <p className="text-xs uppercase tracking-[0.4em] text-stone-500">Storage usage</p>
                <p className="text-base text-stone-600 mt-2">{formatBytes(storageInfo.used)} used</p>
                <p className="text-xs text-stone-400 mt-1">
                  {Math.round(storageInfo.percentage)}% of a ~5MB browser bucket
                </p>
                <p className="text-xs text-stone-500 mt-1">{storageLocationText}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleBackupSnapshot}
                className="w-full text-left rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400"
              >
                Library snapshot
              </button>
            </div>

            <div className="mt-2 space-y-3 border-t border-stone-100 pt-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400 font-semibold">Backup file</p>
                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-600 cursor-pointer">
                  <span className="font-semibold text-stone-900">Choose file</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleBackupFileChange}
                    className="hidden"
                  />
                </label>
                {selectedBackupFile && (
                  <p className="text-xs text-stone-500">Selected: {selectedBackupFile}</p>
                )}
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400 font-semibold">Danger zone</p>
              <p className="text-sm text-stone-500">
                Clearing the library removes every note, category, asset, reflection, and activity entry
                from this device.
              </p>
              <button
                type="button"
                onClick={handleClearLibrary}
                className="text-sm text-red-600 underline-offset-4 hover:text-red-700"
              >
                Clear library
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-[0_15px_30px_rgba(15,23,42,0.04)] space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-stone-500 font-semibold">About</p>
              <h2 className="text-xl font-semibold text-stone-900 mt-2">Pulm Notes</h2>
            </div>
            <div className="text-sm text-stone-600 space-y-2">
              <p className="flex items-center gap-2">
                <span className="font-medium text-stone-900">Version</span>
                <span>1.0.0</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-900">Platform</span>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <PlatformIcon os={platformKey} />
                  <span>{platformLabel}</span>
                </div>
              </div>
              <p className="flex items-center flex-wrap gap-2">
                <span className="font-medium text-stone-900">License</span>
                <span>Open source Â· see repository</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-stone-900">Open source link</span>
                <a
                  className="text-stone-700 hover:underline"
                  href="https://github.com/dev-Ninjaa/PulmNotes"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </p>
              <p className="text-sm text-stone-500">
                A calm, private lucid space for reflection that keeps you rooted in local notes.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
