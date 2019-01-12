"use strict"

var expect = require('chai').expect
var timeSlotter = require('../src/time-slotter')

describe('gives correct timeslots', function () {
  describe('without using options',function(){
    it('without crossing midnight', function(done) {
      let slots = timeSlotter('09:00', '12:30', 50)
      expect(slots[0][0]).to.be.equal('09:00')
      expect(slots[0][1]).to.be.equal(slots[1][0])
      expect(slots.length).to.be.equal(4)
      expect(slots[3][1]).to.be.equal('12:20')
      done()
    })

    it('crossing midnight', function (done) {
      let slots = timeSlotter('21:50', '00:40', 45)
      expect(slots[0][0]).to.be.equal('21:50')
      expect(slots[0][1]).to.be.equal(slots[1][0])
      expect(slots.length).to.be.equal(3)
      expect(slots[2][1]).to.be.equal('00:05')
      done()
    })
  })

  describe('with delimiter option used',function(){
    it('without crossing midnight', function(done) {
      let slots = timeSlotter('09:00', '12:30', 50, { delimiter: '.'})
      expect(slots[0][0]).to.be.equal('09.00')
      expect(slots[0][1]).to.be.equal(slots[1][0])
      expect(slots.length).to.be.equal(4)
      expect(slots[3][1]).to.be.equal('12.20')
      done()
    })

    it('crossing midnight', function (done) {
      let slots = timeSlotter('21:50', '00:40', 45, { delimiter: '-'})
      expect(slots[0][0]).to.be.equal('21-50')
      expect(slots[0][1]).to.be.equal(slots[1][0])
      expect(slots.length).to.be.equal(3)
      expect(slots[2][1]).to.be.equal('00-05')
      done()
    })
  })

  describe('when timeslots start from the start time', function () {

    describe('using seconds as unit', function () {
      it('without crossing midnight', function(done) {
        let slots = timeSlotter('09:00:00', '12:00:00', 450, { units: 's'})
        expect(slots[0][0]).to.be.equal('09:00:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(24)
        expect(slots[23][1]).to.be.equal('12:00:00')
        done()
      })

      it('crossing midnight', function (done) {
        let slots = timeSlotter('23:50:50', '00:01:00', 45, { units: 's'})
        expect(slots[0][0]).to.be.equal('23:50:50')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(13)
        expect(slots[12][1]).to.be.equal('00:00:35')
        done()
      })
    })

    describe('using hours as unit', function () {
      it('without crossing midnight', function(done) {
        let slots = timeSlotter('09:00:00', '12:00:00', 1, { units: 'h'})
        expect(slots[0][0]).to.be.equal('09:00:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(3)
        expect(slots[2][1]).to.be.equal('12:00:00')
        done()
      })

      it('crossing midnight', function (done) {
        let slots = timeSlotter('20:50:50', '02:01:00', 2, { units: 'h'})
        expect(slots[0][0]).to.be.equal('20:50:50')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(2)
        expect(slots[1][1]).to.be.equal('00:50:50')
        done()
      })
    })

    describe('when timeslots are joined', function (){
      it('will return strings', function (done) {
        let slots = timeSlotter('20:50:50', '02:01:00', 2, { joinOn: ' - ', units: 'h'})
        expect(slots[0]).to.be.a('string')
        expect(slots[0].includes('-')).to.be.true
        expect(slots.length).to.be.equal(2)
        done()
      })
    })

    describe('when spacer is used', function () {
      it('will return timeslots with spaces between', function (done) {
        let slots = timeSlotter('10:35','16:56', 65, {spacer: 20})
        expect(slots[0][0]).to.be.equal('10:35')
        expect(slots[0][1]).to.not.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(4)
        expect(slots[3][1]).to.be.equal('15:55')
        done()
      })
    })

    describe('when includeOverflow is used', function () {
      it('will return the slot bridging over the end time', function (done) {
        let slots = timeSlotter('10:35','16:56', 65, {includeOverflow: true})
        expect(slots[0][0]).to.be.equal('10:35')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(6)
        expect(slots[5][1]).to.be.equal('17:05')
        done()
      })
    })
  })

  describe('when timeslots are pushed to end time', function() {
    describe('using seconds as unit', function () {
      it('without crossing midnight', function(done) {
        let slots = timeSlotter('09:00:00', '12:00:00', 450, { units: 's', pushToEndTime: true})
        expect(slots[0][0]).to.be.equal('09:00:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(24)
        expect(slots[23][1]).to.be.equal('12:00:00')
        done()
      })

      it('crossing midnight', function (done) {
        let slots = timeSlotter('23:50:50', '00:01:00', 45, { units: 's',pushToEndTime: true})
        expect(slots[0][0]).to.be.equal('23:51:15')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(13)
        expect(slots[12][1]).to.be.equal('00:01:00')
        done()
      })
    })

    describe('using hours as unit', function () {
      it('without crossing midnight', function(done) {
        let slots = timeSlotter('09:00:00', '12:00:00', 1, { units: 'h', pushToEndTime: true})
        expect(slots[0][0]).to.be.equal('09:00:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(3)
        expect(slots[2][1]).to.be.equal('12:00:00')
        done()
      })

      it('crossing midnight', function (done) {
        let slots = timeSlotter('20:50:50', '02:01:00', 2, { units: 'h', pushToEndTime: true})
        expect(slots[0][0]).to.be.equal('22:01:00')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(2)
        expect(slots[1][1]).to.be.equal('02:01:00')
        done()
      })
    })

    describe('when spacer is used', function () {
      it('will return timeslots with spaces between', function (done) {
        let slots = timeSlotter('10:35','16:56', 65, {spacer: 20, pushToEndTime: true})
        expect(slots[0][0]).to.be.equal('11:36')
        expect(slots[0][1]).to.not.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(4)
        expect(slots[3][1]).to.be.equal('16:56')
        done()
      })
    })

    describe('when includeOverflow is used', function () {
      it('will return the slot bridging over the start time', function (done) {
        let slots = timeSlotter('10:35','16:56', 65, {
          includeOverflow: true,
          pushToEndTime: true
        })
        expect(slots[0][0]).to.be.equal('10:26')
        expect(slots[0][1]).to.be.equal(slots[1][0])
        expect(slots.length).to.be.equal(6)
        expect(slots[5][1]).to.be.equal('16:56')
        done()
      })
    })
  })

  describe('boundary situations', function () {
    it('can deal with slots beginning on a boundary with spacer', function(done){
      let slots1 = timeSlotter('23:00', '00:01', 20, {
        spacer: 1,
        pushToEndTime: true
      })
      expect(slots1[0][0]).to.be.equal('23:20')
      expect(slots1.length).to.be.equal(2)
      expect(slots1[1][1]).to.be.equal('00:01')

      let slots2 = timeSlotter('23:00', '00:01', 20, {
        spacer: 1
      })
      expect(slots2[0][0]).to.be.equal('23:00')
      expect(slots2.length).to.be.equal(2)
      expect(slots2[1][1]).to.be.equal('23:41')

      let slots3 = timeSlotter('23:00', '00:01', 20, {
        includeOverflow: true,
        spacer: 1,
        pushToEndTime: true
      })
      expect(slots3[0][0]).to.be.equal('22:59')
      expect(slots3.length).to.be.equal(3)
      expect(slots3[2][1]).to.be.equal('00:01')

      let slots4 = timeSlotter('23:00', '00:01', 20, {
        includeOverflow: true,
        spacer: 1
      })
      expect(slots4[0][0]).to.be.equal('23:00')
      expect(slots4.length).to.be.equal(3)
      expect(slots4[2][1]).to.be.equal('00:02')

      let slots5 = timeSlotter('23:50','00:00', 4, { spacer: 1 })
      expect(slots5[0][0]).to.be.equal('23:50')
      expect(slots5.length).to.be.equal(2)
      expect(slots5[1][1]).to.be.equal('23:59')
      done()
    })

    it('can deal with slots beginning on a boundary', function(done){
      let slots1 = timeSlotter('23:00', '00:01', 20, {
        pushToEndTime: true
      })
      expect(slots1[0][0]).to.be.equal('23:01')
      expect(slots1.length).to.be.equal(3)
      expect(slots1[2][1]).to.be.equal('00:01')

      let slots2 = timeSlotter('23:00', '00:01', 20)
      expect(slots2[0][0]).to.be.equal('23:00')
      expect(slots2.length).to.be.equal(3)
      expect(slots2[2][1]).to.be.equal('00:00')

      let slots3 = timeSlotter('23:00', '00:01', 20, {
        includeOverflow: true,
        pushToEndTime: true
      })
      expect(slots3[0][0]).to.be.equal('22:41')
      expect(slots3.length).to.be.equal(4)
      expect(slots3[3][1]).to.be.equal('00:01')

      let slots4 = timeSlotter('23:00', '00:01', 20, {
        includeOverflow: true
      })
      expect(slots4[0][0]).to.be.equal('23:00')
      expect(slots4.length).to.be.equal(4)
      expect(slots4[3][1]).to.be.equal('00:20')

      done()
    })
  })

  describe('regression tests', function () {
    it('can pass conditions that previous versions failed', function (done) {
      let slots1 = timeSlotter('00:02:32','00:00:19', 27, {
        spacer: 34
      })

      expect(slots1[0][0]).to.be.equal('00:02:32')
      expect(slots1.length).to.be.equal(24)
      expect(slots1[23][1]).to.be.equal('23:52:32')

      let slots2 = timeSlotter('00:02:32','00:00:19', 27, {
        pushToEndTime: true,
        spacer: 34
      })

      expect(slots2[0][0]).to.be.equal('00:10:19')
      expect(slots2.length).to.be.equal(24)
      expect(slots2[23][1]).to.be.equal('00:00:19')

      let slots3 = timeSlotter('00:00', '23:57', 1, {
        units: 'h',
        pushToEndTime: true
      })

      expect(slots3[0][0]).to.be.equal('00:57')
      expect(slots3.length).to.be.equal(23)
      expect(slots3[22][1]).to.be.equal('23:57')

      let slots4 = timeSlotter('00:00', '23:57', 1, {
        units: 'h',
        includeOverflow: true,
        pushToEndTime: true
      })

      expect(slots4[0][0]).to.be.equal('23:57')
      expect(slots4.length).to.be.equal(24)
      expect(slots4[23][1]).to.be.equal('23:57')

      let slots5 = timeSlotter('00:00', '23:57', 1, {
        units: 'h'
      })

      expect(slots5[0][0]).to.be.equal('00:00')
      expect(slots5.length).to.be.equal(23)
      expect(slots5[22][1]).to.be.equal('23:00')

      let slots6 = timeSlotter('00:00', '23:57', 1, {
        units: 'h',
        includeOverflow: true
      })

      expect(slots6[0][0]).to.be.equal('00:00')
      expect(slots6.length).to.be.equal(24)
      expect(slots6[23][1]).to.be.equal('00:00')
      done()
    })
  })

})