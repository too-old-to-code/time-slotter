const timeDrift = require('time-drift')

module.exports = (function () {

  let _timeObject = {},
      _slotDuration,
      _start,
      _end,
      _slots,
      _units,
      _hasCrossedMidnight,
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
    _hasCrossedMidnight = false
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
    while (!_hasCrossedMidnight) {
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
    // if the time-slot bridges over the _end time,
    // that time-slot is not acceptable. Set the outer
    // _finished function to true to stop more slots being
    // added, unless the _includeOverflow option is set to true
    if ((pre <= _end && post > _end) && !_includeOverflow) {
      _finished = true
    }

    // if the end time is midnight or close to it, the post
    // and pre values may be either side of the midnight and
    // require this condition to realise the time-slots are
    // finished
    if ((pre > _end && post > _end) && pre > post) {
      _finished = true
    }

    if (!_finished) {
      _slots.push([pre, post])
    }
  }

  function _addSlotToFront (pre, post) {
    _checkIsMidnightCrossed()
    // if the time-slot bridges over the _start time,
    // that time-slot is not acceptable. Set the outer
    // _finished function to true to stop more slots being
    // added, unless the _includeOverflow option is set to true
    if ((pre >= _start && post < _start) && !_includeOverflow) {
      _finished = true
    }

    // if the end time is midnight or close to it, the post
    // and pre values may be either side of the midnight and
    // require this condition to realise the time-slots are
    // finished
    if ((pre >= _start && post > _start) && pre < post) {
      _finished = true
    }

    if (!_finished) {
      _slots.unshift([post, pre])
    }
  }

  return createTimeslots

})()