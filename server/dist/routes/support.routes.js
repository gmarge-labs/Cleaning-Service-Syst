"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const support_controller_1 = require("../controllers/support.controller");
const router = (0, express_1.Router)();
router.post('/contact', support_controller_1.submitContactForm);
exports.default = router;
