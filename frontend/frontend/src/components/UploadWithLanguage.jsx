import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, provider, signInWithPopup, signOut } from '../firebase';

export default function UploadWithLanguage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [captioning, setCaptioning] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchHistory(currentUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (uid) => {
    try {
      const res = await axios.get(`http://localhost:8000/history?uid=${uid}`);
      setHistory(res.data.history);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const deleteVideo = async (filename) => {
    try {
      await axios.delete(`http://localhost:8000/delete?uid=${user.uid}&filename=${filename}`);
      setHistory((prev) => prev.filter((video) => video !== filename));
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setOutputUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    const uid = user ? user.uid : 'guest';

    try {
      await axios.post(`http://localhost:8000/upload?uid=${uid}`, formData);
      setUploading(false);

      setCaptioning(true);
      const res = await axios.get(`http://localhost:8000/caption?uid=${uid}`);
      setOutputUrl(res.data.output);

      if (user) fetchHistory(user.uid);
    } catch (err) {
      console.error('❌ Error uploading or captioning:', err);
      alert('Upload or captioning failed. Check console.');
    }

    setCaptioning(false);
  };

  return (
    <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1f2937' }}>🎤 Upload a Video to Auto-Generate English Captions</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>Welcome,</p>
              <strong style={{ fontSize: '15px', color: '#1f2937' }}>{user.displayName}</strong>
            </div>
          )}
          {user ? (
            <button onClick={() => signOut(auth)} style={{ padding: '8px 14px', background: '#ef4444', color: 'white', borderRadius: '6px', border: 'none' }}>Logout</button>
          ) : (
            <button onClick={() => signInWithPopup(auth, provider)} style={{ padding: '8px 14px', background: '#10b981', color: 'white', borderRadius: '6px', border: 'none' }}>Login with Google</button>
          )}
        </div>
      </div>

      <input
        type="file"
        accept="video/mp4"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ border: '1px solid #d1d5db', padding: '12px', borderRadius: '8px', width: '100%', background: '#fff', marginBottom: '16px' }}
      />

      <button
        onClick={handleUpload}
        disabled={uploading || captioning}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600',
          cursor: uploading || captioning ? 'not-allowed' : 'pointer',
          opacity: uploading || captioning ? 0.6 : 1,
          transition: 'background-color 0.2s ease-in-out'
        }}
      >
        {uploading ? 'Uploading...' : captioning ? 'Generating Captions...' : 'Upload & Caption'}
      </button>

      {(uploading || captioning) && (
        <div style={{ marginTop: '10px' }}>
          <progress style={{ width: '100%' }} />
        </div>
      )}

      {outputUrl && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>🎥 Captioned Video</h3>
          <video
            controls
            src={`http://localhost:8000/videos/${outputUrl}?t=${Date.now()}`}
            style={{ width: '100%', maxWidth: '480px', height: 'auto', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
          />
        </div>
      )}

      {user && history.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>📜 Your Previous Captioned Videos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {history.map((videoUrl, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <video controls src={`http://localhost:8000/videos/${videoUrl}`} style={{ width: '100%', borderRadius: '8px', maxHeight: '240px' }} />
                <button
                  onClick={() => deleteVideo(videoUrl)}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
