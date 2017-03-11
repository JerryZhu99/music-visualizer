
function resize(){
    $("canvas").outerHeight($(window).height()-$("canvas").offset().top- Math.abs($("canvas").outerHeight(true) - $("canvas").outerHeight()));
}
$(document).ready(function(){
    resize();
    $(window).on("resize", function(){
        resize();
    });
});

var scene, camera, renderer;
var target;
var geometry, material, mesh;
var bars = [];
var barCount = 100;
var barheight = 10;
var size = 10;

var analyser;
var dataArray;
init();

function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 75, 16.0/9.0, 1, 10000 );
    camera.position.set(0,10,20);
    camera.up = new THREE.Vector3(0,0,-1);
    camera.lookAt(new THREE.Vector3(0,5,0));
    target = new THREE.Object3D(0,0,0);
    target.add(camera);
    scene.add(target);

    for(var i=0;i<barCount;i++){
        var ang = i*Math.PI*2.0/barCount;
        geometry = new THREE.BoxGeometry( size*Math.PI*2.0/barCount*0.75, barheight, 0 );
    	material = new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.75} );
    	mesh = new THREE.Mesh( geometry, material );
        mesh.rotation.y = ang;
        mesh.position.x = size*Math.sin(ang);
        mesh.position.z = size*Math.cos(ang);

        bars.push(mesh);
        scene.add( mesh );
    }


	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( 1920, 1080 );

	document.body.appendChild( renderer.domElement );

}

function animate() {
    if(!dataArray)return;
    analyser.getByteFrequencyData(dataArray);

	requestAnimationFrame( animate );
    target.rotation.y+=0.001;
    for(var i=0;i<barCount;i++){
        data = interpolate(220.0*Math.pow(2,i/12.0))/256.0;
        bars[i].position.y = (data*barheight)/2;
        bars[i].scale.y = data+0.001;
        bars[i].material.color.setRGB(0,0,data*0.9+0.1);
    }

	renderer.render( scene, camera );

}

function interpolate(freq){
    var x = freq;
    var x1 = Math.floor(freq/100)*100 - 100;
    var x2 = Math.floor(freq/100)*100;
    var x3 = Math.floor(freq/100)*100 + 100;
    var x4 = Math.floor(freq/100)*100 + 200;
    var y1 = dataArray[x1/100];
    var y2 = dataArray[x2/100];
    var y3 = dataArray[x3/100];
    var y4 = dataArray[x4/100];
    var s1 = y1*(x-x2)/(x1-x2)*(x-x3)/(x1-x3)*(x-x4)/(x1-x4);
    var s2 = y2*(x-x1)/(x2-x1)*(x-x3)/(x2-x3)*(x-x4)/(x2-x4);
    var s3 = y3*(x-x1)/(x3-x1)*(x-x2)/(x3-x2)*(x-x4)/(x3-x4);
    var s4 = y4*(x-x1)/(x4-x1)*(x-x2)/(x4-x2)*(x-x3)/(x4-x3);
    return s1+s2+s3+s4;
}


var recording = false;
var local_stream = null;
function toggle(){
    if(!recording){
        recording = true;
        console.log("started");
        chrome.desktopCapture.chooseDesktopMedia(["screen","audio"], onApproved);
    }else{
        recording = false;
        if(local_stream)
            local_stream.stop();
        local_stream=null;
    }
}

function onApproved(streamId){
    navigator.webkitGetUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId,
            }
        },
        video:  {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId,
                minWidth: 1,
                maxWidth: 1,
                minHeight: 1,
                maxHeight: 1
            }
        }
    }, getStream, getError);

    function getStream(stream) {
        local_stream = stream;
        //    var a = document.querySelector('video')
        //    a.src = URL.createObjectURL(stream);
        //    a.play();
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        console.log(audioCtx.sampleRate);
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        animate();

    }
    function getError(error){
        console.log(error)
    }

}
document.querySelector('button').addEventListener("click",function(e){toggle()});
document.querySelector('canvas').addEventListener('click', function() {
    chrome.app.window.current().fullscreen();
});
toggle();
