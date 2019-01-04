const timeDrift = require('time-drift')

module.exports = (function () {

  let _timeObject = {},
      _interval,
      _start,
      _end,
      _slots = [],
      _units = 'm',
      _hasCrossedMidnight = false,
      _spacer,
      _spacerUnit,
      _endWithPartial = false,
      _finished = false

  function createTimeslots(start, end, interval, options = {}) {
    let initialTime = options.endWithPartial ? start : end
    _timeObject = timeDrift(initialTime, options.delimiter)

    // I put the start and end through the timeDrift package
    // to ensure they have the same format, so that comparing
    // isn't effected by different delimiters
    _start = timeDrift(start, options.delimiter).val
    _end = timeDrift(end, options.delimiter).val
    _interval = interval
    _units = options.units
    _endWithPartial = options.endWithPartial
    _spacer = options.spacer
    _spacerUnit = options.spacerUnit

    _slots = start < end ? _noMidnightCrossing() : _crossesMidnight();

    if (options.joinOn) {
      return _slots.map(slotPair => slotPair.join(options.joinOn))
    }
    return _slots
  }

  function _checkIsMidnightCrossed () {
    if (_timeObject.hasCrossedMidnight) {
      _hasCrossedMidnight = true
    }
  }

  function incrementTime() {
    _addSlotToBack(_timeObject.val, _timeObject.add(_interval, _units).val)

    if (_spacer) {
      _timeObject.add(_spacer, _spacerUnit)
    }
    _checkIsMidnightCrossed()
  }

  function decrementTime() {
    _addSlotToFront(_timeObject.val, _timeObject.subtract(_interval, _units).val)

    if (_spacer) {
      _timeObject.subtract(_spacer, _spacerUnit)
    }
    _checkIsMidnightCrossed()
  }

  function _noMidnightCrossing() {
    if (_endWithPartial) {
      while (_timeObject.val <= _end) {
        incrementTime()
      }
    } else {
      while (_timeObject.val >= _start) {
        decrementTime()
      }
    }
    return _slots
  }


  function _crossesMidnight() {
    while (!_hasCrossedMidnight) {
      if (_endWithPartial) {
        incrementTime()
      } else {
        decrementTime()
      }
    }

    return _noMidnightCrossing()
  }

  // function _crossesMidnight() {
  //   if (_endWithPartial) {
  //     while (!_hasCrossedMidnight) {
  //       incrementTime()
  //     }
  //   } else {
  //     while (!_hasCrossedMidnight) {
  //       decrementTime()
  //     }
  //   }
  //   return _noMidnightCrossing()
  // }

  function _addSlotToBack(pre, post) {

    _checkIsMidnightCrossed()
    if (pre < _end && post > _end) {
      _finished = true
    }

    if (!_finished) {
      _slots.push([pre, post])
    }
  }

  function _addSlotToFront (pre, post) {
    _checkIsMidnightCrossed()
    if (pre > _start && post < _start) {
      _finished = true
    }

    if (!_finished) {
      _slots.unshift([post, pre])
    }
  }

  return createTimeslots

})()