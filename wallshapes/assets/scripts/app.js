/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ (() => {

eval("// function debbugLog (text) {\n//   return console.log(text);\n// }\n\nfunction createColor () {\n  return '#000000'.replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });\n}\n\nfunction applyGradient () {\n  const randomColor1 = createColor();\n  const randomColor2 = createColor();\n  document.querySelector('#background').style.backgroundImage = '-webkit-linear-gradient(' + randomColor1 + ' , ' + randomColor2 + ')';\n}\n\nfunction writeAnimation () {\n  const words = ['simple', 'kind', 'curious', 'free', 'YOU'];\n  const span = document.querySelector('#writeText');\n  let count = 0;\n  let nextWord = 1;\n  let word = words[0];\n\n  setInterval(function () {\n    if (word.length <= count) {\n      span.textContent = '';\n      count = 0;\n      word = words[nextWord];\n      nextWord++;\n\n      if (words.length <= nextWord) {\n        nextWord = 0;\n      }\n    }\n    span.textContent += word[count];\n    count++;\n  }, 300);\n}\n\nsetInterval(() => applyGradient(), 1000);\nwriteAnimation();\n\n\n//# sourceURL=webpack://wallshapes/./src/app.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/app.js"]();
/******/ 	
/******/ })()
;