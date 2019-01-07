(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeSlotter = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeDrift = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";function timeDrift(t,e){if(!/^\d\d.\d\d(.\d\d)?$/.test(t))throw new Error("Time format is incorrect. It should be either 'HH:MM:SS' or 'HH:MM', where the colon can be replaced by a non-numerical character");const r=t.split(/[.:\- ]/).map(t=>Number(t));let[n,o,s]=r;if(n>23||n<0)throw new Error("Hours must be between 0 and 23");if(o>59||o<0)throw new Error("Minutes must be between 0 and 59");if(null!=s&&(s>59||s<0))throw new Error("Seconds must be between 0 and 59");if(e&&("string"!=typeof e||e.length>1))throw new Error("Separator must be a single, non-numerical character");function i(t,e){if("number"!=typeof t)throw new Error(`First argument of ${e} method must be a number`)}function a(t,e){if("string"!=typeof t)throw new Error(`Second argument of ${e} method must be a string representing the unit of time`);let r=t.charAt(0).toLowerCase();if(!["h","m","s"].includes(r))throw new Error(`Second argument of ${e} method must be hours, minutes or seconds`);if("s"===r&&null==s)throw new Error("You can't adjust seconds if they weren't included in the original time given");return r}const h={normalize:t=>(null==s&&t.pop(),t.map(function(t){return(t=String(t)).length<2?"0"+t:t}).join(e||":")),hasCrossedMidnight:!1,add(t,e){switch(i(t,"add"),a(e,"add")){case"h":this.hasCrossedMidnight=Boolean(Math.floor((n+t)/24)),n=(n+t)%24;break;case"m":let r=Math.floor((o+t)/60);o=(o+t)%60,this.add(r,"h");break;case"s":let h=Math.floor((s+t)/60);s=(s+t)%60,this.add(h,"m")}return this},subtract(t,e){i(t,"subtract");let r=0;switch(a(e,"subtract")){case"h":let i=n-t;for(;i<0;)r++,i=24+i;n=i,r&&(this.hasCrossedMidnight=!0);break;case"m":let h=o-t;for(;h<0;)r++,h=60+h;o=h,r&&this.subtract(r,"h");break;case"s":let u=s-t;for(;u<0;)r++,u=60+u;s=u,r&&this.subtract(r,"m")}return this}};return Object.defineProperty(h,"val",{get:function(){return this.normalize([n,o,s])}}),h.add=h.add.bind(h),h.subtract=h.subtract.bind(h),h}module.exports=timeDrift;

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
    NO_DURATION: 'You must include a positive duration value as the third argument'
  };

  var _timeObject = {},
      _slotDuration,
      _start,
      _end,
      _slots,
      _units,
      _hasEverCrossedMidnight,
      _spacer,
      _spacerUnits,
      _pushToEndTime,
      _includeOverflow,
      _finished;

  function createTimeslots(start, end, slotDuration) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (!slotDuration) {
      throw new Error(errMsg.NO_DURATION);
    } // this will be a singleton in a node app, so it is important
    // to reset all the variables so that one invocation doesn't
    // effect another


    var initialTime = options.pushToEndTime ? end : start;
    _slots = [];
    _finished = false;
    _hasEverCrossedMidnight = false;
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
      _hasEverCrossedMidnight = true;
    }
  } // when pushToEndTime is false, we begin at the start time and work our
  // way forward to the end time


  function _incrementTime() {
    _addSlotToBack(_timeObject.val, _timeObject.add(_slotDuration, _units).val);

    if (_spacer) {
      _timeObject.add(_spacer, _spacerUnits);
    }

    _checkIsMidnightCrossed();
  } // when pushToEndTime is true, we begin at the end time and work our
  // way backwards to the start time


  function _decrementTime() {
    _addSlotToFront(_timeObject.val, _timeObject.subtract(_slotDuration, _units).val);

    if (_spacer) {
      _timeObject.subtract(_spacer, _spacerUnits);
    }

    _checkIsMidnightCrossed();
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
    while (!_hasEverCrossedMidnight) {
      if (_pushToEndTime) {
        _decrementTime();
      } else {
        _incrementTime();
      }
    }

    return _noMidnightCrossing();
  }

  function _addSlotToBack(pre, post) {
    //we definitely don't want a slot if it begins on the end time, unless
    // the start and end times given were the same
    if (pre === _end && !(_start === _end && !_hasEverCrossedMidnight)) {
      _finished = true;
    }

    _checkIsMidnightCrossed();

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

  function _addSlotToFront(pre, post) {
    // we definitely don't want a slot if it ends on the start time
    // the start and end times given were the same
    if (pre === _start && !(_start === _end && !_hasEverCrossedMidnight)) {
      _finished = true;
    }

    _checkIsMidnightCrossed();

    if (!_includeOverflow) {
      // condition to eliminate timeslots that bridge over the start time
      if (pre > _start && post < _start) {
        _finished = true;
      } // if the start time is midnight or close to it, the post
      // and pre values may be either side of the midnight and
      // require this condition to realise the time-slots bridge
      // the start time


      if (pre > _start && post > _start && pre < post) {
        _finished = true;
      }
    }

    if (!_finished) {
      _slots.unshift([post, pre]);
    }
  }

  return createTimeslots;
}();

},{"time-drift":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdGltZS1kcmlmdC9kaXN0L25vZGVfbW9kdWxlcy90aW1lLWRyaWZ0L2Rpc3Qvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy90aW1lLWRyaWZ0L2Rpc3Qvbm9kZV9tb2R1bGVzL3RpbWUtZHJpZnQvZGlzdC9zcmMvdGltZS1kcmlmdC5qcyIsInNyYy90aW1lLXNsb3R0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUNBQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ0ZBLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxZQUFELENBQXpCOztBQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQWtCLFlBQVk7QUFDNUIsTUFBTSxPQUFPLEdBQUc7QUFDZCxJQUFBLGtCQUFrQixFQUFFO0FBRE4sR0FBaEI7QUFJQSxNQUFNLE1BQU0sR0FBRztBQUNiLElBQUEsV0FBVyxFQUFFO0FBREEsR0FBZjs7QUFJQSxNQUFJLFdBQVcsR0FBRyxFQUFsQjtBQUFBLE1BQ0ksYUFESjtBQUFBLE1BRUksTUFGSjtBQUFBLE1BR0ksSUFISjtBQUFBLE1BSUksTUFKSjtBQUFBLE1BS0ksTUFMSjtBQUFBLE1BTUksdUJBTko7QUFBQSxNQU9JLE9BUEo7QUFBQSxNQVFJLFlBUko7QUFBQSxNQVNJLGNBVEo7QUFBQSxNQVVJLGdCQVZKO0FBQUEsTUFXSSxTQVhKOztBQWFBLFdBQVMsZUFBVCxDQUF5QixLQUF6QixFQUFnQyxHQUFoQyxFQUFxQyxZQUFyQyxFQUFpRTtBQUFBLFFBQWQsT0FBYyx1RUFBSixFQUFJOztBQUMvRCxRQUFJLENBQUMsWUFBTCxFQUFtQjtBQUNqQixZQUFNLElBQUksS0FBSixDQUFVLE1BQU0sQ0FBQyxXQUFqQixDQUFOO0FBQ0QsS0FIOEQsQ0FJL0Q7QUFDQTtBQUNBOzs7QUFDQSxRQUFJLFdBQVcsR0FBRyxP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LElBQUksR0FBRyxJQUF0QixJQUErQixHQUFHLEdBQUcsSUFBekMsRUFBK0M7QUFDN0MsUUFBQSxTQUFTLEdBQUcsSUFBWjtBQUNEO0FBQ0Y7O0FBRUQsUUFBSSxDQUFDLFNBQUwsRUFBZ0I7QUFDZCxNQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQyxHQUFELEVBQU0sSUFBTixDQUFaO0FBQ0Q7QUFDRjs7QUFFRCxXQUFTLGVBQVQsQ0FBMEIsR0FBMUIsRUFBK0IsSUFBL0IsRUFBcUM7QUFFbkM7QUFDQTtBQUNBLFFBQUksR0FBRyxLQUFLLE1BQVIsSUFBa0IsRUFBRSxNQUFNLEtBQUssSUFBWCxJQUFtQixDQUFDLHVCQUF0QixDQUF0QixFQUFzRTtBQUNwRSxNQUFBLFNBQVMsR0FBRyxJQUFaO0FBQ0Q7O0FBRUQsSUFBQSx1QkFBdUI7O0FBRXZCLFFBQUksQ0FBQyxnQkFBTCxFQUF1QjtBQUNyQjtBQUNBLFVBQUksR0FBRyxHQUFHLE1BQU4sSUFBZ0IsSUFBSSxHQUFHLE1BQTNCLEVBQW1DO0FBQ2pDLFFBQUEsU0FBUyxHQUFHLElBQVo7QUFDRCxPQUpvQixDQU1yQjtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsVUFBSyxHQUFHLEdBQUcsTUFBTixJQUFnQixJQUFJLEdBQUcsTUFBeEIsSUFBbUMsR0FBRyxHQUFHLElBQTdDLEVBQW1EO0FBQ2pELFFBQUEsU0FBUyxHQUFHLElBQVo7QUFDRDtBQUNGOztBQUVELFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQ2QsTUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLENBQUMsSUFBRCxFQUFPLEdBQVAsQ0FBZjtBQUNEO0FBQ0Y7O0FBRUQsU0FBTyxlQUFQO0FBRUQsQ0FyTWdCLEVBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiO2Z1bmN0aW9uIHRpbWVEcmlmdCh0LGUpe2lmKCEvXlxcZFxcZC5cXGRcXGQoLlxcZFxcZCk/JC8udGVzdCh0KSl0aHJvdyBuZXcgRXJyb3IoXCJUaW1lIGZvcm1hdCBpcyBpbmNvcnJlY3QuIEl0IHNob3VsZCBiZSBlaXRoZXIgJ0hIOk1NOlNTJyBvciAnSEg6TU0nLCB3aGVyZSB0aGUgY29sb24gY2FuIGJlIHJlcGxhY2VkIGJ5IGEgbm9uLW51bWVyaWNhbCBjaGFyYWN0ZXJcIik7Y29uc3Qgcj10LnNwbGl0KC9bLjpcXC0gXS8pLm1hcCh0PT5OdW1iZXIodCkpO2xldFtuLG8sc109cjtpZihuPjIzfHxuPDApdGhyb3cgbmV3IEVycm9yKFwiSG91cnMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDIzXCIpO2lmKG8+NTl8fG88MCl0aHJvdyBuZXcgRXJyb3IoXCJNaW51dGVzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCA1OVwiKTtpZihudWxsIT1zJiYocz41OXx8czwwKSl0aHJvdyBuZXcgRXJyb3IoXCJTZWNvbmRzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCA1OVwiKTtpZihlJiYoXCJzdHJpbmdcIiE9dHlwZW9mIGV8fGUubGVuZ3RoPjEpKXRocm93IG5ldyBFcnJvcihcIlNlcGFyYXRvciBtdXN0IGJlIGEgc2luZ2xlLCBub24tbnVtZXJpY2FsIGNoYXJhY3RlclwiKTtmdW5jdGlvbiBpKHQsZSl7aWYoXCJudW1iZXJcIiE9dHlwZW9mIHQpdGhyb3cgbmV3IEVycm9yKGBGaXJzdCBhcmd1bWVudCBvZiAke2V9IG1ldGhvZCBtdXN0IGJlIGEgbnVtYmVyYCl9ZnVuY3Rpb24gYSh0LGUpe2lmKFwic3RyaW5nXCIhPXR5cGVvZiB0KXRocm93IG5ldyBFcnJvcihgU2Vjb25kIGFyZ3VtZW50IG9mICR7ZX0gbWV0aG9kIG11c3QgYmUgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB1bml0IG9mIHRpbWVgKTtsZXQgcj10LmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpO2lmKCFbXCJoXCIsXCJtXCIsXCJzXCJdLmluY2x1ZGVzKHIpKXRocm93IG5ldyBFcnJvcihgU2Vjb25kIGFyZ3VtZW50IG9mICR7ZX0gbWV0aG9kIG11c3QgYmUgaG91cnMsIG1pbnV0ZXMgb3Igc2Vjb25kc2ApO2lmKFwic1wiPT09ciYmbnVsbD09cyl0aHJvdyBuZXcgRXJyb3IoXCJZb3UgY2FuJ3QgYWRqdXN0IHNlY29uZHMgaWYgdGhleSB3ZXJlbid0IGluY2x1ZGVkIGluIHRoZSBvcmlnaW5hbCB0aW1lIGdpdmVuXCIpO3JldHVybiByfWNvbnN0IGg9e25vcm1hbGl6ZTp0PT4obnVsbD09cyYmdC5wb3AoKSx0Lm1hcChmdW5jdGlvbih0KXtyZXR1cm4odD1TdHJpbmcodCkpLmxlbmd0aDwyP1wiMFwiK3Q6dH0pLmpvaW4oZXx8XCI6XCIpKSxoYXNDcm9zc2VkTWlkbmlnaHQ6ITEsYWRkKHQsZSl7c3dpdGNoKGkodCxcImFkZFwiKSxhKGUsXCJhZGRcIikpe2Nhc2VcImhcIjp0aGlzLmhhc0Nyb3NzZWRNaWRuaWdodD1Cb29sZWFuKE1hdGguZmxvb3IoKG4rdCkvMjQpKSxuPShuK3QpJTI0O2JyZWFrO2Nhc2VcIm1cIjpsZXQgcj1NYXRoLmZsb29yKChvK3QpLzYwKTtvPShvK3QpJTYwLHRoaXMuYWRkKHIsXCJoXCIpO2JyZWFrO2Nhc2VcInNcIjpsZXQgaD1NYXRoLmZsb29yKChzK3QpLzYwKTtzPShzK3QpJTYwLHRoaXMuYWRkKGgsXCJtXCIpfXJldHVybiB0aGlzfSxzdWJ0cmFjdCh0LGUpe2kodCxcInN1YnRyYWN0XCIpO2xldCByPTA7c3dpdGNoKGEoZSxcInN1YnRyYWN0XCIpKXtjYXNlXCJoXCI6bGV0IGk9bi10O2Zvcig7aTwwOylyKyssaT0yNCtpO249aSxyJiYodGhpcy5oYXNDcm9zc2VkTWlkbmlnaHQ9ITApO2JyZWFrO2Nhc2VcIm1cIjpsZXQgaD1vLXQ7Zm9yKDtoPDA7KXIrKyxoPTYwK2g7bz1oLHImJnRoaXMuc3VidHJhY3QocixcImhcIik7YnJlYWs7Y2FzZVwic1wiOmxldCB1PXMtdDtmb3IoO3U8MDspcisrLHU9NjArdTtzPXUsciYmdGhpcy5zdWJ0cmFjdChyLFwibVwiKX1yZXR1cm4gdGhpc319O3JldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoaCxcInZhbFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ub3JtYWxpemUoW24sbyxzXSl9fSksaC5hZGQ9aC5hZGQuYmluZChoKSxoLnN1YnRyYWN0PWguc3VidHJhY3QuYmluZChoKSxofW1vZHVsZS5leHBvcnRzPXRpbWVEcmlmdDtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkluUnBiV1V0WkhKcFpuUXVhbk1pWFN3aWJtRnRaWE1pT2xzaWRHbHRaVVJ5YVdaMElpd2lkR2x0WlNJc0luTmxjR0Z5WVhSdmNpSXNJblJsYzNRaUxDSkZjbkp2Y2lJc0luUnBiV1ZEYjIxd2IyNWxiblJ6SWl3aWMzQnNhWFFpTENKdFlYQWlMQ0pqYjIxd2IyNWxiblFpTENKT2RXMWlaWElpTENKb2IzVnljeUlzSW0xcGJuVjBaWE1pTENKelpXTnZibVJ6SWl3aWJHVnVaM1JvSWl3aWRtRnNhV1JoZEdWT2RXMGlMQ0p1ZFcwaUxDSnRaWFJvYjJRaUxDSjJZV3hwWkdGMFpWVnVhWFFpTENKMWJtbDBJaXdpZFc1cGRFTm9ZWElpTENKamFHRnlRWFFpTENKMGIweHZkMlZ5UTJGelpTSXNJbWx1WTJ4MVpHVnpJaXdpY21WemNHOXVjMlVpTENKdWIzSnRZV3hwZW1VaUxDSnlaWFIxY201QmNuSmhlU0lzSW5CdmNDSXNJbkJoY25RaUxDSlRkSEpwYm1jaUxDSnFiMmx1SWl3aWFHRnpRM0p2YzNObFpFMXBaRzVwWjJoMElpd2lXMjlpYW1WamRDQlBZbXBsWTNSZElpd2lkR2hwY3lJc0lrSnZiMnhsWVc0aUxDSk5ZWFJvSWl3aVpteHZiM0lpTENKb2IzVnljMVJ2UVdSa0lpd2lZV1JrSWl3aWJXbHVkWFJsYzFSdlFXUmtJaXdpWTI5MWJuUWlMQ0pvYjNWeVFXNXpkMlZ5SWl3aWJXbHVkWFJsUVc1emQyVnlJaXdpYzNWaWRISmhZM1FpTENKelpXTnZibVJCYm5OM1pYSWlMQ0pQWW1wbFkzUWlMQ0prWldacGJtVlFjbTl3WlhKMGVTSXNJbWRsZENJc0ltSnBibVFpTENKdGIyUjFiR1VpTENKbGVIQnZjblJ6SWwwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4aFFVVkJMRk5CUVZOQkxGVkJRVmRETEVWQlFVMURMRWRCU1hoQ0xFbEJTRzFDTEhOQ1FVZElReXhMUVVGTFJpeEhRVU51UWl4TlFVRk5MRWxCUVVsSExFMUJRVTBzY1VsQlNXeENMRTFCUVUxRExFVkJRV2xDU2l4RlFVRkxTeXhOUVVGTkxGZEJRVmRETEVsQlFVbERMRWRCUVdGRExFOUJRVTlFTEVsQlEzSkZMRWxCUVV0RkxFVkJRVTlETEVWQlFWTkRMRWRCUVZkUUxFVkJSMmhETEVkQlFVZExMRVZCUVZFc1NVRkJUVUVzUlVGQlVTeEZRVU4yUWl4TlFVRk5MRWxCUVVsT0xFMUJRVTBzYTBOQlNXeENMRWRCUVVkUExFVkJRVlVzU1VGQlRVRXNSVUZCVlN4RlFVTXpRaXhOUVVGTkxFbEJRVWxRTEUxQlFVMHNiME5CU1d4Q0xFZEJRV01zVFVGQldGRXNTVUZCYjBKQkxFVkJRVlVzU1VGQlRVRXNSVUZCVlN4SFFVTXZReXhOUVVGTkxFbEJRVWxTTEUxQlFVMHNiME5CU1d4Q0xFZEJRVWRHTEVsQlFXMURMR2xDUVVGa1FTeEhRVUV3UWtFc1JVRkJWVmNzVDBGQlV5eEhRVU51UlN4TlFVRk5MRWxCUVVsVUxFMUJRVTBzZFVSQlNXeENMRk5CUVZOVkxFVkJRV0ZETEVWQlFVdERMRWRCUTNwQ0xFZEJRVzFDTEdsQ1FVRlNSQ3hGUVVOVUxFMUJRVTBzU1VGQlNWZ3NNa0pCUVRKQ1dTdzJRa0ZKZWtNc1UwRkJVME1zUlVGQlkwTXNSVUZCVFVZc1IwRkZNMElzUjBGQmIwSXNhVUpCUVZSRkxFVkJRMVFzVFVGQlRTeEpRVUZKWkN3MFFrRkJORUpaTERKRVFVdDRReXhKUVVGSlJ5eEZRVUZYUkN4RlFVRkxSU3hQUVVGUExFZEJRVWRETEdOQlJ6bENMRWxCUVVzc1EwRkJReXhKUVVGSkxFbEJRVWtzUzBGQlMwTXNVMEZCVTBnc1IwRkRNVUlzVFVGQlRTeEpRVUZKWml3MFFrRkJORUpaTERoRFFVdDRReXhIUVVGcFFpeE5RVUZpUnl4SFFVRXJRaXhOUVVGWVVDeEZRVU4wUWl4TlFVRk5MRWxCUVVsU0xFMUJRVTBzWjBaQlIyeENMRTlCUVU5bExFVkJSMVFzVFVGQlRVa3NSVUZCVnl4RFFVTm1ReXhWUVVGWFF5eEpRVWROTEUxQlFWaGlMRWRCUTBaaExFVkJRVmxETEUxQlMxQkVMRVZCUVZsc1FpeEpRVUZKTEZOQlFWTnZRaXhIUVVVNVFpeFBRVVJCUVN4RlFVRlBReXhQUVVGUFJDeEpRVU5HWkN4UFFVRlRMRVZCUVVrc1NVRkJUV01zUlVGQlQwRXNTVUZEY2tORkxFdEJRVXN6UWl4SFFVRmhMRTFCUjNaQ05FSXNiMEpCUVc5Q0xFVkJSM0JDUXl4SlFVRkxhRUlzUlVGQlMwY3NSMEZIVWl4UFFVWkJTaXhGUVVGWlF5eEZRVUZMTEU5QlEwdEZMRVZCUVdGRExFVkJRVTBzVVVGRmVrTXNTVUZCU3l4SlFVTklZeXhMUVVGTFJpeHRRa0ZCY1VKSExGRkJRVkZETEV0QlFVdERMRTlCUVU5NlFpeEZRVUZSU3l4SFFVRkxMRXRCUXpORVRDeEhRVUZUUVN4RlFVRlJTeXhIUVVGUExFZEJRM2hDTEUxQlEwWXNTVUZCU3l4SlFVTklMRWxCUVVseFFpeEZRVUZoUml4TFFVRkxReXhQUVVGUGVFSXNSVUZCVlVrc1IwRkJTeXhKUVVNMVEwb3NSMEZCVjBFc1JVRkJWVWtzUjBGQlR5eEhRVU0xUW1sQ0xFdEJRVXRMTEVsQlFVbEVMRVZCUVZrc1MwRkRja0lzVFVGRFJpeEpRVUZMTEVsQlEwZ3NTVUZCU1VVc1JVRkJaVW9zUzBGQlMwTXNUMEZCVDNaQ0xFVkJRVlZITEVkQlFVc3NTVUZET1VOSUxFZEJRVmRCTEVWQlFWVkhMRWRCUVU4c1IwRkROVUpwUWl4TFFVRkxTeXhKUVVGSlF5eEZRVUZqTEV0QlIzcENMRTlCUVU5T0xFMUJTVlJFTEZOQlFWVm9RaXhGUVVGTFJ5eEhRVU5pU2l4RlFVRlpReXhGUVVGTExGbEJSV3BDTEVsQlFVbDNRaXhGUVVGUkxFVkJRMW9zVDBGR2MwSjBRaXhGUVVGaFF5eEZRVUZOTEdGQlIzcERMRWxCUVVzc1NVRkRTQ3hKUVVGSmMwSXNSVUZCWVRsQ0xFVkJRVkZMTEVWQlEzcENMRXRCUVUxNVFpeEZRVUZoTEVkQlEycENSQ3hKUVVOQlF5eEZRVUZoTEVkQlFVdEJMRVZCUlhCQ09VSXNSVUZCVVRoQ0xFVkJRMHBFTEVsQlEwWlFMRXRCUVV0R0xHOUNRVUZ4UWl4SFFVVTFRaXhOUVVOR0xFbEJRVXNzU1VGRFNDeEpRVUZKVnl4RlFVRmxPVUlzUlVGQlZVa3NSVUZETjBJc1MwRkJUVEJDTEVWQlFXVXNSMEZEYmtKR0xFbEJRMEZGTEVWQlFXVXNSMEZCUzBFc1JVRkZkRUk1UWl4RlFVRlZPRUlzUlVGRFVFWXNSMEZEUkZBc1MwRkJTMVVzVTBGQlUwZ3NSVUZCVHl4TFFVVjJRaXhOUVVOR0xFbEJRVXNzU1VGRFNDeEpRVUZKU1N4RlFVRmxMMElzUlVGQlZVY3NSVUZETjBJc1MwRkJUVFJDTEVWQlFXVXNSMEZEYmtKS0xFbEJRMEZKTEVWQlFXVXNSMEZCUzBFc1JVRkZkRUl2UWl4RlFVRlZLMElzUlVGRFVFb3NSMEZEUkZBc1MwRkJTMVVzVTBGQlUwZ3NSVUZCVHl4TFFVbDZRaXhQUVVGUFVDeFBRV0ZZTEU5QlZFRlpMRTlCUVU5RExHVkJRV1YwUWl4RlFVRlZMRTFCUVU4c1EwRkRja04xUWl4SlFVRkxMRmRCUTBnc1QwRkJUMlFzUzBGQlMxSXNWVUZCVlN4RFFVRkRaQ3hGUVVGUFF5eEZRVUZUUXl4UFFVa3pRMWNzUlVGQlUyTXNTVUZCVFdRc1JVRkJVMk1zU1VGQlNWVXNTMEZCUzNoQ0xFZEJRMnBEUVN4RlFVRlRiVUlzVTBGQlYyNUNMRVZCUVZOdFFpeFRRVUZUU3l4TFFVRkxlRUlzUjBGRmNFTkJMRVZCUjFSNVFpeFBRVUZQUXl4UlFVRlZha1FpTENKbWFXeGxJam9pTDFWelpYSnpMMkZ1WkhKbGR5OVFaWEp6YjI1aGJDOTBhVzFsTFdSeWFXWjBMM055WXk5MGFXMWxMV1J5YVdaMExtcHpJbjA9IiwiY29uc3QgdGltZURyaWZ0ID0gcmVxdWlyZSgndGltZS1kcmlmdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgd2Fybk1zZyA9IHtcbiAgICBEVVJBVElPTl9UT09fTEFSR0U6ICdUaGUgZHVyYXRpb24gaXMgdG9vIGxhcmdlIHRvIGNyZWF0ZSBldmVuIG9uZSB0aW1lLXNsb3Qgd2l0aGluIHRoZSB0aW1lcyBnaXZlbidcbiAgfVxuXG4gIGNvbnN0IGVyck1zZyA9IHtcbiAgICBOT19EVVJBVElPTjogJ1lvdSBtdXN0IGluY2x1ZGUgYSBwb3NpdGl2ZSBkdXJhdGlvbiB2YWx1ZSBhcyB0aGUgdGhpcmQgYXJndW1lbnQnXG4gIH1cblxuICBsZXQgX3RpbWVPYmplY3QgPSB7fSxcbiAgICAgIF9zbG90RHVyYXRpb24sXG4gICAgICBfc3RhcnQsXG4gICAgICBfZW5kLFxuICAgICAgX3Nsb3RzLFxuICAgICAgX3VuaXRzLFxuICAgICAgX2hhc0V2ZXJDcm9zc2VkTWlkbmlnaHQsXG4gICAgICBfc3BhY2VyLFxuICAgICAgX3NwYWNlclVuaXRzLFxuICAgICAgX3B1c2hUb0VuZFRpbWUsXG4gICAgICBfaW5jbHVkZU92ZXJmbG93LFxuICAgICAgX2ZpbmlzaGVkXG5cbiAgZnVuY3Rpb24gY3JlYXRlVGltZXNsb3RzKHN0YXJ0LCBlbmQsIHNsb3REdXJhdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFzbG90RHVyYXRpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cuTk9fRFVSQVRJT04pXG4gICAgfVxuICAgIC8vIHRoaXMgd2lsbCBiZSBhIHNpbmdsZXRvbiBpbiBhIG5vZGUgYXBwLCBzbyBpdCBpcyBpbXBvcnRhbnRcbiAgICAvLyB0byByZXNldCBhbGwgdGhlIHZhcmlhYmxlcyBzbyB0aGF0IG9uZSBpbnZvY2F0aW9uIGRvZXNuJ3RcbiAgICAvLyBlZmZlY3QgYW5vdGhlclxuICAgIGxldCBpbml0aWFsVGltZSA9IG9wdGlvbnMucHVzaFRvRW5kVGltZSA/IGVuZCA6IHN0YXJ0XG4gICAgX3Nsb3RzID0gW11cbiAgICBfZmluaXNoZWQgPSBmYWxzZVxuICAgIF9oYXNFdmVyQ3Jvc3NlZE1pZG5pZ2h0ID0gZmFsc2VcbiAgICBfdGltZU9iamVjdCA9IHRpbWVEcmlmdChpbml0aWFsVGltZSwgb3B0aW9ucy5kZWxpbWl0ZXIpXG4gICAgX3Nsb3REdXJhdGlvbiA9IHNsb3REdXJhdGlvblxuICAgIF91bml0cyA9IG9wdGlvbnMudW5pdHMgfHwgJ20nXG4gICAgX3B1c2hUb0VuZFRpbWUgPSBvcHRpb25zLnB1c2hUb0VuZFRpbWUgfHwgZmFsc2VcbiAgICBfc3BhY2VyID0gb3B0aW9ucy5zcGFjZXJcbiAgICBfc3BhY2VyVW5pdHMgPSBvcHRpb25zLnNwYWNlclVuaXRzIHx8ICdtJ1xuICAgIF9pbmNsdWRlT3ZlcmZsb3cgPSBvcHRpb25zLmluY2x1ZGVPdmVyZmxvd1xuXG4gICAgLy8gSSBwdXQgdGhlIHN0YXJ0IGFuZCBlbmQgdGhyb3VnaCB0aGUgdGltZURyaWZ0IHBhY2thZ2VcbiAgICAvLyB0byBlbnN1cmUgdGhleSBoYXZlIHRoZSBzYW1lIGZvcm1hdCwgc28gdGhhdCBjb21wYXJpbmdcbiAgICAvLyBpc24ndCBlZmZlY3RlZCBieSBkaWZmZXJlbnQgZGVsaW1pdGVyc1xuICAgIF9zdGFydCA9IHRpbWVEcmlmdChzdGFydCwgb3B0aW9ucy5kZWxpbWl0ZXIpLnZhbFxuICAgIF9lbmQgPSB0aW1lRHJpZnQoZW5kLCBvcHRpb25zLmRlbGltaXRlcikudmFsXG5cbiAgICBfY2hlY2tJc1ZhbGlkKClcblxuICAgIF9zbG90cyA9IHN0YXJ0IDwgZW5kID8gX25vTWlkbmlnaHRDcm9zc2luZygpIDogX2Nyb3NzZXNNaWRuaWdodCgpO1xuXG4gICAgaWYgKG9wdGlvbnMuam9pbk9uKSB7XG4gICAgICByZXR1cm4gX3Nsb3RzLm1hcChzbG90UGFpciA9PiBzbG90UGFpci5qb2luKG9wdGlvbnMuam9pbk9uKSlcbiAgICB9XG5cbiAgICByZXR1cm4gX3Nsb3RzXG4gIH1cblxuICAvLyBmaW5pc2ggaW1tZWRpYXRlbHkgaWYgdGhlIF9zbG90RHVyYXRpb24gaXMgdG9vIHNtYWxsIGZvciBldmVuXG4gIC8vIG9uZSB0aW1lLXNsb3RcbiAgZnVuY3Rpb24gX2NoZWNrSXNWYWxpZCgpIHtcbiAgICBjb25zdCB0ZXN0VGltZSA9IHRpbWVEcmlmdChfc3RhcnQpLmFkZChfc2xvdER1cmF0aW9uLCAgX3VuaXRzKVxuICAgIGlmIChfc3RhcnQgPCBfZW5kKSB7XG4gICAgICBpZiAodGVzdFRpbWUudmFsID4gX2VuZCB8fCB0ZXN0VGltZS5oYXNDcm9zc2VkTWlkbmlnaHQpIHtcbiAgICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICBjb25zb2xlLndhcm4od2Fybk1zZy5EVVJBVElPTl9UT09fTEFSR0UpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0ZXN0VGltZS52YWwgPiBfZW5kICYmIHRlc3RUaW1lLmhhc0Nyb3NzZWRNaWRuaWdodCkge1xuICAgICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgICAgIGNvbnNvbGUud2Fybih3YXJuTXNnLkRVUkFUSU9OX1RPT19MQVJHRSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfY2hlY2tJc01pZG5pZ2h0Q3Jvc3NlZCAoKSB7XG4gICAgaWYgKF90aW1lT2JqZWN0Lmhhc0Nyb3NzZWRNaWRuaWdodCkge1xuICAgICAgX2hhc0V2ZXJDcm9zc2VkTWlkbmlnaHQgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgLy8gd2hlbiBwdXNoVG9FbmRUaW1lIGlzIGZhbHNlLCB3ZSBiZWdpbiBhdCB0aGUgc3RhcnQgdGltZSBhbmQgd29yayBvdXJcbiAgLy8gd2F5IGZvcndhcmQgdG8gdGhlIGVuZCB0aW1lXG4gIGZ1bmN0aW9uIF9pbmNyZW1lbnRUaW1lKCkge1xuICAgIF9hZGRTbG90VG9CYWNrKF90aW1lT2JqZWN0LnZhbCwgX3RpbWVPYmplY3QuYWRkKF9zbG90RHVyYXRpb24sIF91bml0cykudmFsKVxuXG4gICAgaWYgKF9zcGFjZXIpIHtcbiAgICAgIF90aW1lT2JqZWN0LmFkZChfc3BhY2VyLCBfc3BhY2VyVW5pdHMpXG4gICAgfVxuICAgIF9jaGVja0lzTWlkbmlnaHRDcm9zc2VkICgpXG4gIH1cblxuICAvLyB3aGVuIHB1c2hUb0VuZFRpbWUgaXMgdHJ1ZSwgd2UgYmVnaW4gYXQgdGhlIGVuZCB0aW1lIGFuZCB3b3JrIG91clxuICAvLyB3YXkgYmFja3dhcmRzIHRvIHRoZSBzdGFydCB0aW1lXG4gIGZ1bmN0aW9uIF9kZWNyZW1lbnRUaW1lKCkge1xuICAgIF9hZGRTbG90VG9Gcm9udChfdGltZU9iamVjdC52YWwsIF90aW1lT2JqZWN0LnN1YnRyYWN0KF9zbG90RHVyYXRpb24sIF91bml0cykudmFsKVxuXG4gICAgaWYgKF9zcGFjZXIpIHtcbiAgICAgIF90aW1lT2JqZWN0LnN1YnRyYWN0KF9zcGFjZXIsIF9zcGFjZXJVbml0cylcbiAgICB9XG4gICAgX2NoZWNrSXNNaWRuaWdodENyb3NzZWQgKClcbiAgfVxuXG4gIC8vIGlmIG5vIGNyb3NzaW5nIG92ZXIgdGhlIG1pZG5pZ2h0IHRocmVzaG9sZCBpcyBpbnZvbHZlZFxuICAvLyBpbiBjcmVhdGluZyB0aGUgcmVxdWlyZWQgdGltZS1zbG90cywgdGhpcyBsb2dpYyB3aWxsXG4gIC8vIGJlIHVzZWRcbiAgZnVuY3Rpb24gX25vTWlkbmlnaHRDcm9zc2luZygpIHtcblxuICAgIGlmIChfcHVzaFRvRW5kVGltZSkge1xuICAgICAgd2hpbGUgKChfdGltZU9iamVjdC52YWwgPj0gX3N0YXJ0KSAmJiAhX2ZpbmlzaGVkKSB7XG4gICAgICAgIF9kZWNyZW1lbnRUaW1lKClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKChfdGltZU9iamVjdC52YWwgPD0gX2VuZCkgJiYgIV9maW5pc2hlZCkge1xuICAgICAgICBfaW5jcmVtZW50VGltZSgpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfc2xvdHNcbiAgfVxuXG4gIC8vIGlmIHRoZSB0aW1lLXNsb3RzIHJlcXVpcmVkIGludm9sdmUgYSBjcm9zc2luZyBvdmVyIHRoZSBtaWRuaWdodFxuICAvLyB0aHJlc2hob2xkLCB3ZSBuZWVkIHRoaXMgbG9naWMgYmVmb3JlIGl0IGdldHMgdG8gbWlkbmlnaHRcbiAgZnVuY3Rpb24gX2Nyb3NzZXNNaWRuaWdodCgpIHtcbiAgICB3aGlsZSAoIV9oYXNFdmVyQ3Jvc3NlZE1pZG5pZ2h0KSB7XG4gICAgICBpZiAoX3B1c2hUb0VuZFRpbWUpIHtcbiAgICAgICAgX2RlY3JlbWVudFRpbWUoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2luY3JlbWVudFRpbWUoKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfbm9NaWRuaWdodENyb3NzaW5nKClcbiAgfVxuXG4gIGZ1bmN0aW9uIF9hZGRTbG90VG9CYWNrKHByZSwgcG9zdCkge1xuXG4gICAgLy93ZSBkZWZpbml0ZWx5IGRvbid0IHdhbnQgYSBzbG90IGlmIGl0IGJlZ2lucyBvbiB0aGUgZW5kIHRpbWUsIHVubGVzc1xuICAgIC8vIHRoZSBzdGFydCBhbmQgZW5kIHRpbWVzIGdpdmVuIHdlcmUgdGhlIHNhbWVcbiAgICBpZiAocHJlID09PSBfZW5kICYmICEoX3N0YXJ0ID09PSBfZW5kICYmICFfaGFzRXZlckNyb3NzZWRNaWRuaWdodCkpIHtcbiAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICB9XG5cbiAgICBfY2hlY2tJc01pZG5pZ2h0Q3Jvc3NlZCgpXG5cbiAgICBpZiAoIV9pbmNsdWRlT3ZlcmZsb3cpIHtcblxuICAgICAgLy8gY29uZGl0aW9uIHRvIGVsaW1pbmF0ZSB0aW1lc2xvdHMgdGhhdCBicmlkZ2Ugb3ZlciB0aGUgZW5kIHRpbWVcbiAgICAgIGlmIChwcmUgPCBfZW5kICYmIHBvc3QgPiBfZW5kKSB7XG4gICAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICAgIH1cblxuICAgICAgIC8vIGlmIHRoZSBlbmQgdGltZSBpcyBtaWRuaWdodCBvciBjbG9zZSB0byBpdCwgdGhlIHBvc3RcbiAgICAgIC8vIGFuZCBwcmUgdmFsdWVzIG1heSBiZSBlaXRoZXIgc2lkZSBvZiB0aGUgbWlkbmlnaHQgYW5kXG4gICAgICAvLyByZXF1aXJlIHRoaXMgY29uZGl0aW9uIHRvIHJlYWxpc2UgdGhlIHRpbWUtc2xvdHMgYnJpZGdlXG4gICAgICAvLyB0aGUgZW5kIHRpbWVcbiAgICAgIGlmICgocHJlID4gX2VuZCAmJiBwb3N0ID4gX2VuZCkgJiYgcHJlID4gcG9zdCkge1xuICAgICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFfZmluaXNoZWQpIHtcbiAgICAgIF9zbG90cy5wdXNoKFtwcmUsIHBvc3RdKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9hZGRTbG90VG9Gcm9udCAocHJlLCBwb3N0KSB7XG5cbiAgICAvLyB3ZSBkZWZpbml0ZWx5IGRvbid0IHdhbnQgYSBzbG90IGlmIGl0IGVuZHMgb24gdGhlIHN0YXJ0IHRpbWVcbiAgICAvLyB0aGUgc3RhcnQgYW5kIGVuZCB0aW1lcyBnaXZlbiB3ZXJlIHRoZSBzYW1lXG4gICAgaWYgKHByZSA9PT0gX3N0YXJ0ICYmICEoX3N0YXJ0ID09PSBfZW5kICYmICFfaGFzRXZlckNyb3NzZWRNaWRuaWdodCkpIHtcbiAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICB9XG5cbiAgICBfY2hlY2tJc01pZG5pZ2h0Q3Jvc3NlZCgpXG5cbiAgICBpZiAoIV9pbmNsdWRlT3ZlcmZsb3cpIHtcbiAgICAgIC8vIGNvbmRpdGlvbiB0byBlbGltaW5hdGUgdGltZXNsb3RzIHRoYXQgYnJpZGdlIG92ZXIgdGhlIHN0YXJ0IHRpbWVcbiAgICAgIGlmIChwcmUgPiBfc3RhcnQgJiYgcG9zdCA8IF9zdGFydCkge1xuICAgICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHRoZSBzdGFydCB0aW1lIGlzIG1pZG5pZ2h0IG9yIGNsb3NlIHRvIGl0LCB0aGUgcG9zdFxuICAgICAgLy8gYW5kIHByZSB2YWx1ZXMgbWF5IGJlIGVpdGhlciBzaWRlIG9mIHRoZSBtaWRuaWdodCBhbmRcbiAgICAgIC8vIHJlcXVpcmUgdGhpcyBjb25kaXRpb24gdG8gcmVhbGlzZSB0aGUgdGltZS1zbG90cyBicmlkZ2VcbiAgICAgIC8vIHRoZSBzdGFydCB0aW1lXG4gICAgICBpZiAoKHByZSA+IF9zdGFydCAmJiBwb3N0ID4gX3N0YXJ0KSAmJiBwcmUgPCBwb3N0KSB7XG4gICAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIV9maW5pc2hlZCkge1xuICAgICAgX3Nsb3RzLnVuc2hpZnQoW3Bvc3QsIHByZV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNyZWF0ZVRpbWVzbG90c1xuXG59KSgpIl19
