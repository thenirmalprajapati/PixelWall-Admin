import { useState, useRef, useEffect } from 'react'
import {
  Plus,
  Image as ImageIcon,
  Tag,
  Palette,
  TrendingUp,
  BarChart2,
  Settings,
  LogOut,
  Layers,
  Flame,
  Star,
  Eye,
  Check,
  Loader2
} from 'lucide-react'

interface Wallpaper {
  id: number;
  title: string;
  imageUrl: string;
  categories: string;
  colors: string;
  types: string;
  topPicks: string;
  viewCount: number;
}

interface UserProfile {
  id: number;
  email: string;
  role: string;
  displayName: string | null;
  photoUrl: string | null;
}

const CATEGORIES = [
  'Abstract', 'Aesthatic', 'AI', 'Animals', 'Art', 'Birds', 'Bokeh', 'Buildings', 
  'Flowers', 'Foods', 'Galaxy', 'Gradient', 'Historical', 'Horror', 'Insects', 
  'Landscapes', 'Love', 'Minimal', 'Music', 'Nature', 'Neon', 'Pattern', 
  'Rainbow', 'Seascapes', 'Shadow', 'Sunrise & Sunset', 'Texture', 'Vehicles', 
  'Vibrant', 'Vintage'
];
const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White', 'Cyan', 'Indigo'];
const TYPES = ['Trending', 'Hot', 'New'];
const TOP_PICKS = ['Coal Black', 'Lovely Vibe', 'Speed Snap', 'Beach Life', 'Wild Life'];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [view, setView] = useState<'upload' | 'list' | 'users'>('upload');

  const [formData, setFormData] = useState<Partial<Wallpaper>>({
    id: 0,
    title: '',
    imageUrl: '',
    categories: '',
    colors: '',
    types: '',
    topPicks: '',
    viewCount: 0
  });

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('pixelWallAdminToken');
    if (token) {
      setIsLoggedIn(true);
      refreshData();
    }
  }, []);

  const refreshData = () => {
    fetchWallpapers();
    fetchUsers();
  };

  const fetchWallpapers = async () => {
    setIsLoadingList(true);
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/list?pageSize=50`);
      if (response.ok) {
        const data = await response.json();
        setWallpapers(data.items);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoadingList(false); }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoadingUsers(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('pixelWallAdminToken', data.token);
        setIsLoggedIn(true);
        refreshData();
      } else {
        setMessage({ text: 'Invalid credentials', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Login failed', type: 'error' });
    }
  };

  const toggleArrayItem = (field: 'categories' | 'colors' | 'types' | 'topPicks', item: string) => {
    setFormData((prev: any) => {
      const current = prev[field] ? prev[field]!.split(',').filter((x: string) => x) : [];
      let next: string[];
      if (current.includes(item)) {
        next = current.filter((i: string) => i !== item);
      } else {
        next = [...current, item];
      }
      return { ...prev, [field]: next.join(',') };
    });
  };

  const handleEdit = (wp: Wallpaper) => {
    setFormData(wp);
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    const fullUrl = wp.imageUrl.startsWith('http') ? wp.imageUrl : `${apiBase}${wp.imageUrl}`;
    setPreviewUrl(fullUrl);
    setView('upload');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this wallpaper?')) return;
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` }
      });
      if (response.ok) {
        setMessage({ text: 'Deleted successfully!', type: 'success' });
        fetchWallpapers();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/user/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` }
      });
      if (response.ok) {
        setMessage({ text: 'User removed successfully!', type: 'success' });
        fetchUsers();
      }
    } catch (err) { console.error(err); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to API
    const token = localStorage.getItem('pixelWallAdminToken');
    if (!token) {
      setMessage({ text: 'You must be logged in to upload.', type: 'error' });
      setIsLoggedIn(false);
      return;
    }

    setIsUploading(true);
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}`
        },
        body: apiFormData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev: any) => ({ ...prev, imageUrl: data.imageUrl }));
        setMessage({ text: 'Image uploaded successfully!', type: 'success' });
      } else if (response.status === 401) {
        setMessage({ text: 'Session expired. Please log in again.', type: 'error' });
        setIsLoggedIn(false);
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        setMessage({ text: 'Failed to upload image. (Server Error)', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Error uploading image.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      setMessage({ text: 'Please fill in required fields (Title and Image)', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ text: `Wallpaper ${formData.id ? 'updated' : 'saved'} successfully!`, type: 'success' });
        // Reset form
        setFormData({
          id: 0,
          title: '',
          imageUrl: '',
          categories: '',
          colors: '',
          types: '',
          topPicks: '',
          viewCount: 0
        });
        setPreviewUrl('');
        refreshData();
      } else {
        setMessage({ text: 'Failed to save wallpaper. Are you logged in?', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Error saving wallpaper.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pixelWallAdminToken');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, #1e1b4b, #0f172a)'
      }}>
        <form className="form-grid" style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column' }} onSubmit={handleLogin}>
          <div className="logo" style={{ alignSelf: 'center', marginBottom: '2rem' }}>PIXELWALL<span>.ADMIN</span></div>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Admin Login</h2>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Email Address</label>
            <input
              type="email"
              className="input-field"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <input
              type="password"
              className="input-field"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="submit-btn" style={{ gridColumn: 'auto' }}>
            Sign In to Dashboard
          </button>

          {message.text && (
            <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '1rem' }}>{message.text}</p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="logo">PIXELWALL<span>.ADMIN</span></div>
        <nav className="nav-links">
          <a href="#" className={`nav-link ${view === 'upload' ? 'active' : ''}`} onClick={() => setView('upload')}><Layers size={20} /> <span>{formData.id ? 'Edit' : 'Upload'}</span></a>
          <a href="#" className={`nav-link ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}><BarChart2 size={20} /> <span>Wallpapers</span></a>
          <a href="#" className={`nav-link ${view === 'users' ? 'active' : ''}`} onClick={() => setView('users')}><Tag size={20} /> <span>Users</span></a>
        </nav>
        <div className="sidebar-footer">
          <a href="#" className="nav-link" onClick={handleLogout}><LogOut size={20} /> <span>Logout</span></a>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>{view === 'upload' ? (formData.id ? 'Edit Wallpaper' : 'Upload Wallpaper') : view === 'list' ? 'Manage Wallpapers' : 'User Management'}</h1>
            <p className="header-desc">Manage your high-quality visual collection.</p>
          </div>
          {message.text && (
            <div className={`notification ${message.type}`}>
              {message.type === 'success' ? <Check size={18} /> : <Plus style={{ transform: 'rotate(45deg)' }} size={18} />}
              {message.text}
            </div>
          )}
        </header>

        {view === 'upload' ? (
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Title</label>
                {formData.id !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ id: 0, title: '', imageUrl: '', categories: '', colors: '', types: '', topPicks: '', viewCount: 0 });
                      setPreviewUrl('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Clear Edit Mode
                  </button>
                )}
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Neon Cyberpunk City"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div
              className="file-upload-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                  <p>Uploading and compressing image...</p>
                </div>
              ) : previewUrl ? (
                <img
                  src={(() => {
                    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
                    if (previewUrl.startsWith('data:') || previewUrl.startsWith('http')) return previewUrl;
                    if (previewUrl.includes('\\') || previewUrl.includes(':')) {
                      const parts = previewUrl.split(/[\\/]/);
                      return `${apiBase}/wallpapers/${parts[parts.length - 1]}`;
                    }
                    return `${apiBase}${previewUrl}`;
                  })()}
                  alt="Preview"
                  className="preview-image"
                />
              ) : (
                <>
                  <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                    <ImageIcon size={40} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>Click to upload wallpaper</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>PNG, JPG or WebP. Max 10MB.</p>
                  </div>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-group">
              <label><Tag size={14} style={{ marginRight: '0.5rem' }} /> Category</label>
              <div className="tags-container">
                {CATEGORIES.map(cat => (
                  <div
                    key={cat}
                    className={`tag-option ${formData.categories?.split(',').includes(cat) ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('categories', cat)}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label><Palette size={14} style={{ marginRight: '0.5rem' }} /> Primary Colors</label>
              <div className="tags-container">
                {COLORS.map(color => (
                  <div
                    key={color}
                    className={`tag-option ${formData.colors?.split(',').includes(color) ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('colors', color)}
                  >
                    {color}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label><TrendingUp size={14} style={{ marginRight: '0.5rem' }} /> Featured Status</label>
              <div className="tags-container">
                {TYPES.map(type => (
                  <div
                    key={type}
                    className={`tag-option ${formData.types?.split(',').includes(type) ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('types', type)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {type === 'Trending' && <TrendingUp size={14} />}
                    {type === 'Hot' && <Flame size={14} />}
                    {type === 'New' && <Star size={14} />}
                    {type}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label><Star size={14} style={{ marginRight: '0.5rem' }} /> Top Picks</label>
              <div className="tags-container">
                {TOP_PICKS.map(pick => (
                  <div
                    key={pick}
                    className={`tag-option ${formData.topPicks?.split(',').includes(pick) ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('topPicks', pick)}
                  >
                    {pick}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label><Eye size={14} style={{ marginRight: '0.5rem' }} /> View Count</label>
              <input
                type="number"
                className="input-field"
                value={formData.viewCount}
                onChange={(e) => setFormData({ ...formData, viewCount: parseInt(e.target.value) || 0 })}
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || isUploading || !formData.title || !formData.imageUrl}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" size={20} />
                  Saving to Database...
                </span>
              ) : (
                formData.id ? 'Update Wallpaper' : 'Publish Wallpaper'
              )}
            </button>
          </form>
        ) : view === 'list' ? (
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Manage Wallpapers</h2>
              <button onClick={fetchWallpapers} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Refresh</button>
            </div>

            {isLoadingList ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} style={{ margin: '0 auto' }} /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {wallpapers.map(wp => (
                  <div key={wp.id} style={{ background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ height: '150px', position: 'relative' }}>
                      <img
                        src={(() => {
                          const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
                          if (!wp.imageUrl) return 'https://placehold.co/400x300?text=No+Path';
                          if (wp.imageUrl.startsWith('http')) return wp.imageUrl;

                          // If it's a local Windows path from an old test, extract filename
                          if (wp.imageUrl.includes('\\') || wp.imageUrl.includes(':')) {
                            const parts = wp.imageUrl.split(/[\\/]/);
                            const fileName = parts[parts.length - 1];
                            return `${apiBase}/wallpapers/${fileName}`;
                          }
                          return `${apiBase}${wp.imageUrl}`;
                        })()}
                        alt={wp.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/400x300?text=Image+Missing';
                        }}
                      />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleEdit(wp)} style={{ padding: '8px', borderRadius: '50%', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }}><Settings size={14} /></button>
                        <button onClick={() => handleDelete(wp.id)} style={{ padding: '8px', borderRadius: '50%', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer' }}><Plus style={{ transform: 'rotate(45deg)' }} size={14} /></button>
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{wp.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Eye size={12} /> {wp.viewCount} Views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Registered Users</h2>
              <button onClick={fetchUsers} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Refresh</button>
            </div>

            {isLoadingUsers ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={40} style={{ margin: '0 auto' }} /></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                      <th style={{ padding: '1rem' }}>User</th>
                      <th style={{ padding: '1rem' }}>Role</th>
                      <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', overflow: 'hidden' }}>
                              <img src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.email}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{user.displayName || 'Unnamed User'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            background: user.role === 'Admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                            color: user.role === 'Admin' ? 'var(--primary)' : 'var(--text-dim)',
                            border: `1px solid ${user.role === 'Admin' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Plus style={{ transform: 'rotate(45deg)' }} size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default App
