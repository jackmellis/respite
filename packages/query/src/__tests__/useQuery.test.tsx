/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Suspense, useEffect, useState } from 'react';
import { Provider, Status, Query } from '@respite/core';
import { renderHook } from '@testing-library/react-hooks';
import { render, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from 'react-error-boundary';
import useQuery from '../useQuery';

afterEach(() => {
  jest.resetAllMocks();
});

const wrapper = ({ children }: any) => (
  <Provider cacheTime={1000}>
    {children}
  </Provider>
);

it('it returns a query', () => {
  const fetch = jest.fn().mockResolvedValue({});

  const { result } = renderHook(() => {
    return useQuery('basket', fetch, []);
  }, { wrapper });

  const query = result.current;

  expect(typeof query).toBe('object');
});

it('it does not immediately call fetch', () => {
  const fetch = jest.fn().mockResolvedValue({});

  renderHook(() => {
    return useQuery('basket', fetch);
  }, { wrapper });

  expect(fetch).not.toHaveBeenCalled();
});

it('it has a status of idle', async() => {
  const fetch = jest.fn().mockResolvedValue({});

  const Child = ({ query }: { query: Query<any> }) => (
    <div>
      {query.status}
    </div>
  );
  const Parent = () => {
    const query = useQuery('basket', fetch);
    return <Child query={query}/>;
  };

  render(<Parent/>, { wrapper });

  await screen.findByText(Status.IDLE);
});

describe('when I access data', () => {
  describe('when fetch is asynchronous', () => {
    it('suspends the component', async() => {
      const fetch = jest.fn(() => new Promise(() => {}));
      const Fallback = () => (<div>Loading...</div>);
      const Child = ({ query }: { query: Query<any> }) => (<div>{query.data}</div>);
      const Parent = () => {
        const query = useQuery('basket', fetch);
        return <Child query={query}/>;
      };
  
      render(
        <Suspense fallback={<Fallback/>}>
          <Parent/>
        </Suspense>,
        { wrapper }
      );
  
      await screen.findByText('Loading...');
    });
    it('sets the status to loading', async() => {
      let status: Status;
      const fetch = jest.fn(() => new Promise(() => {}));
      const Fallback = () => (<div>Loading...</div>);
      const Child = ({ query }: { query: Query<any> }) => (<div>{query.data}</div>);
      const Parent = () => {
        const query = useQuery('basket', fetch);
        status = query.status;
        return (<Child query={query}/>);
      };
  
      render(
        <Suspense fallback={<Fallback/>}>
          <Parent/>
        </Suspense>,
        { wrapper }
      );
  
      await act(async() => {});
  
      expect(status).toBe(Status.LOADING);
    });
  
    describe('when the data has been fetched', () => {
      it('returns the data property', async() => {
        const fetch = jest.fn().mockResolvedValue('I am content');
        const Fallback = () => (<div>Loading...</div>);
        const Child = ({ query }: { query: Query<any> }) => (<div>{query.data}</div>);
        const Parent = () => {
          const query = useQuery('basket', fetch);
          return (<Child query={query}/>);
        };
    
        render(
          <Suspense fallback={<Fallback/>}>
            <Parent/>
          </Suspense>,
          { wrapper }
        );
    
        await screen.findByText('I am content');
      });
      it('sets the status to success', async() => {
        const fetch = jest.fn().mockResolvedValue('I am content');
        const Fallback = () => (<div>Loading...</div>);
        const Child = ({ query: { data, status} }: { query: Query<any> }) => (<div>{status}</div>);
        const Parent = () => {
          const query = useQuery('basket', fetch);
          return (<Child query={query}/>);
        };
    
        render(
          <Suspense fallback={<Fallback/>}>
            <Parent/>
          </Suspense>,
          { wrapper }
        );
    
        await screen.findByText(Status.SUCCESS);
      });
  
      describe('when the dependencies change', () => {
        it('sets the status to fetching', async() => {
          const fetch = jest.fn(count => {
            if (count === 0) {
              return Promise.resolve(`count: ${count}`);
            }
            return new Promise(() => {});
          });
          const Fallback = () => (<div>Loading...</div>);
          const Child = ({
            query: {
              data,
              status,
            },
            onClick,
          }: {
            query: Query<any>,
            onClick: () => void,
          }) => (
            <div>
              <div>
                {status}
              </div>
              <div>
                <button onClick={onClick}>increment</button>
              </div>
            </div>
          );
          const Parent = () => {
            const [ count, setCount ] = useState(0);
            const query = useQuery('count', () => fetch(count), [ count ]);
            const increment = () => setCount(count + 1);
            return (
              <Suspense fallback={<Fallback/>}>
                <Child
                  query={query}
                  onClick={increment}
                />
              </Suspense>
            );
          };
  
          render(<Parent/>, { wrapper });
  
          await act(async() => {});
  
          await screen.findByText(Status.SUCCESS);
  
          const button = screen.getByRole('button');
  
          userEvent.click(button);
  
          await act(async() => {});
  
          await screen.findByText(Status.FETCHING);
        });
        it('calls the fetch function', async() => {
          const fetch = jest.fn(count => {
            if (count === 0) {
              return Promise.resolve(`count: ${count}`);
            }
            return new Promise(() => {});
          });
          const Fallback = () => (<div>Loading...</div>);
          const Child = ({
            query: {
              data,
              status,
            },
            onClick,
          }: {
            query: Query<any>,
            onClick: () => void,
          }) => (
            <div>
              <div>
                {status}
              </div>
              <div>
                <button onClick={onClick}>increment</button>
              </div>
            </div>
          );
          const Parent = () => {
            const [ count, setCount ] = useState(0);
            const query = useQuery('count', () => fetch(count), [ count ]);
            const increment = () => setCount(count + 1);
            return (
              <Suspense fallback={<Fallback/>}>
                <Child
                  query={query}
                  onClick={increment}
                />
              </Suspense>
            );
          };
  
          render(<Parent/>, { wrapper });
  
          await act(async() => {});
  
          const button = screen.getByRole('button');
  
          userEvent.click(button);
  
          await act(async() => {});
  
          expect(fetch).toBeCalledTimes(2);
        });
  
        describe('when the re-fetch succeeds', () => {
          it('returns the new data', async() => {
            const fetch = jest.fn(async count => `count: ${count}`);
            const Fallback = () => (<div>Loading...</div>);
            const Child = ({
              query: {
                data,
              },
              onClick,
            }: {
              query: Query<any>,
              onClick: () => void,
            }) => (
              <div>
                <div>
                  {data}
                </div>
                <div>
                  <button onClick={onClick}>increment</button>
                </div>
              </div>
            );
            const Parent = () => {
              const [ count, setCount ] = useState(0);
              const query = useQuery('count', () => fetch(count), [ count ]);
              const increment = () => setCount(count + 1);
              return (
                <Suspense fallback={<Fallback/>}>
                  <Child
                    query={query}
                    onClick={increment}
                  />
                </Suspense>
              );
            };
    
            render(<Parent/>, { wrapper });
  
            await screen.findByText('count: 0');
    
            const button = screen.getByRole('button');
    
            userEvent.click(button);
    
            await screen.findByText('count: 1');
          });
        });
  
        describe('when the re-fetch fails', () => {
          it('sets the status to error', async() => {
            // even with an error boundary, react logs the error to the console with no workaround
            // so we'll have to forcibly stub the console.error
            jest.spyOn(console, 'error').mockImplementation(() => {});
  
            const fetch = jest.fn(count => {
              if (count === 0) {
                return Promise.resolve(`count: ${count}`);
              }
              return Promise.reject(new Error('fetch went wrong'));
            });
            const Fallback = () => (<div>Loading...</div>);
            const Child = ({
              query: {
                data,
              },
              onClick,
            }: {
              query: Query<any>,
              onClick: () => void,
            }) => (
              <div>
                <div>
                  {data}
                </div>
                <div>
                  <button onClick={onClick}>increment</button>
                </div>
              </div>
            );
            const Parent = () => {
              const [ count, setCount ] = useState(0);
              const query = useQuery('count', () => fetch(count), [ count ]);
              const increment = () => setCount(count + 1);
              return (
                <ErrorBoundary fallback={<div>{query.status}</div>}>
                  <Suspense fallback={<Fallback/>}>
                    <Child
                      query={query}
                      onClick={increment}
                    />
                  </Suspense>
                </ErrorBoundary>
              );
            };
    
            render(<Parent/>, { wrapper });
    
            await act(async() => {});
    
            const button = screen.getByRole('button');
    
            userEvent.click(button);
    
            await screen.findByText(Status.ERROR);
          });
        });

        describe('when suspendOnRefetch is set', () => {
          it('sets the status to loading', async () => {
            const fetch = jest.fn(count => {
              if (count === 0) {
                return Promise.resolve(`count: ${count}`);
              }
              return new Promise(() => {});
            });
            const Fallback = () => (<div>Loading...</div>);
            const Child = ({
              query: {
                data,
                status,
              },
              onClick,
            }: {
              query: Query<any>,
              onClick: () => void,
            }) => (
              <div>
                <div>
                  {status}
                </div>
                <div>
                  <button onClick={onClick}>increment</button>
                </div>
              </div>
            );
            const Parent = () => {
              const [ count, setCount ] = useState(0);
              const query = useQuery('count', () => fetch(count), [ count ], { suspendOnRefetch: true });
              const increment = () => setCount(count + 1);
              return (
                <Suspense fallback={<Fallback/>}>
                  <Child
                    query={query}
                    onClick={increment}
                  />
                </Suspense>
              );
            };
    
            render(<Parent/>, { wrapper });
    
            await act(async() => {});
    
            await screen.findByText(Status.SUCCESS);
    
            const button = screen.getByRole('button');
    
            userEvent.click(button);
    
            await act(async() => {});
    
            await screen.findByText('Loading...');
          });

          describe('when the re-fetch succeeds', () => {
            it('returns the new data', async() => {
              const fetch = jest.fn(async count => `count: ${count}`);
              const Fallback = () => (<div>Loading...</div>);
              const Child = ({
                query: {
                  data,
                },
                onClick,
              }: {
                query: Query<any>,
                onClick: () => void,
              }) => (
                <div>
                  <div>
                    {data}
                  </div>
                  <div>
                    <button onClick={onClick}>increment</button>
                  </div>
                </div>
              );
              const Parent = () => {
                const [ count, setCount ] = useState(0);
                const query = useQuery('count', () => fetch(count), [ count ], { suspendOnRefetch: true });
                const increment = () => setCount(count + 1);
                return (
                  <Suspense fallback={<Fallback/>}>
                    <Child
                      query={query}
                      onClick={increment}
                    />
                  </Suspense>
                );
              };
      
              render(<Parent/>, { wrapper });
    
              await screen.findByText('count: 0');
      
              const button = screen.getByRole('button');
      
              userEvent.click(button);
      
              await screen.findByText('count: 1');
            });
          });
        });
      });
  
      describe('when the key changes', () => {
        it('supsends the component', async() => {
          const fetch = jest.fn(count => {
            if (count === 0) {
              return Promise.resolve(`count: ${count}`);
            }
            return new Promise(() => {});
          });
          const Fallback = () => (<div>Loading...</div>);
          const Child = ({
            query: {
              data,
              status,
            },
            onClick,
          }: {
            query: Query<any>,
            onClick: () => void,
          }) => (
            <div>
              <div>
                {status}
              </div>
              <div>
                <button onClick={onClick}>increment</button>
              </div>
            </div>
          );
          const Parent = () => {
            const [ count, setCount ] = useState(0);
            const query = useQuery(`count-${count}`, () => fetch(count), [ count ]);
            const increment = () => setCount(count + 1);
            return (
              <Suspense fallback={<Fallback/>}>
                <Child
                  query={query}
                  onClick={increment}
                />
              </Suspense>
            );
          };
  
          render(<Parent/>, { wrapper });
  
          await act(async() => {});
  
          await screen.findByText(Status.SUCCESS);
  
          const button = screen.getByRole('button');
  
          userEvent.click(button);
  
          await act(async() => {});
  
          await screen.findByText('Loading...');
        });
      });
  
      describe('when I invalidate the query', () => {
        it('re-fetches the current query', async() => {
          const fetch = jest.fn().mockResolvedValue('foo');
          const Child = ({ query }: { query: Query<any> }) => (
            <div>
              <div>{query.data}</div>
              <button onClick={query.invalidate}>refresh</button>
            </div>
          );
          const Parent = () => {
            const query = useQuery('basket', fetch);
            return (
              <Suspense fallback={<div>loading</div>}>
                <Child query={query}/>
              </Suspense>
            );
          };
  
          render(<Parent/>, { wrapper });
  
          const button = await screen.findByRole('button');
          userEvent.click(button);
  
          await act(async() => {});
  
          expect(fetch).toBeCalledTimes(2);
        });
      });
  
      describe('when I reset the query', () => {
        it('suspends the component', async() => {
          const fetch = jest.fn()
            .mockImplementationOnce(() => Promise.resolve('first'))
            .mockImplementationOnce(() => new Promise(() => {}));
  
          const Child = ({ query }: { query: Query<any> }) => (
            <div>
              <div>{query.data}</div>
              <button onClick={query.reset}>refresh</button>
            </div>
          );
          const Parent = () => {
            const query = useQuery('basket', fetch);
            return (
              <Suspense fallback={<div>loading</div>}>
                <Child query={query}/>
              </Suspense>
            );
          };
  
          render(<Parent/>, { wrapper });
  
          await screen.findByText('first');
  
          const button = await screen.findByRole('button');
          userEvent.click(button);
  
          await screen.findByText('loading');
        });
        it('returns the data', async() => {
          const fetch = jest.fn()
            .mockImplementationOnce(() => Promise.resolve('first'))
            .mockImplementationOnce(() => Promise.resolve('second'));
  
          const Child = ({ query }: { query: Query<any> }) => (
            <div>
              <div>{query.data}</div>
              <button onClick={query.reset}>refresh</button>
            </div>
          );
          const Parent = () => {
            const query = useQuery('basket', fetch);
            return (
              <Suspense fallback={<div>loading</div>}>
                <Child query={query}/>
              </Suspense>
            );
          };
  
          render(<Parent/>, { wrapper });
  
          await screen.findByText('first');
  
          const button = await screen.findByRole('button');
          userEvent.click(button);
  
          await screen.findByText('second');
        });
      });
    });
  
    describe('when the data fails to fetch', () => {
      it('sets the status to error', async() => {
        // even with an error boundary, react logs the error to the console with no workaround
        // so we'll have to forcibly stub the console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});
  
        const fetch = jest.fn(() => Promise.reject('error'));
        const Fallback = () => (<div>Loading...</div>);
        const Child = ({
          query: {
            data,
          },
        }: {
          query: Query<any>,
        }) => (
          <div>
            <div>
              {data}
            </div>
          </div>
        );
        const Parent = () => {
          const query = useQuery('count', () => fetch(), []);
          return (
            <ErrorBoundary fallback={<div>{query.status}</div>}>
              <Suspense fallback={<Fallback/>}>
                <Child
                  query={query}
                />
              </Suspense>
            </ErrorBoundary>
          );
        };
  
        render(<Parent/>, { wrapper });
  
        await act(async() => {});
  
        await screen.findByText(Status.ERROR);
      });
  
      describe('when I invalidate the query', () => {
        it('resets the status and refetches the data', async() => {
          // even with an error boundary, react logs the error to the console with no workaround
          // so we'll have to forcibly stub the console.error
          jest.spyOn(console, 'error').mockImplementation(() => {});
  
          const fetch = jest.fn()
            .mockImplementationOnce(() => Promise.reject('error'))
            .mockImplementationOnce(() => Promise.resolve('it worked'));
  
          const Fallback = () => (<div>Loading...</div>);
          const Child = ({
            query: {
              data,
            },
          }: {
            query: Query<any>,
          }) => (
            <div>
              <div>
                {data}
              </div>
            </div>
          );
          const Parent = () => {
            const query = useQuery('count', () => fetch());
            return (
              <ErrorBoundary
                onReset={query.invalidate}
                FallbackComponent={({ resetErrorBoundary }) => (
                  <div>
                    <div>{query.status}</div>
                    <button onClick={resetErrorBoundary}>retry</button>
                  </div>
                )}
              >
                <Suspense fallback={<Fallback/>}>
                  <Child
                    query={query}
                  />
                </Suspense>
              </ErrorBoundary>
            );
          };
  
          render(<Parent/>, { wrapper });
  
          await screen.findByText(Status.ERROR);
  
          userEvent.click(screen.getByRole('button'));
  
          await screen.findByText('it worked');
        });
      });

      describe('when retry is set', () => {
        it('retries as long as retry returns true', async() => {
          const fetch = jest.fn()
            .mockRejectedValueOnce('error 1')
            .mockRejectedValueOnce('error 2')
            .mockRejectedValueOnce('error 3')
            .mockRejectedValueOnce('error 4');
          const Fallback = () => (<div>Loading...</div>);
          const Child = ({ query }: { query: Query<string> }) => <div>{query.data}</div>;
          const Parent = () => {
            const query = useQuery('count', fetch, [], {
              retry: (err, count) => count < 3 && new Promise(res => setTimeout(res, 50)),
            });
            return (
              <ErrorBoundary FallbackComponent={({ error }) => <div>{error}</div>}>
                <Suspense fallback={<Fallback/>}>
                  <Child query={query}/>
                </Suspense>
              </ErrorBoundary>
            );
          };

          render(<Parent/>, { wrapper });

          await screen.findByText('error 3');
        });
      });
    });
  });

  describe('when fetch is synchronous', () => {
    it('renders data immediately without suspending', async() => {
      const fetch = () => 'foo';
      const Child = ({ query }: { query: Query<string> }) => (
        <div>{query.data}</div>
      );
      const Parent = () => {
        const query = useQuery('basket', fetch);
        return (<Child query={query}/>);
      };

      render(<Parent/>, { wrapper });

      await screen.findByText('foo');
    });
    it('only calls fetch once', async() => {
      const fetch = jest.fn(() => 'foo');
      const Child = ({ query }: { query: Query<string> }) => (
        <div>{query.data}</div>
      );
      const Parent = () => {
        const query = useQuery('basket', fetch);
        return (<Child query={query}/>);
      };

      render(<Parent/>, { wrapper });

      await screen.findByText('foo');

      expect(fetch).toBeCalledTimes(1);
    });
    describe('when fetch throws an error', () => {
      it('sets the status to error', async() => {
        // even with an error boundary, react logs the error to the console with no workaround
        // so we'll have to forcibly stub the console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});
  
        const fetch = jest.fn(() => {
          throw new Error('error');
        });
        const Child = ({
          query: {
            data,
          },
        }: {
          query: Query<any>,
        }) => (
          <div>
            <div>
              {data}
            </div>
          </div>
        );
        const Parent = () => {
          const query = useQuery('count', () => fetch(), []);
          return (
            <ErrorBoundary fallback={<div>{query.status}</div>}>
              <Child
                query={query}
              />
            </ErrorBoundary>
          );
        };
  
        render(<Parent/>, { wrapper });
  
        await act(async() => {});
  
        await screen.findByText(Status.ERROR);
      });
      describe('when retry is set', () => {
        it('retries as long as retry returns true', async() => {
          const fetch = jest.fn()
            .mockImplementationOnce(() => {
              throw 'error 1';
            })
            .mockImplementationOnce(() => {
              throw 'error 2';
            })           
            .mockImplementationOnce(() => {
              throw 'error 3';
            })           
            .mockImplementationOnce(() => {
              throw 'error 4';
            });
          const Child = ({ query }: { query: Query<string> }) => <div>{query.data}</div>;
          const Parent = () => {
            const query = useQuery('count', fetch, [], {
              retry: (err, count) => count < 3,
            });
            return (
              <ErrorBoundary FallbackComponent={({ error }) => <div>{error}</div>}>
                <Child query={query}/>
              </ErrorBoundary>
            );
          };

          render(<Parent/>, { wrapper });

          await screen.findByText('error 3');
        });
      });
    });
  });

  describe('when fetch is not provided', () => {
    it('renders with undefined immediately without suspending', async() => {
      const Child = ({ query }: { query: Query<any> }) => (
        <div>
          {(query.data === undefined).toString()}
        </div>
      );
      const Parent = () => {
        const query = useQuery('basket');
        return (
          <Child query={query}/>
        );
      };

      render(<Parent/>, { wrapper });

      await screen.findByText('true');
    });
  });
});

describe('resolve', () => {
  describe('when I resolve an already-fetched query', () => {
    it('returns the value', async() => {
      const fetch = jest.fn().mockResolvedValue('foo');
      const Component = () => {
        const query = useQuery('test', fetch, [], { prefetch: true });
        const [ state, setState ] = useState<string>(null);

        useEffect(() => {
          if (query.status === Status.SUCCESS) {
            query.resolve().then(x => {
              setState(x);
            });
          }
        }, [ query.resolve, query.status ]);

        return <div>{state}</div>;
      };

      render(<Component/>, { wrapper });

      await screen.findByText('foo');

      expect(fetch).toBeCalledTimes(1);
    });

  });
  describe('when I resolve a new query', () => {
    it('fetches and resolves the value', async() => {
      const fetch = jest.fn().mockResolvedValue('foo');
      const Component = () => {
        const query = useQuery('test', fetch);
        const [ state, setState ] = useState<string>(null);

        useEffect(() => {
          query.resolve().then(x => {
            setState(x);
          });
        }, [ query.resolve ]);

        return <div>{state}</div>;
      };

      render(<Component/>, { wrapper });

      await screen.findByText('foo');

      expect(fetch).toBeCalledTimes(1);
    });
    describe('when I access the query', () => {
      it('returns the cached value', async() => {
        const fetch = jest.fn().mockResolvedValue('foo');
        const Component = () => {
          const query = useQuery('test', fetch);
          const [ state, setState ] = useState<string>(null);
          const [ moreState, setMoreState ] = useState<string>(null);
  
          useEffect(() => {
            query.resolve().then(x => {
              setState(x);
            });
          }, [ query.resolve ]);

          useEffect(() => {
            if (state) {
              setMoreState(query.data);
            }
          }, [ state ]);
  
          return <div>{moreState}</div>;
        };
  
        render(<Component/>, { wrapper });
  
        await screen.findByText('foo');
  
        expect(fetch).toBeCalledTimes(1);
      });
    });
  });
});

describe('when I apply a value to data', () => {
  it('returns the new data value immediately', async() => {
    const Child = ({ query }: { query: Query<any> }) => (
      <div>{query.data}</div>
    );
    const Parent = () => {
      const query = useQuery('basket', () => 'foo');

      useEffect(() => {
        query.data = 'bah';
      }, []);

      return (
        <Suspense fallback={<div/>}>
          <Child query={query}/>
        </Suspense>
      );
    };

    render(<Parent/>, { wrapper });

    await screen.findByText('bah');
  });
});

describe('when I prefetch my query', () => {
  it('sets the status to loading', async() => {
    // even though we're never accessing data it should be loading in the background
    const Child = ({ query: { status} }: { query: Query<any> }) => (
      <div>{status}</div>
    );
    const Parent = () => {
      const query = useQuery('basket', () => new Promise(() => {}), [], { prefetch: true });

      // we also shouldn't need to suspend the component...
      return (
        <Child query={query}/>
      );
    };

    render(<Parent/>, { wrapper });

    await screen.findByText(Status.LOADING);
  });
  describe('when I access data', () => {
    it('returns the data', async() => {
      const Child = ({ query: { data } }: { query: Query<any> }) => (
        <div>{data}</div>
      );
      const Parent = () => {
        const [ showChild, setShowChild ] = useState(false);
        const query = useQuery('basket', () => Promise.resolve('foo'), [], { prefetch: true });

        useEffect(() => {
          setTimeout(() => {
            setShowChild(true);
          }, 250);
        }, []);

        if (showChild) {
          return <Child query={query}/>;
        }

        return null;
      };

      render(<Parent/>, { wrapper });

      await screen.findByText('foo');
    });
  });
});

describe('when I make a query eager', () => {
  it('immediately suspends the component and fetches the data', async() => {
    const Child = () => (
      <div>I dont even care about your stinkin query</div>
    );
    const Fallback = () => (<div>loading</div>);
    const Parent = () => {
      const query = useQuery('basket', () => new Promise(() => {}), [], { eager: true });

      return (
        <Child/>
      );
    };

    render((
      <Suspense fallback={<Fallback/>}>
        <Parent/>
      </Suspense>
    ), { wrapper });

    await screen.findByText('loading');
  });
  describe('when the data is fetched', () => {
    it('renders the child component', async() =>{
      const Child = () => (
        <div>I dont even care about your stinkin query</div>
      );
      const Fallback = () => (<div>loading</div>);
      const Parent = () => {
        const query = useQuery('basket', () => Promise.resolve('foo'), [], { eager: true });
  
        return (
          <Child/>
        );
      };
  
      render((
        <Suspense fallback={<Fallback/>}>
          <Parent/>
        </Suspense>
      ), { wrapper });
  
      await screen.findByText('I dont even care about your stinkin query');
    });
  });
});

describe('when I set a ttl', () => {
  describe('when the ttl has not lapsed', () => {
    it('uses the cached data', async() => {
      const fetch = jest.fn().mockResolvedValue('I am content');
      const Fallback = () => (<div>Loading...</div>);
      const Child = ({ query }: { query: Query<any> }) => (<div>{query.data}</div>);
      const Parent = () => {
        const query = useQuery('basket', fetch, [], { ttl: 1000 });
        return (<Child query={query}/>);
      };
  
      const { rerender } = render(
        <Suspense fallback={<Fallback/>}>
          <Parent/>
        </Suspense>,
        { wrapper }
      );
  
      await screen.findByText('I am content');
      expect(fetch).toBeCalledTimes(1);

      await act(() => new Promise(res => setTimeout(res, 100)));
      rerender(
        <Suspense fallback={<Fallback/>}>
          <Parent/>
        </Suspense>
      );

      expect(fetch).toBeCalledTimes(1);
    });
  });
  describe('when the ttl has lapsed', () => {
    it('re-fetches the data', async() => {
      const fetch = jest.fn().mockResolvedValue('I am content');
      const Fallback = () => (<div>Loading...</div>);
      const Child = ({ query }: { query: Query<any> }) => (<div>{query.data}</div>);
      const Parent = () => {
        const query = useQuery('basket', fetch, [], { ttl: 1000 });
        return (<Child query={query}/>);
      };
  
      const { rerender } = render(
        <Suspense fallback={<Fallback/>}>
          <Parent/>
        </Suspense>,
        { wrapper }
      );
  
      await screen.findByText('I am content');

      await act(() => new Promise(res => setTimeout(res, 1000)));
      rerender(
        <Suspense fallback={<Fallback/>}>
          <Parent/>
        </Suspense>
      );

      expect(fetch).toBeCalledTimes(2);
    });
    describe('when I re-render', () => {
      it('uses the cached data', async() => {
        const fetch = jest.fn().mockResolvedValue('I am content');
        const Fallback = () => (<div>Loading...</div>);
        const Child = ({ query }: { query: Query<any> }) => (<div>{query.data}</div>);
        const Parent = () => {
          const query = useQuery('basket', fetch, [], { ttl: 1000 });
          return (<Child query={query}/>);
        };
    
        const { rerender } = render(
          <Suspense fallback={<Fallback/>}>
            <Parent/>
          </Suspense>,
          { wrapper }
        );
    
        await screen.findByText('I am content');
  
        await act(() => new Promise(res => setTimeout(res, 1000)));
        rerender(
          <Suspense fallback={<Fallback/>}>
            <Parent/>
          </Suspense>
        );

        await act(() => new Promise(res => setTimeout(res, 100)));
        rerender(
          <Suspense fallback={<Fallback/>}>
            <Parent/>
          </Suspense>
        );
  
        expect(fetch).toBeCalledTimes(2);
      });
      describe('when the ttl lapses a second time', () => {
        it('re-fetches the data again', async () => {
          const fetch = jest.fn().mockResolvedValue('I am content');
          const Fallback = () => (<div>Loading...</div>);
          const Child = ({ query }: { query: Query<any> }) => (<div>{query.data}</div>);
          const Parent = () => {
            const query = useQuery('basket', fetch, [], { ttl: 1000 });
            return (<Child query={query}/>);
          };
      
          const { rerender } = render(
            <Suspense fallback={<Fallback/>}>
              <Parent/>
            </Suspense>,
            { wrapper }
          );
      
          await screen.findByText('I am content');
    
          await act(() => new Promise(res => setTimeout(res, 1000)));
          rerender(
            <Suspense fallback={<Fallback/>}>
              <Parent/>
            </Suspense>
          );
  
          await act(() => new Promise(res => setTimeout(res, 100)));
          rerender(
            <Suspense fallback={<Fallback/>}>
              <Parent/>
            </Suspense>
          );

          await act(() => new Promise(res => setTimeout(res, 1000)));
          rerender(
            <Suspense fallback={<Fallback/>}>
              <Parent/>
            </Suspense>
          );
    
          expect(fetch).toBeCalledTimes(3);
        });
      });
    });
  });
  describe('when ttl is 0', () => {
    it('does not blow up', async() => {
      const fetch = jest.fn().mockResolvedValue('I am content');
      const Fallback = () => (<div>Loading...</div>);
      const Child = ({ query }: { query: Query<any> }) => {
        return (<div>{query.data}</div>);
      };
      const Parent = () => {
        const query = useQuery('basket', fetch, [], { ttl: 0 });
        return (<Child query={query}/>);
      };
  
      const { rerender } = render(
        <Suspense fallback={<Fallback/>}>
          <Parent/>
        </Suspense>,
        { wrapper }
      );

      await act(() => new Promise(res => setTimeout(res, 1000)));
  
      await screen.findByText('I am content');
      expect(fetch).toBeCalledTimes(1);

      await act(() => new Promise(res => setTimeout(res, 100)));
      rerender(
        <Suspense fallback={<Fallback/>}>
          <Parent/>
        </Suspense>
      );

      expect(fetch).toBeCalledTimes(2);
    });
  });
});