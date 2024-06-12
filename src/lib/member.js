import { is, uid } from "quasar";

/* perform check on member record
 * member: member record
 * return: {status: 0, message: ""}
 * status: empty - valid, 1 - warning, 2 - critical error
 * message: warning or error message
 * */
function checkMemberRecord(member) {
  let status = [];
  let message = [];
  if (member.c_name && /[a-zA-Z0-9]+/.test(member.c_name)) {
    status.push(1);
    message.push("中文名字含有英文字符！");
  }
  if (member.c_name_other && /[\u3400-\u9FBF]+/.test(member.c_name_other)) {
    status.push(1);
    message.push("英文名字含有中文字符！");
  }
  return { status: status, message: message };
}

function extractRelationChange(originalRelation, updatedRelation) {
  let deleteRelation = [];
  let changeRelation = [];
  let newRelation = [];
  let valid = true;
  if (updatedRelation.length > 0) {
    for (const key in updatedRelation) {
      if (updatedRelation[key].uuid) {
        // existing record
        if (
          updatedRelation[key].delete ||
          updatedRelation[key].name == "無此人"
        ) {
          // delete it
          deleteRelation.push(updatedRelation[key].uuid);
        } else {
          // modify it
          let i = updatedRelation.findIndex(
            (element) => element.uuid == updatedRelation[key].uuid
          );
          if (!is.deepEqual(originalRelation[i], updatedRelation[key])) {
            // change detected
            changeRelation.push({
              uuid: updatedRelation[key].uuid,
              c_mem_id_1: updatedRelation[key].c_mem_id_1,
              c_mem_id_2: updatedRelation[key].c_mem_id_2,
              relation: updatedRelation[key].relation,
              d_effective: updatedRelation[key].d_effective,
            });
          }
        }
      } else {
        // add new record
        if (
          !updatedRelation[key].delete &&
          updatedRelation[key].name != "無此人"
        ) {
          // new record but deleted or invalid member number, no action
          if (updatedRelation[key].relation) {
            newRelation.push({
              uuid: uid(),
              c_mem_id_1: updatedRelation[key].c_mem_id_1,
              c_mem_id_2: updatedRelation[key].c_mem_id_2,
              relation: updatedRelation[key].relation,
              d_effective: updatedRelation[key].d_effective,
            });
          } else {
            valid = false;
          }
        }
      }
    }
  }
  return {
    valid: valid,
    deleteRelation: deleteRelation,
    changeRelation: changeRelation,
    newRelation: newRelation,
  };
}

export { extractRelationChange, checkMemberRecord };
