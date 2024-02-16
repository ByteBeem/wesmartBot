const TelegramBot=require('node-telegram-bot-api');
const bot =new TelegramBot('6536923050:AAHxQWdwv77zS2kslIDVhv3HbwA5x5GfwJ4' , {polling:true});
const googleTTS = require('google-tts-api');
const OpenAI = require('openai');


const openai = new OpenAI('YOUR_OPENAI_API_KEY');




const greetings = [
    'Hi!',
    'Hello!',
    'Hey there!',
    'Hi, how can I help you?',
    'Greetings!',
    'Good day!',
    
    'Hey!',
    'Fede!',
    'Hiya!',
    'Well, hello!',
    'Hey, what\'s up?',
    'Hola!',
    
    'I have been thinking about you😊',
    'Yo!',
    
    'How\'s it going?',
    'Hey, nice to meet you!',
    'Ahoy there!',
    'Sup?'
];

const questions = {
    'How are you?': 'I\'m doing well, thank you! 😊',
    'What time is it?': new Date().toLocaleTimeString(),
    'What is your name?': 'I\'m a friendly guy called Andries!',
    'How old are you?': 'I don\'t have an age, I\'m here to assist you!',
    'Where are you from?': 'I exist in the digital realm, but I\'m here to help users from all over!',
    'Do you like pizza?': 'I don\'t have taste buds, but many humans seem to enjoy pizza!',
    'What is the meaning of life?': 'That\'s a philosophical question! It\'s different for everyone.',
    'Tell me a joke.': 'Why couldn\'t the bicycle stand up by itself? It was two-tired!'
};


function isGreeting(message) {
    return ['hi', 'hello', 'hey'].includes(message.toLowerCase());
}


function isQuestion(message) {
    return Object.keys(questions).includes(message);
}


function sendRandomResponse(chatId, responses) {
    const randomIndex = Math.floor(Math.random() * responses.length);
    bot.sendMessage(chatId, responses[randomIndex]);
}


function answerQuestion(chatId, question) {
    const response = questions[question];
    bot.sendMessage(chatId, response);
}

async function sendJokeAsVoiceNote(chatId) {
    try {
        const jokeText = 'Why couldn\'t the bicycle stand up by itself? It was two-tired!';
        const jokeVoiceNoteUrl = await googleTTS.getAudioUrl(jokeText, {
            lang: 'en-US',
            slow: false,
            host: 'https://translate.google.com',
            gender: 'male' 
        });
        bot.sendVoice(chatId, jokeVoiceNoteUrl);
    } catch (error) {
        console.error('Error generating voice note:', error);
        bot.sendMessage(chatId, 'Sorry, I couldn\'t generate the joke voice note.');
    }
}


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    try {
        if (messageText && isGreeting(messageText)) {
            sendRandomResponse(chatId, greetings);
        } else if (messageText && isQuestion(messageText)) {
            answerQuestion(chatId, messageText);
        } else if (messageText.toLowerCase().includes('tell me a joke')) {
            sendJokeAsVoiceNote(chatId);
        } else {
            // Use OpenAI to generate response
            const response = await openai.complete({
                engine: 'davinci', 
                prompt: messageText, 
                maxTokens: 50, 
                temperature: 0.7,
                stop: '\n', 
            });

            bot.sendMessage(chatId, response.data.choices[0].text.trim());
        }
    } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'Sorry, I encountered an error.');
    }
});



bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
    Welcome to Andries, your smart CS bot!\n
    You can ask me for help with the following modules:
    - Calculus and Differentiation: /SMTH011
    - Computer Science: /SCSC011
    - Applied Mathematics: /SAPMO11
    - Logic and Organization: /Shell011
    - Statistics: /SSTS011
    `;
    bot.sendMessage(chatId, helpMessage);
});

// Command for SMTH011 (Calculus and Differentiation)
bot.onText(/\/SMTH011/, (msg) => {
    const chatId = msg.chat.id;
    const response = `
    SMTH011 - Calculus and Differentiation\n
    - Overview of calculus concepts
    - Differentiation techniques
    - Practice problems and solutions
    `;
    bot.sendMessage(chatId, response);
});

// Command for SCSC011 (Computer Science)
bot.onText(/\/SCSC011/, (msg) => {
    const chatId = msg.chat.id;
    const response = `
    SCSC011 - Computer Science\n
    - Introduction to programming languages
    - Data structures and algorithms
    - Computer architecture basics
    `;
    bot.sendMessage(chatId, response);
});

// Command for SAPMO11 (Applied Mathematics)
bot.onText(/\/SAPMO11/, (msg) => {
    const chatId = msg.chat.id;
    const response = `
    SAPMO11 - Applied Mathematics\n
    - Application of mathematical concepts in real-world scenarios
    - Case studies and examples
    `;
    bot.sendMessage(chatId, response);
});

// Command for Shell011 (Logic and Organization)
bot.onText(/\/Shell011/, (msg) => {
    const chatId = msg.chat.id;
    const response = `
    Shell011 - Logic and Organization\n
    - Introduction to logical thinking
    - Organizational strategies and techniques
    `;
    bot.sendMessage(chatId, response);
});

// Command for SSTS011 (Statistics)
bot.onText(/\/SSTS011/, (msg) => {
    const chatId = msg.chat.id;
    const response = `
    SSTS011 - Statistics\n
    - Statistical analysis methods
    - Probability theory
    `;
    bot.sendMessage(chatId, response);
});


// Error handling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});