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

const CONCRETE_CATEGORIES = new Set([
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

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function hash(value) {
    let acc = 0;
    for (const ch of value) {
        acc = (acc * 31 + ch.charCodeAt(0)) % 2147483647;
    }
    return acc;
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
    const gradeKeys = Object.keys(wordData);

    gradeKeys.forEach((gradeKey, gradeIndex) => {
        for (const item of wordData[gradeKey]) {
            const norm = normalize(item.word);
            if (!info.has(norm)) {
                info.set(norm, {
                    word: item.word,
                    norm,
                    category: item.category || 'unknown',
                    meaning: item.meaning || '',
                    introGrade: gradeKey,
                    introIndex: gradeIndex
                });
            }
        }
    });

    return { info, gradeKeys };
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
    if (pool.length === 0) {
        return pool;
    }

    const offset = hash(seedWord) % pool.length;
    return pool.slice(offset).concat(pool.slice(0, offset));
}

function isGradeAllowed(correctInfo, candidateInfo) {
    return candidateInfo.introIndex <= correctInfo.introIndex;
}

function isWeakDistractor(candidateInfo) {
    return !candidateInfo || !CONCRETE_CATEGORIES.has(candidateInfo.category);
}

function chooseReplacement(correctInfo, existingOptions, imageRelevance, candidatePool) {
    const correctNorm = correctInfo.norm;
    const correctGroup = getConflictGroup(correctNorm);
    const tags = buildVisualTags(correctNorm, imageRelevance);
    const forbidden = new Set(existingOptions.map(normalize));
    forbidden.add(correctNorm);

    const pool = rotatedPool(candidatePool, correctNorm).filter(candidate =>
        !EXCLUDED_IMAGE_WORDS.has(candidate.norm) &&
        isGradeAllowed(correctInfo, candidate)
    );

    const passes = [
        candidate => candidate.category !== correctInfo.category &&
            CONCRETE_CATEGORIES.has(candidate.category) &&
            (!correctGroup || getConflictGroup(candidate.norm) !== correctGroup) &&
            !isVisualConflict(correctNorm, candidate.norm, tags),
        candidate => candidate.category !== correctInfo.category &&
            (!correctGroup || getConflictGroup(candidate.norm) !== correctGroup) &&
            !isVisualConflict(correctNorm, candidate.norm, tags),
        candidate => (!correctGroup || getConflictGroup(candidate.norm) !== correctGroup) &&
            !isVisualConflict(correctNorm, candidate.norm, tags),
        candidate => !isVisualConflict(correctNorm, candidate.norm, tags)
    ];

    for (const allow of passes) {
        for (const candidate of pool) {
            if (forbidden.has(candidate.norm)) {
                continue;
            }
            if (!allow(candidate)) {
                continue;
            }
            return candidate.word;
        }
    }

    return null;
}

function buildCandidatePool(wordInfoMap) {
    return [...wordInfoMap.values()].filter(item => !EXCLUDED_IMAGE_WORDS.has(item.norm));
}

function main() {
    const wordData = loadWordData();
    const { info: wordInfoMap } = buildWordInfo(wordData);
    const imageRelevance = loadImageRelevance();
    const candidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, 'utf8'));
    const candidatePool = buildCandidatePool(wordInfoMap);

    const stats = {
        changedWords: 0,
        replacements: 0,
        byReason: {
            same_group: 0,
            visual_conflict: 0,
            grade_mismatch: 0,
            excluded_word: 0,
            weak_distractor: 0,
            unknown_word: 0
        }
    };
    const details = [];

    for (const [key, entry] of Object.entries(candidates)) {
        const correctInfo = wordInfoMap.get(normalize(entry.correct));
        if (!correctInfo) {
            stats.byReason.unknown_word += 1;
            continue;
        }

        const correctNorm = correctInfo.norm;
        const correctGroup = getConflictGroup(correctNorm);
        const tags = buildVisualTags(correctNorm, imageRelevance);
        const nextOptions = [correctInfo.word];
        const nextReplaced = [];
        let changed = false;

        for (const option of entry.options.slice(1)) {
            const optionNorm = normalize(option);
            const optionInfo = wordInfoMap.get(optionNorm);
            const sameGroupConflict = Boolean(correctGroup && getConflictGroup(optionNorm) === correctGroup);
            const visualConflict = isVisualConflict(correctNorm, optionNorm, tags);
            const gradeMismatch = !optionInfo || !isGradeAllowed(correctInfo, optionInfo);
            const excludedWord = EXCLUDED_IMAGE_WORDS.has(optionNorm);
            const weakDistractor = isWeakDistractor(optionInfo);

            if (!sameGroupConflict && !visualConflict && !gradeMismatch && !excludedWord && optionInfo && !weakDistractor) {
                nextOptions.push(optionInfo.word);
                continue;
            }

            const replacement = chooseReplacement(
                correctInfo,
                [...nextOptions, ...entry.options.slice(nextOptions.length)],
                imageRelevance,
                candidatePool
            );

            if (!replacement) {
                if (optionInfo && !nextOptions.some(item => normalize(item) === optionNorm)) {
                    nextOptions.push(optionInfo.word);
                }
                continue;
            }

            nextOptions.push(replacement);
            if (sameGroupConflict) {
                stats.byReason.same_group += 1;
            } else if (visualConflict) {
                stats.byReason.visual_conflict += 1;
            } else if (gradeMismatch) {
                stats.byReason.grade_mismatch += 1;
            } else if (excludedWord) {
                stats.byReason.excluded_word += 1;
            } else if (weakDistractor) {
                stats.byReason.weak_distractor += 1;
            }
            stats.replacements += 1;
            nextReplaced.push({
                original: option,
                reason: sameGroupConflict
                    ? '同簇歧义，改为跨类别干扰词'
                    : visualConflict
                        ? '与图片直观元素冲突，改为跨类别干扰词'
                        : gradeMismatch
                            ? '超过正确答案引入年级，改为同年级及以下干扰词'
                            : excludedWord
                                ? '该词已被排除出图片题，改为跨类别干扰词'
                                : '干扰词过于抽象，改为更具体的可视化词',
                replacement
            });
            changed = true;
        }

        while (nextOptions.length < 4) {
            const replacement = chooseReplacement(correctInfo, nextOptions, imageRelevance, candidatePool);
            if (!replacement) {
                break;
            }
            nextOptions.push(replacement);
            stats.replacements += 1;
            nextReplaced.push({
                original: '(missing)',
                reason: '补足 4 个安全候选词',
                replacement
            });
            changed = true;
        }

        if (nextOptions.length === 4) {
            const previousOptions = entry.options;
            const uniqueOptions = [];
            const seen = new Set();
            for (const option of nextOptions) {
                const optionNorm = normalize(option);
                if (!seen.has(optionNorm)) {
                    uniqueOptions.push(option);
                    seen.add(optionNorm);
                }
            }
            entry.options = uniqueOptions;
            entry.correct = correctInfo.word;
            entry.replaced = nextReplaced;
            changed = changed || uniqueOptions.some((option, index) => normalize(option) !== normalize(previousOptions[index]));
        }

        if (changed) {
            stats.changedWords += 1;
            details.push({
                word: key,
                options: entry.options
            });
        }
    }

    fs.writeFileSync(CANDIDATES_PATH, JSON.stringify(candidates, null, 2) + '\n');
    console.log(JSON.stringify({ stats, sample: details.slice(0, 40) }, null, 2));
}

main();
