class Workout {
  constructor(title, exerciseGoals) {
    this.title = title;
    this.exerciseGoals = exerciseGoals;
    this.startDate = '';
    this.endDate = '';
    this.daysInWeek = [];
    this.reminder = '';
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

const workoutConverter = {
  toFirestore: (workout) => {
    return {
      title: workout.title,
      exerciseGoals: workout.exerciseGoals,
      startDate: workout.startDate,
      endDate: workout.endDate,
      daysInWeek: workout.daysInWeek,
      reminder: workout.reminder,
      createdAt: workout.createdAt,
      schedule: workout.schedule,
      totalWorkoutTime: workout.totalWorkoutTime,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Workout(
      data.title,
      data.exerciseGoals,
      data.startDate,
      data.endDate,
      data.daysInWeek,
      data.reminder,
      data.createdAt,
      data.schedule,
      data.totalWorkoutTime
    );
  },
};

module.exports = { Workout, workoutConverter, Reminder, Day };
