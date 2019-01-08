(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeSlotter = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeDrift = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";function _slicedToArray(r,t){return _arrayWithHoles(r)||_iterableToArrayLimit(r,t)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function _iterableToArrayLimit(r,t){var e=[],n=!0,o=!1,i=void 0;try{for(var a,s=r[Symbol.iterator]();!(n=(a=s.next()).done)&&(e.push(a.value),!t||e.length!==t);n=!0);}catch(r){o=!0,i=r}finally{try{n||null==s.return||s.return()}finally{if(o)throw i}}return e}function _arrayWithHoles(r){if(Array.isArray(r))return r}function timeDrift(r,t){if(!/^\d\d.\d\d(.\d\d)?$/.test(r))throw new Error("Time format is incorrect. It should be either 'HH:MM:SS' or 'HH:MM', where the colon can be replaced by a non-numerical character");var e=_slicedToArray(r.split(/[.:\- ]/).map(function(r){return Number(r)}),3),n=e[0],o=e[1],i=e[2];if(n>23||n<0)throw new Error("Hours must be between 0 and 23");if(o>59||o<0)throw new Error("Minutes must be between 0 and 59");if(null!=i&&(i>59||i<0))throw new Error("Seconds must be between 0 and 59");if(t&&("string"!=typeof t||t.length>1))throw new Error("Separator must be a single, non-numerical character");function a(r,t){if("number"!=typeof r)throw new Error("First argument of ".concat(t," method must be a number"))}function s(r,t){if("string"!=typeof r)throw new Error("Second argument of ".concat(t," method must be a string representing the unit of time"));var e=r.charAt(0).toLowerCase();if(!["h","m","s"].includes(e))throw new Error("Second argument of ".concat(t," method must be hours, minutes or seconds"));if("s"===e&&null==i)throw new Error("You can't adjust seconds if they weren't included in the original time given");return e}var u={normalize:function(r){return null==i&&r.pop(),r.map(function(r){return(r=String(r)).length<2?"0"+r:r}).join(t||":")},hasCrossedMidnight:!1,add:function(r,t){switch(a(r,"add"),this.hasCrossedMidnight=!1,s(t,"add")){case"h":this.hasCrossedMidnight=Boolean(Math.floor((n+r)/24)),n=(n+r)%24;break;case"m":var e=Math.floor((o+r)/60);o=(o+r)%60,this.add(e,"h");break;case"s":var u=Math.floor((i+r)/60);i=(i+r)%60,this.add(u,"m")}return this},subtract:function(r,t){a(r,"subtract"),this.hasCrossedMidnight=!1;var e=0;switch(s(t,"subtract")){case"h":for(var u=n-r;u<0;)e++,u=24+u;n=u,e&&(this.hasCrossedMidnight=!0);break;case"m":for(var h=o-r;h<0;)e++,h=60+h;o=h,e&&this.subtract(e,"h");break;case"s":for(var c=i-r;c<0;)e++,c=60+c;i=c,e&&this.subtract(e,"m")}return this}};return Object.defineProperty(u,"val",{get:function(){return this.normalize([n,o,i])}}),u.add=u.add.bind(u),u.subtract=u.subtract.bind(u),u}module.exports=timeDrift;

},{}]},{},[1])(1)
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
"use strict";

var timeDrift = require('time-drift');

