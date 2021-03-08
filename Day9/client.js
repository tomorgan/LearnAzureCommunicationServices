import { CallClient, CallAgent } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const callStateElement = document.getElementById('call-state');
const destinationUserElement = document.getElementById('destination-user-input');
const muteButton = document.getElementById('mute-button');
const unmuteButton = document.getElementById('unmute-button');

let call;
let callAgent;
let callClient;

async function init() {
    
  callClient = new CallClient();
	
  //get an access token to use
  const response = await fetch('YOUR ACS TOKEN ISSUING WEB FUNCTION URL HERE (WITH THE CODE). SEE DAY 3');
  const responseJson = await response.json(); 
  const token = responseJson.value.item2.token;
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  callAgent = await callClient.createCallAgent(tokenCredential);
  connectButton.disabled = false;
}
init();

connectButton.addEventListener("click", () => {        	
    const destinationToCall = { communicationUserId: destinationUserElement.value};
	call = callAgent.startCall([destinationToCall]);
    
    call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    })
	
    // toggle button states
    disconnectButton.disabled = false;
    connectButton.disabled = true;
	muteButton.disabled = false;
	unmuteButton.disabled = false;
	
});

disconnectButton.addEventListener("click", async () => {
    await call.hangUp();
  
    // toggle button states
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    callStateElement.innerText = '-';
  });

muteButton.addEventListener("click", async () => {
	await call.mute();
});

unmuteButton.addEventListener("click", async () => {
	await call.unmute();
});
