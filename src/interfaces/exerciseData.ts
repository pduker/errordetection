

class ExerciseData {
    score: string
    correctAnswers: {[index: number]: {[label: string]: number}}
    feedback: string
    constructor(score:string,correctAnswers:{},feedback:string){
        this.score = score;
        this.correctAnswers = correctAnswers;
        this.feedback = feedback;
    }
}

export default ExerciseData;