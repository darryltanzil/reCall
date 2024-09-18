## Inspiration
2 days before flying to Hack the North, Darryl forgot his keys and spent the better part of an afternoon retracing his steps to find it- But what if there was a personal assistant that remembered everything for you? Memories should be made easier with the technologies we have today.

## What it does
A camera records you as you go about your day to day life, storing "comic book strip" panels containing images and context of what you're doing as you go about your life. When you want to remember something you can ask out loud, and it'll use Open AI's API to search through its "memories" to bring up the location, time, and your action when you lost it. This can help with knowing where you placed your keys, if you locked your door/garage, and other day to day life.

## How we built it
The React-based UI interface records using your webcam, screenshotting every second, and stopping at the 9 second mark before creating a 3x3 comic image. This was done because having static images would not give enough context for certain scenarios, and we wanted to reduce the rate of API requests per image. After generating this image, it sends this to OpenAI's turbo vision model, which then gives contextualized info about the image. This info is then posted sent to our Express.JS service hosted on Vercel, which in turn parses this data and sends it to a Cloud Firestore (a Firebase database). To re-access this data, the browser's built in speech recognition is utilized by us along with the SpeechSynthesis API in order to communicate back and forth with the user. The user speaks, the dialogue is converted into text and processed by Open AI, which then classifies it as either a search for an action, or an object find. It then searches through the database and speaks out loud with a naturalized response.

## Challenges we ran into
We originally planned on using a VR headset, webcam, NEST camera, or anything external with a camera, which we could attach to our bodies somehow. Unfortunately the hardware lottery didn't go our way; to combat this, we decided to make use of MacOS's continuity feature, using our iPhone camera connected to our macbook as our primary input.

## Accomplishments that we're proud of
As a two person team, we're proud of how well we were able to work together and silo our tasks so they didn't interfere with each other. Also, this was Michelle's first time working with Express.JS and Firebase, so we're proud of how fast we were able to learn!

## What we learned
We learned about OpenAI's turbo vision API capabilities, how to work together as a team, how to sleep effectively on a couch and with very little sleep.

## What's next for ReCall: Memories done for you!
We originally had a vision for people with amnesia and memory loss problems, where there would be a catalogue for the people that they've met in the past to help them as they recover. We didn't have too much context on these health problems however, and limited scope, so in the future we would like to implement a face recognition feature to help people remember their friends and family.
