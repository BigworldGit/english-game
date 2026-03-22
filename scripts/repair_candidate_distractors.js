#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const WORDS_PATH = path.join(ROOT, 'words.js');
const CANDIDATES_PATH = path.join(ROOT, 'docs', 'candidate-words-fixed.json');
const IMAGE_RELEVANCE_PATH = path.join(ROOT, 'docs', 'image-relevance.json');

const CONFLICT_GROUPS = {
    greetings: ['hello', 'hi', 'goodbye', 'bye', 'good morning', 'good afternoon', 'good evening', 'good night'],
    question: ['what', 'who', 'why', 'where', 'when', 'whose', 'how'],
    colors: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'pink', 'purple', 'brown'],
    time: ['morning', 'afternoon', 'evening', 'night'],
    weather: ['sunny', 'rainy', 'cloudy', 'windy', 'snowy', 'hot', 'cold', 'warm', 'cool'],
    places: ['town', 'city', 'village', 'park', 'school', 'hospital', 'zoo', 'farm', 'library', 'supermarket', 'classroom'],
    directions: ['left', 'right', 'up', 'down', 'front', 'back', 'behind', 'in', 'on', 'under'],
    transport: ['car', 'bus', 'bike', 'train', 'plane', 'ship'],
    family: ['father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother', 'grandpa', 'grandma', 'dad', 'mum'],
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    seasons: ['spring', 'summer', 'autumn', 'winter']
};

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
    happy: ['smile', 'laugh', 'face'],
    sad: ['cry', 'tear', 'face'],
    angry: ['mad', 'face', 'red'],
    hot: ['fire', 'sun', 'cold'],
    cold: ['ice', 'snow', 'hot'],
    old: ['young', 'grandpa', 'grandma'],
    young: ['old', 'baby', 'child']
};

const ABSTRACT_CATEGORIES = new Set([
    'greeting',
    'question',
    'phrase',
    'prep',
    'pronoun',
    'conj',
    'time',
    'weather',
    'color',
    'direction'
]);
const CONCRETE_CATEGORIES = new Set([
    'animal',
    'body',
    'clothes',
    'drink',
    'family',
    'food',
    'furniture',
    'job',
    'nature',
    'noun',
    'person',
    'place',
    'room',
    'school',
    'subject',
    'vehicle'
]);

function normalize(value) {
    return String(value).trim().toLowerCase();
}

function hash(value) {
    let acc = 0;
    for (const ch of value) {
        acc = (acc * 31 + ch.charCodeAt(0)) % 2147483647;
    }
    return acc;
}

function loadWordInfo() {
    const code = fs.readFileSync(WORDS_PATH, 'utf8');
    const sandbox = { console };
    vm.createContext(sandbox);
    vm.runInContext(`${code}\nthis.WORD_DATA = WORD_DATA;`, sandbox);

    const info = new Map();
    for (const entries of Object.values(sandbox.WORD_DATA)) {
        for (const item of entries) {
            const key = normalize(item.word);
            if (!info.has(key)) {
                info.set(key, {
                    word: item.word,
                    category: item.category || 'unknown',
                    meaning: item.meaning || ''
                });
            }
        }
    }
    return info;
}

function loadImageRelevance() {
    return JSON.parse(fs.readFileSync(IMAGE_RELEVANCE_PATH, 'utf8'));
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
    if (candidateNorm === correctNorm) {
        return false;
    }
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

function rotatedPool(pool, seedWord) {
    const offset = hash(seedWord) % pool.length;
    return pool.slice(offset).concat(pool.slice(0, offset));
}

function chooseReplacement(correctWord, existingOptions, wordInfoMap, imageRelevance, candidatePool) {
    const correctNorm = normalize(correctWord);
    const correctInfo = wordInfoMap.get(correctNorm) || { category: 'unknown' };
    const correctGroup = getConflictGroup(correctNorm);
    const forbidden = new Set(existingOptions.map(normalize));
    forbidden.add(correctNorm);
    const tags = buildVisualTags(correctNorm, imageRelevance);

    const pool = rotatedPool(candidatePool, correctNorm);
    const passes = [
        candidate => candidate.category !== correctInfo.category &&
            CONCRETE_CATEGORIES.has(candidate.category) &&
            (!correctGroup || getConflictGroup(candidate.norm) !== correctGroup),
        candidate => candidate.category !== correctInfo.category &&
            (!correctGroup || getConflictGroup(candidate.norm) !== correctGroup),
        candidate => !correctGroup || getConflictGroup(candidate.norm) !== correctGroup,
        () => true
    ];

    for (const allow of passes) {
        for (const candidate of pool) {
            if (forbidden.has(candidate.norm)) {
                continue;
            }
            if (!allow(candidate)) {
                continue;
            }
            if (isVisualConflict(correctNorm, candidate.norm, tags)) {
                continue;
            }
            return candidate.word;
        }
    }

    return null;
}

function main() {
    const wordInfoMap = loadWordInfo();
    const imageRelevance = loadImageRelevance();
    const candidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, 'utf8'));

    const candidatePool = Object.values(candidates).map(entry => {
        const norm = normalize(entry.correct);
        if (!wordInfoMap.has(norm)) {
            return null;
        }
        const info = wordInfoMap.get(norm);
        return {
            word: info.word,
            norm,
            category: info.category
        };
    }).filter(Boolean);

    const stats = {
        changedWords: 0,
        replacements: 0,
        byReason: {
            same_group: 0,
            visual_conflict: 0
        }
    };
    const details = [];

    for (const [key, entry] of Object.entries(candidates)) {
        const correctWord = entry.correct;
        const correctNorm = normalize(correctWord);
        const correctGroup = getConflictGroup(correctNorm);
        const tags = buildVisualTags(correctNorm, imageRelevance);
        const nextOptions = [correctWord];
        const nextReplaced = Array.isArray(entry.replaced) ? [...entry.replaced] : [];
        let changed = false;

        for (let i = 1; i < entry.options.length; i++) {
            const option = entry.options[i];
            const optionNorm = normalize(option);
            const sameGroupConflict = Boolean(correctGroup && getConflictGroup(optionNorm) === correctGroup);
            const visualConflict = isVisualConflict(correctNorm, optionNorm, tags);

            if (!sameGroupConflict && !visualConflict) {
                nextOptions.push(option);
                continue;
            }

            const replacement = chooseReplacement(
                correctWord,
                [...nextOptions, ...entry.options.slice(i + 1)],
                wordInfoMap,
                imageRelevance,
                candidatePool
            );

            if (!replacement) {
                nextOptions.push(option);
                continue;
            }

            nextOptions.push(replacement);
            nextReplaced.push({
                original: option,
                reason: sameGroupConflict ? '同簇歧义，改为跨类别干扰词' : '与图片直观元素冲突，改为跨类别干扰词',
                replacement
            });
            changed = true;
            stats.replacements += 1;
            if (sameGroupConflict) {
                stats.byReason.same_group += 1;
            } else {
                stats.byReason.visual_conflict += 1;
            }
        }

        if (changed) {
            entry.options = nextOptions;
            entry.replaced = nextReplaced;
            stats.changedWords += 1;
            details.push({
                word: key,
                options: nextOptions
            });
        }
    }

    fs.writeFileSync(CANDIDATES_PATH, JSON.stringify(candidates, null, 2) + '\n');

    console.log(JSON.stringify({ stats, sample: details.slice(0, 40) }, null, 2));
}

main();
