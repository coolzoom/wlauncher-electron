var electron = require('electron');
var appVersion = electron.remote.app.getVersion();
var newVersion = '';
var newVersionUrl = '';
var path = require('path');
var fs = require('fs');	
var userDataPath = (electron.app || electron.remote.app).getPath('userData');
var configFile = path.resolve(userDataPath, './config.json');
var config = {};
var serverobj = {};
var execFile = require('child_process').spawn;
var remote = require('electron').remote;
var currServId = '';
var tempIcon = '';
var tempDir = '';
var tempVer = '';
var currServ = '';

$( document ).ready(function() { checkConfig(); checkVersion(); });

function checkVersion(){
	document.getElementById('version').innerHTML = appVersion;
	$.getJSON("https://api.github.com/repos/kisha02/wlauncher/tags").done(function (json) {
		newVersion = json[0].name;	
		if(newVersion > appVersion){
			newVersionUrl = 'https://github.com/kisha02/wlauncher/releases/download/' + newVersion + '/wowlauncher-' + newVersion + '-setup.exe';
			jQuery("#updateModal").modal();
		}
	}); 
}

function downloadNewVersion(){
	jQuery( "#dl_btn" ).hide();
	jQuery( "#dl_progress" ).show();
	const { DownloaderHelper } = require('node-downloader-helper');
	const dl = new DownloaderHelper(newVersionUrl, userDataPath);	
	dl.on('progress', (stats) => {		
		document.getElementById('dl_progress').innerHTML = 'Downloading... ' + Math.floor(stats.progress) + '%';
	});
	dl.on('end', (downloadInfo) => {
		execFile(downloadInfo.filePath, [], {'detached':true});
		setTimeout(function(){ window.close(); }, 100);
	});	
	dl.start();
}

function checkConfig(){	
	try {return JSON.parse(fs.readFileSync(path.resolve(userDataPath, './config.json')))} catch(error) {
		jQuery("#firstTimeModal").modal();
		config = {"servers":{"1":{"name":"","url":"","icon":"","clientDir":"","clientVer":"","closeClient":false},"2":{"name":"","url":"","icon":"","clientDir":"","clientVer":"","closeClient":false},"3":{"name":"","url":"","icon":"","clientDir":"","clientVer":"","closeClient":false},"4":{"name":"","url":"","icon":"","clientDir":"","clientVer":"","closeClient":false},"5":{"name":"","url":"","icon":"","clientDir":"","clientVer":"","closeClient":false},"6":{"name":"","url":"","icon":"","clientDir":"","clientVer":"","closeClient":false},"7":{"name":"","url":"","icon":"","clientDir":"","clientVer":"","closeClient":false},"8":{"name":"","url":"","icon":"","clientDir":"","clientVer":"","closeClient":false}}};
		updateConfig();
	}finally {
		config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
		serverobj = config.servers;
		renderBtns();
	}
}

function renderBtns(){
	var loopcount = 1;
	var btnHtml = '';
	for (const server in serverobj) {
		if(serverobj[server].name !== ""){
			btnHtml += "<div class='mainbtnContainer'><div onclick='openWow(\"" + server + "\");' class='mainbtn'><div style='height: 100px'><center><img src='" + serverobj[server].icon + "' class='server_icon' /></center></div><div class='server_name'><center>" + serverobj[server].name + "</center></div></div><div class='btnedit' onclick='edit_btn(" + loopcount + ");'><span class='glyphicon glyphicon-pencil'></span></div></div>";
		}
		else{
			btnHtml += "<div class='mainbtnContainer'><div onclick='edit_btn(" + loopcount + ");' class='mainbtn'><center><img src='img/add.png' class='add_icon' /></center></div></div>";
		}
		loopcount++;
	}
	document.getElementById('container').innerHTML = btnHtml;
}		
			
