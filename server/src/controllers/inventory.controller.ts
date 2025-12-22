import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export const getInventory = async (req: Request, res: Response) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const { name, category, quantity, unit, reorderThreshold, vendor, cost } = req.body;
    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        quantity: parseInt(quantity),
        unit,
        reorderThreshold: parseInt(reorderThreshold),
        vendor,
        cost: parseFloat(cost)
      }
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit, reorderThreshold, vendor, cost } = req.body;
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        category,
        quantity: parseInt(quantity),
        unit,
        reorderThreshold: parseInt(reorderThreshold),
        vendor,
        cost: parseFloat(cost)
      }
    });
    res.json(item);
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.inventoryItem.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
