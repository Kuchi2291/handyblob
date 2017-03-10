/*
globals getBevData, createHexCanvas, createBarGraphs, THREE, sliceGeometry, TWEEN, tinycolor, DataBlob
*/

/* ---------------------------------
              VARIABLEN 
------------------------------------*/

// animation params
var _animateMe = true;

var _point_light, _ambientLight;
var _scene, _camera, _renderer;
var _dataBlob, _blobMesh, _circleMesh;

//STORE LABEL MESHES 
var _fontGeometries = [];
var _fontShapes = [];
var _labels = [];
var _fontMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide});

//data2D
var _dataCurve, _curveMesh;
var my2D = new Data2D();
var _circle2D;
var _catmull; 

var _dataCircles, _circlesMesh;
  

//Camera Position

/* Variablen um Min und Max Ausgabewerte heraus zu finden 
var minimumZ = 100,
var maximumZ = 0,
var minimumY = 100,
var maximumY = 0, */

var _cameraPhi = 0;         // Y Achse (hoch runter)
var _cameraTheta = 0;       // Z Achse (links rechts)
var TAU = Math.PI*2;        // eine komplette 360° Achse
var _cameraPosition = 3;    // Entfernung
var _myData;
var device;                 // Mobiles Gerät    
var _isMobile;              // Mobile
var controls;               // Desktop Camera Steuerung
//var _translationSpeed = 0.05;
//var _cameraUp = true;


//Label Planes Test
//var circleGeometry = _circleMesh.geometry;
//var demoData = _dataBlob.getDemoData();

var _font;
var font_loader = new THREE.FontLoader();

//Variablen für WindowResize
var HEIGHT;
var WIDTH;
var windowHalfX;
var windowHalfY;

/* ---------------------------------
          VARIABLEN ENDE
------------------------------------*/


/* ---------------------------------
          MOBILE ABFRAGE 
------------------------------------*/

function isMobile(){
    return navigator.userAgent.match(/(iPhone|iPod|iPad|blackberry|android|Kindle|htc|lg|midp|mmp|mobile|nokia|opera mini|palm|pocket|psp|sgh|smartphone|symbian|treo mini|Playstation Portable|SonyEricsson|Samsung|MobileExplorer|PalmSource|Benq|Windows Phone|Windows Mobile|IEMobile|Windows CE|Nintendo Wii)/i);
}

/* ---------------------------------
          WINDOW RESIZE 
------------------------------------*/

function onWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;
  _renderer.setSize(WIDTH, HEIGHT);
  _camera.aspect = WIDTH / HEIGHT;
  _camera.updateProjectionMatrix();
  _camera2D.aspect = WIDTH / HEIGHT;
  _camera2D.updateProjectionMatrix();
}

/* ---------------------------------
               INITS 
------------------------------------*/

// THREE init
function initThree(){

    // scene + camera
    _scene = new THREE.Scene();
    var _zoom = 0.01;
    
    // Kamera Arten: Orthografisch ohne Perspektive
    //_camera =new THREE.OrthographicCamera( window.innerWidth / - 2 *_zoom, window.innerWidth / 2 *_zoom, window.innerHeight / 2 *_zoom, window.innerHeight / - 2 *_zoom, 1, 1000 );
    _camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );
    _camera.position.z = _cameraPosition;

    // light
    _ambientLight = new THREE.AmbientLight( 0x43db3d, 2 ); // soft white light
    _scene.add( _ambientLight );

    _point_light = new THREE.PointLight( 0xfff, 1.5 ); // pointy light
    _point_light.position.set( 0,3,-0.5);
    _point_light.castShadow = true;
    _scene.add( _point_light );

       //scene 2D
    _scene2D = new THREE.Scene();
    //_camera2D = new OrthographicCamera( window.innerWidth / - 2 *_zoom, window.innerWidth / 2 *_zoom, window.innerHeight / 2 *_zoom, window.innerHeight / - 2 *_zoom, 1, 1000 );
    _camera2D = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );
    _camera2D.position.z = 25;

    // renderer
    _renderer = new THREE.WebGLRenderer();
     //autoClear false = zwei szenen werden gleichzeitig angezeigt
    _renderer.autoClear = false;
    _renderer.setSize( window.innerWidth, window.innerHeight );
    _renderer.shadowMap.enabled = true; // to antialias the shadow
    _renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    _renderer.setClearColor(0xFFFFFF);

    document.getElementById('wrapper').appendChild( _renderer.domElement );

}

