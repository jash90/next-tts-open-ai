# Text-to-Speech Converter (Next.js & OpenAI API)

## Overview
This application is a Text-to-Speech (TTS) converter built using Next.js, React, and the OpenAI API. It allows users to enter text, convert it to speech, and download the audio output. The application splits large texts into smaller chunks, sends them for TTS conversion, and merges the resulting audio segments into one final file. A progress indicator helps users track the conversion process in real time.

## Features
- **Text Input**: Enter any text to convert it to speech.
- **API Key Input**: Dynamically enter your OpenAI API key to authorize the TTS conversion.
- **Progress Tracking**: Real-time percentage-based feedback while processing text.
- **Downloadable Audio Output**: Play or download the combined audio output after processing.

## Technologies Used
- **Next.js**: A React-based framework for server-side rendering and static site generation.
- **React**: Used for managing UI state and creating interactive elements.
- **TypeScript**: Provides type safety and better developer experience.
- **OpenAI API**: Converts the text input into speech.

## Prerequisites
- Node.js (v14 or higher recommended)
- An OpenAI API key with access to the TTS model.

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jash90/next-tts-open-ai.git
   cd next-book-reader
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## Usage
1. **Enter Text**: In the main input box, type or paste the text you want to convert to speech.
2. **Enter API Key**: Enter your OpenAI API key into the provided input field.
3. **Start Conversion**: Click the "Convert Text to Speech" button. The progress will be displayed as a percentage.
4. **Listen or Download**: After processing, an audio player will appear allowing you to listen to the generated speech.

## Code Overview
- **Components**: The main UI is defined in `TTSPage`.
- **State Management**:
  - `inputText`, `apiKey`, `audioUrl`, `isProcessing`, and `progress` states are managed using React's `useState` hook.
- **Text Chunking**: The text is split into 4000-character chunks to comply with API limits, and each chunk ends at a logical sentence boundary whenever possible.
- **Audio Processing**:
  - Uses the OpenAI API to convert text to audio chunks.
  - Merges these chunks using the Web Audio API.

## Environment Variables
This application does not rely on `.env` files, as the OpenAI API key is entered directly by the user in the interface. This makes it safer for client-side use without exposing sensitive data.

## Known Issues
- **Long Text Processing**: Extremely long texts may take considerable time to process. Progress tracking is provided to enhance the user experience.
- **Browser Compatibility**: The Web Audio API is used to merge audio files, and support may vary between browsers.

## Future Improvements
- **Server-side Audio Processing**: Move audio processing to the server side to improve efficiency and avoid client-side limitations.
- **Additional Voices**: Allow users to choose from different available voices for speech synthesis.
- **Download Button**: Add a feature to download the merged audio directly as a file.

## Contributing
Contributions are welcome! Feel free to submit a pull request or open an issue for discussion.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact
For any questions or support, please contact [bartekziimny90@gmail.com].

