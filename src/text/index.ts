import createDebug from 'debug';
import { pushNewSpending } from '../utils/sheets';
import { Context } from './../core/context';
import { Composer } from 'grammy';

import { mainMenu, flags } from '../keyboards';

const debug = createDebug('bot:bot_text');

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_to_message_id: messageId,
  });

const main = () => async (ctx: Context) => {
  debug('Triggered "message" text command');

  const messageId = ctx.message?.message_id;
  const isActiveRouteToAddSpending = ctx.session.spentData?.isActual;

  debug('isActiveRouteToAddSpending', isActiveRouteToAddSpending);

  if (!messageId) {
    return await ctx.reply('Что то пошло не так');
  }

  if (!isActiveRouteToAddSpending) {
    return await ctx.reply('Давайте начнем сначала', {
      reply_markup: mainMenu,
    });
  }

  ctx.session.spentData = {
    ...ctx.session.spentData,
    isActual: false,
  };

  try {
    const value = ctx.message.text;
    const currency = ctx.session.spentData?.currency;

    debug('message', value);

    if (typeof value === 'string' && !!Number(value)) {
      const moneyLeft = await pushNewSpending({
        value,
        currency,
      });

      await replyToMessage(
        ctx,
        messageId,
        `данные занесены, на сегодня осталось ${moneyLeft} ${(flags as any)[currency]}`
      );
    } else {
      await replyToMessage(ctx, messageId, `Ошибка формата`);
    }
  } catch (err) {
    debug('error', err);    
    await replyToMessage(ctx, messageId, `Ошибка формата`);
  }
};

const composer = new Composer<Context>();

composer.on('message', main());

export default composer;
