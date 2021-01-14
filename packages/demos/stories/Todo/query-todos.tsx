import React, { Suspense, useState } from 'react';
import { useSelector } from '@respite/select';
import { useAction, useSnapshot } from '@respite/action';
import { useQuery, Query, Status } from '@respite/query';
import { ErrorBoundary } from 'react-error-boundary';
import { TodoService, Todo } from './TodoService';

const after = (delay: number) => new Promise<void>(res => setTimeout(res, delay));

const service = new TodoService();

// returns a lazy query that reads a list of todos from the service
const useTodos = () => useQuery('todos', () => service.read(), [], { retry: (e, tries) => tries < 3});

// returns a single todo
const useTodo = (id: number) => {
  // even though we're calling this hook in multiple locations
  // they will all share the same cache
  const query = useTodos();
  // transforms the state of the query and returns a new query
  // if the base query is still loading, the selector query will also suspend
  return useSelector(query, todos => todos.find(todo => todo.id === id));
};

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
  const { data: todo, invalidate } = useTodo(id);
  const [ title, setTitle ] = useState(todo.title);
  const [ description, setDescription ] = useState(todo.description);
  // we have to manually manage the submitting/error states as well as manually doing optimistic updates
  const [ submitting, setSubmitting ] = useState(false);
  const [ error, setError ] = useState(null);

  const handleSubmit = async() => {
    setSubmitting(true);
    try {
      await service.update(id, title, description);
      invalidate();
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
const CreateTodo = ({ query }: { query: Query<Todo[]> }) => {
  const [ title, setTitle ] = useState('');
  const [ description, setDescription ] = useState('');
  const snapshot = useSnapshot(query);
  // unlike EditTodo, we don't have to manually manage our submitting state
  const {
    action: handleSubmit,
    submitting,
    reset,
    invalidate,
    error,
  } = useAction(async() => {
    // with the query object we can optimisitically update the state
    const revert = snapshot(todos => todos.concat({
      id: -1,
      title,
      description,
    }));

    try {
      await service.create(title, description);
      setTitle('');
      setDescription('');
      await after(250);
      reset();
      // invaliding todos will cause the todo list to refresh
      invalidate({ key: 'todos' });
    } catch (e) {
      revert();
      // we don't actually need to do anything here unless we need to
      // the error state is automatically captured by useAction
      throw e;
    }
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

const TodoList = ({ query }: { query: Query<Todo[]> }) => {
  const { data: todos, status } = query;

  return (
    <div style={{ position: 'relative' }}>
      {status === Status.FETCHING && (
        <div style={{ position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>Refreshing...</div>
      )}
      <h2>My Todos</h2>
      {todos.map(todo => (
        <TodoItem key={todo.id} {...todo}/>
      ))}
      <h3>Create a Todo</h3>
      <CreateTodo query={query}/>
    </div>
  );
};

const ConnectedTodoList = () => {
  // useQuery is lazy and will only suspend at the point you actually read from it
  const query = useTodos();

  return (
    <ErrorBoundary
      onReset={query.invalidate}
      FallbackComponent={({ resetErrorBoundary }) => (
        <>
          <div>There is a 20% chance something will error. This is it</div>
          <button onClick={resetErrorBoundary}>retry</button>
        </>
      )}
    >
      <Suspense fallback={<div>loading...</div>}>
        <TodoList query={query}/>
      </Suspense>
    </ErrorBoundary>
  );
};

export default ConnectedTodoList;