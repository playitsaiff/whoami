const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

export const request = async (prompt: string) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  console.log(response);
  return response;
};
