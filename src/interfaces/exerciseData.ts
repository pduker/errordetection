

class ExerciseData {
    score: string
    sound: File | undefined
    correctAnswers: {[label: string]: (number | string)}[]
    feedback: string
    exIndex: number
    empty: boolean
    title: string
    difficulty: number
    voices: number
    tags: string[]
    types: string
    meter: string
    constructor(score:string,sound:File | undefined,correctAnswers:{[label: string]: (number | string)}[],feedback:string,exIndex:number, empty: boolean,title: string,difficulty: number, voices: number, tags: string[], types: string, meter: string){
        this.score = score;
        this.sound = sound;
        this.correctAnswers = correctAnswers;
        this.feedback = feedback;
        this.exIndex = exIndex;
        this.empty = empty;
        this.title = title;
        this.difficulty = difficulty;
        this.voices = voices;
        this.tags = tags;
        this.types = types;
        this.meter = meter;
    }
    
}


export default ExerciseData;