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

  getListGroupsFromSchool(schoolId) {
    return Promise.resolve(knex(this.options)
      .select('id','Name')
      .from('groups')
      .whereRaw('"school_id" = ?', schoolId)
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

  getGroupId(groupName) {

  }

  getRoles() {
    return Promise.resolve(knex(this.options)
    .select('id','Name')
    .from('roles')
    .then(data => {
      return data;
    })
  );
  }

  addAdministratorSchool(schoolId) {
    
  }

  registerTeacherSchool(object) {
    return Promise.resolve(knex(this.options)('instructors')
      .returning('id')
      .insert({ vk_id: object.vk_id}))
      .then(dt=> {
          return Promise.resolve(knex(this.options)('group_instructors')
            .insert({
              group_id: object.group_id,
              instructor_id: dt[0]
            }));
      });
  }

  registerStudentSchool(object) {
    return Promise.resolve(knex(this.options)('students')
      .insert(object));
  }

  updateTeacherSchool(id, data) {
    return Promise.resolve(knex(this.options)('instructors')
      .whereRaw('"instructors"."vk_id" = ?', id)
      .update(data)
      .then(dt => {
        return dt;
      })
    );
  }

  updateStudentSchool(id, data) {
    return Promise.resolve(knex(this.options)('students')
      .whereRaw('"students"."vk_id" = ?', id)
      .update(data)
      .then(dt => {
        return dt;
      })
    );
  }
}

const myConnector = new Connector();
myConnector.options = config.getValue('db');

module.exports = myConnector;