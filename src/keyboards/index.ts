import { Menu } from "@grammyjs/menu";
import { Composer } from "grammy";
import { Context } from "../core/context";
import getCurrentRow from "../utils/getCurrentRow";
import { getSaldo } from "../utils/sheets";

export const flags = {
  usd: '💰 USD',
  try: '🇹🇷 TRY',
  rub: '🇷🇺 RUB',
  rsd: '🇷🇸 RSD'
}

const composer = new Composer<Context>();

export const currencyMenu = (() => {

  const menu = new Menu<Context>("currency-menu");

    Object.entries(flags).forEach(([key, value]) => {
      menu.text(value, ctx => {
        if (ctx.session.spentData?.isActual) {
          ctx.reply(
            'Произошла ошибка. Давайте начнем сначала. Введите /menu или /push'
          )
          return;
        }

        ctx.session.spentData = {
          ...ctx.session.spentData,
          isActual: true,
          currency: key,
        };
        
        const dayText = ctx.session.spentData.isToday ? 'сегодняшний' : 'вчерашний';

        ctx.reply(`Жду ваш ${dayText} расход в валюте ${value}`)
      });
    })

    return menu;
})();

export const dayPickerMenu = new Menu<Context>('day-picker-menu')
  .text('Да', (ctx) =>  {
    if (ctx.session.spentData?.isActual) {
      ctx.reply(
        'Произошла ошибка. Давайте начнем сначала. Введите /menu или /push'
      )
      return;
    }

    ctx.session.spentData = {
      ...ctx.session.spentData,
      isToday: true
    };

    ctx.reply(
      'Выберие валюту',
      { reply_markup: currencyMenu }
    )
  })
  .text('Нет, вчера (пока не работает)')

export const mainMenu = new Menu<Context>('main-menu')
  .text('Добавить затраты', (ctx) => ctx.reply(
    'Траты были сегодня?',
    {
      reply_markup: dayPickerMenu
    }
  ))
  .text('Узнать остаток на сегодня', async (ctx) => {
    const saldo = await getSaldo({currentRowDate: getCurrentRow()})

    const text = Object
      .entries(saldo)
      .map(([key, value]) => 
        `${(flags as any)[key].split(' ').reverse().join('')} ${value}`).join('\n')

    ctx.reply('```\n'+ text +'\n```', { parse_mode: "MarkdownV2" })
  });

composer.use(currencyMenu)
composer.use(dayPickerMenu)
composer.use(mainMenu)

export default composer;