import React, { useState } from 'react';
import axios from 'axios';
import { Target, ArrowRight, BookOpen, CheckCircle2, X, ChevronDown, ChevronRight, Calendar } from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

function App() {
  const [skills, setSkills] = useState([]);
  const [recs, setRecs] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [dailyWork, setDailyWork] = useState({});
  const userEmail = "test@example.com"; // Placeholder

  const availableSkills = ["Python", "JavaScript", "React", "SQL", "Machine Learning", "Node.js", "Java", "Pandas", "MongoDB"];

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const getMyPath = async () => {
    const res = await axios.post(`${API_BASE}/recommend`, { skills });
    setRecs(res.data);
  };

  const fetchRoadmap = async (role) => {
    try {
      const res = await axios.get(`${API_BASE}/roadmap/${encodeURIComponent(role)}`);
      setRoadmap(res.data);
      setSelectedRole(role);
      setCompletedWeeks([]);
      setIsEnrolled(false);
    } catch (err) {
      console.error("Error fetching roadmap", err);
    }
  };

  const handleEnroll = async () => {
    try {
      const res = await axios.post(`${API_BASE}/enroll`, {
        email: "test@example.com", // This must be a string
        role: selectedRole         // This must be the role name from your state
      });

      if (res.status === 200) {
        setIsEnrolled(true);
        setCompletedWeeks([]);
      }
    } catch (error) {
      console.error("Enrollment failed", error);
      alert("Connection failed. Is the backend running on Port 5000?");
    }
  };

  const toggleProgress = async (week) => {
    const res = await axios.post(`${API_BASE}/progress/toggle`, {
      email: userEmail,
      week
    });
    setCompletedWeeks(res.data.completedWeeks);
  };

  const toggleWeekExpansion = async (week) => {
    if (expandedWeek === week) {
      setExpandedWeek(null);
    } else {
      setExpandedWeek(week);
      // Fetch existing daily work for this week
      try {
        const res = await axios.get(`${API_BASE}/daily-work/${userEmail}/${week}`);
        setDailyWork(prev => ({ ...prev, [week]: res.data }));
      } catch (err) {
        console.error("Error fetching daily work", err);
      }
    }
  };

  const saveDailyWork = async (week, day, work) => {
    try {
      await axios.post(`${API_BASE}/daily-work`, {
        email: userEmail,
        week,
        day,
        work
      });
      setDailyWork(prev => ({
        ...prev,
        [week]: { ...prev[week], [day]: { work, completed: true } }
      }));
    } catch (err) {
      console.error("Error saving daily work", err);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: '"Inter", sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>

      {/* --- Header --- */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#1e293b', fontSize: '2.5rem', marginBottom: '10px' }}>🚀 DevPath AI</h1>
        <p style={{ color: '#64748b' }}>Precision Career Mapping for the Modern Developer</p>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* --- Skill Selection Card --- */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', color: '#334155' }}>Step 1: What do you know?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '30px' }}>
            {availableSkills.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '99px',
                  border: '2px solid',
                  borderColor: skills.includes(skill) ? '#3b82f6' : '#e2e8f0',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backgroundColor: skills.includes(skill) ? '#eff6ff' : 'white',
                  color: skills.includes(skill) ? '#1d4ed8' : '#64748b'
                }}
              >{skill}</button>
            ))}
          </div>

          <button onClick={getMyPath} style={{ width: '100%', padding: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            Analyze My Career <ArrowRight size={20} />
          </button>
        </div>

        {/* --- Recommendations List --- */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {recs.map((r, i) => (
            <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '16px', borderLeft: '6px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Target size={20} color="#3b82f6" />
                  <h3 style={{ margin: 0, color: '#1e293b' }}>{r.role}</h3>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{r.reason}</p>
                <button
                  onClick={() => fetchRoadmap(r.role)}
                  style={{ marginTop: '12px', background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}
                >
                  <BookOpen size={16} /> View Roadmap
                </button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{r.match}%</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Match Score</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Roadmap Modal --- */}
      {selectedRole && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '95%', maxWidth: '500px', borderRadius: '24px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedRole(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '24px' }}>
              <X size={24} />
            </button>

            <h2 style={{ marginBottom: '10px', color: '#1e293b' }}>{selectedRole}</h2>

            {/* PROGRESS BAR */}
            {isEnrolled && (
              <div style={{ margin: '20px 0', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>Overall Progress</span>
                  <span>{roadmap.length > 0 ? Math.round((completedWeeks.length / roadmap.length) * 100) : 0}%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${roadmap.length > 0 ? (completedWeeks.length / roadmap.length) * 100 : 0}%`, height: '100%', background: '#10b981', transition: 'width 0.4s' }} />
                </div>
              </div>
            )}

            {/* ROADMAP STEPS */}
            <div style={{ margin: '25px 0' }}>
              {roadmap.map((step, idx) => (
                <div key={idx} style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: '15px', padding: '15px', alignItems: 'center', background: completedWeeks.includes(step.week) ? '#f0fdf4' : 'white' }}>
                    <button
                      disabled={!isEnrolled}
                      onClick={() => toggleProgress(step.week)}
                      style={{
                        background: completedWeeks.includes(step.week) ? '#10b981' : '#f1f5f9',
                        border: completedWeeks.includes(step.week) ? 'none' : '2px solid #e2e8f0',
                        borderRadius: '50%', width: '28px', height: '28px', cursor: isEnrolled ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}
                    >
                      {completedWeeks.includes(step.week) ? <CheckCircle2 size={18} color="white" /> : <span style={{ color: '#94a3b8', fontWeight: '600' }}>{idx + 1}</span>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#334155', textDecoration: completedWeeks.includes(step.week) ? 'line-through' : 'none', opacity: completedWeeks.includes(step.week) ? 0.6 : 1 }}>
                        Week {step.week}: {step.task}
                      </h4>
                    </div>
                    {isEnrolled && (
                      <button
                        onClick={() => toggleWeekExpansion(step.week)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '5px' }}
                      >
                        {expandedWeek === step.week ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                    )}
                  </div>

                  {/* DAILY WORK BREAKDOWN */}
                  {expandedWeek === step.week && isEnrolled && (
                    <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '15px' }}>
                      <h5 style={{ margin: '0 0 15px 0', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} /> Daily Learning Plan
                      </h5>
                      {step.days && step.days.map((dayTask, dayIdx) => {
                        const dayKey = `day${dayIdx + 1}`;
                        const existingWork = dailyWork[step.week]?.[dayKey]?.work || '';
                        const isCompleted = dailyWork[step.week]?.[dayKey]?.completed || false;

                        return (
                          <div key={dayIdx} style={{ marginBottom: '12px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>
                                Day {dayIdx + 1}: {dayTask}
                              </span>
                              {isCompleted && <CheckCircle2 size={16} color="#10b981" />}
                            </div>
                            <textarea
                              value={existingWork}
                              onChange={(e) => {
                                const newWork = e.target.value;
                                setDailyWork(prev => ({
                                  ...prev,
                                  [step.week]: { ...prev[step.week], [dayKey]: { work: newWork, completed: false } }
                                }));
                              }}
                              onBlur={(e) => {
                                if (e.target.value.trim()) {
                                  saveDailyWork(step.week, dayKey, e.target.value.trim());
                                }
                              }}
                              placeholder="What did you learn today? Describe your progress..."
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e0',
                                minHeight: '60px',
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ENROLL OR JOURNAL */}
            {!isEnrolled ? (
              <button onClick={handleEnroll} style={{ width: '100%', padding: '16px', background: '#1e293b', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', border: 'none', fontSize: '16px' }}>
                Start Learning Path
              </button>
            ) : (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}>📝 Daily Study Log</h4>
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="What did you learn today?"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e0', minHeight: '80px', fontSize: '14px', fontFamily: 'inherit' }}
                />
                <button
                  onClick={async () => {
                    await axios.post(`${API_BASE}/journal`, { email: userEmail, content: journalText, role: selectedRole });
                    setJournalText("");
                    alert("Learning logged! Great job! 🎉");
                  }}
                  style={{ marginTop: '12px', width: '100%', padding: '12px', background: '#3b82f6', color: 'white', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Save Log
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
