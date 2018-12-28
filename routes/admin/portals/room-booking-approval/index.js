let express = require("express");
let router = express.Router();
let fq = require("fuzzquire");
let bookingsModel = fq("schemas/room-bookings");
let studentsModel = fq("schemas/students");
let mailer = fq("utils/mailer");
let moment = require("moment");

router.get("/", function(req, res, next) {
  bookingsModel.find(
    {
      approval: "P",
      start: {
        $gt: new moment()
      },
      blockAll: false
    },
    null,
    {
      sort: {
        start: 1
      }
    },
    function(err, bookings) {
      if (err) {
        return res.terminate(err);
      }

      res.renderState("admin/portals/room-booking-approval", {
        bookings: bookings
      });
    }
  );
});

router.get("/approve/:id", function(req, res, next) {
  bookingsModel.findOneAndUpdate(
    {
      _id: req.sanitize(req.params.id)
    },
    {
      approval: "A"
    },
    function(err, booking) {
      if (err) {
        return res.terminate(err);
      }

      console.log(booking);

      mailer.send({
        email: booking.bookedBy,
        subject: "Room Booking Approved",
        body:
          "Your booking request for room <b>" +
          booking.number +
          "</b> on <b>" +
          booking.start.toString() +
          "</b> has been <b>APPROVED</b>."
      });

      res.redirect("/admin/room-booking-approval");
    }
  );
});

router.get("/reject/:id", function(req, res, next) {
  bookingsModel.findOneAndUpdate(
    {
      _id: req.sanitize(req.params.id)
    },
    {
      approval: "R"
    },
    function(err, booking) {
      if (err) {
        return res.terminate(err);
      }

      mailer.send({
        email: booking.bookedBy,
        subject: "Room Booking Rejected",
        body:
          "Your booking request for room <b>" +
          booking.number +
          "</b> on <b>" +
          booking.start.toString() +
          "</b> has been <b>REJECTED</b>."
      });

      res.redirect("/admin/room-booking-approval");
    }
  );
});

module.exports = router;
