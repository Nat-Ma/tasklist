
const date = () => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return new Date().toLocaleDateString('en-us', options);
}

const day = () => {
  return new Date().toLocaleDateString('en-us', { weekday: 'long' });
}

module.exports = {
  date: date(),
  day: day()
};
