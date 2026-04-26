export type SignalKey = "route" | "schedule" | "habit" | "weather" | "spend" | "health" | "email";
export type DataSource =
  | "google_maps"
  | "google_calendar"
  | "plaid"
  | "gmail"
  | "healthkit"
  | "openweather";

export interface Persona {
  key: string;
  name: string;
  occupation: string;
  age_bracket: string;
  avatar: string; // emoji
  subtitle: string;
  area: string;
  city: string;
  weather: { label: string; temp: number; emoji: string };
  next_waypoint: { name: string; eta: number };
  schedule: { time: string; event: string; location?: string }[];
  spend: { categories: string[]; merchants: string[] };
  email_bookings: { merchant: string; time: string }[];
  health: { gym_today: boolean; activity: string };
  offers: Offer[];
}

export interface Offer {
  merchant_id: string;
  merchant_name: string;
  merchant_emoji: string;
  category: string;
  offer: string;
  value: string;
  reason: string;
  signal_used: SignalKey;
  data_source: DataSource;
  distance_m: number;
  eta_min: number;
}

export const SIGNAL_META: Record<
  SignalKey,
  { label: string; colorVar: string; sourceLabel: Partial<Record<DataSource, string>> }
> = {
  route: {
    label: "ROUTE",
    colorVar: "signal-route",
    sourceLabel: { google_maps: "Google Maps" },
  },
  schedule: {
    label: "SCHEDULE",
    colorVar: "signal-schedule",
    sourceLabel: { google_calendar: "Google Calendar" },
  },
  habit: {
    label: "HABIT",
    colorVar: "signal-habit",
    sourceLabel: { plaid: "Plaid" },
  },
  weather: {
    label: "WEATHER",
    colorVar: "signal-weather",
    sourceLabel: { openweather: "OpenWeather" },
  },
  spend: {
    label: "SPEND",
    colorVar: "signal-spend",
    sourceLabel: { plaid: "Plaid" },
  },
  health: {
    label: "HEALTH",
    colorVar: "signal-health",
    sourceLabel: { healthkit: "HealthKit", google_fit: "Google Fit" } as never,
  },
  email: {
    label: "EMAIL",
    colorVar: "signal-email",
    sourceLabel: { gmail: "Gmail" },
  },
};

export const INTEGRATIONS = [
  { key: "bank", label: "Bank", source: "Plaid", colorVar: "signal-route" },
  { key: "calendar", label: "Calendar", source: "Google Calendar", colorVar: "signal-schedule" },
  { key: "maps", label: "Maps", source: "Google Maps", colorVar: "signal-schedule" },
  { key: "weather", label: "Weather", source: "OpenWeather", colorVar: "signal-weather" },
  { key: "health", label: "Health", source: "HealthKit", colorVar: "signal-health" },
  { key: "email", label: "Email", source: "Gmail", colorVar: "signal-email" },
] as const;

