const Routine = {
  Daily: 'Every Day',
  Weekly: 'Every Week',
  Weekdays: 'Weekdays Only',
  Weekend: 'Weekend Only',
};

const Reminder = {
  Morning: '9am on the day',
  Noon: '12pm on the day',
  Evening: '6pm of the day',
  //Custom: '',
};

const Day = {
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
  Sunday: 'Sunday',
};

class Workout {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.exerciseGoals = [];
    this.startDate;
    this.endDate;
    this.routine;
    this.daysWhenWeekly = [];
    this.reminder;
  }
}

module.exports.Workout = Workout;

module.exports = { Routine, Reminder, Day };
