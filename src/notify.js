const pm2 = require('pm2');

process.on('message', (packet) => {
  console.log('### NOTIFY ###');
  console.log(packet);

  const data = packet.data;
  if (data.registerTeacher) {
    pm2.sendDataToProcessId(0, {
      type: 'register:msg',
      data: data,
      topic: 'Register teacher'
    });
  }
});

const intervalLessons = setInterval(() => {
  console.log('----- intervalLessons -----');
}, 100000);