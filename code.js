// create audio context using web audio api
const audioCtx = new AudioContext();


// unmute iphone with short, blank .wav in base64 - played on start button press
const blankAudio = new Audio("data:audio/wav;base64,UklGRn4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVoAAAAAAAAAAAAAAP//AgD+/wIA/v8BAAAA//8CAP7/AgD+/wIA/f8EAPz/BAD8/wMA/v8BAAAA//8CAP3/AwD+/wEAAAD//wIA/v8BAAAAAAABAP7/AQAAAAAAAAA=");


// constants
const startStopBtn = document.getElementById("start-stop");
const tempoText = document.getElementById("tempo-text");  
const tempoName = document.getElementById("tempo-name"); 
const print1 = document.getElementById("print1");
const bodyBg = document.getElementById("body-bg");
const timeSigDownBtn = document.getElementById("time-sig-down");
const timeSigUpBtn = document.getElementById("time-sig-up");
const timeSigValue = document.getElementById("time-sig-value");
const optionFlash = document.getElementById("option-flash");
const optionQuarter = document.getElementById("option-quarter");
const waveType = document.getElementById("wave-type");
const subdivisionValue = document.getElementById("sub-divisions");
const volumeControlInput = document.getElementById("volume-control");
const volumeControlValue = document.getElementById("volume-control-header");
const subVolumeControlInput = document.getElementById("sub-volume-control");
const subVolumeControlValue = document.getElementById("sub-volume-control-header");
const myFrame = document.getElementById("my-frame");
const bluetoothDelayInput = document.getElementById("bluetooth-delay");
const bluetoothDelayValue = document.getElementById("bluetooth-delay-header");
const tapTempo = document.getElementById("tap-tempo-button");
const settingsIcon = document.getElementById("settings-icon");



// variables
let tempoInput = document.getElementById("tempo-input");
let isRunning;
let bpm = 100; //default value
let stepCounter;
let timeSig = 4;
let nextEvent;
let isOptionFlash = false;
let isOptionQuarter = false;
let subdivisions = 4;
let swing = false;
let muteSubdivisions = true;
let currentVolume = 1;
let currentSubVolume = 0.75;
let bluetoothDelay = 0;
let tapTime1;
let tapTime2;
let tapTime3;
let tapTime4;



// settings button - smooth scroll to settings section
settingsIcon.addEventListener("click", () => {
    document.getElementById("hr-bottom").scrollIntoView({
        behavior: "smooth"
    })
})



// tempo words - changes tempo word on screen depending on bpm
tempoInput.addEventListener("input", () => {
    bpm = tempoInput.value;
    tempoText.innerHTML = bpm;
    if (bpm <= 40) {
        tempoName.innerHTML = "Grave";
    }
    else if (bpm <= 45) {
        tempoName.innerHTML = "Lento";
    }
    else if (bpm <= 50) {
        tempoName.innerHTML = "Largo";
    }
    else if (bpm <= 55) {
        tempoName.innerHTML = "Larghetto";
    }
    else if (bpm <= 65) {
        tempoName.innerHTML = "Adagio";
    }
    else if (bpm <= 69) {
        tempoName.innerHTML = "Adagietto";
    }
    else if (bpm <= 72) {
        tempoName.innerHTML = "Andante Moderato";
    }
    else if (bpm <= 77) {
        tempoName.innerHTML = "Andante";
    }
    else if (bpm <= 83) {
        tempoName.innerHTML = "Andantino";
    }
    else if (bpm <= 85) {
        tempoName.innerHTML = "Marcia Moderato";
    }
    else if (bpm <= 97) {
        tempoName.innerHTML = "Moderato";
    }
    else if (bpm <= 109) {
        tempoName.innerHTML = "Allegretto";
    }
    else if (bpm <= 132) {
        tempoName.innerHTML = "Allegro";
    }
    else if (bpm <= 140) {
        tempoName.innerHTML = "Vivace";
    }
    else if (bpm <= 150) {
        tempoName.innerHTML = "Vivacissimo";
    }
    else if (bpm <= 167) {
        tempoName.innerHTML = "Allegrissimo";
    }
    else if (bpm <= 177) {
        tempoName.innerHTML = "Presto";
    }
    else if (bpm >= 178) {
        tempoName.innerHTML = "Prestissimo";
    }
    else {
        tempoName.innerHTML = "Out of this world";
    }
})



