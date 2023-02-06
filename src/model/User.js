class User {
  constructor(id, email, password = '', photoURL = '') {
    this.id = id;
    this.email = email;
    this.password = password;
    this.photoURL = photoURL;
    this.username = email.split('@')[0];
    this.description = '';
    this.publicUser = false;
    this.numOfFollowers = 0;
    this.workouts = [];
  }
}

module.exports.User = User;