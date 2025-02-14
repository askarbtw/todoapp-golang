package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"time"
)

type Priority string

const (
	Low    Priority = "low"
	Medium Priority = "medium"
	High   Priority = "high"
)

type Task struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Completed bool      `json:"completed"`
	Priority  Priority  `json:"priority"`
	DueDate   *string   `json:"dueDate,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

type App struct {
	ctx   context.Context
	tasks []Task
	DB    *sql.DB
}

func NewApp() *App {
	return &App{tasks: []Task{}}
}

// startup opens the SQLite database file "todo.db" and applies the schema migration.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// Open the "todo.db" database file
	db, err := sql.Open("sqlite3", "./todo.db")
	if err != nil {
		log.Fatal(err)
	}
	a.DB = db
	if a.DB == nil {
		return
	}

	// Create the tasks table if it doesn't exist.
	schema := `
	CREATE TABLE IF NOT EXISTS tasks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		completed BOOLEAN DEFAULT FALSE,
		priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
		due_date DATETIME NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`
	if _, err := db.Exec(schema); err != nil {
		log.Fatal(err)
	}
}

func (a *App) AddTask(title, priority string, dueDate *string) (Task, error) {
	if title == "" {
		return Task{}, errors.New("task title cannot be empty")
	}
	if dueDate != nil && *dueDate != "" {
		parsedDue, err := time.Parse("2006-01-02", *dueDate)
		if err != nil {
			return Task{}, errors.New("invalid due date format, expected YYYY-MM-DD")
		}
		// Get today's date at midnight.
		now := time.Now()
		today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		if parsedDue.Before(today) {
			return Task{}, errors.New("due date cannot be in the past")
		}
	}

	// Validate the priority value.
	validPriorities := map[string]bool{"low": true, "medium": true, "high": true}
	if !validPriorities[priority] {
		priority = "medium"
	}

	now := time.Now()

	query := `INSERT INTO tasks(title, completed, priority, due_date, created_at)
	          VALUES(?, ?, ?, ?, ?)`
	res, err := a.DB.Exec(query, title, false, priority, dueDate, now)
	if err != nil {
		return Task{}, err
	}

	insertedID, err := res.LastInsertId()
	if err != nil {
		return Task{}, err
	}

	task := Task{
		ID:        fmt.Sprintf("%d", insertedID),
		Title:     title,
		Completed: false,
		Priority:  Priority(priority),
		DueDate:   dueDate,
		CreatedAt: now,
	}
	a.tasks = append(a.tasks, task)
	return task, nil
}

// GetTasks retrieves all tasks from the database.
func (a *App) GetTasks() ([]Task, error) {
	rows, err := a.DB.Query("SELECT id, title, completed, priority, due_date, created_at FROM tasks")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var task Task
		var id int
		var dueDate sql.NullString
		err := rows.Scan(&id, &task.Title, &task.Completed, &task.Priority, &dueDate, &task.CreatedAt)
		if err != nil {
			return nil, err
		}
		task.ID = fmt.Sprintf("%d", id)
		if dueDate.Valid {
			d := dueDate.String
			task.DueDate = &d
		}
		tasks = append(tasks, task)
	}
	return tasks, nil
}

// ToggleTaskCompletion inverts the completion status of a task in the database.
func (a *App) ToggleTaskCompletion(id string) error {
	// Retrieve current "completed" value.
	var completed bool
	if err := a.DB.QueryRow("SELECT completed FROM tasks WHERE id = ?", id).Scan(&completed); err != nil {
		return err
	}

	// Update the completed status to its opposite.
	newStatus := !completed
	_, err := a.DB.Exec("UPDATE tasks SET completed = ? WHERE id = ?", newStatus, id)
	if err != nil {
		return err
	}
	return nil
}

// DeleteTask removes a task from the database.
func (a *App) DeleteTask(id string) error {
	res, err := a.DB.Exec("DELETE FROM tasks WHERE id = ?", id)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("task not found")
	}
	return nil
}