// time signature up & down buttons
timeSigDownBtn.addEventListener("click", () => {
    if (timeSig > 2) {
        timeSig--;
        timeSigValue.innerHTML = timeSig + " steps";
    }
});

timeSigUpBtn.addEventListener("click", () => {
    if (timeSig < 9) {
        timeSig++;
        timeSigValue.innerHTML = timeSig + " steps";
    }
});



// start-stop button
startStopBtn.addEventListener("click", () => {
    if(isRunning != true) {
        isRunning = true;
        // audio context must be resumed by user input for audio to play
        audioCtx.resume();
        // plays a blank wav to unmute iphone
        blankAudio.play();
        startStopBtn.innerHTML = "Stop";
        stepCounter = 0;
        nextEvent = audioCtx.currentTime;
        // plays first sound (and changes bg color) as soon as button is pressed - it would otherwise be delayed
        changeBgColor();
        playSound();
        scheduler();
    }
    else {
        isRunning = false;
        startStopBtn.innerHTML = "Start";
        // stops a sound from being scheduled too far ahead
        nextEvent = 0;
        // delays returning bg color to normal until after last scheduled sound has finished
        setTimeout(() => {bodyBg.className = "white";}, 500);
    }
});



// Schedules the next event (sound, etc.) to be in sync with the web audio API time.
function scheduler() {
    if (isRunning == true) {
        // The next event will be scheduled by the trigger function
        nextEvent += 60 / (bpm * subdivisions); // 4 steps per beat
        
        // stepCounter is used by the playSound function
        // - 1 is to generate correct max number of steps when starting from 0
        if (stepCounter >= (timeSig * subdivisions) - 1) {
            stepCounter = 0;
        }
        else {
            stepCounter++;
        }
        changeBgColor();
        playSound();

        // trigger scheduler function to run again at next event time
        trigger(scheduler);
    }
}



// trigger uses a silent oscillator of zero length to trigger an event (function)
// it starts/stops at the time of 'nextEvent' as created by the scheduler
// events are triggered by using the 'ended' event listener
// has option to delay the trigger
function trigger(event, delay = 0) {
    let trigger = audioCtx.createOscillator();
    trigger.connect(audioCtx.destination);

    if (delay != 0) {
        trigger.start(nextEvent + delay);
        trigger.stop(nextEvent + delay);
    }
    else {
        trigger.start(nextEvent);
        trigger.stop(nextEvent);
    }

    trigger.addEventListener("ended", event)
}



// plays sounds - creates oscillators and changes frequency depending on the current step
function playSound() {

    // create oscillator for beeping sound with gain and wave-type controls
    let oscillator = audioCtx.createOscillator();
    let volume = audioCtx.createGain();
    switch (waveType.value) {
        case "square":
            oscillator.type = "square";
            break;
        case "sawtooth":
            oscillator.type = "sawtooth";
            break;
        case "sine":
            oscillator.type = "sine";
            break;
        default:
            oscillator.type = "triangle";
            break;
    }
    oscillator.connect(volume);
    volume.connect(audioCtx.destination);
    volume.gain.value = 1 * currentVolume;
    oscillator.start(nextEvent);
    oscillator.stop(nextEvent + (1/22));

    // change oscillator frequency and volume depending on current step
    // first beat
    if (stepCounter % (timeSig * subdivisions) == 0) {
        oscillator.frequency.value = 880;
        updateSubdivision(); // checks is subdivision has been changed and updated it
        
    }
    // other beats
    else if (stepCounter % subdivisions == 0) {
        oscillator.frequency.value = 440;
        updateSubdivision(); // checks is subdivision has been changed and updated it
    }
    // subdivisions section
    else {
        oscillator.frequency.value = 220;
        if (muteSubdivisions == true) {
            volume.gain.value = 0;
        }
        else if(swing == true) {
            if (stepCounter % subdivisions == 2) {
                volume.gain.value = 0.5 * currentSubVolume * currentVolume; // set volume of extra sound
            }
            else {
                volume.gain.value = 0; // set volume of extra sound
            }
        }
        else {
            volume.gain.value = 0.5 * currentSubVolume * currentVolume; // set volume of extra sound
        }
    }
}



