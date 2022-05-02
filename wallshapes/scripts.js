const log = (text) => console.log(text);

function createColor() {
    return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}

function applyGradient() {
    const randomColor1 = createColor();
    const randomColor2 = createColor();
    document.querySelector("#background").style.backgroundImage = "-webkit-linear-gradient("+ randomColor1 +" , "+ randomColor2 +")";
}

function writeAnimation() {
    const words = ["simple", "kind", "curious", "free", "YOU"];
    const span = document.querySelector("#writeText");
    let count = 0;
    let nextWord = 1;
    let word = words[0];
    
    setInterval(function() {
        if (word.length <= count) {
            span.textContent = "";
            count = 0;
            word = words[nextWord];
            nextWord++;
            
            if (words.length <= nextWord) {
                nextWord = 0;
            }
        }
        span.textContent += word[count];
        count++;
    }, 300);
}

setInterval(() => applyGradient(), 1000);
writeAnimation();