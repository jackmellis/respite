export interface PubSub {
  dispatch<T>(name: string, evt: T): void;
  subscribe<T>(name: string, callback: (evt: T) => any): () => void;
}

export const createPubSub = (): PubSub => {
  const state: Record<string, Array<(evt: any) => any>> = {};

  const subscribe = <T>(name: string, callback: (evt: T) => any) => {
    let subscribers = state[name];
    if (subscribers == null) {
      subscribers = state[name] = [];
    }
    subscribers.push(callback);
    return () => {
      const i = subscribers.indexOf(callback);
      if (i >= 0) {
        subscribers.splice(i, 1);
      }
    };
  };

  const dispatch = <T>(name: string, evt: T) => {
    const subscribers = state[name] || [];
    subscribers.forEach(callback => callback(evt));
  };

  return { subscribe, dispatch };
};