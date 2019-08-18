/*
.##.....##....###....####.##....##
.###...###...##.##....##..###...##
.####.####..##...##...##..####..##
.##.###.##.##.....##..##..##.##.##
.##.....##.#########..##..##..####
.##.....##.##.....##..##..##...###
.##.....##.##.....##.####.##....##
*/

const { ipcRenderer } = require('electron');
const sslCertificate = require('get-ssl-certificate');

/*
.##.....##..#######..########..##.....##.##.......########..######.
.###...###.##.....##.##.....##.##.....##.##.......##.......##....##
.####.####.##.....##.##.....##.##.....##.##.......##.......##......
.##.###.##.##.....##.##.....##.##.....##.##.......######....######.
.##.....##.##.....##.##.....##.##.....##.##.......##.............##
.##.....##.##.....##.##.....##.##.....##.##.......##.......##....##
.##.....##..#######..########...#######..########.########..######.
*/

const loadTheme = require("../modules/loadTheme.js");
const applyTheme = require("../modules/applyTheme.js");
const applyWinControls = require("../modules/applyWinControls.js");
const loadWinControls = require("../modules/loadWinControls.js");

/*
.########.##.....##.##....##..######..########.####..#######..##....##..######.
.##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
.##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
.######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
.##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
.##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
.##........#######..##....##..######.....##....####..#######..##....##..######.
*/

function updateTheme() {
  loadTheme().then(function(theme) {
    applyTheme(theme);
  });
}

// window
function closeWindow() {
  ipcRenderer.send('request-close-pageinfo');
}

/*
.####.########...######.....########..########.##....##.########..########.########..########.########.
..##..##.....##.##....##....##.....##.##.......###...##.##.....##.##.......##.....##.##.......##.....##
..##..##.....##.##..........##.....##.##.......####..##.##.....##.##.......##.....##.##.......##.....##
..##..########..##..........########..######...##.##.##.##.....##.######...########..######...########.
..##..##........##..........##...##...##.......##..####.##.....##.##.......##...##...##.......##...##..
..##..##........##....##....##....##..##.......##...###.##.....##.##.......##....##..##.......##....##.
.####.##.........######.....##.....##.########.##....##.########..########.##.....##.########.##.....##
*/

// window
ipcRenderer.on('action-blur-window', (event, arg) => {
  document.getElementById('titlebar').classList.add('blur');
});
ipcRenderer.on('action-focus-window', (event, arg) => {
  document.getElementById('titlebar').classList.remove('blur');
});

ipcRenderer.on('action-load-certificate', (event, arg) => {
  var hostname = arg.split('/')[2];
  sslCertificate.get(hostname).then(function (certificate) {
    console.log(certificate);

    document.getElementById('subject-cn').innerHTML = certificate.subject.CN;
    document.getElementById('subject-o').innerHTML = certificate.subject.O;
    document.getElementById('subject-c').innerHTML = certificate.subject.C;
    document.getElementById('subject-l').innerHTML = certificate.subject.L;
    document.getElementById('subject-st').innerHTML = certificate.subject.ST;

    document.getElementById('issuer-cn').innerHTML = certificate.issuer.CN;
    document.getElementById('issuer-o').innerHTML = certificate.issuer.O;
    document.getElementById('issuer-c').innerHTML = certificate.issuer.C;

    document.getElementById('valid-from').innerHTML = certificate.valid_from;
    document.getElementById('valid-to').innerHTML = certificate.valid_to;

    document.getElementById('serial-number').innerHTML = certificate.serialNumber;
    document.getElementById('fingerprint').innerHTML = certificate.fingerprint;
    document.getElementById('fingerprint256').innerHTML = certificate.fingerprint256;
    document.getElementById('alt-name').innerHTML = certificate.subjectaltname;
    document.getElementById('bits').innerHTML = certificate.bits;
    document.getElementById('exponent').innerHTML = certificate.exponent;
    document.getElementById('pem-encoded').innerHTML = certificate.pemEncoded;
    document.getElementById('modulus').innerHTML = certificate.modulus;
    
  });
});

/*
.####.##....##.####.########
..##..###...##..##.....##...
..##..####..##..##.....##...
..##..##.##.##..##.....##...
..##..##..####..##.....##...
..##..##...###..##.....##...
.####.##....##.####....##...
*/

function init() {
  var winControls = loadWinControls();
  if(winControls.frame) {
    document.body.classList.add('no-titlebar');
    document.getElementById('titlebar').parentNode.removeChild(document.getElementById('titlebar'));
  } else {
    applyWinControls('only-close');
  }

  updateTheme();
}

document.onreadystatechange = () => {
  if (document.readyState == "complete") {
      init();
  }
}

/*
.########.##.....##.########....########.##....##.########.
....##....##.....##.##..........##.......###...##.##.....##
....##....##.....##.##..........##.......####..##.##.....##
....##....#########.######......######...##.##.##.##.....##
....##....##.....##.##..........##.......##..####.##.....##
....##....##.....##.##..........##.......##...###.##.....##
....##....##.....##.########....########.##....##.########.
*/