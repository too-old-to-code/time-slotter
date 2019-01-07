## TimeSlotter
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT) [![circleci](https://img.shields.io/circleci/project/github/too-old-to-code/time-slotter.svg)](https://circleci.com/gh/too-old-to-code/time-slotter/tree/master) [![](https://david-dm.org/too-old-to-code/time-slotter.svg)](https://david-dm.org/too-old-to-code/time-slotter)

This is a small package to create a set of timeslots between two times. It can do this with time gaps in between each slot, or not.

### Browser
```
<script src="bower_components/time-slotter/dist/time-slotter.js"></script>
<script>
  let slots = timeSlotter('10:00', '15:45', 35)
</script>
```

### Node

```
npm install time-slotter
```

And then require it into your app like so:

```
let timeSlotter = require('time-slotter')
```

### Usage

```
timeSlotter(startTime, endTime, slotDuration [,options])
```

The optional options object accepts the following properties:

|  property     | description                             | type        | default |
|---------------|-----------------------------------------|-------------|-------  |
|  units        | The time unit of the slot.              | String      | "m"     |
|  spacer       | Size of time gap between slots          | Number      | null    |
|  spacerUnits  | The time unit of the spacer             | String      | "m"     |
|  delimiter    | The character between the HH:MM:SS      |String       | ":"     |
|	joinOn       | Join a slot start and slot end with text| String      | null    |
| pushToEndTime | Ensure last slot ends on the end time   | Boolean     | false   |
| includeOverflow| Include slots that bridge over the end or start time| Boolean| false|


When you enter the times, you can opt to include seconds or not.
Both HH:MM:SS and HH:MM are valid, but if you do not include seconds, you cannot use seconds as the unit for either the slotDuration or the spacer.

```
let mySlots = timeSlotter('03:35', '10:00', 30)
```

An array of arrays is returned when you invoke timeSlotter. Each nested array represents a time-slot, with a start and end time. If you decide to use the `joinOn` options, then an array of strings is returned according to the string you chose to join on.

### Example:

```
console.log(timeSlotter('03:35', '05:30', 25))

//	[ 	[ '03:35', '04:00' ],
// 		[ '04:00', '04:25' ],
// 		[ '04:25', '04:50' ],
// 		[ '04:50', '05:15' ]
//	]

let options = { joinOn: ' until ', delimiter: '.' }

console.log(timeSlotter('03:35', '05:30', 25, options))

//	[ 	'03.35 until 04.00',
//		'04.00 until 04.25',
//		'04.25 until 04.50',
//		'04.50 until 05.15'
//	]

```

If timeslots don't fit exactly between the given times, you can decide to make the last timeslot finish exactly on the end time, by setting the `pushToEndTime` option to true. This will push all the slots away from the start time towards the end time.

```
let options = { joinOn: ' - ', pushToEndTime: true }

console.log(timeSlotter('03:35', '05:30', 25, options))

// 	[ 	'03:50 - 04:15',
// 		'04:15 - 04:40',
// 		'04:40 - 05:05',
//		'05:05 - 05:30'
// 	]

```

Valid values for the `units` and `spacerUnits` of the options object are: `h`, `m` or `s`. Actually, they can be any string, as long as they begin with those letters. As explained earlier, the `s` value is only valid if you included seconds in the start and end times.

```
let options = { units: 's', spacer: 45, spacerUnits: 's' }

console.log(timeSlotter('23:58:07', '00:10:10', 110, options))

//	[ 	[ '23:58:07', '23:59:57' ],
//  		[ '00:00:42', '00:02:32' ],
//		[ '00:03:17', '00:05:07' ],
//		[ '00:05:52', '00:07:42' ]
//	]
```

Because of the way the time-slots are returned, it gives you the opportunity to breakdown the timeslots further into smaller partitions. For example, say you wanted three blocks of time-slots, 2hrs long each, between 09:00 and 19:30 with 70mins break between each. And let's say that each of those blocks, you want to further split into 20min time-slots with no break between them.

```
options = { units: 'h', spacer: 70, spacerUnits: 'm' }

let blocks = timeSlotter('09:00', '19:30', 2, options)


let partitions = blocks.reduce((acc, curr) =>
	[].concat(acc, timeSlotter(curr[0],curr[1], 20, {units: 'm'}), '<------->' ),
[])

// '<------>' was only added to show the division between blocks clearly

console.log(partitions)

// [ 	[ '09:00', '09:20' ],
//  	[ '09:20', '09:40' ],
//  	[ '09:40', '10:00' ],
//  	[ '10:00', '10:20' ],
//    	[ '10:20', '10:40' ],
// 	[ '10:40', '11:00' ],
//  	'<------->',
//  	[ '12:10', '12:30' ],
// 	[ '12:30', '12:50' ],
//  	[ '12:50', '13:10' ],
//  	[ '13:10', '13:30' ],
//  	[ '13:30', '13:50' ],
//  	[ '13:50', '14:10' ],
//  	'<------->',
//  	[ '15:20', '15:40' ],
//  	[ '15:40', '16:00' ],
//  	[ '16:00', '16:20' ],
//  	[ '16:20', '16:40' ],
//  	[ '16:40', '17:00' ],
//  	[ '17:00', '17:20' ],
//  	'<------->'
// ]


```

If you want to include a timeslot that overlaps either your start or end time (depending on whether you use `pushToEndTime`), you can set the `includeOverflow` property to true.

```
let slot = timeSlotter('12:30','12:40', 3)
console.log(slot)

//  [   [ '12:30', '12:33' ],
//      [ '12:33', '12:36' ],
//      [ '12:36', '12:39' ]  ]

slot = timeSlotter('12:30','12:40', 3, { includeOverflow: true })

console.log(slot)

//  [   [ '12:30', '12:33' ],
//      [ '12:33', '12:36' ],
//      [ '12:36', '12:39' ],
//      [ '12:39', '12:42' ]  ]

```