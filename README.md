# Metronome - Written in HTML, CSS & JavaScript, using the Web Audio API
#### URL:  https://xop14.github.io/metronome/
#### Description:

**Intro**

For this project I wanted to explore the idea of music related web apps. When studying Music Technology at university around 20 years ago, the main way create web-based music applications was by using Flash. Web technology has moved on a long way since those days, and flash is no longer supported by any major browsers, so I decided to see if similar applications could be created using modern web technologies - namely HTML, CSS for the layout and design, and JavaScript to add functionality. I also wanted this app to function well on mobile devices.

**Project Files**

metronome.html - the layout of the web app
styles.css - the styling of the web app
code.js - the JavaScript code
images/settings-white.svg - the settings image icon file
images/favicon.ico - favicon icon for browser tab
NoSleep.js - created by Rich Tibbett https://github.com/richtr/NoSleep.js - prevents mobile device from sleeping. See notes below.

**JavaScript's Timing Problem**

The biggest hurdle to overcome when creating music related web apps is the problem of precise timing. There are functions in JavaScript for triggering an event repeatedly, for example the 'setInterval()' function which continuously triggers any given function at a fixed time interval of your choosing. At first I attempted to create a timing system using 'setInterval()', but when the interval was set to repeat a sound at a fixed interval, say 500ms for example, you could clearly hear that the timing was unstable. Timing seems to be affected by other tasks the browser/computer is doing. I made some attempts to reduce this instability by using the setInterval() function to fetch the computer's current time via the Date().getTime() function and using this to create an additional 'expected time' variable (computer's current time + desired time interval) which could then be checked against the computer's actual time again the next time the function runs. If the expected time was ahead or behind the computers actual time, the interval for the next run could then be lengthened or shortened accordingly. I tried setting the 'setInterval()' function's interval to a tenth of the current bpm (beats per minute) so that the interval could be adjusted 10 times per beat, and thus minimise any imprecision. While it did slightly improve the timing problem, you could still clearly hear that the timing was still not completely stable.

The solution was to use the Web Audio API's own timer which can be used to start audio events at an exact scheduled time. I conducted research on how to schedule events using this API, and while I did find solutions that worked, they seemed overcomplicated and still sometimes relied on the unreliable setInterval() function to keep the scheduler looping. In the end, I created my own  event-scheduling function which seemed like a simpler solution to the problem. The scheduler function updates a variable called 'nextEvent' which is x seconds ahead of the current timer. The function then runs other functions (to play sounds, make visual changes, etc.) which use in turn use this 'nextEvent' variable to trigger sounds, etc., at the exact scheduled time. The key part to simplifying this scheduler was to also create a 'trigger(function, delay)' function, which could then be used to trigger any function at the 'nextEvent' time. The trigger function also includes an optional delay parameter which can be used to delay the triggering of whatever function is passed into it. This trigger function works by using the Web Audio API to create an oscillator node to generate a sound of zero length (i.e., starts and stops at the same time), and then an event listener to detect then the sound ended and trigger any function at the precise 'nextEvent' time. By inserting this trigger() within the 'scheduler()' function, it can be used to call itself again at the current 'nextEvent' time, creating a perfectly timed loop, which then generates the next 'nextEvent' time, and so on.

**Step Counter**

The stepCounter variable increases each time the 'scheduler()' function runs. If a bar has 4 beats, each beat is divided into 4 subdivisions by default, but this changed depending on the subdivision setting. Thus, with a 4-beat bar, there are 16 steps (0-15) by default. The 'playSound()' function and 'changeBgColor()' function perform different actions depending on the current step number. 

**Adjusting the Tempo**

The tempo is adjusted by the user moving the slider. An event listener listens for "input" from the slider and updates the bpm variable and number accordingly. A tempo name is also dynamically assigned and updated via the .innerHTML setting.

The tap tempo button works by assigning the current timer time to a variable eachtime the button is pressed. A maximum of 4 'tapTime' variables are assigned a time. The time difference between these variables is calculated and averaged to calulate the new tempo. 

**Web Audio API and Sound Generation**

The Web Audio API is supported by all major browsers and provides a way for sounds to be generated, played, and manipulated directly in the browser. This metronome uses the oscillator node which can produce various wave types with changeable frequency. A 'Web Audio Context' variable must first be created to use the API. Most browsers will suspend this web audio context on page load to avoid abuse, and it must be resumed again with a direct user interaction. For this Metronome, I set it to resume when the user presses the start button. I also created gain nodes which can adjust the volume level of whatever gets passed to it. I control this volume setting by using the volume sliders for the master volume and subdivision volume.

**Other Notable Settings**

While the page background flahes on the beat, the brightness of these flashes may be too bright for some users or settings, so I added an option to reduce the intensity. When the option is activated, the 'isOptionFlash' variable is set to true, and this causes the body class name to be updated with new class containing the correct css background color.

Subdivisions are a more advanced metronome function with the main beat being divided into 2, 3, 4, 5 or swing, subdivisions. On every beat, the subdivision setting is checked, and if a new subdivision is detected, the 'nextEvent' variable and current step number are updated to ensure a smooth transition to the new subdivision.


When using bluetooth earphones with the metronome, the audio lag will cause the sounds and flashing background to go out of sync. I added the bluetooth audio lag compensation setting to delay the timing of background flashes to compensate for this. The input slider updates a 'bluetoothDelay' variable. The trigger() function, which triggers the flash, accepts this 'bluetoothDelay' variable as a parameter and applies the delay to the flashes accordingly.

**Notes on HTML Structure**

I used a div structure in combination with css flexbox to dynamically adjust the size and positions of elements on the page. I used the Google Font API for fonts.

**Notes on CSS**

Visual elements were created using CSS instead of images (apart from the settings icon). One area of particular interest was the down arrows on the drop-down select boxes used in the settings. To style these boxes well, first the default appearance had to be removed and then styling applied. Unfortunatly, removing the default appearance of select boxes also removes the down arrow that is usually on the right. I created new arrows in css by using border settings to create arrow and circle shapes. I applyed them to divs and set the position of the divs to absolute (inside a flexbox div of position relative). This seemed to work well and created the desired look. 

As there are buttons on the page that contain text, I included 'user-select: none;' option to all elements on the page to prevent users from accidently selecting button text. Also, by default, iOS will zoom in when a web page is double tapped, which caused problems for the 'tap tempo' button. Adding the 'touch-action: manipulation;' setting to button elements prevented this.

**Other Problems and Solutions**

On iOS safari, I couldn't get sound to play through the Web Audio API until the phone was unmuted. Obviously this is not ideal for a metronome. After some research, it appeared that playing a blank sound file would trick the device into playing sound while still muted. I set created a very short blank audio file, converted it to base64 so that I didn't need to link to an external file, and triggered it to play when pressing the start button which solved the problem.

Another big problem when using a web app such as a metronome on mobile is that the device will sleep if there is no interaction. When using a metronome, the user is generally busy playing an instrument, thus not interacting with the device while still needing the click to continue playing. There is currently no good built-in cross-platform solution for this, but numerous comments online recommended a pre-made solution called noSleep.js created by Rich Tibbett https://github.com/richtr/NoSleep.js so I decided to go with this option.

**Final Notes**

I plan to publish this project online somewhere in the future and also develop further projects like a drum machine using the Web Audio API. Thank you to all the CS50 staff for such a great course.
