#!/usr/bin/env python3
"""
Update candidate words based on exclusion rules.
"""

import json
from pathlib import Path

# Exclusion rules: key = correct word, value = list of words to exclude from distractors
EXCLUSION_RULES = {
    "evening": ["red", "orange", "yellow", "sunset", "sun", "sky"],
    "morning": ["sun", "yellow", "orange", "sky"],
    "night": ["moon", "star", "dark", "black", "sky"],
    "tall": ["tree", "building", "high", "up"],
    "goodbye": ["hand", "wave", "bye"],
    "hello": ["hand", "wave"],
    "door": ["house", "room", "home"],
    "close": ["door", "open", "house"],
    "open": ["door", "close", "window"],
    "red": ["apple", "flower", "rose", "blood"],
    "blue": ["sky", "water", "sea", "ocean"],
    "green": ["grass", "tree", "leaf", "plant"],
    "yellow": ["sun", "banana", "flower"],
    "apple": ["red", "green", "fruit"],
    "tree": ["green", "leaf", "tall", "forest"],
    "sun": ["yellow", "orange", "sky", "hot"],
    "moon": ["night", "sky", "white"],
    "sky": ["blue", "cloud", "sun", "moon"],
    "flower": ["red", "pink", "garden", "plant"],
    "rain": ["water", "cloud", "umbrella", "wet"],
    "snow": ["white", "cold", "winter"],
    "sea": ["blue", "water", "fish", "ocean"],
    "grass": ["green", "field", "garden"],
    "house": ["door", "window", "room", "home"],
    "car": ["road", "drive", "wheel"],
    "bird": ["sky", "fly", "wing"],
    "dog": ["animal", "pet", "cat"],
    "cat": ["animal", "pet", "dog"],
    "fish": ["water", "sea", "swim"],
    "hand": ["finger", "arm", "wave"],
    "eye": ["see", "face", "look"],
    "face": ["eye", "nose", "mouth"],
    "happy": ["smile", "laugh", "face"],
    "sad": ["cry", "tear", "face"],
    "angry": ["mad", "face", "red"],
    "big": ["small", "large", "huge"],
    "small": ["big", "little", "tiny"],
    "hot": ["cold", "fire", "sun"],
    "cold": ["hot", "ice", "snow"],
    "old": ["young", "grandpa", "grandma"],
    "young": ["old", "baby", "child"],
    # Additional rules based on semantic relationships
    "afternoon": ["sun", "sky", "yellow", "orange"],
    "spring": ["flower", "green", "grass"],
    "summer": ["sun", "hot", "swim"],
    "autumn": ["leaf", "yellow", "orange"],
    "winter": ["snow", "cold", "white"],
    "cloudy": ["sunny", "rain", "cloud"],
    "sunny": ["sun", "sky", "yellow", "cloudy"],
    "rainy": ["sunny", "cloudy", "rain", "water"],
    "windy": ["wind", "tree", "leaf"],
    "white": ["snow", "cloud", "milk"],
    "black": ["night", "dark"],
    "pink": ["flower", "girl"],
    "orange": ["sun", "fruit"],
    "purple": ["flower", "grape"],
    "water": ["sea", "drink", "blue"],
    "cloud": ["sky", "rain", "white"],
    "star": ["night", "sky", "yellow"],
}

