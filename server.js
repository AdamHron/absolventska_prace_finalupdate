const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

const filePath = path.join(__dirname, "data", "lekce-data.json");

app.use(express.json());
app.use(express.static("public"));

// Pomocné funkce
function readWords() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function writeWords(words) {
  fs.writeFileSync(filePath, JSON.stringify(words, null, 2), "utf8");
}

// Přidání slovíčka
app.post("/pridat", (req, res) => {
  const nove = req.body;
  const words = readWords();

  const exists = words.some(
    w =>
      w.cz.toLowerCase() === nove.cz.toLowerCase() ||
      w.en.toLowerCase() === nove.en.toLowerCase()
  );

  if (exists) {
    return res.status(400).send("Slovo s tímto českým nebo anglickým výrazem již existuje.");
  }

  nove.timestamp = Date.now(); // přidá aktuální čas
  words.push(nove);
  writeWords(words);
  res.send("Slovo úspěšně přidáno.");
});

// Úprava slovíčka podle timestampu
app.put("/uprav/:timestamp", (req, res) => {
  const timestamp = parseInt(req.params.timestamp);
  const nove = req.body;
  const words = readWords();

  const index = words.findIndex(w => w.timestamp === timestamp);
  if (index === -1) {
    return res.status(400).send("Slovo nebylo nalezeno.");
  }

  const exists = words.some(
    (w, i) =>
      i !== index &&
      (w.cz.toLowerCase() === nove.cz.toLowerCase() ||
       w.en.toLowerCase() === nove.en.toLowerCase())
  );

  if (exists) {
    return res.status(400).send("Slovo s tímto českým nebo anglickým výrazem již existuje.");
  }

  words[index] = {
    ...nove,
    timestamp: Date.now() // přepíše timestamp na aktuální čas
  };

  writeWords(words);
  res.send("Slovo bylo upraveno.");
});

// Smazání slovíčka podle timestampu
app.delete('/smazat/:timestamp', (req, res) => {
  const timestamp = parseInt(req.params.timestamp);
  const words = readWords();

  const index = words.findIndex(w => w.timestamp === timestamp);
  if (index === -1) {
    return res.status(400).json({ zprava: "Slovíčko nebylo nalezeno." });
  }

  words.splice(index, 1);
  writeWords(words);
  res.json({ zprava: "Slovíčko bylo smazáno." });
});

// Získání všech slovíček
app.get("/slovicka", (req, res) => {
  res.json(readWords());
});

app.listen(PORT, () => {
  console.log(`✅ Server běží na http://localhost:${PORT}`);
});
