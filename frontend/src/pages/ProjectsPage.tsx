import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: string;
  name: string;
  created_at?: string;
  last_accessed_at?: string;
}

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Load projects from backend on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setProjects(data.projects);
        }
      } catch (e) {
        // Optionally handle error
      }
      setLoading(false);
    };
    if (token) fetchProjects();
  }, [token]);

  const handleCreate = async () => {
    const name = prompt('Enter a name for your new project:');
    if (!name) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.status === 'success') {
        // Refetch projects
        const res2 = await fetch('http://localhost:8000/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data2 = await res2.json();
        if (data2.status === 'success') {
          setProjects(data2.projects);
        }
        navigate('/whizard', { state: { projectId: data.project.id } });
      } else {
        alert('Failed to create project');
      }
    } catch (e) {
      alert('Failed to create project');
    }
    setLoading(false);
  };

  const handleContinue = (projectId: string) => {
    navigate('/whizard', { state: { projectId } });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)', color: '#fff', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: 0 }}>
      {/* Logout Button */}
      <button onClick={handleLogout} style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(45deg, #f44336, #e57373)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(244,67,54,0.15)', zIndex: 10 }}>Logout</button>
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderBottom: '2px solid #4caf50', width: '100%' }}>
        <h1 style={{ margin: 0, textAlign: 'center', fontSize: '2.5rem', background: 'linear-gradient(45deg, #4caf50, #66bb6a, #81c784)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 20px rgba(76, 175, 80, 0.3)' }}>🗂️ My Projects</h1>
      </div>
      <button onClick={handleCreate} disabled={loading} style={{ margin: '40px 0 30px 0', background: loading ? 'linear-gradient(45deg, #666, #888)' : 'linear-gradient(45deg, #4caf50, #66bb6a)', color: 'white', border: 'none', borderRadius: '25px', padding: '18px 50px', fontSize: '20px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)' }}>{loading ? 'Creating...' : '+ Create New Project'}</button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', width: '100%', maxWidth: 900 }}>
        {loading ? (
          <div style={{ color: '#bbb', fontSize: 18, marginTop: 40 }}>Loading...</div>
        ) : projects.length === 0 ? (
          <div style={{ color: '#bbb', fontSize: 18, marginTop: 40 }}>No projects yet. Click "Create New Project" to get started!</div>
        ) : (
          projects.map((proj) => (
            <div key={proj.id} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px 28px', minWidth: 260, maxWidth: 320, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
              <h2 style={{ color: '#4caf50', marginBottom: 10 }}>{proj.name}</h2>
              <div style={{ color: '#bbb', fontSize: 15, marginBottom: 18 }}>Created: {proj.created_at?.slice(0, 10) || ''}</div>
              <button onClick={() => handleContinue(proj.id)} style={{ background: 'linear-gradient(45deg, #16213e, #0f3460)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: 10 }}>Continue</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsPage; 