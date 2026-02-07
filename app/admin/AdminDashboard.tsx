// app/admin/AdminDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface VideoEntry {
  category: string;
  title: string;
  url: string;
}

interface CategoryGroup {
  name: string;
  videos: VideoEntry[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newVideo, setNewVideo] = useState({ category: '', title: '', url: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch videos on mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
    });

    if (response.ok) {
      router.refresh();
    }
  };

  // Group videos by category while preserving order
  const getGroupedVideos = (): CategoryGroup[] => {
    const groups: CategoryGroup[] = [];
    const categoryOrder: string[] = [];
    
    videos.forEach(video => {
      if (!categoryOrder.includes(video.category)) {
        categoryOrder.push(video.category);
      }
    });

    categoryOrder.forEach(category => {
      groups.push({
        name: category,
        videos: videos.filter(v => v.category === category)
      });
    });

    return groups;
  };

  const categories = getGroupedVideos();

  // Move video within its category
  const moveVideoInCategory = async (category: string, videoIndex: number, direction: 'up' | 'down') => {
    const categoryVideos = videos.filter(v => v.category === category);
    const newLocalIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
    
    if (newLocalIndex < 0 || newLocalIndex >= categoryVideos.length) return;

    // Swap within the category
    [categoryVideos[videoIndex], categoryVideos[newLocalIndex]] = 
      [categoryVideos[newLocalIndex], categoryVideos[videoIndex]];

    // Rebuild full videos array with updated category order
    const newVideos = videos.filter(v => v.category !== category);
    
    // Find where this category's videos should be inserted
    const firstCategoryVideoIndex = videos.findIndex(v => v.category === category);
    newVideos.splice(firstCategoryVideoIndex, 0, ...categoryVideos);

    setVideos(newVideos);
    await saveVideos(newVideos);
  };

  // Move entire category up or down
  const moveCategory = async (categoryIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    // Swap categories
    const newCategories = [...categories];
    [newCategories[categoryIndex], newCategories[newIndex]] = 
      [newCategories[newIndex], newCategories[categoryIndex]];

    // Flatten back to videos array
    const newVideos = newCategories.flatMap(cat => cat.videos);
    
    setVideos(newVideos);
    await saveVideos(newVideos);
  };

  // Delete entire category
  const deleteCategory = async (categoryName: string) => {
    const categoryVideos = videos.filter(v => v.category === categoryName);
    if (!confirm(`Are you sure you want to delete the category "${categoryName}" and its ${categoryVideos.length} video(s)?`)) return;

    const newVideos = videos.filter(v => v.category !== categoryName);
    setVideos(newVideos);
    await saveVideos(newVideos);
  };

  // Rename category
  const renameCategory = async (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) return;
    
    const newVideos = videos.map(v => 
      v.category === oldName ? { ...v, category: newName } : v
    );
    
    setVideos(newVideos);
    await saveVideos(newVideos);
  };

  // Add new empty category (will add a placeholder that gets removed when first video is added)
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    // Check if category already exists
    if (categories.some(c => c.name === newCategoryName)) {
      alert('Category already exists');
      return;
    }

    // Add a placeholder video for the new category
    const newVideos = [...videos, { 
      category: newCategoryName, 
      title: 'New Video', 
      url: 'https://www.youtube.com/watch?v=placeholder' 
    }];
    
    setVideos(newVideos);
    await saveVideos(newVideos);
    setNewCategoryName('');
    setShowAddCategoryForm(false);
    
    // Expand the new category
    setExpandedCategories(prev => new Set([...prev, newCategoryName]));
  };

  const deleteVideo = async (category: string, videoIndex: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    const categoryVideos = videos.filter(v => v.category === category);
    const videoToDelete = categoryVideos[videoIndex];
    const globalIndex = videos.findIndex(v => v === videoToDelete);

    setSaving(true);
    try {
      const response = await fetch('/api/admin/videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: globalIndex }),
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
    } finally {
      setSaving(false);
    }
  };

  const addVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.category || !newVideo.title || !newVideo.url) return;

    setSaving(true);
    try {
      // Find where to insert the video (at the end of its category, or at the end if new category)
      const categoryVideos = videos.filter(v => v.category === newVideo.category);
      let insertIndex = videos.length;
      
      if (categoryVideos.length > 0) {
        const lastVideoInCategory = categoryVideos[categoryVideos.length - 1];
        insertIndex = videos.findIndex(v => v === lastVideoInCategory) + 1;
      }

      const newVideos = [...videos];
      newVideos.splice(insertIndex, 0, newVideo);

      const response = await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: newVideos }),
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
        setNewVideo({ category: '', title: '', url: '' });
        setShowAddForm(false);
        
        // Expand the category where video was added
        setExpandedCategories(prev => new Set([...prev, newVideo.category]));
      }
    } catch (error) {
      console.error('Failed to add video:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveVideos = async (videosToSave: VideoEntry[]) => {
    setSaving(true);
    try {
      await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: videosToSave }),
      });
    } catch (error) {
      console.error('Failed to save videos:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  return (
    <div className="min-h-[60vh] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-[#2a2a2a]">
          <div>
            <h1 className="text-2xl sm:text-3xl text-foreground">Admin Dashboard</h1>
            <p className="text-gray-400 font-system-sans text-xs sm:text-sm mt-1">
              Manage your video library
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs sm:text-sm text-gray-400 font-system-sans">Saving...</span>
            )}
            <button 
              onClick={handleLogout}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#252525] hover:bg-[#333] text-foreground rounded-lg transition-all duration-200 border border-[#3a3a3a] font-system-sans text-xs sm:text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => { setShowAddForm(!showAddForm); setShowAddCategoryForm(false); }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#F0B8CD] hover:bg-[#e5a3bc] text-[#141414] font-semibold rounded-lg transition-all duration-200 font-system-sans text-xs sm:text-sm"
          >
            {showAddForm ? 'Cancel' : '+ Add Video'}
          </button>
          
          <button
            onClick={() => { setShowAddCategoryForm(!showAddCategoryForm); setShowAddForm(false); }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#252525] hover:bg-[#333] text-foreground rounded-lg transition-all duration-200 border border-[#3a3a3a] font-system-sans text-xs sm:text-sm"
          >
            {showAddCategoryForm ? 'Cancel' : '+ Add Category'}
          </button>

          <span className="text-gray-400 font-system-sans text-xs sm:text-sm ml-auto">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}, {videos.length} video{videos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Add Category Form */}
        {showAddCategoryForm && (
          <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2a2a2a] mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl text-foreground mb-3 sm:mb-4">Add New Category</h2>
            <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-1 px-3 sm:px-4 py-2.5 bg-[#252525] border border-[#3a3a3a] rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F0B8CD] font-system-sans text-sm"
              />
              <button
                type="submit"
                disabled={saving || !newCategoryName.trim()}
                className="px-5 py-2.5 bg-[#F0B8CD] hover:bg-[#e5a3bc] text-[#141414] font-semibold rounded-lg transition-all duration-200 font-system-sans text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Category
              </button>
            </form>
          </div>
        )}

        {/* Add Video Form */}
        {showAddForm && (
          <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2a2a2a] mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl text-foreground mb-3 sm:mb-4">Add New Video</h2>
            <form onSubmit={addVideo} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-system-sans">Category</label>
                  <select
                    value={newVideo.category}
                    onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 bg-[#252525] border border-[#3a3a3a] rounded-lg text-foreground font-system-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#F0B8CD]"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-system-sans">Title</label>
                  <input
                    type="text"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    placeholder="Video title"
                    className="w-full px-3 sm:px-4 py-2.5 bg-[#252525] border border-[#3a3a3a] rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F0B8CD] font-system-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-system-sans">YouTube URL</label>
                  <input
                    type="url"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 sm:px-4 py-2.5 bg-[#252525] border border-[#3a3a3a] rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F0B8CD] font-system-sans text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving || !newVideo.category || !newVideo.title || !newVideo.url}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#F0B8CD] hover:bg-[#e5a3bc] text-[#141414] font-semibold rounded-lg transition-all duration-200 font-system-sans text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Video
              </button>
            </form>
          </div>
        )}

        {/* Categories and Videos */}
        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl border border-[#2a2a2a] p-6 sm:p-8 text-center text-gray-400 font-system-sans">
              Loading videos...
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl border border-[#2a2a2a] p-6 sm:p-8 text-center text-gray-400 font-system-sans">
              No categories found. Add a category to get started.
            </div>
          ) : (
            categories.map((category, categoryIndex) => (
              <div key={category.name} className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl border border-[#2a2a2a] overflow-hidden">
                {/* Category Header */}
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[#1f1f1f] border-b border-[#2a2a2a]">
                  {/* Category Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveCategory(categoryIndex, 'up')}
                      disabled={categoryIndex === 0 || saving}
                      className="p-1.5 sm:p-1 text-gray-400 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move category up"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveCategory(categoryIndex, 'down')}
                      disabled={categoryIndex === categories.length - 1 || saving}
                      className="p-1.5 sm:p-1 text-gray-400 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move category down"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Expand/Collapse Toggle */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="p-1.5 sm:p-1 text-gray-400 hover:text-foreground transition-colors"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform ${expandedCategories.has(category.name) ? 'rotate-90' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Category Name */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base text-foreground font-system-sans font-medium leading-tight truncate">{category.name}</h3>
                    <span className="text-xs text-gray-400 font-system-sans">
                      {category.videos.length} video{category.videos.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Category Actions */}
                  <div className="flex items-center gap-1 sm:gap-0">
                    <button
                      onClick={() => {
                        const newName = prompt('Enter new category name:', category.name);
                        if (newName) renameCategory(category.name, newName);
                      }}
                      disabled={saving}
                      className="p-2.5 sm:p-2 text-gray-400 hover:text-foreground hover:bg-[#333] rounded-lg transition-all disabled:opacity-50"
                      title="Rename category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteCategory(category.name)}
                      disabled={saving}
                      className="p-2.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50"
                      title="Delete category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Videos in Category */}
                {expandedCategories.has(category.name) && (
                  <div className="divide-y divide-[#2a2a2a]">
                    {category.videos.map((video, videoIndex) => (
                      <div 
                        key={`${video.title}-${videoIndex}`}
                        className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-[#202020] transition-colors pl-8 sm:pl-12"
                      >
                        {/* Video Reorder Buttons */}
                        <div className="flex flex-col gap-1 pt-1 sm:pt-0">
                          <button
                            onClick={() => moveVideoInCategory(category.name, videoIndex, 'up')}
                            disabled={videoIndex === 0 || saving}
                            className="p-1.5 sm:p-1 text-gray-400 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveVideoInCategory(category.name, videoIndex, 'down')}
                            disabled={videoIndex === category.videos.length - 1 || saving}
                            className="p-1.5 sm:p-1 text-gray-400 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base text-foreground font-system-sans font-medium truncate">{video.title}</h4>
                          <a 
                            href={video.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-[#F0B8CD] hover:underline font-system-sans truncate block mt-0.5"
                          >
                            {video.url}
                          </a>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteVideo(category.name, videoIndex)}
                          disabled={saving}
                          className="p-2.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50 shrink-0"
                          title="Delete video"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}