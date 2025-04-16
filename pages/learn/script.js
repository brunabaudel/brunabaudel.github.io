// Worker URL - update this with your Cloudflare Worker URL
const WORKER_URL = 'https://language-learning-worker.brubaudel-8f1.workers.dev';

// Application State
const appState = {
    language: '',
    level: '',
    apiKey: '',
    userId: '',
    words: [],
    currentWordIndex: 0,
    knownWords: [],
    skipWords: [],
    isFlipped: false,
    sessionKnownCount: 0,  // Track words known in current session
    isLoading: false
};

// DOM Elements
const elements = {
    setupContainer: document.getElementById('setupContainer'),
    appContent: document.getElementById('appContent'),
    flashcardContainer: document.getElementById('flashcardContainer'),
    storyContainer: document.getElementById('storyContainer'),
    loadingContainer: document.getElementById('loadingContainer'),
    loadingText: document.getElementById('loadingText'),
    errorContainer: document.getElementById('errorContainer'),
    languageSelect: document.getElementById('language'),
    levelSelect: document.getElementById('level'),
    apiKeyInput: document.getElementById('apiKey'),
    startLearningBtn: document.getElementById('startLearningBtn'),
    flashcard: document.getElementById('flashcard'),
    cardFront: document.getElementById('cardFront'),
    cardBack: document.getElementById('cardBack'),
    flipCardBtn: document.getElementById('flipCardBtn'),
    knownWordBtn: document.getElementById('knownWordBtn'),
    skipWordBtn: document.getElementById('skipWordBtn'),
    knownWordsList: document.getElementById('knownWordsList'),
    emptyWordsMessage: document.getElementById('emptyWordsMessage'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    storyText: document.getElementById('storyText'),
    regenerateStoryBtn: document.getElementById('regenerateStoryBtn'),
    backToFlashcardsBtn: document.getElementById('backToFlashcardsBtn')
};

// Initialize the application
function init() {
    // Generate a random user ID if not already stored
    if (!localStorage.getItem('languageLearningUserId')) {
        localStorage.setItem('languageLearningUserId', generateUserId());
    }
    appState.userId = localStorage.getItem('languageLearningUserId');
    
    // Set up event listeners
    elements.startLearningBtn.addEventListener('click', startLearning);
    elements.flipCardBtn.addEventListener('click', flipCard);
    elements.knownWordBtn.addEventListener('click', markAsKnown);
    elements.skipWordBtn.addEventListener('click', skipWord);
    elements.regenerateStoryBtn.addEventListener('click', regenerateStory);
    elements.backToFlashcardsBtn.addEventListener('click', goBackToFlashcards);
    
    // Allow clicking the card to flip it
    elements.flashcard.addEventListener('click', flipCard);
}

// Generate a random user ID
function generateUserId() {
    return 'user_' + Math.random().toString(36).substring(2, 15);
}

// Start the learning session
async function startLearning() {
    try {
        // Get user inputs
        appState.language = elements.languageSelect.value;
        appState.level = elements.levelSelect.value;
        appState.apiKey = elements.apiKeyInput.value.trim();
        
        // Reset session known count
        appState.sessionKnownCount = 0;
        // Reset words arrays
        appState.words = [];
        appState.skipWords = [];
        appState.currentWordIndex = 0;
        
        // Show loading state with specific message
        showLoading(true, "Loading word database");
        
        // Hide setup container
        elements.setupContainer.classList.add('hidden');
        
        // First, try to fetch any existing saved words for this user
        await fetchSavedWords();
        
        // Update loading message
        updateLoadingText("Preparing your vocabulary list");
        
        // Always fetch new words to ensure variety
        await fetchWords();
        
        // Update loading message
        updateLoadingText("Setting up your learning session");
        
        // Add a small delay to make loading visible (for visual feedback)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Setup UI for learning
        setupLearningUI();
        updateProgress();
        
        // Show the first word
        showCurrentWord();
        
        // Hide loading
        showLoading(false);
    } catch (error) {
        showError(error.message || 'Failed to start learning session');
        showLoading(false);
        
        // Go back to setup if there's an error
        elements.setupContainer.classList.remove('hidden');
    }
}

// Update loading text
function updateLoadingText(message) {
    elements.loadingText.textContent = message;
}

// Fetch saved words from the worker
async function fetchSavedWords() {
    try {
        const response = await fetch(`${WORKER_URL}/get-saved-words`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: appState.userId,
                language: appState.language,
                level: appState.level
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch saved words');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Get all words
            const allWords = data.words || [];
            
            // Sort out known vs. unknown words
            appState.knownWords = allWords.filter(word => word.known === true);
            appState.words = allWords.filter(word => !word.known);
            
            // Update the UI
            updateKnownWordsList();
        }
    } catch (error) {
        console.error('Error fetching saved words:', error);
        // Continue with empty words array
        appState.words = [];
        appState.knownWords = [];
    }
}

// Fetch new words from the worker
async function fetchWords() {
    try {
        const response = await fetch(`${WORKER_URL}/fetch-words`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language: appState.language,
                level: appState.level,
                userId: appState.userId,
                apiKey: appState.apiKey,
                // Add a parameter to request fresh words
                refreshWords: appState.words.length < 5
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch words');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // The worker returns all words including previously saved ones
            const allServerWords = data.words || [];
            
            // Find words that are marked as known
            const serverKnownWords = allServerWords.filter(word => word.known === true);
            
            // Add any server known words that aren't in our local known words array
            const localKnownWordIds = new Set(appState.knownWords.map(w => w.word));
            const newKnownWords = serverKnownWords.filter(word => !localKnownWordIds.has(word.word));
            
            // Merge known words (keeping all previously known words)
            appState.knownWords = [...appState.knownWords, ...newKnownWords];
            
            // Get words that are not known
            const newWords = allServerWords.filter(word => !word.known);
            
            // Check if we already have some of these words
            const existingWordIds = new Set(appState.words.map(w => w.word));
            
            // Filter out words we already have to avoid duplicates
            const uniqueNewWords = newWords.filter(word => !existingWordIds.has(word.word));
            
            // Add unique new words to our list
            appState.words = appState.words.concat(uniqueNewWords);
            
            // Shuffle all words to create variety
            for (let i = appState.words.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [appState.words[i], appState.words[j]] = [appState.words[j], appState.words[i]];
            }
            
            // Update the UI
            updateKnownWordsList();
        } else {
            throw new Error(data.error || 'Failed to fetch words');
        }
    } catch (error) {
        throw error;
    }
}

// Setup the learning UI
function setupLearningUI() {
    elements.setupContainer.classList.add('hidden');
    elements.appContent.classList.remove('hidden');
    elements.appContent.classList.add('fade-in');
    elements.flashcardContainer.classList.remove('hidden');
    elements.storyContainer.classList.add('hidden');
}

// Show or hide loading state
function showLoading(isLoading, message = "Loading") {
    appState.isLoading = isLoading;
    
    if (isLoading) {
        // Update loading message if provided
        if (message) {
            updateLoadingText(message);
        }
        
        elements.loadingContainer.classList.remove('hidden');
        elements.loadingContainer.classList.add('fade-in');
    } else {
        elements.loadingContainer.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    elements.errorContainer.textContent = message;
    elements.errorContainer.classList.remove('hidden');
    
    // Hide after 5 seconds
    setTimeout(() => {
        elements.errorContainer.classList.add('hidden');
    }, 5000);
}

// Show the current word
function showCurrentWord() {
    if (appState.words.length === 0 || appState.currentWordIndex >= appState.words.length) {
        // No more words to show
        if (appState.sessionKnownCount >= 10) {
            generateStory();
        } else {
            // Show loading while fetching more words
            showLoading(true, "Fetching more vocabulary");
            
            // Fetch more words
            fetchWords().then(() => {
                appState.currentWordIndex = 0;
                showCurrentWord();
                showLoading(false);
            }).catch(error => {
                showError(error.message || 'Failed to fetch more words');
                showLoading(false);
            });
        }
        return;
    }
    
    const currentWord = appState.words[appState.currentWordIndex];
    elements.cardFront.textContent = currentWord.word;
    elements.cardBack.textContent = currentWord.translation;
    
    // Reset flip state
    appState.isFlipped = false;
    elements.flashcard.classList.remove('flipped');
}

// Flip the flashcard
function flipCard() {
    if (appState.isLoading) return; // Prevent flipping during loading
    
    appState.isFlipped = !appState.isFlipped;
    
    if (appState.isFlipped) {
        elements.flashcard.classList.add('flipped');
    } else {
        elements.flashcard.classList.remove('flipped');
    }
}

// Mark the current word as known
function markAsKnown() {
    if (appState.isLoading) return; // Prevent action during loading
    
    if (appState.currentWordIndex < appState.words.length) {
        const word = appState.words[appState.currentWordIndex];
        word.known = true;
        
        // Add to known words if not already there
        if (!appState.knownWords.some(knownWord => knownWord.word === word.word)) {
            appState.knownWords.push(word);
        }
        
        // Remove from words array
        appState.words.splice(appState.currentWordIndex, 1);
        
        // Update known words list
        updateKnownWordsList();
        
        // Increment session known count and update progress
        appState.sessionKnownCount++;
        updateProgress();
        
        // Check if we have enough known words for a story (in this session)
        if (appState.sessionKnownCount >= 10) {
            generateStory();
        } else {
            // Show the next word (we don't increment index since we removed this word)
            showCurrentWord();
        }
        
        // Save the updated state to the worker
        saveWordsToWorker();
    }
}

// Skip the current word
function skipWord() {
    if (appState.isLoading) return; // Prevent action during loading
    
    if (appState.currentWordIndex < appState.words.length) {
        // Move the current word to the end of the array instead of using a separate skipWords array
        const skippedWord = appState.words[appState.currentWordIndex];
        appState.words.splice(appState.currentWordIndex, 1); // Remove from current position
        appState.words.push(skippedWord); // Add to the end
        
        // If we've reached the end of the array, shuffle the words to create variety
        if (appState.currentWordIndex >= appState.words.length) {
            appState.currentWordIndex = 0;
            
            // Simple shuffle algorithm to randomize word order
            for (let i = appState.words.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [appState.words[i], appState.words[j]] = [appState.words[j], appState.words[i]];
            }
        }
        
        showCurrentWord();
    }
}

// Update the known words list UI
function updateKnownWordsList() {
    if (appState.knownWords.length === 0) {
        elements.emptyWordsMessage.classList.remove('hidden');
        return;
    }
    
    elements.emptyWordsMessage.classList.add('hidden');
    elements.knownWordsList.innerHTML = '';
    
    // Sort known words alphabetically
    const sortedWords = [...appState.knownWords].sort((a, b) => a.word.localeCompare(b.word));
    
    sortedWords.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.classList.add('word-item');
        wordItem.innerHTML = `
            <span>${word.word}</span>
            <span>${word.translation}</span>
        `;
        elements.knownWordsList.appendChild(wordItem);
    });
}

