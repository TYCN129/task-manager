const express = require('express');
const app = express();
const port = 3000;

// Load the initial tasks into memory.
const tasks = require('./task.json').tasks;
// The seed file has 15 tasks with IDs from 1 to 15.
let nextId = tasks.length + 1;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check the task fields before the POST or PUT handler runs.
function validateTask(req, res, next) {
    // Read the task sent in the request body.
    const task = req.body;

    // The body must be an object, not an array.
    if (!task || typeof task !== 'object' || Array.isArray(task)) {
        return res.status(400).json({ error: 'Send a task object in the request body' });
    }

    // Reject missing titles and titles containing only spaces.
    if (typeof task.title !== 'string' || !task.title.trim()) {
        return res.status(400).json({ error: 'Title must be a non-empty string' });
    }

    // Require a description with some text.
    if (typeof task.description !== 'string' || !task.description.trim()) {
        return res.status(400).json({ error: 'Description must be a non-empty string' });
    }

    // Only boolean values are accepted, not strings like "true".
    if (typeof task.completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed must be a boolean' });
    }

    // Continue to the route handler after validation passes.
    next();
}

// Get all tasks, or filter them by completion status.
app.get('/tasks', (req, res) => {
    // Read the optional completed value from the query string.
    const completed = req.query.completed;

    // Return every task when no filter is provided.
    if (completed === undefined) {
        return res.json(tasks);
    }

    // Query values arrive as strings, so accept only "true" or "false".
    if (completed !== 'true' && completed !== 'false') {
        return res.status(400).json({ error: 'Completed filter must be true or false' });
    }

    // Collect the tasks that match the requested status.
    const filteredTasks = [];
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].completed === (completed === 'true')) {
            filteredTasks.push(tasks[i]);
        }
    }
    // Send the matching tasks as JSON.
    res.json(filteredTasks);
});

// Validate the request and create a task.
app.post('/tasks', validateTask, (req, res) => {
    // Assign an ID and remove surrounding spaces from the text fields.
    const task = {
        id: nextId,
        title: req.body.title.trim(),
        description: req.body.description.trim(),
        completed: req.body.completed,
    };

    // Add the new task to the in-memory array.
    tasks.push(task);
    // Reserve a new ID for the next task, even if this task is deleted.
    nextId++;
    // Return the created task with status 201.
    res.status(201).json(task);
});

// Get one task using its ID from the URL.
app.get('/tasks/:id', (req, res) => {
    // Convert the URL parameter from a string to a number.
    const taskId = Number(req.params.id);

    // Reject IDs that are not positive whole numbers.
    if (!Number.isInteger(taskId) || taskId < 1) {
        return res.status(400).json({ error: 'Task ID must be a positive integer' });
    }

    // Search by ID because array positions can change after deletion.
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            // Send the matching task and stop the handler.
            return res.json(tasks[i]);
        }
    }

    // No task in the array has this ID.
    res.status(404).json({ error: 'Task not found' });
});

// Validate the request and update an existing task.
app.put('/tasks/:id', validateTask, (req, res) => {
    // Read the task ID from the URL.
    const taskId = Number(req.params.id);

    // Reject IDs that are not positive whole numbers.
    if (!Number.isInteger(taskId) || taskId < 1) {
        return res.status(400).json({ error: 'Task ID must be a positive integer' });
    }

    // Find the task that needs to be updated.
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            // Replace the editable fields while keeping the original ID.
            tasks[i].title = req.body.title.trim();
            tasks[i].description = req.body.description.trim();
            tasks[i].completed = req.body.completed;
            // Return the updated task.
            return res.json(tasks[i]);
        }
    }

    // An update cannot create a task with a missing ID.
    res.status(404).json({ error: 'Task not found' });
});

// Delete an existing task using its ID.
app.delete('/tasks/:id', (req, res) => {
    // Read the task ID from the URL.
    const taskId = Number(req.params.id);

    // Reject IDs that are not positive whole numbers.
    if (!Number.isInteger(taskId) || taskId < 1) {
        return res.status(400).json({ error: 'Task ID must be a positive integer' });
    }

    // Find the position of the task to delete.
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            // Remove one task at this position.
            tasks.splice(i, 1);
            // Confirm the deletion and stop the handler.
            return res.json({ message: 'Task deleted successfully' });
        }
    }

    // Return 404 when the task does not exist or was already deleted.
    res.status(404).json({ error: 'Task not found' });
});

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});

module.exports = app;