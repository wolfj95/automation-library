import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Student Automation Library
          </h1>
          <p className="text-xl text-gray-700 mb-12">
            Discover and share everyday automations created by students.
            Browse projects, get inspired, and submit your own automation to help others.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              href="/browse"
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-indigo-500"
            >
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Browse Library
              </h2>
              <p className="text-gray-600">
                Explore automations created by your peers, filter by tags, and install projects
              </p>
            </Link>

            <Link
              href="/submit"
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-indigo-500"
            >
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Submit Automation
              </h2>
              <p className="text-gray-600">
                Share your automation project with the class and help others automate their lives
              </p>
            </Link>
          </div>

          <div className="mt-16 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What kind of automations?
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Email Organization
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Calendar Sync
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                File Management
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Social Media
              </span>
              <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                Data Collection
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                Reminders & Alerts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
