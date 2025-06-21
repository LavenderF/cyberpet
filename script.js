// Global variables
let currentUser = null;
let pet = {
    name: "Unnamed",
    type: null,
    hunger: 50,
    happiness: 50,
    cleanliness: 50,
    level: 1,
    xp: 0
};

let selectedPetType = null;

// DOM Elements
const petElement = document.getElementById('pet');
const petNameElement = document.getElementById('pet-name');
const hungerElement = document.getElementById('hunger');
const happinessElement = document.getElementById('happiness');
const cleanlinessElement = document.getElementById('cleanliness');
const levelElement = document.getElementById('level');
const petSection = document.getElementById('pet-section');
const shopSection = document.getElementById('shop-section');

// Initialize the app
function init() {
    // Check if user is logged in (in a real app, this would check with backend)
    const savedUser = localStorage.getItem('virtualPetUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('username-display').textContent = currentUser.username;
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('register-btn').classList.add('hidden');
        
        // Load pet data
        const savedPet = localStorage.getItem('virtualPet');
        if (savedPet) {
            pet = JSON.parse(savedPet);
            updatePetDisplay();
        }
    }
    
    // Set up event listeners
    document.getElementById('login-btn').addEventListener('click', showLogin);
    document.getElementById('register-btn').addEventListener('click', showRegister);
    
    // Start the game loop
    setInterval(gameLoop, 60000); // Update every minute
}

// Game loop that decreases stats over time
function gameLoop() {
    if (pet.type) {
        pet.hunger = Math.max(0, pet.hunger - 5);
        pet.happiness = Math.max(0, pet.happiness - 3);
        pet.cleanliness = Math.max(0, pet.cleanliness - 2);
        
        updatePetDisplay();
        savePet();
        checkPetStatus();
    }
}

// Update all pet displays
function updatePetDisplay() {
    hungerElement.textContent = pet.hunger;
    happinessElement.textContent = pet.happiness;
    cleanlinessElement.textContent = pet.cleanliness;
    levelElement.textContent = pet.level;
    petNameElement.textContent = pet.name;
    
    // Update pet appearance based on stats
    if (pet.hunger < 20) {
        petElement.classList.add('pet-hungry');
        petElement.classList.remove('pet-happy', 'pet-idle');
    } else if (pet.happiness > 70) {
        petElement.classList.add('pet-happy');
        petElement.classList.remove('pet-hungry', 'pet-idle');
    } else {
        petElement.classList.add('pet-idle');
        petElement.classList.remove('pet-hungry', 'pet-happy');
    }
}

// Pet interaction functions
function feedPet() {
    if (!pet.type) return;
    
    pet.hunger = Math.min(100, pet.hunger + 15);
    pet.happiness = Math.min(100, pet.happiness + 5);
    addXP(5);
    
    // Animation
    petElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        petElement.style.transform = 'scale(1)';
    }, 300);
    
    updatePetDisplay();
    savePet();
}

function playWithPet() {
    if (!pet.type) return;
    
    pet.happiness = Math.min(100, pet.happiness + 20);
    pet.hunger = Math.max(0, pet.hunger - 5);
    addXP(10);
    
    // Animation
    petElement.style.animation = 'none';
    void petElement.offsetWidth; // Trigger reflow
    petElement.style.animation = 'bounce 0.5s 3';
    
    updatePetDisplay();
    savePet();
}

function cleanPet() {
    if (!pet.type) return;
    
    pet.cleanliness = Math.min(100, pet.cleanliness + 30);
    pet.happiness = Math.min(100, pet.happiness + 10);
    addXP(3);
    
    // Animation
    petElement.classList.add('pet-clean');
    setTimeout(() => {
        petElement.classList.remove('pet-clean');
    }, 1000);
    
    updatePetDisplay();
    savePet();
}

function addXP(amount) {
    pet.xp += amount;
    const xpNeeded = pet.level * 100;
    if (pet.xp >= xpNeeded) {
        pet.level++;
        pet.xp = 0;
        alert(`Your pet leveled up to level ${pet.level}!`);
    }
}

function checkPetStatus() {
    if (pet.hunger <= 0 || pet.happiness <= 0) {
        alert('Your pet is not doing well! Please take care of it!');
    }
}

// Pet adoption functions
function adoptPet() {
    petSection.classList.add('hidden');
    shopSection.classList.remove('hidden');
}

function selectPetType(type) {
    selectedPetType = type;
    const options = document.querySelectorAll('.pet-option');
    options.forEach(opt => opt.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function confirmAdoption() {
    if (!selectedPetType) {
        alert('Please select a pet type');
        return;
    }
    
    const nameInput = document.getElementById('pet-name-input');
    if (!nameInput.value.trim()) {
        alert('Please name your pet');
        return;
    }
    
    pet = {
        name: nameInput.value.trim(),
        type: selectedPetType,
        hunger: 50,
        happiness: 50,
        cleanliness: 50,
        level: 1,
        xp: 0
    };
    
    // Set pet image based on type
    switch(selectedPetType) {
        case 'dog':
            petElement.style.backgroundImage = 'url("images/dog.png")';
            break;
        case 'cat':
            petElement.style.backgroundImage = 'url("images/cat.png")';
            break;
        case 'dragon':
            petElement.style.backgroundImage = 'url("images/dragon.png")';
            break;
    }
    
    petSection.classList.remove('hidden');
    shopSection.classList.add('hidden');
    
    updatePetDisplay();
    savePet();
}

// User system functions (simplified for demo)
function showLogin() {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    
    // In a real app, this would validate with backend
    currentUser = { username, password };
    localStorage.setItem('virtualPetUser', JSON.stringify(currentUser));
    document.getElementById('username-display').textContent = username;
    document.getElementById('login-btn').classList.add('hidden');
    document.getElementById('register-btn').classList.add('hidden');
    
    // Load any existing pet
    const savedPet = localStorage.getItem('virtualPet');
    if (savedPet) {
        pet = JSON.parse(savedPet);
        updatePetDisplay();
    }
}

function showRegister() {
    const username = prompt('Choose a username:');
    const password = prompt('Choose a password:');
    
    // In a real app, this would send to backend
    currentUser = { username, password };
    localStorage.setItem('virtualPetUser', JSON.stringify(currentUser));
    document.getElementById('username-display').textContent = username;
    document.getElementById('login-btn').classList.add('hidden');
    document.getElementById('register-btn').classList.add('hidden');
}

function savePet() {
    if (currentUser) {
        localStorage.setItem('virtualPet', JSON.stringify(pet));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
