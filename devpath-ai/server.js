const express = require('express');
const path = require('path');
const { dataStore, rolesMap } = require('./dataStore'); // Our in-memory store
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// --- JOB RECOMMENDATION ENGINE ---
app.post('/api/recommend', (req, res) => {
    const { userSkills } = req.body; // Array of skills: ['Python', 'SQL']
    const recommendations = rolesMap.map(role => {
        let matchCount = 0;
        role.requiredSkills.forEach(skill => {
            if (userSkills.includes(skill)) matchCount++;
        });

        const matchPercentage = (matchCount / role.requiredSkills.length) * 100;
        return { ...role, matchPercentage: Math.round(matchPercentage) };
    });

    // Sort by highest match and take top 3
    const topRoles = recommendations
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 3);

    res.json(topRoles);
});

// --- TRACKER & ROADMAP API ---
app.post('/api/update-progress', (req, res) => {
    const { taskId, status } = req.body;
    dataStore.progress[taskId] = status;
    res.json({ success: true, currentProgress: dataStore.progress });
});

// --- WEEKLY SCHEDULE API ---
app.get('/api/schedule', (req, res) => {
    res.json({ success: true, schedule: dataStore.schedule });
});

app.post('/api/schedule', (req, res) => {
    const { day, task } = req.body;

    if (!day || !task || !dataStore.schedule[day]) {
        return res.status(400).json({ success: false, message: 'Invalid day or task' });
    }

    const nextId = Object.values(dataStore.schedule).flat().reduce((max, item) => Math.max(max, item.id||0), 0) + 1;
    const newEntry = { id: nextId, task, completed: false };
    dataStore.schedule[day].push(newEntry);

    res.json({ success: true, schedule: dataStore.schedule });
});

app.post('/api/schedule/complete', (req, res) => {
    const { day, id, completed } = req.body;

    if (!day || typeof id === 'undefined' || !dataStore.schedule[day]) {
        return res.status(400).json({ success: false, message: 'Invalid day or id' });
    }

    const entry = dataStore.schedule[day].find(item => item.id === id);
    if (!entry) {
        return res.status(404).json({ success: false, message: 'task not found' });
    }

    entry.completed = !!completed;
    res.json({ success: true, schedule: dataStore.schedule });
});

// --- ROADMAP TO SCHEDULE IMPORT ---
app.post('/api/schedule/roadmap', (req, res) => {
    const { role } = req.body;
    const selectedRole = rolesMap.find(r => r.role === role);

    if (!selectedRole) {
        return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const days = Object.keys(dataStore.schedule);
    let idx = 0;
    const baseId = Object.values(dataStore.schedule).flat().reduce((max, item) => Math.max(max, item.id || 0), 0);
    const newTasks = [];

    selectedRole.roadmap.forEach((step, i) => {
        const dayName = days[idx % days.length];
        const id = baseId + i + 1;
        const taskText = `Learn ${step.task}`;
        dataStore.schedule[dayName].push({ id, task: taskText, completed: false });
        newTasks.push({ day: dayName, id, task: taskText });
        idx += 1;
    });

    // Add 2 extra weekly schedule reminders
    const extras = [
        'Weekly review of progress and notes',
        'Practice mini-project from roadmap learnings'
    ];
    extras.forEach((text, i) => {
        const dayName = days[(idx + i) % days.length];
        const id = baseId + selectedRole.roadmap.length + i + 1;
        dataStore.schedule[dayName].push({ id, task: text, completed: false });
        newTasks.push({ day: dayName, id, task: text });
    });

    res.json({ success: true, schedule: dataStore.schedule, added: newTasks });
});

// --- SERVE FRONTEND ---
const frontendPath = path.join(__dirname, 'client', 'build');
const fallbackPath = path.join(__dirname, 'client', 'dist');

// Prefer Create React App output folder 'build', fallback to 'dist' if present
if (require('fs').existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
} else {
    app.use(express.static(fallbackPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(fallbackPath, 'index.html'));
    });
}

app.listen(PORT, () => console.log(`DevPath AI running on http://localhost:${PORT}`));