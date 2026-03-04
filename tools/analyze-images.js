#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_KEY = "AIzaSyDoJsJO1ICFnjHa92Ciz2BCqHXq-GNqvXM";
const MODEL = "gemini-2.0-flash";
const BASE_DIR = "/Users/roy/.openclaw/workspace/english-game";

// Common English words for distractors
const COMMON_WORDS = [
  "hello", "hi", "goodbye", "bye", "good", "morning", "afternoon", "evening", "night",
  "how", "are", "you", "what", "name", "my", "your", "nice", "meet", "thank", "sorry",
  "yes", "no", "OK", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "red", "blue", "yellow", "green", "orange", "purple", "pink", "brown", "black", "white",
  "cat", "dog", "bird", "fish", "duck", "rabbit", "monkey", "elephant", "pig", "bear",
  "apple", "banana", "orange", "grape", "watermelon", "cake", "bread", "egg", "milk", "juice", "rice", "chicken", "beef", "pork",
  "eye", "nose", "mouth", "face", "head", "hand", "leg", "foot",
  "book", "bag", "pen", "pencil", "ruler", "eraser", "chair", "desk", "door", "window",
  "school", "home", "hospital", "park", "zoo", "farm", "factory", "museum", "library", "supermarket",
  "car", "bus", "bike", "plane", "train", "ship", "road",
  "father", "mother", "dad", "mum", "brother", "sister", "grandfather", "grandmother", "baby", "man", "woman", "boy", "girl", "friend",
  "teacher", "doctor", "nurse", "police", "farmer", "driver", "cook", "postman", "businessman", "student",
  "happy", "sad", "angry", "tired", "hungry", "thirsty", "healthy", "strong", "weak", "fast", "slow", "big", "small", "tall", "short", "long", "high", "low",
  "new", "old", "good", "bad", "hot", "cold", "warm", "cool", "clean", "dirty", "full", "empty",
  "sun", "moon", "star", "cloud", "rain", "snow", "tree", "flower", "grass",
  "eat", "drink", "run", "walk", "jump", "sit", "stand", "sleep", "swim", "fly",
  "read", "write", "draw", "play", "sing", "dance", "study", "work", "watch", "listen",
  "like", "love", "want", "have", "need", "know", "think", "say", "tell", "ask", "answer",
  "come", "go", "stop", "start", "finish", "open", "close", "give", "take", "buy", "sell",
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "week", "month",
  "spring", "summer", "autumn", "winter", "today", "tomorrow", "yesterday",
  "here", "there", "where", "when", "who", "why", "how", "which",
  "in", "on", "at", "to", "from", "with", "for", "of", "the", "a", "an", "is", "are", "was", "were",
  "can", "will", "would", "could", "should", "may", "might", "must"
];

// Load existing candidate words to preserve them if needed
let existingData = {};
try {
  const existingPath = path.join(BASE_DIR, "docs/candidate-words-fixed.json");
  if (fs.existsSync(existingPath)) {
    existingData = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
    console.log(`Loaded ${Object.keys(existingData).length} existing entries`);
  }
} catch (e) {
  console.log("No existing data found");
}

// Get all unique words from images
const gradeDirs = ['grade1', 'grade2', 'grade3'];
const wordSet = new Set();

for (const gradeDir of gradeDirs) {
  const dir = path.join(BASE_DIR, 'images', gradeDir);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        const word = file.replace('.png', '');
        wordSet.add(word);
      }
    }
  }
}

const allWords = Array.from(wordSet).sort();
console.log(`Found ${allWords.length} unique words`);

// Find image path for a word (prefer grade1 > grade2 > grade3)
function findImagePath(word) {
  for (const grade of gradeDirs) {
    const imgPath = path.join(BASE_DIR, 'images', grade, `${word}.png`);
    if (fs.existsSync(imgPath)) {
      return imgPath;
    }
  }
  return null;
}

