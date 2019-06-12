const pm2 = require('pm2');

// SETTINGS
const delayTime = 86400 *1000;
//

process.on('message', (packet) => {
  console.log('### NOTIFY ###');
  console.log(packet);

  if(packet.type == 'register:msg') {
    const data = packet.data;
    pm2.sendDataToProcessId(0, {
      type: 'register:msg',
      data: data,
      topic: 'Register teacher'
    }, (err, res) => { });
  }
  

});

const intervalLessons = setInterval(() => {
  //console.log('----- intervalLessons -----');
}, 100000);