const timeDrift = require('time-drift')

module.exports = (function () {

  let _timeObject = {},
      _slotDuration,
      _start,
      _end,
      _slots,
      _units,
      _hasEverCrossedMidnight,
      _spacer,
      _spacerUnits,
      _pushToEndTime,
      _includeOverflow
      _finished = false

  function createTimeslots(start, end, slotDuration, options = {}) {
    // this will be a singleton in a node app, so it is important
    // to reset all the variables so that one invocation doesn't
    // effect another
    let initialTime = options.pushToEndTime ? end : start
    _slots = []
    _finished = false
    _pushToEndTime = false
    _hasEverCrossedMidnight = false
    _timeObject = timeDrift(initialTime, options.delimiter)
    _slotDuration = slotDuration
    _units = options.units || 'm'
    _pushToEndTime = options.pushToEndTime
    _spacer = options.spacer
    _spacerUnits = options.spacerUnits || 'm'
    _includeOverflow = options.includeOverflow

    // I put the start and end through the timeDrift package
    // to ensure they have the same format, so that comparing
    // isn't effected by different delimiters
    _start = timeDrift(start, options.delimiter).val
    _end = timeDrift(end, options.delimiter).val

    _checkIsValid()

    _slots = start < end ? _noMidnightCrossing() : _crossesMidnight();

    if (options.joinOn) {
      return _slots.map(slotPair => slotPair.join(options.joinOn))
    }

    return _slots
  }

  // finish immediately if the _slotDuration is too small for even
  // one time-slot
  function _checkIsValid() {
    const testTime = timeDrift(_start).add(_slotDuration,  _units)
    if (_start < _end) {
      if (testTime.val > _end || testTime.hasCrossedMidnight) {
        _finished = true
      }
    } else {
      if (testTime.val > _end && testTime.hasCrossedMidnight) {
        _finished = true
      }
    }
    console.warn('The duration is too too small for even one time-slot')
  }

  function _checkIsMidnightCrossed () {
    if (_timeObject.hasCrossedMidnight) {
      _hasEverCrossedMidnight = true
    }
  }

  function _incrementTime() {
    _addSlotToBack(_timeObject.val, _timeObject.add(_slotDuration, _units).val)

    if (_spacer) {
      _timeObject.add(_spacer, _spacerUnits)
    }
    _checkIsMidnightCrossed()
  }

  function _decrementTime() {
    _addSlotToFront(_timeObject.val, _timeObject.subtract(_slotDuration, _units).val)

    if (_spacer) {
      _timeObject.subtract(_spacer, _spacerUnits)
    }
    _checkIsMidnightCrossed()
  }

  // if no crossing over the midnight threshold is involved
  // in creating the required time-slots, this logic will
  // be used
  function _noMidnightCrossing() {

    if (_pushToEndTime) {
      while ((_timeObject.val >= _start) && !_finished) {
        _decrementTime()
      }
    } else {
      while ((_timeObject.val <= _end) && !_finished) {
        _incrementTime()
      }
    }
    return _slots
  }

  // if the time-slots required involve a crossing over the midnight
  // threshhold, we need this logic before it gets to midnight
  function _crossesMidnight() {
    while (!_hasEverCrossedMidnight) {
      if (_pushToEndTime) {
        _decrementTime()
      } else {
        _incrementTime()
      }
    }

    return _noMidnightCrossing()
  }

  function _addSlotToBack(pre, post) {

    //we definitely don't want a slot if it begins on the end time, unless
    // the start and end times given were the same
    if (pre === _end && !(_start === _end && !_hasEverCrossedMidnight)) {
      _finished = true
    }

    _checkIsMidnightCrossed()

    if (!_includeOverflow) {

      // condition to eliminate timeslots that bridge over the end time
      if (pre < _end && post > _end) {
        _finished = true
      }

       // if the end time is midnight or close to it, the post
      // and pre values may be either side of the midnight and
      // require this condition to realise the time-slots bridge
      // the end time
      if ((pre > _end && post > _end) && pre > post) {
        _finished = true
      }
    }

    if (!_finished) {
      _slots.push([pre, post])
    }
  }

  function _addSlotToFront (pre, post) {

    // we definitely don't want a slot if it ends on the start time
    // the start and end times given were the same
    if (pre === _start && !(_start === _end && !_hasEverCrossedMidnight)) {
      _finished = true
    }

    _checkIsMidnightCrossed()

    if (!_includeOverflow) {
      // condition to eliminate timeslots that bridge over the start time
      if (pre > _start && post < _start) {
        _finished = true
      }

      // if the start time is midnight or close to it, the post
      // and pre values may be either side of the midnight and
      // require this condition to realise the time-slots bridge
      // the start time
      if ((pre > _start && post > _start) && pre < post) {
        _finished = true
      }
    }

    if (!_finished) {
      _slots.unshift([post, pre])
    }
  }

  return createTimeslots

})()