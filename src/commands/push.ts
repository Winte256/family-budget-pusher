import { Context } from './../core/context';

import createDebug from 'debug';
import { currencyMenu } from '../keyboards';
import { Composer } from "grammy";

const composer = new Composer<Context>();

const debug = createDebug('bot:push_command');

export const pushHandler = (ctx: Context) =>
  ctx.reply(
    'Выберие валюту',
    {
      reply_markup: currencyMenu
    }
  )

composer.command('push', pushHandler);

export default composer;