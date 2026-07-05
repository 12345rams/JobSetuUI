import React, { useState } from 'react';
import StarDisplay from '../common/StarDisplay';

export default function ProfilePage({ data, isOwn, token, editProfile, setEditProfile, profileForm, setProfileForm, updateProfile, reviewForm, setReviewForm, submitReview, onBack, userId, onChat, t }) {
  const [tab, setTab] = useState('about');

  function startEdit() {
    setProfileForm({
      name: data.name || '',
      bio: data.bio || '',
      headline: data.headline || '',
      location: data.location || '',
      skills: (data.skills || []).join(', '),
      education: data.education || [],
      experience: data.experience || []
    });
    setEditProfile(true);
  }

  function addEducation() {
    setProfileForm({...profileForm, education: [...profileForm.education, { school: '', degree: '', field: '', year: '' }]});
  }

  function updateEducation(idx, field, value) {
    const edu = [...profileForm.education];
    edu[idx] = {...edu[idx], [field]: value};
    setProfileForm({...profileForm, education: edu});
  }

  function removeEducation(idx) {
    setProfileForm({...profileForm, education: profileForm.education.filter((_, i) => i !== idx)});
  }

  function addExperience() {
    setProfileForm({...profileForm, experience: [...profileForm.experience, { company: '', title: '', startDate: '', endDate: '', description: '' }]});
  }

  function updateExperience(idx, field, value) {
    const exp = [...profileForm.experience];
    exp[idx] = {...exp[idx], [field]: value};
    setProfileForm({...profileForm, experience: exp});
  }

  function removeExperience(idx) {
    setProfileForm({...profileForm, experience: profileForm.experience.filter((_, i) => i !== idx)});
  }

  return (
    <div className="profile-page">
      <button className="back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      {/* Cover Banner */}
      <div className="profile-cover">
        <div className="profile-cover-gradient"></div>
      </div>

      <div className="profile-header-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {data.profilePictureUrl ? (
              <img src={data.profilePictureUrl} alt="" />
            ) : (
              <div className="avatar-placeholder">{(data.name || '?')[0].toUpperCase()}</div>
            )}
          </div>
        </div>
        <div className="profile-info">
          <div className="profile-name-row">
            <h2>{data.name}</h2>
            <span className="profile-role-badge">{data.role}</span>
          </div>
          {data.headline && <p className="profile-headline">{data.headline}</p>}
          {data.location && <p className="profile-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> {data.location}</p>}
          <div className="profile-rating">
            <StarDisplay rating={data.averageRating || 0} />
            <span className="rating-text">{data.averageRating?.toFixed(1) || '0.0'} ({data.totalReviews || 0} reviews)</span>
          </div>
          {data.bio && <p className="profile-bio">{data.bio}</p>}
          {data.skills && data.skills.length > 0 && (
            <div className="profile-skills">
              {data.skills.map((s, i) => <span key={i} className="skill-chip">{s}</span>)}
            </div>
          )}
          <div className="profile-action-btns">
            {isOwn && <button className="btn-primary" onClick={startEdit}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> {t('editProfile')}</button>}
            {!isOwn && (
              <>
                <button className="btn-primary" onClick={() => token ? onChat(data.id) : alert(t('loginFirst'))}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> {t('message')}</button>
                <button className="btn-outline" onClick={() => token ? setTab('reviews') : alert(t('loginFirst'))}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> {t('writeReview')}</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editProfile && (
        <div className="modal-overlay" onClick={() => setEditProfile(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <input className="input" placeholder="Name" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
            <input className="input" placeholder="Headline (e.g. Software Engineer at Google)" value={profileForm.headline} onChange={e => setProfileForm({...profileForm, headline: e.target.value})} />
            <input className="input" placeholder="Location" value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} />
            <textarea className="textarea" placeholder="Bio / About" value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} rows="3" />
            <input className="input" placeholder="Skills (comma separated)" value={profileForm.skills} onChange={e => setProfileForm({...profileForm, skills: e.target.value})} />

            {/* Education Section */}
            <div className="edit-section">
              <div className="edit-section-header">
                <h4>Education</h4>
                <button className="btn-add-sm" onClick={addEducation}>+ Add</button>
              </div>
              {profileForm.education.map((edu, idx) => (
                <div key={idx} className="edit-entry">
                  <input className="input" placeholder="School / University" value={edu.school} onChange={e => updateEducation(idx, 'school', e.target.value)} />
                  <div className="form-row">
                    <input className="input" placeholder="Degree" value={edu.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)} />
                    <input className="input" placeholder="Field of study" value={edu.field} onChange={e => updateEducation(idx, 'field', e.target.value)} />
                  </div>
                  <div className="form-row">
                    <input className="input" placeholder="Year (e.g. 2020-2024)" value={edu.year} onChange={e => updateEducation(idx, 'year', e.target.value)} />
                    <button className="btn-remove" onClick={() => removeEducation(idx)}>&times;</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Experience Section */}
            <div className="edit-section">
              <div className="edit-section-header">
                <h4>Experience</h4>
                <button className="btn-add-sm" onClick={addExperience}>+ Add</button>
              </div>
              {profileForm.experience.map((exp, idx) => (
                <div key={idx} className="edit-entry">
                  <input className="input" placeholder="Company" value={exp.company} onChange={e => updateExperience(idx, 'company', e.target.value)} />
                  <input className="input" placeholder="Title / Position" value={exp.title} onChange={e => updateExperience(idx, 'title', e.target.value)} />
                  <div className="form-row">
                    <input className="input" placeholder="Start date" value={exp.startDate} onChange={e => updateExperience(idx, 'startDate', e.target.value)} />
                    <input className="input" placeholder="End date (or Present)" value={exp.endDate} onChange={e => updateExperience(idx, 'endDate', e.target.value)} />
                  </div>
                  <textarea className="textarea" placeholder="Description" value={exp.description} onChange={e => updateExperience(idx, 'description', e.target.value)} rows="2" />
                  <button className="btn-remove" onClick={() => removeExperience(idx)}>Remove</button>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={updateProfile}>Save Profile</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={tab === 'about' ? 'active' : ''} onClick={() => setTab('about')}>{t('about')}</button>
        <button className={tab === 'jobs' ? 'active' : ''} onClick={() => setTab('jobs')}>{t('jobs')} ({(data.jobs || []).length})</button>
        <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>{t('reviews')} ({(data.reviews || []).length})</button>
      </div>

      {/* About Tab */}
      {tab === 'about' && (
        <div className="profile-about">
          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="profile-section-card">
              <h4>Education</h4>
              {data.education.map((edu, i) => (
                <div key={i} className="profile-entry">
                  <h5>{edu.school}</h5>
                  <p>{edu.degree}{edu.field ? ` · ${edu.field}` : ''}</p>
                  {edu.year && <span className="entry-date">{edu.year}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="profile-section-card">
              <h4>Experience</h4>
              {data.experience.map((exp, i) => (
                <div key={i} className="profile-entry">
                  <h5>{exp.title}</h5>
                  <p>{exp.company}</p>
                  <span className="entry-date">{exp.startDate} — {exp.endDate || 'Present'}</span>
                  {exp.description && <p className="entry-desc">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {(!data.education || data.education.length === 0) && (!data.experience || data.experience.length === 0) && (
            <p className="empty-text">No education or experience added yet.{isOwn ? ' Click "Edit Profile" to add.' : ''}</p>
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {tab === 'jobs' && (
        <div className="profile-jobs">
          {(!data.jobs || data.jobs.length === 0) && <p className="empty-text">No jobs posted yet</p>}
          {(data.jobs || []).map(job => (
            <div key={job.id} className="text-card">
              <div className="job-content">
                <h3 className="job-title">{job.title}</h3>
                {job.description && <p className="job-desc">{job.description}</p>}
                <div className="job-meta"><span className="salary">₹{job.salaryMin?.toLocaleString()} - ₹{job.salaryMax?.toLocaleString()}{job.salaryType ? ' ' + t(job.salaryType === 'daily' ? 'perDay' : job.salaryType === 'weekly' ? 'perWeek' : job.salaryType === 'yearly' ? 'perYear' : 'perMonth') : ''}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {tab === 'reviews' && (
        <div className="profile-reviews">
          {!isOwn && token && (
            <div className="review-form">
              <h4>{t('leaveReview')}</h4>
              <div className="star-input">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" className={`star ${reviewForm.rating >= n ? 'filled' : ''}`} onClick={() => setReviewForm({...reviewForm, rating: n})}>&#9733;</button>
                ))}
              </div>
              <textarea className="textarea" placeholder={t('writeReview') + '...'} value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} rows="3" />
              <button type="button" className="btn-primary" onClick={() => submitReview(data.id)}>{t('submitReview')}</button>
            </div>
          )}

          {(!data.reviews || data.reviews.length === 0) && <p className="empty-text">No reviews yet</p>}
          {(data.reviews || []).map(r => (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <strong>{r.reviewerName}</strong>
                <StarDisplay rating={r.rating} />
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
              <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
