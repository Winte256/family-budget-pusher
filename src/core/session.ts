import { session as session_ } from 'grammy';

export interface Session {
  spentData: {
    isActual?: boolean;
    currency?: string;
    isToday?: boolean;
    waitForDesc?: boolean;
  };
}

export const initial = (): Session => ({
  spentData: {},
});

export const session = session_({ initial });
