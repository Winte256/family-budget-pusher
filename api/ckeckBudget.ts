import { flags } from '../src/keyboards';
// import { Bot } from 'grammy';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSaldo } from '../src/utils/sheets';
import getCurrentRow from '../src/utils/getCurrentRow';

export default async function handle(req: VercelRequest, res: VercelResponse) {
  try {
    const {chatId}  = req.query;
    
    if (typeof chatId !== 'string') {
      throw new Error('missed chatId');
    }

    const BOT_TOKEN = process.env.BOT_TOKEN || '';

    // const bot = new Bot(BOT_TOKEN);

    const saldo = await getSaldo({ currentRowDate: getCurrentRow() });

    const text = Object.entries(saldo)
      .map(
        ([key, value]) =>
          `${(flags as any)[key].split(' ').reverse().join('')} ${value}`
      )
      .join('<br>');

    res.send(text);
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>500</h1><p>Something went wrong</p>');
    console.error(e.message);
  }
}
