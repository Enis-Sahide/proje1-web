const fs = require('fs');
const pdf = require('pdf-parse');

async function extract() {
  try {
    const karenPath = 'C:\\Users\\baha\\Desktop\\EnisDERS\\ws belge kitap\\Karen Curry - İnsan Tasarımını Anlamak.pdf';
    const chetanPath = 'C:\\Users\\baha\\Desktop\\EnisDERS\\ws belge kitap\\Human_Design_İnsan_Tasarımı_Özünüzdeki_İnsanı_Keşfedin_Chetan_Parkyn.pdf';

    console.log('Extracting Karen Curry...');
    let dataBuffer = fs.readFileSync(karenPath);
    let data = await pdf(dataBuffer);
    fs.writeFileSync('C:\\projeler\\proje1-web\\karen_curry.txt', data.text);
    console.log('Karen Curry extracted.');

    console.log('Extracting Chetan Parkyn...');
    dataBuffer = fs.readFileSync(chetanPath);
    data = await pdf(dataBuffer);
    fs.writeFileSync('C:\\projeler\\proje1-web\\chetan_parkyn.txt', data.text);
    console.log('Chetan Parkyn extracted.');

  } catch (err) {
    console.error(err);
  }
}

extract();
