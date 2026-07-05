import React, { useRef, useState, useEffect } from 'react';
import { callApi } from '../../services/api';
import { categoryTranslations } from '../../constants/translations';

export default function ReelCard({ job, role, token, onApply, onViewProfile, onChat, userId, t, lang }) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [likes, setLikes] = useState(job.likes || 0);
  const [dislikes, setDislikes] = useState(job.dislikes || 0);
  const [liked, setLiked] = useState(job.liked || false);
  const [disliked, setDisliked] = useState(job.disliked || false);
  const [applied, setApplied] = useState(job.applied || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  // Helper to get localized field
  const getLocalizedTitle = () => {
    if (lang === 'hi' && job.titleHi) return job.titleHi;
    if (lang === 'mr' && job.titleMr) return job.titleMr;
    return job.title;
  };
  const getLocalizedDescription = () => {
    if (lang === 'hi' && job.descriptionHi) return job.descriptionHi;
    if (lang === 'mr' && job.descriptionMr) return job.descriptionMr;
    return job.description;
  };
  const getLocalizedTextDescription = () => {
    if (lang === 'hi' && job.textDescriptionHi) return job.textDescriptionHi;
    if (lang === 'mr' && job.textDescriptionMr) return job.textDescriptionMr;
    return job.textDescription;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setPlaying(true);
        } else {
          videoRef.current?.pause();
          setPlaying(false);
          setShowComments(false);
        }
      },
      { threshold: 0.6 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  async function handleLike() {
    if (!token) return;
    try {
      const res = await callApi(`/jobs/${job.id}/like`, 'POST', token);
      setLikes(res.likes); setDislikes(res.dislikes); setLiked(res.liked); setDisliked(res.disliked);
    } catch (e) {}
  }

  async function handleDislike() {
    if (!token) return;
    try {
      const res = await callApi(`/jobs/${job.id}/dislike`, 'POST', token);
      setLikes(res.likes); setDislikes(res.dislikes); setLiked(res.liked); setDisliked(res.disliked);
    } catch (e) {}
  }

  async function loadComments() {
    try { setComments(await callApi(`/jobs/${job.id}/comments`) || []); } catch (e) {}
  }

  async function postComment() {
    if (!token || !commentText.trim()) return;
    try {
      await callApi(`/jobs/${job.id}/comments`, 'POST', token, { text: commentText });
      setCommentText('');
      loadComments();
    } catch (e) {}
  }

  function toggleComments(e) {
    e.stopPropagation();
    if (!showComments) loadComments();
    setShowComments(!showComments);
  }

  return (
    <div className="ig-reel" ref={cardRef} style={{position: 'relative', overflow: 'hidden'}}>
      {copied && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(14, 165, 233, 0.95)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          Copied share link to clipboard!
        </div>
      )}
      {/* Video / Image / Text Background */}
      {job.videoUrl ? (
        <video ref={videoRef} className="ig-reel-video" src={job.videoUrl} loop muted={muted} playsInline preload="metadata"
          onClick={() => { playing ? videoRef.current?.pause() : videoRef.current?.play(); setPlaying(!playing); }} />
      ) : job.imageUrl ? (
        <div className="ig-reel-image-wrap">
          <img src={job.imageUrl} alt={job.title} className="ig-reel-image" />
        </div>
      ) : (
        <div className="ig-reel-bg">
          <div className="ig-reel-text-content">
            {job.imageUrl && <img src={job.imageUrl} alt="" style={{width:'100%', borderRadius:'8px', maxHeight:'150px', objectFit:'cover', marginBottom:'12px'}} />}
            <h2 className="text-reel-title">{getLocalizedTitle()}</h2>
            {getLocalizedDescription() && <p className="text-reel-desc">{getLocalizedDescription()}</p>}
            {getLocalizedTextDescription() && <p className="text-reel-detail">{getLocalizedTextDescription()}</p>}
            <div className="text-reel-salary">₹{job.salaryMin?.toLocaleString()} - ₹{job.salaryMax?.toLocaleString()}{job.salaryType ? ' ' + t(job.salaryType === 'daily' ? 'perDay' : job.salaryType === 'weekly' ? 'perWeek' : job.salaryType === 'yearly' ? 'perYear' : 'perMonth') : ''}</div>
            {job.locationText && <div className="text-reel-location"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> {job.locationText}</div>}
            {job.contacts && job.contacts.length > 0 && job.contacts[0] && <div className="text-reel-contact"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> {job.contacts.filter(c=>c).join(', ')}</div>}
          </div>
        </div>
      )}

      {/* Bottom info overlay - for video and image reels */}
      {(job.videoUrl || job.imageUrl) && (
        <div className="ig-reel-bottom">
          <div className="ig-reel-info">
            {job.employerId && <button className="ig-username" onClick={() => onViewProfile(job.employerId)}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg> Employer
            </button>}
            <h3>{getLocalizedTitle()}</h3>
            {getLocalizedDescription() && <p className="ig-desc">{getLocalizedDescription()}</p>}
            <div className="ig-tags">
              <span className="ig-tag">{(categoryTranslations[lang] && categoryTranslations[lang][job.category]) || job.categoryDisplay || job.category || 'General'}</span>
              <span className="ig-tag">₹{job.salaryMin?.toLocaleString()}-₹{job.salaryMax?.toLocaleString()}{job.salaryType ? ' ' + t(job.salaryType === 'daily' ? 'perDay' : job.salaryType === 'weekly' ? 'perWeek' : job.salaryType === 'yearly' ? 'perYear' : 'perMonth') : ''}</span>
              {job.locationText && <span className="ig-tag ig-tag-loc"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> {job.locationText}</span>}
              {job.contacts && job.contacts[0] && <span className="ig-tag ig-tag-contact"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> {job.contacts[0]}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Right side action icons */}
      <div className="ig-reel-actions">
        <button className={`ig-action ${liked ? 'active-like' : ''}`} onClick={handleLike}>
          <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <span className="ig-count">{likes}</span>
        </button>
        <button className={`ig-action ${disliked ? 'active-dislike' : ''}`} onClick={handleDislike}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>
          <span className="ig-count">{dislikes}</span>
        </button>
        <button className="ig-action" onClick={toggleComments}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span className="ig-count">{comments.length || ''}</span>
        </button>
        {job.employerId && String(job.employerId) !== String(userId) && token && (
          <button className="ig-action" onClick={() => onChat(job.employerId)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </button>
        )}
        {role === 'SEEKER' && token && (
          <button className={`ig-action ig-apply ${applied ? 'ig-applied' : ''}`} onClick={() => { if (!applied) { onApply(job.id); setApplied(true); } }} disabled={applied}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            <span className="ig-count">{applied ? t('applied') : t('apply')}</span>
          </button>
        )}
        <button className="ig-action" onClick={() => {
          const shareUrl = `${window.location.origin}/jobs/${job.id}`;
          const getTitle = () => (lang === 'hi' && job.titleHi) ? job.titleHi : (lang === 'mr' && job.titleMr) ? job.titleMr : job.title;
          const getDesc = () => (lang === 'hi' && job.descriptionHi) ? job.descriptionHi : (lang === 'mr' && job.descriptionMr) ? job.descriptionMr : job.description;
          if (navigator.share) {
            navigator.share({
              title: getTitle(),
              text: getDesc(),
              url: shareUrl,
            }).catch(() => {});
          } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }).catch(() => {});
          }
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <span className="ig-count">Share</span>
        </button>
        {job.videoUrl && (
          <button className="ig-action" onClick={() => setMuted(!muted)}>
            {muted ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
            )}
          </button>
        )}
      </div>

      {/* Comment drawer (slides from right) - positioned absolute within the reel card */}
      <div className={`comment-drawer ${showComments ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h4>Comments</h4>
          <button className="drawer-close" onClick={() => setShowComments(false)}>&times;</button>
        </div>
        <div className="drawer-comments">
          {comments.length === 0 && <p className="empty-text">No comments yet</p>}
          {comments.map(c => (
            <div key={c.id} className="drawer-comment">
              <strong>{c.userName}</strong>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
        {token && (
          <div className="drawer-input">
            <input placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') postComment(); }} />
            <button className="btn-send" onClick={postComment}>➤</button>
          </div>
        )}
      </div>
    </div>
  );
}
