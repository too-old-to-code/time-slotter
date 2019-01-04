// let a = require('./src/time-slot')
let a = require('./src/index')

var options = {
  units: 'm',
  // endWithPartial: true,
  spacer: 24,
  spacerUnit: 'm',
  // joinOn: ' - ',
  // interval: 10
  // hidePartial: true
  delimiter: '_'
}

console.log(a('12:35:00', '03:00:12', 75, options))