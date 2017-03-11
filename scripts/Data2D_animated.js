/*
globals getBevData, createHexCanvas, createBarGraphs, THREE, sliceGeometry, TWEEN, tinycolor, DataBlob, DataCircles, OrbitControls, Data2D
*/

function Data2D() {

    //Daten laden
    var _myData;
    var splineObject;
    var catmullObject;
    //Kurve zeichnen
    var myPoints = [];
    var _radius;
    var currentIndex = 0;
    var catmullDataSlice;
    var _animationParams, _tweenData;

    this.create = function ($data, $radius) {

        _myData = $data;
        _radius = ($radius) ? $radius : 1;
        
        // init Animation Params
        _animationParams = {
            targetPoints : 0,
            currentPoints: 0,
            previousPoints: 0,
            tweens: [],
            //easing: TWEEN.Easing.Elastic.InOut 
            easing: TWEEN.Easing.Cubic.Out
        };
    };

    //Kreis zeichnen (Punkte nach Prozentwerten auf Achsen verteilen)
    var drawCircle = function () {
        var myPoints = [];

        for (var i = 0; i < 360; i++) {
            var myRad = i * (Math.PI / 180);
            var myX = Math.sin(myRad);
            var myY = Math.cos(myRad);
            myPoints.push(new THREE.Vector2(myX * _radius, myY * _radius));
        }
        myPoints.push(new THREE.Vector2(0, _radius));

        var curve = new THREE.SplineCurve(myPoints);
        curve.closePath = true;

        var path = new THREE.Path(curve.getPoints(50));
        var geometry = path.createPointsGeometry(100);
        var material = new THREE.LineBasicMaterial({
            color: 0xff0000
        });

        // Create the final object to add to the scene
        var line = new THREE.Line(geometry, material);
        return line;
    };

    //Dataslice für Hintergrund zeichnen
    var drawCatmull = function () {
        
        // init Drawing
        var myIndex = 0;

        for (var i = 0; i < 360; i += (360 / _myData[currentIndex].radarData.length)) {
            var myRad = i * (Math.PI / 180);
            var myX = Math.sin(myRad);
            var myY = Math.cos(myRad);
            var percent = _myData[currentIndex].radarData[myIndex].percent;
            myPoints.push(new THREE.Vector3(myX * _radius * percent, myY * _radius * percent, 0));
            myIndex++;
        }
        
        _animationParams.currentPoints = myPoints;

        catmullDataSlice = new THREE.CatmullRomCurve3(myPoints);
        catmullDataSlice.closed = true;

        //Hülle anlegen
        //new THREE.TubeBufferGeometry( Form angeben, kurve interpolieren #segmente , dicke, #radiusSegments, closed2 )
        var tube = new THREE.TubeBufferGeometry(catmullDataSlice, 50, 0.1, 6, true);
        //tube.rotateY(Math.PI);
        tube.rotateX( Math.PI/4 );
        
        
        //MESH erzeugen
        var material = new THREE.MeshBasicMaterial({
            color: 0xDCDCDC
        });
        var mesh = new THREE.Mesh(tube, material);
        
        return mesh;
    };

    var updateCatmullObject = function( $points ){
    
        //CatmullCurve neu
        var newDataSlice = new THREE.CatmullRomCurve3( $points );
        newDataSlice.closed = true;

        var tube = new THREE.TubeBufferGeometry(newDataSlice, 50, 0.1, 6, true);
        tube.rotateY(Math.PI);

        catmullObject.geometry.copy(tube);
        catmullObject.geometry.verticesNeedUpdate = true;
    };

    var calculatePoints = function ($myIndex) {
        
        // calculate new points for provided index in data array
        currentIndex = $myIndex;
        var newPoints = [];
        var radarData = _myData[currentIndex].radarData;
        
        var myIndex = 0;
        for (var i = 0; i < 360; i += (360 / radarData.length)) {
            var myRad = i * (Math.PI / 180);
            var myX = Math.sin(myRad);
            var myY = Math.cos(myRad);
            var percent = radarData[myIndex].percent;
            newPoints.push(new THREE.Vector3(myX * _radius * percent, myY * _radius * percent, 0));
            myIndex++;
        }

       return newPoints;

    };
    
    var initTween = function( $points, $duration ){

        var _d = ($duration) ? $duration : 2000;
        var _t = _animationParams.tweens;
        
        
        _animationParams.currentPoints.forEach( function( $p, $idx){
        
            _t[$idx] = new TWEEN.Tween( $p );
            
            var targetObj = {
                x: $points[$idx].x,
                y: $points[$idx].y,
                z: $points[$idx].z,
            
            };
            
            _t[$idx].to( targetObj , _d);
            _t[$idx].onUpdate( updateAnimationParams );
            _t[$idx].easing( _animationParams.easing );
            _t[$idx].start();
        
        } );
        
        
        /*
        
        _animationParams = {
            targetPoints : 0,
            currentPoints: 0,
            previousPoints: 0,
            tweens: null,
            easing: TWEEN.Easing.Elastic.InOut 
        };
        */
        
        //_animationParams.currentPoints = myPoints;
        //_animationParams.targetPoints = $points;
        

    };
    
    var updateAnimationParams = function(){
        
        
        //console.log( _animationParams.currentPoints );
        updateCatmullObject( _animationParams.currentPoints );
        
        return;
        // calculate distance to translate for current frame
        var _d = this.y - _animationParams.previousY;
        // update PreviousY to calculate distance in next frame
        _animationParams.previousY = this.y;
        // update currentY position of geometry 
        _animationParams.currentY = this.y;
        // translate geometry by calculated distance
        //_circleMesh.translateX(_d);
    };


    this.moveToIndex = function ($index, $duration) {
        
        var newPoints = calculatePoints($index);
        
        
        initTween( newPoints, $duration );
    };
    
    //**** GETTER
    
    this.get2DCircle = function () {
        
        splineObject = (splineObject) ? splineObject : drawCircle();
        return splineObject;
    };

    this.getCatmull = function () {
        catmullObject = (catmullObject) ? catmullObject : drawCatmull();
        return catmullObject;
    };
    
}