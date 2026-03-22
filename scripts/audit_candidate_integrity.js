#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const WORDS_PATH = path.join(ROOT, 'words.js');
const CANDIDATES_PATH = path.join(ROOT, 'docs', 'candidate-words-fixed.json');
const IMAGE_RELEVANCE_PATH = path.join(ROOT, 'docs', 'image-relevance.json');

const EXCLUDED_IMAGE_WORDS = new Set([
    "i'm",
    'good morning',
    'good afternoon',
    'good evening',
    'good night',
    'how are you',
    'thanks',
    'thank you',
    "what's your name",
    'nice to meet you'
]);

const CONFLICT_GROUPS = {
    greetings: ['hello', 'hi', 'goodbye', 'bye', 'good morning', 'good afternoon', 'good evening', 'good night'],
    question: ['what', 'who', 'why', 'where', 'when', 'whose', 'how'],
    colors: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'pink', 'purple', 'brown'],
    time: ['morning', 'afternoon', 'evening', 'night', 'today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'birthday'],
    weather: ['sunny', 'rainy', 'cloudy', 'windy', 'snowy', 'hot', 'cold', 'warm', 'cool'],
    places: ['town', 'city', 'village', 'park', 'school', 'hospital', 'zoo', 'farm', 'library', 'supermarket', 'classroom', 'home'],
    directions: ['left', 'right', 'up', 'down', 'front', 'back', 'behind', 'in', 'on', 'under', 'near', 'to'],
    transport: ['car', 'bus', 'bike', 'train', 'plane', 'ship'],
    family: ['father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother', 'grandpa', 'grandma', 'dad', 'mum'],
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    nationality: ['american', 'australian', 'british', 'canadian', 'chinese', 'america', 'australia', 'britain', 'canada', 'china'],
    subjects: ['chinese', 'english', 'math', 'music', 'art', 'pe', 'science'],
    frequency: ['always', 'usually', 'often', 'sometimes', 'never'],
    pronouns: ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their'],
    be: ['am', 'is', 'are', 'was', 'were', 'be'],
    numbers: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
};

const PREFERRED_DISTRACTOR_CATEGORIES = new Set([
    'animal',
    'body',
    'clothes',
    'color',
    'drink',
    'family',
    'food',
    'furniture',
    'job',
    'nature',
    'noun',
    'number',
    'person',
    'place',
    'room',
    'school',
    'subject',
    'vehicle'
]);

const VISUAL_EXCLUSION_RULES = {
    evening: ['red', 'orange', 'yellow', 'sunset', 'sun', 'sky'],
    morning: ['sun', 'yellow', 'orange', 'sky'],
    night: ['moon', 'star', 'dark', 'black', 'sky'],
    goodbye: ['hand', 'wave', 'bye', 'hello', 'hi'],
    hello: ['hand', 'wave', 'goodbye', 'bye', 'hi'],
    hi: ['hand', 'wave', 'hello', 'goodbye', 'bye'],
    what: ['who', 'why', 'where', 'when', 'whose', 'how'],
    who: ['what', 'why', 'where', 'when', 'whose', 'how'],
    why: ['what', 'who', 'where', 'when', 'whose', 'how'],
    where: ['what', 'who', 'why', 'when', 'whose', 'how'],
    when: ['what', 'who', 'why', 'where', 'whose', 'how'],
    whose: ['what', 'who', 'why', 'where', 'when', 'how'],
    how: ['what', 'who', 'why', 'where', 'when', 'whose'],
    red: ['apple', 'flower', 'rose', 'blood'],
    blue: ['sky', 'water', 'sea', 'ocean'],
    green: ['grass', 'tree', 'leaf', 'plant'],
    yellow: ['sun', 'banana', 'flower'],
    apple: ['red', 'green', 'fruit'],
    tree: ['green', 'leaf', 'tall', 'forest'],
    sun: ['yellow', 'orange', 'sky', 'hot'],
    moon: ['night', 'sky', 'white'],
    sky: ['blue', 'cloud', 'sun', 'moon'],
    flower: ['red', 'pink', 'garden', 'plant'],
    rain: ['water', 'cloud', 'umbrella', 'wet'],
    snow: ['white', 'cold', 'winter'],
    sea: ['blue', 'water', 'fish', 'ocean'],
    grass: ['green', 'field', 'garden'],
    house: ['door', 'window', 'room', 'home'],
    bird: ['sky', 'fly', 'wing'],
    one: ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    two: ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    three: ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    four: ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    five: ['hello', 'hi', 'goodbye', 'bye', 'wave'],
    happy: ['smile', 'laugh', 'face'],
    sad: ['cry', 'tear', 'face'],
    angry: ['mad', 'face', 'red'],
    hot: ['fire', 'sun', 'cold'],
    cold: ['ice', 'snow', 'hot'],
    old: ['young', 'grandpa', 'grandma'],
    young: ['old', 'baby', 'child']
};

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function loadWordData() {
    const code = fs.readFileSync(WORDS_PATH, 'utf8');
    const sandbox = { console };
    vm.createContext(sandbox);
    vm.runInContext(`${code}\nthis.WORD_DATA = WORD_DATA;`, sandbox);
    return sandbox.WORD_DATA;
}