// Update the progress bar and text
function updateProgress() {
    const knownCount = appState.sessionKnownCount;
    const goal = 10;
    const percentage = Math.min(100, (knownCount / goal) * 100);
    
    elements.progressBar.style.width = `${percentage}%`;
    elements.progressText.textContent = `Words known: ${knownCount}/${goal}`;
}

// Generate a story using the known words
async function generateStory() {
    try {
        showLoading(true, "Creating your personalized story");
        
        const response = await fetch(`${WORKER_URL}/generate-story`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language: appState.language,
                level: appState.level,
                userId: appState.userId,
                apiKey: appState.apiKey
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate story');
        }
        
        const data = await response.json();
        
        if (data.success) {
            elements.storyText.textContent = data.story;
            
            // Add a small delay to make loading visible
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Show story container, hide flashcard container
            elements.flashcardContainer.classList.add('hidden');
            elements.storyContainer.classList.remove('hidden');
            elements.storyContainer.classList.add('fade-in');
        } else {
            throw new Error(data.error || 'Failed to generate story');
        }
        
        showLoading(false);
    } catch (error) {
        showError(error.message || 'Failed to generate story');
        showLoading(false);
        
        // Go back to flashcards if story generation fails
        elements.flashcardContainer.classList.remove('hidden');
    }
}

