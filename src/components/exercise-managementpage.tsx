import "../styles/exercises/index.css";
import "../styles/logout-modal.css";
import "../styles/exercises/pagination.css";
import { Button } from "react-bootstrap";
import ExerciseData from "../interfaces/exerciseData";
import { LogoutModal } from "./modals/LogoutModal";
import { DeleteConfirmationModal } from "./modals/DeleteConfirmationModal";
import { SuccessBanner } from "./modals/SuccessBanner";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { get, getDatabase, ref, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { exerciseConfig } from "../config/exercise-config";
import abcjs from "abcjs";
import { signOut } from 'firebase/auth';
import { auth } from '../services/database';

import "../styles/exercises/exercise-management.css";

function ScorePreview({ abcNotation }: { abcNotation: string }) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abcNotation && previewRef.current) {
      try {
        // Remove title line from ABC notation to hide it in the preview
        const abcWithoutTitle = abcNotation.split('\n').filter(line => !line.startsWith('T:')).join('\n');
        abcjs.renderAbc(previewRef.current, abcWithoutTitle, {
          responsive: "resize",
          lineThickness: 0.4,
          add_classes: true,
          staffwidth: 800,
          wrap: {
            minSpacing: 1.0,
            maxSpacing: 2.5,
            preferredMeasuresPerLine: 4
          }
        });
      } catch (error) {
        console.error('Error rendering ABC notation:', error);
      }
    }
  }, [abcNotation]);

  return (
    <div className="score-preview-section">
      <div className="score-preview-container">
        <div 
          className="score-preview-content"
          style={{ position: 'relative', userSelect: 'none' }}
        >
          {abcNotation ? (
            <div 
              ref={previewRef}
              className="abc-score-display"
            />
          ) : (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#666',
              fontStyle: 'italic'
            }}>
              No score available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExerciseManagementListEntry({
  exercise,
  isSelected,
  handleSelectExercise,
  onEdit,
  isExpanded,
  onToggleExpand,
}: {
  exercise: ExerciseData | undefined;
  isSelected: boolean;
  handleSelectExercise: (exIndex: number) => void;
  onEdit: (exerciseId: string) => void;
  isExpanded: boolean;
  onToggleExpand: (exIndex: number) => void;
}) {
  if (!exercise) return <></>;

  const handleEditClick = () => {
    const exerciseId = exercise.customId || exercise.exIndex.toString();
    onEdit(exerciseId);
  };

  return (
    <div className="exercise-management-entry-wrapper">
      <div
        className={`exercise-list-item no-hover exercise-management-list-entry ${isSelected ? "active" : ""}`}
      >
        <div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectExercise(exercise.exIndex)}
          ></input>
          &nbsp;
        </div>
        <span>
          {exercise.title}{" "}
          <span className="custom-id">
            {exercise.customId ? `(ID: ${exercise.customId})` : ""}
          </span>
        </span>
        <div className="actions">
          <Button className="p-0" onClick={() => onToggleExpand(exercise.exIndex)}>👁️</Button>
          <Button className="p-0" onClick={handleEditClick}>✏️</Button>
        </div>
      </div>
      {exercise.score && (
        <div className={`exercise-score-preview ${isExpanded ? 'expanded' : ''}`}>
          <ScorePreview abcNotation={exercise.score} />
        </div>
      )}
    </div>
  );
}

