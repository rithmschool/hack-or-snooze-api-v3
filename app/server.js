const { PORT } = require('./config');
const app = require('./app');

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(
    `Hack or Snooze API express server is listening on port ${PORT}...`
  );
});
