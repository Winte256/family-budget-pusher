import { Context } from './core/context';

import { Bot } from "grammy";
import keyboards from './keyboards';
import text from './text';
import commands from './commands';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { session } from './core/session';


const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Bot<Context>(BOT_TOKEN);

bot.use(session);
bot.use(keyboards);

bot.use(commands);
bot.use(text);

bot.command('start',(ctx) => ctx.reply('Личный бот учета финансов'));
bot.command('help', (ctx) => ctx.reply('Help message'));

// bot.on('message', greeting())

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
