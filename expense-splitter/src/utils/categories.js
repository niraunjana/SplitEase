export const CATEGORIES = [
  { id: "food", label: "Food & Drinks", emoji: "🍔", color: "#f97316" },
  { id: "transport", label: "Transport", emoji: "🚗", color: "#3b82f6" },
  { id: "shopping", label: "Shopping", emoji: "🛍️", color: "#8b5cf6" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬", color: "#ec4899" },
  { id: "accommodation", label: "Accommodation", emoji: "🏨", color: "#14b8a6" },
  { id: "utilities", label: "Utilities", emoji: "💡", color: "#f59e0b" },
  { id: "healthcare", label: "Healthcare", emoji: "💊", color: "#ef4444" },
  { id: "other", label: "Other", emoji: "📦", color: "#6b7280" },
];

export const CATEGORY_EMOJI = {
  food: "🍔",
  transport: "🚗",
  shopping: "🛍️",
  entertainment: "🎬",
  accommodation: "🏨",
  utilities: "💡",
  healthcare: "💊",
  other: "📦",
};

const RULES = {
  food: [
    "food", "eat", "lunch", "dinner", "breakfast", "restaurant", "pizza",
    "burger", "snack", "drink", "cafe", "coffee", "meal", "biryani",
    "dosa", "thali", "swiggy", "zomato",
  ],
  transport: [
    "taxi", "uber", "ola", "cab", "bus", "train", "flight", "fuel", "petrol",
    "diesel", "auto", "rickshaw", "metro", "toll", "parking", "airport",
  ],
  accommodation: [
    "hotel", "stay", "rent", "airbnb", "hostel", "room", "lodge", "booking",
    "accommodation", "house", "apartment",
  ],
  entertainment: [
    "movie", "club", "bar", "party", "game", "concert", "show", "tickets",
    "entry", "bowling", "sports", "netflix", "spotify",
  ],
  shopping: [
    "shopping", "clothes", "shoes", "amazon", "flipkart", "mall", "market",
    "grocery", "supermarket", "store",
  ],
  utilities: [
    "electricity", "water", "gas", "wifi", "internet", "phone", "bill",
    "recharge", "subscription",
  ],
  healthcare: [
    "medicine", "doctor", "hospital", "clinic", "pharmacy", "health",
    "medical", "ambulance", "chemist",
  ],
};

export function detectCategory(description) {
  if (!description) return "other";
  const lower = description.toLowerCase();
  for (const [cat, keywords] of Object.entries(RULES)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return "other";
}

export async function detectCategoryAI(description) {
  if (!description || description.trim().length < 3) return "other";

  const ruleResult = detectCategory(description);
  if (ruleResult !== "other") return ruleResult;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: "You are an expense categorizer. Given a description, return ONLY one of these category IDs (no other text): food, transport, shopping, entertainment, accommodation, utilities, healthcare, other",
        messages: [
          { role: "user", content: "Categorize this expense: \"" + description + "\"" },
        ],
      }),
    });

    if (!response.ok) return ruleResult;
    const data = await response.json();
    const result = data.content?.[0]?.text?.trim().toLowerCase();
    const valid = Object.keys(CATEGORY_EMOJI);
    return valid.includes(result) ? result : ruleResult;
  } catch {
    return ruleResult;
  }
}

export function getCategoryInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}