// changes backgorund color depending on current step
function changeBgColor() {
    if (stepCounter % (timeSig * subdivisions) == 0) {
        if(isOptionFlash == false) {
            trigger(() => {bodyBg.className = "green"}, bluetoothDelay);
        }
        else {
            trigger(() => {bodyBg.className = "green-dim"}, bluetoothDelay);
        }   
    }
    // other beats
    else if (stepCounter % subdivisions == 0) {
        if(isOptionFlash == false) {
            trigger(() => {bodyBg.className = "red"}, bluetoothDelay);
        }
        else {
            trigger(() => {bodyBg.className = "red-dim"}, bluetoothDelay);
        }
    }
    // subdivisions section
    else {
        trigger(() => {bodyBg.className = "base"}, bluetoothDelay);
    }
}



// tap tempo button - user can adjust tempo by tapping on tap tempo button
// takes average bpm over up to 4 taps
// if over 3 seconds has passed since last tap, it resets
tapTempo.addEventListener("click", () => {
    audioCtx.resume();
    let newBpm = bpm;

    if (tapTime4 > audioCtx.currentTime - 3) {
        tapTime1 = tapTime2;
        tapTime2 = tapTime3;
        tapTime3 = tapTime4;
        tapTime4 = audioCtx.currentTime;
        newBpm = Math.round(60 / (((tapTime2 - tapTime1) + (tapTime3 - tapTime2) + (tapTime4 - tapTime3)) / 3));
    }
    else if (tapTime3 > audioCtx.currentTime - 3) {
        tapTime4 = audioCtx.currentTime;
        newBpm = Math.round(60 / (((tapTime2 - tapTime1) + (tapTime3 - tapTime2) + (tapTime4 - tapTime3)) / 3));
    }
    else if (tapTime2 > audioCtx.currentTime - 3) {
        tapTime3 = audioCtx.currentTime;
        newBpm = Math.round(60 / (((tapTime2 - tapTime1) + (tapTime3 - tapTime2)) / 2));
    }
    else if (tapTime1 > audioCtx.currentTime - 3) {
        tapTime2 = audioCtx.currentTime;
        newBpm = Math.round(60 / (tapTime2 - tapTime1));
    }
    else {
        tapTime1 = audioCtx.currentTime;
        tapTime2 = -3;
        tapTime3 = -3;
        tapTime4 = -3;
    }

    // keeps bpm within range 20 - 240
    if (newBpm < 20) {
        bpm = 20;
    } 
    else if (newBpm > 240) {
        bpm = 240;
    } 
    else {
        bpm = newBpm;
    }

    // updates screen with new bpm values
    tempoText.innerHTML = bpm;
    tempoInput.value = bpm;

    // changes button color when clicked
    tapTempo.className = "tap-color-on";
    setTimeout(() => {
        tapTempo.className = "tap-color-off";
    }, 50);
})



// reduce flash brighness buttons
document.getElementById("option-flash-button").addEventListener("click", () => {
    if (isOptionFlash != true) {
        optionFlash.className = "tick-box-on";
        isOptionFlash = true;
    } else {
        optionFlash.className = "tick-box-off";
        isOptionFlash = false;
    }
})



// subdivisions select drop-down menu
function updateSubdivision() {

    // need to update the stepcounter with new values to keep timing correct when changing subdivisions
    // this first part gets the multiplier from the old 
    let multiplier = stepCounter / subdivisions;
    
    if (subdivisionValue.value == "off") {
        subdivisions = 4;
        muteSubdivisions = true;
        swing = false;
    }
    else if (subdivisionValue.value == "swing") {
        subdivisions = 3;
        muteSubdivisions = false;
        swing = true;
    }
    else {
        subdivisions = subdivisionValue.value;
        muteSubdivisions = false;
        swing = false;
    }
    
    // updates the step counter to the new correct value
    stepCounter = subdivisions * multiplier;

}



// volume control updater
volumeControlInput.addEventListener("input", () => {
    currentVolume = volumeControlInput.value / 100;
    volumeControlValue.innerHTML = "Master volume: " + volumeControlInput.value + "%";
})


// sub volume control updater
subVolumeControlInput.addEventListener("input", () => {
    currentSubVolume = subVolumeControlInput.value / 100;
    subVolumeControlValue.innerHTML = "Subdivision volume: " + subVolumeControlInput.value + "%";
})



// bluetooth delay updater
bluetoothDelayInput.addEventListener("input", () => {
    bluetoothDelay = bluetoothDelayInput.value / 1000;
    bluetoothDelayValue.innerHTML = "Bluetooth delay compensation: " + bluetoothDelayInput.value + "ms";
})