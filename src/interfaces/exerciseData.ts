

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
    transpos: boolean
    constructor(score:string,sound:File | undefined,correctAnswers:{[label: string]: (number | string)}[],feedback:string,exIndex:number, empty: boolean,title: string,difficulty: number, voices: number, tags: string[], types: string, meter: string, transpos: boolean){
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
        this.transpos = transpos;
    }
    
}


export default ExerciseData;