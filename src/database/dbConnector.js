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

  getTeachersNoVerified() {
    return Promise.resolve(knex(this.options)('instructors')
      .select(
        knex.raw('"id",register_date"')
      )
      .whereRaw('"instructors"."verified" = ?', false)
      .then(data => {
        return data;
      })
    );
  }

  getAdministratorsNoVerified() {
    return Promise.resolve(knex(this.options)('administrators')
      .select(
        knex.raw('"id",register_date"')
      )
      .whereRaw('"administrators"."verified" = ?', false)
      .then(data => {
        return data;
      })
    );
  }

  getStudentsNoVerified() {
    return Promise.resolve(knex(this.options)('students')
      .select(
        knex.raw('"id","register_date"')
      )
      .whereRaw('"students"."verified" = ?', false)
      .then(data => {
        return data;
      })
    );
  }

  getNotificationFromTableByVkId(tableName, id) {
    return Promise.resolve(knex(this.options)(tableName)
    .select(knex.raw('"notification"'))
    .whereRaw(`"${tableName}"."vk_id" = ?`, id)
    .then(data => {
      return data;
    })
    .catch(err=>{
      return err;
    })
  );
  }

  getSchedule() {

  }

  getScheduleGroup() {
    
  }

  getInstructorsIdFromNames(array) {
    return Promise.resolve(knex(this.options)('instructors')
      .select('id', 'Name')
      .whereIn('Name', array)
      .then(data => {
        return data;
      })
      .catch(err => {
        return err;
      })
    );
  }

  getStudentsIdFromNames(array) {
    return Promise.resolve(knex(this.options)('students')
      .select('id', 'Name')
      .whereIn('Name', array)
      .then(data => {
        return data;
      })
      .catch(err => {
        return err;
      })
    );
  }

  deleteAdminById(id) {
    return Promise.resolve(knex(this.options)('administrators')
      .select(knex.raw('"id"'))
      .whereRaw('"administrators"."id" = ?', id)
      .del()
      .then(data => {
        return {data: data, success: true};
      })
      .catch(err=>{
        return {data: err, success: false};
      })
    );
  }

  deleteTeacherById(id) {
    return Promise.resolve(knex(this.options)('instructors')
      .select(knex.raw('"id"'))
      .whereRaw('"instructors"."id" = ?', id)
      .del()
      .then(data => {
        return {data: data, success: true};
      })
      .catch(err=>{
        return {data: err, success: false};
      })
    );
  }

  deleteStudentById(id) {
    return Promise.resolve(knex(this.options)('students')
      .select(knex.raw('"id"'))
      .whereRaw('"students"."id" = ?', id)
      .del()
      .then(data => {
        return {data: data, success: true};
      })
      .catch(err=>{
        return {data: err, success: false};
      })
    );
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

  registerAdministrator(object) {
    return Promise.resolve(knex(this.options)('administrators')
      .insert(object));
  }

  registerSchool(object) {
    return Promise.resolve(knex(this.options)('road_school')
      .returning('id')
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

  updateAdministrator(id, data) {
    return Promise.resolve(knex(this.options)('administrators')
      .whereRaw('"administrators"."vk_id" = ?', id)
      .update(data)
      .then(dt => {
        return dt;
      })
    );
  }

  updateNotificationTableByVkId(tableName, id, notify) {
    return Promise.resolve(knex(this.options)(tableName)
      .whereRaw(`"${tableName}"."vk_id" = ?`, id)
      .update({ notification: notify})
      .then(dt => {
        return dt;
      })
    );
  }

  insertScheduleGroup(array) {
    return Promise.resolve(knex(this.options)('schedule_group')
      .returning('id')
      .insert(array));
  }

  insertScheduleStudent(array) {
    return Promise.resolve(knex(this.options)('schedule')
      .returning('id')
      .insert(array));
  }

}

const myConnector = new Connector();
myConnector.options = config.getValue('db');

module.exports = myConnector;