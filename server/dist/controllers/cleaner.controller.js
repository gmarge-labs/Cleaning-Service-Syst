"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationStatus = exports.getApplications = exports.submitApplication = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const email_service_1 = require("../utils/email.service");
const submitApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, phone, dateOfBirth, gender, address, city, state, zipCode, ssn, idUrl, reference1Name, reference1Phone, reference1Relationship, reference1RelationshipOther, reference1Address, reference1City, reference1State, reference2Name, reference2Phone, reference2Relationship, reference2RelationshipOther, reference2Address, reference2City, reference2State, agreedToBackgroundCheck, agreedToTerms } = req.body;
        // Using any cast for cleanerApplication as the editor's TS server might not have picked up the generated types yet
        const application = yield prisma_1.default.cleanerApplication.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: (dateOfBirth && !isNaN(Date.parse(dateOfBirth))) ? new Date(dateOfBirth) : new Date(),
                gender,
                address,
                city,
                state,
                zipCode,
                ssn,
                idUrl,
                reference1Name,
                reference1Phone,
                reference1Relationship,
                reference1RelationshipOther,
                reference1Address,
                reference1City,
                reference1State,
                reference2Name,
                reference2Phone,
                reference2Relationship,
                reference2RelationshipOther,
                reference2Address,
                reference2City,
                reference2State,
                agreedToBackgroundCheck: !!agreedToBackgroundCheck,
                agreedToTerms: !!agreedToTerms,
                status: 'PENDING'
            },
        });
        // Create a notification for admins
        const admins = yield prisma_1.default.user.findMany({
            where: { role: 'ADMIN' }
        });
        for (const admin of admins) {
            yield prisma_1.default.notification.create({
                data: {
                    userId: admin.id,
                    type: 'cleaner_application',
                    title: 'New Cleaner Application',
                    message: `New application from ${application.firstName} ${application.lastName}`,
                    data: {
                        applicationId: application.id,
                        applicantName: `${application.firstName} ${application.lastName}`
                    }
                }
            });
        }
        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });
    }
    catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.submitApplication = submitApplication;
const getApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = yield prisma_1.default.cleanerApplication.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(applications);
    }
    catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getApplications = getApplications;
const updateApplicationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const application = yield prisma_1.default.cleanerApplication.update({
            where: { id },
            data: { status }
        });
        // Send email notification based on status
        if (status === 'ACCEPTED') {
            yield (0, email_service_1.sendApplicationAccepted)(application);
        }
        else if (status === 'REJECTED') {
            yield (0, email_service_1.sendApplicationRejected)(application);
        }
        res.json({
            message: 'Application status updated successfully',
            application
        });
    }
    catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateApplicationStatus = updateApplicationStatus;
