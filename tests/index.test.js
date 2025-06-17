describe('Aplicação To-Do List', () => {

  test('Jest deve estar funcionando corretamente', () => {
    expect(true).toBe(true);
  });

  test('deve somar números corretamente', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
  });

});

describe('Funcionalidades de Tarefas', () => {

  const criarTarefa = (titulo, concluida = false) => {
    return {
      id: Date.now(),
      titulo: titulo,
      concluida: concluida,
      dataCriacao: new Date()
    };
  };

  test('deve criar uma tarefa nova', () => {
    const tarefa = criarTarefa('Estudar JavaScript');

    expect(tarefa).toHaveProperty('id');
    expect(tarefa).toHaveProperty('titulo');
    expect(tarefa).toHaveProperty('concluida');
    expect(tarefa.titulo).toBe('Estudar JavaScript');
    expect(tarefa.concluida).toBe(false);
  });

  test('deve criar tarefa marcada como concluída', () => {
    const tarefa = criarTarefa('Fazer exercícios', true);

    expect(tarefa.concluida).toBe(true);
    expect(tarefa.titulo).toBe('Fazer exercícios');
  });

});

describe('Lista de Tarefas', () => {

  let listaTarefas = [];

  // Limpar lista antes de cada teste
  beforeEach(() => {
    listaTarefas = [];
  });

  const adicionarTarefa = (lista, titulo) => {
    const novaTarefa = {
      id: lista.length + 1,
      titulo: titulo,
      concluida: false
    };
    lista.push(novaTarefa);
    return lista;
  };

  const removerTarefa = (lista, id) => {
    return lista.filter(tarefa => tarefa.id !== id);
  };

  const marcarConcluida = (lista, id) => {
    return lista.map(tarefa =>
      tarefa.id === id ? { ...tarefa, concluida: true } : tarefa
    );
  };

  test('deve adicionar tarefa à lista', () => {
    adicionarTarefa(listaTarefas, 'Primeira tarefa');

    expect(listaTarefas).toHaveLength(1);
    expect(listaTarefas[0].titulo).toBe('Primeira tarefa');
    expect(listaTarefas[0].concluida).toBe(false);
  });

  test('deve adicionar múltiplas tarefas', () => {
    adicionarTarefa(listaTarefas, 'Tarefa 1');
    adicionarTarefa(listaTarefas, 'Tarefa 2');
    adicionarTarefa(listaTarefas, 'Tarefa 3');

    expect(listaTarefas).toHaveLength(3);
    expect(listaTarefas[2].titulo).toBe('Tarefa 3');
  });

  test('deve remover tarefa da lista', () => {
    adicionarTarefa(listaTarefas, 'Tarefa para remover');
    expect(listaTarefas).toHaveLength(1);

    listaTarefas = removerTarefa(listaTarefas, 1);
    expect(listaTarefas).toHaveLength(0);
  });

  test('deve marcar tarefa como concluída', () => {
    adicionarTarefa(listaTarefas, 'Tarefa para concluir');
    expect(listaTarefas[0].concluida).toBe(false);

    listaTarefas = marcarConcluida(listaTarefas, 1);
    expect(listaTarefas[0].concluida).toBe(true);
  });

});

describe('Validações', () => {

  const validarTarefa = (titulo) => {
    if (!titulo || titulo.trim() === '') {
      return { valido: false, erro: 'Título não pode estar vazio' };
    }
    if (titulo.length > 100) {
      return { valido: false, erro: 'Título muito longo' };
    }
    return { valido: true };
  };

  test('deve validar título vazio', () => {
    const resultado = validarTarefa('');
    expect(resultado.valido).toBe(false);
    expect(resultado.erro).toBe('Título não pode estar vazio');
  });

  test('deve validar título muito longo', () => {
    const tituloLongo = 'a'.repeat(101);
    const resultado = validarTarefa(tituloLongo);
    expect(resultado.valido).toBe(false);
    expect(resultado.erro).toBe('Título muito longo');
  });

  test('deve aceitar título válido', () => {
    const resultado = validarTarefa('Tarefa válida');
    expect(resultado.valido).toBe(true);
    expect(resultado.erro).toBeUndefined();
  });

});