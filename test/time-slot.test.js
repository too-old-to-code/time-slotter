"use strict"

var expect = require('chai').expect
var timeSlot = require('../src/time-slot')

var errorMessages = {

}

describe('gives correct timeslots', function () {
  describe('without using options',function(){
    it('without crossing midnight', function(done) {
      let slots = timeSlot('09:00', '12:30', 50)
      expect(slots[0][0]).to.be.equal('09:00')
      expect(slots[0][1]).to.be.equal(slots[1][0])
      expect(slots.length).to.be.equal(4)
      expect(slots[3][1]).to.be.equal('12:20')
      done()
    })

    it('crossing midnight', function (done) {
      let slots = timeSlot('21:50', '00:40', 45)
      expect(slots[0][0]).to.be.equal('21:50')
      expect(slots[0][1]).to.be.equal(slots[1][0])
      expect(slots.length).to.be.equal(3)
      expect(slots[2][1]).to.be.equal('00:05')
      done()
    })
  })

  describe('when timeslots start from the start time', function () {

    describe('using seconds as unit', function () {
      it('without crossing midnight', function(done) {
        let slots = timeSlot('09:00:00', '12:00:00', 450, { units: 's'})
        expect(slots[0][0]).to.be.equal('09:00:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(24)
        expect(slots[23][1]).to.be.equal('12:00:00')
        done()
      })

      it('crossing midnight', function (done) {
        let slots = timeSlot('23:50:50', '00:01:00', 45, { units: 's'})
        expect(slots[0][0]).to.be.equal('23:50:50')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(13)
        expect(slots[12][1]).to.be.equal('00:00:35')
        done()
      })
    })

    describe('using hours as unit', function () {
      it('without crossing midnight', function(done) {
        let slots = timeSlot('09:00:00', '12:00:00', 1, { units: 'h'})
        expect(slots[0][0]).to.be.equal('09:00:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(3)
        expect(slots[2][1]).to.be.equal('12:00:00')
        done()
      })

      it('crossing midnight', function (done) {
        let slots = timeSlot('20:50:50', '02:01:00', 2, { units: 'h'})
        expect(slots[0][0]).to.be.equal('20:50:50')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(2)
        expect(slots[1][1]).to.be.equal('00:50:50')
        done()
      })
    })

    describe('when timeslots are joined', function (){
      it('will return strings', function (done) {
        let slots = timeSlot('20:50:50', '02:01:00', 2, { joinOn: ' - ', units: 'h'})
        expect(slots[0]).to.be.a('string')
        expect(slots[0].includes('-')).to.be.true
        expect(slots.length).to.be.equal(2)
        done()
      })
    })
  })

  describe('when timeslots are pushed to end time', function() {
    describe('using seconds as unit', function () {
      it('without crossing midnight', function(done) {
        let slots = timeSlot('09:00:00', '12:00:00', 450, { units: 's', pushToEndTime: true})
        expect(slots[0][0]).to.be.equal('09:00:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(24)
        expect(slots[23][1]).to.be.equal('12:00:00')
        done()
      })

      it('crossing midnight', function (done) {
        let slots = timeSlot('23:50:50', '00:01:00', 45, { units: 's',pushToEndTime: true})
        expect(slots[0][0]).to.be.equal('23:51:15')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(13)
        expect(slots[12][1]).to.be.equal('00:01:00')
        done()
      })
    })

    describe('using hours as unit', function () {
      it('without crossing midnight', function(done) {
        let slots = timeSlot('09:00:00', '12:00:00', 1, { units: 'h', pushToEndTime: true})
        expect(slots[0][0]).to.be.equal('09:00:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(3)
        expect(slots[2][1]).to.be.equal('12:00:00')
        done()
      })

      it('crossing midnight', function (done) {
        let slots = timeSlot('20:50:50', '02:01:00', 2, { units: 'h', pushToEndTime: true})
        expect(slots[0][0]).to.be.equal('22:01:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(2)
        expect(slots[1][1]).to.be.equal('02:01:00')
        done()
      })
    })
  })


})