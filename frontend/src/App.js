import React, { useState, useEffect } from 'react';
import { FileText, Shield, User, Upload, Download, Lock, Activity, AlertCircle, CheckCircle, LogOut, Heart, Moon, Sun } from 'lucide-react';

const MediVault = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [hospitalData, setHospitalData] = useState([]);
const [selectedState, setSelectedState] = useState("");
const [selectedCity, setSelectedCity] = useState("");
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    bloodGroup: '',
    allergies: '',
    emergencyContact: ''
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    type: '',
    file: null,
    hospital: ''
  });
  const [verifyingFiles, setVerifyingFiles] = useState({});
  const [accessRequests, setAccessRequests] = useState([
    { id: 1, hospital: 'Emergency Care Unit', status: 'pending', timestamp: '2024-01-13 14:30' }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('medivault_user');
    const savedRecords = localStorage.getItem('medivault_records');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserProfile(user);
      setIsAuthenticated(true);
    }
    
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
 fetch("/clean_hospitals.json")
    .then(res => res.json())
    .then(data => setHospitalData(data))
    .catch(err => console.error("Hospital data error:", err));
}, []);


const states = [...new Set(hospitalData.map(h => h.state))];

const cities = [...new Set(
  hospitalData
    .filter(h => h.state === selectedState)
    .map(h => h.city)
)];

