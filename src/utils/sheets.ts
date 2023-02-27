import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import createDebug from 'debug';
import getCurrentRow from './getCurrentRow';

const debug = createDebug('sheet');

const { GOOGLE_SHEET_ID, GOOGLE_SERVICE_EMAIL, GOOGLE_SERVICE_PRIVATE_KEY } =
  process.env;

export const initSheet = async () => {
  const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth({
    // env var values are copied from service account credentials generated by google
    // see "Authentication" section in docs for more info
    client_email: GOOGLE_SERVICE_EMAIL!,
    private_key: GOOGLE_SERVICE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  const lastSheet = doc.sheetsByIndex[0];

  await lastSheet.loadCells('A1:O32');

  return lastSheet;
};

export const getSaldo = async ({
  sheet,
  currentRowDate,
}: {
  sheet?: GoogleSpreadsheetWorksheet;
  currentRowDate: number;
}) => {
  const table = sheet || (await initSheet());

  if (sheet) {
    await table.loadCells('A1:O32');
  }

  let leftMoney: any = table.getCell(currentRowDate, 14);

  if (typeof leftMoney.value === 'string') {
    leftMoney = leftMoney.value
      .split(';')
      .map((a: string) => a.split('/'))
      .map(([key, value]: string[]) => [key, Number(value).toFixed(2)]);

    return Object.fromEntries(leftMoney);
  }

  return leftMoney.value;
};

export const pushNewSpending = async ({
  value,
  currency,
  isToday,
}: {
  value: string;
  currency: string;
  isToday: boolean;
}) => {
  const sheet = await initSheet();
  let currentRowDate = getCurrentRow();

  if (!isToday && currentRowDate > 1) {
    currentRowDate -= 1;
  }

  const cellsByCurrency = {
    usd: 11,
    try: 9,
    rub: 10,
    rsd: 8,
  };

  const cellWithNeedCurrency =
    cellsByCurrency[currency as keyof typeof cellsByCurrency];

  if (!cellWithNeedCurrency) {
    throw new Error('Валюта не поддерживается');
  }

  const todaySpendingsCell = sheet.getCell(
    currentRowDate,
    cellWithNeedCurrency
  );

  const { formula } = todaySpendingsCell;
  let newFormula = formula ? formula + '+' : '=';
  newFormula += value;

  todaySpendingsCell.formula = newFormula;

  await sheet.saveUpdatedCells();

  return (await getSaldo({ sheet, currentRowDate }))[currency];
};

export const pushNewDesc = async ({
  value,
  isToday,
}: {
  value: string;
  isToday: boolean;
}) => {
  const sheet = await initSheet();
  let currentRowDate = getCurrentRow();

  debug('upload new desc');
  debug('day', currentRowDate);

  if (!isToday && currentRowDate > 1) {
    currentRowDate -= 1;
  }

  const descCellId = 7;

  const descCell = sheet.getCell(currentRowDate, descCellId);

  let currentVal = String(descCell.value || '');
  currentVal = currentVal ? `${currentVal}++` : '';

  descCell.value = `${currentVal}${value}`;

  await sheet.saveUpdatedCells();

  return descCell.value;
};
