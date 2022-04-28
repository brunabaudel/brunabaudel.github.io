function createColor() {
    return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}

function applyGradient() {
    const randomColor1 = createColor();
    const randomColor2 = createColor();
    document.getElementById("background").style.backgroundImage = "-webkit-linear-gradient("+ randomColor1 +" , "+ randomColor2 +")";
}