

class ExerciseData {
    score: string
    correctAnswers: {[label: string]: (number | string)}[]
    feedback: string
    exIndex: number
    empty: boolean
    title: string
    difficulty: number
    tags: string[]
    constructor(score:string,correctAnswers:{[label: string]: (number | string)}[],feedback:string,exIndex:number, empty: boolean,title: string,difficulty: number, tags: string[]){
        this.score = score;
        this.correctAnswers = correctAnswers;
        this.feedback = feedback;
        this.exIndex = exIndex;
        this.empty = empty;
        this.title = title;
        this.difficulty = difficulty;
        this.tags = tags;
    }
}

export default ExerciseData;