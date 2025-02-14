# Todo List Application

A simple yet powerful Todo List application built using Go for the backend and React for the frontend, with Wails as the bridge between them. This application allows users to efficiently manage their tasks with features like adding, completing, and deleting tasks, as well as setting priorities and due dates.

## Features
- **Add Tasks:** Create new tasks with a title, priority, and optional due date.
- **List Tasks:** View all tasks in an organized list.
- **Complete Tasks:** Mark tasks as completed or uncompleted.
- **Delete Tasks:** Remove tasks from the list.
- **Set Priorities:** Assign low, medium, or high priority to tasks.
- **Due Dates:** Set and manage due dates for tasks.
- **Persistent Storage:** Tasks are stored in a SQLite database for data persistence.
- **Dark Mode:** Switch between Dark and Light modes.

## Technology Stack
- **Backend:** Go
- **Frontend:** React with TypeScript
- **Database:** SQLite
- **Framework:** Wails (for desktop application development)

## Project Structure
```
📦 Todo List Application
├── 📂 frontend/          # React frontend code
├── 📝 main.go            # Main entry point for the Wails application
├── 📝 app.go             # Core backend logic, including database operations
├── 🗄️  todo.db           # SQLite database file for storing tasks
└── 📄 README.md         # Project documentation
```

## Key Components
### Backend (Go)
- **App struct:** Manages the application state and database connection.
- **Task struct:** Represents a todo item with properties like ID, title, completion status, priority, due date, and creation time.
- **Database operations:** Functions for adding, retrieving, updating, and deleting tasks.

### Frontend (React)
- Task management interface
- Components for displaying and interacting with tasks
- State management for real-time updates

## Database Schema
The SQLite database uses the following schema for the tasks table:
```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Getting Started
### Prerequisites
Ensure you have the following installed on your system:
- [Go](https://golang.org/)
- [Node.js](https://nodejs.org/)
- [Wails](https://wails.io/)

### Installation & Running
1. **Clone the repository:**
   ```sh
   git clone https://github.com/askarbtw/todoapp-golang.git
   cd todoapp-golang
   ```
2. **Run the application in development mode:**
   ```sh
   wails dev
   ```
3. **Build the application:**
   ```sh
   wails build
   ```
4. **Run the built application:**
   ```sh
   ./build/bin/todoapp-golang
   ```

## Development
- Backend code can be found in the root directory, primarily in `app.go`.
- Frontend React code is located in the `frontend/` directory.