// Datablob init
function initBlob(){

    // create Instance
    _dataBlob = new DataBlob();

    _myData = _dataBlob.getDemoData();

    _myData.forEach(function(a, i){
        a.radarData.forEach(function(b, j){
            //color rings
            //b.color = tinycolor({ h: i/_myData.length*360, s: 80, l: 50 }).toHexString();
            //color lines
            //b.color = tinycolor({ h: j/_myData.length*360, s: 80, l: 50 }).toHexString();
        });
    });

    // $data, $stretch, $smooth
    _dataBlob.create( getBevData() , 1, 2 );
    _blobMesh = _dataBlob.getBlob();
    _circleMesh = _dataBlob.getIndicator();

    _scene.add( _blobMesh );
    //_scene.add( _circleMesh );

}

// circle2D init
function init2D(){
  
  my2D.drawCircle();
  _circle2D = my2D.get2DCircle();
  _scene2D.add(_circle2D);


  my2D.drawCatmull();
  _catmull = my2D.getCatmull();
  _scene2D.add(_catmull);
}

function initCurve(){

    _dataCurve = new Data2D();
    _dataCurve.create( getBevData(), 15);

    _curveMesh = _dataCurve.getCatmull();
    _curveMesh.rotateZ(- Math.PI/4);

    _scene2D.add( _curveMesh );

}

function initCircles(){

    // create Instance
    _dataCircles = new DataCircles();

    _myData = (_myData) ? _myData : _dataCircles.getDemoData();

    // $data, $stretch, $smooth
    _dataCircles.create( getBevData() , 1, 3 );
    _circlesMesh = _dataCircles.getCircles(); 
    _indicatorMesh = _dataCircles.getIndicator();

    _scene.add( _circlesMesh );
    //_scene.add( _indicatorMesh );

}



function init(){

    // set up THREE
    initThree();

    initCircles();  // WICHTIG vor dem initBlob() Aufruf einfügen
    
    // set Up 2D Curve
    initCurve();

    // set up BLOB
    initBlob();



    // set up 2D
    //init2D();

    _isMobile = isMobile();

    controls = new THREE.OrbitControls( _camera, _renderer.domElement);
    controls.rotateLeft(Math.PI/2);
    controls.noZoom =true;
    controls.noPan = true;

    device = new THREEx.DeviceOrientationState();
    

    // start Rendering
    window.requestAnimationFrame( render );
}

init();


/* ---------------------------------
          LABEL PLANES TEST 
------------------------------------*/
/*

font_loader.load( 'scripts/lib/three/examples/fonts/helvetiker_regular.typeface.json', function ( $font ) {
    _font = $font;
    //createLabels();
} );

function updateLabels( $setIndex ){

    if(!_font) return;

    demoData[$setIndex].radarData.forEach( function( $data, $idx ){

        updateLabel( $idx, $data.label + ' ' + $data.percent);

    });

}

function updateLabel( $idx, $text){

    _fontShapes[$idx] = _font.generateShapes( $text, 0.1);
    _fontGeometries[$idx] = new THREE.ShapeGeometry( _fontShapes[$idx] );
    _labels[$idx].geometry = _fontGeometries[$idx];
    _labels[$idx].geometry.needsUpdate = true;
    //_labels[$idx] = new THREE.Mesh( _fontGeometries[$idx], _fontMaterial );

    // position mesh at vertices postion of circle geometry
    _labels[$idx].position.copy( circleGeometry.vertices[ $idx+1 ] );

    // http://stackoverflow.com/questions/23859512/how-to-get-the-width-height-length-of-a-mesh-in-three-js
    // get bounding box to catch width of font
    var box = new THREE.Box3().setFromObject( _labels[$idx] );
    // center text geometry to align text to center
    _labels[$idx].geometry.translate( -box.getSize().x/2, 0, 0 );

    var _pos = _labels[$idx].position;
    _labels[$idx].position.set(
        _pos.x * 1.1,
        _pos.y * 1.1,
        _pos.z
    );

}

function createLabels(){

    if(!_font) return;

    demoData[0].radarData.forEach( function( $data, $idx ){

        _fontShapes[$idx] = _font.generateShapes( $data.label + ' ' + $data.value, 0.1);
        _fontGeometries[$idx] = new THREE.ShapeGeometry( _fontShapes[$idx] );
        _labels[$idx] = new THREE.Mesh( _fontGeometries[$idx], _fontMaterial );

        // position mesh at vertices postion of circle geometry
        _labels[$idx].position.copy( _circleMesh.geometry.vertices[ $idx+1 ] );

        // http://stackoverflow.com/questions/23859512/how-to-get-the-width-height-length-of-a-mesh-in-three-js
        // get bounding box to catch width of font
        var box = new THREE.Box3().setFromObject( _labels[$idx] );
        // center text geometry to align text to center
        _labels[$idx].geometry.translate( -box.getSize().x / 2, 0 , 0 );

        var _pos = _labels[$idx].position;
        _labels[$idx].position.set(
            _pos.x * 1.1,
            _pos.y * 1.1,
            _pos.z
        );

        _scene.add(_labels[$idx]);
    });

}

function faceLabelsToCamera( $label ){
    $label.lookAt( _camera.position );
}

*/

