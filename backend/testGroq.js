// Run this to see all Groq models your API key can access:
// node testGroq.js

const apiKey = process.env.GROQ_API_KEY || 'your_api_key_here';

async function testGroq() {
  // 1. List all available models
  console.log('\n--- Available Models ---');
  const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const models = await modelsRes.json();
  if (models.data) {
    models.data.forEach(m => console.log(' -', m.id));
  } else {
    console.log(JSON.stringify(models));
  }

  // 2. Try a quick test call with the first available model
  if (models.data && models.data.length > 0) {
    const testModel = models.data[0].id;
    console.log(`\n--- Testing model: ${testModel} ---`);
    const chatRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: testModel,
        messages: [{ role: 'user', content: 'Say "AI works!" in JSON: {"message": "..."}' }],
        max_tokens: 50
      })
    });
    const chat = await chatRes.json();
    console.log('Response:', chat.choices?.[0]?.message?.content || JSON.stringify(chat));
  }
}

testGroq().catch(console.error);
