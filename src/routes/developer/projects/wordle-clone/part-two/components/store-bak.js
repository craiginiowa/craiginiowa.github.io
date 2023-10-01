import { writable } from "svelte/store";

function createAnswerStore() {
  const { subscribe, set } = writable("QUOTE");

  return {
    subscribe,
  };
}

export const answer = createAnswerStore();

export const curGuess = writable(1);

function createGuessesStore() {
  const { subscribe, set } = writable([]);
  let $curGuess;
  let $answer;

  curGuess.subscribe(val => $curGuess = val);
  answer.subscribe(val => $answer = val);

  resetGuesses();

  function resetGuesses() {
    set(["QUEUE", "-----", "-----", "-----", "-----", "-----"]);
    // set(["-----", "-----", "-----", "-----", "-----", "-----"]);
  }

  /**
   * 
   * @param {String} letter 
   * @param {Number} row 
   * @param {Number} col 
   * @returns 
   */
  function getClass(letter, row, col) {
    if (row == $curGuess && letter != "-") {
      return "letter pending";
    } else if (row < $curGuess && $answer[col] == letter) {
      return "letter correctposition";
    } else if (row < $curGuess && $answer.includes(letter) && $answer[col] !== letter) {
      // this one needs work. if the same letter is played twice and is in the correct
      // position, this should fail and fall to "notfound"
      return "letter wrongposition";
    } else if (row < $curGuess && !$answer.includes(letter)) {
      return "letter notfound";
    }
    return "letter";
  }

  return {
    subscribe,
    getClass,
  };
}

export const guesses = createGuessesStore();

/**
 *
 */
function createKeysStore() {
  const { subscribe, set } = writable([]);
  let $guesses;
  let $curGuess;
  let $answer;

  guesses.subscribe(val => $guesses = val);
  curGuess.subscribe(val => $curGuess = val);
  answer.subscribe(val => $answer = val);

  // QWERTY KEYBOARD (e = ENTER, d = DELETE)
  const qwerty = "QWERTYUIOPASDFGHJKLeZXCVBNMd";

  const keyRecords = qwerty.split("").map((k) => {
    return {
      label: k == "e" ? "En" : k == "d" ? "De" : k,
      class: k == "e" ? "enter" : k == "d" ? "delete" : "key",
      correctposition: false,
      wrongposition: false,
      notfound: false,
    };
  });

  set(keyRecords);

  function guess() {
    for (let key of keyRecords) {
      updateKeyFeedback(key);
    }
    set(keyRecords);
  }

  /**
   * Provide feedback for key on keyboard:
   * - If letter is in guesses in correct position, return "correctposition"
   * - If letter is in guesses but not correct position, return "wrongposition"
   * - If letter is in guesses but not answer, return "notfound"
   * @param {Object} key - {class, label}
   * @returns {boolean}
   */
  function updateKeyFeedback(key) {
    // loop through ALL guesses, until first "-"
    for (let row in $guesses) {
      const guess = $guesses[row];

      if (row >= $curGuess || guess[0] == "-") break;
      
      for (let col in guess) {
        const letter = guess[col];

        // if this isn't the key we're checking or it's "-", continue
        if (letter != key.label || letter == "-") continue;

        if ($answer.includes(letter)) {
          key.correctposition = key.correctposition || $answer[col] == guess[col];
          key.wrongposition = !key.correctposition;
        } else if (guess.includes(letter)) {
          key.notfound = true;
        }        
      }
    }
  }

  return {
    subscribe,
    guess,
  };
}

export const keys = createKeysStore();
