

class ExerciseData {
    score: string
    correctAnswers: {[label: string]: (number | string)}[]
    feedback: string
    exIndex: number
    empty: boolean
    constructor(score:string,correctAnswers:{[label: string]: (number | string)}[],feedback:string,exIndex:number, empty: boolean){
        this.score = score;
        this.correctAnswers = correctAnswers;
        this.feedback = feedback;
        this.exIndex = exIndex;
        this.empty = empty;
    }
}

export default ExerciseData;