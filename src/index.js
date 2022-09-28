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

function checksExistsUserAccountCreated(request, response, next) {
  const user = request.headers; 

  const userFound = users.find((userTodo) => userTodo.username === user.username);

  if (userFound) {
    return response.status(404).json({ error: "user already exist" });
  } else {
    return next();
  }
}

app.post('/users', checksExistsUserAccountCreated, (request, response) => {
  const user = request.body;

  const userSigned = {
    id: uuidv4(),
    name: user.name,
    username: user.username,
    todos: []
  }

  users.push(userSigned);

  response.json(userSigned);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.userFound;

  return response.json(user.todos);
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

  return response.json(userTodo);



});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todoId = request.params;
  const todoRequest = request.body;

  const user = request.userFound;

  const todo = user.todos.find((todo)=> todo.id === todoId.id);

  if (todo) {
    todo.title = todoRequest.title;
    todo.deadline = new Date(todoRequest.deadline);
    return response.status(200).json(todo);
  }else {
    return response.status(404).json({ error: "todo not found"});
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const user = request.userFound;

  console.log(todoId);
  const todo = user.todos.find((todo)=> todo.id === todoId);

  if (todo) {
    todo.done = true;
    return response.send().status(200);
  }else {
    return response.status(404).json({ error: "todo not found"});
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todoId = request.params.id;
  const user = request.userFound;

  const todo = user.todos.find((todo)=> todo.id === todoId);

  if (todo) {
    user.todos.splice(todo, 1);
    return response.status(200).json(user.todos);
  }else {
    return response.status(404).json({ error: "todo not found"});
  }
});

app.listen(33333);
module.exports = app;
