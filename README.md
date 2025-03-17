# Book Reader

## Description

Book Reader is a simple web application that allows users to upload and view PDF files from the browser. The user can also listen to the text in the PDF using text-to-speech (TTS) functionality, as well as interact with the content of the PDF.
The project is accessible on Vercel at [play-ai-book-reader-inky.vercel.app](https://play-ai-book-reader-inky.vercel.app)

## Tech Stack

- Next.js
- React
- Tailwind CSS
- PlayAI API

## Features
- Upload & View PDF files: Users can upload PDF files from their local machine. The application then renders the uploaded PDF files in the browser. Support zooming and page navigation.
- Text-to-speech: Allow users to listen to the text in the PDF. The text is sent from frontend to backend in batches, then communicated to the PlayAI API for TTS. The audio is streamed back to the frontend and played in the browser.
- Voice Control: Users can select different voices and adjust the speed and temperature of the TTS. This allows for a more personalized experience.
- Responsive Design: The application is designed to be responsive and works well on different screen sizes.

## For Development

Copy the `.env.example` file to `.env.local` and fill in the required environment variables.

Then, install the dependencies:

```bash
npm install
```

Finally, run the development server:

```bash
npm run dev
```

## TODO

- [x] PDF Upload
- [x] PDF Display
- [x] Audio Controls

  - [x] TTS Play/Pause btns foor current page
  - [x] Voice Selection Dropdown
  - [x] Adjust Speed/Temparature

- [ ] Bonus: Voice Chat with current page
- [x] Deploy on Vercel
- [x] UI/UX Refactoring
  - [x] Responsive UI

## Time Tracker

Start time: Mar 15, 2025

Interval 1: 8.00 PM - 8.30 PM: 30m

Interval 2: 9.00 PM - 9.30 PM: 30m

Interval 3: 11.00 PM - 11.30 PM: 30m

Mar 16, 2025

Interval 4: 10.45 AM - 11.45 AM: 1h

Interval 5: 12.00 PM - 1.00 PM: 1h

Interval 6: 3.00 PM - 4.15 PM: 1h 15m

Interval 7: 4.30 PM - 5.30 PM: 1h

Interval 8: 6.30 PM - 7.00 PM: 30m

Interval 9: 7.30 PM - 8.30 PM: 1h

Interval 10: 9.00 PM - 9.30 PM: 30m

Elapsed time: 7h 45m
