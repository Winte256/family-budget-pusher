import { Markup,  Telegraf } from 'telegraf';


import { push } from './commands';
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';


const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply('Приветик'));
bot.help((ctx) => ctx.reply('Help message'));

bot.command('push', push());
bot.command(
  'add',
  (ctx) =>
    ctx.reply(
      'Выберие валюту',
      Markup.keyboard([['💰 USD', '🇹🇷 TRY', '🇷🇺 RUB']])
        .oneTime()
        .resize()
    )
);

bot.hears('💰 USD', (ctx) => ctx.reply('Yay!3'));
bot.hears('🇹🇷 TRY', (ctx) => ctx.reply('Yay!1'));
bot.hears('🇷🇺 RUB', (ctx) => ctx.reply('Yay!2'));

bot.on('message', greeting());

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
