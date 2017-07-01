(function () {
  var STATES = {
    sleep: 0,
    lay: 1,
    sit: 2,
    lick: 3,
    stand: 4,
    move: 5,
    jump: 6
  };

  var TRANSITIONS = [];
  TRANSITIONS[STATES.sleep] = {
    list: [STATES.sleep, STATES.lay],
    keys: {
      down: STATES.sleep,
      up: STATES.lay
    }
  };
  TRANSITIONS[STATES.lay] = {
    list: [STATES.sleep, STATES.lay, STATES.sit],
    keys: {
      down: STATES.sleep,
      up: STATES.sit
    }
  };
  TRANSITIONS[STATES.sit] = {
    list: [STATES.lay, STATES.sit, STATES.lick, STATES.stand],
    keys: {
      down: STATES.lay,
      up: STATES.stand
    }
  };
  TRANSITIONS[STATES.lick] = {
    list: [STATES.sit, STATES.lick],
    keys: { default: STATES.sit }
  };
  TRANSITIONS[STATES.stand] = {
    list: [STATES.sit, STATES.stand, STATES.move, STATES.jump],
    keys: {
      down: STATES.sit,
      left: STATES.move,
      right: STATES.move,
      space: STATES.jump
    }
  };
  TRANSITIONS[STATES.move] = {
    list: [STATES.stand, STATES.move, STATES.jump],
    keys: {
      left: STATES.move,
      right: STATES.move,
      space: STATES.jump
    }
  };
  TRANSITIONS[STATES.jump] = {
    list: [STATES.stand, STATES.move],
    keys: {
      left: STATES.move,
      right: STATES.move
    }
  };

  var cat = {
    STATES: STATES,
    TRANSITIONS: TRANSITIONS,
    state: STATES.sit,
    obedient: false,
    random: () => {
      var index = 0;
      var transitions = TRANSITIONS[cat.state].list;
      var rand = Math.random();
      // Prefer transitioning to poorer states
      while (rand > 0.5 && index < transitions.length - 1) {
        rand = Math.random();
        index++;
      }
      return transitions[index];
    },
    machine: (pressed) => {
      var keys = _.keys(TRANSITIONS[cat.state].keys);
      _.some(keys, (key) => {
        if (pressed[key]) {
          cat.state = TRANSITIONS[cat.state].keys[key];
          return true;
        }
        return false;
      });
    }
  };

  window.cat = cat;
})();
