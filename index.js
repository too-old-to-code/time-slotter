let a = require('./src/time-slot')

var options = {
  units: 'm',
  endWithPartial: true,
  spacer: 24,
  spacerUnit: 'm',
  joinOn: ' until ',
  // interval: 10
  // hidePartial: true
}

console.log(a('00:00', '13:00', 20, options))