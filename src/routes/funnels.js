const express = require('express');
const router = express.Router();
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/check/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const funnel = await prisma.funnel.findFirst({
            where: { name, userId: req.user.id },
        });
        if (funnel) {
            res.status(200).json({ exists: true });
        } else {
            res.status(404).json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error checking funnel existence' });
    }
});

router.post('/', async (req, res) => {
    try {
        let { name, steps } = req.body;
        const userId = req.user.id;

        console.log("body", req.body);

        // Check if a funnel with the same name exists for this user
        // Check if a funnel with the same name exists for this user
        let existingFunnels = await prisma.funnel.findMany({
            where: {
                userId,
                name: {
                    startsWith: name.replace(/ \(\d+\)$/, '')
                }
            },
            select: { name: true }
        });

        console.log("existingFunnels", existingFunnels)

        if (existingFunnels.length > 0) {
            // If funnels with the same name exist, find the highest suffix
            const suffixRegex = /\((\d+)\)$/;
            let highestSuffix = 0;

            existingFunnels.forEach(funnel => {
                const match = funnel.name.match(suffixRegex);
                if (match) {
                    const suffix = parseInt(match[1]);
                    highestSuffix = Math.max(highestSuffix, suffix);
                }
            });

            // Append the new suffix
            name = `${name.replace(/ \(\d+\)$/, '')} (${highestSuffix + 1})`;
            console.log("newName", name)
            console.log("highestSuffix", highestSuffix)
            console.log("highestSuffix + 1", highestSuffix + 1)
        }

        const funnel = await prisma.funnel.create({
            data: { name, steps, userId },
        });
        console.log("funnel", funnel);
        res.status(201).json({ name: funnel.name }); // Return the new funnel name
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating funnel' });
    }
});

router.put('/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { steps } = req.body;
        const funnel = await prisma.funnel.updateMany({
            where: {
                name: name,
                userId: req.user.id
            },
            data: { steps },
        });
        if (funnel.count === 0) {
            return res.status(404).json({ error: 'Funnel not found' });
        }

        console.log("funnel", funnel)
        console.log("funnel.name", funnel.name)
        res.json({
            name: name,
            message: 'Funnel updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating funnel' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const funnel = await prisma.funnel.findUnique({
            where: { id, userId: req.user.id },
        });
        if (!funnel) {
            return res.status(404).json({ error: 'Funnel not found' });
        }
        res.json(funnel);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching funnel' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.funnel.delete({
            where: { id, userId: req.user.id },
        });
        res.json({ message: 'Funnel deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting funnel' });
    }
});

router.get('/', async (req, res) => {
    try {
        const funnels = await prisma.funnel.findMany({
            where: { userId: req.user.id },
        });
        res.json(funnels);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching funnels' });
    }
});

module.exports = router;