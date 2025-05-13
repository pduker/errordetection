import ExerciseData from "./exerciseData"

//data base structuring
//putting exercises into database
class DBData {
    //eercise attributes
    score: string
    sound: string
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
    customId?: string
    constructor(data:ExerciseData | undefined,sound:string){
        //define variables
        if(data !== undefined){
            this.score = data.score;
            this.sound = sound;
            this.correctAnswers = data.correctAnswers;
            this.feedback = data.feedback;
            this.exIndex = data.exIndex;
            this.empty = data.empty;
            this.title = data.title;
            this.difficulty = data.difficulty;
            this.voices = data.voices;
            this.tags = data.tags;
            this.types = data.types;
            this.meter = data.meter;
            this.transpos = data.transpos;
            this.customId = data.customId;
        }
        //set to empty otherwise
        else{
            this.score = "";
            this.sound = sound;
            this.correctAnswers = [{"e":""}];
            this.feedback = "";
            this.exIndex = -1;
            this.empty = true;
            this.title = "";
            this.difficulty = -1;
            this.voices = -1;
            this.tags = [""];
            this.types = "None";
            this.meter = "Anything";
            this.transpos = false;
            this.customId = "";
        }
    }
    
}

export default DBData;