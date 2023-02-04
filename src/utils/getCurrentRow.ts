
export default () => {
  const timeZone = +3;
  const date = new Date();
  date.setHours(date.getHours() + timeZone);
  return date.getDate();

}