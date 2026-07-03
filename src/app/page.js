"use client";

import { useState, useEffect } from 'react';
import { Upload, File as FileIcon, Download, Lock, Loader2, FolderPlus, Folder, ChevronRight, Home as HomeIcon, Trash2, Search, LayoutGrid, List as ListIcon, Plus, X, Cloud, Edit2, LogOut, Info, User } from 'lucide-react';

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Root' }]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  const [stats, setStats] = useState({ totalSize: 0, totalFiles: 0 });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthorized(data.isAuthorized);
      if (data.isAuthorized) {
        setCurrentUser(data.user);
        fetchData(null);
        fetchStats();
      }
    } catch (e) {
      console.error(e);
      setIsAuthorized(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats({ totalSize: data.totalSize, totalFiles: data.totalFiles });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async (folderId) => {
    try {
      const qs = folderId ? `?folderId=${folderId}` : '';
      const qsFolder = folderId ? `?parentId=${folderId}` : '';
      
      const [resFiles, resFolders] = await Promise.all([
        fetch('/api/files' + qs),
        fetch('/api/folders' + qsFolder)
      ]);
      
      const dataFiles = await resFiles.json();
      const dataFolders = await resFolders.json();
      
      if (dataFiles.success) setFiles(dataFiles.files);
      if (dataFolders.success) setFolders(dataFolders.folders);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, parentId: currentFolderId })
      });
      const data = await res.json();
      if (data.success) {
        setNewFolderName('');
        setShowFolderModal(false);
        fetchData(currentFolderId);
      } else {
        alert("Gagal membuat folder: " + data.error);
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setCreatingFolder(false);
    }
  };

  const navigateToFolder = (folderId, folderName) => {
    setCurrentFolderId(folderId);
    setSearchQuery('');
    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: 'Root' }]);
    } else {
      const index = breadcrumbs.findIndex(b => b.id === folderId);
      if (index !== -1) {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      } else {
        setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
      }
    }
    fetchData(folderId);
  };

  const handleDelete = async (e, type, id, name) => {
    e.stopPropagation();
    if (!window.confirm(`Yakin ingin menghapus ${type === 'folder' ? 'folder' : 'file'} "${name}"?\nPerhatian: Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/${type}s/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData(currentFolderId);
        fetchStats();
      } else {
        alert("Gagal menghapus: " + data.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleRename = async (e, type, id, currentName) => {
    e.stopPropagation();
    const newName = window.prompt(`Masukkan nama baru untuk ${type === 'folder' ? 'folder' : 'file'}:`, currentName);
    if (!newName || newName === currentName) return;

    try {
      const res = await fetch(`/api/${type}s/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      const data = await res.json();
      if (data.success) {
        fetchData(currentFolderId);
      } else {
        alert("Gagal mengubah nama: " + data.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Yakin ingin keluar? Sesi Anda akan dihapus dari server lokal ini.")) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthorized(false);
      setStep('phone');
      setShowProfileMenu(false);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      if (data.success) {
        setPhoneCodeHash(data.phoneCodeHash);
        setStep('code');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, phoneCode, phoneCodeHash, password: step === 'password' ? password : undefined })
      });
      const data = await res.json();
      
      if (data.requiresPassword) {
        setStep('password');
        setLoading(false);
        return;
      }
      
      if (data.success) {
        setIsAuthorized(true);
        fetchData(currentFolderId);
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    setShowNewMenu(false);

    const newUploads = selectedFiles.map(file => {
      const uploadId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      return {
        id: uploadId,
        file,
        name: file.name,
        progress: 0,
        status: 'uploading',
        xhr: null,
        eventSource: null
      };
    });

    setUploadQueue(prev => [...prev, ...newUploads]);

    newUploads.forEach(uploadItem => {
      startUpload(uploadItem);
    });

    e.target.value = null;
  };

  const startUpload = (uploadItem) => {
    const formData = new FormData();
    formData.append('file', uploadItem.file);
    if (currentFolderId) {
      formData.append('folderId', currentFolderId);
    }
    formData.append('uploadId', uploadItem.id);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    const eventSource = new EventSource('/api/upload/progress?id=' + uploadItem.id);
    
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setUploadQueue(prev => prev.map(item => {
          if (item.id === uploadItem.id) {
            return { ...item, progress: data.progress !== undefined ? data.progress : item.progress, status: data.status || item.status };
          }
          return item;
        }));

        if (data.status === 'completed' || data.status === 'error' || data.status === 'cancelled') {
          eventSource.close();
          if (data.status === 'completed') {
            fetchData(currentFolderId);
            fetchStats();
            setTimeout(() => {
              setUploadQueue(prev => prev.filter(i => i.id !== uploadItem.id));
            }, 5000);
          }
        }
      } catch (err) {}
    };

    setUploadQueue(prev => prev.map(item => item.id === uploadItem.id ? { ...item, xhr, eventSource } : item));

    xhr.onload = () => {
      if (xhr.status !== 200) {
        setUploadQueue(prev => prev.map(item => item.id === uploadItem.id && item.status !== 'cancelled' ? { ...item, status: 'error' } : item));
        eventSource.close();
      }
    };

    xhr.onerror = () => {
      setUploadQueue(prev => prev.map(item => item.id === uploadItem.id && item.status !== 'cancelled' ? { ...item, status: 'error' } : item));
      eventSource.close();
    };

    xhr.send(formData);
  };

  const handleCancelUpload = async (id) => {
    setUploadQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        if (item.xhr) item.xhr.abort();
        if (item.eventSource) item.eventSource.close();
      }
      return prev.map(i => i.id === id ? { ...i, status: 'cancelled' } : i);
    });

    await fetch('/api/upload/progress?id=' + id, { method: 'DELETE' });

    setTimeout(() => {
      setUploadQueue(prev => prev.filter(i => i.id !== id));
    }, 2000);
  };

  if (isAuthorized === null) {
    return (
      <div className="auth-container">
        <Loader2 className="spin" size={32} color="var(--brand-primary)" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="auth-container">
        <div className="auth-panel">
          <div className="auth-header">
            <h2><Lock color="var(--brand-primary)" /> Login Telegram</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Hubungkan akun Anda untuk Cloud Storage 2GB</p>
          </div>

          {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', textAlign: 'center', background: 'var(--danger-bg)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem' }}>{error}</div>}

          {step === 'phone' && (
            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Nomor Handphone</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={phoneNumber} 
                  onChange={e => setPhoneNumber(e.target.value)} 
                  placeholder="+62812..." 
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : 'Kirim Kode OTP'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Kode Verifikasi</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={phoneCode} 
                  onChange={e => setPhoneCode(e.target.value)} 
                  placeholder="Masukkan 5 angka" 
                  required
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Cek aplikasi Telegram Anda untuk melihat kode dari sistem.</p>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : 'Verifikasi & Login'}
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Kata Sandi (2-Step Verification)</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Masukkan kata sandi..." 
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : 'Selesaikan Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFiles = files.filter(f => f.filename.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 0-9h-.08A7 7 0 1 0 5 15.61"/><path d="M15 19H5.5A3.5 3.5 0 1 1 9 16.5H15a3.5 3.5 0 1 1 0 7Z"/></svg>
          TeleDrive
        </div>
        
        <div className="btn-new-wrapper" style={{ position: 'relative' }}>
          <button className="btn-new" onClick={() => setShowNewMenu(!showNewMenu)}>
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#EA4335" d="M10 2h4v10h-4z"/><path fill="#4285F4" d="M10 12h4v10h-4z"/><path fill="#34A853" d="M2 10h10v4H2z"/><path fill="#FBBC05" d="M12 10h10v4H12z"/></svg> 
            <span>Baru</span>
          </button>
          
          {showNewMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowNewMenu(false)}></div>
              <div style={{ 
                position: 'absolute', top: '100%', left: '1rem', marginTop: '0.25rem',
                background: 'var(--bg-surface)', borderRadius: '8px', padding: '0.5rem 0',
                boxShadow: 'var(--shadow-lg)', width: '220px', zIndex: 50, border: '1px solid var(--border-light)'
              }}>
                <button 
                  onClick={() => { setShowNewMenu(false); setShowFolderModal(true); }}
                  style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  <FolderPlus size={18} color="var(--text-secondary)" /> Folder Baru
                </button>
                <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }}></div>
                <label 
                  style={{ width: '100%', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Upload size={18} color="var(--text-secondary)" /> Unggah File
                  <input type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              </div>
            </>
          )}
        </div>
        
        <nav className="nav-menu">
          <div className="nav-item active">
            <Folder size={18} /> File Saya
          </div>
        </nav>

        <div className="storage-widget">
          <h4>Kapasitas Penyimpanan</h4>
          <div className="storage-progress">
            {/* Hardcoded 50% for visuals or calculate dynamic % if we had a cap */}
            <div className="storage-bar" style={{ width: '100%' }}></div>
          </div>
          <div className="storage-text">
            {formatSize(stats.totalSize)} / Tak Terbatas
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {stats.totalFiles} file diunggah
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Cari di folder ini..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="topbar-actions">
            <div className="view-toggle">
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="Tampilan Baris">
                <ListIcon size={20} />
              </button>
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Tampilan Kotak">
                <LayoutGrid size={20} />
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <div className="profile-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer' }}>
                T
              </div>
              {showProfileMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowProfileMenu(false)}></div>
                  <div style={{ 
                    position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                    background: 'var(--bg-surface)', borderRadius: '8px', padding: '0.5rem 0',
                    boxShadow: 'var(--shadow-lg)', width: '220px', zIndex: 50, border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Akun Anda</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Terhubung ke Telegram</div>
                    </div>
                    
                    <button onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }} style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
                      <User size={16} color="var(--text-secondary)" /> Profil
                    </button>
                    
                    <button onClick={() => { setShowAboutModal(true); setShowProfileMenu(false); }} style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
                      <Info size={16} color="var(--text-secondary)" /> Tentang TeleDrive
                    </button>

                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }}></div>
                    
                    <button onClick={handleLogout} style={{ width: '100%', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.9rem' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(217,48,37,0.04)'} onMouseOut={(e) => e.currentTarget.style.background = 'none'}>
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          <div className="content-header">
            <div className="breadcrumbs">
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.id || 'root'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    className={`breadcrumb-btn ${idx === breadcrumbs.length - 1 ? 'active' : ''}`}
                    onClick={() => navigateToFolder(crumb.id, crumb.name)}
                  >
                    {crumb.id === null && <HomeIcon size={20} />} 
                    {crumb.name !== 'Root' && crumb.name}
                  </button>
                  {idx < breadcrumbs.length - 1 && <ChevronRight size={18} color="var(--text-secondary)" />}
                </span>
              ))}
            </div>
          </div>

          {/* Upload Dropzone inline */}
          {filteredFolders.length === 0 && filteredFiles.length === 0 && !searchQuery && (
            <label className="upload-zone">
              <Upload className="upload-icon" />
              <div>
                <div className="upload-text">Tarik dan lepas file ke sini, atau klik untuk memilih</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Mendukung semua format file hingga 2 GB per file</div>
              </div>
              <input type="file" multiple className="file-input" onChange={handleFileUpload} />
            </label>
          )}

          {searchQuery && filteredFolders.length === 0 && filteredFiles.length === 0 && (
            <div className="empty-state">
              <Search size={48} />
              <p>Tidak ada hasil untuk "{searchQuery}"</p>
            </div>
          )}

          {(filteredFolders.length > 0 || filteredFiles.length > 0) && (
            <div className={viewMode === 'grid' ? 'files-grid' : 'files-list'}>
              {/* Render Folders First */}
              {filteredFolders.map((folder) => (
                <div key={folder.id} className="file-card" onClick={() => navigateToFolder(folder.id, folder.name)}>
                  <div className="file-icon-wrapper folder-icon">
                    <Folder size={viewMode === 'grid' ? 24 : 20} />
                  </div>
                  <div className="file-info">
                    <div className="file-name" title={folder.name}>{folder.name}</div>
                    <div className="file-meta">
                      <span>Folder</span>
                      <span>•</span>
                      <span>{new Date(folder.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="action-btn" 
                      title="Ubah Nama"
                      onClick={(e) => handleRename(e, 'folder', folder.id, folder.name)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="action-btn danger" 
                      title="Hapus Folder"
                      onClick={(e) => handleDelete(e, 'folder', folder.id, folder.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Render Files */}
              {filteredFiles.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-icon-wrapper">
                    <FileIcon size={24} />
                  </div>
                  <div className="file-info">
                    <div className="file-name" title={file.filename}>{file.filename}</div>
                    {viewMode === 'list' ? (
                      <div className="file-meta">
                        <span>{formatSize(file.size)}</span>
                      </div>
                    ) : (
                      <div className="file-meta">
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="file-actions">
                    <button 
                      className="action-btn" 
                      title="Salin Tautan"
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = `${window.location.origin}/api/download/${file.id}`;
                        navigator.clipboard.writeText(link);
                        alert("Tautan unduhan berhasil disalin!");
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                    <a href={`/api/download/${file.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="action-btn primary" title="Unduh">
                      <Download size={16} />
                    </a>
                    <button 
                      className="action-btn" 
                      title="Ubah Nama"
                      onClick={(e) => handleRename(e, 'file', file.id, file.filename)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="action-btn danger" 
                      title="Hapus File"
                      onClick={(e) => handleDelete(e, 'file', file.id, file.filename)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="modal-overlay" onClick={() => setShowFolderModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '340px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Folder baru</h3>
            
            <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Folder tanpa judul" 
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
                style={{ padding: '0.5rem', fontSize: '0.95rem' }}
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowFolderModal(false)} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', color: 'var(--brand-primary)', fontWeight: 500, cursor: 'pointer', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.background='rgba(11,87,208,0.04)'} onMouseOut={e => e.currentTarget.style.background='none'}>
                  Batal
                </button>
                <button type="submit" disabled={creatingFolder || !newFolderName.trim()} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', color: creatingFolder || !newFolderName.trim() ? 'var(--text-muted)' : 'var(--brand-primary)', fontWeight: 500, cursor: creatingFolder || !newFolderName.trim() ? 'not-allowed' : 'pointer', borderRadius: '4px' }} onMouseOver={e => { if(!creatingFolder && newFolderName.trim()) e.currentTarget.style.background='rgba(11,87,208,0.04)'}} onMouseOut={e => e.currentTarget.style.background='none'}>
                  {creatingFolder ? <Loader2 size={16} className="spin" /> : 'Buat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>
              {currentUser?.firstName?.[0] || 'T'}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              {currentUser?.firstName} {currentUser?.lastName || ''}
            </h3>
            {currentUser?.username && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>@{currentUser.username}</p>
            )}
            
            <div style={{ textAlign: 'left', background: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Nomor Handphone Terdaftar</div>
              <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>+{currentUser?.phone || 'Tidak tersedia'}</div>
            </div>
            
            <button onClick={() => setShowProfileModal(false)} style={{ marginTop: '2rem', padding: '0.6rem 2rem', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '24px', fontWeight: 500, cursor: 'pointer' }}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <svg className="logo-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><path d="M17.5 19a4.5 4.5 0 0 0 0-9h-.08A7 7 0 1 0 5 15.61"/><path d="M15 19H5.5A3.5 3.5 0 1 1 9 16.5H15a3.5 3.5 0 1 1 0 7Z"/></svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>TeleDrive</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>Versi 1.0.0</p>
            
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              TeleDrive adalah solusi penyimpanan awan modern yang memanfaatkan keandalan dan kapasitas tak terbatas dari Telegram API sebagai backend penyimpanan Anda.
            </p>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              © 2026 TeleDrive. Hak Cipta Dilindungi.
            </div>
            
            <button onClick={() => setShowAboutModal(false)} style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', background: 'none', color: 'var(--brand-primary)', border: 'none', fontWeight: 500, cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background='rgba(11,87,208,0.04)'} onMouseOut={e => e.currentTarget.style.background='none'}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Upload Toast Indicator */}
      {uploadQueue.length > 0 && (
        <div className="upload-toast" style={{ flexDirection: 'column', alignItems: 'stretch', width: '350px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', fontWeight: 500, fontSize: '1rem' }}>
            Mengunggah {uploadQueue.filter(u => u.status === 'uploading').length} item...
          </div>
          <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'var(--bg-surface)' }}>
            {uploadQueue.map(item => (
              <div key={item.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    {item.status === 'uploading' && <Loader2 className="spin" size={16} color="var(--brand-primary)" />}
                    {item.status === 'completed' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>}
                    {item.status === 'error' && <X size={16} color="var(--danger)" />}
                    {item.status === 'cancelled' && <X size={16} color="var(--text-muted)" />}
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.status === 'uploading' ? `${item.progress}%` : item.status === 'completed' ? 'Selesai' : item.status === 'cancelled' ? 'Dibatalkan' : 'Gagal'}
                    </span>
                    {item.status === 'uploading' && (
                      <button onClick={() => handleCancelUpload(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem', borderRadius: '50%' }}>
                        <X size={14} color="var(--text-secondary)" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="storage-progress" style={{ height: '4px', marginBottom: 0 }}>
                  <div className="storage-bar" style={{ 
                    width: `${item.progress}%`, 
                    transition: 'width 0.2s',
                    background: item.status === 'error' || item.status === 'cancelled' ? 'var(--danger)' : item.status === 'completed' ? 'var(--success)' : 'var(--brand-primary)' 
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
