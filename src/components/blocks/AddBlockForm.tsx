'use client';

import React, { useState } from 'react';

interface AddBlockFormProps {
  onAdd: (url: string, isPermanent: boolean) => Promise<void>;
}

export function AddBlockForm({ onAdd }: AddBlockFormProps) {
  const [url, setUrl] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(url.trim(), isPermanent);
      setUrl('');
      setIsPermanent(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Enter URL or domain (e.g., facebook.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim() || isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add Block'}
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="permanent"
          checked={isPermanent}
          onChange={(e) => setIsPermanent(e.target.checked)}
          className="rounded border-input"
          disabled={isSubmitting}
        />
        <label htmlFor="permanent" className="text-sm text-muted-foreground">
          Permanent block (requires challenge to unlock)
        </label>
      </div>
    </form>
  );
}