//code for creating the exercise management page, seen by admin to work on updating exercises
//take in exercise data and return updated data, must be authorized users
export function ExerciseManagementPage({
  allExData,
  setAllExData,
  fetch,
  authorized,
  setAuthorized,
}: {
  allExData: (ExerciseData | undefined)[];
  setAllExData: (newData: (ExerciseData | undefined)[]) => void;
  fetch: (val: boolean) => void;
  authorized: boolean;
  setAuthorized: (authorized: boolean) => void;
}) {
  const navigate = useNavigate();

  // Modal state for logout confirmation
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Modal state for success message
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Logout function to end admin mode
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setAuthorized(false);
      localStorage.removeItem('adminAuthorized');
      localStorage.setItem('showLogoutSuccess', 'true');
      console.log("Logged out successfully");
      setShowLogoutModal(false);
      navigate("/exercises");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    handleMultipleExerciseDelete(selectedIndexes);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleEdit = (exerciseId: string) => {
    sessionStorage.setItem('managementPage', currentPage.toString());
    navigate(`/exercise-management/edit/${exerciseId}`);
  };

  //use states for getting and setting specific attributes of exercises and music
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<number[]>([]);

  /* const [mode, setMode] = useState<boolean>(false); */

  const [diff, setDiff] = useState<string>("All");
  const [types, setTypes] = useState<string>("None");
  const [meter, setMeter] = useState<string>("Anything");
  const [voices, setVoices] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [transpos, setTranspos] = useState<boolean>(false);

  const [exList, setExList] = useState<(ExerciseData | undefined)[]>([]);

  const [customId, setCustomId] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [exercisesPerPage] = useState<number>(10);

  // Set currentPage from sessionStorage on mount
  useEffect(() => {
    const savedPage = sessionStorage.getItem('managementPage');
    if (savedPage) {
      const pageNum = parseInt(savedPage, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
        sessionStorage.removeItem('managementPage');
      }
    }
  }, []);
  const exSortFunc = useCallback(function (
    e1: ExerciseData | undefined,
    e2: ExerciseData | undefined,
  ): number {
    if (e1 !== undefined && e2 !== undefined) {
      try {
        //sorts exercises alphabetically
        if (
          e1.title.startsWith("Exercise ") &&
          e2.title.startsWith("Exercise ")
        ) {
          if (e1.title > e2.title) return 1;
          else if (e1.title < e2.title) return -1;
          else return 0;
        } else if (e1.title.startsWith("Exercise ")) return -1;
        else if (e2.title.startsWith("Exercise ")) return 1;

        //compare number of tags, more tags come later (increasing order)
        // FIXED: Don't sort tags just to get length - that's very expensive!
        var e1Sorted = e1.tags.length;
        var e2Sorted = e2.tags.length;
        if (e1Sorted > e2Sorted) return 1;
        else if (e1Sorted < e2Sorted) return -1;
        else {
          if (Number(e1.difficulty) > Number(e2.difficulty)) return 1;
          else if (Number(e1.difficulty) < Number(e2.difficulty)) return -1;
          else {
            let e1Split = e1.title.split(":"),
              e2Split = e2.title.split(":");
            if (
              Number(e1Split[e1Split.length - 1]) >
              Number(e2Split[e2Split.length - 1])
            )
              return 1;
            else if (
              Number(e1Split[e1Split.length - 1]) <
              Number(e2Split[e2Split.length - 1])
            )
              return -1;
            else {
              //final comparison isf equal up to this point
              if (e1.title > e2.title) return 1;
              else if (e1.title < e2.title) return -1;
              else return 0;
            }
          }
        }
        //if an error occurs default to sorting alphabetically
      } catch {
        if (e1.title > e2.title) return 1;
        else if (e1.title < e2.title) return -1;
        else return 0;
      }
      //if undefined treat as equal
    } else return 0;
  }, []);

  /*
    // Fetch exercises when component mounts
    useEffect(() => {
        console.log("ExerciseManagementPage mounted, fetching exercises...");
        if (fetch) {
            fetch(false);
        }
    }, [fetch]);
    */

  // Update exList when allExData changes - optimized with useMemo
  const sortedExList = useMemo(() => {
    if (allExData.length > 0) {
      return [...allExData].sort(exSortFunc);
    }
    return [];
  }, [allExData, exSortFunc]);

  useEffect(() => {
    setExList(sortedExList);
  }, [sortedExList]);

  /* previously used when add/edit mode were separate, keeping for now for posterity
    const modeChange = function () {
        setMode(!mode);
        setDiff("All");
        setTypes("None");
        setMeter("Anything");
        setVoices(0);
        setTags([]);
        sortExercises(undefined,"");
    } */

  //main function
  useEffect(() => {
    //if no exercises
    if (exList.length === 0) {
      if (
        tags.length === 0 &&
        diff === "All" &&
        voices === 0 &&
        types === "None" &&
        meter === "Anything" &&
        !transpos
      )
        setExList(allExData.sort(exSortFunc));
    }
    //more exercises then all exercise data
    if (exList.length > allExData.length) setExList(allExData.sort(exSortFunc));
  }, [
    exList.length,
    allExData,
    tags.length,
    diff,
    voices,
    types,
    meter,
    transpos,
    exSortFunc,
  ]);

  // Additional effect to update exList when allExData changes
  useEffect(() => {
    if (
      tags.length === 0 &&
      diff === "All" &&
      voices === 0 &&
      types === "None" &&
      meter === "Anything" &&
      !transpos
    ) {
      setExList([...allExData].sort(exSortFunc));
    }
  }, [
    allExData,
    exSortFunc,
    tags.length,
    diff,
    voices,
    types,
    meter,
    transpos,
  ]);

  //function to sort exercises in the list
  const sortExercises = function (
    input: string | string[] | number | boolean | undefined,
    inputType: string,
  ) {
    var tempTags = tags,
      tempDiff = diff,
      tempVoices = voices,
      tempTypes = types,
      tempMeter = meter,
      tempTranspos = transpos;
    if (inputType === "tags") tempTags = input as string[];
    else if (inputType === "diff") tempDiff = input as string;
    else if (inputType === "voices") tempVoices = input as number;
    else if (inputType === "types") tempTypes = input as string;
    else if (inputType === "meter") tempMeter = input as string;
    else if (inputType === "transpos") tempTranspos = input as boolean;

    //filtering based on temp exercise parameters
    //copy of data to prevent messing with original data
    var list: (ExerciseData | undefined)[] = [...allExData];
    //filtering with exercise tags
    if (tempTags.length > 0) {
      list = list.filter(function (exercise) {
        if (
          exercise !== undefined &&
          tempTags !== undefined &&
          exercise.tags !== undefined
        ) {
          return tempTags.every((element) => exercise.tags.includes(element));
        } else return false;
      });
    }
    //filtering with exercise difficulty
    if (tempDiff !== "All") {
      list = list.filter(function (exercise) {
        if (exercise !== undefined)
          return tempDiff === String(exercise.difficulty);
        else return false;
      });
    }
    //filtering with exercise voices
    if (tempVoices !== 0) {
      list = list.filter(function (exercise) {
        if (exercise !== undefined) return tempVoices === exercise.voices;
        else return false;
      });
    }
    //filtering with exrcise types
    if (tempTypes !== "None") {
      list = list.filter(function (exercise) {
        if (exercise !== undefined) {
          return tempTypes === exercise.types;
        } else return false;
      });
    }
    //filtering with exercise meter
    if (tempMeter !== "Anything") {
      list = list.filter(function (exercise) {
        if (exercise !== undefined) return tempMeter === String(exercise.meter);
        else return false;
      });
    }
    //filtering with exercise transpositon, transposed instruments
    if (tempTranspos === true) {
      list = list.filter(function (exercise) {
        if (exercise !== undefined) return exercise.transpos === true;
        else return false;
      });
    }
    list = list.sort(exSortFunc);
    setExList(list);
  };

  //all the onClicks for when a sorting field changes
  //changing difficulty
  const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setDiff(e.target.value);
    sortExercises(e.target.value, "diff");
  };
  //changing tags
  const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;
    if (tags.includes(val)) {
      tags.splice(tags.indexOf(val), 1);
      setTags([...tags]);
      sortExercises([...tags], "tags");
    } else {
      setTags([...tags, val]);
      sortExercises([...tags, val], "tags");
    }
  };
  //changing voice
  const voiceChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setVoices(Number(e.target.value));
    sortExercises(Number(e.target.value), "voices");
  };
  //changing types
  const typesChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setTypes(e.target.value);
    sortExercises(e.target.value, "types");
  };
  //changing meter
  const meterChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
    setMeter(e.target.value);
    sortExercises(e.target.value, "meter");
  };
  //changing transposition, transposed instruments
  const transposChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    setTranspos(!transpos);
    sortExercises(!transpos, "transpos");
  };

  //onClick to reset all exercise sort fields
  const resetSort = function () {
    //reset tags to original state
    setTags([]);

    //reset difficulty to original state
    setDiff("All");
    var diffBox = document.getElementsByName(
      "difficulty",
    )[0] as HTMLSelectElement;
    if (diffBox !== null) diffBox.options[0].selected = true;

    //reset voices to original state
    setVoices(0);
    var voiceBox = document.getElementsByName("voices")[0] as HTMLSelectElement;
    if (voiceBox !== null) voiceBox.options[0].selected = true;

    //reset types to original state
    setTypes("None");
    var typesBox = document.getElementsByName("types")[0] as HTMLSelectElement;
    if (typesBox !== null) typesBox.options[0].selected = true;

    //reset meter to rginal state
    setMeter("Anything");
    var meterBox = document.getElementsByName("meter")[0] as HTMLSelectElement;
    if (meterBox !== null) meterBox.options[0].selected = true;

    //reset transposition/transposed instruments to orignal state
    setTranspos(false);

    exList.sort(exSortFunc);
  };

  // function to handle selection of exercises - for deletion
  const handleSelectExercise = (exIndex: number) => {
    const index = selectedIndexes.indexOf(exIndex);
    if (index === -1) {
      // exercise not selected - add it to the selected list
      setSelectedIndexes([...selectedIndexes, exIndex]);
    } else {
      // exercise is selected - remove from the selected list
      const updatedSelection = [...selectedIndexes];
      updatedSelection.splice(index, 1);
      setSelectedIndexes(updatedSelection);
    }
  };

  // function to handle deletion of selected exercises
  const handleMultipleExerciseDelete = async (selectedIndexes: number[]) => {
    try {
      const database = getDatabase();

      // delete exercises from the database
      await Promise.all(
        selectedIndexes.map(async (exIndex) => {
          const exerciseRef = ref(database, `scores/${exIndex}`);
          const snapshot = await get(exerciseRef);
          if (snapshot.exists()) {
            await remove(exerciseRef);
          } else {
            console.log("exercise" + exIndex + " not found in the database");
          }
        }),
      );

      // remove exercises from the page
      const updatedExercises = allExData.filter((exercise) => {
        return !selectedIndexes.includes(exercise?.exIndex || -1);
      });
      setAllExData(updatedExercises);
      alert("selected exercises deleted!");
      // reload the page without changing the url
      window.location.reload();
    } catch (error) {
      console.error("error deleting exercises:", error);
      alert("error deleting exercises.");
    }
  };

  // Get current exercises for pagination
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exList.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(exList.length / exercisesPerPage);

  // Pagination controls
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  //html for the page
  console.log(
    "ExerciseManagementPage rendering. authorized:",
    authorized,
    "allExData.length:",
    allExData.length,
  );

  if (!authorized) {
    return (
      <div>
        Unauthorized access. See help page to enter admin password for access.
      </div>
    );
  }

  return (
    <div style={{ width: "90vw" }}>
      <div>
        <div className="exercise-management">
          <div className="exercise-management-row">
            <h5 style={{ marginTop: "8px", fontStyle: "italic" }}>
            Click the + in the top right to add a new exercise, then edit as needed
            and save. <br /> To edit an existing exercise, click on the pencil icon
            next to the corresponding exercise in the list below.
            </h5>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
              Logout
              </button>
              {/*creating an exercise*/}
              <Button
                style={{ display: "inline", marginRight: "1vw" }}
                onClick={() => navigate("/exercise-management/create")}
              >
              +
              </Button>
            </div>
          </div>
          <div id="exercise-filters-container">
            <h5>Sort By:</h5>
            {/*editing an exercise, filling in all paramters*/}
            <div id="checkboxes-group">
              <form id="tags">
                <div>Tags:</div>
                <label>
                  <input
                    type="checkbox"
                    name="tags"
                    value="Pitch"
                    checked={tags.includes("Pitch")}
                    onChange={tagsChange}
                  />
                  Pitch
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="tags"
                    value="Intonation"
                    checked={tags.includes("Intonation")}
                    onChange={tagsChange}
                  />
                  Intonation
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="tags"
                    value="Rhythm"
                    checked={tags.includes("Rhythm")}
                    onChange={tagsChange}
                  />
                  Rhythm
                </label>
              </form>
              <form id="transpos">
                <label>
                  <input
                    type="checkbox"
                    name="transpos"
                    value="buh"
                    checked={transpos}
                    onChange={transposChange}
                  />
                  Transposing Instruments
                </label>
              </form>
            </div>
            <div id="dropdowns-group">
              <form id="difficulty">
                <div>Difficulty:</div>
                <select name="difficulty" onChange={diffChange}>
                  <option value="All">All</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </form>
              <form id="voiceCt">
                <div>Voices:</div>
                <select name="voices" onChange={voiceChange}>
                  <option value={0}>Any</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </form>
              <form id="meterForm">
                <div>Meter:</div>
                <select name="meter" defaultValue={types} onChange={meterChange}>
                  <option value="Anything">Anything</option>
                  <option value="Simple">Simple</option>
                  <option value="Compound">Compound</option>
                </select>
              </form>
              <form id="typesForm">
                <div>Textural Factors:</div>
                <select name="types" onChange={typesChange}>
                  <option value="None">None</option>
                  <option value="Drone">Drone</option>
                  <option value="Ensemble Parts">Ensemble Parts</option>
                  <option value="Both">Drone & Ensemble Parts</option>
                </select>
              </form>
              <form id="customIdForm">
                <div>Custom ID:</div>
                <input
                  type="text"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="Enter custom ID"
                />
              </form>
            </div>
            {/*reset sort*/}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button
                variant="danger"
                onClick={resetSort}
                disabled={tags.length === 0 && diff === "All" && voices === 0 && !transpos && types === "None" && meter === "Anything" && customId === ""}
              >
                Reset Sort
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteClick}
                disabled={selectedIndexes.length === 0}
              >
                Delete Selected Exercises
              </Button>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            {/* Exercise count info */}
            <div className="exercise-count-display">
              Showing {indexOfFirstExercise + 1}-{Math.min(indexOfLastExercise, exList.length)} of {exList.length} exercises
            </div>

            <div className="pagination-controls-row">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                variant="outline-primary"
                size="sm"
                className="pagination-nav-button"
              >
                ← Previous
              </Button>

              <div className="pagination-page-numbers">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    variant="outline-secondary"
                    size="sm"
                    className={`pagination-page-button ${currentPage === pageNumber ? 'active' : ''}`}
                  >
                    {pageNumber}
                  </Button>
                ))}
              </div>

              <Button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                variant="outline-primary"
                size="sm"
                className="pagination-nav-button"
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* Preview All and Collapse All Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '4px', marginBottom: '0.5rem' }}>
          <Button
            onClick={() => {
              const currentExerciseIds = currentExercises.map(ex => ex?.exIndex).filter((id): id is number => id !== undefined);
              setExpandedExerciseIds(currentExerciseIds);
            }}
            variant="primary"
            className="preview-all-btn"
          >
            Preview All
          </Button>
          <Button
            onClick={() => {
              setExpandedExerciseIds([]);
            }}
            variant="primary"
            className="collapse-all-btn"
            disabled={expandedExerciseIds.length === 0}
          >
            Collapse All
          </Button>
        </div>

        {/*returning exercise data */}
        <div className="exercise-list-scroll-area">
          {exerciseConfig.showExercises &&
            currentExercises.map((exercise) => {
              if (!exercise) return <div key={Math.random()} />;

              return (
                <ExerciseManagementListEntry
                  key={exercise.exIndex}
                  exercise={exercise}
                  isSelected={selectedIndexes.includes(exercise.exIndex)}
                  handleSelectExercise={handleSelectExercise}
                  onEdit={handleEdit}
                  isExpanded={expandedExerciseIds.includes(exercise.exIndex)}
                  onToggleExpand={(exIndex) => {
                    if (expandedExerciseIds.includes(exIndex)) {
                      setExpandedExerciseIds(expandedExerciseIds.filter(id => id !== exIndex));
                    } else {
                      setExpandedExerciseIds([...expandedExerciseIds, exIndex]);
                    }
                  }}
                />
              );
            })}
        </div>

        {exerciseConfig.showNoExercisesMessage && exList.length === 0 ? (
          <div>No exercises found! Maybe try adding one?</div>
        ) : (
          <></>
        )}

        {/* Logout Confirmation Modal */}
        <LogoutModal
          show={showLogoutModal}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          show={showDeleteModal}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          exerciseCount={selectedIndexes.length}
        />

        {/* Success Banner */}
        <SuccessBanner
          show={showSuccessModal}
          message={successMessage}
          onClose={closeSuccessModal}
        />
      </div>
    </div>
  );
}
