const UNITS = [
  "",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
  "dix-sept",
  "dix-huit",
  "dix-neuf",
];

const TENS = [
  "",
  "",
  "vingt",
  "trente",
  "quarante",
  "cinquante",
  "soixante",
  "soixante",
  "quatre-vingt",
  "quatre-vingt",
];

function twoDigits(n: number): string {
  if (n < 20) return UNITS[n];
  const ten = Math.floor(n / 10);
  const unit = n % 10;

  if (ten === 7 || ten === 9) {
    return TENS[ten] + (unit === 0 ? "-dix" : "-" + UNITS[10 + unit]);
  }

  let word = TENS[ten];
  if (unit === 1 && ten !== 8) word += "-et-un";
  else if (unit > 0) word += "-" + UNITS[unit];
  else if (ten === 8) word += "s";
  return word;
}

function threeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  let word = "";
  if (hundred > 0) {
    word += (hundred === 1 ? "cent" : UNITS[hundred] + " cent") + (hundred > 1 && rest === 0 ? "s" : "");
  }
  if (rest > 0) word += (word ? " " : "") + twoDigits(rest);
  return word;
}

// Convertit un entier positif en toutes lettres françaises (ex: 211000 -> "Deux Cent Onze Mille").
export function numberToFrenchWords(n: number): string {
  if (n === 0) return "Zéro";

  const groups: Array<[number, string]> = [
    [1_000_000_000, "milliard"],
    [1_000_000, "million"],
    [1_000, "mille"],
  ];

  let remainder = Math.round(n);
  const parts: string[] = [];

  for (const [value, label] of groups) {
    const count = Math.floor(remainder / value);
    if (count > 0) {
      const countWords = count === 1 && label === "mille" ? "" : threeDigits(count) + " ";
      const plural = label !== "mille" && count > 1 ? label + "s" : label;
      parts.push((countWords + plural).trim());
      remainder %= value;
    }
  }

  if (remainder > 0) parts.push(threeDigits(remainder));

  const words = parts.join(" ").replace(/\s+/g, " ").trim();
  return words
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
