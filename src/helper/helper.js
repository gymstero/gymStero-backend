const { Day } = require('../model/Workout');

const getSchedule = (startDate, endDate, daysInWeek) => {
  let datesArray = [];
  let days = [];

  for (const day of daysInWeek) {
    days.push(dayToInt(day));
  }

  for (
    let date = new Date(startDate);
    date <= new Date(endDate);
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
