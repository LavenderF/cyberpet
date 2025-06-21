const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/virtualpet', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Pet Schema
const petSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    hunger: { type: Number, default: 50 },
    happiness: { type: Number, default: 50 },
    cleanliness: { type: Number, default: 50 },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Pet = mongoose.model('Pet', petSchema);

// JWT Secret
const JWT_SECRET = 'your-secret-key';

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Routes
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({ username, password: hashedPassword });
        await user.save();
        
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('User not found');
    
    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.get('/pet', authenticateToken, async (req, res) => {
    try {
        const pet = await Pet.findOne({ userId: req.user.userId });
        if (!pet) return res.status(404).send('No pet found');
        
        res.json(pet);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/pet', authenticateToken, async (req, res) => {
    try {
        const { name, type } = req.body;
        
        const existingPet = await Pet.findOne({ userId: req.user.userId });
        if (existingPet) return res.status(400).send('User already has a pet');
        
        const pet = new Pet({ 
            userId: req.user.userId,
            name,
            type
        });
        
        await pet.save();
        res.status(201).json(pet);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/pet/interact', authenticateToken, async (req, res) => {
    try {
        const { action } = req.body;
        
        const pet = await Pet.findOne({ userId: req.user.userId });
        if (!pet) return res.status(404).send('No pet found');
        
        switch(action) {
            case 'feed':
                pet.hunger = Math.min(100, pet.hunger + 15);
                pet.happiness = Math.min(100, pet.happiness + 5);
                break;
            case 'play':
                pet.happiness = Math.min(100, pet.happiness + 20);
                pet.hunger = Math.max(0, pet.hunger - 5);
                break;
            case 'clean':
                pet.cleanliness = Math.min(100, pet.cleanliness + 30);
                pet.happiness = Math.min(100, pet.happiness + 10);
                break;
            default:
                return res.status(400).send('Invalid action');
        }
        
        // Add XP and check level up
        pet.xp += 5;
        const xpNeeded = pet.level * 100;
        if (pet.xp >= xpNeeded) {
            pet.level++;
            pet.xp = 0;
        }
        
        await pet.save();
        res.json(pet);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
