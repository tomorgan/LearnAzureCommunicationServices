import { CallClient, CallAgent, DeviceManager, LocalVideoStream, Renderer } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const connectButton = document.getElementById('connect-button');
const disconnectButton = document.getElementById('disconnect-button');
const callStateElement = document.getElementById('call-state');
const destinationGroupElement = document.getElementById('destination-group-input');
const startVideoButton = document.getElementById('startvideo-button');
const stopVideoButton = document.getElementById('stopvideo-button');
const refreshRemoteMediaButton = document.getElementById('refreshRemoteMedia-button');
const remoteVideoCollection = document.getElementById('remotevideo');
const remoteScreenShareCollection = document.getElementById('remotescreenshare');

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
    const destinationToCall = { meetingLink: destinationGroupElement.value};
	const callOptions = {videoOptions: {localVideoStreams:[localVideoStream]}};
	call = callAgent.join(destinationToCall,callOptions);
    
    call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    })
	
	showLocalFeed();
	
    // toggle button states
    disconnectButton.disabled = false;
    connectButton.disabled = true;
	startVideoButton.disabled = false;
	stopVideoButton.disabled = false;
	refreshRemoteMediaButton.disabled = false;
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

refreshRemoteMediaButton.addEventListener("click", async () => {
	remoteVideoCollection.innerHTML = remoteScreenShareCollection.innerHTML = ""; //start again
	
	call.remoteParticipants.forEach(function(participant) 
	{			
		SetUpRemoteParticipant(participant);
	});
});

async function showLocalFeed() {
    localVideoRender = new Renderer(localVideoStream);
    const view = await localVideoRender.createView();
    document.getElementById("selfVideo").appendChild(view.target);
};

async function hideLocalFeed() {
	localVideoRender.dispose();
	document.getElementById("selfVideo").innerHTML = "";
};

async function SetUpRemoteParticipant(participant) {
		let videoStream = participant.videoStreams.find(function (s) { return s.mediaStreamType === "Video" });
		let screenShareStream = participant.videoStreams.find(function (s) { return s.mediaStreamType === "ScreenSharing" });
		
		if (videoStream.isAvailable) {
			RenderParticipantStream(videoStream, remoteVideoCollection);
		}
		
		if (screenShareStream.isAvailable) {
			RenderParticipantStream(screenShareStream, remoteScreenShareCollection);
		}
		
};

async function RenderParticipantStream(stream, collection)
{	
		let renderer = new Renderer(stream);
		const view = await renderer.createView({scalingMode: "Fit"});
		collection.appendChild(view.target);
}
