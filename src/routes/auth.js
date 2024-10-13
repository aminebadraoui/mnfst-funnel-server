const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        // Generate token for the new user
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // TODO: Implement password reset logic here
        // This could involve generating a reset token, saving it to the database,
        // and sending an email to the user with a link to reset their password
        res.json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
        res.status(500).json({ error: 'Error processing password reset request' });
    }
});

module.exports = router;