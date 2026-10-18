"""Wing definitions for visual review: a one-line description (for the VLM) and SigLIP text prototypes (max over prompts)."""

WING_DESCRIBE = {
    "americana": "America: flag, founders, presidents, US history and monuments, cowboys, American pride",
    "rome": "Rome and Greece: legions, emperors, Spartans, classical statues and ruins",
    "christendom": "Christianity: Christ, saints, cathedrals, Mass, sacred art",
    "medieval": "Medieval and Norse: knights, crusaders, castles, kings, Vikings",
    "history": "Western history: historical maps, archive footage, historical paintings, empires, world wars",
    "frontier": "Space and the West's frontier: rockets, astronauts, Earth from orbit, Western landscapes and national parks",
    "military": "Military: fighter jets, warships, soldiers, tanks",
    "arena": "US sports: NFL, NBA, MLB, UFC, boxing",
    "motorsport": "Cars and F1: race cars, supercars, NASCAR, muscle cars",
    "builders": "Engineering and architecture: megaprojects, skyscrapers, industry, grand buildings",
}

# Wings that can go live (celebrate Western civilization; Americana first).
WING_PROMPTS = {
    "americana": [
        "the American flag", "the United States of America, patriotic montage", "American founding fathers and the Constitution",
        "bald eagle and stars and stripes", "Mount Rushmore and American monuments", "American cowboys on the frontier",
        "a map of the United States", "US presidents", "the Statue of Liberty",
    ],
    "rome": [
        "ancient Rome, Roman legionaries and the Colosseum", "Roman emperor statue in marble", "ancient Greece, the Parthenon and Greek statues",
        "Spartan warriors with shields", "classical Greek and Roman sculpture", "a classical oil painting of antiquity",
    ],
    "christendom": [
        "a Gothic cathedral interior", "Jesus Christ religious painting", "a Catholic Mass with priests at the altar", "Christian cross and church",
        "icons of saints and the Virgin Mary", "monks and stained glass windows",
    ],
    "medieval": [
        "medieval knights in armor", "Crusaders on horseback", "a medieval castle", "Vikings and longships", "a medieval king with a crown and sword",
    ],
    "history": [
        "a historical map with borders and empires", "black and white historical archive footage", "18th or 19th century historical painting",
        "Napoleonic soldiers", "World War era historical photographs",
    ],
    "frontier": [
        "a rocket launch into space", "astronauts on the Moon", "planet Earth from space", "the American West landscape, canyons and mountains",
        "a national park with forests and rivers", "cowboys riding horses in the desert",
    ],
    "military": [
        "fighter jets flying in formation", "a military aircraft carrier", "soldiers in combat uniform", "tanks and artillery", "US Navy warship",
    ],
    "arena": [
        "American football players in the NFL", "NBA basketball game", "baseball player hitting a home run", "UFC mixed martial arts fighters in the octagon",
        "a boxing match",
    ],
    "motorsport": [
        "Formula 1 race car on a track", "a supercar driving fast", "NASCAR racing", "a classic muscle car",
    ],
    "builders": [
        "a skyscraper under construction", "a giant engineering megaproject, bridge or dam", "grand classical architecture building", "industrial factory and machinery",
        "a city skyline at night",
    ],
}

# Non-fit content (rejected as "unfit" when it dominates). Used for primary-genre competition only.
UNFIT_PROMPTS = {
    "reality_tv": ["a reality TV show scene like Love Island", "a dating show contestants in swimwear by a pool", "a reality show confessional interview"],
    "celebrity_fancam": ["a K-pop idol fancam on stage", "a pop singer celebrity fan edit", "a celebrity on the red carpet", "a music artist performing at a concert"],
    "anime": ["an anime character", "Japanese anime screenshot", "a cartoon animation still"],
    "film_tv": ["a scene from a Hollywood movie with actors", "a TV series drama scene"],
    "gaming": ["video game gameplay footage", "a video game character in a 3D game"],
    "soccer": ["European soccer football match", "a soccer player celebrating a goal"],
    "vlog_selfie": ["a person talking to a phone camera, selfie video", "a TikTok influencer dancing in their bedroom"],
    "text_meme": ["a meme image with text caption", "a screenshot of a social media post", "a news broadcast with a chyron"],
    "slop": ["low quality AI generated image", "a random everyday scene"],
}

NSFW_PROMPTS = [
    "nudity", "a sexually explicit image", "a sexually suggestive pose", "a woman in lingerie", "a person in underwear in a bedroom",
    "a massage scene with exposed skin", "erotic content", "twerking", "bikini close-up",
]
SAFE_PROMPTS = ["a fully clothed person", "a landscape", "a historical painting", "a sports game", "a vehicle"]
