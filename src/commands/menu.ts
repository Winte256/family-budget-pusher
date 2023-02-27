import { Context } from '../core/context';

import createDebug from 'debug';
import { mainMenu } from '../keyboards';
import { Composer } from "grammy";

const composer = new Composer<Context>();

const debug = createDebug('bot:push_command');

export const pushHandler = (ctx: Context) =>
  ctx.reply(
    'Главное меню',
    {
      reply_markup: mainMenu
    }
  )

composer.command('menu', pushHandler);

export default composer;