module.exports = function () {
  var warnMsg = {
    DURATION_TOO_LARGE: 'The duration is too large to create even one time-slot within the times given'
  };
  var errMsg = {
    NO_DURATION: 'You must include a positive duration value as the third argument',
    MISSING_ARGS: 'You must enter a start and an end value as the first and second arguments'
  };

  var _timeObject = {},
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
      _finished;

  function createTimeslots(start, end, slotDuration) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (!start || !end) {
      throw new Error(errMsg.MISSING_ARGS);
    }

    if (!slotDuration) {
      throw new Error(errMsg.NO_DURATION);
    } // this will be a singleton in a node app, so it is important
    // to reset all the variables so that one invocation doesn't
    // effect another


    var initialTime = options.pushToEndTime ? end : start;
    _slots = [];
    _finished = false;
    _crossedOverMidnightCount = 0;
    _timeObject = timeDrift(initialTime, options.delimiter);
    _slotDuration = slotDuration;
    _units = options.units || 'm';
    _pushToEndTime = options.pushToEndTime || false;
    _spacer = options.spacer;
    _spacerUnits = options.spacerUnits || 'm';
    _includeOverflow = options.includeOverflow; // I put the start and end through the timeDrift package
    // to ensure they have the same format, so that comparing
    // isn't effected by different delimiters

    _start = timeDrift(start, options.delimiter).val;
    _end = timeDrift(end, options.delimiter).val;

    _checkIsValid();

    _slots = start < end ? _noMidnightCrossing() : _crossesMidnight();

    if (options.joinOn) {
      return _slots.map(function (slotPair) {
        return slotPair.join(options.joinOn);
      });
    }

    return _slots;
  } // finish immediately if the _slotDuration is too small for even
  // one time-slot


  function _checkIsValid() {
    var testTime = timeDrift(_start).add(_slotDuration, _units);

    if (_start < _end) {
      if (testTime.val > _end || testTime.hasCrossedMidnight) {
        _finished = true;
        console.warn(warnMsg.DURATION_TOO_LARGE);
      }
    } else {
      if (testTime.val > _end && testTime.hasCrossedMidnight) {
        _finished = true;
        console.warn(warnMsg.DURATION_TOO_LARGE);
      }
    }
  }

  function _checkIsMidnightCrossed() {
    if (_timeObject.hasCrossedMidnight) {
      _crossedOverMidnightCount++;
    } // if midnight is passed more than once we definitely
    // need to finish


    if (_crossedOverMidnightCount > 1) {
      _finished = true;
    }
  } // when pushToEndTime is false, we begin at the start time and work our
  // way forward to the end time


  function _incrementTime() {
    _addSlotToBack(_timeObject.val, _timeObject.add(_slotDuration, _units).val);

    if (_spacer) {
      _timeObject.add(_spacer, _spacerUnits);

      _checkIsMidnightCrossed();
    }
  } // when pushToEndTime is true, we begin at the end time and work our
  // way backwards to the start time


  function _decrementTime() {
    _addSlotToFront(_timeObject.val, _timeObject.subtract(_slotDuration, _units).val);

    if (_spacer) {
      _timeObject.subtract(_spacer, _spacerUnits);

      _checkIsMidnightCrossed();
    }
  } // if no crossing over the midnight threshold is involved
  // in creating the required time-slots, this logic will
  // be used


  function _noMidnightCrossing() {
    if (_pushToEndTime) {
      while (_timeObject.val >= _start && !_finished) {
        _decrementTime();
      }
    } else {
      while (_timeObject.val <= _end && !_finished) {
        _incrementTime();
      }
    }

    return _slots;
  } // if the time-slots required involve a crossing over the midnight
  // threshhold, we need this logic before it gets to midnight


  function _crossesMidnight() {
    while (!_crossedOverMidnightCount) {
      if (_pushToEndTime) {
        _decrementTime();
      } else {
        _incrementTime();
      }
    }

    return _noMidnightCrossing();
  }

  function _addSlotToBack(pre, post) {
    _checkIsMidnightCrossed(); //we definitely don't want a slot if it begins on the end time, unless
    // the start and end times given were the same


    if (pre === _end && !(_start === _end && !_crossedOverMidnightCount)) {
      _finished = true;
    }

    if (!_includeOverflow) {
      // condition to eliminate timeslots that bridge over the end time
      if (pre < _end && post > _end) {
        _finished = true;
      } // if the end time is midnight or close to it, the post
      // and pre values may be either side of the midnight and
      // require this condition to realise the time-slots bridge
      // the end time


      if (pre > _end && post > _end && pre > post) {
        _finished = true;
      }
    }

    if (!_finished) {
      _slots.push([pre, post]);
    }
  }

  function _addSlotToFront(post, pre) {
    _checkIsMidnightCrossed(); // we definitely don't want a slot if it ends on the start time
    // the start and end times given were the same


    if (post === _start && !(_start === _end && !_crossedOverMidnightCount)) {
      _finished = true;
    }

    if (!_includeOverflow) {
      // condition to eliminate timeslots that bridge over the start time
      if (post > _start && pre < _start) {
        _finished = true;
      } // if the start time is midnight or close to it, the pre
      // and post values may be either side of the midnight and
      // require this condition to realise the time-slots bridge
      // the start time


      if (post > _start && pre > _start && post < pre) {
        _finished = true;
      }
    }

    if (!_finished) {
      _slots.unshift([pre, post]);
    }
  }

  return createTimeslots;
}();

},{"time-drift":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdGltZS1kcmlmdC9kaXN0L25vZGVfbW9kdWxlcy90aW1lLWRyaWZ0L2Rpc3Qvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy90aW1lLWRyaWZ0L2Rpc3Qvbm9kZV9tb2R1bGVzL3RpbWUtZHJpZnQvZGlzdC9zcmMvdGltZS1kcmlmdC5qcyIsInNyYy90aW1lLXNsb3R0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUNBQSx1aEJBRUEsU0FBUyxVQUFXLEVBQU0sR0FJeEIsSUFIbUIsc0JBR0gsS0FBSyxHQUNuQixNQUFNLElBQUksTUFBTSxxSUFJbEIsSUFUbUMsRUFBQSxlQVNaLEVBQUssTUFBTSxXQUFXLElBQUksU0FBQSxHQUFTLE9BQUksT0FBTyxLQVRsQyxHQVU5QixFQVY4QixFQUFBLEdBVXZCLEVBVnVCLEVBQUEsR0FVZCxFQVZjLEVBQUEsR0FhbkMsR0FBRyxFQUFRLElBQU0sRUFBUSxFQUN2QixNQUFNLElBQUksTUFBTSxrQ0FJbEIsR0FBRyxFQUFVLElBQU0sRUFBVSxFQUMzQixNQUFNLElBQUksTUFBTSxvQ0FJbEIsR0FBYyxNQUFYLElBQW9CLEVBQVUsSUFBTSxFQUFVLEdBQy9DLE1BQU0sSUFBSSxNQUFNLG9DQUlsQixHQUFHLElBQW1DLGlCQUFkLEdBQTBCLEVBQVUsT0FBUyxHQUNuRSxNQUFNLElBQUksTUFBTSx1REFJbEIsU0FBUyxFQUFhLEVBQUssR0FDekIsR0FBbUIsaUJBQVIsRUFDVCxNQUFNLElBQUksTUFBSixxQkFBQSxPQUErQixFQUEvQiw2QkFJVixTQUFTLEVBQWMsRUFBTSxHQUUzQixHQUFvQixpQkFBVCxFQUNULE1BQU0sSUFBSSxNQUFKLHNCQUFBLE9BQWdDLEVBQWhDLDJEQUtSLElBQUksRUFBVyxFQUFLLE9BQU8sR0FBRyxjQUc5QixJQUFLLENB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QUNEO0FBRUY7O0FBRUQsU0FBTyxlQUFQO0FBRUQsQ0FsTmdCLEVBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiXG5cbmZ1bmN0aW9uIHRpbWVEcmlmdCAodGltZSwgc2VwYXJhdG9yKSB7XG4gIGNvbnN0IHRpbWVGb3JtYXQgPSAvXlxcZFxcZC5cXGRcXGQoLlxcZFxcZCk/JC9cblxuICAvLyBDaGVjayB0aGF0IHRoZSB0aW1lIGZvcm1hdCBpcyBjb3JyZWN0XG4gIGlmICghdGltZUZvcm1hdC50ZXN0KHRpbWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGltZSBmb3JtYXQgaXMgaW5jb3JyZWN0LiBJdCBzaG91bGQgYmUgZWl0aGVyICdISDpNTTpTUycgb3IgJ0hIOk1NJywgXFxcbndoZXJlIHRoZSBjb2xvbiBjYW4gYmUgcmVwbGFjZWQgYnkgYSBub24tbnVtZXJpY2FsIGNoYXJhY3RlclwiKVxuICB9XG5cbiAgY29uc3QgdGltZUNvbXBvbmVudHMgPSB0aW1lLnNwbGl0KC9bLjpcXC0gXS8pLm1hcChjb21wb25lbnQgPT4gTnVtYmVyKGNvbXBvbmVudCkpXG4gIGxldCBbaG91cnMsIG1pbnV0ZXMsIHNlY29uZHNdID0gdGltZUNvbXBvbmVudHNcblxuICAvLyBjaGVjayBob3VycyBhcmUgd2l0aGluIHZhbGlkIHJhbmdlXG4gIGlmKGhvdXJzID4gMjMgfHwgaG91cnMgPCAwKXtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0hvdXJzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCAyMycpXG4gIH1cblxuICAvLyBjaGVjayBtaW51dGVzIGFyZSB3aXRoaW4gdmFsaWQgcmFuZ2VcbiAgaWYobWludXRlcyA+IDU5IHx8IG1pbnV0ZXMgPCAwKXtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01pbnV0ZXMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDU5JylcbiAgfVxuXG4gIC8vIGNoZWNrIHNlY29uZHMgYXJlIHdpdGhpbiB2YWxpZCByYW5nZVxuICBpZihzZWNvbmRzICE9IG51bGwgJiYgKHNlY29uZHMgPiA1OSB8fCBzZWNvbmRzIDwgMCkpe1xuICAgIHRocm93IG5ldyBFcnJvcignU2Vjb25kcyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgNTknKVxuICB9XG5cbiAgLy8gY2hlY2sgc2VwYXJhdG9yIGlzIHNpbmdsZSBub24tbnVtZXJpY2FsIGNoYXJhY3RlclxuICBpZihzZXBhcmF0b3IgJiYgKHR5cGVvZiBzZXBhcmF0b3IgIT09ICdzdHJpbmcnIHx8IHNlcGFyYXRvci5sZW5ndGggPiAxKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignU2VwYXJhdG9yIG11c3QgYmUgYSBzaW5nbGUsIG5vbi1udW1lcmljYWwgY2hhcmFjdGVyJylcbiAgfVxuXG4gIC8vIGNoZWNrIHRoYXQgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBhZGQgYW5kIHN1YnRyYWN0IG1ldGhvZHMgaXMgYSBudW1iZXJcbiAgZnVuY3Rpb24gdmFsaWRhdGVOdW0gKG51bSwgbWV0aG9kKSB7XG4gICAgaWYgKHR5cGVvZiBudW0gIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZpcnN0IGFyZ3VtZW50IG9mICR7bWV0aG9kfSBtZXRob2QgbXVzdCBiZSBhIG51bWJlcmApXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVVbml0ICh1bml0LCBtZXRob2QpIHtcbiAgICAvLyBjaGVjayB0aGF0IHRoZSB1bml0IGlzIGEgc3RyaW5nXG4gICAgaWYgKHR5cGVvZiB1bml0ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZWNvbmQgYXJndW1lbnQgb2YgJHttZXRob2R9IG1ldGhvZCBtdXN0IGJlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdW5pdCBvZiB0aW1lYClcbiAgICB9XG5cbiAgICAvLyBqdXN0IGdyYWIgdGhlIGZpcnN0IGxldHRlciBvZiB0aGUgdW5pdCBhbmQgbG93ZXJjYXNlIGl0LiBUaGlzIGlzIGVub3VnaCB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuXG4gICAgLy8gdW5pdHNcbiAgICBsZXQgdW5pdENoYXIgPSB1bml0LmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpXG5cbiAgICAvLyBjaGVjayB0aGUgdGltZSB1bml0IHVzZWQgYmVnaW5zIHdpdGggdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgd29yZHMgJ2hvdXJzJywgJ21pbnV0ZXMnLCBvciAnc2Vjb25kcydcbiAgICBpZiAoIVsnaCcsJ20nLCdzJ10uaW5jbHVkZXModW5pdENoYXIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlY29uZCBhcmd1bWVudCBvZiAke21ldGhvZH0gbWV0aG9kIG11c3QgYmUgaG91cnMsIG1pbnV0ZXMgb3Igc2Vjb25kc2ApXG4gICAgfVxuXG4gICAgLy8gZW5zdXJlIHRoYXQgbm8gY2FsY3VsYXRpb25zIGludm9sdmluZyBzZWNvbmRzIGNhbiBiZSBwZXJmb3JtZWQgaWYgbm8gc2Vjb25kcyB3ZXJlIHN0YXRlZCBpbiB0aGVcbiAgICAvLyBvcmlnaW5hbCB0aW1lIHRvIGJlIGNoYW5nZWRcbiAgICBpZiAodW5pdENoYXIgPT09ICdzJyAmJiBzZWNvbmRzID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWW91IGNhbid0IGFkanVzdCBzZWNvbmRzIGlmIHRoZXkgd2VyZW4ndCBpbmNsdWRlZCBpbiB0aGUgb3JpZ2luYWwgdGltZSBnaXZlbmApXG4gICAgfVxuXG4gICAgcmV0dXJuIHVuaXRDaGFyXG4gIH1cblxuICBjb25zdCByZXNwb25zZSA9IHtcbiAgICBub3JtYWxpemUgKHJldHVybkFycmF5KSB7XG4gICAgICAvLyBpZiBubyBzZWNvbmRzIHdlcmUgaW5jbHVkZWQsIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBsYXN0IGVsZW1lbnQgb2YgdGhlIGFycmF5XG4gICAgICAvLyB3aGljaCB3aWxsIGJlIHVuZGVmaW5lZFxuICAgICAgaWYgKHNlY29uZHMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm5BcnJheS5wb3AoKVxuICAgICAgfVxuXG4gICAgICAvLyBGb3IgZWFjaCBwYXJ0IG9mIHRoZSB0aW1lLCBlbnN1cmUgdGhhdCBpZiBpdCBpcyBsZXNzXG4gICAgICAvLyB0aGFuIDEwLCB0aGF0IGl0IGhhcyBhIHByZWNlZGluZyAwXG4gICAgICByZXR1cm4gcmV0dXJuQXJyYXkubWFwKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgICBwYXJ0ID0gU3RyaW5nKHBhcnQpXG4gICAgICAgIHJldHVybiBwYXJ0Lmxlbmd0aCA8IDIgPyAnMCcgKyBwYXJ0IDogcGFydFxuICAgICAgfSkuam9pbihzZXBhcmF0b3IgfHwgJzonKVxuICAgIH0sXG5cbiAgICBoYXNDcm9zc2VkTWlkbmlnaHQ6IGZhbHNlLFxuXG4gICAgLy8gVGhpcyBpcyBhIHNlbGYtcmVmZXJlbmNpbmcgbWV0aG9kXG4gICAgYWRkIChudW0sIHVuaXQpIHtcbiAgICAgIHZhbGlkYXRlTnVtKG51bSwgJ2FkZCcpXG4gICAgICB0aGlzLmhhc0Nyb3NzZWRNaWRuaWdodCA9IGZhbHNlXG4gICAgICBjb25zdCB1bml0Rmlyc3RDaGFyID0gdmFsaWRhdGVVbml0KHVuaXQsICdhZGQnKVxuICAgICAgc3dpdGNoKHVuaXRGaXJzdENoYXIpe1xuICAgICAgY2FzZSAnaCc6XG4gICAgICAgIHRoaXMuaGFzQ3Jvc3NlZE1pZG5pZ2h0ID0gQm9vbGVhbihNYXRoLmZsb29yKChob3VycyArIG51bSkvMjQpKVxuICAgICAgICBob3VycyA9IChob3VycyArIG51bSkgJSAyNFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnbSc6XG4gICAgICAgIGxldCBob3Vyc1RvQWRkID0gTWF0aC5mbG9vcigobWludXRlcyArIG51bSkvNjApXG4gICAgICAgIG1pbnV0ZXMgPSAobWludXRlcyArIG51bSkgJSA2MFxuICAgICAgICB0aGlzLmFkZChob3Vyc1RvQWRkLCAnaCcpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzJzpcbiAgICAgICAgbGV0IG1pbnV0ZXNUb0FkZCA9IE1hdGguZmxvb3IoKHNlY29uZHMgKyBudW0pLzYwKVxuICAgICAgICBzZWNvbmRzID0gKHNlY29uZHMgKyBudW0pICUgNjBcbiAgICAgICAgdGhpcy5hZGQobWludXRlc1RvQWRkLCAnbScpXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICAvLyBUaGlzIGlzIGEgc2VsZi1yZWZlcmVuY2luZyBtZXRob2RcbiAgICBzdWJ0cmFjdCAobnVtLCB1bml0KSB7XG4gICAgICB2YWxpZGF0ZU51bShudW0sICdzdWJ0cmFjdCcpXG4gICAgICB0aGlzLmhhc0Nyb3NzZWRNaWRuaWdodCA9IGZhbHNlXG4gICAgICBjb25zdCB1bml0Rmlyc3RDaGFyID0gdmFsaWRhdGVVbml0KHVuaXQsICdzdWJ0cmFjdCcpXG4gICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgc3dpdGNoKHVuaXRGaXJzdENoYXIpe1xuICAgICAgY2FzZSAnaCc6XG4gICAgICAgIGxldCBob3VyQW5zd2VyID0gaG91cnMgLSBudW1cbiAgICAgICAgd2hpbGUoaG91ckFuc3dlciA8IDApe1xuICAgICAgICAgIGNvdW50ICsrXG4gICAgICAgICAgaG91ckFuc3dlciA9IDI0ICsgaG91ckFuc3dlclxuICAgICAgICB9XG4gICAgICAgIGhvdXJzID0gaG91ckFuc3dlclxuICAgICAgICBpZiAoY291bnQpIHtcbiAgICAgICAgICB0aGlzLmhhc0Nyb3NzZWRNaWRuaWdodCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnbSc6XG4gICAgICAgIGxldCBtaW51dGVBbnN3ZXIgPSBtaW51dGVzIC0gbnVtXG4gICAgICAgIHdoaWxlKG1pbnV0ZUFuc3dlciA8IDApe1xuICAgICAgICAgIGNvdW50ICsrXG4gICAgICAgICAgbWludXRlQW5zd2VyID0gNjAgKyBtaW51dGVBbnN3ZXJcbiAgICAgICAgfVxuICAgICAgICBtaW51dGVzID0gbWludXRlQW5zd2VyXG4gICAgICAgIGlmKGNvdW50KXtcbiAgICAgICAgICB0aGlzLnN1YnRyYWN0KGNvdW50LCAnaCcpXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3MnOlxuICAgICAgICBsZXQgc2Vjb25kQW5zd2VyID0gc2Vjb25kcyAtIG51bVxuICAgICAgICB3aGlsZShzZWNvbmRBbnN3ZXIgPCAwKXtcbiAgICAgICAgICBjb3VudCArK1xuICAgICAgICAgIHNlY29uZEFuc3dlciA9IDYwICsgc2Vjb25kQW5zd2VyXG4gICAgICAgIH1cbiAgICAgICAgc2Vjb25kcyA9IHNlY29uZEFuc3dlclxuICAgICAgICBpZihjb3VudCl7XG4gICAgICAgICAgdGhpcy5zdWJ0cmFjdChjb3VudCwgJ20nKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXNwb25zZSwgJ3ZhbCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZShbaG91cnMsIG1pbnV0ZXMsIHNlY29uZHNdKVxuICAgIH1cbiAgfSlcblxuICByZXNwb25zZS5hZGQgPSByZXNwb25zZS5hZGQuYmluZChyZXNwb25zZSlcbiAgcmVzcG9uc2Uuc3VidHJhY3QgPSByZXNwb25zZS5zdWJ0cmFjdC5iaW5kKHJlc3BvbnNlKVxuXG4gIHJldHVybiByZXNwb25zZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRpbWVEcmlmdCIsImNvbnN0IHRpbWVEcmlmdCA9IHJlcXVpcmUoJ3RpbWUtZHJpZnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHdhcm5Nc2cgPSB7XG4gICAgRFVSQVRJT05fVE9PX0xBUkdFOiAnVGhlIGR1cmF0aW9uIGlzIHRvbyBsYXJnZSB0byBjcmVhdGUgZXZlbiBvbmUgdGltZS1zbG90IHdpdGhpbiB0aGUgdGltZXMgZ2l2ZW4nXG4gIH1cblxuICBjb25zdCBlcnJNc2cgPSB7XG4gICAgTk9fRFVSQVRJT046ICdZb3UgbXVzdCBpbmNsdWRlIGEgcG9zaXRpdmUgZHVyYXRpb24gdmFsdWUgYXMgdGhlIHRoaXJkIGFyZ3VtZW50JyxcbiAgICBNSVNTSU5HX0FSR1M6ICdZb3UgbXVzdCBlbnRlciBhIHN0YXJ0IGFuZCBhbiBlbmQgdmFsdWUgYXMgdGhlIGZpcnN0IGFuZCBzZWNvbmQgYXJndW1lbnRzJ1xuICB9XG5cbiAgbGV0IF90aW1lT2JqZWN0ID0ge30sXG4gICAgICBfc2xvdER1cmF0aW9uLFxuICAgICAgX3N0YXJ0LFxuICAgICAgX2VuZCxcbiAgICAgIF9zbG90cyxcbiAgICAgIF91bml0cyxcbiAgICAgIF9jcm9zc2VkT3Zlck1pZG5pZ2h0Q291bnQsXG4gICAgICBfc3BhY2VyLFxuICAgICAgX3NwYWNlclVuaXRzLFxuICAgICAgX3B1c2hUb0VuZFRpbWUsXG4gICAgICBfaW5jbHVkZU92ZXJmbG93LFxuICAgICAgX2ZpbmlzaGVkXG5cbiAgZnVuY3Rpb24gY3JlYXRlVGltZXNsb3RzKHN0YXJ0LCBlbmQsIHNsb3REdXJhdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFzdGFydCB8fCAhZW5kKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnLk1JU1NJTkdfQVJHUylcbiAgICB9XG4gICAgaWYgKCFzbG90RHVyYXRpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cuTk9fRFVSQVRJT04pXG4gICAgfVxuICAgIC8vIHRoaXMgd2lsbCBiZSBhIHNpbmdsZXRvbiBpbiBhIG5vZGUgYXBwLCBzbyBpdCBpcyBpbXBvcnRhbnRcbiAgICAvLyB0byByZXNldCBhbGwgdGhlIHZhcmlhYmxlcyBzbyB0aGF0IG9uZSBpbnZvY2F0aW9uIGRvZXNuJ3RcbiAgICAvLyBlZmZlY3QgYW5vdGhlclxuICAgIGxldCBpbml0aWFsVGltZSA9IG9wdGlvbnMucHVzaFRvRW5kVGltZSA/IGVuZCA6IHN0YXJ0XG4gICAgX3Nsb3RzID0gW11cbiAgICBfZmluaXNoZWQgPSBmYWxzZVxuICAgIF9jcm9zc2VkT3Zlck1pZG5pZ2h0Q291bnQgPSAwXG4gICAgX3RpbWVPYmplY3QgPSB0aW1lRHJpZnQoaW5pdGlhbFRpbWUsIG9wdGlvbnMuZGVsaW1pdGVyKVxuICAgIF9zbG90RHVyYXRpb24gPSBzbG90RHVyYXRpb25cbiAgICBfdW5pdHMgPSBvcHRpb25zLnVuaXRzIHx8ICdtJ1xuICAgIF9wdXNoVG9FbmRUaW1lID0gb3B0aW9ucy5wdXNoVG9FbmRUaW1lIHx8IGZhbHNlXG4gICAgX3NwYWNlciA9IG9wdGlvbnMuc3BhY2VyXG4gICAgX3NwYWNlclVuaXRzID0gb3B0aW9ucy5zcGFjZXJVbml0cyB8fCAnbSdcbiAgICBfaW5jbHVkZU92ZXJmbG93ID0gb3B0aW9ucy5pbmNsdWRlT3ZlcmZsb3dcblxuICAgIC8vIEkgcHV0IHRoZSBzdGFydCBhbmQgZW5kIHRocm91Z2ggdGhlIHRpbWVEcmlmdCBwYWNrYWdlXG4gICAgLy8gdG8gZW5zdXJlIHRoZXkgaGF2ZSB0aGUgc2FtZSBmb3JtYXQsIHNvIHRoYXQgY29tcGFyaW5nXG4gICAgLy8gaXNuJ3QgZWZmZWN0ZWQgYnkgZGlmZmVyZW50IGRlbGltaXRlcnNcbiAgICBfc3RhcnQgPSB0aW1lRHJpZnQoc3RhcnQsIG9wdGlvbnMuZGVsaW1pdGVyKS52YWxcbiAgICBfZW5kID0gdGltZURyaWZ0KGVuZCwgb3B0aW9ucy5kZWxpbWl0ZXIpLnZhbFxuXG4gICAgX2NoZWNrSXNWYWxpZCgpXG5cbiAgICBfc2xvdHMgPSBzdGFydCA8IGVuZCA/IF9ub01pZG5pZ2h0Q3Jvc3NpbmcoKSA6IF9jcm9zc2VzTWlkbmlnaHQoKTtcblxuICAgIGlmIChvcHRpb25zLmpvaW5Pbikge1xuICAgICAgcmV0dXJuIF9zbG90cy5tYXAoc2xvdFBhaXIgPT4gc2xvdFBhaXIuam9pbihvcHRpb25zLmpvaW5PbikpXG4gICAgfVxuXG4gICAgcmV0dXJuIF9zbG90c1xuICB9XG5cbiAgLy8gZmluaXNoIGltbWVkaWF0ZWx5IGlmIHRoZSBfc2xvdER1cmF0aW9uIGlzIHRvbyBzbWFsbCBmb3IgZXZlblxuICAvLyBvbmUgdGltZS1zbG90XG4gIGZ1bmN0aW9uIF9jaGVja0lzVmFsaWQoKSB7XG4gICAgY29uc3QgdGVzdFRpbWUgPSB0aW1lRHJpZnQoX3N0YXJ0KS5hZGQoX3Nsb3REdXJhdGlvbiwgIF91bml0cylcbiAgICBpZiAoX3N0YXJ0IDwgX2VuZCkge1xuICAgICAgaWYgKHRlc3RUaW1lLnZhbCA+IF9lbmQgfHwgdGVzdFRpbWUuaGFzQ3Jvc3NlZE1pZG5pZ2h0KSB7XG4gICAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICAgICAgY29uc29sZS53YXJuKHdhcm5Nc2cuRFVSQVRJT05fVE9PX0xBUkdFKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGVzdFRpbWUudmFsID4gX2VuZCAmJiB0ZXN0VGltZS5oYXNDcm9zc2VkTWlkbmlnaHQpIHtcbiAgICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICBjb25zb2xlLndhcm4od2Fybk1zZy5EVVJBVElPTl9UT09fTEFSR0UpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2NoZWNrSXNNaWRuaWdodENyb3NzZWQgKCkge1xuXG4gICAgaWYgKF90aW1lT2JqZWN0Lmhhc0Nyb3NzZWRNaWRuaWdodCkge1xuICAgICAgX2Nyb3NzZWRPdmVyTWlkbmlnaHRDb3VudCArK1xuICAgIH1cblxuICAgIC8vIGlmIG1pZG5pZ2h0IGlzIHBhc3NlZCBtb3JlIHRoYW4gb25jZSB3ZSBkZWZpbml0ZWx5XG4gICAgLy8gbmVlZCB0byBmaW5pc2hcbiAgICBpZiAoX2Nyb3NzZWRPdmVyTWlkbmlnaHRDb3VudCA+IDEpIHtcbiAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICB9XG5cbiAgfVxuXG4gIC8vIHdoZW4gcHVzaFRvRW5kVGltZSBpcyBmYWxzZSwgd2UgYmVnaW4gYXQgdGhlIHN0YXJ0IHRpbWUgYW5kIHdvcmsgb3VyXG4gIC8vIHdheSBmb3J3YXJkIHRvIHRoZSBlbmQgdGltZVxuICBmdW5jdGlvbiBfaW5jcmVtZW50VGltZSgpIHtcbiAgICBfYWRkU2xvdFRvQmFjayhfdGltZU9iamVjdC52YWwsIF90aW1lT2JqZWN0LmFkZChfc2xvdER1cmF0aW9uLCBfdW5pdHMpLnZhbClcblxuICAgIGlmIChfc3BhY2VyKSB7XG4gICAgICBfdGltZU9iamVjdC5hZGQoX3NwYWNlciwgX3NwYWNlclVuaXRzKVxuICAgICAgX2NoZWNrSXNNaWRuaWdodENyb3NzZWQgKClcbiAgICB9XG4gIH1cblxuICAvLyB3aGVuIHB1c2hUb0VuZFRpbWUgaXMgdHJ1ZSwgd2UgYmVnaW4gYXQgdGhlIGVuZCB0aW1lIGFuZCB3b3JrIG91clxuICAvLyB3YXkgYmFja3dhcmRzIHRvIHRoZSBzdGFydCB0aW1lXG4gIGZ1bmN0aW9uIF9kZWNyZW1lbnRUaW1lKCkge1xuICAgIF9hZGRTbG90VG9Gcm9udChfdGltZU9iamVjdC52YWwsIF90aW1lT2JqZWN0LnN1YnRyYWN0KF9zbG90RHVyYXRpb24sIF91bml0cykudmFsKVxuXG4gICAgaWYgKF9zcGFjZXIpIHtcbiAgICAgIF90aW1lT2JqZWN0LnN1YnRyYWN0KF9zcGFjZXIsIF9zcGFjZXJVbml0cylcbiAgICAgIF9jaGVja0lzTWlkbmlnaHRDcm9zc2VkICgpXG4gICAgfVxuICB9XG5cbiAgLy8gaWYgbm8gY3Jvc3Npbmcgb3ZlciB0aGUgbWlkbmlnaHQgdGhyZXNob2xkIGlzIGludm9sdmVkXG4gIC8vIGluIGNyZWF0aW5nIHRoZSByZXF1aXJlZCB0aW1lLXNsb3RzLCB0aGlzIGxvZ2ljIHdpbGxcbiAgLy8gYmUgdXNlZFxuICBmdW5jdGlvbiBfbm9NaWRuaWdodENyb3NzaW5nKCkge1xuXG4gICAgaWYgKF9wdXNoVG9FbmRUaW1lKSB7XG4gICAgICB3aGlsZSAoKF90aW1lT2JqZWN0LnZhbCA+PSBfc3RhcnQpICYmICFfZmluaXNoZWQpIHtcbiAgICAgICAgX2RlY3JlbWVudFRpbWUoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAoKF90aW1lT2JqZWN0LnZhbCA8PSBfZW5kKSAmJiAhX2ZpbmlzaGVkKSB7XG4gICAgICAgIF9pbmNyZW1lbnRUaW1lKClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9zbG90c1xuICB9XG5cbiAgLy8gaWYgdGhlIHRpbWUtc2xvdHMgcmVxdWlyZWQgaW52b2x2ZSBhIGNyb3NzaW5nIG92ZXIgdGhlIG1pZG5pZ2h0XG4gIC8vIHRocmVzaGhvbGQsIHdlIG5lZWQgdGhpcyBsb2dpYyBiZWZvcmUgaXQgZ2V0cyB0byBtaWRuaWdodFxuICBmdW5jdGlvbiBfY3Jvc3Nlc01pZG5pZ2h0KCkge1xuICAgIHdoaWxlICghX2Nyb3NzZWRPdmVyTWlkbmlnaHRDb3VudCkge1xuICAgICAgaWYgKF9wdXNoVG9FbmRUaW1lKSB7XG4gICAgICAgIF9kZWNyZW1lbnRUaW1lKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9pbmNyZW1lbnRUaW1lKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX25vTWlkbmlnaHRDcm9zc2luZygpXG4gIH1cblxuICBmdW5jdGlvbiBfYWRkU2xvdFRvQmFjayhwcmUsIHBvc3QpIHtcbiAgICBfY2hlY2tJc01pZG5pZ2h0Q3Jvc3NlZCgpXG5cbiAgICAvL3dlIGRlZmluaXRlbHkgZG9uJ3Qgd2FudCBhIHNsb3QgaWYgaXQgYmVnaW5zIG9uIHRoZSBlbmQgdGltZSwgdW5sZXNzXG4gICAgLy8gdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXMgZ2l2ZW4gd2VyZSB0aGUgc2FtZVxuICAgIGlmIChwcmUgPT09IF9lbmQgJiYgIShfc3RhcnQgPT09IF9lbmQgJiYgIV9jcm9zc2VkT3Zlck1pZG5pZ2h0Q291bnQpKSB7XG4gICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgfVxuXG5cblxuICAgIGlmICghX2luY2x1ZGVPdmVyZmxvdykge1xuXG4gICAgICAvLyBjb25kaXRpb24gdG8gZWxpbWluYXRlIHRpbWVzbG90cyB0aGF0IGJyaWRnZSBvdmVyIHRoZSBlbmQgdGltZVxuICAgICAgaWYgKHByZSA8IF9lbmQgJiYgcG9zdCA+IF9lbmQpIHtcbiAgICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICAvLyBpZiB0aGUgZW5kIHRpbWUgaXMgbWlkbmlnaHQgb3IgY2xvc2UgdG8gaXQsIHRoZSBwb3N0XG4gICAgICAvLyBhbmQgcHJlIHZhbHVlcyBtYXkgYmUgZWl0aGVyIHNpZGUgb2YgdGhlIG1pZG5pZ2h0IGFuZFxuICAgICAgLy8gcmVxdWlyZSB0aGlzIGNvbmRpdGlvbiB0byByZWFsaXNlIHRoZSB0aW1lLXNsb3RzIGJyaWRnZVxuICAgICAgLy8gdGhlIGVuZCB0aW1lXG4gICAgICBpZiAoKHByZSA+IF9lbmQgJiYgcG9zdCA+IF9lbmQpICYmIHByZSA+IHBvc3QpIHtcbiAgICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghX2ZpbmlzaGVkKSB7XG4gICAgICBfc2xvdHMucHVzaChbcHJlLCBwb3N0XSlcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfYWRkU2xvdFRvRnJvbnQgKHBvc3QsIHByZSkge1xuICAgIF9jaGVja0lzTWlkbmlnaHRDcm9zc2VkKClcblxuICAgIC8vIHdlIGRlZmluaXRlbHkgZG9uJ3Qgd2FudCBhIHNsb3QgaWYgaXQgZW5kcyBvbiB0aGUgc3RhcnQgdGltZVxuICAgIC8vIHRoZSBzdGFydCBhbmQgZW5kIHRpbWVzIGdpdmVuIHdlcmUgdGhlIHNhbWVcbiAgICBpZiAocG9zdCA9PT0gX3N0YXJ0ICYmICEoX3N0YXJ0ID09PSBfZW5kICYmICFfY3Jvc3NlZE92ZXJNaWRuaWdodENvdW50KSkge1xuICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmICghX2luY2x1ZGVPdmVyZmxvdykge1xuICAgICAgLy8gY29uZGl0aW9uIHRvIGVsaW1pbmF0ZSB0aW1lc2xvdHMgdGhhdCBicmlkZ2Ugb3ZlciB0aGUgc3RhcnQgdGltZVxuICAgICAgaWYgKHBvc3QgPiBfc3RhcnQgJiYgcHJlIDwgX3N0YXJ0KSB7XG4gICAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhlIHN0YXJ0IHRpbWUgaXMgbWlkbmlnaHQgb3IgY2xvc2UgdG8gaXQsIHRoZSBwcmVcbiAgICAgIC8vIGFuZCBwb3N0IHZhbHVlcyBtYXkgYmUgZWl0aGVyIHNpZGUgb2YgdGhlIG1pZG5pZ2h0IGFuZFxuICAgICAgLy8gcmVxdWlyZSB0aGlzIGNvbmRpdGlvbiB0byByZWFsaXNlIHRoZSB0aW1lLXNsb3RzIGJyaWRnZVxuICAgICAgLy8gdGhlIHN0YXJ0IHRpbWVcbiAgICAgIGlmICgocG9zdCA+IF9zdGFydCAmJiBwcmUgPiBfc3RhcnQpICYmIHBvc3QgPCBwcmUpIHtcbiAgICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghX2ZpbmlzaGVkKSB7XG4gICAgICBfc2xvdHMudW5zaGlmdChbcHJlLCBwb3N0XSlcbiAgICB9XG5cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVUaW1lc2xvdHNcblxufSkoKSJdfQ==
