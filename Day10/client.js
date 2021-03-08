import { CallClient, CallAgent, DeviceManager, LocalVideoStream, Renderer } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const callStateElement = document.getElementById('call-state');
const destinationUserElement = document.getElementById('destination-user-input');
const startVideoButton = document.getElementById('startvideo-button');
const stopVideoButton = document.getElementById('stopvideo-button');

let call;
let callAgent;
let callClient;
let localVideoStream;
let localVideoRender;

async function init() {
    
  callClient = new CallClient();
	
  //get an access token to use
  const response = await fetch('YOUR ACS TOKEN ISSUING WEB FUNCTION URL HERE (WITH THE CODE). SEE DAY 3');
  const responseJson = await response.json(); 
  const token = responseJson.value.item2.token;
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  callAgent = await callClient.createCallAgent(tokenCredential);
  connectButton.disabled = false;
  
  //get all the cameras, then choose the first one
  const deviceManager = await callClient.getDeviceManager();
  const videoDevices = await deviceManager.getCameras();
  const videoDeviceInfo = videoDevices[0];
  localVideoStream = new LocalVideoStream(videoDeviceInfo);
}
init();

connectButton.addEventListener("click", () => {        	
    const destinationToCall = { communicationUserId: destinationUserElement.value};
	const callOptions = {videoOptions: {localVideoStreams:[localVideoStream]}};
	call = callAgent.startCall([destinationToCall],callOptions);
    
    call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    })
	
	showLocalFeed();
	
    // toggle button states
    disconnectButton.disabled = false;
    connectButton.disabled = true;
	startVideoButton.disabled = false;
	stopVideoButton.disabled = false;
});

disconnectButton.addEventListener("click", async () => {
    await call.hangUp();
  
    // toggle button states
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    callStateElement.innerText = '-';
  });
  
 startVideoButton.addEventListener("click", async () => {
	await call.startVideo(localVideoStream);
	showLocalFeed();
});

stopVideoButton.addEventListener("click", async () => {
	await call.stopVideo(localVideoStream);
	hideLocalFeed();
});

async function showLocalFeed() {
    localVideoRender = new Renderer(localVideoStream);
    const view = await localVideoRender.createView();
    document.getElementById("selfVideo").appendChild(view.target);
}

async function hideLocalFeed() {
	localVideoRender.dispose();
	document.getElementById("selfVideo").innerHTML = "";
}

