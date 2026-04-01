'use client';

import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '@/lib/profileActions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Derived state to show immediate preview link
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9-]/g, '');

  useEffect(() => {
    async function loadProfile() {
      const { profile } = await getMyProfile();
      if (profile) {
        setUsername(profile.username || '');
        setDisplayName(profile.display_name || '');
        setBio(profile.bio || '');
        setLinkedinUrl(profile.linkedin_url || '');
        setGithubUrl(profile.github_url || '');
        setYoutubeUrl(profile.youtube_url || '');
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const result = await updateMyProfile({
      username: username.trim(),
      display_name: displayName.trim(),
      bio: bio.trim(),
      linkedin_url: linkedinUrl.trim(),
      github_url: githubUrl.trim(),
      youtube_url: youtubeUrl.trim(),
    });

    if (result.success) {
      toast.success("Profile updated successfully!");
      setUsername(result.username || username);
    } else {
      toast.error(result.error || "Failed to update profile");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Loading Profile</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-2xl font-black text-white tracking-tighter italic">readaly</h1>
        <Link href="/" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors px-4 py-2 rounded border border-gray-800 hover:bg-gray-900">
          Back to Vault
        </Link>
      </div>

      <div className="bg-black border border-gray-800 rounded-2xl p-6 md:p-10">
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-2">Profile Settings</h2>
          <p className="text-gray-500 text-xs">Customize how you appear on your public reading journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Public Username</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-800 bg-gray-950 focus-within:border-emerald-500/50 transition-all">
              <span className="inline-flex items-center px-4 bg-gray-900 text-gray-500 text-xs font-mono">
                readaly/
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="reader123"
                className="flex-1 min-w-0 block w-full px-4 py-3 text-white bg-transparent outline-none text-sm"
              />
            </div>
            <p className="text-gray-600 text-[10px] mt-2 ml-1 uppercase tracking-widest font-bold">Minimum 3 characters · letters, numbers, dashes only</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your reading story..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-y"
            />
          </div>

          {/* Social Links Section */}
          <div className="pt-8 border-t border-gray-900">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Social Connections</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">GitHub</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">YouTube</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-10 flex flex-col sm:flex-row gap-6 items-center justify-between border-t border-gray-900">
            {cleanUsername.length >= 3 ? (
              <a 
                href={`/profile/${cleanUsername}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-500 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] order-2 sm:order-1 flex items-center gap-2"
              >
                View Profile ↗
              </a>
            ) : (
              <span className="text-gray-700 text-[10px] font-bold uppercase tracking-widest order-2 sm:order-1">Save username to view profile</span>
            )}

            <button
              type="submit"
              disabled={saving || cleanUsername.length < 3}
              className="w-full sm:w-auto order-1 sm:order-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-900 disabled:text-gray-600 text-white text-[10px] font-black uppercase tracking-[0.3em] py-4 px-10 rounded shadow-2xl shadow-emerald-900/10 transition-all active:scale-95"
            >
              {saving ? 'Processing...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
