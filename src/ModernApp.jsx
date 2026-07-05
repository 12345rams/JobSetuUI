import React, { useEffect, useState, useRef, useCallback } from 'react';
import { callApi } from './api';
import { useGoogleLogin } from '@react-oauth/google';
import './modern-styles.css';

// ═══ LANGUAGE SUPPORT ═══
const translations = {
  en: {
    home: 'Home', posts: 'Posts', chat: 'Chat', profile: 'Profile',
    login: 'Login', signUp: 'Sign Up', createAccount: 'Create Account',
    email: 'Email or phone', password: 'Password', yourName: 'Your name',
    seeker: 'Seeker', employer: 'Employer', admin: 'Admin',
    lookingForWork: "I'm looking for work", hiring: "I'm hiring",
    searchJobs: 'Search jobs, skills, location...',
    searchEmployer: 'Search employer name...',
    video: 'Video', text: 'Text', all: 'All', education: 'Education',
    postJob: 'Post Job', close: 'Close', category: 'Category',
    jobTitle: 'Job title', description: 'Description',
    aiGenerate: 'AI Generate', fromVideo: 'From Video',
    minSalary: 'Min salary', maxSalary: 'Max salary',
    uploadVideo: 'Upload Video', textDesc: 'Detailed job info',
    apply: 'Apply', applied: 'Applied', message: 'Message',
    editProfile: 'Edit Profile', writeReview: 'Write Review',
    submitReview: 'Submit Review', leaveReview: 'Leave a Review',
    about: 'About', jobs: 'Jobs', reviews: 'Reviews',
    noJobs: 'No jobs yet', noReviews: 'No reviews yet',
    noEducation: 'No education or experience added yet.',
    viewProfile: 'View Profile', logout: 'Logout',
    messages: 'Messages', unreadMsg: 'unread messages',
    send: 'Send', typeMessage: 'Type a message...',
    newChat: '+ New', conversations: 'Conversations',
    back: 'Back', save: 'Save Profile',
    name: 'Name', headline: 'Headline', location: 'Location',
    bio: 'Bio / About', skills: 'Skills (comma separated)',
    education: 'Education', experience: 'Experience',
    addComment: 'Add a comment...', like: 'Like', comment: 'Comment',
    createPost: 'Create Post', whatsOnMind: "What's on your mind?",
    photo: 'Photo', videoAttach: 'Video', audio: 'Audio', file: 'File',
    noResults: 'No results found', loading: 'Loading...',
    loginFirst: 'Please login first', welcome: 'Welcome!',
    profileUpdated: 'Profile updated', reviewSubmitted: 'Review submitted',
    appliedSuccess: 'Applied successfully', postCreated: 'Post created',
    selectRating: 'Select a rating', searchFailed: 'Search failed',
    rewrite: 'Rewrite with AI',
    contact: 'Contact', contactPlaceholder: 'Phone or email', addContact: 'Add contact',
    salary: 'Salary', perDay: '/day', perWeek: '/week', perMonth: '/month', perYear: '/year',
    location: 'Location', useMyLocation: 'Use my location', locationSet: 'Location set',
    locationPlaceholder: 'e.g. Mumbai, Pune, Delhi...',
    nearest: 'Nearest', latest: 'Latest',
    media: 'Media', uploadMedia: 'Choose image or video', upload: 'Upload', preview: 'Preview',
  },
  hi: {
    home: 'होम', posts: 'पोस्ट', chat: 'चैट', profile: 'प्रोफाइल',
    login: 'लॉगिन', signUp: 'साइन अप', createAccount: 'खाता बनाएं',
    email: 'ईमेल या फोन', password: 'पासवर्ड', yourName: 'आपका नाम',
    seeker: 'नौकरी खोजने वाला', employer: 'नियोक्ता', admin: 'एडमिन',
    lookingForWork: 'मुझे काम चाहिए', hiring: 'मैं भर्ती कर रहा हूं',
    searchJobs: 'नौकरी, कौशल, स्थान खोजें...',
    searchEmployer: 'नियोक्ता का नाम खोजें...',
    video: 'वीडियो', text: 'टेक्स्ट', all: 'सभी', education: 'शिक्षा',
    postJob: 'नौकरी पोस्ट करें', close: 'बंद करें', category: 'श्रेणी',
    jobTitle: 'नौकरी का शीर्षक', description: 'विवरण',
    aiGenerate: 'AI बनाएं', fromVideo: 'वीडियो से',
    minSalary: 'न्यूनतम वेतन', maxSalary: 'अधिकतम वेतन',
    uploadVideo: 'वीडियो अपलोड', textDesc: 'विस्तृत नौकरी जानकारी',
    apply: 'आवेदन करें', applied: 'आवेदन किया', message: 'संदेश',
    editProfile: 'प्रोफाइल संपादित करें', writeReview: 'रिव्यू लिखें',
    submitReview: 'रिव्यू भेजें', leaveReview: 'रिव्यू दें',
    about: 'परिचय', jobs: 'नौकरियां', reviews: 'रिव्यू',
    noJobs: 'अभी कोई नौकरी नहीं', noReviews: 'अभी कोई रिव्यू नहीं',
    noEducation: 'अभी कोई शिक्षा या अनुभव नहीं जोड़ा गया।',
    viewProfile: 'प्रोफाइल देखें', logout: 'लॉगआउट',
    messages: 'संदेश', unreadMsg: 'अपठित संदेश',
    send: 'भेजें', typeMessage: 'संदेश लिखें...',
    newChat: '+ नया', conversations: 'बातचीत',
    back: 'वापस', save: 'प्रोफाइल सहेजें',
    name: 'नाम', headline: 'शीर्षक', location: 'स्थान',
    bio: 'परिचय', skills: 'कौशल (अल्पविराम से अलग)',
    education: 'शिक्षा', experience: 'अनुभव',
    addComment: 'टिप्पणी लिखें...', like: 'पसंद', comment: 'टिप्पणी',
    createPost: 'पोस्ट बनाएं', whatsOnMind: 'आप क्या सोच रहे हैं?',
    photo: 'फोटो', videoAttach: 'वीडियो', audio: 'ऑडियो', file: 'फाइल',
    noResults: 'कोई परिणाम नहीं', loading: 'लोड हो रहा है...',
    loginFirst: 'पहले लॉगिन करें', welcome: 'स्वागत है!',
    profileUpdated: 'प्रोफाइल अपडेट हुई', reviewSubmitted: 'रिव्यू भेजा गया',
    appliedSuccess: 'आवेदन सफल', postCreated: 'पोस्ट बनाई गई',
    selectRating: 'रेटिंग चुनें', searchFailed: 'खोज विफल',
    rewrite: 'AI से फिर से लिखें',
    contact: 'संपर्क', contactPlaceholder: 'फोन या ईमेल', addContact: 'संपर्क जोड़ें',
    salary: 'वेतन', perDay: '/दिन', perWeek: '/सप्ताह', perMonth: '/महीना', perYear: '/साल',
    location: 'स्थान', useMyLocation: 'मेरा स्थान', locationSet: 'स्थान सेट',
    locationPlaceholder: 'जैसे मुंबई, पुणे, दिल्ली...',
    nearest: 'नजदीकी', latest: 'नवीनतम',
    media: 'मीडिया', uploadMedia: 'छवि या वीडियो चुनें', upload: 'अपलोड', preview: 'प्रीव्यू',
  },
  mr: {
    home: 'होम', posts: 'पोस्ट', chat: 'चॅट', profile: 'प्रोफाइल',
    login: 'लॉगिन', signUp: 'साइन अप', createAccount: 'खाते तयार करा',
    email: 'ईमेल किंवा फोन', password: 'पासवर्ड', yourName: 'तुमचे नाव',
    seeker: 'नोकरी शोधणारा', employer: 'नियोक्ता', admin: 'ॲडमिन',
    lookingForWork: 'मला काम हवे आहे', hiring: 'मी भरती करत आहे',
    searchJobs: 'नोकरी, कौशल्य, ठिकाण शोधा...',
    searchEmployer: 'नियोक्ताचे नाव शोधा...',
    video: 'व्हिडिओ', text: 'मजकूर', all: 'सर्व', education: 'शिक्षण',
    postJob: 'नोकरी पोस्ट करा', close: 'बंद करा', category: 'वर्ग',
    jobTitle: 'नोकरीचे शीर्षक', description: 'वर्णन',
    aiGenerate: 'AI तयार करा', fromVideo: 'व्हिडिओ वरून',
    minSalary: 'किमान पगार', maxSalary: 'कमाल पगार',
    uploadVideo: 'व्हिडिओ अपलोड', textDesc: 'तपशीलवार नोकरी माहिती',
    apply: 'अर्ज करा', applied: 'अर्ज केला', message: 'संदेश',
    editProfile: 'प्रोफाइल संपादित करा', writeReview: 'रिव्ह्यू लिहा',
    submitReview: 'रिव्ह्यू पाठवा', leaveReview: 'रिव्ह्यू द्या',
    about: 'माहिती', jobs: 'नोकऱ्या', reviews: 'रिव्ह्यू',
    noJobs: 'अजून नोकऱ्या नाहीत', noReviews: 'अजून रिव्ह्यू नाहीत',
    noEducation: 'अजून शिक्षण किंवा अनुभव जोडला नाही.',
    viewProfile: 'प्रोफाइल पहा', logout: 'लॉगआउट',
    messages: 'संदेश', unreadMsg: 'न वाचलेले संदेश',
    send: 'पाठवा', typeMessage: 'संदेश टाइप करा...',
    newChat: '+ नवीन', conversations: 'संभाषणे',
    back: 'मागे', save: 'प्रोफाइल जतन करा',
    name: 'नाव', headline: 'शीर्षक', location: 'ठिकाण',
    bio: 'माहिती', skills: 'कौशल्ये (स्वल्पविरामाने वेगळे करा)',
    education: 'शिक्षण', experience: 'अनुभव',
    addComment: 'टिप्पणी लिहा...', like: 'आवडले', comment: 'टिप्पणी',
    createPost: 'पोस्ट तयार करा', whatsOnMind: 'तुम्ही काय विचार करत आहात?',
    photo: 'फोटो', videoAttach: 'व्हिडिओ', audio: 'ऑडिओ', file: 'फाइल',
    noResults: 'कोणतेही परिणाम नाहीत', loading: 'लोड होत आहे...',
    loginFirst: 'कृपया आधी लॉगिन करा', welcome: 'स्वागत!',
    profileUpdated: 'प्रोफाइल अपडेट झाली', reviewSubmitted: 'रिव्ह्यू पाठवला',
    appliedSuccess: 'अर्ज यशस्वी', postCreated: 'पोस्ट तयार झाली',
    selectRating: 'रेटिंग निवडा', searchFailed: 'शोध अयशस्वी',
    rewrite: 'AI ने पुन्हा लिहा',
    contact: 'संपर्क', contactPlaceholder: 'फोन किंवा ईमेल', addContact: 'संपर्क जोडा',
    salary: 'पगार', perDay: '/दिवस', perWeek: '/आठवडा', perMonth: '/महिना', perYear: '/वर्ष',
    location: 'ठिकाण', useMyLocation: 'माझे ठिकाण', locationSet: 'ठिकाण सेट',
    locationPlaceholder: 'जसे मुंबई, पुणे, नागपूर...',
    nearest: 'जवळचे', latest: 'नवीनतम',
    media: 'मीडिया', uploadMedia: 'फोटो किंवा व्हिडिओ निवडा', upload: 'अपलोड', preview: 'प्रीव्ह्यू',
  }
};

