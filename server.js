const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Главная форма
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// Генерация визитки
app.post('/generate', (req, res) => {
  const data = req.body;

  // Генерация HTML через шаблон EJS
  ejs.renderFile(path.join(__dirname, 'template.html'), { profile: data }, (err, html) => {
    if (err) return res.send('Ошибка генерации визитки');

    // Создаём уникальную папку по имени пользователя
    const folderName = `${data.firstName.toLowerCase()}-${data.lastName.toLowerCase()}`;
    const folderPath = path.join(__dirname, 'public', 'sites', folderName);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    // Сохраняем HTML
    fs.writeFileSync(path.join(folderPath, 'index.html'), html);

    // Генерация VCF
    const vcfContent = `BEGIN:VCARD
VERSION:3.0
N:${data.lastName};${data.firstName};;;
FN:${data.firstName} ${data.lastName}
ORG:${data.position}
TEL:${data.phone}
EMAIL:${data.email}
URL:${data.url}
END:VCARD`;
    fs.writeFileSync(path.join(folderPath, `${folderName}.vcf`), vcfContent);

    // Отправляем ссылку пользователю
    res.send(`Ваша визитка готова: <a href="/sites/${folderName}/index.html">Открыть</a>`);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
