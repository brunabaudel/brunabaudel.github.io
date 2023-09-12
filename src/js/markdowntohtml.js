function htmlBody(body, test) {
    if (test) {
        return body;
    }

    return `<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Bruna Baudel - Personal Website</title>
    <link rel="canonical" href="https://brunabaudel.com/articles" />
    <meta name="description" content="Personal Website" />
    <meta name="author" content="Bruna Baudel" />

    <meta property="og:title" content="Personal Website" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.brunabaudel.com/articles" />
    <meta property="og:description" content="Personal Website" />
    <meta property="og:image" content="../../src/resources/logo.png" />

    <link rel="icon" href="../../src/resources/logo.ico" />
    <link rel="apple-touch-icon" href="../../src/resources/logo.png" />
    <link rel="stylesheet" href="../../src/css/styles.css" />
    <link href="../../src/css/prism.css" rel="stylesheet" />
  </head>

  <body>
    <header class="site-header">
      <div class="content-container">
        <a href="#">
          <img src="../../src/resources/logo.png" class="icon-logo">
        </a>
        <nav class="site-nav">
          <ul role="list" id="site-nav-list" class="site-nav__list">
            <li>
              <a href="../..">Home</a>
            </li>

            <li>
              <a class="active" href="../">Articles</a>
            </li>

            <li>
              <a href="../../projects">Projects</a>
            </li>

            <li>
              <a href="../../about">About me</a>
            </li>

            <li>
              <a href="../../more">More...</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="main-article">
        <div class="content-container">
          <div class="article">
            <div class="article-body">
              ${body}
            </div>
          </div>
        </div>
    </main>

    <div class="page__bottom">
      <footer class="site-footer slice">
        <div class="content-container">
          <div class="copyright">
            <p>© Bruna Baudel 2023.<br /></p>
            <p>
              <strong>All rights reserved.</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>

  <script src="../../src/js/prism.js"></script>
  <script src="../../src/js/markdowntohtml.js"></script>
  
  </body>
</html>`;
}

function convertMarkdownToHTML(markdown, test) {
  let lineNumber = 0;
  let html = '';
  const numberRegex = /^[0-9]/;
  const lines = markdown.split(/\r?\n/).filter(line => line.trim() !== '');
  
  while (lineNumber <= lines.length) {
    const line = lines[lineNumber];

    if (line === undefined) {
      html += `</div>\n`;
      return htmlBody(html, test);
    }

    if (line.length > 0 && line.startsWith('---')) {
      let isHeader = true;
      html += `<div class="article-header">\n`;
      lineNumber++;

      while (isHeader) {
        const internalLine = lines[lineNumber];

        if (internalLine.length > 0 && internalLine.startsWith('#')) {
          const titleText = internalLine.split(' ')
          html += `<span class="article-title0">${titleText.slice(1).join(' ')}</span>\n`;
          lineNumber++;
        } else

        if (internalLine.length > 0 && internalLine.startsWith('sub:')) {
          const titleText = internalLine.split(' ')
          html += `<span class="article-subtitle">${titleText.slice(1).join(' ')}</span>\n`;
          lineNumber++;
        } else
        
        if (internalLine.length > 0 && internalLine.startsWith('date:')) {
          const dateText = internalLine.split(':')
          const date = dateText[1]
          html += `<span class="article-date">Published on <time>${date}</time></span>\n`;
          lineNumber++;
        } else

        if (internalLine.length > 0 && internalLine.startsWith('---')) {
          html += `</div>\n<div>\n`;
          isHeader = false;
        }
      }
    } else

    if (line.length > 0 && line.startsWith('#')) {
      let titleText = line;
      titleText = lineWithCode(titleText);
      titleText = lineWithBold(titleText).split(' ');
      const titleLevel = titleText[0].length - 1;
      
      html += `<span class="article-title${titleLevel}">${titleText.slice(1).join(' ')}</span>\n`;
    } else

    if (line.startsWith('-') && line.length > 0) {
      let isList = true;
      html += `<ul>\n`;

      while (isList) {
        let internalLine = lineWithCode(lines[lineNumber]);
        internalLine = lineWithBold(internalLine);
        
        if (internalLine.length > 0 && internalLine.startsWith('-')) {
          html += `<li>${internalLine.slice(1)}</li>\n`;
          lineNumber++;
        } else {
          html += `</ul>\n`;
          isList = false;
          lineNumber--;
        }
      }
    } else
  
    if (line.length > 0 && numberRegex.test(line.slice(0,1))) {
      let isList = true;
      html += `<ol>\n`;

      while (isList) {
        let internalLine = lineWithCode(lines[lineNumber]);
        internalLine = lineWithBold(internalLine);

        if (internalLine.length > 0 && numberRegex.test(internalLine.slice(0,1))) {
          const startTitle = internalLine.indexOf(". ")+1;
          html += `<li>${internalLine.slice(startTitle)}</li>\n`;
          lineNumber++;
        } 
        else {
          html += `</ol>\n`;
          isList = false;
          lineNumber--;
        }
      }
    } else

    if (line.length > 0 && line.startsWith('```swift')) {
      let isCode = true;
      html += `<pre><code class="language-swift">`;
      lineNumber++;

      while (isCode) {
        const internalLine = lines[lineNumber];
        
        if (!internalLine.startsWith('```')) {
          html += `${internalLine}\n`;
          lineNumber++;
        } else {
          html += `</code></pre>\n`;
          isCode = false;
        }
      }

    } else
    
    if (line.length > 0) {
      let text = lineWithCode(line)
      text = lineWithBold(text)
      html += `<p>${text}</p>\n`;
    }

    lineNumber++;
  }
  html += `</div>\n`;
  return htmlBody(html, test);
}

