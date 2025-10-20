'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Automation } from '@/types/automation';
import { DataService } from '@/lib/data-service';

const AVAILABLE_EMOJIS = ['👍', '❤️', '🔥', '🎉', '🚀', '💡'];

export default function AutomationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    async function loadAutomation() {
      setLoading(true);
      const data = await DataService.getAutomationById(id);
      setAutomation(data);
      setLoading(false);
    }
    loadAutomation();
  }, [id]);

  const handleAddReaction = async (emoji: string) => {
    const updated = await DataService.addReaction(id, emoji);
    if (updated) {
      setAutomation(updated);
    }
    setShowEmojiPicker(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading automation...</div>
      </div>
    );
  }

  if (!automation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Automation not found</div>
          <Link href="/browse" className="text-indigo-600 hover:text-indigo-800">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/browse" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Browse
          </Link>
          <Link
            href={`/automation/${id}/edit`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Edit Automation
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {automation.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="font-medium">by {automation.studentName}</span>
              <span>•</span>
              <span>{new Date(automation.submissionDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {automation.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 text-lg">{automation.description}</p>
          </div>

          {/* Links */}
          {automation.links.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Links</h2>
              <div className="space-y-2">
                {automation.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <span>🔗</span>
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Setup Instructions */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Setup Instructions</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {automation.setupInstructions}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Installation Code */}
          {automation.installationCode && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Quick Install</h2>
              <div className="bg-gray-900 rounded-lg p-4">
                <code className="text-green-400 font-mono text-sm">
                  {automation.installationCode}
                </code>
              </div>
            </div>
          )}

          {/* Images */}
          {automation.images.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Screenshots</h2>
              <div className="grid grid-cols-2 gap-4">
                {automation.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Screenshot ${index + 1}`}
                    className="rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reactions */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reactions</h2>
            <div className="flex flex-wrap gap-3 items-center">
              {automation.reactions.map(reaction => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleAddReaction(reaction.emoji)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">{reaction.emoji}</span>
                  <span className="font-semibold text-gray-700">{reaction.count}</span>
                </button>
              ))}

              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg font-medium transition-colors"
                >
                  + Add Reaction
                </button>

                {showEmojiPicker && (
                  <div className="absolute top-full mt-2 bg-white shadow-lg rounded-lg p-3 flex gap-2 z-10 border border-gray-200">
                    {AVAILABLE_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleAddReaction(emoji)}
                        className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
