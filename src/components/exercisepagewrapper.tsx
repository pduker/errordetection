import { useSearchParams } from 'react-router-dom';
import ExerciseData from '../interfaces/exerciseData';
import { ExercisesPage } from './exercisespage';

type ExercisesWrapperProps = {
  allExData: (ExerciseData | undefined)[];
  setAllExData: React.Dispatch<React.SetStateAction<(ExerciseData | undefined)[]>>;
  scoresRet: boolean;
};

export function ExercisesPageWrapper({ allExData, setAllExData, scoresRet }: ExercisesWrapperProps) {
  const [searchParams] = useSearchParams();

  // Get all filters from the URL
  const difficulty = searchParams.get('difficulty');
  const voices = searchParams.get('voices');
  const tags = searchParams.get('tags');
  const meter = searchParams.get('meter');
  const transpos = searchParams.get('transpos');

  //Filter the data based on 
  const filteredData = allExData.filter((ex) => {
    if (!ex) return false;

    let matches = true;
    if (difficulty && ex.difficulty.toString() !== difficulty) matches = false;
    if (voices && ex.voices.toString() !== voices) matches = false;
    if (tags && !ex.tags.includes(tags)) matches = false;
    if (meter && ex.meter !== meter) matches = false;
    if (transpos && ex.transpos.toString() !== transpos) matches = false;

    return matches;
  });

  return (
    <ExercisesPage
      allExData={filteredData}
      setAllExData={setAllExData}
      defaultTags={[]}
      scoresRet={scoresRet}
    />
  );
}