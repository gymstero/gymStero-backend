class Exercise {
  constructor(id, title, description, instructions, muscleGroup, exerciseType) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.instructions = instructions;
    this.muscleGroup = muscleGroup;
    this.exerciseType = exerciseType;
  }
}

module.exports.Exercise = Exercise;
