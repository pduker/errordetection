

class ExerciseData {
    score: string
    correctAnswers: {}
    feedback: string
    constructor(score:string,correctAnswers:{},feedback:string){
        this.score = score;
        this.correctAnswers = correctAnswers;
        this.feedback = feedback;
    }
}

export default ExerciseData;