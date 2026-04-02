const rolesMap = [
    {
        role: "Data Scientist",
        requiredSkills: ["Python", "Machine Learning", "SQL"],
        roadmap: [
            { id: 1, level: "Beginner", task: "Master Python Basics & NumPy" },
            { id: 2, level: "Intermediate", task: "Study Scikit-Learn & Linear Regression" },
            { id: 3, level: "Advanced", task: "Deep Learning with PyTorch/TensorFlow" }
        ]
    },
    {
        role: "Full Stack Developer",
        requiredSkills: ["JavaScript", "React", "Node.js", "SQL"],
        roadmap: [
            { id: 4, level: "Beginner", task: "HTML, CSS, and JS Fundamentals" },
            { id: 5, level: "Intermediate", task: "Build REST APIs with Express" },
            { id: 6, level: "Advanced", task: "Microservices & Deployment" }
        ]
    },
    {
        role: "Data Analyst",
        requiredSkills: ["Excel", "SQL", "Python", "Data Visualization"],
        roadmap: [
            { id: 7, level: "Beginner", task: "Learn Excel formulas and pivot tables" },
            { id: 8, level: "Intermediate", task: "Master SQL querying and joins" },
            { id: 9, level: "Advanced", task: "Build dashboards with Power BI / Tableau" }
        ]
    }
];

// This acts as your temporary database
let dataStore = {
    user: {},
    progress: {}, // Stores { taskId: "completed" }
    schedule: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    }
};

module.exports = { rolesMap, dataStore };