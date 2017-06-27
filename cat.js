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
    keys: [['down'], ['up']]
  };
  TRANSITIONS[STATES.lay] = {
    list: [STATES.sleep, STATES.lay, STATES.sit],
    keys: [['down'], null, ['up']]
  };
  TRANSITIONS[STATES.sit] = {
    list: [STATES.lay, STATES.sit, STATES.lick, STATES.stand],
    keys: [['down'], null, null, ['up']]
  };
  TRANSITIONS[STATES.lick] = {
    list: [STATES.sit, STATES.lick],
    keys: [['up'], null]
  };
  TRANSITIONS[STATES.stand] = {
    list: [STATES.sit, STATES.stand, STATES.move, STATES.jump],
    keys: [['down'], null, ['left', 'right'], ['space']]
  };
  TRANSITIONS[STATES.move] = {
    list: [STATES.stand, STATES.move, STATES.jump],
    keys: [null, ['left', 'right'], ['space']]
  };
  TRANSITIONS[STATES.jump] = {
    list: [STATES.stand, STATES.move],
    keys: [null, ['left', 'right']]
  };

  var cat = {
    STATES: STATES,
    TRANSITIONS: TRANSITIONS,
    state: STATES.sleep,
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
    }
  };

  window.cat = cat;
})();
