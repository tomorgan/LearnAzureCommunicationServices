import { CallClient, CallAgent } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { Features } from "@azure/communication-calling";

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const callStateElement = document.getElementById('call-state');
const destinationUserElement = document.getElementById('destination-user-input');
const networkMessagesListElement = document.getElementById('NetworkMessages');
const mediaMessagesListElement = document.getElementById('MediaMessages');

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
    const destinationToCall = { id: destinationUserElement.value};
	call = callAgent.startCall([destinationToCall]);
    
    call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    })
	
			
	call.api(Features.Diagnostics).network.on('diagnosticChanged', (diagInfo) => {
		    var el = document.createElement("li");
			el.appendChild(document.createTextNode(diagInfo.diagnostic + " " + diagInfo.mediaType + " " + diagInfo.value));				 
			networkMessagesListElement.appendChild(el);
	 });
	
	call.api(Features.Diagnostics).media.on('diagnosticChanged', (diagInfo) => {
		    var el = document.createElement("li");
			el.appendChild(document.createTextNode(diagInfo.diagnostic + " " + diagInfo.mediaType + " " + diagInfo.value));				 
			mediaMessagesListElement.appendChild(el);
	});
	
    // toggle button states
    disconnectButton.disabled = false;
    connectButton.disabled = true;
	

});


  

disconnectButton.addEventListener("click", async () => {
    await call.hangUp();
  
    // toggle button states
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    callStateElement.innerText = '-';
  });

