class User {
  constructor(o) {
    this.balance = o.balance
    this.defaultSchedule = o.defaultSchedule
    this.email = o.email
    this.employment = o.employment
    this.enable = o.enable
    this.name = o.name
    this.order = o.order
    this.privilege = o.privilege
    this.rank = o.rank
    this.uid = o.uid
  }

  isValidEmployment() {
    if (!this.enable) return false
    if (!this.employment) return false
    if (!this.employment[this.employment.length-1].dateOfExit) return true
    
    return this.employment[this.employment.length-1].dateOfExit.toDate() > new Date()
  }
}

module.exports = {
  User: User
}