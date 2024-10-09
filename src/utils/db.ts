import initSqlJs from 'sql.js';

let db: any = null;

export const initDB = async () => {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  db = new SQL.Database();

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      assignedTo INTEGER,
      completed BOOLEAN,
      FOREIGN KEY(assignedTo) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      token TEXT UNIQUE,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  // Insert sample data
  db.run(`
    INSERT OR IGNORE INTO users (username, password, role) VALUES 
    ('admin', 'admin123', 'admin'),
    ('worker1', 'worker123', 'worker'),
    ('worker2', 'worker123', 'worker');
  `);

  return db;
};

export const getUser = (username: string, password: string) => {
  const result = db.exec(`
    SELECT * FROM users 
    WHERE username = '${username}' AND password = '${password}'
  `);
  
  if (result.length > 0 && result[0].values.length > 0) {
    const [id, username, _, role] = result[0].values[0];
    return { id, username, role };
  }
  return null;
};

export const createSession = (userId: number) => {
  const token = Math.random().toString(36).substr(2);
  db.run(`
    INSERT INTO sessions (userId, token)
    VALUES (${userId}, '${token}')
  `);
  return token;
};

export const getUserByToken = (token: string) => {
  const result = db.exec(`
    SELECT u.id, u.username, u.role
    FROM users u
    JOIN sessions s ON u.id = s.userId
    WHERE s.token = '${token}'
  `);

  if (result.length > 0 && result[0].values.length > 0) {
    const [id, username, role] = result[0].values[0];
    return { id, username, role };
  }
  return null;
};

export const removeSession = (token: string) => {
  db.run(`DELETE FROM sessions WHERE token = '${token}'`);
};

export const getTasks = (userId?: number) => {
  let query = `
    SELECT t.id, t.title, t.assignedTo, u.username as assignedToName, t.completed
    FROM tasks t
    LEFT JOIN users u ON t.assignedTo = u.id
  `;
  
  if (userId) {
    query += ` WHERE t.assignedTo = ${userId}`;
  }

  const result = db.exec(query);
  
  if (result.length > 0) {
    return result[0].values.map((row: any[]) => ({
      id: row[0],
      title: row[1],
      assignedTo: row[2],
      assignedToName: row[3],
      completed: Boolean(row[4])
    }));
  }
  return [];
};

export const addTask = (title: string, assignedTo: number) => {
  db.run(`
    INSERT INTO tasks (title, assignedTo, completed)
    VALUES ('${title}', ${assignedTo}, 0)
  `);
};

export const completeTask = (taskId: number) => {
  db.run(`
    UPDATE tasks
    SET completed = 1
    WHERE id = ${taskId}
  `);
};

export const getWorkers = () => {
  const result = db.exec(`
    SELECT id, username
    FROM users
    WHERE role = 'worker'
  `);
  
  if (result.length > 0) {
    return result[0].values.map((row: any[]) => ({
      id: row[0],
      username: row[1]
    }));
  }
  return [];
};