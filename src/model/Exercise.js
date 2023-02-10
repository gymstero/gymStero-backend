class Exercise {
  constructor(title, description, instructions, muscleGroup, exerciseType) {
    this.title = title;
    this.description = description;
    this.instructions = instructions;
    this.muscleGroup = muscleGroup;
    this.exerciseType = exerciseType;
  }
}

module.exports.Exercise = Exercise;
