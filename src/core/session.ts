import { session as session_ } from 'grammy';


export interface Session {
  spentData: {
    [key: string]: any;
  }
}

export const initial = (): Session => ({
  spentData: {}
});


export const session = session_({ initial });