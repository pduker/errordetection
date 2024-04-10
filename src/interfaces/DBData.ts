import ExerciseData from "./exerciseData"

class DBData {
    score: string
    sound: string
    correctAnswers: {[label: string]: (number | string)}[]
    feedback: string
    exIndex: number
    empty: boolean
    title: string
    difficulty: number
    tags: string[]
    constructor(data:ExerciseData | undefined,sound:string){
        if(data !== undefined){
            this.score = data.score;
            this.sound = sound;
            this.correctAnswers = data.correctAnswers;
            this.feedback = data.feedback;
            this.exIndex = data.exIndex;
            this.empty = data.empty;
            this.title = data.title;
            this.difficulty = data.difficulty;
            this.tags = data.tags;
        }
        else{
            this.score = "";
            this.sound = sound;
            this.correctAnswers = [{"e":""}];
            this.feedback = "";
            this.exIndex = -1;
            this.empty = true;
            this.title = "";
            this.difficulty = -1;
            this.tags = [""];
        }
    }
    
}

export default DBData;