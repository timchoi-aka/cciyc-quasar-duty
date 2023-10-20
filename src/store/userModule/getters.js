/*
export function someGetter (state) {
}
*/
export function getModule(state) {
  return state.module;
}

export function getUserProfile(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile;
  } else return null;
}

 export function getUsername(state) {
  if (Object.keys(state.userProfile).length) {
   return state.userProfile.name;
  } else {
    return null;
  }
 }

 export function getEmployment(state) {
  if (Object.keys(state.userProfile).length) {
   return state.userProfile.employment;
  } else {
    return null;
  }
 }

 export function getPhotoURL(state) {
  if (Object.keys(state.userProfile).length) {
   return state.auth.photoURL;
  } else {
    return null;
  }
 }

 export function getUserManagement(state) {
  if (Object.keys(state.userProfile).length) {
   return state.userProfile.privilege.userManagement;
  } else {
    return null;
  }
 }

 export function getDateOfExit(state) {
  if (Object.keys(state.userProfile).length && state.userProfile.dateOfExit != undefined) {
   return state.userProfile.dateOfExit;
  } else {
    return null;
  }
 }

 export function getRank(state) {
  if (Object.keys(state.userProfile).length) {
   return state.userProfile.rank;
  } else {
    return null;
  }
 }

 export function getDateOfEntry(state) {
  if (Object.keys(state.userProfile).length) {
   return state.userProfile.dateOfEntry;
  } else {
    return null;
  }
 }

 export function getUID(state) {
  if (Object.keys(state.userProfile).length) {
   return state.userProfile.uid;
  } else {
    return null;
  }
 }

export function getFinance(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.finance;
   } else {
     return null;
   }
}

export function getSystemAdmin(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.systemAdmin;
  } else {
    return null;
  }
}

export function getScheduleModify(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.scheduleModify;
  } else {
    return null;
  }
}

export function getCenterIC(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.centeric;
  } else {
    return null;
  }
}

export function getHealthApprove(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.healthapprove;
  } else {
    return null;
  }
}

// 過期仍可輸入/修改活動報Stat權限
export function getEventManagement(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.eventManagement;
  } else {
    return null;
  }
}

// 審批活動計劃檢討
export function getEventApprove(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.eventApprove;
  } else {
    return null;
  }
}

export function getDefaultSchedule(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.defaultSchedule
  } else {
    return null;
  }
}

export function getLeaveManage(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.leaveManage
  } else {
    return null;
  }
}

export function getLeaveApprove(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.leaveApprove
  } else {
    return null;
  }
}

export function getTmp(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.tmp
  } else {
    return null;
  }
}

export function getALBalance(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.balance.al
  } else {
    return null;
  }
}

export function getOTBalance(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.balance.ot
  } else {
    return null;
  }
}

export function getSALBalance(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.balance.sal
  } else {
    return null;
  }
}

export function getSAL(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.sal
  } else {
    return null;
  }
}

export function getUAT(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.uat
  } else {
    return null;
  }
}

export function getProbation(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.privilege.probation? true: false
  } else {
    return null;
  }
}

export function getHasuraClaim(state) {
  if (Object.keys(state.userProfile).length) {
    return state.userProfile.customClaims;
  } else {
    return null;
  }
}

export function isLogin(state) {
  if (Object.keys(state.userProfile).length) {
   return true;
  } else {
    return false;
  }
 }

