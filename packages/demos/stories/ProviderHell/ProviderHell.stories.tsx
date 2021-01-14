import React, { useRef, memo, useCallback } from 'react';
import { useQuery, Provider, Query } from '@respite/query';

export default {
  title: 'Provider Hell',
};

export const example = () => {
  // eslint-disable-next-line react/display-name
  const ThingInnerInner = memo(({ data, onChange }: { data: string, onChange: (s: string) => void }) => {
    const countRef = useRef(0);
    countRef.current++;

    return (
      <div>
        <div>ThingInner Inner renders: {countRef.current}</div>
        <div>data: {data}</div>
        <label>
          <div>Set value</div>
          <input onChange={e => {
            onChange(e.target.value);
          }}/>
        </label>
      </div>
    );
  });
  // eslint-disable-next-line react/display-name
  const ThingInner = memo(({ query } : { query: Query<string> }) => {
    const countRef = useRef(0);
    countRef.current++;

    return (
      <div>
        <div>ThingInner renders: {countRef.current}</div>
        <ThingInnerInner data={query.data} onChange={useCallback(v => {query.data = v;}, [ query.data ])}/>
      </div>
    );
  });
  const Thing = ({ id }: { id: string }) => {
    const countRef = useRef(0);
    const query = useQuery(id, () => '');
    countRef.current++;

    return (
      <div>
        <div>key: {id}</div>
        <div>Thing renders: {countRef.current}</div>
        <ThingInner query={query}/>
      </div>
    );
  };

  return (
    <Provider>
      <Thing id="A"/>
      <Thing id="A"/>
      <Thing id="A"/>
      <Thing id="B"/>
      <Thing id="B"/>
      <Thing id="C"/>
      <Thing id="D"/>
      <Thing id="E"/>
    </Provider>
  );
};