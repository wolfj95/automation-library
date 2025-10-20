'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Automation } from '@/types/automation';
import { DataService } from '@/lib/data-service';

export default function BrowsePage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [automationsData, tagsData] = await Promise.all([
        DataService.getAllAutomations(),
        DataService.getAllTags()
      ]);
      setAutomations(automationsData);
      setAllTags(tagsData);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredAutomations = selectedTag
    ? automations.filter(a => a.tags.includes(selectedTag))
    : automations;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Browse Automations</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tag Filter */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Tag</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({automations.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Automations Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading automations...</div>
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-500">No automations found.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAutomations.map(automation => (
              <Link
                key={automation.id}
                href={`/automation/${automation.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-indigo-500"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {automation.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  by {automation.studentName}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(automation.submissionDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {automation.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {automation.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Reactions */}
                {automation.reactions.length > 0 && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {automation.reactions.map(reaction => (
                      <span
                        key={reaction.emoji}
                        className="text-sm bg-gray-50 px-2 py-1 rounded text-gray-900 font-medium"
                      >
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
