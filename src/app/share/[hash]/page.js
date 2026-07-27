'use client';

import { useState, useEffect } from 'react';
import { Download, Cloud, File as FileIcon, Lock, Loader2, Folder as FolderIcon } from 'lucide-react';
import { use } from 'react';

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function SharePage({ params }) {
  const resolvedParams = use(params);
  const hash = resolvedParams.hash;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [unlockedPassword, setUnlockedPassword] = useState('');

  const [currentFolderId, setCurrentFolderId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (pass = null, fId = currentFolderId) => {
    setSubmitLoading(true);
    try {
      const options = {
        method: pass ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      if (pass) {
        options.body = JSON.stringify({ password: pass });
      }
      
      let url = `/api/public/meta/${hash}`;
      if (fId) url += `?folderId=${fId}`;

      const res = await fetch(url, options);
      const result = await res.json();
      
      if (res.status === 401 && !pass) {
        setNeedsPassword(true);
      } else if (!res.ok) {
        setError(result.error || 'Terjadi kesalahan');
      } else if (result.isPasswordProtected) {
        setNeedsPassword(true);
      } else {
        setNeedsPassword(false);
        setData(result);
        if (pass) setUnlockedPassword(pass);
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    } finally {
      setLoading(false);
      setSubmitLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    setError(null);
    fetchData(password, currentFolderId);
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Loader2 size={40} className="spin" color="var(--brand-primary)" />
        </div>
      </div>
    );
  }

  const getDownloadUrl = (fileId = null) => {
    let url = `/api/public/download/${hash}?t=${Date.now()}`;
    if (fileId) url += `&fileId=${fileId}`;
    if (unlockedPassword) url += `&password=${encodeURIComponent(unlockedPassword)}`;
    return url;
  };

  const handleFolderClick = (fId) => {
    setCurrentFolderId(fId);
    setLoading(true);
    fetchData(unlockedPassword, fId);
  };

  return (
    <div className="auth-container">
      <div className="auth-panel" style={{ maxWidth: data?.type === 'folder' ? '540px' : '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ display: 'inline-flex', padding: '1.5rem', background: 'var(--brand-bg)', borderRadius: '24px', marginBottom: '1.5rem' }}>
          <Cloud size={48} color="var(--brand-primary)" />
        </div>
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>
          Tautan Publik
        </h2>

        {error && (
          <div style={{ width: '100%', background: 'var(--danger-bg)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {error}
          </div>
        )}

        {needsPassword && !data ? (
          <form onSubmit={handlePasswordSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.5rem' }}>
              Tautan ini dilindungi oleh password. Silakan masukkan password untuk melanjutkan.
            </p>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                className="form-input" 
                placeholder="Masukkan Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-base)' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitLoading} style={{ padding: '0.875rem', borderRadius: '12px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {submitLoading ? <Loader2 size={20} className="spin" /> : 'Akses Tautan'}
            </button>
          </form>
        ) : data ? (
          <div style={{ width: '100%' }}>
            {data.type === 'file' && (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', textAlign: 'center', marginBottom: '1.5rem' }}>
                  Seseorang telah membagikan file dengan Anda melalui Telegram Storage.
                </p>

                <div style={{ width: '100%', background: 'var(--bg-base)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--brand-bg)', borderRadius: '12px' }}>
                    <FileIcon size={24} color="var(--brand-primary)" />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {data.file.filename}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {formatBytes(data.file.size)}
                    </div>
                  </div>
                </div>

                <a 
                  href={getDownloadUrl()}
                  download={data.file.filename}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', textDecoration: 'none' }}
                >
                  <Download size={20} />
                  Unduh File
                </a>
              </>
            )}

            {data.type === 'folder' && (
              <>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                  {data.breadcrumbs && data.breadcrumbs.map((b, index) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        onClick={() => index !== data.breadcrumbs.length - 1 && handleFolderClick(b.id)} 
                        style={{ cursor: index !== data.breadcrumbs.length - 1 ? 'pointer' : 'default', color: index !== data.breadcrumbs.length - 1 ? 'var(--brand-primary)' : 'var(--text-primary)', fontWeight: index === data.breadcrumbs.length - 1 ? 600 : 400 }}
                      >
                        {b.name}
                      </span>
                      {index !== data.breadcrumbs.length - 1 && <span style={{ color: 'var(--text-muted)' }}>/</span>}
                    </div>
                  ))}
                </div>

                <div style={{ width: '100%', background: 'var(--bg-base)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {data.subFolders && data.subFolders.map(folder => (
                      <div 
                        key={folder.id} 
                        onClick={() => handleFolderClick(folder.id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-light)', background: 'transparent', cursor: 'pointer' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(11,87,208,0.02)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
                          <FolderIcon size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.name}</div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {data.items && data.items.map(file => (
                      <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-light)', background: 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
                          <FileIcon size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.filename}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{formatBytes(file.size)}</div>
                          </div>
                        </div>
                        <a 
                          href={getDownloadUrl(file.id)}
                          download={file.filename}
                          style={{ padding: '0.5rem', background: 'var(--brand-bg)', color: 'var(--brand-primary)', borderRadius: '8px', flexShrink: 0, marginLeft: '0.5rem' }}
                          title="Unduh"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                    
                    {(!data.subFolders || data.subFolders.length === 0) && (!data.items || data.items.length === 0) && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Folder ini kosong.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Secured by Telegram Storage
          </p>
        </div>
      </div>
    </div>
  );
}
