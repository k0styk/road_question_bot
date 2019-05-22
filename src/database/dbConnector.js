const knex = require('knex');
const config = require('../../config/config');

class Connector {
  constructor(options) {
    this.options = null;
  }

  selectFromTableName(tableName, columns) {
    return Promise.resolve(knex(this.options)(tableName)
      .select(columns)
      .then(data => {
        return data;
      })
    );
  }

  getListRoadSchools() {
    return Promise.resolve(knex(this.options)
      .select('id', 'Name', 'City')
      .from('road_school')
      .orderBy('id', 'asc')
      .then(data => {
        return data;
      })
    );
  }

  getAdministratorsSchool(schoolId) {
    return Promise.resolve(knex(this.options)
      .select('vk_id')
      .from('administrators')
      .where({school_id: schoolId})
      .then(data => {
        return data;
      })
    );
  }

}

const myConnector = new Connector();
myConnector.options = config.getValue('db');

module.exports = myConnector;