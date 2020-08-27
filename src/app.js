const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequest(req, res, next) {
  const { method, url } = req;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);
  
  next();
  
  console.timeEnd(logLabel);
}

function validateRepositoryId(req, res, next) {
  const { id } = req.params;

  if(!isUuid(id)) {
    return res.status(400).json({ error: 'Invalid project ID'});
  }

  return next();
}

function findRepository(req, res, next) {
  const { id } = req.params;

  const index = repositories.findIndex(repository => repository.id === id);

  if (index < 0) return res.status(400).json({ error: "Repository not found" });

  req.repoIndex = index;

  return next();
}

app.use(logRequest);
app.use('/repositories/:id', validateRepositoryId);
app.use('/repositories/:id', findRepository);

app.get("/repositories", (req, res) => {
  return res.json(repositories);
});

app.post("/repositories", (req, res) => {
  const { title, url, techs } = req.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return res.json(repository);
});

app.post("/repositories/:id/like", (req, res) => {
  repositories[req.repoIndex].likes += 1;

  return res.json(repositories[req.repoIndex]);
});

app.put("/repositories/:id", (req, res) => {
  const { title, url, techs } = req.body;

  const repository = {
    id: req.params.id,
    title,
    url,
    techs,
    likes: repositories[req.repoIndex].likes,
  };

  repositories[req.repoIndex] = repository;

  return res.json(repository);
});

app.delete("/repositories/:id", (req, res) => {
  repositories.splice(req.repoIndex, 1);

  return res.status(204).send();
});

module.exports = app;