// Regenerate the story with the same known words
function regenerateStory() {
    generateStory();
}

// Go back to flashcards to learn more words
function goBackToFlashcards() {
    showLoading(true, "Preparing new vocabulary words");
    
    elements.storyContainer.classList.add('hidden');
    
    // Reset the current word index
    appState.currentWordIndex = 0;
    
    // Reset progress count for new learning session
    appState.sessionKnownCount = 0;
    updateProgress();
    
    // Fetch new words for flashcards
    fetchWords().then(() => {
        elements.flashcardContainer.classList.remove('hidden');
        elements.flashcardContainer.classList.add('fade-in');
        showCurrentWord();
        showLoading(false);
    }).catch(error => {
        showError(error.message || 'Failed to fetch more words');
        showLoading(false);
        // Still show the flashcard container even if fetching fails
        elements.flashcardContainer.classList.remove('hidden');
    });
}

// Save the current words state to the worker
async function saveWordsToWorker() {
    try {
        const response = await fetch(`${WORKER_URL}/save-words`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: appState.userId,
                language: appState.language,
                level: appState.level,
                // Save both known and unknown words
                words: [...appState.knownWords, ...appState.words]
            })
        });
        
        if (!response.ok) {
            console.error('Error saving words: Server returned non-OK status');
        }
    } catch (error) {
        console.error('Error saving words:', error);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);