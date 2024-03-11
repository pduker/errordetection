

class ExerciseData {
    score: string
    correctAnswers: {[index: number]: {[label: string]: number}}
    feedback: string
    exIndex: number
    constructor(score:string,correctAnswers:{},feedback:string,exIndex:number){
        this.score = score;
        this.correctAnswers = correctAnswers;
        this.feedback = feedback;
        this.exIndex = exIndex;
    }
}

export default ExerciseData;