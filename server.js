require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/to-do-list',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro na conexão MongoDB:'));
db.once('open', () => {
  console.log('Conectado ao MongoDB');
});

const taskSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
  },
  descricao: {
    type: String,
    trim: true,
  },
  concluida: {
    type: Boolean,
    default: false,
  },
  prioridade: {
    type: String,
    enum: ['baixa', 'media', 'alta'],
    default: 'media',
  },
  criadaEm: {
    type: Date,
    default: Date.now,
  },
  atualizadaEm: {
    type: Date,
    default: Date.now,
  },
});

taskSchema.pre('save', function (next) {
  this.atualizadaEm = Date.now();
  next();
});

const Task = mongoose.model('Task', taskSchema);

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ criadaEm: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tarefas' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { titulo, descricao, prioridade } = req.body;

    if (!titulo) {
      return res.status(400).json({ erro: 'Título obrigatório' });
    }

    const newTask = new Task({
      titulo,
      descricao,
      prioridade,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar tarefa' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, concluida, prioridade } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { titulo, descricao, concluida, prioridade },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ erro: 'Tarefa nnão encontrada' });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar tarefa' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    res.json({ mensagem: 'Tarefa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar tarefa' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
