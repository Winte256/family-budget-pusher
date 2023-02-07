import { Context, deunionize } from 'telegraf';
import createDebug from 'debug';
import { pushNewSpending } from '../utils/sheets';

const debug = createDebug('bot:greeting_text');

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_to_message_id: messageId,
  });

const greeting = () => async (ctx: Context) => {
  debug('Triggered "greeting" text command');
  
  const messageId = ctx.message?.message_id;
  
  debug('messageId', messageId);


  const userName = ctx.message?.from.username;


  if (messageId) {

    
    try {
      const value = deunionize(ctx?.message).text;

      if (typeof value === 'string' && !!Number(value)) {
        const moneyLeft = await pushNewSpending(value);
        
        await replyToMessage(ctx, messageId, `данные занесены, на сегодня осталось ${moneyLeft} USD`);
      } else {
        await replyToMessage(ctx, messageId, `Ошибка формата`);
      }
    } catch (err) {
      await replyToMessage(ctx, messageId, `Ошибка формата`);
    }

  }
};

export { greeting };
