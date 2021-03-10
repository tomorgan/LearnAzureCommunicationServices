import { CallClient, CallAgent, DeviceManager, LocalVideoStream, Renderer } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const callStateElement = document.getElementById('call-state');
const destinationUserElement = document.getElementById('destination-user-input');
const startVideoButton = document.getElementById('startvideo-button');
const stopVideoButton = document.getElementById('stopvideo-button');
const videoDeviceSelect = document.getElementById('selectVideoDevice');
const audioInputDeviceSelect = document.getElementById('selectAudioInputDevice');
const audioOutputDeviceSelect = document.getElementById('selectAudioOutputDevice');

let call;
let callAgent;
let callClient;
let deviceManager;
let localVideoStream;
let localVideoRender;
let videoDevices;
let audioInputDevices;
let audioOutputDevices;
let selectedVideoDevice;
let selectedAudioInputDevice;
let selectedAudioOutputDevice;

async function init() {
    
  callClient = new CallClient();
	
  //get an access token to use
  const response = await fetch('YOUR ACS TOKEN ISSUING WEB FUNCTION URL HERE (WITH THE CODE). SEE DAY 3');
  const responseJson = await response.json(); 
  const token = responseJson.value.item2.token;
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  callAgent = await callClient.createCallAgent(tokenCredential);
  connectButton.disabled = false;
  
  deviceManager = await callClient.getDeviceManager();
  //get all the cameras, then choose the first one
  videoDevices = await deviceManager.getCameras();
  selectedVideoDevice = videoDevices[0];
  localVideoStream = new LocalVideoStream(selectedVideoDevice);
  
  //get all the microphone/speaker devices, then choose the first one
  audioInputDevices = await deviceManager.getMicrophones();
  audioOutputDevices = await deviceManager.getSpeakers();
  deviceManager.selectMicrophone(audioInputDevices[0]);
  deviceManager.selectSpeaker(audioOutputDevices[0]);
  
  //populate the device choice dropdowns
  videoDevices.forEach(function(device) 
  {
	  var el = document.createElement("option");
	  el.textContent = device.name;
	  el.value = device.id;
	  videoDeviceSelect.appendChild(el);
  });
  
  audioInputDevices.forEach(function(device)
  {
	  var el = document.createElement("option");
	  el.textContent = device.name;
	  el.value = device.id;
	  audioInputDeviceSelect.appendChild(el);
	  
  });
  
    audioOutputDevices.forEach(function(device)
  {
	  var el = document.createElement("option");
	  el.textContent = device.name;
	  el.value = device.id;
	  audioOutputDeviceSelect.appendChild(el);
	  
  });
  
  
  
}
init();

connectButton.addEventListener("click", () => {        	
    const destinationToCall = { meetingLink: destinationUserElement.value};
	const callOptions = {videoOptions: {localVideoStreams:[localVideoStream]}};
	call = callAgent.join(destinationToCall, callOptions);
    
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

videoDeviceSelect.addEventListener("change",async () => {
	selectedVideoDevice = videoDevices.find((device) => device.id === videoDeviceSelect.value);
	localVideoStream.switchSource(selectedVideoDevice);	
});

audioInputDeviceSelect.addEventListener("change",async () => {
	let selectedAudioInputDevice = audioInputDevices.find((device) => device.id === audioInputDeviceSelect.value);
	deviceManager.selectMicrophone(selectedAudioInputDevice);
});

audioOutputDeviceSelect.addEventListener("change",async () => {
	let selectedAudioOutputDevice = audioOutputDevices.find((device) => device.id === audioOutputDeviceSelect.value);
	deviceManager.selectSpeaker(selectedAudioOutputDevice);
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

