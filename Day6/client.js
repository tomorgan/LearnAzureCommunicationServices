import { CallClient, CallAgent } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const answerButton = document.getElementById('answer-button');
const rejectButton = document.getElementById('reject-button');
const incomingCallElement = document.getElementById('incoming-call-info');
const callStateElement = document.getElementById('call-state');
const identityElement = document.getElementById('identity');
const destinationUserElement = document.getElementById('destination-user-input');

let call;
let callAgent;
let callClient;
let incomingCall;

async function init() {
    
  callClient = new CallClient();
	
  //get an access token to use
  const response = await fetch('https://acspocapi.azurewebsites.net/api/IssueToken?code=KbIzHm8WFsoiWhUEjJwppFaRjg4D3LY7B242tDBKVoz/7ibybc2TbQ==');
  const responseJson = await response.json(); 
  const token = responseJson.item2.token;
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  callAgent = await callClient.createCallAgent(tokenCredential);
  identityElement.innerText = responseJson.item1.id;
  connectButton.disabled = false;
  
  callAgent.on('incomingCall', (call) => {
	  incomingCall = call.incomingCall;
	  incomingCallElement.innerText = "Incoming Call from - " + incomingCall.callerInfo.identifier.communicationUserId;
	  answerButton.disabled = rejectButton.disabled = false;	  
	});
	
}
init();

function handleConnectedCall()
{
	call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    })
	
    // toggle button states
    disconnectButton.disabled = false;
    connectButton.disabled = true;
}

connectButton.addEventListener("click", () => {        	
    const destinationToCall = { communicationUserId: destinationUserElement.value};
	call = callAgent.startCall([destinationToCall]);
    
    handleConnectedCall();
});

disconnectButton.addEventListener("click", async () => {
    await call.hangUp();
  
    // toggle button states
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    callStateElement.innerText = '-';
  });
  
 answerButton.addEventListener("click", async () => {
	 call = await incomingCall.accept();
	 handleConnectedCall();
	 answerButton.disabled = rejectButton.disabled = true;
 });
 
 rejectButton.addEventListener("click", async () => {
	 incomingCall.reject();
	 answerButton.disabled = rejectButton.disabled = true;
 });
