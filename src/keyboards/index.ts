import { Menu } from '@grammyjs/menu';
import { Composer } from 'grammy';
import { Context } from '../core/context';
import getCurrentRow from '../utils/getCurrentRow';
import { getSaldo } from '../utils/sheets';

export const flags = {
  usd: '💰 USD',
  try: '🇹🇷 TRY',
  rub: '🇷🇺 RUB',
  rsd: '🇷🇸 RSD',
};

const titles = {
  currency: 'Выберие валюту',
  dayPicker: 'Когда деньги были потрачены',
  main: 'Главное меню',
};

const composer = new Composer<Context>();

export const currencyMenu = (() => {
  const menu = new Menu<Context>('currency-menu')
    .text('В главное меню', async (ctx) => {
      await ctx.editMessageText(titles.main);
      ctx.menu.back();
    })
    .row();

  const makeCurrencyButton = ([key, value]: [string, string]) => {
    menu.text(value, (ctx) => {
      if (ctx.session.spentData?.isActual) {
        ctx.reply('Произошла ошибка. Давайте начнем сначала. Введите /menu');
        return;
      }

      ctx.session.spentData = {
        ...ctx.session.spentData,
        isActual: true,
        currency: key,
      };

      const dayText = ctx.session.spentData.isToday
        ? 'сегодняшний'
        : 'вчерашний';

      ctx.reply(`Жду ваш ${dayText} расход в валюте ${value}`);
    });
  };

  Object.entries(flags).forEach(makeCurrencyButton);

  return menu;
})();

const chooseDay =
  (isToday = true) =>
  async (ctx: Context) => {
    if (ctx.session.spentData?.isActual) {
      ctx.reply(
        'Произошла ошибка. Давайте начнем сначала. Введите /menu или /push'
      );
      return;
    }

    ctx.session.spentData = {
      ...ctx.session.spentData,
      isToday,
    };

    await ctx.editMessageText(titles.currency);
    ctx.menu.nav('currency-menu');
  };

export const dayPickerMenu = new Menu<Context>('day-picker-menu')
  .text('Сегодня', chooseDay(true))
  .text('Вчера', chooseDay(false))
  .row()
  .text('Вернуться в главное меню', async (ctx) => {
    await ctx.editMessageText(titles.main);
    ctx.menu.back();
  });

export const mainMenu = new Menu<Context>('main-menu')
  .text('Добавить затраты', async (ctx) => {
    await ctx.editMessageText(titles.dayPicker);
    ctx.menu.nav('day-picker-menu');
  })
  .row()
  .text('Узнать остаток на сегодня', async (ctx) => {
    const saldo = await getSaldo({ currentRowDate: getCurrentRow() });

    const text = Object.entries(saldo)
      .map(
        ([key, value]) =>
          `${(flags as any)[key].split(' ').reverse().join('')} ${value}`
      )
      .join('\n');

    ctx.reply('На сегодня осталось' + '```\n' + text + '\n```', {
      parse_mode: 'MarkdownV2',
    });
  });

mainMenu.register(currencyMenu);
mainMenu.register(dayPickerMenu);

composer.use(mainMenu);

export const descMenu = new Menu<Context>('desc-menu')
  .text('Да', (ctx) => {
    ctx.session.spentData = {
      isToday: ctx.session.spentData.isToday,
      waitForDesc: true,
    };
    ctx.reply('Жду вашего описания');
  })
  .text('Нет', (ctx) =>
    ctx.reply(`Вернул вас в ${titles.main}`, { reply_markup: mainMenu })
  );

composer.use(descMenu);

export default composer;
