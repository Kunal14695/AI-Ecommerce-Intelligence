"""
VADER Sentiment Analyzer & Aspect Extraction
Performs sentiment analysis and aspect mining on customer reviews.
Supports NLTK SentimentIntensityAnalyzer when available, with a built-in
lexicon fallback for complete offline reliability.
"""

import re
from typing import Dict, List, Tuple

# Core VADER sentiment lexicon (curated subset of standardized valence ratings [-4.0 to +4.0])
VADER_LEXICON = {
    # High positive
    "excellent": 3.5, "superb": 3.6, "outstanding": 3.7, "fantastic": 3.5,
    "amazing": 3.4, "perfect": 3.4, "love": 3.2, "awesome": 3.3,
    "brilliant": 3.4, "flawless": 3.5, "exceptional": 3.6, "wonderful": 3.3,
    # Moderate positive
    "great": 2.8, "good": 2.1, "nice": 1.8, "solid": 2.0, "decent": 1.6,
    "impressive": 2.6, "smooth": 2.2, "fast": 2.1, "reliable": 2.4,
    "crisp": 1.9, "vibrant": 2.0, "durable": 2.3, "satisfied": 2.2,
    "premium": 2.5, "worth": 2.1, "recommend": 2.4, "sharp": 2.0,
    "clear": 1.8, "comfortable": 2.2, "lightweight": 1.7, "long-lasting": 2.4,
    # Mild positive
    "ok": 0.8, "fine": 1.0, "acceptable": 0.9, "standard": 0.5,
    # Moderate negative
    "slow": -1.8, "lag": -2.0, "laggy": -2.2, "poor": -2.2, "bad": -2.4,
    "cheap": -1.6, "warm": -0.8, "hot": -1.5, "dull": -1.6, "weak": -2.0,
    "noisy": -1.7, "average": -0.4, "disappointed": -2.5, "drain": -2.1,
    "heavy": -1.4, "scratch": -1.7, "defect": -2.6, "fragile": -2.1,
    # High negative
    "terrible": -3.4, "horrible": -3.5, "awful": -3.4, "waste": -3.2,
    "worst": -3.7, "useless": -3.1, "broken": -3.0, "faulty": -3.1,
    "scam": -3.6, "pathetic": -3.3, "unusable": -3.4, "regret": -2.8
}

BOOSTER_DICT = {
    "very": 0.293, "extremely": 0.393, "really": 0.280, "super": 0.300,
    "incredibly": 0.350, "exceptionally": 0.360, "absolutely": 0.350,
    "barely": -0.250, "hardly": -0.250, "slightly": -0.150, "somewhat": -0.100
}

NEGATION_WORDS = {
    "not", "isn't", "wasn't", "shouldn't", "won't", "cannot", "can't",
    "nor", "neither", "never", "no", "without", "hardly"
}

ASPECT_KEYWORDS = {
    "battery": ["battery", "backup", "charging", "charger", "mah", "drain", "power", "endurance", "lasts"],
    "display": ["screen", "display", "amoled", "oled", "brightness", "hz", "refresh", "colors", "viewing"],
    "performance": ["processor", "speed", "lag", "fast", "gaming", "fps", "chipset", "multitasking", "ram"],
    "camera": ["camera", "photo", "photos", "picture", "pictures", "lens", "video", "night", "sensor", "megapixel"],
    "build": ["build", "quality", "design", "durability", "premium", "plastic", "metal", "weight", "finish"],
    "sound": ["sound", "audio", "speaker", "bass", "treble", "volume", "music", "mic", "earbuds", "noise"]
}

def analyze_sentiment(text: str) -> Dict[str, float]:
    """
    Computes VADER-style sentiment polarity scores:
    compound: [-1.0, 1.0]
    pos, neg, neu: [0.0, 1.0]
    """
    if not text or not text.strip():
        return {"compound": 0.0, "pos": 0.0, "neg": 0.0, "neu": 1.0, "label": "Neutral"}

    # Attempt to use NLTK if available with downloaded lexicon
    try:
        import nltk
        from nltk.sentiment.vader import SentimentIntensityAnalyzer
        sia = SentimentIntensityAnalyzer()
        scores = sia.polarity_scores(text)
        compound = round(scores["compound"], 4)
        label = "Positive" if compound >= 0.05 else ("Negative" if compound <= -0.05 else "Neutral")
        return {
            "compound": compound,
            "pos": round(scores["pos"], 4),
            "neg": round(scores["neg"], 4),
            "neu": round(scores["neu"], 4),
            "label": label
        }
    except Exception:
        # Fallback to pure built-in VADER logic
        pass

    clean_text = text.lower()
    words = re.findall(r"\b[a-z'-]+\b", clean_text)
    
    pos_sum = 0.0
    neg_sum = 0.0
    valences = []

    for i, word in enumerate(words):
        if word in VADER_LEXICON:
            val = VADER_LEXICON[word]
            
            # Check previous 2 words for negation
            is_negated = False
            for prev_idx in range(max(0, i - 2), i):
                if words[prev_idx] in NEGATION_WORDS:
                    is_negated = True
                    break
            
            if is_negated:
                val = -0.74 * val

            # Check previous word for booster
            if i > 0 and words[i - 1] in BOOSTER_DICT:
                b_val = BOOSTER_DICT[words[i - 1]]
                if val > 0:
                    val += b_val
                else:
                    val -= b_val

            valences.append(val)
            if val > 0:
                pos_sum += val
            elif val < 0:
                neg_sum += abs(val)

    if not valences:
        return {"compound": 0.0, "pos": 0.0, "neg": 0.0, "neu": 1.0, "label": "Neutral"}

    sum_val = sum(valences)
    # Standard VADER compound normalization: sum / sqrt(sum^2 + alpha) with alpha = 15
    compound = sum_val / ((sum_val ** 2 + 15) ** 0.5)
    compound = round(max(-1.0, min(1.0, compound)), 4)

    total_words = max(len(words), 1)
    pos_ratio = round(min(1.0, pos_sum / total_words), 4)
    neg_ratio = round(min(1.0, neg_sum / total_words), 4)
    neu_ratio = round(max(0.0, 1.0 - (pos_ratio + neg_ratio)), 4)

    label = "Positive" if compound >= 0.05 else ("Negative" if compound <= -0.05 else "Neutral")
    return {
        "compound": compound,
        "pos": pos_ratio,
        "neg": neg_ratio,
        "neu": neu_ratio,
        "label": label
    }

def extract_aspects(text: str, sentiment_compound: float) -> List[str]:
    """
    Extracts relevant product aspects mentioned in review text.
    """
    lower = text.lower()
    detected = []
    for aspect, keywords in ASPECT_KEYWORDS.items():
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", lower):
                detected.append(aspect)
                break
    return detected
