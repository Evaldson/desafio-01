const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const user = request.headers;

  const userFound = users.find((userTodo) => userTodo.username === user.username);

  if (userFound) {
    request.userFound = userFound;
    return next();
  } else {
    return response.status(404).json({ error: "user not found" });
  }
}

app.post('/users', (request, response) => {
  const user = request.body;
  const userFound = users.find((userTodo) => userTodo.username === user.username);

  if (!userFound) {
    const userSigned = {
      id: uuidv4(),
      name: user.name,
      username: user.username,
      todos: []
    }
    users.push(userSigned);
    response.status(201).json(userSigned);
  } else {
    return response.status(400).json({ error: "user already exist" });
  }



});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.userFound;

  return response.status(200).json(user.todos).send();
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const userFound = request.userFound;
  const todoRequest = request.body;

  const userTodo = {
    id: uuidv4(),
    title: todoRequest.title,
    done: false,
    deadline: new Date(todoRequest.deadline),
    created_at: new Date()
  };

  userFound.todos.push(userTodo);

  return response.status(201).json(userTodo);



});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todoId = request.params;
  const todoRequest = request.body;

  const user = request.userFound;

  const todo = user.todos.find((todo) => todo.id === todoId.id);

  if (todo) {
    todo.title = todoRequest.title;
    todo.deadline = new Date(todoRequest.deadline);
    return response.status(200).json(todo);
  } else {
    return response.status(404).json({ error: "todo not found" });
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const user = request.userFound;

  console.log(todoId);
  const todo = user.todos.find((todo) => todo.id === todoId);

  if (todo) {
    todo.done = true;
    return response.status(200).send();
  } else {
    return response.status(404).json({ error: "todo not found" }).send();
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const user = request.userFound;

  const todo = user.todos.find((todo) => todo.id === todoId);

  if (todo) {
    user.todos.splice(users.indexOf(todo), 1);
    return response.status(204).send();
  } else {
    return response.status(404).json({ error: "todo not found" }).send();
  }
});

app.listen(33333);
module.exports = app;
