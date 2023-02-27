import createDebug from 'debug';
import { pushNewDesc, pushNewSpending } from '../utils/sheets';
import { Context } from './../core/context';
import { Composer } from 'grammy';

import { mainMenu, flags, descMenu } from '../keyboards';

const debug = createDebug('bot:bot_text');

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_to_message_id: messageId,
  });

const addSpending = async ({
  ctx,
  currency,
  messageId,
}: {
  ctx: Context;
  currency: string;
  messageId: number;
}) => {
  ctx.session.spentData = {
    ...ctx.session.spentData,
    isActual: false,
  };

  try {
    const value = ctx.message!.text;

    debug('message', value);

    if (typeof value === 'string' && !!Number(value)) {
      const moneyLeft = await pushNewSpending({
        value,
        currency,
        isToday: !!ctx.session.spentData.isToday,
      });

      await ctx.reply(
        `данные занесены, на сегодня осталось ${moneyLeft} ${
          (flags as any)[currency]
        }. \nЖелаете добавить описание?`,
        {
          reply_to_message_id: messageId,
          reply_markup: descMenu,
        }
      );
    } else {
      await replyToMessage(ctx, messageId, `Ошибка формата`);
    }
  } catch (err) {
    debug('error', err);
    await replyToMessage(ctx, messageId, `Ошибка формата`);
  }
};

const writeDesc = async ({
  ctx,
  messageId,
}: {
  ctx: Context;
  messageId: number;
}) => {
  try {
    const value = ctx.message!.text || '';
    const result = await pushNewDesc({
      value,
      isToday: !!ctx.session.spentData?.isActual,
    });

    ctx.session.spentData = {};

    await ctx.reply(`Описание добавлено.\nВы в главном меню`, {
      reply_to_message_id: messageId,
      reply_markup: mainMenu,
    });
  } catch (err) {
    debug('error', err);
    await replyToMessage(
      ctx,
      messageId,
      `Что-то пошло не так при добавлении описания`
    );
  }
};

const main = () => async (ctx: Context) => {
  debug('Triggered "message" text command');

  const messageId = ctx.message?.message_id;
  const isActiveRouteToAddSpending = ctx.session.spentData?.isActual;
  const currency = ctx.session.spentData?.currency;

  debug('isActiveRouteToAddSpending', isActiveRouteToAddSpending);

  if (!messageId) {
    return await ctx.reply('Что то пошло не так', { reply_markup: mainMenu });
  }

  if (isActiveRouteToAddSpending && currency) {
    return await addSpending({ ctx, currency, messageId });
  }

  if (ctx.session.spentData.waitForDesc) {
    return await writeDesc({ ctx, messageId });
  }

  return await ctx.reply('Давайте начнем сначала', { reply_markup: mainMenu });
};

const composer = new Composer<Context>();

composer.on('message', main());

export default composer;
