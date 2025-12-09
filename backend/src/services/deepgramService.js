const { createClient } = require("@deepgram/sdk");

exports.speechToText = async (audioBuffer, apiKey) => {
  const key = apiKey || process.env.DEEPGRAM_API_KEY;
  const deepgram = createClient(key);
  
  const { result } = await deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    { model: "nova-2", language: "en" }
  );
  
  if (!result || !result.results || !result.results.channels || !result.results.channels[0]) {
    throw new Error("Invalid audio format or Deepgram API error");
  }
  
  return result.results.channels[0].alternatives[0].transcript;
};

exports.textToSpeech = async (text, apiKey) => {
  const key = apiKey || process.env.DEEPGRAM_API_KEY;
  const deepgram = createClient(key);
  
  const response = await deepgram.speak.request(
    { text },
    { model: "aura-asteria-en" }
  );
  const stream = await response.getStream();
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
