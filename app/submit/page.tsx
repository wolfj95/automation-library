'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataService } from '@/lib/data-service';
import { Link as LinkType } from '@/types/automation';

export default function SubmitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    studentName: '',
    setupInstructions: '',
    installationCode: '',
    tags: '',
  });

  const [links, setLinks] = useState<LinkType[]>([{ title: '', url: '' }]);
  const [images, setImages] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLink = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImage = () => {
    setImages([...images, '']);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const filteredLinks = links.filter(link => link.title && link.url);
      const filteredImages = images.filter(img => img.length > 0);

      await DataService.createAutomation({
        title: formData.title,
        description: formData.description,
        studentName: formData.studentName,
        setupInstructions: formData.setupInstructions,
        installationCode: formData.installationCode || undefined,
        tags: tagsArray,
        links: filteredLinks,
        images: filteredImages
      });

      router.push('/browse');
    } catch (error) {
      console.error('Error submitting automation:', error);
      alert('Failed to submit automation. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit Your Automation</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Auto Email Organizer"
              />
            </div>

            {/* Student Name */}
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                required
                value={formData.studentName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="e.g., John Doe"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="Describe what your automation does and why it's useful..."
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags * (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                required
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="e.g., email, productivity, automation"
              />
            </div>

            {/* Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Links (GitHub, Documentation, etc.)
              </label>
              {links.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                    placeholder="Link title"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLink}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                + Add Link
              </button>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URLs
              </label>
              {images.map((image, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImage}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                + Add Image
              </button>
            </div>

            {/* Setup Instructions */}
            <div>
              <label htmlFor="setupInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                Setup Instructions * (supports Markdown)
              </label>
              <textarea
                id="setupInstructions"
                name="setupInstructions"
                required
                value={formData.setupInstructions}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm text-gray-900"
                placeholder="## Setup&#10;1. Clone the repository&#10;2. Install dependencies: `npm install`&#10;3. Configure .env file&#10;4. Run: `npm start`"
              />
            </div>

            {/* Installation Code */}
            <div>
              <label htmlFor="installationCode" className="block text-sm font-medium text-gray-700 mb-2">
                Quick Install Command (optional)
              </label>
              <input
                type="text"
                id="installationCode"
                name="installationCode"
                value={formData.installationCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm text-gray-900"
                placeholder="e.g., npm install -g my-automation"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Automation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
