const keyboard = {
  inline: {
    getHouses: (data) => {
      return JSON.stringify({
        inline_keyboard: data.map((currentValue, index) => {
          return [{
            text: currentValue.name,
            callback_data: `houses_${currentValue.id}`
          }]
        })
      });
    },

    getHouse: (notify) => {
      return JSON.stringify({
        inline_keyboard: [
          [
            {
              text: 'Добавить показания',
              callback_data: `addReadings`
            }
          ],
          [
            {
              text: notify? 'Выключить уведомления':'Включить уведомления',
              callback_data: `notify_${notify}`
            }
          ],
          [
            {
              text: 'Установить дату уведомления',
              callback_data: `notifyDate`
            }
          ],
          [
            {
              text: 'Назад',
              callback_data: `back`
            }
          ]
        ]
      })
    },

    setDate: (date) => {
      return setDateInlineOut(date);
    }

  },

  reply: {
    setDate: (date) => {
      return setDateOut(date);
    }
  }
};

function setDateInlineOut(date) {
  const nextMonth = new Date(date);
  const secMonth = new Date(date);

  nextMonth.setMonth(nextMonth.getMonth()+1);
  secMonth.setMonth(secMonth.getMonth()+2);
  
  const strNextMonth = getDateStringOut(nextMonth);
  const strSecMonth = getDateStringOut(secMonth);
  
  return JSON.stringify({
      inline_keyboard: [
        [
          {
            text: strNextMonth,
            callback_data: `notifyDate_${strNextMonth}`
          },
          {
            text: strSecMonth,
            callback_data: `notifyDate_${strSecMonth}`
          }
        ],
        [
          {
            text: 'Назад',
            callback_data: `back`
          }
        ]
      ]
    }
  );
}

function setDateOut(date) {
  const nextMonth = new Date(date);
  const secMonth = new Date(date);

  nextMonth.setMonth(nextMonth.getMonth()+1);
  secMonth.setMonth(secMonth.getMonth()+2);

  return JSON.stringify({
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [
          [getDateStringOut(nextMonth)],
          [getDateStringOut(secMonth)]
        ]
      });
}

function getDateStringOut(d) {
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

module.exports = keyboard;

/*

let replyOptions = {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [
        ['yes'],
        ['no']
      ],
    },
  };

  let keyboardStr = JSON.stringify({
      inline_keyboard: [
        [
          { text: 'Sandwich', callback_data: 'sandwich' },
          { text: 'A juicy steak', callback_data: 'steak' }
        ]
      ]
    });

*/