// ═══ CATEGORY TRANSLATIONS ═══
const categoryTranslations = {
  en: {
    'MAID': 'Maid / House Help', 'COOK': 'Cook / Chef', 'NANNY': 'Nanny / Babysitter', 'ELDER_CARE': 'Elder Care / Caretaker',
    'SECURITY_GUARD': 'Security Guard', 'WATCHMAN': 'Watchman / Gatekeeper', 'HOUSEKEEPING': 'Housekeeping / Cleaning',
    'PLUMBER': 'Plumber', 'ELECTRICIAN': 'Electrician', 'CARPENTER': 'Carpenter', 'PAINTER': 'Painter', 'AC_TECHNICIAN': 'AC / Appliance Technician',
    'DRIVER': 'Driver', 'AUTO_DRIVER': 'Auto / Taxi Driver', 'DELIVERY_BOY': 'Delivery Boy', 'COURIER': 'Courier / Logistics',
    'LABOR': 'Labour / Helper', 'MASON': 'Mason / Mistri', 'WELDER': 'Welder', 'CONSTRUCTION': 'Construction Worker',
    'FACTORY_WORKER': 'Factory Worker', 'MACHINE_OPERATOR': 'Machine Operator', 'WAREHOUSE': 'Warehouse / Packing', 'SUPERVISOR': 'Supervisor / Foreman',
    'SHOPKEEPER': 'Shopkeeper / Store Staff', 'SALESMAN': 'Salesman / Sales Executive', 'CASHIER': 'Cashier / Billing', 'TELECALLER': 'Telecaller / BPO',
    'WAITER': 'Waiter / Steward', 'HOTEL_STAFF': 'Hotel / Restaurant Staff', 'BARBER': 'Barber / Salon', 'TAILOR': 'Tailor / Stitching',
    'FARMER': 'Farmer / Farm Worker', 'GARDENER': 'Gardener / Landscaping',
    'DATA_ENTRY': 'Data Entry / Computer Operator', 'OFFICE_BOY': 'Office Boy / Peon', 'RECEPTIONIST': 'Receptionist / Front Desk',
    'ACCOUNTANT': 'Accountant / Finance', 'TEACHER': 'Teacher / Tutor', 'COMPUTER_IT': 'Computer & IT',
    'NURSE': 'Nurse / Compounder', 'PHARMACIST': 'Pharmacist / Medical Store', 'LAB_TECHNICIAN': 'Lab Technician',
    'PART_TIME': 'Part-Time / Flexible', 'WORK_FROM_HOME': 'Work From Home', 'FRESHER': 'Fresher - Any Background', 'OTHER': 'Other',
  },
  hi: {
    'MAID': 'नौकरानी / घरेलू सहायक', 'COOK': 'रसोइया / शेफ', 'NANNY': 'आया / बेबीसिटर', 'ELDER_CARE': 'बुजुर्ग देखभाल',
    'SECURITY_GUARD': 'सुरक्षा गार्ड', 'WATCHMAN': 'चौकीदार', 'HOUSEKEEPING': 'हाउसकीपिंग / सफाई',
    'PLUMBER': 'प्लंबर', 'ELECTRICIAN': 'इलेक्ट्रीशियन', 'CARPENTER': 'बढ़ई', 'PAINTER': 'पेंटर', 'AC_TECHNICIAN': 'AC / टेक्नीशियन',
    'DRIVER': 'ड्राइवर', 'AUTO_DRIVER': 'ऑटो / टैक्सी ड्राइवर', 'DELIVERY_BOY': 'डिलीवरी बॉय', 'COURIER': 'कूरियर / लॉजिस्टिक्स',
    'LABOR': 'मजदूर / हेल्पर', 'MASON': 'राजमिस्त्री', 'WELDER': 'वेल्डर', 'CONSTRUCTION': 'निर्माण कर्मी',
    'FACTORY_WORKER': 'फैक्ट्री कर्मी', 'MACHINE_OPERATOR': 'मशीन ऑपरेटर', 'WAREHOUSE': 'गोदाम / पैकिंग', 'SUPERVISOR': 'सुपरवाइजर',
    'SHOPKEEPER': 'दुकानदार / स्टोर स्टाफ', 'SALESMAN': 'सेल्समैन', 'CASHIER': 'कैशियर / बिलिंग', 'TELECALLER': 'टेलीकॉलर / BPO',
    'WAITER': 'वेटर', 'HOTEL_STAFF': 'होटल / रेस्टोरेंट स्टाफ', 'BARBER': 'नाई / सैलून', 'TAILOR': 'दर्जी / सिलाई',
    'FARMER': 'किसान / खेत मजदूर', 'GARDENER': 'माली / बागवान',
    'DATA_ENTRY': 'डेटा एंट्री / कंप्यूटर ऑपरेटर', 'OFFICE_BOY': 'ऑफिस बॉय / चपरासी', 'RECEPTIONIST': 'रिसेप्शनिस्ट',
    'ACCOUNTANT': 'अकाउंटेंट / वित्त', 'TEACHER': 'शिक्षक / ट्यूटर', 'COMPUTER_IT': 'कंप्यूटर और आईटी',
    'NURSE': 'नर्स / कम्पाउंडर', 'PHARMACIST': 'फार्मासिस्ट / मेडिकल स्टोर', 'LAB_TECHNICIAN': 'लैब टेक्नीशियन',
    'PART_TIME': 'पार्ट-टाइम / लचीला', 'WORK_FROM_HOME': 'घर से काम', 'FRESHER': 'फ्रेशर', 'OTHER': 'अन्य',
  },
  mr: {
    'MAID': 'मोलकरीण / घरकाम', 'COOK': 'स्वयंपाकी / शेफ', 'NANNY': 'आया / बेबीसिटर', 'ELDER_CARE': 'वृद्ध सेवा',
    'SECURITY_GUARD': 'सुरक्षा रक्षक', 'WATCHMAN': 'वॉचमन', 'HOUSEKEEPING': 'हाउसकीपिंग / स्वच्छता',
    'PLUMBER': 'प्लंबर', 'ELECTRICIAN': 'इलेक्ट्रिशियन', 'CARPENTER': 'सुतार', 'PAINTER': 'रंगकाम', 'AC_TECHNICIAN': 'AC / तंत्रज्ञ',
    'DRIVER': 'ड्रायव्हर', 'AUTO_DRIVER': 'ऑटो / टॅक्सी ड्रायव्हर', 'DELIVERY_BOY': 'डिलिव्हरी बॉय', 'COURIER': 'कुरिअर / लॉजिस्टिक्स',
    'LABOR': 'मजूर / हेल्पर', 'MASON': 'गवंडी', 'WELDER': 'वेल्डर', 'CONSTRUCTION': 'बांधकाम कामगार',
    'FACTORY_WORKER': 'कारखाना कामगार', 'MACHINE_OPERATOR': 'मशीन ऑपरेटर', 'WAREHOUSE': 'गोदाम / पॅकिंग', 'SUPERVISOR': 'सुपरवायझर',
    'SHOPKEEPER': 'दुकानदार / स्टोअर स्टाफ', 'SALESMAN': 'सेल्समन', 'CASHIER': 'कॅशिअर / बिलिंग', 'TELECALLER': 'टेलीकॉलर / BPO',
    'WAITER': 'वेटर', 'HOTEL_STAFF': 'हॉटेल / रेस्टॉरंट स्टाफ', 'BARBER': 'न्हावी / सलून', 'TAILOR': 'शिंपी / शिलाई',
    'FARMER': 'शेतकरी / शेतमजूर', 'GARDENER': 'माळी',
    'DATA_ENTRY': 'डेटा एंट्री / संगणक ऑपरेटर', 'OFFICE_BOY': 'ऑफिस बॉय / शिपाई', 'RECEPTIONIST': 'रिसेप्शनिस्ट',
    'ACCOUNTANT': 'अकाउंटंट / वित्त', 'TEACHER': 'शिक्षक / ट्यूटर', 'COMPUTER_IT': 'संगणक आणि आयटी',
    'NURSE': 'नर्स / कंपाउंडर', 'PHARMACIST': 'फार्मासिस्ट / मेडिकल स्टोअर', 'LAB_TECHNICIAN': 'लॅब तंत्रज्ञ',
    'PART_TIME': 'पार्ट-टाइम / लवचिक', 'WORK_FROM_HOME': 'घरून काम', 'FRESHER': 'फ्रेशर', 'OTHER': 'इतर',
  }
};

