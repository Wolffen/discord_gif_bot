const { Client, Events, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

// Conditionally load dotenv lib if this isn't running in production
if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const token = process.env.DISCORD_TOKEN;
const giphy_key = process.env.GIPHY_API_KEY;
const giphyUrl = "http://api.giphy.com/v1/gifs/search";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, // FYI -- this intent is what you need to read messages in a channel!
        GatewayIntentBits.MessageContent
    ]
});

client.once(Events.ClientReady, c => {
    console.info(`Ready! Logged in as ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {

    try {
        if (message.author.bot) return; // don't run this for bots
    
        // Only hit Giphy if the command is in the right format -- :some text here.gif:
        if (message.content[0] !== ":" || message.content.slice(-5) !== ".gif:") 
        {
            return;
        }

        const searchText = message.content.slice(1, -5).split().join(" ");
        
        const giphyRequest = `${giphyUrl}?q=${searchText}&api_key=${giphy_key}`;
        try {
            const giphyResponse = await fetch(giphyRequest);
            
            if (!giphyResponse.ok) {
                throw new Error(`Error calling Giphy API; status ${giphyResponse.status}`);
            }
            
            const jsonData = await giphyResponse.json();
            if (jsonData.length === 0) {
                message.channel.send("Sorry, I couldn't find any appropriate gifs. :(");
            }

            const randomIndex = Math.floor(Math.random() * jsonData.data.length);
            message.channel.send(jsonData.data[randomIndex].url);    
        }
        catch (error) {
            console.error('Error calling Giphy API', error);
        }
        
    } catch (error) {
        console.error("Error processing request", error);
    }
    
});

client.login(token);