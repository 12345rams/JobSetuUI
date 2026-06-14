import React from 'react';
import { useEffect, useState } from 'react';
import { callApi } from './api';

const emptyJob = {
  title: '',
  description: '',
  salaryMin: 10000,
  salaryMax: 20000,
  latitude: 12.9716,
  longitude: 77.5946,
  category: 'General',
  skill: 'Communication',
  videoUrl: '',
  language: 'english'
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || 'SEEKER');
  const [auth, setAuth] = useState({ name: '', identifier: '', password: '', role: 'SEEKER' });
  const [jobs, setJobs] = useState([]);
  const [cursor, setCursor] = useState('');
  const [jobForm, setJobForm] = useState(emptyJob);
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadInitialFeed() {
      const data = await callApi('/jobs/feed?size=5');
      setJobs(data.items);
      setCursor(data.nextCursor || '');
    }
    loadInitialFeed();
  }, []);

  async function register() {
    try {
    const payload = {
      name: auth.name,
      email: auth.identifier.includes('@') ? auth.identifier : null,
      phone: auth.identifier.includes('@') ? null : auth.identifier,
      password: auth.password,
      role: auth.role
    };
    const data = await callApi('/auth/register', 'POST', null, payload);
    saveSession(data);
    } catch (err) {
      setMessage('Registration failed: ' + (err.message || 'Unknown error'));
    }
  }

  async function login() {
    try {
    const data = await callApi('/auth/login', 'POST', null, {
      identifier: auth.identifier,
      password: auth.password
    });
    saveSession(data);
    } catch (err) {
      setMessage('Login failed: ' + (err.message || 'Unknown error'));
    }
  }

  function saveSession(data) {
    setToken(data.token);
    setRole(data.role);
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    setMessage('Logged in successfully');
  }

  function logout() {
    setToken('');
    setRole('SEEKER');
    localStorage.clear();
    setAuth({ name: '', identifier: '', password: '', role: 'SEEKER' });
    setJobs([]);
    setCursor('');
    setJobForm(emptyJob);
    setVideoFile(null);
    setMessage('Logged out successfully');
  }

  async function fetchFeed(next = '') {
    const data = await callApi(`/jobs/feed?size=5${next ? `&cursor=${encodeURIComponent(next)}` : ''}`);
    setJobs(next ? [...jobs, ...data.items] : data.items);
    setCursor(data.nextCursor || '');
  }

  async function uploadVideo() {
    if (!token) {
      setMessage('Please login first to upload videos');
      return;
    }
    if (!videoFile) return;
    try {
      setMessage('Uploading video...');
    const formData = new FormData();
    formData.append('file', videoFile);
    const res = await callApi('/videos/upload', 'POST', token, formData, true);
    setJobForm({ ...jobForm, videoUrl: res.videoUrl });
    setMessage('Video uploaded');
    } catch (err) {
      setMessage('Upload failed: ' + (err.message || 'Unknown error'));
    }
  }

  async function postJob() {
    if (!token) {
      setMessage('Please login first to post jobs');
      return;
    }
    if (!jobForm.videoUrl) {
      setMessage('Please upload a video first');
      return;
    }
    try {
    await callApi('/jobs', 'POST', token, {
      ...jobForm,
      salaryMin: Number(jobForm.salaryMin),
      salaryMax: Number(jobForm.salaryMax),
      latitude: Number(jobForm.latitude),
      longitude: Number(jobForm.longitude)
    });
    setMessage('Job posted');
    setJobForm(emptyJob);
      setVideoFile(null);
    fetchFeed();
    } catch (err) {
      setMessage('Failed to post job: ' + (err.message || 'Unknown error'));
    }
  }

  async function apply(jobId) {
    if (!token) {
      setMessage('Please login first to apply');
      return;
    }
    try {
    await callApi('/applications', 'POST', token, { jobId });
    setMessage('Applied successfully');
    } catch (err) {
      setMessage('Application failed: ' + (err.message || 'Unknown error'));
    }
  }

  async function generateFromAI() {
    if (!jobForm.title) {
      setMessage('Please enter a job title first');
      return;
    }
    try {
      setMessage('Generating description from AI...');
      const res = await callApi('/jobs/generate-description', 'POST', token, {
        title: jobForm.title,
        category: jobForm.category,
        language: jobForm.language
      });
      setJobForm({ ...jobForm, description: res.description });
      setMessage('Description generated from AI');
    } catch (err) {
      setMessage('AI generation failed: ' + (err.message || 'Unknown error'));
    }
  }

  async function generateFromVideo() {
    if (!jobForm.videoUrl) {
      setMessage('Please upload a video first');
      return;
    }
    try {
      setMessage('Generating description from video...');
      const res = await callApi('/jobs/generate-from-video', 'POST', token, {
        videoUrl: jobForm.videoUrl,
        title: jobForm.title,
        language: jobForm.language
      });
      setJobForm({ ...jobForm, description: res.description });
      setMessage('Description generated from video');
    } catch (err) {
      setMessage('Video generation failed: ' + (err.message || 'Unknown error'));
    }
  }

  return (
    <div className="container">
      <h2>Video-First Job Platform</h2>
      {message && <div className="card">{message}</div>}

      {!token ? (
        <div className="card">
          <h3>Register / Login</h3>
          <input placeholder="Name (register)" value={auth.name} onChange={(e) => setAuth({ ...auth, name: e.target.value })} />
          <input
            placeholder="Email or phone"
            value={auth.identifier}
            onChange={(e) => setAuth({ ...auth, identifier: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={auth.password}
            onChange={(e) => setAuth({ ...auth, password: e.target.value })}
          />
          <select value={auth.role} onChange={(e) => setAuth({ ...auth, role: e.target.value })}>
            <option value="SEEKER">SEEKER</option>
            <option value="EMPLOYER">EMPLOYER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <div className="row">
            <button onClick={register}>Register</button>
            <button className="secondary" onClick={login}>Login</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <p>Logged in as <b>{role}</b></p>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      )}

      {(role === 'EMPLOYER' || role === 'ADMIN') && token && (
        <div className="card">
          <h3>Create Job Post</h3>
          <input placeholder="Title" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
          <textarea
            placeholder="Description"
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
          />
          <div className="row">
            <select value={jobForm.language} onChange={(e) => setJobForm({ ...jobForm, language: e.target.value })}>
              <option value="english">English</option>
              <option value="hindi">हिंदी (Hindi)</option>
              <option value="marathi">मराठी (Marathi)</option>
            </select>
            <button className="secondary" onClick={generateFromAI}>✨ Generate from AI</button>
            <button className="secondary" onClick={generateFromVideo} disabled={!jobForm.videoUrl}>🎥 Generate from Video</button>
          </div>
          <div className="row">
            <input
              type="number"
              placeholder="Salary Min"
              value={jobForm.salaryMin}
              onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
            />
            <input
              type="number"
              placeholder="Salary Max"
              value={jobForm.salaryMax}
              onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
            />
          </div>
          <div className="row">
            <input
              placeholder="Latitude"
              value={jobForm.latitude}
              onChange={(e) => setJobForm({ ...jobForm, latitude: e.target.value })}
            />
            <input
              placeholder="Longitude"
              value={jobForm.longitude}
              onChange={(e) => setJobForm({ ...jobForm, longitude: e.target.value })}
            />
          </div>
          <input placeholder="Category" value={jobForm.category} onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })} />
          <input placeholder="Skill" value={jobForm.skill} onChange={(e) => setJobForm({ ...jobForm, skill: e.target.value })} />
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
          <button onClick={uploadVideo}>Upload Video</button>
          <input placeholder="Video URL" value={jobForm.videoUrl} onChange={(e) => setJobForm({ ...jobForm, videoUrl: e.target.value })} />
          <button onClick={postJob}>Post Job</button>
        </div>
      )}

      <h3>Jobs Feed</h3>
      {jobs.map((job) => (
        <div className="card" key={job.id}>
          <h4>{job.title}</h4>
          <p>{job.description}</p>
          <p>Salary: {job.salaryMin} - {job.salaryMax}</p>
          {job.distanceKm != null && <p>Distance: {job.distanceKm.toFixed(2)} km</p>}
          <video controls width="100%" src={job.videoUrl} />
          {role === 'SEEKER' && token && <button onClick={() => apply(job.id)}>One-click Apply</button>}
        </div>
      ))}

      {cursor && <button onClick={() => fetchFeed(cursor)}>Load More</button>}
    </div>
  );
}