// ═══ CUSTOM DROPDOWN COMPONENT ═══
function CustomDropdown({ value, onChange, placeholder, options }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(''); } }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  return (
    <div className="jf-dropdown" ref={ref}>
      <button type="button" className={`jf-dropdown-btn ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <span className={value ? 'jf-dd-selected' : 'jf-dd-placeholder'}>{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="jf-dropdown-menu">
          <div className="jf-dd-search-wrap">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input ref={searchRef} className="jf-dd-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} onClick={e => e.stopPropagation()} />
          </div>
          <div className="jf-dd-options">
            {filtered.length === 0 && <div className="jf-dropdown-empty">No results</div>}
            {filtered.map(opt => (
              <div key={opt.value} className={`jf-dropdown-item ${opt.value === value ? 'active' : ''}`} onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}>
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const educationLevels = {
  en: [
    { value: '', label: 'All Education' },
    { value: 'CLASS_1_5', label: 'Class 1-5' },
    { value: 'CLASS_6_8', label: 'Class 6-8' },
    { value: 'CLASS_9_10', label: 'Class 9-10' },
    { value: 'CLASS_11_12', label: 'Class 11-12' },
    { value: 'DIPLOMA', label: 'Diploma / ITI' },
    { value: 'GRADUATE', label: 'Graduate (BA/BSc/BCom)' },
    { value: 'BTECH', label: 'B.Tech / Engineering' },
    { value: 'MEDICAL', label: 'Medical / Nursing' },
    { value: 'CA', label: 'CA / CS / ICWA' },
    { value: 'MBA', label: 'MBA / PGDM' },
    { value: 'PHD', label: 'PhD / Doctorate' },
    { value: 'NONE', label: 'No Education Required' },
  ],
  hi: [
    { value: '', label: 'सभी शिक्षा' },
    { value: 'CLASS_1_5', label: 'कक्षा 1-5' },
    { value: 'CLASS_6_8', label: 'कक्षा 6-8' },
    { value: 'CLASS_9_10', label: 'कक्षा 9-10' },
    { value: 'CLASS_11_12', label: 'कक्षा 11-12' },
    { value: 'DIPLOMA', label: 'डिप्लोमा / ITI' },
    { value: 'GRADUATE', label: 'स्नातक (BA/BSc/BCom)' },
    { value: 'BTECH', label: 'बी.टेक / इंजीनियरिंग' },
    { value: 'MEDICAL', label: 'मेडिकल / नर्सिंग' },
    { value: 'CA', label: 'CA / CS / ICWA' },
    { value: 'MBA', label: 'MBA / PGDM' },
    { value: 'PHD', label: 'PhD / डॉक्टरेट' },
    { value: 'NONE', label: 'शिक्षा आवश्यक नहीं' },
  ],
  mr: [
    { value: '', label: 'सर्व शिक्षण' },
    { value: 'CLASS_1_5', label: 'इयत्ता 1-5' },
    { value: 'CLASS_6_8', label: 'इयत्ता 6-8' },
    { value: 'CLASS_9_10', label: 'इयत्ता 9-10' },
    { value: 'CLASS_11_12', label: 'इयत्ता 11-12' },
    { value: 'DIPLOMA', label: 'डिप्लोमा / ITI' },
    { value: 'GRADUATE', label: 'पदवीधर (BA/BSc/BCom)' },
    { value: 'BTECH', label: 'बी.टेक / अभियांत्रिकी' },
    { value: 'MEDICAL', label: 'वैद्यकीय / नर्सिंग' },
    { value: 'CA', label: 'CA / CS / ICWA' },
    { value: 'MBA', label: 'MBA / PGDM' },
    { value: 'PHD', label: 'PhD / डॉक्टरेट' },
    { value: 'NONE', label: 'शिक्षण आवश्यक नाही' },
  ]
};

const emptyJob = {
  title: '', description: '', salaryMin: 10000, salaryMax: 20000,
  latitude: 12.9716, longitude: 77.5946, category: '', videoUrl: '',
  textDescription: '', contacts: [''], salaryType: 'monthly', locationText: '', education: ''
};

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

  // Posts state
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({ content: '' });
  const [showPostForm, setShowPostForm] = useState(false);

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

  async function semanticSearch(query) {
    if (!query.trim()) { setSearchQuery(''); loadInitialFeed(); return; }
    try {
      setSearchQuery(query);
      const data = await callApi(`/jobs/search?q=${encodeURIComponent(query)}&limit=20`);
      setJobs(data || []);
      setCursor('');
    } catch (e) { showToast(t('searchFailed')); }
  }

  async function searchEmployers(query) {
    setEmployerSearch(query);
    if (!query.trim() || query.trim().length < 2) { setEmployerResults([]); return; }
    try {
      const results = await callApi(`/users/search?q=${encodeURIComponent(query)}&role=EMPLOYER`);
      setEmployerResults(results || []);
    } catch (e) { setEmployerResults([]); }
  }

  async function loadMore() {
    if (!cursor) return;
    try {
      const data = await callApi(`/jobs/feed?size=10&cursor=${encodeURIComponent(cursor)}`);
      setJobs([...jobs, ...(data.items || [])]);
      setCursor(data.nextCursor || '');
    } catch (e) {}
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

  async function generateFromVideo() {
    if (!jobForm.videoUrl) return showToast('Upload video first');
    const langMap = { en: 'english', hi: 'hindi', mr: 'marathi' };
    try {
      showToast('Analyzing video... 🎥');
      const res = await callApi('/jobs/generate-from-video', 'POST', token, { videoUrl: jobForm.videoUrl, title: jobForm.title, language: langMap[lang] || 'english' });
      setJobForm({ ...jobForm, description: res.description });
      showToast('Generated from video');
    } catch (e) { showToast('Failed: ' + e.message); }
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
        // Open the conversation
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

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
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

          {/* Job Form is now rendered inline inside the feed container below */}

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

// ═══════════════════════════════════════════
// REEL CARD COMPONENT (Instagram Reels style - fullscreen)
// ═══════════════════════════════════════════
function ReelCard({ job, role, token, onApply, onViewProfile, onChat, userId, t, lang }) {
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

// ═══════════════════════════════════════════
// CHAT PAGE
// ═══════════════════════════════════════════
const getAvatarBg = (name) => {
  const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#eab308', '#f97316'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

function ChatPage({ conversations, activeConversation, chatMessages, chatInput, setChatInput, chatRecipientId, setChatRecipientId, openConversation, sendMessage, userId, setActiveConversation, token }) {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const formatLastMessageTime = (ts) => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-load user info when chatRecipientId is pre-filled
  useEffect(() => {
    if (chatRecipientId && !activeConversation) {
      callApi(`/users/${chatRecipientId}/profile`, 'GET', token)
        .then(data => {
          if (data && data.name) setSelectedUser({ id: data.id, name: data.name, role: data.role });
        })
        .catch(() => {});
    }
  }, [chatRecipientId]);

  // Search users by name
  useEffect(() => {
    if (searchQuery.trim().length < 1) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await callApi(`/users/search?q=${encodeURIComponent(searchQuery)}`, 'GET', token);
        setSearchResults((results || []).filter(u => String(u.id) !== String(userId)));
      } catch (e) { setSearchResults([]); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function selectUserToChat(user) {
    setSelectedUser(user);
    setChatRecipientId(String(user.id));
    setSearchQuery('');
    setSearchResults([]);
  }

  function clearSelectedUser() {
    setSelectedUser(null);
    setChatRecipientId('');
  }

  // File upload and send
  async function handleFileUpload(e, acceptType) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setShowAttachMenu(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await callApi('/messages/upload', 'POST', token, formData, true);

      // Determine receiver
      let receiverId;
      if (activeConversation) {
        receiverId = activeConversation.participantIds.find(id => String(id) !== String(userId));
      } else if (chatRecipientId) {
        receiverId = Number(chatRecipientId);
      }

      if (receiverId) {
        await callApi('/messages/send', 'POST', token, {
          receiverId,
          content: file.name,
          messageType: uploadRes.messageType,
          fileUrl: uploadRes.fileUrl,
          fileName: uploadRes.fileName,
          fileSize: uploadRes.fileSize
        });

        if (activeConversation) {
          openConversation(activeConversation);
        } else {
          setChatRecipientId('');
          const convs = await callApi('/messages/conversations', 'GET', token);
          if (convs.length > 0) openConversation(convs[0]);
        }
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function openFileSelector(accept) {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || '*/*';
      fileInputRef.current.click();
    }
  }

  // Render message bubble content based on type
  function renderMessageContent(msg) {
    const type = msg.messageType || 'text';
    
    if (type === 'image') {
      return (
        <div className="msg-media">
          <img src={msg.fileUrl} alt={msg.fileName} className="msg-image" onClick={() => window.open(msg.fileUrl, '_blank')} />
          {msg.content && msg.content !== msg.fileName && <p className="msg-caption">{msg.content}</p>}
        </div>
      );
    }
    if (type === 'video') {
      return (
        <div className="msg-media">
          <video src={msg.fileUrl} controls className="msg-video" />
          {msg.content && msg.content !== msg.fileName && <p className="msg-caption">{msg.content}</p>}
        </div>
      );
    }
    if (type === 'audio') {
      return (
        <div className="msg-media">
          <audio src={msg.fileUrl} controls className="msg-audio" />
        </div>
      );
    }
    if (type === 'file') {
      const sizeStr = msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : '';
      return (
        <div className="msg-file" onClick={() => window.open(msg.fileUrl, '_blank')}>
          <div className="msg-file-icon"></div>
          <div className="msg-file-info">
            <span className="msg-file-name">{msg.fileName || 'File'}</span>
            {sizeStr && <span className="msg-file-size">{sizeStr}</span>}
          </div>
          <div className="msg-file-download">↓</div>
        </div>
      );
    }
    // Default: text
    return <p>{msg.content}</p>;
  }

  const filteredConversations = conversations.filter(conv => {
    const otherName = conv.participantNames?.find((n, i) => String(conv.participantIds[i]) !== String(userId)) || 'User';
    return otherName.toLowerCase().includes(localSearchQuery.toLowerCase());
  });

  const showMainPanel = activeConversation || chatRecipientId || selectedUser;

  return (
    <div className="chat-page">
      <div className="chat-layout">
        {/* Conversation list */}
        <div className={`chat-sidebar ${!showMainPanel ? 'show-sidebar' : ''}`}>
          <div className="chat-sidebar-header">
            <h3>Messages</h3>
            <button className="btn-new-chat" onClick={() => { setActiveConversation(null); clearSelectedUser(); }}>+ New</button>
          </div>
          <div className="chat-sidebar-search">
            <div className="search-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                placeholder="Search chats..." 
                value={localSearchQuery} 
                onChange={e => setLocalSearchQuery(e.target.value)} 
              />
              {localSearchQuery && (
                <button className="clear-search-btn" onClick={() => setLocalSearchQuery('')}>&times;</button>
              )}
            </div>
          </div>
          <div className="chat-conv-list">
            {filteredConversations.length === 0 && <p className="empty-text">No conversations found</p>}
            {filteredConversations.map(conv => {
              const otherName = conv.participantNames?.find((n, i) => String(conv.participantIds[i]) !== String(userId)) || 'User';
              return (
                <div key={conv.id} className={`chat-conv-item ${activeConversation?.id === conv.id ? 'active' : ''}`} onClick={() => openConversation(conv)}>
                  <div className="conv-avatar" style={{ backgroundColor: getAvatarBg(otherName), color: '#fff', fontWeight: 'bold' }}>{otherName[0]?.toUpperCase()}</div>
                  <div className="conv-info">
                    <div className="conv-info-top">
                      <strong>{otherName}</strong>
                      <span className="conv-time">{formatLastMessageTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className="conv-last-msg">{conv.lastMessage || 'No messages'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat area - right side */}
        <div className={`chat-main ${!showMainPanel ? 'hide-main' : ''}`}>
          {!activeConversation && (
            <div className="chat-new-conv">
              <h4>Start a new conversation</h4>
              {selectedUser ? (
                <div className="selected-user-chip">
                  <div className="chip-avatar" style={{ backgroundColor: getAvatarBg(selectedUser.name), color: '#fff', fontWeight: 'bold' }}>{selectedUser.name[0]?.toUpperCase()}</div>
                  <div className="chip-info">
                    <strong>{selectedUser.name}</strong>
                    <span className="chip-role">{selectedUser.role}</span>
                  </div>
                  <button className="chip-remove" onClick={clearSelectedUser}>&times;</button>
                </div>
              ) : (
                <div className="user-search-box">
                  <input className="input" placeholder="Search user by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  {searching && <p className="empty-text">Searching...</p>}
                  {searchResults.length > 0 && (
                    <div className="user-search-results">
                      {searchResults.map(u => (
                        <div key={u.id} className="user-search-item" onClick={() => selectUserToChat(u)}>
                          <div className="conv-avatar" style={{ backgroundColor: getAvatarBg(u.name), color: '#fff', fontWeight: 'bold' }}>{u.name[0]?.toUpperCase()}</div>
                          <div className="conv-info">
                            <strong>{u.name}</strong>
                            <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{u.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery && !searching && searchResults.length === 0 && <p className="empty-text">No users found</p>}
                </div>
              )}
              {(selectedUser || chatRecipientId) && (
                <div className="chat-input-bar" style={{marginTop: '0.75rem'}}>
                  <input className="input" placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                  <button className="btn-send" onClick={sendMessage}>Send</button>
                </div>
              )}
            </div>
          )}

          {activeConversation && (
            <>
              {(() => {
                const otherName = activeConversation.participantNames?.find((n, i) => String(activeConversation.participantIds[i]) !== String(userId)) || 'Chat';
                return (
                  <div className="chat-header-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="back-btn-sm" onClick={() => setActiveConversation(null)}>←</button>
                    <div className="conv-avatar" style={{ backgroundColor: getAvatarBg(otherName), color: '#fff', fontSize: '0.85rem', width: '32px', height: '32px', fontWeight: 'bold' }}>{otherName[0]?.toUpperCase()}</div>
                    <h4 style={{ margin: 0 }}>{otherName}</h4>
                  </div>
                );
              })()}
              <div className="chat-messages">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`chat-msg ${String(msg.senderId) === String(userId) ? 'sent' : 'received'}`}>
                    <div className="msg-bubble">
                      {renderMessageContent(msg)}
                      <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-bar">
                {/* Attachment button */}
                <div className="attach-wrapper">
                  <button className="btn-attach" onClick={() => setShowAttachMenu(!showAttachMenu)} title="Attach file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                  {showAttachMenu && (
                    <div className="attach-menu">
                      <button onClick={() => openFileSelector('image/*')} title="Photo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        Photo
                      </button>
                      <button onClick={() => openFileSelector('video/*')} title="Video">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                        Video
                      </button>
                      <button onClick={() => openFileSelector('audio/*')} title="Audio">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        Audio
                      </button>
                      <button onClick={() => openFileSelector('*/*')} title="File">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        File
                      </button>
                    </div>
                  )}
                </div>
                <input className="input" placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button className="btn-send" onClick={sendMessage} disabled={uploading}>{uploading ? '...' : 'Send'}</button>
              </div>
              {/* Hidden file input */}
              <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFileUpload} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// POSTS PAGE (LinkedIn-style feed)
// ═══════════════════════════════════════════
function PostsPage({ 
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

// ═══════════════════════════════════════════
// PROFILE PAGE COMPONENT (LinkedIn style with education/experience)
// ═══════════════════════════════════════════
function ProfilePage({ data, isOwn, token, editProfile, setEditProfile, profileForm, setProfileForm, updateProfile, reviewForm, setReviewForm, submitReview, onBack, userId, onChat, t }) {
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

// Star display component
function StarDisplay({ rating }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
    </span>
  );
}
