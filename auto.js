var basecode = getBase64Image(document.getElementsByTagName("img")[0]);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    var img = document.getElementsByTagName("img")[0];
  	sendResponse(basecode);
});
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/jpeg");
    return dataURL;
}