export const PERSONAS: Persona[] = [
  {
    key: "maya",
    name: "Maya Chen",
    occupation: "Product designer",
    age_bracket: "28",
    avatar: "🧋",
    subtitle: "Coffee habit · gym at 6pm · cycles to work",
    area: "Cambridge, MA",
    city: "Cambridge",
    weather: { label: "Light rain in 20m", temp: 14, emoji: "🌦️" },
    next_waypoint: { name: "Cafe Rossa", eta: 14 },
    schedule: [
      { time: "10:30", event: "Design review", location: "Kendall Sq" },
      { time: "12:30", event: "Lunch w/ Priya", location: "Area Four" },
      { time: "18:00", event: "Strength class", location: "GymFuel" },
    ],
    spend: {
      categories: ["Coffee shops", "Bike repair", "Korean food"],
      merchants: ["Cafe Rossa ×4", "Tatte ×2", "Trader Joe's"],
    },
    email_bookings: [{ merchant: "Area Four", time: "12:30 today" }],
    health: { gym_today: true, activity: "active" },
    offers: [
      {
        merchant_id: "cafe-rossa",
        merchant_name: "Cafe Rossa",
        merchant_emoji: "☕",
        category: "Coffee · 14 min ahead on route",
        offer: "Free oat-milk upgrade on your usual flat white",
        value: "Save $0.80",
        reason: "You've bought coffee here 4 times this week — via your bank.",
        signal_used: "habit",
        data_source: "plaid",
        distance_m: 320,
        eta_min: 14,
      },
      {
        merchant_id: "gymfuel",
        merchant_name: "GymFuel",
        merchant_emoji: "🥤",
        category: "Smoothie bar · next to your 6pm class",
        offer: "20% off post-workout protein shake",
        value: "Save $2.40",
        reason: "Your Google Calendar shows a strength class at 6pm.",
        signal_used: "schedule",
        data_source: "google_calendar",
        distance_m: 40,
        eta_min: 0,
      },
      {
        merchant_id: "umbrella-co",
        merchant_name: "The Umbrella Co.",
        merchant_emoji: "☂️",
        category: "Accessories · 2 min off route",
        offer: "$5 off compact umbrella, today only",
        value: "Save $5.00",
        reason: "Light rain forecast in 20 minutes along your commute.",
        signal_used: "weather",
        data_source: "openweather",
        distance_m: 180,
        eta_min: 8,
      },
    ],
  },
  {
    key: "carlos",
    name: "Carlos Rivera",
    occupation: "Sales lead",
    age_bracket: "34",
    avatar: "🚗",
    subtitle: "Drives to client meetings · weekly steakhouse · runs Sundays",
    area: "Back Bay, Boston",
    city: "Boston",
    weather: { label: "Sunny", temp: 19, emoji: "☀️" },
    next_waypoint: { name: "Bluestone Lane", eta: 9 },
    schedule: [
      { time: "11:00", event: "Pitch — Acme Corp", location: "Seaport" },
      { time: "13:30", event: "Lunch w/ client", location: "Mooo...." },
      { time: "19:00", event: "5K loop", location: "Charles River" },
    ],
    spend: {
      categories: ["Steakhouses", "Gas", "Hotels"],
      merchants: ["Mooo... ×3", "Shell", "Marriott"],
    },
    email_bookings: [{ merchant: "Mooo....", time: "13:30 today" }],
    health: { gym_today: false, activity: "rest" },
    offers: [
      {
        merchant_id: "bluestone",
        merchant_name: "Bluestone Lane",
        merchant_emoji: "☕",
        category: "Coffee · on the way to Seaport",
        offer: "Buy one flat white, get a second free",
        value: "BOGO",
        reason: "9 min ahead on your live drive to the Acme pitch.",
        signal_used: "route",
        data_source: "google_maps",
        distance_m: 220,
        eta_min: 9,
      },
      {
        merchant_id: "mooo",
        merchant_name: "Mooo....",
        merchant_emoji: "🥩",
        category: "Steakhouse · client lunch",
        offer: "Complimentary truffle butter with your ribeye",
        value: "Add $0",
        reason: "Gmail confirms a 13:30 reservation here today.",
        signal_used: "email",
        data_source: "gmail",
        distance_m: 0,
        eta_min: 25,
      },
      {
        merchant_id: "shell",
        merchant_name: "Shell — Boylston",
        merchant_emoji: "⛽",
        category: "Gas · 1 min detour",
        offer: "5¢/gal off, plus free wash",
        value: "Save $1.20",
        reason: "Top recurring spend this month — fuel for client trips (Plaid).",
        signal_used: "spend",
        data_source: "plaid",
        distance_m: 90,
        eta_min: 3,
      },
    ],
  },
  {
    key: "priya",
    name: "Priya Shah",
    occupation: "Med student",
    age_bracket: "26",
    avatar: "📚",
    subtitle: "Late library nights · yoga 3×/wk · vegetarian",
    area: "Longwood, Boston",
    city: "Boston",
    weather: { label: "Cloudy, mild", temp: 17, emoji: "☁️" },
    next_waypoint: { name: "Tatte Bakery", eta: 6 },
    schedule: [
      { time: "09:00", event: "Cardio rounds", location: "BWH" },
      { time: "17:30", event: "Yoga — Flow 60", location: "CorePower" },
      { time: "20:00", event: "Study block", location: "Countway Library" },
    ],
    spend: {
      categories: ["Bakeries", "Yoga", "Bookstores"],
      merchants: ["Tatte ×5", "CorePower", "Trident Books"],
    },
    email_bookings: [{ merchant: "CorePower", time: "17:30 today" }],
    health: { gym_today: true, activity: "active" },
    offers: [
      {
        merchant_id: "tatte",
        merchant_name: "Tatte Bakery",
        merchant_emoji: "🥐",
        category: "Bakery · 6 min walk",
        offer: "Free almond croissant with any latte",
        value: "Save $4.50",
        reason: "You bought here 5 times in 2 weeks (Plaid).",
        signal_used: "habit",
        data_source: "plaid",
        distance_m: 280,
        eta_min: 6,
      },
      {
        merchant_id: "juicepress",
        merchant_name: "Juice Press",
        merchant_emoji: "🥬",
        category: "Cold-pressed · post-yoga stop",
        offer: "$3 off any green juice 16oz+",
        value: "Save $3.00",
        reason: "HealthKit shows you usually refuel within 30 min after yoga.",
        signal_used: "health",
        data_source: "healthkit",
        distance_m: 60,
        eta_min: 0,
      },
      {
        merchant_id: "trident",
        merchant_name: "Trident Booksellers",
        merchant_emoji: "📖",
        category: "Books · before your study block",
        offer: "15% off USMLE titles tonight",
        value: "Save ~$12",
        reason: "Calendar has a 20:00 study block at Countway nearby.",
        signal_used: "schedule",
        data_source: "google_calendar",
        distance_m: 410,
        eta_min: 11,
      },
    ],
  },
];