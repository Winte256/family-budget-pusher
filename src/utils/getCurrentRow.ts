
export default () => {
  // set MSK timezone
  const date =  new Date((new Date).toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow'
  }));;
  
  return date.getDate();
}