const indexOfAll = (arr, val) => arr.reduce((acc, el, i) => (el.includes(val) ? [...acc, i] : acc), []);

function lineWithBold(line) {
  const text = line !== undefined ? line.split(" ") : "";
  let finalText = "";
  let wordNumber = 0;
  let isBold = false;

  while (wordNumber < text.length) {

    if (text[wordNumber].includes("**") && !isBold) {
      let word = text[wordNumber].replace('**', '<b>');

      if (word.includes("**") && word.indexOf("**") > 0) {
        word = word.replace('**', '</b> ').replace(' :', ': ');
        finalText += word;
      } else {
        finalText += `${word} `;
        isBold = true;
      }

    } else if (text[wordNumber].includes("**") && isBold) {
      let word = text[wordNumber].replace('**', '</b> ').replace(' :', ': ');
      finalText += `${word} `;
      isBold = false;
    } else {
      finalText += `${text[wordNumber]} `;
    }
    
    wordNumber++;
  }

  return finalText;
}

function lineWithCode(line) {
  const text = line !== undefined ? line.split(" ") : "";
  let finalText = "";
  let wordNumber = 0;
  let isCode = false;

  while (wordNumber < text.length) {

    if (text[wordNumber].includes('`') && !isCode) {
      let word = text[wordNumber].replace('`', '<code class="language-swift">');

      if (word.includes('`') && word.indexOf('`') > 0) {
        word = word.replace('`', '</code> ');
        finalText += word;
      } else {
        finalText += `${word} `;
        isCode = true;
      }
    } else if (text[wordNumber].includes("`") && isCode) {
      let word = text[wordNumber].replace('`', '</code> ');
      finalText += word;
      isCode = false;
    } else {
      finalText += `${text[wordNumber]} `;
    }
  
    wordNumber++;
  }

  return finalText;
}

document.getElementById('previewFileButton').addEventListener('click', function() {
    const markdownInput = document.getElementById('markdownInput').value;
    const htmlOutput = document.getElementById('htmlOutput');

    const content = convertMarkdownToHTML(markdownInput, true);
    htmlOutput.innerHTML = content;
});

document.getElementById('createFileButton').addEventListener('click', function() {
    const markdownInput = document.getElementById('markdownInput').value;
    const nameFileInput = document.getElementById('nameFileInput').value;

    const content = convertMarkdownToHTML(markdownInput, false);
    const blob = new Blob([content], { type: 'text/plain' });
    const blobMD = new Blob([markdownInput], { type: 'text/plain' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${nameFileInput}.html`;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    const md = document.createElement('a');
    md.href = URL.createObjectURL(blobMD);
    md.download = `${nameFileInput}.md`;
    md.style.display = 'none';

    document.body.appendChild(md);
    md.click();

    document.body.removeChild(md);
    URL.revokeObjectURL(md.href);
});