function openWow(server){
	if(serverobj[server].clientDir === ""){
		alert('No wow directory set. Please set your wow client for slot ' + server);
		edit_btn(server);
	}
	else{
		var wowClient = path.resolve(serverobj[server].clientDir, './Wow.exe');
		if(parseInt(serverobj[server].clientVer.charAt(0)) > 2){
			if (fs.existsSync(path.resolve(serverobj[server].clientDir, '.\\data\\enUS\\realmlist.wtf'))) {var wowRealmlist = path.resolve(serverobj[server].clientDir, '.\\data\\enUS\\realmlist.wtf')}
			if (fs.existsSync(path.resolve(serverobj[server].clientDir, '.\\data\\enGB\\realmlist.wtf'))) {var wowRealmlist = path.resolve(serverobj[server].clientDir, '.\\data\\enGB\\realmlist.wtf')}
			if (fs.existsSync(path.resolve(serverobj[server].clientDir, '.\\data\\deDE\\realmlist.wtf'))) {var wowRealmlist = path.resolve(serverobj[server].clientDir, '.\\data\\deDE\\realmlist.wtf')}
			if (fs.existsSync(path.resolve(serverobj[server].clientDir, '.\\data\\frFR\\realmlist.wtf'))) {var wowRealmlist = path.resolve(serverobj[server].clientDir, '.\\data\\frFR\\realmlist.wtf')}
			if (fs.existsSync(path.resolve(serverobj[server].clientDir, '.\\data\\ruRU\\realmlist.wtf'))) {var wowRealmlist = path.resolve(serverobj[server].clientDir, '.\\data\\ruRU\\realmlist.wtf')}
			if (fs.existsSync(path.resolve(serverobj[server].clientDir, '.\\data\\esES\\realmlist.wtf'))) {var wowRealmlist = path.resolve(serverobj[server].clientDir, '.\\data\\esES\\realmlist.wtf')}
		}
		else{			
			var wowRealmlist = path.resolve(serverobj[server].clientDir, './realmlist.wtf');
		}
		fs.writeFile(wowRealmlist, serverobj[server].url, 'utf-8', function (err) {if (err) throw err;});
		execFile(wowClient, [], {'detached':true});
		if(serverobj[server].closeClient){
			setTimeout(function(){ window.close(); }, 100);
		}
	}
}

function setWowDir(mode){
	if(mode === 1){
		document.getElementById('wowClientInput').value = '';
		document.getElementById('servClientDir').value = '';
		document.getElementById('wowClientInput').click();	
	}	
	if(mode === 2){
		if(document.getElementById("wowClientInput").files[0].name === 'Wow.exe'){
			document.getElementById('servClientDir').value = path.parse(document.getElementById("wowClientInput").files[0].path).dir + "\\wow.exe";
			tempDir = path.parse(document.getElementById("wowClientInput").files[0].path).dir;
			getWowVersion();
		}
		else{
			alert('Choose the Wow.exe file');
			setTimeout(function(){ setWowDir(1); }, 100);
		}	
	}	
}

async function getWowVersion() {
	const { getFileProperties } = require('get-file-properties');
	metadata = await getFileProperties(tempDir + '\\Wow.exe')
	tempVer = metadata.Version;
}

function updateConfig(){
	let newConfig = JSON.stringify(config);
	fs.writeFileSync(configFile, newConfig);
}

function edit_btn(id){
	jQuery("#editModal").modal();
	tempIcon = '';
	currServ = id;
	document.getElementById('editTitle').innerHTML = "Slot " + id;
	document.getElementById('servName').value = serverobj[id].name;
	document.getElementById('servUrl').value = serverobj[id].url;
	document.getElementById('close-launcher').checked = serverobj[id].closeClient;
	if(serverobj[id].clientDir !== ''){
		document.getElementById('servClientDir').value = serverobj[id].clientDir + "\\wow.exe";
	}
	else{
		document.getElementById('servClientDir').value = "";
	}
	if(serverobj[id].icon === ""){document.getElementById('servIcon').src = "img/icons/tbc1.png";}
	else{document.getElementById('servIcon').src = serverobj[id].icon;}
	currServId = id;
}

function savebtn(){
	serverobj[currServId].name = document.getElementById('servName').value;
	serverobj[currServId].url = document.getElementById('servUrl').value;
	serverobj[currServId].closeClient = document.getElementById('close-launcher').checked;
	if(tempIcon !== ''){
		serverobj[currServId].icon = tempIcon;
	}
	else{
		serverobj[currServId].icon = "img/icons/tbc1.png";
	}
	if(tempDir !== ''){
		serverobj[currServId].clientDir = tempDir;
		serverobj[currServId].clientVer = tempVer;
	}
	updateConfig();
	renderBtns(); 
	jQuery("#editModal").modal('toggle');
}

function getIcons(){
	fs.readdir(path.join(__dirname, 'img/icons/'), (err, files) => {
		var iconHtml = '';
		files.forEach(file => {
			iconHtml = iconHtml + "<img src='img/icons/" + file + "' onclick='setIcon(\"img/icons/" + file + "\");' class='server_icon icon_pick' />";
		});
		document.getElementById('pickIconContainer').innerHTML = iconHtml;
		jQuery("#iconModal").modal();
	});
}

function setIcon(path){
	document.getElementById('servIcon').src = path;
	tempIcon = path;
	jQuery("#iconModal").modal('toggle');
}













