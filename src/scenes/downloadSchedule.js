const Scene = require('node-vk-bot-api/lib/scene');
const https = require('https');
const path = require('path');
const fs = require('fs');
const Excel = require('exceljs/modern.browser');
const db = require('../database/dbConnector');
const {
  LOAD_FILE,
  BLANK_SCHEDULE,
  FILE_ACCESS,
  LIST_GROUP
} = require('../constants/constants');
const locationFile = path.join(__dirname,'../../files/');

const downloadSchedule = new Scene('downloadSchedule',
  (ctx) => {  // 0
    ctx.scene.next();
    ctx.reply(`${LOAD_FILE}\n\n${BLANK_SCHEDULE}`);

    db.getGroupIds(ctx.message.from_id)
      .then(dt=> {
        ctx.reply(`${LIST_GROUP}\n${dt.map((val, index) => {
          return `${index + 1}). ${val.Name} = ${val.id}`
        }).join('\n')}`);
      })

  },
  (ctx) => {  //
    ctx.scene.leave();
    const { doc } = ctx.message.attachments[0];
    const { title, url} = doc;
    download(url, locationFile+title, ctx.message.from_id);
    ctx.reply(FILE_ACCESS);
  }
);

function download(url, dest, from_id,cb) {
  let file = fs.createWriteStream(dest);
  const request = https.get(url, function (res) {
    const { statusCode, headers } = res;
    if(statusCode === 302) {
      const { location } = headers;
      const request2 = https.get(location, function (res2) {
        res2.pipe(file);
        file.on('finish', function () {
          file.close(cb);
          loadDataFromFile(dest, from_id);
        });
    });
    } else {
      console.log(statusCode);
      console.log(headers);
    }
  });
}

function loadDataFromFile(file, vk_id) {
  const workbook = new Excel.Workbook();

  workbook.xlsx.readFile(file)
    .then(function () {
      let instructors = [];
      let students = [];
      let resultGroup = [];
      let resultStudent = [];


      workbook.eachSheet((worksheet, sheetId) => {
        let col1 = worksheet.getColumn(3);
        let col2 = worksheet.getColumn(4);
        let groups = [];
        let studies = [];

        col1.eachCell((cell, rn) => {
          let res = {
            group_id: null,
            instructor_id: null,
            date: null
          };
          if (rn != 1) {
            if (cell.value) {
              let row = worksheet.getRow(rn);
              let d1 = null;
              let d2 = null;

              row.eachCell((cell, cn) => {
                if (cell.value) {
                  if (cn == 1) {
                    d1 = new Date(Date.parse(cell.value));
                  } else if (cn == 2) {
                    const d = new Date(new Date(Date.parse(cell.value)).toUTCString());

                    d2 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(),
                      d.getUTCHours(), d.getUTCMinutes(), 0, 0);
                    res.date = new Date(d2.toLocaleString());
                  } else if (cn == 3) {
                    res.group_id = cell.value;
                  } else if (cn == 5) {
                    res.instructor_id = cell.value;
                  }
                }
              });
              groups.push(res);
            }
          }
        });

        col2.eachCell((cell, rn) => {
          let res = {
            student_id: null,
            instructor_id: null,
            date: null
          };
          if (rn != 1) {
            if (cell.value) {
              let row = worksheet.getRow(rn);
              let d1 = null;
              let d2 = null;

              row.eachCell((cell, cn) => {
                if (cell.value) {
                  if (cn == 1) {
                    d1 = new Date(Date.parse(cell.value));
                  } else if (cn == 2) {
                    const d = new Date(new Date(Date.parse(cell.value)).toUTCString());

                    d2 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(),
                      d.getUTCHours(), d.getUTCMinutes(), 0, 0);
                    res.date = new Date(d2.toLocaleString());
                  } else if (cn == 4) {
                    res.student_id = cell.value;
                  } else if (cn == 5) {
                    res.instructor_id = cell.value;
                  }
                }
              });
              studies.push(res);
            }
          }
        });

        let instructorWS = groups.map((elem) => {
          return elem.instructor_id;
        });
        instructorWS = instructorWS.concat(studies.map((el) => {
          return el.instructor_id;
        }));
        instructorWS = instructorWS.filter((el, pos) => {
          return instructorWS.indexOf(el) == pos;
        });

        let studentWS = studies.map((elem) => {
          return elem.student_id;
        });
        studentWS = studentWS.filter((el, pos) => {
          return studentWS.indexOf(el) == pos;
        });

        instructors = instructors.concat(instructorWS);
        students = students.concat(studentWS);

        resultGroup = resultGroup.concat(groups);
        resultStudent = resultStudent.concat(studies);

      });

      db.getInstructorsIdFromNames(vk_id,instructors)
        .then(dt => {
          for (let i = 0, len = resultGroup.length; i < len; i++) {
            for (let j = 0, len = dt.length; j < len; j++) {
              if (resultGroup[i].instructor_id === dt[j].Name) {
                resultGroup[i].instructor_id = dt[j].id;
                break;
              }
            }
          }
          for (let i = 0, len = resultStudent.length; i < len; i++) {
            for (let j = 0, len = dt.length; j < len; j++) {
              if (resultStudent[i].instructor_id === dt[j].Name) {
                resultStudent[i].instructor_id = dt[j].id;
                break;
              }
            }
          }
          db.insertScheduleGroup(resultGroup)
            .then()
            .catch(er => console.log(er));
        })
        .then(() => {
          db.getStudentsIdFromNames(vk_id,students)
            .then(dt => {
              for (let i = 0, len = resultStudent.length; i < len; i++) {
                for (let j = 0, len = dt.length; j < len; j++) {
                  if (resultStudent[i].student_id === dt[j].Name) {
                    resultStudent[i].student_id = dt[j].id;
                    break;
                  }
                }
              }
              db.insertScheduleStudent(resultStudent)
                .then(dt => {
                  fs.unlinkSync(file);
                })
                .catch(er => console.log(er));
            })
        })
        .catch(er => console.log(er));
    });   
}

module.exports = downloadSchedule;