const { Routine, Day } = require('../model/Workout');

const getSchedule = (workoutData) => {
  let datesArray = [];
  let days = [];

  switch (workoutData.routine) {
    case Routine.Daily:
      days = [0, 1, 2, 3, 4, 5, 6];
      break;
    case Routine.Weekly:
      for (const day of workoutData.daysWhenWeekly) {
        days.push(dayToInt(day));
      }
      break;
    case Routine.Weekdays:
      days = [1, 2, 3, 4, 5];
      break;
    case Routine.Weekend:
      days = [0, 6];
      break;
    default:
      throw new Error('Invalid Routine info');
  }

  for (
    let date = new Date(workoutData.startDate);
    date <= new Date(workoutData.endDate);
    date.setDate(date.getDate() + 1)
  ) {
    if (days.includes(date.getDay())) {
      datesArray.push(new Date(date).toISOString());
    }
  }
  return datesArray;
};

const dayToInt = (day) => {
  let dayToInt;

  switch (day) {
    case Day.Sunday:
      dayToInt = 0;
      break;
    case Day.Monday:
      dayToInt = 1;
      break;
    case Day.Tuesday:
      dayToInt = 2;
      break;
    case Day.Wednesday:
      dayToInt = 3;
      break;
    case Day.Thursday:
      dayToInt = 4;
      break;
    case Day.Friday:
      dayToInt = 5;
      break;
    case Day.Saturday:
      dayToInt = 6;
      break;
  }
  return dayToInt;
};

module.exports = { getSchedule };