const hospitals = hospitalData.filter(
  h => h.state === selectedState && h.city === selectedCity
);

  const handleAuthSubmit = () => {
    if (showLogin) {
      const savedUser = localStorage.getItem('medivault_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.email === authForm.email && user.password === authForm.password) {
          setUserProfile(user);
          setIsAuthenticated(true);
          alert('Login successful!');
        } else {
          alert('Invalid email or password');
        }
      } else {
        alert('No account found. Please sign up first.');
      }
    } else {
      if (!authForm.email || !authForm.password || !authForm.name || !authForm.age || !authForm.bloodGroup) {
        alert('Please fill all required fields');
        return;
      }

      const newUser = {
        email: authForm.email,
        password: authForm.password,
        name: authForm.name,
        age: parseInt(authForm.age),
        bloodGroup: authForm.bloodGroup,
        allergies: authForm.allergies ? authForm.allergies.split(',').map(a => a.trim()) : [],
        emergencyContact: authForm.emergencyContact || 'Not provided'
      };

      localStorage.setItem('medivault_user', JSON.stringify(newUser));
      setUserProfile(newUser);
      setIsAuthenticated(true);
      alert('Account created successfully!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setAuthForm({
      email: '',
      password: '',
      name: '',
      age: '',
      bloodGroup: '',
      allergies: '',
      emergencyContact: ''
    });
    setShowLogin(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        return;
      }
      setNewRecord({ ...newRecord, file: file });
    }
  };

  const uploadRecord = () => {
    if (!newRecord.file || !newRecord.type || !newRecord.hospital) {
      alert('Please fill all fields and select a file');
      return;
    }

    const recordId = Date.now();
    const mockHash = '0x' + Math.random().toString(16).substr(2, 8) + '...';
    
    const record = {
      id: recordId,
      type: newRecord.type,
      date: new Date().toISOString().split('T')[0],
      hospital: newRecord.hospital,
      hash: mockHash,
      fileName: newRecord.file.name,
      verified: false,
      verificationProgress: 0
    };

    setVerifyingFiles({ ...verifyingFiles, [recordId]: true });
    const updatedRecords = [record, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('medivault_records', JSON.stringify(updatedRecords));
    
    setNewRecord({ type: '', file: null, hospital: '' });
    alert('File uploaded! Verifying and encrypting...');

    // Simulate 60 second verification
    setTimeout(() => {
      setRecords(prev => prev.map(r => 
        r.id === recordId ? { ...r, verified: true } : r
      ));
      localStorage.setItem('medivault_records', JSON.stringify(
        records.map(r => r.id === recordId ? { ...r, verified: true } : r)
      ));
      setVerifyingFiles(prev => {
        const newState = { ...prev };
        delete newState[recordId];
        return newState;
      });
      alert('Record verified and encrypted successfully! Hash stored on blockchain.');
    }, 10000);
  };

  const handleDownload = (record) => {
    // Simulate file download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(record)));
    element.setAttribute('download', record.fileName || 'record.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert('File downloaded successfully!');
  };

  const deleteRecord = (recordId) => {
  if (!window.confirm("Are you sure you want to delete this record?")) return;

  const updatedRecords = records.filter(r => r.id !== recordId);
  setRecords(updatedRecords);
  localStorage.setItem('medivault_records', JSON.stringify(updatedRecords));
};


  const handleAccessRequest = (requestId, action) => {
    setAccessRequests(accessRequests.map(req => 
      req.id === requestId ? { ...req, status: action } : req
    ));
    alert(`Access ${action === 'approved' ? 'granted' : 'denied'} successfully`);
  };

  const colors = darkMode ? {
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#334155',
    inputBg: '#1e293b',
    inputBorder: '#475569'
  } : {
    bg: '#f0f4ff',
    card: '#ffffff',
    text: '#1f2937',
    textSecondary: '#4b5563',
    border: '#e5e7eb',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db'
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: darkMode ? 'linear-gradient(to bottom right, #0f172a, #1e293b)' : 'linear-gradient(to bottom right, #f0f4ff, #e0e7ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      transition: 'all 0.3s ease'
    },
    deleteBtn: {
  background: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '8px 14px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  marginTop: '8px'
},
    card: {
      background: colors.card,
      borderRadius: '16px',
      boxShadow: darkMode ? '0 20px 25px rgba(0,0,0,0.3)' : '0 20px 25px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '428px',
      overflow: 'hidden',
      animation: 'slideIn 0.5s ease-out'
    },
    header: {
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
      padding: '32px',
      color: 'white',
      textAlign: 'center',
      animation: 'fadeIn 0.6s ease-out'
    },
    form: {
      padding: '32px',
    },
    inputGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: colors.text,
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 16px',
      border: `1px solid ${colors.inputBorder}`,
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      background: colors.inputBg,
      color: colors.text,
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px 16px',
      border: `1px solid ${colors.inputBorder}`,
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      background: colors.inputBg,
      color: colors.text,
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '12px 16px',
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '12px',
      animation: 'slideUp 0.5s ease-out'
    },
    mainContainer: {
      minHeight: '100vh',
      background: darkMode ? 'linear-gradient(to bottom right, #0f172a, #1e293b)' : 'linear-gradient(to bottom right, #f0f4ff, #e0e7ff)',
      padding: '0',
      transition: 'all 0.3s ease'
    },
    navbar: {
      background: colors.card,
      boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
      borderBottom: `1px solid ${colors.border}`,
      padding: '16px 0'
    },
    contentCard: {
      background: colors.card,
      padding: '24px',
      borderRadius: '8px',
      boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
      border: `1px solid ${colors.border}`,
      animation: 'fadeIn 0.5s ease-out'
    }
  };

  const keyframes = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;

  if (!isAuthenticated) {
    return (
      <>
        <style>{keyframes}</style>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.header}>
              <div style={{marginBottom: '16px'}}>
                <div style={{background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', display: 'inline-block', animation: 'pulse 2s infinite'}}>
                  <Activity size={40} color="white" />
                </div>
              </div>
              <h1 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', animation: 'slideUp 0.6s ease-out'}}>MEDIVAULT</h1>
              <p style={{fontSize: '14px', color: '#dbeafe', animation: 'slideUp 0.7s ease-out'}}>Secure Digital Health Records</p>
            </div>

            <div style={styles.form}>
              <div style={{display: 'flex', marginBottom: '24px', background: colors.inputBg, borderRadius: '8px', padding: '4px'}}>
                <button
                  onClick={() => setShowLogin(true)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    border: 'none',
                    background: showLogin ? '#2563eb' : 'transparent',
                    color: showLogin ? 'white' : colors.textSecondary,
                    cursor: 'pointer',
                    fontWeight: '500',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => setShowLogin(false)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    border: 'none',
                    background: !showLogin ? '#2563eb' : 'transparent',
                    color: !showLogin ? 'white' : colors.textSecondary,
                    cursor: 'pointer',
                    fontWeight: '500',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign Up
                </button>
              </div>

              <div style={{display: 'flex', flexDirection: 'column'}}>
                {!showLogin && (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Full Name</label>
                      <input
                        type="text"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        style={{...styles.input, animation: 'slideUp 0.5s ease-out'}}
                        placeholder="John Doe"
                      />
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Age</label>
                        <input
                          type="number"
                          value={authForm.age}
                          onChange={(e) => setAuthForm({ ...authForm, age: e.target.value })}
                          style={{...styles.input, animation: 'slideUp 0.55s ease-out'}}
                          placeholder="25"
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Blood Group</label>
                        <select
                          value={authForm.bloodGroup}
                          onChange={(e) => setAuthForm({ ...authForm, bloodGroup: e.target.value })}
                          style={{...styles.select, animation: 'slideUp 0.6s ease-out'}}
                        >
                          <option value="">Select</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Allergies</label>
                      <input
                        type="text"
                        value={authForm.allergies}
                        onChange={(e) => setAuthForm({ ...authForm, allergies: e.target.value })}
                        style={{...styles.input, animation: 'slideUp 0.65s ease-out'}}
                        placeholder="Penicillin, Peanuts"
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Emergency Contact</label>
                      <input
                        type="tel"
                        value={authForm.emergencyContact}
                        onChange={(e) => setAuthForm({ ...authForm, emergencyContact: e.target.value })}
                        style={{...styles.input, animation: 'slideUp 0.7s ease-out'}}
                        placeholder="+1-555-0123"
                      />
                    </div>
                  </>
                )}

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    style={{...styles.input, animation: 'slideUp 0.75s ease-out'}}
                    placeholder="your@email.com"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    style={{...styles.input, animation: 'slideUp 0.8s ease-out'}}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  onClick={handleAuthSubmit}
                  style={{...styles.button, animation: 'slideUp 0.85s ease-out'}}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {showLogin ? 'Login' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const DashboardView = () => (
    <div>
      <style>{keyframes}</style>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px'}}>
        <div style={{...styles.contentCard, borderLeft: '4px solid #3b82f6', background: darkMode ? 'rgba(37, 99, 235, 0.1)' : 'rgba(59, 130, 246, 0.05)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <p style={{fontSize: '14px', color: '#3b82f6', fontWeight: '500'}}>Total Records</p>
              <p style={{fontSize: '32px', fontWeight: 'bold', color: colors.text, animation: 'slideUp 0.5s ease-out'}}>{records.length}</p>
            </div>
            <FileText size={48} color="#3b82f6" style={{opacity: 0.8}} />
          </div>
        </div>
        
        <div style={{...styles.contentCard, borderLeft: '4px solid #22c55e', background: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <p style={{fontSize: '14px', color: '#22c55e', fontWeight: '500'}}>Verified Records</p>
              <p style={{fontSize: '32px', fontWeight: 'bold', color: colors.text, animation: 'slideUp 0.55s ease-out'}}>{records.filter(r => r.verified).length}</p>
            </div>
            <CheckCircle size={48} color="#22c55e" style={{opacity: 0.8}} />
          </div>
        </div>
        
        <div style={{...styles.contentCard, borderLeft: '4px solid #f97316', background: darkMode ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.05)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <p style={{fontSize: '14px', color: '#f97316', fontWeight: '500'}}>Pending Requests</p>
              <p style={{fontSize: '32px', fontWeight: 'bold', color: colors.text, animation: 'slideUp 0.6s ease-out'}}>{accessRequests.filter(r => r.status === 'pending').length}</p>
            </div>
            <AlertCircle size={48} color="#f97316" style={{opacity: 0.8}} />
          </div>
        </div>
      </div>

      <div style={styles.contentCard}>
        <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: colors.text}}>
          <Heart size={20} color="#ef4444" />
          Emergency Information
        </h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div>
            <p style={{fontSize: '14px', color: colors.textSecondary}}>Blood Group</p>
            <p style={{fontSize: '18px', fontWeight: '600', color: '#dc2626'}}>{userProfile.bloodGroup}</p>
          </div>
          <div>
            <p style={{fontSize: '14px', color: colors.textSecondary}}>Age</p>
            <p style={{fontSize: '18px', fontWeight: '600', color: colors.text}}>{userProfile.age} years</p>
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <p style={{fontSize: '14px', color: colors.textSecondary, marginBottom: '8px'}}>Known Allergies</p>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
              {userProfile.allergies.length > 0 ? (
                userProfile.allergies.map((allergy, idx) => (
                  <span key={idx} style={{background: darkMode ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '500'}}>
                    {allergy}
                  </span>
                ))
              ) : (
                <span style={{color: colors.textSecondary, fontSize: '14px'}}>No allergies recorded</span>
              )}
            </div>
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <p style={{fontSize: '14px', color: colors.textSecondary}}>Emergency Contact</p>
            <p style={{fontSize: '18px', fontWeight: '600', color: colors.text}}>{userProfile.emergencyContact}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const RecordsView = () => (
    <div>
      <style>{keyframes}</style>
      {records.length === 0 ? (
        <div style={{...styles.contentCard, textAlign: 'center', padding: '48px 24px'}}>
          <FileText size={64} color={colors.textSecondary} style={{margin: '0 auto 16px'}} />
          <p style={{color: colors.text, fontSize: '18px'}}>No medical records yet</p>
          <p style={{color: colors.textSecondary, fontSize: '14px', marginTop: '8px'}}>Upload your first record to get started</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {records.map((record, idx) => (
            <div key={record.id} style={{...styles.contentCard, animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                    <FileText size={20} color="#2563eb" />
                    <h3 style={{fontSize: '18px', fontWeight: 'bold', color: colors.text}}>{record.type}</h3>
                    {record.verified ? (
                      <span style={{display: 'flex', alignItems: 'center', gap: '4px', background: darkMode ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '500'}}>
                        <CheckCircle size={12} />
                        Verified
                      </span>
                    ) : (
                      <span style={{display: 'flex', alignItems: 'center', gap: '4px', background: darkMode ? 'rgba(249, 115, 22, 0.2)' : '#fed7aa', color: '#92400e', padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', animation: 'pulse 1.5s infinite'}}>
                        <Activity size={12} style={{animation: 'spin 1s linear infinite'}} />
                        Verifying...
                      </span>
                    )}
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: colors.textSecondary}}>
                    <p><strong>File:</strong> {record.fileName}</p>
                    <p><strong>Date:</strong> {record.date}</p>
                    <p><strong>Hospital:</strong> {record.hospital}</p>
                    <p style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <Lock size={12} />
                      <strong>Hash:</strong>
                      <code style={{background: colors.inputBg, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: colors.text}}>{record.hash}</code>
                    </p>
                  </div>
                </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
  <button 
    onClick={() => handleDownload(record)}
    style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease'}}
    onMouseEnter={(e) => {
      e.target.style.background = '#1d4ed8';
      e.target.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = '#2563eb';
      e.target.style.transform = 'translateY(0)';
    }}
  >
    <Download size={16} />
    Download
  </button>

  <button
    onClick={() => deleteRecord(record.id)}
    style={styles.deleteBtn}
    onMouseEnter={(e) => {
      e.target.style.background = '#b91c1c';
      e.target.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = '#dc2626';
      e.target.style.transform = 'translateY(0)';
    }}
  >
    Delete
  </button>
</div>
</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const UploadView = () => (
    <div style={{...styles.contentCard, maxWidth: '672px', margin: '0 auto'}}>
      <style>{keyframes}</style>
      <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: colors.text, animation: 'slideUp 0.5s ease-out'}}>
        <Upload size={20} />
        Upload New Medical Record
      </h3>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Record Type</label>
          <select
            value={newRecord.type}
            onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
            style={{...styles.select, animation: 'slideUp 0.55s ease-out'}}
          >
            <option value="">Select type...</option>
            <option value="Lab Report">Lab Report</option>
            <option value="Prescription">Prescription</option>
            <option value="X-Ray">X-Ray</option>
            <option value="MRI Scan">MRI Scan</option>
            <option value="Vaccination">Vaccination Record</option>
          </select>
        </div>

       {/* STATE */}
<div style={styles.inputGroup}>
  <label style={styles.label}>State</label>
  <select
    value={selectedState}
    onChange={(e) => {
      setSelectedState(e.target.value);
      setSelectedCity("");
      setNewRecord({ ...newRecord, hospital: "" });
    }}
    style={{ ...styles.select, animation: 'slideUp 0.6s ease-out' }}
  >
    <option value="">Select State</option>
    {states.map((s, i) => (
      <option key={i} value={s}>{s}</option>
    ))}
  </select>
</div>

{/* CITY */}
<div style={styles.inputGroup}>
  <label style={styles.label}>City / District</label>
  <select
    value={selectedCity}
    onChange={(e) => {
      setSelectedCity(e.target.value);
      setNewRecord({ ...newRecord, hospital: "" });
    }}
    disabled={!selectedState}
    style={{ ...styles.select, animation: 'slideUp 0.65s ease-out' }}
  >
    <option value="">Select City</option>
    {cities.map((c, i) => (
      <option key={i} value={c}>{c}</option>
    ))}
  </select>
</div>

{/* HOSPITAL */}
<div style={styles.inputGroup}>
  <label style={styles.label}>Hospital / Clinic</label>
  <select
    value={newRecord.hospital}
    onChange={(e) =>
      setNewRecord({ ...newRecord, hospital: e.target.value })
    }
    disabled={!selectedCity}
    style={{ ...styles.select, animation: 'slideUp 0.7s ease-out' }}
  >
    <option value="">Select Hospital</option>
    {hospitals.map((h, i) => (
      <option key={i} value={h.hospital}>
        {h.hospital}
      </option>
    ))}
  </select>
</div>


        <div style={styles.inputGroup}>
          <label style={styles.label}>Upload File</label>
          <div style={{border: `2px dashed ${colors.inputBorder}`, borderRadius: '8px', padding: '32px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(59, 130, 246, 0.02)', animation: 'slideUp 0.65s ease-out'}}>
            <input
              type="file"
              onChange={handleFileChange}
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{display: 'none'}}
            />
            <label htmlFor="file-upload" style={{cursor: 'pointer', display: 'block'}}>
              <Upload size={48} color={colors.textSecondary} style={{margin: '0 auto 8px'}} />
              <p style={{fontSize: '14px', color: colors.text}}>
                {newRecord.file ? (
                  <span style={{color: '#2563eb', fontWeight: '500'}}>{newRecord.file.name}</span>
                ) : (
                  'Click to upload or drag and drop'
                )}
              </p>
              <p style={{fontSize: '12px', color: colors.textSecondary, marginTop: '4px'}}>PDF, JPG, PNG (MAX. 10MB)</p>
            </label>
          </div>
        </div>

        <button
          onClick={uploadRecord}
          style={{...styles.button, animation: 'slideUp 0.7s ease-out'}}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 10px 15px rgba(37, 99, 235, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <Lock size={16} style={{display: 'inline', marginRight: '8px'}} />
          Encrypt & Upload
        </button>

        <div style={{background: darkMode ? 'rgba(37, 99, 235, 0.1)' : 'rgba(219, 234, 254, 1)', border: `1px solid ${darkMode ? 'rgba(37, 99, 235, 0.3)' : '#93c5fd'}`, borderRadius: '8px', padding: '16px', fontSize: '14px', marginTop: '16px', animation: 'slideUp 0.75s ease-out'}}>
          <p style={{fontWeight: '600', color: '#2563eb', marginBottom: '4px'}}>🔒 Security Notice</p>
          <p style={{color: darkMode ? '#93c5fd' : '#0369a1'}}>
            Your file will be encrypted using AES-256 encryption before storage. 
            Only the encrypted hash will be stored on the blockchain for tamper-proof verification.
          </p>
        </div>
      </div>
    </div>
  );

  const AccessControlView = () => (
    <div>
      <style>{keyframes}</style>
      <div style={styles.contentCard}>
        <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: colors.text}}>Access Requests</h3>
        {accessRequests.length === 0 ? (
          <p style={{color: colors.textSecondary, textAlign: 'center', padding: '32px'}}> No pending requests</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {accessRequests.map((request, idx) => (
              <div key={request.id} style={{border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both`, transition: 'all 0.3s ease'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(59, 130, 246, 0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div>
                  <p style={{fontWeight: '600', color: colors.text}}>{request.hospital}</p>
                  <p style={{fontSize: '14px', color: colors.textSecondary}}>Requested: {request.timestamp}</p>
                  <span style={{display: 'inline-block', marginTop: '8px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: request.status === 'pending' ? (darkMode ? 'rgba(217, 119, 6, 0.2)' : '#fef3c7') : request.status === 'approved' ? (darkMode ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7') : (darkMode ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2'), color: request.status === 'pending' ? '#92400e' : request.status === 'approved' ? '#15803d' : '#991b1b'}}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
                {request.status === 'pending' && (
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button
                      onClick={() => handleAccessRequest(request.id, 'approved')}
                      style={{background: '#16a34a', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease'}}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#15803d';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#16a34a';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAccessRequest(request.id, 'denied')}
                      style={{background: '#dc2626', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease'}}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#b91c1c';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#dc2626';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.mainContainer}>
      <style>{keyframes}</style>
      <div style={styles.navbar}>
        <div style={{maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{background: '#2563eb', padding: '8px', borderRadius: '8px'}}>
              <Activity size={32} color="white" />
            </div>
            <div>
              <h1 style={{fontSize: '24px', fontWeight: 'bold', color: colors.text, margin: 0}}>MEDIVAULT</h1>
              <p style={{fontSize: '12px', color: colors.textSecondary, margin: 0}}>Secure Digital Health Records</p>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{background: 'transparent', border: `1px solid ${colors.border}`, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: colors.text, transition: 'all 0.3s ease'}}
              onMouseEnter={(e) => {
                e.target.style.background = colors.inputBg;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <User size={32} color={colors.text} />
              <span style={{fontWeight: '500', color: colors.text}}>{userProfile.name}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#dc2626', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease'}}
              onMouseEnter={(e) => {
                e.target.style.background = '#b91c1c';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#dc2626';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1280px', margin: '0 auto', padding: '24px 16px'}}>
        <div style={{display: 'flex', gap: '8px', marginBottom: '24px', background: colors.card, padding: '8px', borderRadius: '8px', boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)'}}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'records', label: 'My Records', icon: FileText },
            { id: 'upload', label: 'Upload', icon: Upload },
            { id: 'access', label: 'Access Control', icon: Shield }
          ].map((tabItem, idx) => (
            <button
              key={tabItem.id}
              onClick={() => setActiveTab(tabItem.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: 'none',
                background: activeTab === tabItem.id ? '#2563eb' : 'transparent',
                color: activeTab === tabItem.id ? 'white' : colors.textSecondary,
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: `slideUp ${0.5 + idx * 0.05}s ease-out`
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tabItem.id) {
                  e.target.style.background = colors.inputBg;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tabItem.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <tabItem.icon size={16} />
              {tabItem.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'records' && <RecordsView />}
        {activeTab === 'upload' && <UploadView />}
        {activeTab === 'access' && <AccessControlView />}
      </div>
    </div>
  );
};

export default MediVault;