import React, { useEffect, useState, useRef } from 'react';
import { callApi } from './services/api';
import { translations, categoryTranslations } from './constants/translations';
import { educationLevels } from './constants/educationLevels';
import { emptyJob } from './constants/jobConstants';

import CustomDropdown from './components/common/CustomDropdown';
import ReelCard from './components/feed/ReelCard';
import ChatPage from './components/chat/ChatPage';
import PostsPage from './components/posts/PostsPage';
import ProfilePage from './components/profile/ProfilePage';

import './modern-styles.css';

export default function ModernApp() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSubmitting(true);
      try {
        const data = await callApi('/auth/google', 'POST', null, { accessToken: tokenResponse.access_token, role: auth.role });
        setToken(data.token);
        setRole(data.role);
        setUserId(String(data.userId || ''));
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', String(data.userId || ''));
        showToast(t('welcome'));
        setCurrentView('feed');
      } catch (e) {
        showToast('Google Login failed: ' + (e.message || 'Verification error'));
      } finally {
        setSubmitting(false);
      }
    },
    onError: () => showToast('Google Login Failed')
  });

  const [role, setRole] = useState(localStorage.getItem('role') || 'SEEKER');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [auth, setAuth] = useState({ name: '', identifier: '', password: '', role: 'SEEKER' });
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const t = (key) => (translations[lang] && translations[lang][key]) || translations.en[key] || key;

  const tCat = (value) => (categoryTranslations[lang] && categoryTranslations[lang][value]) || categoryTranslations.en[value] || (value || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  function changeLang(newLang) {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  }

  const [currentView, setCurrentView] = useState('feed'); // feed, profile, myProfile, chat, posts
  const [profileData, setProfileData] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [cursor, setCursor] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('REELS'); // REELS or TEXT
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [employerSearch, setEmployerSearch] = useState('');
  const [employerResults, setEmployerResults] = useState([]);
  const [sortBy, setSortBy] = useState('latest'); // latest or nearest
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [selectedEducation, setSelectedEducation] = useState('ALL');

  const [jobForm, setJobForm] = useState(emptyJob);
  const [videoFile, setVideoFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('video'); // video or text
  const [message, setMessage] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Profile edit
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', bio: '', skills: '', headline: '', location: '', education: [], experience: [] });

  // Review
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });

  // Chat state
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatRecipientId, setChatRecipientId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadCategories();
    loadInitialFeed();
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      }, () => {});
    }
  }, []);

  useEffect(() => { loadInitialFeed(); }, [selectedCategory, selectedEducation, sortBy, userLat, userLng]);

  useEffect(() => {
    if (token) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [token]);

  function showToast(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  async function loadCategories() {
    try { setCategories(await callApi('/categories') || []); } catch (e) {}
  }

  async function loadInitialFeed() {
    try {
      let url = '/jobs/feed?size=30';
      if (userLat && userLng) url += `&lat=${userLat}&lng=${userLng}`;
      const data = await callApi(url);
      let items = data.items || [];
      if (selectedCategory !== 'ALL') items = items.filter(j => j.category === selectedCategory);
      if (selectedEducation !== 'ALL') items = items.filter(j => j.education === selectedEducation);
      if (sortBy === 'nearest' && userLat && userLng) {
        items.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
      }
      setJobs(items);
      setCursor(data.nextCursor || '');
    } catch (e) { setJobs([]); }
  }

  async function register() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        name: auth.name,
        email: auth.identifier.includes('@') ? auth.identifier : null,
        phone: auth.identifier.includes('@') ? null : auth.identifier,
        password: auth.password, role: auth.role
      };
      const data = await callApi('/auth/register', 'POST', null, payload);
      saveSession(data);
    } catch (e) { showToast('Registration failed: ' + e.message); }
    setSubmitting(false);
  }

  async function login() {
    if (submitting) return;
    if (!auth.identifier.trim() || !auth.password.trim()) {
      return showToast('Please enter email/phone and password');
    }
    setSubmitting(true);
    try {
      const data = await callApi('/auth/login', 'POST', null, { identifier: auth.identifier.trim(), password: auth.password });
      saveSession(data);
    } catch (e) { showToast('Login failed: ' + (e.message || 'Invalid credentials')); }
    setSubmitting(false);
  }

  function saveSession(data) {
    setToken(data.token); setRole(data.role); setUserId(data.userId || '');
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', data.userId || '');
    showToast('Welcome!');
  }

  function logout() {
    setToken(''); setRole('SEEKER'); setUserId('');
    localStorage.clear();
    setAuth({ name: '', identifier: '', password: '', role: 'SEEKER' });
    setCurrentView('feed');
    showToast('Logged out');
  }

  async function uploadVideo() {
    if (!token || !videoFile) return;
    try {
      showToast('Uploading...');
      const fd = new FormData(); fd.append('file', videoFile);
      const res = await callApi('/videos/upload', 'POST', token, fd, true);
      setJobForm({ ...jobForm, videoUrl: res.videoUrl });
      showToast('Video uploaded');
    } catch (e) { showToast('Upload failed'); }
  }

  async function postJob() {
    if (submitting) return;
    if (!token) return showToast('Login first');
    if (!jobForm.videoUrl && !jobForm.textDescription && !jobForm.description) return showToast('Add video or description');
    if (!jobForm.category) return showToast('Select a category');
    const contacts = (jobForm.contacts || []).filter(c => c.trim());
    setSubmitting(true);
    try {
      await callApi('/jobs', 'POST', token, {
        ...jobForm, contacts,
        salaryMin: Number(jobForm.salaryMin), salaryMax: Number(jobForm.salaryMax),
        latitude: Number(jobForm.latitude), longitude: Number(jobForm.longitude)
      });
      showToast('Job posted! 🎉');
      setJobForm(emptyJob); setVideoFile(null); setShowJobForm(false);
      loadMyJobs();
      loadInitialFeed();
    } catch (e) { showToast('Failed: ' + e.message); }
    setSubmitting(false);
  }

  async function apply(jobId) {
    if (submitting) return;
    if (!token) return showToast('Login to apply');
    setSubmitting(true);
    try { await callApi('/applications', 'POST', token, { jobId }); showToast('Applied successfully'); }
    catch (e) { showToast('Failed: ' + e.message); }
    setSubmitting(false);
  }

  async function generateFromAI() {
    if (!jobForm.title) return showToast('Enter title first');
    const langMap = { en: 'english', hi: 'hindi', mr: 'marathi' };
    try {
      showToast('Generating...');
      const res = await callApi('/jobs/generate-description', 'POST', token, { title: jobForm.title, category: jobForm.category, language: langMap[lang] || 'english' });
      setJobForm({ ...jobForm, description: res.description });
      showToast('Generated successfully');
    } catch (e) { showToast('AI failed: ' + e.message); }
  }

  async function rewriteWithAI() {
    if (!jobForm.description) return showToast('Enter description first');
    const langMap = { en: 'english', hi: 'hindi', mr: 'marathi' };
    try {
      showToast('Rewriting...');
      const res = await callApi('/jobs/rewrite-description', 'POST', token, { description: jobForm.description, title: jobForm.title, language: langMap[lang] || 'english' });
      setJobForm({ ...jobForm, description: res.description });
      showToast('Rewritten successfully');
    } catch (e) { showToast('Rewrite failed: ' + e.message); }
  }

  // ═══ PROFILE ═══
  async function viewProfile(uid) {
    try {
      const data = await callApi(`/users/${uid}/profile`);
      setProfileData(data);
      setCurrentView('profile');
      setReviewForm({ rating: 0, comment: '' });
    } catch (e) { showToast('Profile not found'); }
  }

  async function viewMyProfile() {
    if (!userId) return showToast('Login first');
    await viewProfile(userId);
    setCurrentView('myProfile');
  }

  async function updateProfile() {
    try {
      await callApi('/users/me/profile', 'PUT', token, {
        name: profileForm.name,
        bio: profileForm.bio,
        headline: profileForm.headline,
        location: profileForm.location,
        skills: profileForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        education: profileForm.education,
        experience: profileForm.experience
      });
      showToast(t('profileUpdated'));
      setEditProfile(false);
      viewMyProfile();
    } catch (e) { showToast('Update failed'); }
  }

  async function submitReview(targetId) {
    if (!token) return showToast(t('loginFirst'));
    if (reviewForm.rating === 0) return showToast(t('selectRating'));
    try {
      await callApi(`/users/${targetId}/reviews`, 'POST', token, reviewForm);
      showToast(t('reviewSubmitted'));
      setReviewForm({ rating: 0, comment: '' });
      viewProfile(targetId);
    } catch (e) { showToast(e.message || 'Review failed'); }
  }

  // ═══ CHAT ═══
  async function loadConversations() {
    try { setConversations(await callApi('/messages/conversations', 'GET', token) || []); } catch (e) {}
  }

  async function loadUnreadCount() {
    try {
      const res = await callApi('/messages/unread-count', 'GET', token);
      setUnreadCount(res.count || 0);
    } catch(e) {}
  }

  async function openConversation(conv) {
    setActiveConversation(conv);
    try {
      const msgs = await callApi(`/messages/conversations/${conv.id}`, 'GET', token);
      setChatMessages(msgs || []);
    } catch (e) {}
  }

  async function sendMessage() {
    if (!chatInput.trim()) return;
    if (activeConversation) {
      const receiverId = activeConversation.participantIds.find(id => String(id) !== String(userId));
      try {
        await callApi('/messages/send', 'POST', token, { receiverId, content: chatInput });
        setChatInput('');
        openConversation(activeConversation);
      } catch (e) { showToast('Failed to send: ' + (e.message || 'Unknown error')); }
    } else if (chatRecipientId) {
      try {
        await callApi('/messages/send', 'POST', token, { receiverId: Number(chatRecipientId), content: chatInput });
        setChatInput('');
        setChatRecipientId('');
        loadConversations();
        const convs = await callApi('/messages/conversations', 'GET', token);
        setConversations(convs);
        if (convs.length > 0) openConversation(convs[0]);
      } catch (e) { showToast('Failed to send: ' + (e.message || 'Unknown error')); }
    } else {
      showToast('Please select a user to message');
    }
  }

  function openChat() {
    setCurrentView('chat');
    setActiveConversation(null);
    setChatMessages([]);
    loadConversations();
  }

  function startChatWithUser(uid) {
    setChatRecipientId(String(uid));
    setActiveConversation(null);
    setChatMessages([]);
    setCurrentView('chat');
    loadConversations();
  }

  // ═══ POSTS (MY JOBS) ═══
  const [myJobs, setMyJobs] = useState([]);

  async function loadMyJobs() {
    if (!userId) return;
    try {
      const profile = await callApi(`/users/${userId}/profile`);
      setMyJobs(profile.jobs || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteJob(jobId) {
    if (!window.confirm('Are you sure you want to delete this job post?')) return;
    try {
      await callApi(`/jobs/${jobId}`, 'DELETE', token);
      showToast('Job deleted successfully');
      loadMyJobs();
      loadInitialFeed();
    } catch (e) {
      showToast('Failed to delete job: ' + e.message);
    }
  }

  function openPosts() {
    setCurrentView('posts');
    loadMyJobs();
    setShowJobForm(false);
  }

  return (
    <div className="modern-app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo" onClick={() => { setCurrentView('feed'); loadInitialFeed(); }} style={{cursor:'pointer'}}>
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="url(#grad)"/>
              <path d="M9.5 7.5v9l7-4.5-7-4.5z" fill="white"/>
              <defs><linearGradient id="grad" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#0ea5e9"/><stop offset="1" stopColor="#06b6d4"/></linearGradient></defs>
            </svg>
            JobReel
          </h1>

          {token ? (
            <div className="header-actions">
              {/* Language Selector */}
              <div className="lang-switcher">
                {[{v:'en',l:'EN'},{v:'hi',l:'हिं'},{v:'mr',l:'मरा'}].map(o => (
                  <button key={o.v} className={`lang-btn ${lang === o.v ? 'active' : ''}`} onClick={() => changeLang(o.v)}>{o.l}</button>
                ))}
              </div>
              {role !== 'SEEKER' && (
                <button onClick={openPosts} className="btn-header-icon" title={t('posts')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{t('posts')}</span>
                </button>
              )}
              <button onClick={openChat} className="btn-header-icon" title={unreadCount > 0 ? `${unreadCount} ${t('unreadMsg')}` : t('messages')} style={{position:'relative'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
              </button>
              <div className="user-badge" onClick={viewMyProfile} style={{cursor:'pointer'}} title={t('viewProfile')}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                <span>{role === 'EMPLOYER' ? t('employer') : role === 'ADMIN' ? t('admin') : t('seeker')}</span>
              </div>
              <button onClick={logout} className="btn-logout" title={t('logout')}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
              </button>
            </div>
          ) : (
            <div className="lang-switcher">
              {[{v:'en',l:'EN'},{v:'hi',l:'हिं'},{v:'mr',l:'मरा'}].map(o => (
                <button key={o.v} className={`lang-btn ${lang === o.v ? 'active' : ''}`} onClick={() => changeLang(o.v)}>{o.l}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      {message && <div className="toast">{message}</div>}

      {/* Bottom Nav */}
      {token && (
        <nav className="bottom-nav">
          <button className={currentView === 'feed' ? 'active' : ''} onClick={() => setCurrentView('feed')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>{t('home')}</span>
          </button>
          {role !== 'SEEKER' && (
            <button className={currentView === 'posts' ? 'active' : ''} onClick={openPosts}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>{t('posts')}</span>
            </button>
          )}
          <button className={currentView === 'chat' ? 'active' : ''} onClick={openChat} style={{position:'relative'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span>{t('chat')}</span>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </button>
          <button className={currentView === 'myProfile' ? 'active' : ''} onClick={viewMyProfile}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>{t('profile')}</span>
          </button>
        </nav>
      )}

      {/* ═══ AUTH ═══ */}
      {!token && currentView === 'feed' && (
        <div className="auth-page">
          <div className="auth-container">
            <div className="auth-header">
              <h2 className="auth-title">{authMode === 'login' ? t('login') : t('signUp')}</h2>
              <p className="auth-subtitle">{authMode === 'login' ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}</p>
            </div>
            <div className="auth-tabs-row">
              <button type="button" className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>{t('login')}</button>
              <button type="button" className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>{t('signUp')}</button>
            </div>
            <div className="auth-form">
              {authMode === 'register' && (
                <div className="auth-field">
                  <label className="auth-label">{t('yourName')}</label>
                  <input className="auth-input" placeholder="John Doe" value={auth.name} onChange={e => setAuth({...auth, name: e.target.value})} />
                </div>
              )}
              <div className="auth-field">
                <label className="auth-label">{t('email')}</label>
                <input className="auth-input" placeholder="email@example.com" value={auth.identifier} onChange={e => setAuth({...auth, identifier: e.target.value})} />
              </div>
              <div className="auth-field">
                <label className="auth-label">{t('password')}</label>
                <input className="auth-input" type="password" placeholder="••••••••" value={auth.password} onChange={e => setAuth({...auth, password: e.target.value})} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); authMode === 'login' ? login() : register(); }}} />
              </div>
              {authMode === 'register' && (
                <div className="auth-field">
                  <label className="auth-label">{t('role')}</label>
                  <div className="auth-role-toggle">
                    <button type="button" className={`auth-role-btn ${auth.role === 'SEEKER' ? 'active' : ''}`} onClick={() => setAuth({...auth, role: 'SEEKER'})}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      {t('lookingForWork')}
                    </button>
                    <button type="button" className={`auth-role-btn ${auth.role === 'EMPLOYER' ? 'active' : ''}`} onClick={() => setAuth({...auth, role: 'EMPLOYER'})}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                      {t('hiring')}
                    </button>
                  </div>
                </div>
              )}
              <button type="button" onClick={authMode === 'login' ? login : register} className="auth-submit" disabled={submitting || !auth.identifier.trim() || !auth.password.trim() || (authMode === 'register' && !auth.name?.trim())}>
                {submitting ? <span className="spinner"></span> : (authMode === 'login' ? t('login') : t('createAccount'))}
              </button>

              <div style={{ textAlign: 'center', margin: '15px 0', color: 'var(--muted)' }}>OR</div>
              
              <button type="button" className="auth-submit" style={{ backgroundColor: '#fff', color: '#333', border: '1px solid #ddd' }} onClick={() => googleLoginHandler()} disabled={submitting}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8, verticalAlign: 'middle' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FEED VIEW ═══ */}
      {currentView === 'feed' && token && (
        <>
          {/* Preview Modal */}
          {showPreview && (
            <div className="jf-preview-overlay" onClick={() => setShowPreview(false)}>
              <div className="jf-preview-modal" onClick={e => e.stopPropagation()}>
                <div className="jf-preview-header">
                  <h4>{t('preview')}</h4>
                  <div className="jf-preview-toggle">
                    <button className={previewMode === 'video' ? 'active' : ''} onClick={() => setPreviewMode('video')}>{t('video')}</button>
                    <button className={previewMode === 'text' ? 'active' : ''} onClick={() => setPreviewMode('text')}>{t('text')}</button>
                  </div>
                  <button onClick={() => setShowPreview(false)} className="jf-preview-close">✕</button>
                </div>
                <div className="jf-preview-reel-wrap">
                  <ReelCard
                    job={{
                      id: 'preview',
                      title: jobForm.title || 'Job Title',
                      description: jobForm.description || '',
                      textDescription: jobForm.textDescription || '',
                      salaryMin: Number(jobForm.salaryMin),
                      salaryMax: Number(jobForm.salaryMax),
                      salaryType: jobForm.salaryType,
                      category: jobForm.category,
                      categoryDisplay: tCat(jobForm.category),
                      videoUrl: previewMode === 'video' ? (mediaFile?.type.startsWith('video') ? (jobForm.videoUrl || mediaPreview) : null) : null,
                      imageUrl: previewMode === 'video' ? (mediaFile?.type.startsWith('image') ? (jobForm.videoUrl || mediaPreview) : null) : (mediaFile?.type.startsWith('image') ? mediaPreview : null),
                      locationText: jobForm.locationText,
                      contacts: (jobForm.contacts || []).filter(c => c.trim()),
                      likes: 0, dislikes: 0, liked: false, disliked: false, applied: false,
                      employerId: null
                    }}
                    role={role} token={null} onApply={() => {}} onViewProfile={() => {}} onChat={() => {}} userId="" t={t} lang={lang}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mini Filters Bar */}
          <div className="mini-filters">
            <div className="mini-top-row">
              <div className="view-toggle-mini">
                <button className={viewMode === 'REELS' ? 'active' : ''} onClick={() => setViewMode('REELS')}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 001.553.894l2-1.333a1 1 0 000-1.789l-2-1.333z"/></svg>
                  {t('video')}
                </button>
                <button className={viewMode === 'TEXT' ? 'active' : ''} onClick={() => setViewMode('TEXT')}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>
                  {t('text')}
                </button>
              </div>
              <div className="mini-filter-dropdowns">
                <CustomDropdown
                  value={selectedCategory === 'ALL' ? '' : selectedCategory}
                  onChange={val => setSelectedCategory(val || 'ALL')}
                  placeholder={t('all') + ' ' + t('category')}
                  options={[{value: '', label: t('all')}, ...categories.map(cat => ({ value: cat.value, label: tCat(cat.value) }))]}
                />
                <CustomDropdown
                  value={selectedEducation === 'ALL' ? '' : selectedEducation}
                  onChange={val => setSelectedEducation(val || 'ALL')}
                  placeholder={t('education')}
                  options={educationLevels[lang] || educationLevels.en}
                />
                <button className={`mini-sort-btn ${sortBy === 'nearest' ? 'active' : ''}`} onClick={() => setSortBy(sortBy === 'nearest' ? 'latest' : 'nearest')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {sortBy === 'nearest' ? t('nearest') : t('latest')}
                </button>
              </div>
            </div>
          </div>

          {/* Feed */}
          {viewMode === 'REELS' ? (
            <div className="ig-reels-container">
              {jobs.length === 0 && <div className="empty-state"><p>{t('noJobs')}</p></div>}
              {jobs.map(job => (
                <ReelCard key={job.id} job={job} role={role} token={token} onApply={apply} onViewProfile={viewProfile} onChat={startChatWithUser} userId={userId} t={t} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="ig-reels-container">
              {jobs.length === 0 && <div className="empty-state"><p>{t('noJobs')}</p></div>}
              {jobs.map(job => (
                <ReelCard key={job.id} job={{...job, videoUrl: null}} role={role} token={token} onApply={apply} onViewProfile={viewProfile} onChat={startChatWithUser} userId={userId} t={t} lang={lang} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ POSTS VIEW ═══ */}
      {currentView === 'posts' && token && (
        <PostsPage
          myJobs={myJobs}
          token={token}
          role={role}
          userId={userId}
          loadMyJobs={loadMyJobs}
          showToast={showToast}
          onViewProfile={viewProfile}
          showJobForm={showJobForm}
          setShowJobForm={setShowJobForm}
          jobForm={jobForm}
          setJobForm={setJobForm}
          categories={categories}
          educationLevels={educationLevels}
          lang={lang}
          t={t}
          tCat={tCat}
          mediaFile={mediaFile}
          setMediaFile={setMediaFile}
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          mediaPreview={mediaPreview}
          setMediaPreview={setMediaPreview}
          submitting={submitting}
          generateFromAI={generateFromAI}
          rewriteWithAI={rewriteWithAI}
          uploadVideo={uploadVideo}
          postJob={postJob}
          setShowPreview={setShowPreview}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          deleteJob={deleteJob}
        />
      )}

      {/* ═══ CHAT VIEW ═══ */}
      {currentView === 'chat' && token && (
        <ChatPage
          conversations={conversations}
          activeConversation={activeConversation}
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatRecipientId={chatRecipientId}
          setChatRecipientId={setChatRecipientId}
          openConversation={openConversation}
          sendMessage={sendMessage}
          userId={userId}
          setActiveConversation={setActiveConversation}
          token={token}
        />
      )}

      {/* ═══ PROFILE VIEW ═══ */}
      {(currentView === 'profile' || currentView === 'myProfile') && profileData && (
        <ProfilePage
          data={profileData}
          isOwn={currentView === 'myProfile'}
          token={token}
          editProfile={editProfile}
          setEditProfile={setEditProfile}
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          updateProfile={updateProfile}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          submitReview={submitReview}
          onBack={() => setCurrentView('feed')}
          userId={userId}
          onChat={startChatWithUser}
          t={t}
        />
      )}
    </div>
  );
}
