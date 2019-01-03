const timeDrift = require('time-drift')

module.exports = (function () {

  let _currentSlotEnd,
      _previousSlotEnd,
      _currentSlotStart,
      _previousSlotStart,
      _options,
      _interval,
      _slots = []

  function createTimeslots(start, end, interval, options = {}) {
    _options = options
    _interval = Number(interval)
    _currentSlotEnd = _previousSlotEnd = end
    _currentSlotStart = _previousSlotStart = start

    return (
      start < end
        ? _noMidnightCrossing
        : _crossesMidnight
    ) (start, end)
  }

  function _noMidnightCrossing(start, end){
    let { endWithPartial, hidePartial, units, hideSeconds, joinOn } = _options

    if (endWithPartial){
      while (end >= _currentSlotStart){
        _pushSlots(start)
        if (_currentSlotStart < _previousSlotStart) break;
        _previousSlotStart = _currentSlotStart;
      }
      _slots[_slots.length-1][1] = timeDrift(_slots[_slots.length-1][0]).add(_interval, units || 'm').val;
    } else {
      while (_currentSlotEnd >= start){
        _shiftSlots(end)
        if (_currentSlotEnd > _previousSlotEnd) break;
        _previousSlotEnd = _currentSlotEnd;
      }
      _slots[0][0] = start;

    }

    if (hidePartial){
      let lastSlotPair = _slots[_slots.length-1]
      let firstSlotPair = _slots[0]

      let firstOfLast = timeDrift(lastSlotPair[0]).add(_interval, units || 'm')
      let lastOfFirst = timeDrift(firstSlotPair[1]).subtract(_interval, units || 'm')

      if(firstOfLast.val !== lastSlotPair[1]){
        _slots.pop()
      }

      if(timeDrift(lastOfFirst).val !== firstSlotPair[0]){
        _slots.shift()
      }
    }

    if (hideSeconds){
      _slots = _slots.map(function (slot) {
        return [slot[0].substring(0,5), slot[1].substring(0,5)]
      })
    }

    if (joinOn){
      return _slots.map(function(slot){
        return slot.join(_options.joinOn)
      })
    }

    if( _slots[_slots.length-1][0] === _slots[_slots.length-1][1]){
      _slots.pop()
    }

    return _slots
  }

  function _crossesMidnight(start, end){
    var crossedMidnight = false;
    if (_options.endWithPartial){
      while (!crossedMidnight){
        _pushSlots(start, end)
        crossedMidnight = _currentSlotStart < _previousSlotStart
        _previousSlotStart = _currentSlotStart
      }
    } else {
      while (!crossedMidnight){
        _shiftSlots(start, end)
        crossedMidnight = _previousSlotEnd < _currentSlotEnd;
        _previousSlotEnd = _currentSlotEnd;
      }
    }

    return _noMidnightCrossing(start, _currentSlotEnd)
  }

  function _shiftSlots(start, end){
    let { separator, units, spacer, spacerUnit } = _options
    _currentSlotEnd = timeDrift(_currentSlotEnd, separator).subtract(_interval, units || 'm').val
    var timeslot = [_currentSlotEnd,(_previousSlotEnd || end)]

    _slots.unshift(timeslot)

    if (spacer){
      var temp = _currentSlotStart
      _currentSlotEnd = timeDrift(_currentSlotEnd, separator).subtract(spacer, spacerUnit || 'm').val
      if ( _currentSlotEnd < start && _currentSlotEnd > _previousSlotEnd ) _slots[0][0] = start;
    }
  }

  function _pushSlots(start, end){
    let { separator, units, spacer, spacerUnit } = _options

    _currentSlotStart = timeDrift(_currentSlotStart, separator).add(_interval, units || 'm').val
    var timeslot = [(_previousSlotStart || start), _currentSlotStart]

    _slots.push(timeslot)

    if (spacer){
      _currentSlotStart = timeDrift(_currentSlotStart, separator).add(spacer, spacerUnit || 'm').val
      if ( _currentSlotStart > end && _currentSlotStart < _previousSlotStart ) _slots[_slots.length-1][1] = end

    }
  }

  return createTimeslots

})()