/* ---------------------------------
            SLICE BLOB TEST
------------------------------------*/

/* 
function sliceBlob(){
    var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    _blobMesh.geometry = sliceGeometry( _blobMesh.geometry, plane );
}*/


/* ---------------------------------
          ACCELERATION 
------------------------------------*/

function mapLinear ( x, a1, a2, b1, b2 ) {
	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
}

function getAcceleration(){

    //Min Max Werte von Z

    /*
    if ( device.angleZ() < minimumZ){
        minimumZ = device.angleZ();
    }

    if ( device.angleZ() > maximumZ){
        maximumZ = device.angleZ();
    }
    
    //Min Max Map von Y
      if ( device.angleY() < minimumY){
        minimumY = device.angleY();
    }

    if ( device.angleY() > maximumY){
        maximumY = device.angleY();
    }*/

  //Wertebereich Kamera für linksrechts. Sauber gemappt FINGA WEG!!!!!1elf
   var mappedZ = mapLinear(device.angleZ(), -1.57,1.57,0,TAU);
  
  //Einschränkungen des Handy Winkels
   var sensorY = device.angleY();
   if (sensorY < 0){
       sensorY = 0;
   }
   if (sensorY > Math.PI/2){
       sensorY = Math.PI/2;
   }

    //Wertebereich von der Kamera für obenunten
   var mappedY = mapLinear(sensorY, 0,Math.PI/2,-Math.PI/2*0.5,Math.PI/2*0.75);
 
   //Übergabe der gemappten Sensordaten an Camerapositionswinkel
   _cameraTheta = mappedY; // orbit up and down - Range: Math.PI*0.5 to Math.PI*1.5
   _cameraPhi = mappedZ*0.5 + TAU*0.25;// orbit left and right    

}

function updateCamera(){
    getAcceleration();
    // rotate camera around center FINGA WEG!
    _camera.position.y = _cameraPosition * Math.sin(_cameraTheta);
    _camera.position.x = _cameraPosition * Math.cos(_cameraTheta) * Math.cos(_cameraPhi);
    _camera.position.z = _cameraPosition * Math.cos(_cameraTheta) * Math.sin(_cameraPhi);
    _camera.lookAt( _scene.position );
}
/* ---------------------------------
              RENDER 
------------------------------------*/
function render( $time ) {

    if(_animateMe){
        window.requestAnimationFrame( render );
    }
        /* -------------------------------
                    CAMERA
        --------------------------------- */
    if (controls && !_isMobile){
        controls.update();        
    } 

    if( _isMobile ){
        updateCamera();
    } 
    
    // make labes face the camera
    /*if(_labels.length){
        _labels.forEach( faceLabelsToCamera );
    }*/

    /* -------------------------------
    * DATA BLOB
    --------------------------------- */

    // animate blobmesh to slice - see tweenUpdate() function for details
    
    TWEEN.update();
    //_dataCircles.update();
    //_dataBlob.update();
    _renderer.clear(0xffffff);
    //_renderer.render( _scene2D, _camera2D);
    _renderer.render( _scene, _camera );
    
}


/* ---------------------------------
              LISTENER 
------------------------------------*/

window.addEventListener('resize', onWindowResize, false);
/*window.addEventListener('click',function(e){

    var _idx = Math.round( e.clientX / window.innerWidth  * (_myData.length-1) );
    console.log(_idx);
    _dataBlob.moveToIndex(_idx);
    _dataCircles.moveToIndex(_idx);

});*/


