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
      .select('id', 'Name')
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
      .where({ school_id: schoolId })
      .then(data => {
        return data;
      })
    );
  }

  getTeachersSchool(groupId) {
    return Promise.resolve(knex(this.options)('instructors')
      .select(
        knex.raw('"vk_id"')
      )
      .joinRaw('JOIN "group_instructors" ON "group_instructors"."instructor_id" = "instructors"."id"')
      .joinRaw('JOIN "groups" ON "groups"."id" = "group_instructors"."group_id"')
      .whereRaw('"instructors"."verified" = ? AND "instructors"."role_id" = ? AND "group_instructors"."group_id" = ?', [true, 1, groupId])
      .then(data => {
        return data;
      })
    );

  }

  /*
getHouse(houseId) {
    return Promise.resolve(knex(this.options)('houses')
      .select(
        knex.raw('"houses"."id", \
        "name", \
        "address", \
        "water_meter_type", \
        "electricity_meter_type", \
        "water_meter_types"."description" as "water_meter_description", \
        "electricity_meter_types"."description" as "electricity_meter_description", \
        "agreement_date", \
        "notify_date" as "notify_date", \
        "notify_enabled"'
        )
      )
      .joinRaw('JOIN "water_meter_types" ON "water_meter_types"."id" = "houses".water_meter_type')
      .joinRaw('JOIN "electricity_meter_types" ON "electricity_meter_types".id = "houses".electricity_meter_type')
      .whereRaw('"houses"."id" = ?', houseId)
      .then(data => {
        return data;
      })
    );
  }
  */

  getGroupId(groupName) {

  }

  getRoles() {
    return Promise.resolve(knex(this.options)
      .select('id', 'Name')
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
      .insert({
        vk_id: object.vk_id,
        register_date: object.register_date,
        verified: object.verified,
        notification: object.notification
      }))
      .then(dt => {
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