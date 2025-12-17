"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const router = (0, express_1.Router)();
router.post('/', booking_controller_1.createBooking);
router.get('/', booking_controller_1.getBookings);
exports.default = router;
