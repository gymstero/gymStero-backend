class User {
  constructor(id, email, password = '', photoURL = '') {
    this.id = id;
    this.email = email;
    this.password = password;
    this.photoURL = photoURL;
  }
}

module.exports.User = User;