function buildWordInfo(wordData) {
    const info = new Map();
    Object.keys(wordData).forEach((gradeKey, gradeIndex) => {
        for (const item of wordData[gradeKey]) {
            const norm = normalize(item.word);
            if (!info.has(norm)) {
                info.set(norm, {
                    word: item.word,
                    norm,
                    introGrade: gradeKey,
                    introIndex: gradeIndex,
                    category: item.category || 'unknown'
                });
            }
        }
    });
    return info;
}

function getConflictGroup(wordNorm) {
    for (const [groupName, words] of Object.entries(CONFLICT_GROUPS)) {
        if (words.includes(wordNorm)) {
            return groupName;
        }
    }
    return null;
}

function buildVisualTags(wordNorm, imageRelevance) {
    const entry = imageRelevance[wordNorm] || imageRelevance[wordNorm.charAt(0).toUpperCase() + wordNorm.slice(1)];
    const tags = new Set();
    if (entry) {
        for (const field of ['colors', 'objects', 'scenes', 'scene', 'elements']) {
            for (const value of entry[field] || []) {
                tags.add(normalize(value));
            }
        }
    }
    for (const blocked of VISUAL_EXCLUSION_RULES[wordNorm] || []) {
        tags.add(normalize(blocked));
    }
    return tags;
}

function isVisualConflict(correctNorm, candidateNorm, tags) {
    if (tags.has(candidateNorm)) {
        return true;
    }
    for (const tag of tags) {
        if (candidateNorm.includes(tag) || tag.includes(candidateNorm)) {
            return true;
        }
    }
    return false;
}

function isWeakDistractor(optionInfo) {
    return !optionInfo || !PREFERRED_DISTRACTOR_CATEGORIES.has(optionInfo.category);
}

function main() {
    const wordData = loadWordData();
    const wordInfo = buildWordInfo(wordData);
    const candidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, 'utf8'));
    const imageRelevance = JSON.parse(fs.readFileSync(IMAGE_RELEVANCE_PATH, 'utf8'));

    const summary = {
        total: 0,
        issues: {
            wrong_option_count: 0,
            duplicate_option: 0,
            missing_correct: 0,
            unknown_option: 0,
            grade_mismatch: 0,
            excluded_word: 0,
            same_group: 0,
            visual_conflict: 0,
            weak_distractor: 0
        },
        samples: []
    };

    for (const [key, entry] of Object.entries(candidates)) {
        summary.total += 1;
        const correctNorm = normalize(entry.correct);
        const correctInfo = wordInfo.get(correctNorm);
        if (!correctInfo) {
            continue;
        }

        const issueSet = [];
        const seen = new Set();
        const tags = buildVisualTags(correctNorm, imageRelevance);
        const correctGroup = getConflictGroup(correctNorm);

        if (!Array.isArray(entry.options) || entry.options.length !== 4) {
            summary.issues.wrong_option_count += 1;
            issueSet.push('wrong_option_count');
        }

        if (!entry.options.some(option => normalize(option) === correctNorm)) {
            summary.issues.missing_correct += 1;
            issueSet.push('missing_correct');
        }

        for (const option of entry.options) {
            const optionNorm = normalize(option);
            const optionInfo = wordInfo.get(optionNorm);

            if (seen.has(optionNorm)) {
                summary.issues.duplicate_option += 1;
                issueSet.push('duplicate_option');
                continue;
            }
            seen.add(optionNorm);

            if (optionNorm === correctNorm) {
                continue;
            }

            if (!optionInfo) {
                summary.issues.unknown_option += 1;
                issueSet.push('unknown_option');
                continue;
            }

            if (EXCLUDED_IMAGE_WORDS.has(optionNorm)) {
                summary.issues.excluded_word += 1;
                issueSet.push('excluded_word');
            }

            if (optionInfo.introIndex > correctInfo.introIndex) {
                summary.issues.grade_mismatch += 1;
                issueSet.push('grade_mismatch');
            }

            if (correctGroup && getConflictGroup(optionNorm) === correctGroup) {
                summary.issues.same_group += 1;
                issueSet.push('same_group');
            }

            if (isVisualConflict(correctNorm, optionNorm, tags)) {
                summary.issues.visual_conflict += 1;
                issueSet.push('visual_conflict');
            }

            if (isWeakDistractor(optionInfo)) {
                summary.issues.weak_distractor += 1;
                issueSet.push('weak_distractor');
            }
        }

        if (issueSet.length > 0 && summary.samples.length < 40) {
            summary.samples.push({
                word: key,
                correct: entry.correct,
                options: entry.options,
                issues: [...new Set(issueSet)]
            });
        }
    }

    summary.preferredDistractorCategories = [...PREFERRED_DISTRACTOR_CATEGORIES];

    console.log(JSON.stringify(summary, null, 2));
}

main();
