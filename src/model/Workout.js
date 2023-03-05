class Workout {
  constructor(title, exerciseGoals) {
    this.title = title;
    this.exerciseGoals = exerciseGoals;
    this.startDate;
    this.endDate;
    this.daysWhenWeekly = [];
    this.reminder;
    this.createdAt = new Date().toISOString();
    this.schedule = [];
    this.totalWorkoutTime = 0;
  }
}

const Reminder = {
  Morning: '9am on the day',
  Noon: '12pm on the day',
  Evening: '6pm of the day',
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

module.exports = { Workout, Reminder, Day };
