const express = require('express');
const cors = require('cors');
const { v4: uuidv4} = require("uuid");

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) { 
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if(!user ){
    return response.status(404).json({error: 'User not found!'});

  }


  request.username = username;
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username } = request.body;
  const userAreadyExists = users.some((user) => user.username === username);

  if (userAreadyExists){
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;
  return response.json(user.todos);
  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;
  const {title, deadline } = request.body;


  const newTodo = {
    id: uuidv4(),
    title: title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };
  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
 });

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { deadline, title } = request.body;
  const { id } = request.params;
  const { user }  = request;
  const todo = user.todos.find((todo)=> todo.id === id);
  if(!todo){
    return response.status(404).send({error: 'Todo not found'});
  }
  const todoUpdated = {...todo, deadline: new Date(deadline), title: title};
  return response.status(201).json(todoUpdated);
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).send({ error: "Todo not found" });
  }
  const todoUpdated = { ...todo,done: true };
  return response.status(201).json(todoUpdated);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
    const { id } = request.params;
    const { user } = request;
    const todo = user.todos.find((todo) => todo.id === id);
    if (!todo) {
      return response.status(404).send({ error: "Todo not found" });
    }
    user.todos.splice(todo, 1); 
   
    return response.status(204).json(user.todos);



});

module.exports = app;