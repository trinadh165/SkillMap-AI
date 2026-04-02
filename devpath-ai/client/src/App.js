import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const [skills, setSkills] = useState([]);
    const [results, setResults] = useState([]);
    const [schedule, setSchedule] = useState({});
    const [day, setDay] = useState('Monday');
    const [task, setTask] = useState('');
    const [goalRole, setGoalRole] = useState('Data Scientist');

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                const res = await axios.get('/api/schedule');
                setSchedule(res.data.schedule || {});
            } catch (err) {
                console.error('Schedule load failed', err);
            }
        };
        loadSchedule();
    }, []);

    const handleCheck = (skill) => {
        setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    };

    const getRecommendation = async () => {
        const res = await axios.post('/api/recommend', { userSkills: skills });
        setResults(res.data);
    };

    const addScheduleTask = async () => {
        if (!task.trim()) return;
        try {
            const res = await axios.post('/api/schedule', { day, task: task.trim() });
            setSchedule(res.data.schedule);
            setTask('');
        } catch (err) {
            console.error('Add task failed', err);
        }
    };

    const toggleTask = async (dayName, id) => {
        const current = schedule[dayName].find(t => t.id === id);
        if (!current) return;

        try {
            const res = await axios.post('/api/schedule/complete', {
                day: dayName,
                id,
                completed: !current.completed
            });
            setSchedule(res.data.schedule);
        } catch (err) {
            console.error('Update planned task failed', err);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">DevPath AI</h1>

            {/* Direct Role Goal Schedule */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Set Weekly Goal (Data Analyst / Data Scientist)</h2>
                <div className="flex gap-3 flex-wrap items-center">
                    <select value={goalRole} onChange={e => setGoalRole(e.target.value)} className="border rounded p-2">
                        {['Data Scientist', 'Full Stack Developer', 'Data Analyst'].map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <button
                        onClick={async () => {
                            try {
                                const res = await axios.post('/api/schedule/roadmap', { role: goalRole });
                                setSchedule(res.data.schedule);
                            } catch (err) {
                                console.error('Failed to load goal schedule', err);
                            }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Generate Weekly Study Schedule
                    </button>
                </div>
                <p className="mt-3 text-sm text-gray-600">This will auto-populate weekly tasks from the selected role roadmap plus 2 review/practice tasks.</p>
            </div>

            {/* Skill Selector */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Select Your Skills</h2>
                <div className="flex gap-4">
                    {["Python", "JavaScript", "SQL", "React", "Machine Learning"].map(s => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" onChange={() => handleCheck(s)} className="w-4 h-4" />
                            {s}
                        </label>
                    ))}
                </div>
                <button
                    onClick={getRecommendation}
                    className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Find My Career Path
                </button>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map(role => (
                    <div key={role.role} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold">{role.role}</h3>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                {role.matchPercentage}% Match
                            </span>
                        </div>
                        <h4 className="font-semibold text-gray-600 mb-2">Your Roadmap:</h4>
                        <ul className="space-y-2">
                            {role.roadmap.map(step => (
                                <li key={step.id} className="flex items-center gap-3 text-gray-700">
                                    <input type="checkbox" className="rounded" />
                                    <span><b className="text-blue-500">{step.level}:</b> {step.task}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await axios.post('/api/schedule/roadmap', { role: role.role });
                                    setSchedule(res.data.schedule);
                                } catch (err) {
                                    console.error('Failed to add roadmap schedule', err);
                                }
                            }}
                            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                            Add roadmap weekly schedule
                        </button>
                    </div>
                ))}
            </div>

            {/* Weekly Schedule */}
            <div className="bg-white p-6 rounded-xl shadow-md mt-8">
                <h2 className="text-xl font-semibold mb-4">Weekly Schedule Tasks</h2>
                <div className="flex gap-3 mb-4 flex-wrap items-center">
                    <select value={day} onChange={e => setDay(e.target.value)} className="border rounded p-2">
                        {Object.keys(schedule).length ? Object.keys(schedule).map(d => (
                            <option key={d} value={d}>{d}</option>
                        )) : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    <input
                        className="border rounded p-2 flex-1"
                        placeholder="New task to complete your goal"
                        value={task}
                        onChange={e => setTask(e.target.value)}
                    />
                    <button
                        onClick={addScheduleTask}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >Add Task</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.keys(schedule).map(d => (
                        <div key={d} className="bg-gray-50 p-3 rounded border">
                            <h3 className="font-semibold mb-2">{d}</h3>
                            <ul className="space-y-2">
                                {schedule[d].length === 0 ? (
                                    <li className="text-sm text-gray-500">No tasks</li>
                                ) : schedule[d].map(item => (
                                    <li key={item.id} className="flex items-center justify-between bg-white px-2 py-1 rounded">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={() => toggleTask(d, item.id)}
                                            />
                                            <span className={item.completed ? 'line-through text-gray-500' : ''}>{item.task}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}