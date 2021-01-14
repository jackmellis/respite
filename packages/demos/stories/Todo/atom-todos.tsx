import React, { Suspense, useEffect, useState } from 'react';
import { atom, molecule, useState as useAtom, useReset } from '@respite/atom';
import { ErrorBoundary } from 'react-error-boundary';
import { TodoService, Todo } from './TodoService';
import { useAction } from '@respite/action';

const after = (delay: number) => new Promise<void>(res => setTimeout(res, delay));

const service = new TodoService();

const FETCHING = atom({ default: true });

const TODOS = atom<Todo[]>({ default: [] });

const TODO = molecule<Todo, [ number ]>({
  get({ get }, [ id ]) {
    const todos = get(TODOS);
    return todos.find(todo => todo.id === id);
  },
  set({ get, set }, [ id ]) {
    const todos = get(TODOS);
    const setTodos = set(TODOS);
    return value => {
      setTodos(todos.map(todo => todo.id === id ? value : todo));
    };
  },
});

const TodoItem = ({
  id,
  title,
  description,
}:  Todo) => {
  const [ editing, setEditing ] = useState(false);

  if (editing) {
    return (
      <EditTodo id={id} onClose={() => setEditing(false)}/>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '1rem' }}>
      <strong style={{ marginRight: '3rem' }}>{title}</strong>
      <p style={{ flexGrow: 1 }}>{description}</p>
      <button onClick={() => setEditing(true)}>edit</button>
    </div>
  );
};

// EditTodo will be powered by vanilla
const EditTodo = ({ id, onClose }: { id: number, onClose: () => void }) => {
  const [ todo, setTodo ] = useAtom(TODO, [ id ]);
  const [ title, setTitle ] = useState(todo.title);
  const [ description, setDescription ] = useState(todo.description);
  // we have to manually manage the submitting/error states as well as manually doing optimistic updates
  const [ submitting, setSubmitting ] = useState(false);
  const [ error, setError ] = useState(null);

  const handleSubmit = async() => {
    setSubmitting(true);
    try {
      const result = await service.update(id, title, description);
      setTodo(result);
      onClose();
    } catch (e) {
      setSubmitting(false);
      setError(e);
    }
  };

  return (
    <div>
      {error != null && <div>{error.message}</div>}
      <label htmlFor="title">Title</label>
      <input id="title" value={title} onChange={e => setTitle(e.target.value)}/>
      <label htmlFor="description">Description</label>
      <input id="description" value={description} onChange={e => setDescription(e.target.value)}/>
      <button type="button" onClick={handleSubmit} disabled={submitting}>Save</button>
    </div>
  );
};

// CreateTodo will be powered by useAction
const CreateTodo = () => {
  const [ title, setTitle ] = useState('');
  const [ description, setDescription ] = useState('');
  const [ , setTodos ] = useAtom(TODOS);
  const [ , setFetching ] = useAtom(FETCHING);

  // unlike EditTodo, we don't have to manually manage our submitting state
  const {
    action: handleSubmit,
    submitting,
    reset,
    error,
  } = useAction(async() => {
    // with atoms right now it's particularly easy to optimistically update
    await service.create(title, description);
    // we have to manually update the todos atom
    setFetching(true);
    setTodos(await service.read());
    setFetching(false);
    setTitle('');
    setDescription('');
    await after(250);
    reset();
  });

  return (
    <div>
      {error != null && <div>{error.message}</div>}
      <label htmlFor="title">Title</label>
      <input id="title" value={title} onChange={e => setTitle(e.target.value)}/>
      <label htmlFor="description">Description</label>
      <input id="description" value={description} onChange={e => setDescription(e.target.value)}/>
      <button type="button" onClick={handleSubmit} disabled={submitting}>Create</button>
    </div>
  );
};

const TodoList = ({ todos, fetching }: { todos: Todo[], fetching: boolean }) => {
  return (
    <div style={{ position: 'relative' }}>
      {fetching && (
        <div style={{ position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>Refreshing...</div>
      )}
      <h2>My Todos</h2>
      {todos.map(todo => (
        <TodoItem key={todo.id} {...todo}/>
      ))}
      <h3>Create a Todo</h3>
      <CreateTodo/>
    </div>
  );
};

const ConnectedTodoList = () => {
  // unlike queries, atoms are eager so if they do anything async, they will immediately suspend
  const [ todos, setTodos ] = useAtom(TODOS);
  const [ fetching, setFetching ] = useAtom(FETCHING);

  useEffect(() => {
    setFetching(true);
    service.read().then(todos => {
      setTodos(todos);
      setFetching(false);
    });
  }, []);

  if (fetching && !todos.length) {
    return <div>loading...</div>;
  }

  return (
    <ErrorBoundary
      FallbackComponent={({ resetErrorBoundary }) => (
        <>
          <div>There is a 20% chance something will error. This is it</div>
          <button onClick={resetErrorBoundary}>retry</button>
        </>
      )}
    >
      <TodoList fetching={fetching} todos={todos}/>
    </ErrorBoundary>
  );
};

export default ConnectedTodoList;