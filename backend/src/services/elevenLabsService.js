const { ElevenLabsClient } = require("elevenlabs");

const getClient = (apiKey) => new ElevenLabsClient({
  apiKey: apiKey || process.env.ELEVENLABS_API_KEY
});

exports.speechToText = async (audioBuffer, apiKey) => {
  const client = getClient(apiKey);

  const blob = new Blob([audioBuffer], { type: 'audio/webm' });
  const result = await client.speechToText.convert({
    file: blob,
    model_id: "scribe_v1",
    language_code: "en"
  });

  if (!result || !result.text) {
    throw new Error("Invalid audio or ElevenLabs STT error");
  }

  return result.text;
};

exports.textToSpeech = async (text, apiKey, voiceId = 'cgSgspJ2msm6clMCkdW9') => {
  try {
    const client = getClient(apiKey);

    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      model_id: "eleven_flash_v2_5",
      output_format: "mp3_44100_128"
    });

    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (err) {
    console.error('TTS Error:', err.message);
    return null;
  }
};
