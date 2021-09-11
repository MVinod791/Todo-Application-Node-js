const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (request, response) => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const getTodos = `
        SELECT *
        FROM todo
        ORDER BY id;
    `;
  const todosArray = await db.all(getTodos);
  response.send(todosArray);
});

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
                SELECT * 
                FROM todo
                WHERE 
                todo like '%${search_q}%'
                AND status ='${status}'
                AND priority ='${priority}';`;
      break;
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
                SELECT * 
                FROM todo
                WHERE 
                todo like '%${search_q}%'
                AND priority ='${priority}';`;
      break;
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
                SELECT * 
                FROM todo
                WHERE 
                todo like '%${search_q}%'
                AND status ='${status}';`;
      break;

    default:
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
                SELECT * 
                FROM todo
                WHERE 
                todo like '%${search_q}%';`;

      break;
  }
  const todoArray = await db.all(getTodosQuery);
  response.send(todoArray);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoIdQuery = `
        SELECT *
        FROM todo
        WHERE id=${todoId};`;
  const todo = await db.get(getTodoIdQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousQuery = `
        SELECT *
        FROM todo
        WHERE id=${todoId};
    `;
  const previousTodo = await db.get(previousQuery);

  const {
    todo = previousTodo.todo,
    status = previousTodo.status,
    priority = previousTodo.priority,
  } = request.body;

  const updateTodoQuery = `
        UPDATE todo
        SET 
            status='${status}'
        WHERE 
            id=${todoId};`;
  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
        DELETE FROM 
            todo
        WHERE id=${todoId};
    `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
