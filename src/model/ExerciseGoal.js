class ExerciseGoal {
  constructor(exerciseId, targetSets, targetReps, targetWeight, estimatedTime, comment) {
    this.exerciseId = exerciseId;
    this.targetSets = targetSets;
    this.targetReps = targetReps;
    this.targetWeight = targetWeight;
    this.estimatedTime = estimatedTime;
    this.comment = comment;
  }
}

module.exports.ExerciseGoal = ExerciseGoal;
