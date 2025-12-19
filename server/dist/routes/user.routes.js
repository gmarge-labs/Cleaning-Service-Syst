"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.get('/', user_controller_1.getAllUsers);
router.post('/', user_controller_1.createUser);
router.get('/:userId', user_controller_1.getProfile);
router.patch('/:userId', user_controller_1.updateProfile);
router.post('/:userId/password', user_controller_1.changePassword);
// Address routes
router.post('/:userId/addresses', user_controller_1.addAddress);
router.delete('/addresses/:addressId', user_controller_1.deleteAddress);
// Payment method routes
router.post('/:userId/payment-methods', user_controller_1.addPaymentMethod);
router.delete('/payment-methods/:paymentMethodId', user_controller_1.deletePaymentMethod);
exports.default = router;
