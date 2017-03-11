
function Data2D(){

  //Daten laden
  var mydataObject = new DataBlob();
  var mydata = mydataObject.getDemoData();
  var splineObject;
  var catmullObject;
  //Kurve zeichnen
  var myPoints = [];
  var scale = 10;
  var currentIndex = 0;
  var catmullDataSlice;

  //Kreis zeichnen (Punkte nach Prozentwerten auf Achsen verteilen)
  this.drawCircle = function(){
    var myPoints = [];

    for(var i = 0; i < 360; i++) {
      var myRad = i * (Math.PI/180);
      var myX = Math.sin(myRad);
      var myY = Math.cos(myRad);
      myPoints.push(new THREE.Vector2(myX * scale, myY * scale));
    }
    myPoints.push(new THREE.Vector2(0,scale));

    var curve = new THREE.SplineCurve(myPoints);
    curve.closePath = true;

    var path = new THREE.Path( curve.getPoints(50) );
    var geometry = path.createPointsGeometry( 100);
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

    // Create the final object to add to the scene
    splineObject = new THREE.Line( geometry, material );
  }

  //Dataslice für Hintergrund zeichnen
  this.drawCatmull = function(){
    var myIndex = 0;

    for(var i=0; i<360; i+= (360/mydata[currentIndex].radarData.length)) {
      var myRad = i * (Math.PI/180);
      var myX = Math.sin(myRad);
      var myY = Math.cos(myRad);
      var percent = mydata[currentIndex].radarData[myIndex].percent;
      myPoints.push(new THREE.Vector3(myX * scale * percent, myY * scale * percent,0));
      myIndex++;
    }

    catmullDataSlice = new THREE.CatmullRomCurve3(myPoints);
    catmullDataSlice.closed = true;

    //Hülle anlegen
    //new THREE.TubeBufferGeometry( Form angeben, kurve interpolieren #segmente , dicke, #radiusSegments, closed2 )
    var tube = new THREE.TubeBufferGeometry( catmullDataSlice, 50, 1, 6, true );

    //MESH erzeugen
    var material = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
    catmullObject = new THREE.Mesh( tube, material );
  }

  this.get2DCircle = function(){
    return splineObject;
  }

  this.getCatmull = function(){
    return catmullObject;
  }

  var updateCatmull = function( $myIndex ){
    //punkte update Points
    var newPoints = [];
    var newDataSlice;
    currentIndex = $myIndex;
    var year = mydata[currentIndex];
    var myIndex = 0;

    for(var i=0; i<360; i+= (360/year.radarData.length)) {
      var myRad = i * (Math.PI/180);
      var myX = Math.sin(myRad);
      var myY = Math.cos(myRad);
      var percent = year.radarData[myIndex].percent;
      newPoints.push(new THREE.Vector3(myX * scale * percent, myY * scale * percent, 0));
      myIndex++;
    }

    //CatmullCurve neu
    newDataSlice = new THREE.CatmullRomCurve3(newPoints);
    newDataSlice.closed = true;

    var tube = new THREE.TubeBufferGeometry( newDataSlice, 50, 1, 6, true );

    catmullObject.geometry.copy(tube);
    catmullObject.geometry.verticesNeedUpdate = true;

  };


  this.moveToIndex = function( $index, $duration ){
      updateCatmull( $index );
  };
}