def get_category_words(correct_word):
    """Get words in the same category for replacement."""
    categories = {
        "colors": ["red", "blue", "green", "yellow", "black", "white", "orange", "pink", "purple", "brown"],
        "family": ["father", "mother", "brother", "sister", "grandfather", "grandmother", "dad", "mum", "grandpa", "grandma"],
        "animals": ["dog", "cat", "bird", "fish", "rabbit", "bear", "pig", "duck", "monkey", "elephant", "tiger", "lion"],
        "food": ["apple", "banana", "rice", "beef", "egg", "bread", "cake", "chicken", "pork", "vegetable", "fruit", "watermelon", "grape", "orange"],
        "time": ["morning", "afternoon", "evening", "night", "today", "tomorrow", "yesterday", "week", "month", "year"],
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        "seasons": ["spring", "summer", "autumn", "winter"],
        "weather": ["sunny", "rainy", "cloudy", "windy", "snowy", "warm", "cool", "hot", "cold"],
        "body": ["head", "face", "eye", "ear", "nose", "mouth", "hand", "leg", "foot", "arm", "finger", "hair"],
        "greetings": ["hello", "hi", "goodbye", "bye", "good morning", "good afternoon", "good evening", "good night"],
        "nature": ["sun", "moon", "star", "cloud", "rain", "snow", "sky", "grass", "flower", "tree"],
        "places": ["school", "home", "park", "hospital", "library", "zoo", "supermarket", "city", "village", "farm"],
        "transport": ["car", "bus", "bike", "train", "plane", "ship"],
        "furniture": ["bed", "chair", "desk", "table", "sofa", "window", "door"],
        "clothes": ["shirt", "skirt", "dress", "coat", "hat", "cap", "shoe", "sock", "sweater", "jeans", "jacket"],
        "numbers": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
        "jobs": ["doctor", "nurse", "teacher", "driver", "farmer", "cook", "postman", "businessman", "police"],
        "directions": ["up", "down", "left", "right", "front", "back"],
        "subjects": ["english", "chinese", "math", "music", "art", "pe"],
        "countries": ["america", "australia", "china", "japan", "france", "uk"],
        "nationalities": ["american", "australian", "chinese", "english", "japanese", "french", "british"],
        "verbs": ["go", "come", "run", "walk", "read", "write", "sing", "dance", "eat", "drink", "sleep", "play", "swim", "fly", "jump", "sit", "stand"],
        "adjectives": ["big", "small", "tall", "short", "long", "hot", "cold", "warm", "cool", "new", "old", "young", "happy", "sad", "angry", "beautiful", "kind", "nice", "good", "bad", "fast", "slow", "heavy", "light"],
        "pronouns": ["i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her"],
    }
    
    correct_lower = correct_word.lower()
    for cat_name, words in categories.items():
        if correct_lower in [w.lower() for w in words]:
            return [w for w in words if w.lower() != correct_lower]
    return []

def find_replacement(correct_word, forbidden_words, all_words_data):
    """Find a suitable replacement word that's not in the forbidden set."""
    # Get category words first
    category_words = get_category_words(correct_word)
    
    # Try category words first
    for word in category_words:
        if word.lower().strip() not in forbidden_words:
            return word
    
    # Get words from same data file - find similar length words
    correct_len = len(correct_word)
    candidates = []
    
    for key in all_words_data.keys():
        entry = all_words_data[key]
        for opt in entry["options"]:
            opt_lower = opt.lower().strip()
            if opt_lower not in forbidden_words and opt_lower != correct_word.lower():
                # Prefer words of similar length
                len_diff = abs(len(opt) - correct_len)
                candidates.append((len_diff, opt))
    
    # Sort by length similarity
    candidates.sort(key=lambda x: x[0])
    
    for _, word in candidates[:100]:  # Check top 100 candidates
        if word.lower().strip() not in forbidden_words:
            return word
    
    return None

