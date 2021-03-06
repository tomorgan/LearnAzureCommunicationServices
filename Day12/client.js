import { CallClient, CallAgent } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const callStateElement = document.getElementById('call-state');
const destinationGroupElement = document.getElementById('destination-group-input');
const screenShareStartButton = document.getElementById('shareScreenStart-button');
const screenShareStopButton = document.getElementById('shareScreenStop-button');

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
    const destinationToCall = { meetingLink: destinationGroupElement.value};
	call = callAgent.join(destinationToCall);
    
    call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    })
	
    // toggle button states
    disconnectButton.disabled = false;
    connectButton.disabled = true;
	screenShareStartButton.disabled = false;
	screenShareStopButton.disabled = false;
});

disconnectButton.addEventListener("click", async () => {
    await call.hangUp();
  
    // toggle button states
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    callStateElement.innerText = '-';
  });

screenShareStartButton.addEventListener("click", async () => {
	await call.startScreenSharing();
});

screenShareStopButton.addEventListener("click", async () => {
	await call.stopScreenSharing();
});
