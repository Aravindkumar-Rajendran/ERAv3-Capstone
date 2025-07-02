import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as FolderIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { ROUTES } from '../services/routes';

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
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Load projects from backend on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch(ROUTES.PROJECTS, {
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
    if (!newProjectName.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(ROUTES.PROJECTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newProjectName })
      });
      const data = await res.json();
      if (data.status === 'success') {
        // Refetch projects
        const res2 = await fetch(ROUTES.PROJECTS, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data2 = await res2.json();
        if (data2.status === 'success') {
          setProjects(data2.projects);
        }
        setShowModal(false);
        setNewProjectName('');
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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: 8,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: 1100,
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <FolderIcon /> My Projects
        </Typography>
        <IconButton
          onClick={handleLogout}
          color="primary"
          sx={{ ml: 2 }}
        >
          <LogoutIcon />
        </IconButton>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Create Project Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setShowModal(true)}
            disabled={loading}
            sx={{
              borderRadius: 3,
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
            }}
          >
            Create New Project
          </Button>
        </Box>

        {/* Projects Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : projects.length === 0 ? (
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mt: 8 }}
          >
            No projects yet. Click "Create New Project" to get started!
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: 'center',
            }}
          >
            {projects.map((proj) => (
              <Card
                key={proj.id}
                sx={{
                  width: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    {proj.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Created: {proj.created_at?.slice(0, 10) || ''}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleContinue(proj.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    Continue
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {/* Create Project Dialog */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowModal(false);
              setNewProjectName('');
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={loading || !newProjectName.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage; 