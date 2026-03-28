import { useState, useRef, useEffect } from 'react'
import {
  Plus,
  Check,
  ImageIcon,
  Palette,
  Type,
  Tags,
  BarChart2,
  Loader2,
  LogOut,
  Layers,
  Eye,
  Settings,
  User,
  Star,
  Tag
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

interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

interface TopPick {
  id: number;
  name: string;
  imageUrl: string;
}

interface UserProfile {
  id: number;
  email: string;
  role: string;
  displayName: string | null;
  photoUrl: string | null;
}

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White', 'Cyan', 'Indigo'];
const TYPES = ['Trending', 'Hot', 'New'];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [view, setView] = useState<'upload' | 'list' | 'users' | 'categories' | 'top-picks'>('upload');

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

  const [catFormData, setCatFormData] = useState<Partial<Category>>({ id: 0, name: '', imageUrl: '' });
  const [tpFormData, setTpFormData] = useState<Partial<TopPick>>({ id: 0, name: '', imageUrl: '' });

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topPicks, setTopPicks] = useState<TopPick[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [isLoadingTP, setIsLoadingTP] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [catPreviewUrl, setCatPreviewUrl] = useState<string>('');
  const [tpPreviewUrl, setTpPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catFileInputRef = useRef<HTMLInputElement>(null);
  const tpFileInputRef = useRef<HTMLInputElement>(null);

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
    fetchCategories();
    fetchTopPicks();
  };

  const fetchCategories = async () => {
    setIsLoadingCats(true);
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/categories`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` } });
      if (response.ok) setCategories(await response.json());
    } catch (err) { console.error(err); }
    finally { setIsLoadingCats(false); }
  };

  const fetchTopPicks = async () => {
    setIsLoadingTP(true);
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/top-picks`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` } });
      if (response.ok) setTopPicks(await response.json());
    } catch (err) { console.error(err); }
    finally { setIsLoadingTP(false); }
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

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

  const handleCatFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCatPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    const apiFormData = new FormData();
    apiFormData.append('file', file);
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` },
        body: apiFormData
      });
      if (response.ok) {
        const data = await response.json();
        setCatFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
      }
    } catch (err) { console.error(err); }
  };

  const handleTpFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setTpPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    const apiFormData = new FormData();
    apiFormData.append('file', file);
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` },
        body: apiFormData
      });
      if (response.ok) {
        const data = await response.json();
        setTpFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
      }
    } catch (err) { console.error(err); }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/category/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` },
        body: JSON.stringify(catFormData)
      });
      if (response.ok) {
        setMessage({ text: 'Category saved!', type: 'success' });
        setCatFormData({ id: 0, name: '', imageUrl: '' });
        setCatPreviewUrl('');
        fetchCategories();
      }
    } catch (err) { console.error(err); }
  };

  const handleTpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/top-pick/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` },
        body: JSON.stringify(tpFormData)
      });
      if (response.ok) {
        setMessage({ text: 'Top Pick saved!', type: 'success' });
        setTpFormData({ id: 0, name: '', imageUrl: '' });
        setTpPreviewUrl('');
        fetchTopPicks();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteCat = async (id: number) => {
    if (!window.confirm('Delete category?')) return;
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/category-delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` }
      });
      if (response.ok) fetchCategories();
    } catch (err) { console.error(err); }
  };

  const handleDeleteTP = async (id: number) => {
    if (!window.confirm('Delete top pick?')) return;
    const apiBase = 'https://loopbit-pixelwall.azurewebsites.net';
    try {
      const response = await fetch(`${apiBase}/api/Admin/top-pick-delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pixelWallAdminToken')}` }
      });
      if (response.ok) fetchTopPicks();
    } catch (err) { console.error(err); }
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
          <a href="#" className={`nav-link ${view === 'categories' ? 'active' : ''}`} onClick={() => setView('categories')}><Tag size={20} /> <span>Categories</span></a>
          <a href="#" className={`nav-link ${view === 'top-picks' ? 'active' : ''}`} onClick={() => setView('top-picks')}><Star size={20} /> <span>Top Picks</span></a>
          <a href="#" className={`nav-link ${view === 'users' ? 'active' : ''}`} onClick={() => setView('users')}><User size={20} /> <span>Users</span></a>
        </nav>
        <div className="sidebar-footer">
          <a href="#" className="nav-link" onClick={handleLogout}><LogOut size={20} /> <span>Logout</span></a>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>{view === 'upload' ? (formData.id ? 'Edit Wallpaper' : 'Upload Wallpaper') : view === 'list' ? 'Manage Wallpapers' : view === 'categories' ? 'Manage Categories' : view === 'top-picks' ? 'Manage Top Picks' : 'User Management'}</h1>
            <p className="header-desc">Manage your high-quality visual collection.</p>
          </div>
          {message.text && (
            <div className={`notification ${message.type}`}>
              {message.type === 'success' ? <Check size={18} /> : <Plus style={{ transform: 'rotate(45deg)' }} size={18} />}
              {message.text}
            </div>
          )}
        </header>

        {view === 'upload' && (
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Title</label>
              <input type="text" placeholder="e.g. Neon Cyberpunk City" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>

            <div className="file-upload-zone" onClick={() => fileInputRef.current?.click()} style={{ gridColumn: 'span 2' }}>
              {isUploading ? (
                <div style={{ textAlign: 'center' }}><Loader2 className="animate-spin" size={48} /> <p>Processing...</p></div>
              ) : previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px' }} />
              ) : (
                <>
                  <div className="upload-icon-wrapper"><Plus size={32} /></div>
                  <h3>Upload Wallpaper</h3>
                  <p>Click to select image</p>
                </>
              )}
              <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
            </div>

            <div className="form-group">
              <label><Tags size={14} /> Categories</label>
              <div className="tags-container">
                {categories.map(cat => (
                  <div key={cat.id} className={`tag-option ${formData.categories?.split(',').includes(cat.name) ? 'selected' : ''}`} onClick={() => toggleArrayItem('categories', cat.name)}>{cat.name}</div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label><Palette size={14} /> Colors</label>
              <div className="tags-container">
                {COLORS.map(c => (
                  <div key={c} className={`tag-option ${formData.colors?.split(',').includes(c) ? 'selected' : ''}`} onClick={() => toggleArrayItem('colors', c)}>{c}</div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label><Type size={14} /> Types</label>
              <div className="tags-container">
                {TYPES.map(t => (
                  <div key={t} className={`tag-option ${formData.types?.split(',').includes(t) ? 'selected' : ''}`} onClick={() => toggleArrayItem('types', t)}>{t}</div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label><Star size={14} /> Top Picks</label>
              <div className="tags-container">
                {topPicks.map(p => (
                  <div key={p.id} className={`tag-option ${formData.topPicks?.split(',').includes(p.name) ? 'selected' : ''}`} onClick={() => toggleArrayItem('topPicks', p.name)}>{p.name}</div>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ gridColumn: 'span 2' }}>
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (formData.id ? 'Update Wallpaper' : 'Publish Wallpaper')}
            </button>
          </form>
        )}

        {view === 'list' && (
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>All Wallpapers ({wallpapers.length})</h2>
              <button onClick={fetchWallpapers} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Refresh</button>
            </div>
            {isLoadingList ? <div style={{ textAlign: 'center' }}><Loader2 className="animate-spin" size={40} /></div> : (
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {wallpapers.map(wp => (
                  <div key={wp.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: '150px', position: 'relative' }}>
                      <img src={wp.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 5, right: 5, display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleEdit(wp)} style={{ padding: '6px', borderRadius: '50%', border: 'none', background: 'var(--primary)', color: 'white' }}><Settings size={12} /></button>
                        <button onClick={() => handleDelete(wp.id)} style={{ padding: '6px', borderRadius: '50%', border: 'none', background: '#ef4444', color: 'white' }}><Plus style={{ transform: 'rotate(45deg)' }} size={12} /></button>
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{wp.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{wp.categories} | {wp.viewCount} views</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'users' && (
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>User Management</h2>
              <button onClick={fetchUsers} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Refresh</button>
            </div>
            {isLoadingUsers ? <div style={{ textAlign: 'center' }}><Loader2 className="animate-spin" size={40} /></div> : (
              <table>
                <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>{u.email}</td>
                      <td>{u.role}</td>
                      <td><button onClick={() => handleDeleteUser(u.id)} style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Plus style={{ transform: 'rotate(45deg)' }} size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {view === 'categories' && (
          <div className="form-grid" style={{ gridTemplateColumns: '300px 1fr' }}>
            <div className="form-section">
              <h3>Add Category</h3>
              <form onSubmit={handleCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Category Name" value={catFormData.name} onChange={e => setCatFormData({...catFormData, name: e.target.value})} required />
                <div className="file-upload-zone" onClick={() => catFileInputRef.current?.click()} style={{ minHeight: '120px' }}>
                  {catPreviewUrl ? <img src={catPreviewUrl} style={{ maxHeight: '80px', borderRadius: '8px' }} /> : <Plus size={24} />}
                  <input type="file" ref={catFileInputRef} hidden onChange={handleCatFileChange} />
                </div>
                <button type="submit" className="submit-btn" disabled={isLoadingCats}>Save</button>
              </form>
            </div>
            <div className="form-section">
              <h3>Existing Categories</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                {categories.map(c => (
                  <div key={c.id} className="card" style={{ padding: '0.5rem', position: 'relative' }}>
                    <img src={c.imageUrl} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{c.name}</p>
                    <button onClick={() => handleDeleteCat(c.id)} style={{ position: 'absolute', top: 5, right: 5, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus style={{ transform: 'rotate(45deg)' }} size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'top-picks' && (
          <div className="form-grid" style={{ gridTemplateColumns: '300px 1fr' }}>
            <div className="form-section">
              <h3>Add Top Pick</h3>
              <form onSubmit={handleTpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Title" value={tpFormData.name} onChange={e => setTpFormData({...tpFormData, name: e.target.value})} required />
                <div className="file-upload-zone" onClick={() => tpFileInputRef.current?.click()} style={{ minHeight: '120px' }}>
                  {tpPreviewUrl ? <img src={tpPreviewUrl} style={{ maxHeight: '80px', borderRadius: '8px' }} /> : <Plus size={24} />}
                  <input type="file" ref={tpFileInputRef} hidden onChange={handleTpFileChange} />
                </div>
                <button type="submit" className="submit-btn" disabled={isLoadingTP}>Save</button>
              </form>
            </div>
            <div className="form-section">
              <h3>Existing Picks</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                {topPicks.map(t => (
                  <div key={t.id} className="card" style={{ padding: '0.5rem', position: 'relative' }}>
                    <img src={t.imageUrl} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{t.name}</p>
                    <button onClick={() => handleDeleteTP(t.id)} style={{ position: 'absolute', top: 5, right: 5, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus style={{ transform: 'rotate(45deg)' }} size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
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