def process_candidate_words(input_file, output_file):
    """Process the candidate words file and apply exclusion rules."""
    
    # Read input file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    stats = {
        "total_words": len(data),
        "words_with_changes": 0,
        "total_replacements": 0,
        "details": []
    }
    
    # Process each word
    for key, entry in data.items():
        correct = entry["correct"]
        options = entry["options"].copy()
        replaced = []
        
        # Check for existing replaced field
        if "replaced" in entry and isinstance(entry["replaced"], list):
            for r in entry["replaced"]:
                if isinstance(r, dict):
                    replaced.append(r)
        
        # Check if correct word has exclusion rules
        correct_lower = correct.lower().replace("_", " ").replace("-", " ")
        
        # Find matching exclusion rule
        exclusion_list = None
        for rule_key in EXCLUSION_RULES:
            if rule_key.lower() == correct_lower or rule_key.lower() in correct_lower:
                exclusion_list = EXCLUSION_RULES[rule_key]
                break
        
        if not exclusion_list:
            continue
        
        # Build the forbidden words set:
        # 1. Correct answer
        # 2. All exclusion list words
        # 3. All existing distractors (we need unique options)
        forbidden_words = set()
        forbidden_words.add(correct.lower().strip())
        for ex in exclusion_list:
            forbidden_words.add(ex.lower().strip())
        
        # Add all existing distractors to forbidden (to ensure uniqueness)
        for opt in options:
            forbidden_words.add(opt.lower().strip())
        
        # Track which distractors need replacement
        replacements_needed = []  # (index, original_word, matched_rule)
        
        for i in range(1, len(options)):
            distractor = options[i]
            distractor_lower = distractor.lower().strip()
            
            # Check if distractor should be excluded
            for excluded_word in exclusion_list:
                if excluded_word.lower() == distractor_lower or excluded_word.lower() in distractor_lower:
                    replacements_needed.append((i, distractor, excluded_word))
                    break
        
        if not replacements_needed:
            continue
        
        # Now process replacements
        new_options = [options[0]]  # Keep correct answer
        made_changes = False
        
        for i in range(1, len(options)):
            distractor = options[i]
            
            # Check if this distractor needs replacement
            needs_replacement = None
            for idx, orig, rule in replacements_needed:
                if idx == i:
                    needs_replacement = (orig, rule)
                    break
            
            if needs_replacement:
                orig_word, matched_rule = needs_replacement
                
                # Find replacement (forbidden_words already includes all existing options)
                replacement = find_replacement(correct, forbidden_words, data)
                if replacement:
                    replacement_lower = replacement.lower().strip()
                    # Add to forbidden words so next replacement won't use it
                    forbidden_words.add(replacement_lower)
                    new_options.append(replacement)
                    replaced.append({
                        "original": orig_word,
                        "reason": f"在排除规则中 (规则词: {matched_rule})",
                        "replacement": replacement
                    })
                    made_changes = True
                    stats["total_replacements"] += 1
                    print(f"  ✓ 替换: {correct} - '{orig_word}' -> '{replacement}'")
                else:
                    # Keep original if no valid replacement found
                    new_options.append(distractor)
                    print(f"  ⚠ 保留: {correct} - '{distractor}' (无有效替代词)")
            else:
                # Keep this distractor
                new_options.append(distractor)
        
        if made_changes:
            entry["options"] = new_options
            entry["replaced"] = replaced
            stats["words_with_changes"] += 1
            stats["details"].append({
                "word": correct,
                "replacements": len([r for r in replaced if isinstance(r, dict) and "original" in r])
            })
    
    # Write output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return stats

if __name__ == "__main__":
    base_path = Path("/Users/roy/.openclaw/workspace/english-game/docs")
    input_file = base_path / "candidate-words-fixed.json"
    output_file = base_path / "candidate-words-fixed.json"
    
    print("=" * 60)
    print("候选词表排除规则处理")
    print("=" * 60)
    print(f"输入文件: {input_file}")
    print(f"输出文件: {output_file}")
    print()
    
    stats = process_candidate_words(input_file, output_file)
    
    print()
    print("=" * 60)
    print("处理完成!")
    print("=" * 60)
    print(f"总单词数: {stats['total_words']}")
    print(f"有变更的单词: {stats['words_with_changes']}")
    print(f"总替换次数: {stats['total_replacements']}")
    print()
    
    if stats['details']:
        print("变更详情:")
        for detail in stats['details'][:30]:  # Show first 30
            print(f"  - {detail['word']}: {detail['replacements']} 个替换")
        if len(stats['details']) > 30:
            print(f"  ... 还有 {len(stats['details']) - 30} 个")