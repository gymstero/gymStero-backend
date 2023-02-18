class Workout {
  constructor(title, exerciseGoals) {
    this.title = title;
    this.exerciseGoals = exerciseGoals;
    this.startDate = 'today';
    this.endDate = 'tomorrow';
    this.routine = 'once';
    this.daysWhenWeekly = [];
    this.reminder = '10 mins before';
    this.createdAt = new Date().toISOString();
  }
}

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

module.exports = { Workout, Routine, Reminder, Day };
