import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:about_command');

export const push = () => async (ctx: Context) => {
  
  debug(`Triggered "push" command with message`);
  const {message} = ctx;
  
  

  if (message) {
    await ctx.replyWithMarkdownV2('test', { parse_mode: 'Markdown' });
  }
};
