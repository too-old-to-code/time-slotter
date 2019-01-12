const timeDrift = require('time-drift')

module.exports = (function () {
  const VALID_OPTIONS = [
    'units',
    'spacer',
    'spacerUnits',
    'includeOverflow',
    'pushToEndTime',
    'joinOn',
    'delimiter'
  ]

  const warnMsg = {
    DURATION_TOO_LARGE: 'The duration is too large to create even one time-slot within the times given',
    UNRECOGNISED_OPTION: (option) => `Unrecognised '${option}' option was provided`
  }

  const errMsg = {
    NO_DURATION: 'You must include a positive duration value as the third argument',
    MISSING_ARGS: 'You must enter a start and an end value as the first and second arguments'
  }

  let _timeObject = {},
      _slotDuration,
      _start,
      _end,
      _slots,
      _units,
      _crossedOverMidnightCount,
      _spacer,
      _spacerUnits,
      _pushToEndTime,
      _includeOverflow,
      _finished,
      _shouldCrossMidnight

  function createTimeslots(start, end, slotDuration, options = {}) {
    if (!start || !end) {
      throw new Error(errMsg.MISSING_ARGS)
    }

    if (!slotDuration) {
      throw new Error(errMsg.NO_DURATION)
    }

    // Check that valid options were given
    Object.keys(options).forEach(option => {
      if (!VALID_OPTIONS.includes(option)) {
        console.warn(warnMsg.UNRECOGNISED_OPTION(option))
      }
    })

    // this will be a singleton in a node app, so it is important
    // to reset all the variables so that one invocation doesn't
    // effect another
    let initialTime = options.pushToEndTime ? end : start
    _slots = []
    _finished = false
    _crossedOverMidnightCount = 0
    _timeObject = timeDrift(initialTime, options.delimiter)
    _slotDuration = slotDuration
    _units = options.units || 'm'
    _pushToEndTime = options.pushToEndTime || false
    _spacer = options.spacer
    _spacerUnits = options.spacerUnits || 'm'
    _includeOverflow = options.includeOverflow
    _shouldCrossMidnight = false

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
        console.warn(warnMsg.DURATION_TOO_LARGE)
      }
    } else {
      if (testTime.val > _end && testTime.hasCrossedMidnight) {
        _finished = true
        console.warn(warnMsg.DURATION_TOO_LARGE)
      }
    }
  }

  function _checkIsMidnightCrossed () {
    // this was an extra check needed for some boundary conditions
    // to ensure that if midnight was passed when not expected to
    // from the start and end times, _finished is set to true
    if (_crossedOverMidnightCount && !_shouldCrossMidnight) {
      _finished = true
    }

    // if midnight is passed more than once we definitely
    // need to finish
    if (_crossedOverMidnightCount > 1) {
      _finished = true
    }

    if (_timeObject.hasCrossedMidnight) {
      _crossedOverMidnightCount ++
    }

  }

  // when pushToEndTime is false, we begin at the start time and work our
  // way forward to the end time
  function _incrementTime() {
    _addSlotToBack(_timeObject.val, _timeObject.add(_slotDuration, _units).val)

    if (_spacer) {
      _timeObject.add(_spacer, _spacerUnits)
      _checkIsMidnightCrossed ()
    }
  }

  // when pushToEndTime is true, we begin at the end time and work our
  // way backwards to the start time
  function _decrementTime() {
    _addSlotToFront(_timeObject.val, _timeObject.subtract(_slotDuration, _units).val)

    if (_spacer) {
      _timeObject.subtract(_spacer, _spacerUnits)
      _checkIsMidnightCrossed ()
    }
  }

  // if no crossing over the midnight threshold is involved
  // in creating the required time-slots, this logic will
  // be used
  function _noMidnightCrossing() {
    // _shouldCrossMidnight = false
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
    _shouldCrossMidnight = true
    while (!_crossedOverMidnightCount) {
      if (_pushToEndTime) {
        _decrementTime()
      } else {
        _incrementTime()
      }
    }

    return _noMidnightCrossing()
  }

  function _addSlotToBack(pre, post) {
    _checkIsMidnightCrossed()

    //we definitely don't want a slot if it begins on the end time, unless
    // the start and end times given were the same
    if (pre === _end && !(_start === _end && !_crossedOverMidnightCount)) {
      _finished = true
    }

    if (!_includeOverflow) {

      // condition to eliminate timeslots that bridge over the end time
      if (pre < _end && post > _end) {
        _finished = true
      }

      if (pre < _end && post < _end && _timeObject.hasCrossedMidnight) {
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

  function _addSlotToFront (post, pre) {
    _checkIsMidnightCrossed()

    // we definitely don't want a slot if it ends on the start time
    // the start and end times given were the same
    if (post === _start && !(_start === _end && !_crossedOverMidnightCount)) {
      _finished = true
    }

    if (!_includeOverflow) {
      // condition to eliminate timeslots that bridge over the start time
      if (post > _start && pre < _start) {
        _finished = true
      }

      if (post > _start && pre > _start && _timeObject.hasCrossedMidnight) {
        _finished = true
      }

      // if the start time is midnight or close to it, the pre
      // and post values may be either side of the midnight and
      // require this condition to realise the time-slots bridge
      // the start time
      if ((post > _start && pre > _start) && post < pre) {
        _finished = true
      }
    }

    if (!_finished) {
      _slots.unshift([pre, post])
    }

  }

  return createTimeslots

})()