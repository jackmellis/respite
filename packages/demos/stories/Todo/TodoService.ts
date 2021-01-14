export interface Todo {
  id: number,
  title: string,
  description: string,
}

const shouldError = () => Math.random() <= 0.2;

export class TodoService {
  state: Todo[] = [ { id: 1, title: 'test', description: 'this is a test' } ];

  read() {
    return new Promise<Todo[]>((res, rej) => {
      setTimeout(() => {
        if (shouldError()) {
          return rej(new Error('something went wrong'));
        }
        res(this.state);
      }, 1000);
    });
  }
  create(title: string, description: string) {
    return new Promise<Todo>((res, rej) => {
      setTimeout(() => {
        if (shouldError()) {
          return rej(new Error('something went wrong'));
        }
        const nextId = this.state.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
        this.state = [
          ...this.state,
          {
            id: nextId,
            title,
            description,
          },
        ];
        res(this.state[this.state.length - 1]);
      }, 1000);
    });
  }
  update(id: number, title: string, description: string) {
    return new Promise<Todo>((res, rej) => {
      setTimeout(() => {
        if (shouldError()) {
          return rej(new Error('something went wrong'));
        }
        const existing = this.state.find(todo => todo.id === id);
        const i = this.state.indexOf(existing);
        this.state = this.state.slice();
        this.state[i] = {
          id,
          title,
          description,
        };
        res(this.state[i]);
      }, 1000);
    });
  }
  delete(id: number) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (shouldError()) {
          return rej(new Error('something went wrong'));
        }
        this.state = this.state.filter(todo => todo.id !== id);
        res(null);
      }, 1000);
    });
  }
}