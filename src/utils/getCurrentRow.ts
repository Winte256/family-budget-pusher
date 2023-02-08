
export default () => {
  // set MSK timezone
  const date =  (new Date).toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow'
  });;

  const dayOfMonth = Number(date.split('.')[0])
  
  return dayOfMonth;
}