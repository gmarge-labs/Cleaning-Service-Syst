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
exports.deleteInventoryItem = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventory = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prisma_1.default.inventoryItem.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(items);
    }
    catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getInventory = getInventory;
const createInventoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, category, quantity, unit, reorderThreshold, vendor, cost } = req.body;
        const item = yield prisma_1.default.inventoryItem.create({
            data: {
                name,
                category,
                quantity: parseInt(quantity),
                baseUnit: unit,
                reorderThreshold: parseInt(reorderThreshold),
                vendor,
                cost: parseFloat(cost)
            }
        });
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Create inventory item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createInventoryItem = createInventoryItem;
const updateInventoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, category, quantity, unit, reorderThreshold, vendor, cost } = req.body;
        const item = yield prisma_1.default.inventoryItem.update({
            where: { id },
            data: {
                name,
                category,
                quantity: parseInt(quantity),
                baseUnit: unit,
                reorderThreshold: parseInt(reorderThreshold),
                vendor,
                cost: parseFloat(cost)
            }
        });
        res.json(item);
    }
    catch (error) {
        console.error('Update inventory item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateInventoryItem = updateInventoryItem;
const deleteInventoryItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.inventoryItem.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete inventory item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteInventoryItem = deleteInventoryItem;
