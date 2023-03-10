import React from "react";
import "./App.css";
import Header from "./components/Header";
import Choicelist from "./components/Choicelist";
import MeshComponent from "./components/MeshComponent";
import GameStartDisplay from "./components/GameStartDisplay";
import WrongSelectionDisp from "./components/WrongSelectionDisp";
import FoundCharacterDisp from "./components/FoundCharacterDisp";
import GameEndDisplay from "./components/GameEndDisplay";
import DisplayScoresScreen from "./components/DisplayScoresScreen";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import luffy from "./images/luffy.png";
import jinbe from "./images/jinbe.png";
import Hawkins from "./images/Hawkins.jpg";
import aokiji from "./images/aokiji.jpg";
import lucci from "./images/lucci.jpg";
import momonuske from "./images/momonuske.jpeg";

import { useState, useEffect } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyBK8LHUDJMheJMJaoLOX-SCl_4cMgrYclw",
  authDomain: "findluffy-81250.firebaseapp.com",
  projectId: "findluffy-81250",
  storageBucket: "findluffy-81250.appspot.com",
  messagingSenderId: "509687126544",
  appId: "1:509687126544:web:81afde02034783c7154895",
};
interface score {
  name: string;
  time: number;
}
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveScores(item: score) {
  try {
    await addDoc(collection(db, "scores"), {
      name: item.name,
      time: item.time,
    });
  } catch (error) {
    console.error("Error writing new message to Firebase Database", error);
  }
}

async function retrieveDB() {
  let dataCollection: score[] = [{ name: "NA", time: -1 }];
  const querySnapshot = await getDocs(collection(db, "scores"));
  if (!querySnapshot.empty) {
    querySnapshot.forEach((doc) => {
      let placeHolder: score = {
        name: doc.data().name,
        time: doc.data().time,
      };

      dataCollection.push(placeHolder);
    });
  }
  return dataCollection;
}

function App() {
  useEffect(() => {
    retrieveDB().then((scores) => {
      if (scores.length > 1) {
        let transitionVar = scores.filter((score) => score.time >= 0);
        transitionVar = transitionVar.sort(function (a, b) {
          if (a.time > b.time) return 1;
          if (a.time < b.time) return -1;
          return 0;
        });
        setAllUserValues(transitionVar);
      }
    });
  }, []);
  const [gameStart, setGameStart] = useState(false);
  const [gameEnd, setGameEnd] = useState(false);
  const [displayAllScores, setDisplayAllScores] = useState(false);
  const [gameBeginTime, setGameBeginTime] = useState(0);
  const [gameEndTime, setGameEndTime] = useState(0);
  const [allUserValues, setAllUserValues] = useState([
    { name: "NA", time: -1 },
  ]);
  const [foundCharacter, setFoundCharacter] = useState("None");
  const [madeWrongSelection, setMadeWrongSelection] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isActive, setIsActive] = useState(-1);
  const [previouslyClicked, setPreviouslyClicked] = useState([-1]);
  const [searchItems, setSearchItems] = useState([
    { image: aokiji, name: "Aokiji", block: 317, found: false },
    { image: momonuske, name: "Momonuske", block: 302, found: false },
    { image: luffy, name: "Luffy", block: 58, found: false },
    { image: jinbe, name: "Jinbe", block: 128, found: false },
    { image: Hawkins, name: "Hawkins", block: 197, found: false },
    { image: lucci, name: "Lucci", block: 146, found: false },
  ]);

  function checkChoice(index: number, name: string) {
    displayItem(index);
    let myItems = searchItems;
    let itemChecked = myItems.find((item) => item.name === name);
    let posOfItem = myItems.findIndex((item) => item.name === name);
    if (itemChecked!.block === index) {
      itemChecked!.found = true;
      myItems.splice(posOfItem, 1, itemChecked!);
      setSearchItems(myItems);
      setPreviouslyClicked([...previouslyClicked, index]);
      if (previouslyClicked.length === 6) {
        const time =
          new Date().getHours() * 60 * 60 +
          new Date().getMinutes() * 60 +
          new Date().getSeconds();
        setGameEndTime(time - gameBeginTime);
        setGameEnd(true);
      }
      setFoundCharacter(name);
      setTimeout(() => {
        setFoundCharacter("None");
      }, 1250);
    } else {
      setMadeWrongSelection(true);
      setTimeout(() => {
        setMadeWrongSelection(false);
      }, 1250);
    }
  }

  function displayItem(number: number) {
    if (previouslyClicked.includes(number)) return;
    if (!clicked) {
      setClicked(true);
      setIsActive(number);
    } else {
      setClicked(false);
      setIsActive(-1);
    }
  }

  function beginGame() {
    setGameStart(true);
    setGameBeginTime(
      new Date().getHours() * 60 * 60 +
        new Date().getMinutes() * 60 +
        new Date().getSeconds()
    );
    let allItems = searchItems;
    allItems.forEach((item) => {
      item.found = false;
    });
    setSearchItems(allItems);
    setPreviouslyClicked([-1]);
  }
  function updateUserValues(userValue: { name: string; time: number }) {
    let allValues = allUserValues;
    saveScores(userValue);
    for (let i = 0; i < allValues.length; i++) {
      if (userValue.time < allValues[i].time) {
        allValues.splice(i, 0, userValue);
        allValues = allValues.filter((items) => items.time >= 0);
        setAllUserValues(allValues);
        return;
      }
    }
    allValues.push(userValue);
    allValues = allValues.filter((items) => items.time >= 0);
    setAllUserValues(allValues);
  }
  let items = [0];
  for (let i = 1; i < 345; i++) {
    items.push(i);
  }

  return (
    <div className="App">
      {!gameStart && !displayAllScores && (
        <GameStartDisplay beginGame={beginGame} searchItems={searchItems} />
      )}
      {gameStart && !gameEnd && (
        <div className="main">
          <Header searchItems={searchItems} />
          {foundCharacter !== "None" && (
            <FoundCharacterDisp name={foundCharacter} />
          )}
          {madeWrongSelection && <WrongSelectionDisp />}
          {items.map((index) => (
            <div key={index}>
              <MeshComponent
                index={index}
                isActive={isActive}
                previouslyClicked={previouslyClicked}
                displayItem={displayItem}
              />
              {isActive === index && (
                <Choicelist
                  searchItems={searchItems}
                  index={index}
                  checkChoice={checkChoice}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {gameEnd && (
        <GameEndDisplay
          gameEndTime={gameEndTime}
          setGameEnd={setGameEnd}
          setDisplayAllScores={setDisplayAllScores}
          recordUserValues={updateUserValues}
          setGameStart={setGameStart}
        />
      )}{" "}
      {/* //scoreboard here */}
      {
        displayAllScores && (
          <DisplayScoresScreen
            allUserValues={allUserValues}
            startNewGame={beginGame}
            setDisplayAllScores={setDisplayAllScores}
          />
        )

        // <div>
        //   <h2>ScoreBoard</h2>
        //   <ol>
        //     {allUserValues.map((item) => (
        //       <li>
        //         {item.name}:{item.time}seconds
        //       </li>
        //     ))}
        //   </ol>
        // </div>
      }
    </div>
  );
}

export default App;

// displayAllScores = {};
