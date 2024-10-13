const express = require('express');
const router = express.Router();
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.use(passport.authenticate('jwt', { session: false }));

router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, currentStep, notes } = req.body;
        const lead = await prisma.lead.create({
            data: { firstName, lastName, email, phone, currentStep, notes, userId: req.user.id },
        });
        res.status(201).json(lead);
    } catch (error) {
        res.status(500).json({ error: 'Error creating lead' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, currentStep, notes } = req.body;
        const lead = await prisma.lead.update({
            where: { id, userId: req.user.id },
            data: { firstName, lastName, email, phone, currentStep, notes },
        });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: 'Error updating lead' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await prisma.lead.findUnique({
            where: { id, userId: req.user.id },
        });
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json(lead);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching lead' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.lead.delete({
            where: { id, userId: req.user.id },
        });
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting lead' });
    }
});

router.get('/', async (req, res) => {
    try {
        const leads = await prisma.lead.findMany({
            where: { userId: req.user.id },
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching leads' });
    }
});

module.exports = router;