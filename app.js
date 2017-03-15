
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
var barCount = 76;
var barheight = 15;
var size = 18;

var analyser;
var sampleRate = 0;
var fftSize = 4096;
var dataArray;
init();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, 16.0/9.0, 1, 10000 );
    camera.position.set(0,10,20);
    camera.up = new THREE.Vector3(0,0,-1);
    camera.lookAt(new THREE.Vector3(0,10,0));
    target = new THREE.Object3D(0,0,0);
    target.add(camera);
    scene.add(target);
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.z=0.5;
    directionalLight.position.x=0.25;
    scene.add( directionalLight );
    for(var i=0;i<barCount;i++){
        var spacing = size*2.0/barCount*12/7;
        var s2 = spacing*0.95;
        var o2 = i/2.0+Math.floor(i/12);
        if(i%12>2){
            o2 += 0.5;
        }
        if(i%12>7){
            o2 += 0.5;
        }
        var o = o2;
        var s = s2;
        switch (i%12) {
            case 0:
            s = s * 0.5;
            o += 0.25;
            break;
            case 1:
            s = s * 0.5;
            o += 0.25;
            break;
            case 2:
            s = s * 0.75;
            o += 0.375;
            break;
            case 3:
            s = s * 0.75;
            o += 0.125;
            break;
            case 4:
            s = s * 0.5;
            o += 0.25;
            break;
            case 5:
            s = s * 0.5;
            o += 0.25;
            break;
            case 6:
            s = s * 0.5;
            o += 0.25;
            break;
            case 7:
            s = s * 0.75;
            o += 0.375;
            break;
            case 8:
            s = s * 0.75;
            o += 0.125;
            break;
            case 9:
            s = s * 0.5;
            o += 0.25;
            break;
            case 10:
            s = s * 0.5;
            o += 0.25;
            break;
            case 11:
            s = s * 0.5;
            o += 0.25;
            break;
            default:

        }

        if(i%12==1||i%12==4||i%12==6||i%12==9||i%12==11){
        //    s = s*0.5;
        }
        geometry = new THREE.BoxGeometry(s, barheight, 0 );

        material = new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.75} );
        mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = (o-barCount/2.0*7/12)*spacing;

        //        mesh.rotation.y = ang;
        //        mesh.position.x = size*Math.sin(ang);
        //        mesh.position.z = size*Math.cos(ang);

        bars.push(mesh);
        scene.add( mesh );

        var black = (i%12==1||i%12==4||i%12==6||i%12==9||i%12==11);
        if(i%12==1||i%12==4||i%12==6||i%12==9||i%12==11){

        }
        var z = black?1.5:2.5;
        var g2 = new THREE.BoxGeometry(black?s2*0.5:s2, 0.3, z);
        var m2 = new THREE.MeshLambertMaterial( { color: (black?0x0A0A0A:0xFFFFFF), transparent: false} );
        key = new THREE.Mesh( g2, m2 );
        key.position.x = (o2+0.25-barCount/2.0*7/12)*spacing;
        key.position.y = (black?0.3:0.0);
        key.position.z = z/2;
        scene.add( key );
    }


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( 1920, 1080 );

    document.body.appendChild( renderer.domElement );

}

function animate() {
    if(!dataArray)return;
    analyser.getByteFrequencyData(dataArray);

    requestAnimationFrame( animate );
    //    target.rotation.y+=0.001;
    for(var i=0;i<barCount;i++){
        data = interpolate(110*Math.pow(2,i/12.0))/256.0;
        bars[i].position.y = ((data*0.99+0.01)*barheight)/2;
        bars[i].scale.y = (data*0.99+0.01)+0.001;
        var colorscale = data*0.9+0.1;
        if(i%12==1||i%12==4||i%12==6||i%12==9||i%12==11){
            colorscale = data*0.1+0.2;
        }else{
            colorscale = data*0.2+0.8;
        }
        bars[i].material.color.setRGB(colorscale,colorscale,colorscale);
    }

    renderer.render( scene, camera );

}

function interpolate(freq){
    var x = freq;
    var sp = sampleRate/fftSize;
    var index = Math.floor(freq/sp);
    var x1 = (index-1)*sp;
    var x2 = (index)*sp;
    var x3 = (index+1)*sp;
    var x4 = (index+2)*sp;
    var y1 = dataArray[index-1];
    var y2 = dataArray[index];
    var y3 = dataArray[index+1];
    var y4 = dataArray[index+2];
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

        analyser.fftSize = fftSize;
        var bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        sampleRate = audioCtx.sampleRate;

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
