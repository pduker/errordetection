

class ExerciseData {
    score: string
    correctAnswer: string
    feedback: string
    constructor(score:string,correctAnswer:string,feedback:string){
        this.score = score;
        this.correctAnswer = correctAnswer;
        this.feedback = feedback;
    }
}

export default ExerciseData;