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

const exerciseGoalConverter = {
  toFirestore: (exerciseGoal) => {
    return {
      exerciseId: exerciseGoal.exerciseId,
      targetSets: exerciseGoal.targetSets,
      targetReps: exerciseGoal.targetReps,
      targetWeight: exerciseGoal.targetWeight,
      estimatedTime: exerciseGoal.estimatedTime,
      comment: exerciseGoal.comment,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new ExerciseGoal(
      data.exerciseId,
      data.targetSets,
      data.targetReps,
      data.targetWeight,
      data.estimatedTime,
      data.comment
    );
  },
};

module.exports = { ExerciseGoal, exerciseGoalConverter };
