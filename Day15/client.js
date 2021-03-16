import { ChatClient, ChatThreadClient, ChatParticipant, CreateChatThreadResult } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const userIdElement = document.getElementById('userId');
const createChatThreadButton = document.getElementById('createChatThread');
const destinationGroupElement = document.getElementById('destination-group-input');
const chatContainer = document.getElementById('chat-container');
const chatInputElement = document.getElementById('chat-input');
const chatSendButton = document.getElementById('chat-send');
const userInputElement = document.getElementById('user-input');
const userAddButton = document.getElementById('user-add');


const acsEndpoint = "YOUR ACS ENDPOINT URL, FROM THE OVERVIEW PAGE IN AZURE";

let chatClient;
let threadClient;
let userIdentity;

async function init() {
  
	
  //get an access token to use
  const response = await fetch('YOUR ACS TOKEN ISSUING WEB FUNCTION URL HERE (WITH THE CODE). SEE DAY 3');
  const responseJson = await response.json(); 
  const token = responseJson.value.item2.token;
  userIdentity = responseJson.value.item1.id;
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  
  chatClient = new ChatClient(acsEndpoint, tokenCredential);
  
  connectButton.disabled = false;
  createChatThreadButton.disabled = false;
  userIdElement.innerText = userIdentity;
  
  
}
init();

connectButton.addEventListener("click", async () => {        	
    const chatThreadId = destinationGroupElement.value;
	threadClient = await chatClient.getChatThreadClient(chatThreadId);  
    
	await chatClient.startRealtimeNotifications();
    
    chatClient.on('chatMessageReceived', (message) => {
        var li = document.createElement("li");
		li.appendChild(document.createTextNode(message.content));
		chatContainer.appendChild(li);
    })
	
	
    // toggle button states
    disconnectButton.disabled = false;
    connectButton.disabled = true;
	chatSendButton.disabled = false;
	userAddButton.disabled = false;
	
});

disconnectButton.addEventListener("click", async () => {
    await call.hangUp();
  
    // toggle button states
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    
  });

chatSendButton.addEventListener("click", async () => {
	  await threadClient.sendMessage({ content: chatInputElement.value });
	  chatInputElement.value = "";
});

createChatThreadButton.addEventListener("click", async () => {

let createChatThreadResult = await chatClient.createChatThread({topic: "Day 15 Chat", participants: []});
let threadId = createChatThreadResult.chatThread.id;
alert("New thread created. ID is: " + threadId);
destinationGroupElement.value = threadId;
});

userAddButton.addEventListener("click", async () => {
	threadClient.addParticipants({participants: [{id: {communicationUserId:userInputElement.value}}]});
	alert("User added");	
});
