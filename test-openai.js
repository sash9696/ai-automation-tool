import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'backend', '.env') });

const openaiApiKey = process.env.OPENAI_API_KEY;

console.log('🔍 Testing OpenAI Integration...');
console.log('📝 OpenAI API Key present:', !!openaiApiKey);
console.log('📝 API Key length:', openaiApiKey ? openaiApiKey.length : 0);

if (!openaiApiKey) {
  console.log('❌ No OpenAI API key found in environment variables');
  console.log('📝 The system will fall back to mock generation');
  console.log('📝 To use real OpenAI, add your API key to backend/.env');
  process.exit(0);
}

console.log('✅ OpenAI API key found!');
console.log('📝 You can now use real AI post generation');

// Test the AI service endpoint
console.log('\n🧪 Testing AI Service endpoint...');

try {
  const response = await fetch('http://localhost:3002/api/generate-post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'Full Stack Development',
      tone: 'professional',
      includeHashtags: true,
      includeCTA: true
    }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ AI Service test successful!');
    console.log('📝 Generated content:', data.data.content.substring(0, 100) + '...');
  } else {
    console.log('❌ AI Service test failed:', response.status, response.statusText);
  }
} catch (error) {
  console.log('❌ AI Service not running or not accessible');
  console.log('📝 Make sure to start the AI service: cd ai-service && npm run dev');
} 