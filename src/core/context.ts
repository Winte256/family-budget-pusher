import { Context as BaseContext, SessionFlavor } from 'grammy';
import { Session } from './session';
import { MenuFlavor } from '@grammyjs/menu';

export type Context = BaseContext & SessionFlavor<Session> & MenuFlavor;
