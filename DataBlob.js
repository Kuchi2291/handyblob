/*
globals getBevData, createHexCanvas, createBarGraphs, THREE, sliceGeometry, TWEEN, tinycolor
*/

function DataBlob(){
    
    var TAU = Math.PI*2;
    var HALF_PI = Math.PI/2;
    
    var _blobGeom, _blobMat, _blobMesh, _blobGeomParams;
    var _circleGeom, _circleMat, _circleMesh, _circleGeomParams;
    var _heatMapColors;
    var _data;
    var _modifier;
    var _animationParams, _tweenData;
    
    
    this.getDemoData = function(){
        return [
            {
                label: '1',
                radarData: [
                    {
                        label: 'freundlich',
                        percent: 0.1,
                        value: 123,
                        color: '#00ff00'
                    },
                    {
                        label: 'unfreundlich',
                        percent: 0.8,
                        value: 456,
                        color: '#00ff00'
                    },
                    {
                        label: 'nett',
                        percent: 0.5,
                        value: 789,
                        color: '#00ff00'
                    },
                    {
                        label: 'boese',
                        percent: 1,
                        value: 147,
                        color: '#00ff00'
                    },
                    {
                        label: 'teuflich',
                        percent: 0.6,
                        value: 258,
                        color: '#00ff00'
                    }
                ]
            }, 
            {
                label: '2',
                radarData: [
                    {
                        label: 'freundlich',
                        percent: 0.4,
                        value: 123,
                        color: '#0000ff'
                    },
                    {
                        label: 'unfreundlich',
                        percent: 0.6,
                        value: 123,
                        color: '#0000ff'
                    },
                    {
                        label: 'nett',
                        percent: 0.2,
                        value: 123,
                        color: '#0000ff'
                    },
                    {
                        label: 'boese',
                        percent: 0,
                        value: 123,
                        color: '#0000ff'
                    },
                    {
                        label: 'teuflich',
                        percent: 0.8,
                        value: 123,
                        color: '#0000ff'
                    }
                ]
            },  
            {
                label: '3',
                radarData: [
                    {
                        label: 'freundlich',
                        percent: 0.8,
                        value: 123,
                        color: '#ffff00'
                    },
                    {
                        label: 'unfreundlich',
                        percent: 0.4,
                        value: 123,
                        color: '#ffff00'
                    },
                    {
                        label: 'nett',
                        percent: 0.5,
                        value: 123,
                        color: '#ffff00'
                    },
                    {
                        label: 'boese',
                        percent: 1,
                        value: 123,
                        color: '#ffff00'
                    },
                    {
                        label: 'teuflich',
                        percent: 0.4,
                        value: 123,
                        color: '#ffff00'
                    }
                ]
            },  
            {
                label: '4',
                radarData: [
                    {
                        label: 'freundlich',
                        percent: 0.6,
                        value: 123,
                        color: '#ff0000'
                    },
                    {
                        label: 'unfreundlich',
                        percent: 0.6,
                        value: 123,
                        color: '#ff0000'
                    },
                    {
                        label: 'nett',
                        percent: 0.7,
                        value: 123,
                        color: '#ff0000'
                    },
                    {
                        label: 'boese',
                        percent: 0,
                        value: 123,
                        color: '#ff0000'
                    },
                    {
                        label: 'teuflich',
                        percent: 0.6,
                        value: 123,
                        color: '#ff0000'
                    }
                ]
            }, 
            {
                label: '5',
                radarData: [
                    {
                        label: 'freundlich',
                        percent: 0.2,
                        value: 987,
                        color: '#ff0000'
                    },
                    {
                        label: 'unfreundlich',
                        percent: 0.2,
                        value: 654,
                        color: '#ffff00'
                    },
                    {
                        label: 'nett',
                        percent: 0.5,
                        value: 321,
                        color: '#00ff00'
                    },
                    {
                        label: 'boese',
                        percent: 1,
                        value: 852,
                        color: '#0000ff'
                    },
                    {
                        label: 'teuflich',
                        percent: 0.2,
                        value: 963,
                        color: '#ffa700'
                    }
                ]
            }
        ];
    };
    
    var createBlobMesh = function(){
        
        // create Geometry
        //CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded, thetaStart, thetaLength)
        _blobGeom = new THREE.CylinderGeometry( 1, 1, _blobGeomParams.height + (_blobGeomParams.stretch*2), _blobGeomParams.rSegments, _blobGeomParams.hSegments, false, 0, TAU );
        
        // move first and last ring
        var i, _cVert, offset = 0.7;
        for( i=0; i<_blobGeomParams.rSegments; i++){
            _cVert = _blobGeom.vertices[i];
            _cVert.setY( _cVert.y - (_blobGeomParams.stretch*offset) );
            _cVert = _blobGeom.vertices[ _blobGeom.vertices.length-3 - i ];
            _cVert.setY( _cVert.y + (_blobGeomParams.stretch*offset) );
        }
        
        // move Caps
        _cVert = _blobGeom.vertices[ _blobGeom.vertices.length-1 ];
        _cVert.setY( _cVert.y + (_blobGeomParams.stretch*offset) );
        _cVert = _blobGeom.vertices[ _blobGeom.vertices.length-2 ];
        _cVert.setY( _cVert.y - (_blobGeomParams.stretch*offset) );

        // create Material
        _blobMat = new THREE.MeshPhongMaterial( { wireframe:true, vertexColors: THREE.VertexColors, shading: THREE.SmoothShading, fog: false, side: THREE.DoubleSide} );
        
        // create Mesh
        var blobMesh = new THREE.Mesh( _blobGeom, _blobMat );
        blobMesh.rotation.z = HALF_PI; // lay sideways
        //blobMesh.rotation.x = -HALF_PI/4;
        blobMesh.geometry.translate( 0, -_blobGeomParams.height/2, 0 ); // translate to front

        blobMesh.recieveShadow = true;
        blobMesh.castShadow = true;
        
        return blobMesh;
    };
    
    var createCircleMesh = function(){
    
        //********* CREATES INDICATOR CIRCLE *********
        
        //CircleGeometry(radius, segments, thetaStart, thetaLength)
        _circleGeom = new THREE.CircleGeometry( 1, _blobGeomParams.rSegments, 0, TAU );
        _circleGeom.rotateY( -HALF_PI ); // rotate up 
        
        
        //http://stackoverflow.com/questions/20153705/three-js-wireframe-material-all-polygons-vs-just-edges
        // cwg stands for circleWireGeometry
        // cwls stands for circleWireLineSegments
        var cwg = new THREE.EdgesGeometry( _circleGeom );
        var cwg_3_4 = new THREE.EdgesGeometry( _circleGeom );
        cwg_3_4.scale( 0.75, 0.75, 0.75 );
        var cwg_1_2 = new THREE.EdgesGeometry( _circleGeom );
        cwg_1_2.scale( 0.5, 0.5, 0.5 );
        var cwg_1_4 = new THREE.EdgesGeometry( _circleGeom );
        cwg_1_4.scale( 0.25, 0.25, 0.25 );

        _circleMat = new THREE.LineBasicMaterial( {color: 0x0000ff, linewidth:2, linecap: 'round', linejoin:'round', side: THREE.DoubleSide} );

        var cwls = new THREE.LineSegments( cwg, _circleMat );
        var cwls_3_4 = new THREE.LineSegments( cwg_3_4, _circleMat );
        var cwls_1_2 = new THREE.LineSegments( cwg_1_2, _circleMat );
        var cwls_1_4 = new THREE.LineSegments( cwg_1_4, _circleMat );
        
        cwls.add( cwls_3_4 );
        cwls.add( cwls_1_2 );
        cwls.add( cwls_1_4 );
        
        // returns mesh to add to scene
        return cwls;
        
    };
    
    var createHeatMapColorRange = function(){

        //create 120 color steps from green (120 deg) to red (0 deg)
        var heatMapColors = [];
        for (var i = 120; i > 0; i--) {
            heatMapColors.push( tinycolor({ h: i, s: 80, l: 50 }).toHexString() );
        }
        
        return heatMapColors;
        
    };
    
    var applyDataDeform = function(){
    
        // get the verticies of the mesh
        var _verts = _blobGeom.vertices;
        // get the colors of the mesh
        var _colors = _blobGeom.colors;
        
        var _layer = -1;
        
        for(var i = 0; i<_verts.length;i++){
            
            var _cVert = _verts[i+1]; // jump over cap vertex
            _colors[i] = new THREE.Color( 0x0000ff ); // assign default color - magenta
            
            var _spike = i % _blobGeomParams.rSegments;
            if(!_spike) _layer++;
            //console.log(_layer, _layer*_blobGeomParams.rSegments);
            
            var _dataIdx = _layer;
            var _radarIdx = _spike;
            
            if(_dataIdx < _data.length && _cVert){
                
                var _spikeData = _data[_dataIdx].radarData[_spike];
                _cVert.set(
                    _cVert.x * _spikeData.percent,
                    _cVert.y,
                    _cVert.z * _spikeData.percent
                );
                _colors[i] = new THREE.Color( _spikeData.color ); // assign spike color
                
            }
        }
        
        //colorize caps
        _colors[ _verts.length-2 ] = new THREE.Color( _data[0].radarData[0].color );
        _colors[ _verts.length-1 ] = new THREE.Color( _data[ _data.length-1 ].radarData[0].color );

        
        
    };
    
    var applyHeatMap = function(){
        
        // get the verticies of the mesh
        var _verts = _blobGeom.vertices;
        // get the colors of the mesh
        var _colors = _blobGeom.colors;
        
        // set Colors in Data by heatmap
        _data.forEach( function( $radarChartData, $currentLayer ){
            
            $radarChartData.radarData.forEach(function( $spikeData, $idx){
                
                // heatmapIndex
                var _hmIdx = Math.floor( $spikeData.percent * (_heatMapColors.length-1));
                // update Color Value in Data
                 $spikeData.color = _heatMapColors[_hmIdx];
                
                // update Color in Geometry
                _colors[ $currentLayer*_data.length + $idx ] = new THREE.Color( $spikeData.color );
                
            });
        });

        applyColors();
    };
    
    function applyColors(){
        
        //apply colors from _blobGeom colors array
        var color, point, face, numberOfSides, vertexIndex;
        var _capColor = new THREE.Color( _heatMapColors[0] );
        // faces are indexed using characters
        var faceIndices = [ 'a', 'b', 'c', 'd' ];

        for ( var i = 0; i < _blobGeom.faces.length; i++ ) 
        {
            face = _blobGeom.faces[ i ];
            numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
            
            for( var j = 0; j < numberOfSides; j++ ) 
            {
                vertexIndex = face[ faceIndices[ j ] ];
                face.vertexColors[ j ] = _blobGeom.colors[ vertexIndex ];
            }

            // cap color for cylinder
            // http://stackoverflow.com/questions/25231965/threejs-how-to-assign-different-color-for-top-face-of-a-cylinder
            if(_blobGeom.faces[i].vertexColors[2] === undefined){
                _blobGeom.faces[i].vertexColors[2] = _capColor;
            }
        }
    
    }
    
    this.create = function( $data, $stretch, $smooth ){ 
    
        // store data
        _data = ($data) ? $data : this.getDemoData();
        
        var preData = JSON.parse( JSON.stringify(_data[0]) );
        var postData = JSON.parse( JSON.stringify(_data[ _data.length-1 ]) );
        
        _data.unshift( preData );
        _data.push( postData );
        
        
        // init 3D Objects
        var _s = ($stretch) ? $stretch : 1;
        _blobGeomParams = {
            stretch: _s,
            height: _s * (_data.length - 1) - (_s*2),
            rSegments: _data[0].radarData.length,
            hSegments: _data.length-1
        };
        
        console.log( _blobGeomParams.height );
        
        // dataBlob - creates an cylinder
        _blobMesh = (_blobMesh) ? _blobMesh : createBlobMesh( $smooth );
        // indicator - creates a circle around center
        _circleMesh = (_circleMesh) ? _circleMesh : createCircleMesh();
        
        // create Heat Map Color Range
        _heatMapColors = (_heatMapColors) ? _heatMapColors : createHeatMapColorRange();
        
        // deforms the dataBlob by _data
        applyDataDeform();
        
        // subsurf if $smooth is greater than 0
        subsurf( $smooth );
        
        // colorize the mesh by vertex color data
        //applyHeatMap();
        //applyColors();
        
        // init Animation Params
        _animationParams = {
            targetY : 0,
            currentY: 0,
            previousY: 0,
            tween: null,
            easing: TWEEN.Easing.Cubic.Out
        };
        _tweenData = { y:0 };
        
    };
    
    this.showHeatMap = function(){
    
        applyHeatMap();
    
    };
    
    this.moveToIndex = function( $index, $duration ){
        
        // check if $index is in valid range
        if( $index < 0 || $index > _data.length-3){ return 'invalid range'; }
        
        // calculate target position
        var posPercent = $index/(_data.length-3);
        //console.log('pp',posPercent);
        
        this.moveToPercent( posPercent );
        
        /*
        //_animationParams.targetY = $index * _blobGeomParams.stretch;
        _animationParams.targetY = posPercent * _blobGeomParams.height;
        _animationParams.targetY += _blobGeomParams.stretch * 0.7;
        
        // init current Position
        _tweenData.y = _animationParams.previousY = _animationParams.currentY;

        //startTween
        initTween( $duration );
        */
    };
    
    this.moveToPercent = function( $percent, $duration ){
        
        // check if percent is in valid range
        if( $percent < 0 || $percent > 1){ return; }
        
        // calculate target position
        _animationParams.targetY = $percent * _blobGeomParams.height;

        // init current Position
        _tweenData.y = _animationParams.previousY = _animationParams.currentY;

        //startTween
        initTween( $duration );
    
    };
    
    var subsurf = function( $smooth ){
        var _sm = ($smooth) ? $smooth : 0;
        if( _sm > 0){
            _modifier = (_modifier) ? _modifier : new THREE.SubdivisionModifier( _sm );
            _modifier.modify( _blobMesh.geometry );
        }
    };
    
    var initTween = function( $duration ){
        
        var _d = ($duration) ? $duration : 2000;
        var _t = _animationParams.tween;
        _t = new TWEEN.Tween( _tweenData );
        _t.to( { y: _animationParams.targetY }, _d);
        _t.onUpdate( updateAnimationParams );
        _t.easing( _animationParams.easing );
        _t.start();

    };
    
    var updateAnimationParams = function(){
        // calculate distance to translate for current frame
        var _d = this.y - _animationParams.previousY;
        // update PreviousY to calculate distance in next frame
        _animationParams.previousY = this.y;
        // update currentY position of geometry 
        _animationParams.currentY = this.y;
        // translate geometry by calculated distance
        _blobMesh.geometry.translate(0,_d,0);
    };
    
    this.update = function(){
    
        TWEEN.update();
        
    };
    
    // GETTER + SETTER
    
    this.getIndicator = function(){
        return _circleMesh;
    };
    
    this.getBlob = function(){
        return _blobMesh;
    };




}