// Call Gemini API with image
async function analyzeImage(imagePath, word) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const prompt = `You are an English vocabulary learning assistant. Analyze this image which represents the word "${word}". 

Describe what you see in the image in detail (colors, objects, scene, style). 

Then generate a JSON response with:
1. "analysis": Brief description of what's in the image
2. "isCorrect": Does the image match the word "${word}"? (true/false)
3. "suggestedDistractors": 3 alternative English words that could also relate to this image (if any), ranked by how closely they relate to the image content (0-100)

Format your response as valid JSON only, like this:
{"analysis": "...", "isCorrect": true/false, "suggestedDistractors": [{"word": "cat", "relevance": 80}, {"word": "dog", "relevance": 60}, {"word": "bird", "relevance": 40}]}`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/png",
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        responseMimeType: "application/json"
      }
    };

    const response = execSync(`curl -s -X POST "https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}" -H "Content-Type: application/json" -d '${JSON.stringify(requestBody)}'`, {
      encoding: 'utf8',
      timeout: 60000
    });

    const result = JSON.parse(response);
    if (result.candidates && result.candidates[0]) {
      const text = result.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error(`Error analyzing ${word}:`, error.message);
    return null;
  }
}

// Get random distractors
function getRandomDistractors(correctWord, count, excludeWords) {
  const candidates = COMMON_WORDS.filter(w => 
    w.toLowerCase() !== correctWord.toLowerCase() && 
    !excludeWords.includes(w.toLowerCase())
  );
  
  // Shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  
  return candidates.slice(0, count);
}

// Process words
async function processWords() {
  const results = {};
  let processed = 0;
  
  for (const word of allWords) {
    // Check if already processed
    if (existingData[word] && existingData[word].options) {
      results[word] = existingData[word];
      processed++;
      continue;
    }
    
    const imagePath = findImagePath(word);
    if (!imagePath) {
      console.log(`No image found for ${word}`);
      continue;
    }
    
    console.log(`Processing: ${word} (${processed + 1}/${allWords.length})`);
    
    const analysis = await analyzeImage(imagePath, word);
    
    if (analysis && analysis.isCorrect !== false) {
      // Get suggested distractors with high relevance
      const suggestedWords = (analysis.suggestedDistractors || [])
        .filter(d => d.relevance >= 50)
        .map(d => d.word);
      
      // Combine with random distractors
      const excludeWords = [word.toLowerCase(), ...suggestedWords.map(w => w.toLowerCase())];
      const randomDistractors = getRandomDistractors(word, 3, excludeWords);
      
      // Replace low-relevance distractors with AI suggestions if available
      let options = [word];
      const allDistractors = [...suggestedWords, ...randomDistractors];
      
      for (let i = 0; i < 3; i++) {
        if (i < suggestedWords.length && analysis.suggestedDistractors) {
          const suggested = analysis.suggestedDistractors[i];
          if (suggested && suggested.relevance >= 50) {
            options.push(suggested.word);
            continue;
          }
        }
        options.push(allDistractors[i] || randomDistractors[i] || "good");
      }
      
      // Ensure we have exactly 4 options
      while (options.length < 4) {
        options.push(getRandomDistractors(word, 1, options)[0] || "nice");
      }
      options = options.slice(0, 4);
      
      // Shuffle options (keep correct answer for reference)
      const correct = word;
      const shuffled = [...options].slice(1).sort(() => Math.random() - 0.5);
      
      results[word] = {
        correct: correct,
        options: [correct, ...shuffled],
        replaced: suggestedWords.filter(w => !shuffled.includes(w) && w !== word)
      };
    } else {
      // Fallback: just use random distractors
      const distractors = getRandomDistractors(word, 3, [word.toLowerCase()]);
      results[word] = {
        correct: word,
        options: [word, ...distractors],
        replaced: []
      };
    }
    
    processed++;
    
    // Save progress every 20 words
    if (processed % 20 === 0) {
      fs.writeFileSync(
        path.join(BASE_DIR, "docs/candidate-words-fixed.json"),
        JSON.stringify(results, null, 2)
      );
      console.log(`Progress saved: ${processed}/${allWords.length}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Final save
  fs.writeFileSync(
    path.join(BASE_DIR, "docs/candidate-words-fixed.json"),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Done! Processed ${processed} words`);
  return results;
}

processWords().catch(console.error);
