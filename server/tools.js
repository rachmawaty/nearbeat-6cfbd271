/**
 * Nearbeat Agent Tools
 * These are the real-world data tools the agent calls during its reasoning loop.
 * In production each tool hits a live API; in this prototype they return
 * rich, realistic mock data that mirrors what the real integration would return.
 */

// ---------------------------------------------------------------------------
// Merchant catalog — keyed by neighborhood
// ---------------------------------------------------------------------------
const MERCHANTS = {
  Cambridge: [
    { id: "cafe-rossa", name: "Cafe Rossa", emoji: "☕", category: "coffee", address: "18 Hampshire St", distance_m: 320, eta_min: 6, avg_spend: 6.5 },
    { id: "gymfuel", name: "GymFuel", emoji: "🥤", category: "wellness", address: "Next to GymFuel Kendall", distance_m: 40, eta_min: 0, avg_spend: 9 },
    { id: "area-four", name: "Area Four", emoji: "🍕", category: "dining", address: "500 Technology Sq", distance_m: 500, eta_min: 10, avg_spend: 22 },
    { id: "tatte-kendall", name: "Tatte Bakery", emoji: "🥐", category: "coffee", address: "Cambridge St", distance_m: 280, eta_min: 5, avg_spend: 11 },
    { id: "clover-kendall", name: "Clover Food Lab", emoji: "🥗", category: "dining", address: "Kendall Sq", distance_m: 350, eta_min: 7, avg_spend: 14 },
    { id: "umbrella-co", name: "The Umbrella Co.", emoji: "☂️", category: "accessories", address: "2 min off route", distance_m: 180, eta_min: 4, avg_spend: 20 },
    { id: "cvs-kendall", name: "CVS Pharmacy", emoji: "💊", category: "health", address: "Kendall Sq", distance_m: 200, eta_min: 4, avg_spend: 15 },
    { id: "flour-cambridge", name: "Flour Bakery", emoji: "🍞", category: "coffee", address: "190 Massachusetts Ave", distance_m: 600, eta_min: 12, avg_spend: 9 },
  ],
  "Back Bay": [
    { id: "bluestone", name: "Bluestone Lane", emoji: "☕", category: "coffee", address: "Boston", distance_m: 220, eta_min: 5, avg_spend: 7 },
    { id: "mooo", name: "Mooo....", emoji: "🥩", category: "dining", address: "15 Beacon St", distance_m: 0, eta_min: 25, avg_spend: 85 },
    { id: "shell-boylston", name: "Shell — Boylston", emoji: "⛽", category: "gas", address: "Boylston St", distance_m: 90, eta_min: 2, avg_spend: 55 },
    { id: "trident-books", name: "Trident Booksellers", emoji: "📖", category: "retail", address: "338 Newbury St", distance_m: 410, eta_min: 8, avg_spend: 24 },
    { id: "sweetgreen-bb", name: "Sweetgreen", emoji: "🥗", category: "dining", address: "Newbury St", distance_m: 300, eta_min: 6, avg_spend: 16 },
    { id: "lululemon", name: "Lululemon", emoji: "🏃", category: "wellness", address: "Newbury St", distance_m: 350, eta_min: 7, avg_spend: 110 },
    { id: "soulcycle-bb", name: "SoulCycle", emoji: "🚴", category: "wellness", address: "Exeter St", distance_m: 450, eta_min: 9, avg_spend: 40 },
  ],
  Longwood: [
    { id: "tatte-long", name: "Tatte Bakery", emoji: "🥐", category: "coffee", address: "Longwood Ave", distance_m: 280, eta_min: 6, avg_spend: 11 },
    { id: "juicepress", name: "Juice Press", emoji: "🥬", category: "wellness", address: "Near CorePower", distance_m: 60, eta_min: 1, avg_spend: 12 },
    { id: "corepower", name: "CorePower Yoga", emoji: "🧘", category: "wellness", address: "Longwood", distance_m: 80, eta_min: 1, avg_spend: 35 },
    { id: "trident-long", name: "Trident Booksellers", emoji: "📖", category: "retail", address: "Near Countway", distance_m: 410, eta_min: 9, avg_spend: 24 },
    { id: "harvest-coop", name: "Harvest Co-op", emoji: "🥬", category: "groceries", address: "South End", distance_m: 550, eta_min: 11, avg_spend: 45 },
    { id: "pavement-long", name: "Pavement Coffeehouse", emoji: "☕", category: "coffee", address: "Longwood Ave", distance_m: 320, eta_min: 6, avg_spend: 6 },
  ],
};

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

/**
 * get_merchants_nearby
 * Returns merchants near the user's current area, optionally filtered by category.
 */
export function get_merchants_nearby({ city, categories }) {
  const all = MERCHANTS[city] ?? MERCHANTS["Cambridge"];
  const merchants = categories && categories.length > 0
    ? all.filter((m) => categories.some((c) => m.category.includes(c.toLowerCase())))
    : all;
  return { merchants: merchants.slice(0, 8), city, timestamp: new Date().toISOString() };
}

/**
 * get_live_weather
 * Returns current weather for the user's city.
 * In production: calls OpenWeather API with real coordinates.
 */
export function get_live_weather({ city }) {
  const conditions = {
    Cambridge: { condition: "Light rain incoming", temp_c: 14, emoji: "🌦️", code: "rain", advisory: "Bring an umbrella — precipitation in 20 min" },
    Boston:    { condition: "Sunny and clear",     temp_c: 19, emoji: "☀️",  code: "sunny", advisory: "Great day to walk" },
    Longwood:  { condition: "Cloudy, mild",         temp_c: 17, emoji: "☁️",  code: "cloudy", advisory: "Comfortable outdoors" },
  };
  return conditions[city] ?? conditions["Boston"];
}

/**
 * score_signal_relevance
 * Given a signal type and the user's context, returns a relevance score 0-1
 * and an explanation of why the signal is active.
 */
export function score_signal_relevance({ signal, context }) {
  const now = new Date();
  const hour = now.getHours();
  const scores = {
    route:    { score: context.next_waypoint ? 0.9 : 0.3, reason: context.next_waypoint ? `En route to ${context.next_waypoint.name} (${context.next_waypoint.eta} min)` : "Stationary" },
    schedule: { score: context.schedule?.length > 0 ? 0.85 : 0.2, reason: context.schedule?.[0] ? `Next: ${context.schedule[0].event} at ${context.schedule[0].time}` : "No upcoming events" },
    habit:    { score: 0.8, reason: `Frequent merchants: ${context.spend?.merchants?.slice(0, 2).join(", ")}` },
    weather:  { score: context.weather?.code === "rain" ? 0.95 : 0.4, reason: context.weather?.label ?? "Weather checked" },
    spend:    { score: 0.75, reason: `Top spend: ${context.spend?.categories?.slice(0, 2).join(", ")}` },
    health:   { score: context.health?.gym_today ? 0.9 : 0.3, reason: context.health?.gym_today ? "Gym session detected today" : "Rest day" },
    email:    { score: context.email_bookings?.length > 0 ? 0.88 : 0.2, reason: context.email_bookings?.[0] ? `Booking: ${context.email_bookings[0].merchant} at ${context.email_bookings[0].time}` : "No upcoming bookings" },
  };
  return scores[signal] ?? { score: 0.5, reason: "Signal active" };
}
