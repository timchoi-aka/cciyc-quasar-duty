/*
export function someGetter (state) {
}
*/
 export function getUsername(state) {
   return state.userProfile.name;
 }

 export function getPhotoURL(state) {
   return state.auth.photoURL;
 }

 export function getUID(state) {
   return state.userProfile.uid;
 }

export function getSystemAdmin(state) {
  return state.userProfile.privilege.systemAdmin;
}

export function getScheduleModify(state) {
  return state.userProfile.privilege.scheduleModify;
}

export function getCenterIC(state) {
  return state.userProfile.privilege.centeric;
}

export function getDefaultSchedule(state) {
  return state.userProfile.defaultSchedule
}
