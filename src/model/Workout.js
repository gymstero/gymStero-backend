class Workout {
  constructor(id) {
    this.id = id;
    this.exercises = [];
    this.routine = '';
    this.startDate = '';
    this.endDate = '';
    this.reminder = '';
  }
}

module.exports.Workout = Workout;
