# Task Manager API

A REST API built with Node.js and Express. Tasks are loaded from `task.json` at startup and kept in memory. Changes are lost when the server restarts; the seed file is never overwritten.

## Run locally

Use Node.js 18 or newer.

```sh
npm ci
node app.js
```

The server runs at `http://localhost:3000`, using the starter's port setting.

## Endpoints

| Method | Path | Result |
| --- | --- | --- |
| GET | `/tasks` | All tasks (200) |
| GET | `/tasks?completed=true` | Completed tasks (200); use `false` for pending tasks |
| GET | `/tasks/:id` | One task (200) |
| POST | `/tasks` | Create a task (201) |
| PUT | `/tasks/:id` | Update all editable task fields (200) |
| DELETE | `/tasks/:id` | Delete a task and return a confirmation message (200) |

POST and PUT require a JSON object containing `title`, `description`, and `completed`. Title and description must be non-empty strings; surrounding whitespace is trimmed. Completed must be a boolean, not a string. IDs are assigned by the server and are not reused after deletion. Extra body fields are ignored.

Example task:

```json
{
  "id": 16,
  "title": "Review Express routes",
  "description": "Try each endpoint with curl",
  "completed": false
}
```

Invalid task fields, invalid IDs, and invalid completion filters return 400. A valid ID with no matching task returns 404. These API errors use the format `{"error":"Task not found"}`. Malformed JSON and unknown routes use Express's default error responses.

## Try it with curl

Run these commands while the server is running. The ID `16` below assumes a fresh server with the 15 seed tasks; otherwise use the ID returned by POST.

```sh
curl http://localhost:3000/tasks
curl 'http://localhost:3000/tasks?completed=false'

curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Review Express routes","description":"Try each endpoint with curl","completed":false}'

curl http://localhost:3000/tasks/16

curl -X PUT http://localhost:3000/tasks/16 \
  -H 'Content-Type: application/json' \
  -d '{"title":"Review Express routes","description":"Checked each endpoint","completed":true}'

curl -X DELETE http://localhost:3000/tasks/16

# Validation error (400)
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Missing fields"}'

# Missing task (404)
curl -i http://localhost:3000/tasks/999
```

## Tests

```sh
npm run test
```

NOTE: This README.md has been generated using AI.