const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors({ origin: '*' })); // This allows any front-end origin (3000/3001) to talk to backend

// --- IN-MEMORY STORAGE (for testing without MongoDB) ---
let users = {}; // Temporary storage: email -> user data

// --- DATABASE SCHEMA SIMULATION ---
const createUser = (email, role) => ({
    email,
    activePath: { role, completedWeeks: [] },
    journal: [],
    dailyWork: {} // week -> daily entries
});

// --- ROUTES ---

// 1. RECOMMENDATION LOGIC
app.post('/api/recommend', (req, res) => {
    const { skills } = req.body;
    // Simple matching logic
    const recommendations = [
        { role: "Data Scientist", match: 85, reason: "Matches Python, Machine Learning skills" },
        { role: "Full Stack Developer", match: 75, reason: "Matches JavaScript, React skills" },
        { role: "Backend Engineer", match: 70, reason: "Matches Python, SQL skills" }
    ].filter(rec => skills.some(skill =>
        rec.reason.toLowerCase().includes(skill.toLowerCase())
    ));

    res.json(recommendations.length > 0 ? recommendations : [{ role: "Data Scientist", match: 50, reason: "General programming skills" }]);
});

// 2. ENROLLMENT (works without MongoDB)
app.post('/api/enroll', (req, res) => {
    try {
        const { email, role } = req.body;
        console.log("Enrolling:", email, "for", role);

        // Create or update user in memory
        if (!users[email]) {
            users[email] = createUser(email, role);
        } else {
            users[email].activePath = { role, completedWeeks: [] };
        }

        res.status(200).json(users[email].activePath);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// 3. ROADMAP DATA
app.get('/api/roadmap/:role', (req, res) => {
    const roadmaps = {
        "Data Scientist": [
            {
                week: 1, task: "Master Python Basics & Lists", days: [
                    "Day 1: Variables and Data Types",
                    "Day 2: Lists and Tuples",
                    "Day 3: Dictionaries and Sets",
                    "Day 4: Control Flow (if/else)",
                    "Day 5: Loops and Functions",
                    "Day 6: Practice Projects",
                    "Day 7: Review and Quiz"
                ]
            },
            {
                week: 2, task: "Learn NumPy and Pandas", days: [
                    "Day 1: NumPy Arrays",
                    "Day 2: Array Operations",
                    "Day 3: Pandas DataFrames",
                    "Day 4: Data Cleaning",
                    "Day 5: Data Analysis",
                    "Day 6: Visualization",
                    "Day 7: Mini Project"
                ]
            },
            {
                week: 3, task: "Introduction to Linear Regression", days: [
                    "Day 1: Statistics Basics",
                    "Day 2: Linear Regression Theory",
                    "Day 3: Implementing in Python",
                    "Day 4: Model Evaluation",
                    "Day 5: Multiple Regression",
                    "Day 6: Practice Problems",
                    "Day 7: Final Project"
                ]
            }
        ],
        "Full Stack Developer": [
            {
                week: 1, task: "HTML5, CSS3, and Flexbox", days: [
                    "Day 1: HTML Structure",
                    "Day 2: CSS Basics",
                    "Day 3: Flexbox Layout",
                    "Day 4: Responsive Design",
                    "Day 5: CSS Grid",
                    "Day 6: Building Layouts",
                    "Day 7: Portfolio Page"
                ]
            },
            {
                week: 2, task: "JavaScript ES6+ and DOM", days: [
                    "Day 1: Variables and Functions",
                    "Day 2: Arrays and Objects",
                    "Day 3: DOM Manipulation",
                    "Day 4: Event Handling",
                    "Day 5: Async Programming",
                    "Day 6: API Calls",
                    "Day 7: Interactive App"
                ]
            },
            {
                week: 3, task: "React Fundamentals", days: [
                    "Day 1: React Setup",
                    "Day 2: Components and JSX",
                    "Day 3: Props and State",
                    "Day 4: useState Hook",
                    "Day 5: useEffect Hook",
                    "Day 6: Forms and Events",
                    "Day 7: Todo App Project"
                ]
            }
        ]
    };
    res.json(roadmaps[req.params.role] || []);
});

// 4. TOGGLE PROGRESS
app.post('/api/progress/toggle', (req, res) => {
    const { email, week } = req.body;

    if (!users[email]) {
        return res.status(400).json({ error: "User not found" });
    }

    let weeks = users[email].activePath.completedWeeks || [];

    if (weeks.includes(week)) {
        weeks = weeks.filter(w => w !== week);
    } else {
        weeks.push(week);
    }

    users[email].activePath.completedWeeks = weeks;
    res.json(users[email].activePath);
});

// 5. SAVE JOURNAL ENTRY
app.post('/api/journal', (req, res) => {
    const { email, content, role } = req.body;

    if (!users[email]) {
        return res.status(400).json({ error: "User not found" });
    }

    const entry = { content, role, date: new Date() };
    users[email].journal.push(entry);
    res.json(users[email].journal);
});

// 6. GET DAILY WORK FOR A WEEK
app.get('/api/daily-work/:email/:week', (req, res) => {
    const { email, week } = req.params;

    if (!users[email]) {
        return res.json({}); // Return empty if user not found
    }

    res.json(users[email].dailyWork[week] || {});
});

// 7. SAVE DAILY WORK
app.post('/api/daily-work', (req, res) => {
    const { email, week, day, work } = req.body;

    if (!users[email]) {
        users[email] = createUser(email, 'Unknown');
    }

    if (!users[email].dailyWork[week]) {
        users[email].dailyWork[week] = {};
    }

    users[email].dailyWork[week][day] = {
        work,
        date: new Date(),
        completed: true
    };

    res.json({ success: true, dailyWork: users[email].dailyWork[week] });
});

// --- START SERVER ---
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server ready at http://localhost:${PORT} (In-Memory Mode)`));