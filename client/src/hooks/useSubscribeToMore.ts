import { useEffect } from 'react';

export const useSubscribeToMore: any = ({ options, subscribeToMore } : { options: any, subscribeToMore: Function }) => {

  useEffect(()=>{
    Object.keys(options).forEach(key => {
      subscribeToMore(options[key]);
    });
  }, [options, subscribeToMore]);

};
