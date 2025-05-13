//exercise data structre
class ExerciseData {
    //exercise attribute
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
    isNew?: boolean //check for cancel button
    customId?: string //custom ID number for exercise
    //exercise constructor for defining exercise
    constructor(score:string,sound:File | undefined,correctAnswers:{[label: string]: (number | string)}[],feedback:string,exIndex:number, empty: boolean,title: string,difficulty: number, voices: number, tags: string[], types: string, meter: string, transpos: boolean, isNew?: boolean, customId?: string){
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
        this.isNew = this.isNew;
        this.customId = customId;
    }
    
}


export default ExerciseData;