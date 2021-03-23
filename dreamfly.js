var optId = chrome.contextMenus.create({
		"title" : chrome.i18n.getMessage("title"),
		"contexts" : ["image"],
		"onclick" : search
	});

function search(info, tab) {
	var url = info.srcUrl;
	if(url.indexOf("alicdn.com")!=-1){
	   	url = url.replace(/.(\d+x\d+).*|.jpg_(\d+x\d+).*/,'.jpg')
	}
	var fName = url.substring(url.lastIndexOf('/') + 1);
	if(!url.startsWith("file")){
	var getxhr = new XMLHttpRequest();
	getxhr.open('GET', url, true);
	getxhr.responseType = 'arraybuffer';
	getxhr.onreadystatechange = function (e) {
		if (getxhr.readyState === 4 && getxhr.status === 200) {
			contentType = getxhr.getResponseHeader('Content-Type');
			var blob = new Blob([new Uint8Array(getxhr.response)], {
					type : contentType
				});
			var url = URL.createObjectURL(blob);
			var img = new Image();
			img.onload = function () {
				var canvas = document.createElement("canvas");
				canvas.width = this.width;
				canvas.height = this.height;
				var ctx = canvas.getContext("2d");
				ctx.drawImage(this, 0, 0);
				var imagedata = canvas.toDataURL("image/jpeg");
				uploadImage(imagedata, tab, fName)
			}
			img.src = url;
		} else if (getxhr.readyState === 4 && getxhr.status !== 200) {
			console.log("查询失败 " + xhr.status);
		}
	};
	getxhr.send();

}else{
			chrome.tabs.query({
			  active: true,
			  currentWindow: true
			}, (tabs) => {
			  let message = {
			    info: info.srcUrl
			  }
			  chrome.tabs.sendMessage(tabs[0].id, message, res => {
			    console.log('bg=>content')
				uploadImage(res, tab, fName);
			  })
			})
}
}

function uploadImage(img, tab, fName) {
	var data = "image_url=&type=https://aip.baidubce.com/rest/2.0/ocr/v1/qrcode&image="+encodeURIComponent(img);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://ai.baidu.com/aidemo', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader('X-Requested-with', 'XMLHttpRequest');
	xhr.setRequestHeader('Cache-Control', 'no-cache');
	xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*;q=0.01');
	xhr.onload = function (e) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var d = JSON.parse(xhr.response);
			var result = d.data.codes_result[0];
			if(result!=undefined){
				var url = d.data.codes_result[0].text[0];
				chrome.tabs.create({
					url : url
				});
			}else{
				alert("非二维码或图片宽高小于50px");
			}
		} else if (xhr.readyState === 4 && xhr.status !== 200) {
			console.log("查询失败 " + xhr.status);
		}
	};
	xhr.send(data);
}

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    details.requestHeaders.push({
        name:"Referer",
        value:"https://ai.baidu.com"
    });
    details.requestHeaders.push({
        name:"Origin",
        value:"https://ai.baidu.com"
    });
    return {
        requestHeaders: details.requestHeaders
    };
},
    {
        urls: ["https://ai.baidu.com/*"]
    },
    ["blocking", "requestHeaders", "extraHeaders"]
);