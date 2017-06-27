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
  TRANSITIONS[STATES.sleep] = [STATES.sleep, STATES.lay];
  TRANSITIONS[STATES.lay] = [STATES.sleep, STATES.lay, STATES.sit];
  TRANSITIONS[STATES.sit] = [STATES.lay, STATES.sit, STATES.lick, STATES.stand];
  TRANSITIONS[STATES.lick] = [STATES.sit, STATES.lick];
  TRANSITIONS[STATES.stand] = [STATES.sit, STATES.stand, STATES.move, STATES.jump];
  TRANSITIONS[STATES.move] = [STATES.stand, STATES.move, STATES.jump];
  TRANSITIONS[STATES.jump] = [STATES.stand, STATES.move];

  var cat = {
    STATES: STATES,
    TRANSITIONS: TRANSITIONS,
    state: STATES.sleep,
    random: () => {
      var index = 0;
      var transitions = TRANSITIONS[cat.state];
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
