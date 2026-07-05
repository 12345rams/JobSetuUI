import React from 'react';
import CustomDropdown from '../common/CustomDropdown';
import { callApi } from '../../services/api';

export default function PostsPage({ 
  myJobs, token, role, userId, loadMyJobs, showToast, onViewProfile,
  showJobForm, setShowJobForm, jobForm, setJobForm, categories, educationLevels, lang, t, tCat, mediaFile, setMediaFile, videoFile, setVideoFile, mediaPreview, setMediaPreview, submitting, generateFromAI, rewriteWithAI, uploadVideo, postJob, setShowPreview, previewMode, setPreviewMode, deleteJob
}) {
  const emptyJob = {
    title: '', description: '', salaryMin: 10000, salaryMax: 20000,
    latitude: 12.9716, longitude: 77.5946, category: '', videoUrl: '',
    textDescription: '', contacts: [''], salaryType: 'monthly', locationText: '', education: ''
  };

  return (
    <div className="posts-page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="posts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', margin: 0 }}>My Job Posts</h2>
        {!showJobForm && (
          <button 
            className="btn-primary" 
            onClick={() => setShowJobForm(true)}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: 'bold' }}
          >
            + Post Job
          </button>
        )}
        {showJobForm && (
          <button 
            className="btn-secondary" 
            onClick={() => {
              setShowJobForm(false);
              setJobForm(emptyJob);
            }}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: 'bold', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}
      </div>

      {showJobForm ? (
        <div className="post-form-card" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          <div className="inline-job-form-container" style={{ margin: '0', padding: '0', boxShadow: 'none', border: 'none', maxWidth: '100%', width: '100%' }}>
            <div className="jf-body" style={{ marginTop: '10px' }}>
              {/* Category */}
              <div className="jf-field">
                <label className="jf-label">{t('category')}</label>
                <CustomDropdown
                  value={jobForm.category}
                  onChange={val => setJobForm({...jobForm, category: val})}
                  placeholder={t('category') + '...'}
                  options={categories.map(cat => ({ value: cat.value, label: tCat(cat.value) }))}
                />
              </div>

              {/* Education */}
              <div className="jf-field">
                <label className="jf-label">{t('education')}</label>
                <CustomDropdown
                  value={jobForm.education}
                  onChange={val => setJobForm({...jobForm, education: val})}
                  placeholder={t('education') + '...'}
                  options={(educationLevels[lang] || educationLevels.en).filter(e => e.value)}
                />
              </div>

              {/* Title */}
              <div className="jf-field">
                <label className="jf-label">{t('jobTitle')}</label>
                <input className="jf-input" placeholder={t('jobTitle')} value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
              </div>

              {/* Description + AI */}
              <div className="jf-field">
                <label className="jf-label">{t('description')}</label>
                <textarea className="jf-textarea" placeholder={t('description')} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} rows="3" />
                <div className="jf-ai-row">
                  <button type="button" className="jf-ai-chip" onClick={generateFromAI} disabled={!jobForm.title}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    {t('aiGenerate')}
                  </button>
                  <button type="button" className="jf-ai-chip" onClick={rewriteWithAI} disabled={!jobForm.description}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    {t('rewrite')}
                  </button>
                </div>
              </div>

              {/* Salary Range */}
              <div className="jf-field">
                <div className="jf-label-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  <label className="jf-label">{t('salary')}</label>
                  <span className="jf-salary-value">₹{Number(jobForm.salaryMin).toLocaleString()} — ₹{Number(jobForm.salaryMax).toLocaleString()} {t(jobForm.salaryType === 'daily' ? 'perDay' : jobForm.salaryType === 'weekly' ? 'perWeek' : jobForm.salaryType === 'yearly' ? 'perYear' : 'perMonth')}</span>
                </div>
                <div className="jf-salary-type-row">
                  {['daily','weekly','monthly','yearly'].map(st => (
                    <button key={st} type="button" className={`jf-salary-type-btn ${jobForm.salaryType === st ? 'active' : ''}`} onClick={() => setJobForm({...jobForm, salaryType: st, salaryMin: 0, salaryMax: st === 'daily' ? 1000 : st === 'weekly' ? 5000 : st === 'yearly' ? 500000 : 20000})}>
                      {t(st === 'daily' ? 'perDay' : st === 'weekly' ? 'perWeek' : st === 'yearly' ? 'perYear' : 'perMonth')}
                    </button>
                  ))}
                </div>
                {(() => {
                  const rangeConfig = { daily: { max: 5000, step: 100, label: '₹5K' }, weekly: { max: 25000, step: 500, label: '₹25K' }, monthly: { max: 500000, step: 1000, label: '₹5L' }, yearly: { max: 5000000, step: 10000, label: '₹50L' } };
                  const cfg = rangeConfig[jobForm.salaryType] || rangeConfig.monthly;
                  return (<>
                    <div className="jf-range-wrap">
                      <div className="jf-range-track">
                        <div className="jf-range-fill" style={{
                          left: `${(jobForm.salaryMin / cfg.max) * 100}%`,
                          right: `${100 - (jobForm.salaryMax / cfg.max) * 100}%`
                        }}></div>
                      </div>
                      <input type="range" className="jf-range jf-range-min" min="0" max={cfg.max} step={cfg.step} value={jobForm.salaryMin} onChange={e => {
                        const val = Number(e.target.value);
                        if (val <= jobForm.salaryMax) setJobForm({...jobForm, salaryMin: val});
                      }} />
                      <input type="range" className="jf-range jf-range-max" min="0" max={cfg.max} step={cfg.step} value={jobForm.salaryMax} onChange={e => {
                        const val = Number(e.target.value);
                        if (val >= jobForm.salaryMin) setJobForm({...jobForm, salaryMax: val});
                      }} />
                    </div>
                    <div className="jf-range-labels"><span>₹0</span><span>{cfg.label}</span></div>
                  </>);
                })()}
              </div>

              {/* Contacts */}
              <div className="jf-field">
                <div className="jf-label-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <label className="jf-label">{t('contact')}</label>
                  <button type="button" className="jf-add-btn" onClick={() => setJobForm({...jobForm, contacts: [...(jobForm.contacts || []), '']})}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
                {(jobForm.contacts || ['']).map((c, i) => (
                  <div key={i} className="jf-contact-row">
                    <input className="jf-input" placeholder={t('contactPlaceholder')} value={c} onChange={e => {
                      const updated = [...(jobForm.contacts || [''])];
                      updated[i] = e.target.value;
                      setJobForm({...jobForm, contacts: updated});
                    }} />
                    {(jobForm.contacts || []).length > 1 && (
                      <button type="button" className="jf-remove-btn" onClick={() => {
                        const updated = [...jobForm.contacts];
                        updated.splice(i, 1);
                        setJobForm({...jobForm, contacts: updated});
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Media (Video or Image) */}
              <div className="jf-field">
                <div className="jf-label-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  <label className="jf-label">{t('media')}</label>
                </div>
                <div className="jf-file-wrap">
                  <input type="file" accept="video/*,image/*" id="mediaFileInputPost" className="jf-file-hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMediaFile(file);
                      setVideoFile(file.type.startsWith('video') ? file : null);
                      setMediaPreview(URL.createObjectURL(file));
                    }
                  }} />
                  <label htmlFor="mediaFileInputPost" className="jf-file-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    {mediaFile ? mediaFile.name.substring(0, 25) : t('uploadMedia')}
                  </label>
                  {mediaFile && mediaFile.type.startsWith('video') && <button type="button" onClick={uploadVideo} className="jf-upload-btn">{t('upload')}</button>}
                  {mediaFile && mediaFile.type.startsWith('image') && <button type="button" onClick={async () => {
                    if (!token || !mediaFile) return;
                    showToast('Uploading...');
                    const fd = new FormData(); fd.append('file', mediaFile);
                    try {
                      const res = await callApi('/videos/upload', 'POST', token, fd, true);
                      setJobForm({...jobForm, videoUrl: res.videoUrl || res.imageUrl || res.url});
                      showToast('Image uploaded');
                    } catch(e) { showToast('Upload failed'); }
                  }} className="jf-upload-btn">{t('upload')}</button>}
                  {jobForm.videoUrl && <span className="jf-check">✓</span>}
                </div>
                {mediaPreview && (
                  <div className="jf-media-preview">
                    {mediaFile?.type.startsWith('video') ? (
                      <video src={mediaPreview} controls style={{width:'100%', borderRadius:'8px', maxHeight:'150px'}} />
                    ) : (
                      <img src={mediaPreview} alt="preview" style={{width:'100%', borderRadius:'8px', maxHeight:'150px', objectFit:'cover'}} />
                    )}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="jf-field">
                <div className="jf-label-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <label className="jf-label">{t('location')}</label>
                  <button type="button" className="jf-location-btn" onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(pos => {
                        setJobForm({...jobForm, latitude: pos.coords.latitude, longitude: pos.coords.longitude, locationText: 'GPS Location'});
                        showToast(t('locationSet'));
                      }, () => showToast('Location access denied'));
                    }
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    GPS
                  </button>
                </div>
                <input className="jf-input" placeholder={t('locationPlaceholder')} value={jobForm.locationText || ''} onChange={e => setJobForm({...jobForm, locationText: e.target.value})} />
              </div>
            </div>

            <div className="jf-actions-row" style={{ marginTop: '15px' }}>
              <button type="button" onClick={() => setShowPreview(true)} className="jf-preview-btn" disabled={!jobForm.title}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {t('preview')}
              </button>
              <button type="button" onClick={postJob} className="jf-submit" disabled={submitting || !jobForm.title || !jobForm.category || (!jobForm.description && !jobForm.videoUrl)}>
                {submitting ? <span className="spinner"></span> : t('postJob')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="posts-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {myJobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.6 }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <p style={{ margin: 0, fontWeight: '600' }}>No job posts yet</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Click "+ Post Job" above to create your first listing.</p>
            </div>
          )}
          {myJobs.map(job => (
            <div key={job.id} className="post-card" style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)' }}>{job.title}</h3>
                  <span className="ig-tag" style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{tCat(job.category)}</span>
                </div>
                <button 
                  onClick={() => deleteJob(job.id)} 
                  style={{ background: '#fef2f2', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', margin: '0 0 12px 0' }}>{job.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                {job.salaryMin && <span><strong>Salary:</strong> ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}/{job.salaryType}</span>}
                {job.locationText && <span><strong>Location:</strong> {job.locationText}</span>}
                {job.contacts && job.contacts.length > 0 && job.contacts[0] && <span><strong>Contact:</strong> {job.contacts.filter(Boolean).join(', ')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
