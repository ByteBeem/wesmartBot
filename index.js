const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const googleTTS = require('google-tts-api');
const OpenAI = require('openai');
const { createWorker } = require('tesseract.js');



const app = express();


app.use(bodyParser.json());

const token = process.env.BOT_TOKEN || '6536923050:AAHxQWdwv77zS2kslIDVhv3HbwA5x5GfwJ4';
const bot = new TelegramBot(token);

const openai = new OpenAI({
    apiKey:  process.env.openai ,
});



const feeMessage = "🔒 To unlock the feature of sending questions that are on images you have to pay a monthly fee of R30 to CapitecAccount: 2054670215 and use your Telegram number as reference.💰✨";

const vnMessage = "🔒 To unlock the feature of sending questions that are on voice notes you have to pay a monthly fee of R30 to CapitecAccount: 2054670215 and use your Telegram number as reference.💰✨";
const greetings = [
    'Hi!',
    'Hello!',
    'Hey there!',
    'Hi, how can I help you?',
    'Greetings!',
    'Good day!',
    
    'Hey!',
   
    'Well, hello!',
    'Hey, what\'s up?',
    'Hola!',
    
    'I have been thinking about you😊',
    'Yo!',
    
    'How\'s it going?',
    'Hey, nice to meet you!',

    'Sup?'
];




function isGreeting(message) {
    return ['hi', 'hello', 'hey' , 'how are you' ].includes(message.toLowerCase());
}

function sendRandomResponse(chatId, responses) {
    const randomIndex = Math.floor(Math.random() * responses.length);
    bot.sendMessage(chatId, responses[randomIndex]);
}


const textbooks = {
    "SMTH011": {
        
        pdfUrl: "https://firebasestorage.googleapis.com/v0/b/wesmart-a981c.appspot.com/o/Test_1_SMTH011.pdf?alt=media&token=f413a97b-428e-42e3-b2bc-5576acceabca",
    },
    "SCSC011": {
        name: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell, Peter Norvig",
        publicationYear: 2021,
        
    },
   
};


function containsModuleNames(text) {
    const moduleNames = ['SMTH011', 'SCSC011', 'SAPMO11', 'SSTS011']; 
    const regex = new RegExp(`\\b(${moduleNames.join('|')})\\b`, 'gi'); 
    console.log(regex.test(text));
    return regex.test(text);
}



function respondWithTextbookInfo(chatId, moduleName) {
    const textbook = textbooks[moduleName];
    if (textbook && textbook.pdfUrl) {
        // Send textbook information
        const message ='let me check....'
        bot.sendMessage(chatId, message);

        
        bot.sendDocument(chatId, textbook.pdfUrl, { caption: `PDF document for ${moduleName}` })
            .then(() => {
                console.log('PDF document sent successfully');
            })
            .catch((error) => {
                console.error('Error sending PDF document:', error);
            });
    } else {
        bot.sendMessage(chatId, 'Textbook information not found for the specified module.');
    }
}

async function extractImage(ctx) {
    try {
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        const photoUrl = await ctx.telegram.getFileLink(photo.file_id);
        
        const { data: { text } } = await worker.recognize(photoUrl);

        console.log("img data ", text)
        
        // Process the extracted text
       // const response = await main(text);
        
        // Send the response back to the user
       // ctx.reply(response);
    } catch (error) {
        console.error('Error extracting text from image:', error);
        ctx.reply('Sorry, I encountered an error processing the image.');
    }
}


async function sendVoiceNotes(chatId, text) {
    try {
         {
            const VoiceNoteUrl = googleTTS.getAudioUrl(text, {
                lang: 'en',
                slow: false,
                host: 'https://translate.google.com',
                gender: 'male' 
            });
            console.log(VoiceNoteUrl);
            await bot.sendVoice(chatId, VoiceNoteUrl);
        }
    } catch (error) {
        console.error('Error generating voice notes:', error);
        bot.sendMessage(chatId, 'Sorry.');
    }
}



async function main(userMessage) {
    try {
        
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', 
            messages: [{ role: "user", content: userMessage }],
            stream: true,
        });
        
       
        let output = '';
        for await (const chunk of response) {
            output += chunk.choices[0]?.delta?.content || "";
           
        }

        
        return output;
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry! Im getting lot of requests right now , try again in 10min.';
    }
}

function chooseOptions(chatId) {
    const moduleNames = ['SMTH011', 'SCSC011', 'SAPMO11', 'SSTS011']; 
    const options = moduleNames.map((moduleName, index) => [{ text: moduleName, callback_data: moduleName }]);
    const keyboardMarkup = {
        inline_keyboard: options
    };
    bot.sendMessage(chatId, 'Please choose a module:', { reply_markup: keyboardMarkup });
}



bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const chosenModuleName = callbackQuery.data;
   
    respondWithTextbookInfo(chatId, [chosenModuleName]);
});



bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    try {
        if (msg.photo) {
          
            bot.sendMessage(chatId, feeMessage);
        }
       else  if (msg.audio) {
           
            bot.sendMessage(chatId, vnMessage);
        }
        else if (messageText && isGreeting(messageText)) {
            sendRandomResponse(chatId, greetings);
        } 
        else if (messageText === '/start'){
            bot.sendMessage(chatId, 'Hello');
        }
        
        else if (containsModuleNames(messageText)) {
            chooseOptions(chatId); 
            
        
        } else {
           
            const response = await main(messageText);
           
            bot.sendMessage(chatId, response);
            }
        
       
    } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'Sorry, I encountered an error.');
    }
});






bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "i have been waiting for you😊");
});



app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express server is listening on port ${port}`);
});


bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});
