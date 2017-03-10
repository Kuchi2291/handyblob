/*
globals getBevData, createHexCanvas, createBarGraphs, THREE, sliceGeometry, TWEEN, tinycolor
*/

function DataCircles(){
    
    var TAU = Math.PI*2;
    var HALF_PI = Math.PI/2;
    
    var _geometryParams;
    var _circleGeoms, _circleMats, _circleMeshes;
    var _circleGeom, _circleMat, _circleMesh;
    var _indicatorGeom, _indicatorMat, _indicatorMesh;
    var _textures, _textureCvs, _textureCtx;
    var _alphaMapTexture, _alphaMapCvs, _alphaMapCtx;
    var _data;
    var _smooth;
    var _modifier;
    var _animationParams, _tweenData;
    
    this.create = function( $data, $stretch, $smooth ){ 

        // store data
        _data = ($data) ? $data : this.getDemoData();
        
        _smooth = ($smooth) ? $smooth : 0;

        // init 3D Objects
        var _s = ($stretch > 0) ? $stretch : 1;
        _geometryParams = {
            stretch: _s,
            height: _s * (_data.length-1),
            rSegments: _data[0].radarData.length
        };

        _circleGeoms = [];
        _circleMats = [];
        _circleMeshes = [];
        
        // init Animation Params
        _animationParams = {
            targetY : 0,
            currentY: 0,
            previousY: 0,
            tween: null,
            easing: TWEEN.Easing.Cubic.Out
        };
        
        _tweenData = { y:0 };
        
        // create Circles from Data
        createCircles();
        
        // create Indicator ( used for data validation and meshposition
        createIndicatorMesh();

    };
    
    var createCircles = function(){
        
        // create 3DObject as parent
        _circleMesh = new THREE.Object3D();
        // create Material for circles
        _circleMat = new THREE.LineBasicMaterial( {color: 0xDCDCDC, linewidth:2, linecap: 'round', linejoin:'round', side: THREE.DoubleSide} );
        
        // init canvas for drawing gradient Textures for each entry in _data by its color
        _textures = [];
        _textureCvs = document.createElement('canvas');
        _textureCvs.width = _textureCvs.height = 256;
        _textureCtx = _textureCvs.getContext('2d');
        _textureCtx.globalCompositeOperation = 'screen';
        
        _alphaMapCvs = document.createElement('canvas');
        _alphaMapCvs.width = _alphaMapCvs.height = 256;
        _alphaMapCtx = _alphaMapCvs.getContext('2d');
        // draw alpha map
        var grd = _textureCtx.createRadialGradient(128,128,20,128,128,128);
        grd.addColorStop(0, '#000000');
        grd.addColorStop(1, '#ffffff');
        _alphaMapCtx.fillStyle = grd;
        _alphaMapCtx.fillRect(0,0,256,256);
        _alphaMapTexture = new THREE.CanvasTexture( _alphaMapCvs );
        
        _data.forEach( createCircleMesh );
        
        // test subsurf on parent if not working subsurf in for each loop
        
    };
    
    var createCircleMesh = function( $data, $idx, $arr ){
        
        //********* CREATES CIRCLE MESH *********
        
        //get radarData
        //var radarData = $data.radarData;
        var radarData = $arr[$arr.length-1-$idx].radarData;
        
        //createGemoetry
        //CircleGeometry(radius, segments, thetaStart, thetaLength)
        var geom = new THREE.CircleGeometry( 1, _geometryParams.rSegments, 0, TAU );
        
        //merge start and end Vertex
        geom.mergeVertices();
        
        // ---- deform geometry by radardata + gradient texture -----
        
        // get verticies to deform
        var verts = geom.vertices;
        
        // get current Vertex
        var cVert = verts[ 0 ]; 
        
        // set center vertex z
        cVert.setZ( $idx * _geometryParams.stretch );
        
        // clear texture canvas
        var textureCvs = document.createElement('canvas');
        textureCvs.width = textureCvs.height = 256;
        var textureCtx = textureCvs.getContext('2d');
        textureCtx.globalCompositeOperation = 'screen';
        
        // deform vertices
        for( var i=0; i < radarData.length; i++){
        
            var percent = radarData[ i ].percent;
            
            cVert = verts[ i+1 ]; // update current Vertex - skip center Vertex
            cVert.set(
                cVert.x * percent,
                cVert.y * percent,
                $idx * _geometryParams.stretch
            );
            
            
            // draw textureCanvas
            
            // createRadialGradient( x, y, radius, x ,y , radius );
            var _x = cVert.x * 256;
            var _y = cVert.y * 256;
            var grd = _textureCtx.createRadialGradient(_x,_y,1,_x,_y,128);
            //var grd = textureCtx.createLinearGradient(_x,_y,128,128);
            grd.addColorStop(0, radarData[i].color);
            grd.addColorStop(1, tinycolor(radarData[i].color+'00') ); // ADD ALPHA

            // Fill with gradient
            textureCtx.fillStyle=grd;
            textureCtx.fillRect(0,0,256,256);
           
            
        }
        
        // rotate to match datablob transforms
        geom.rotateY(-Math.PI/2);
        geom.rotateX(-Math.PI/4);
        geom.translate( _geometryParams.height, 0, 0);
        
        //create Texture
        // CanvasTexture( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy )
        _textures.push( new THREE.CanvasTexture( textureCvs ) );
       

        // ---- deform geometry by radardata +gradient texture end -----
        
        //http://stackoverflow.com/questions/20153705/three-js-wireframe-material-all-polygons-vs-just-edges
        
        // subsurf geometry
        if( _smooth > 0){
            _modifier = (_modifier) ? _modifier : new THREE.SubdivisionModifier( _smooth );
            _modifier.modify( geom );
        }
        
        
        var tmpMat = new THREE.MeshBasicMaterial( { map: _textures[ _textures.length-1 ], alphaMap: _alphaMapTexture, transparent: true, side: THREE.DoubleSide } );
        var tmpMesh = new THREE.Mesh( geom, tmpMat );
        
        _circleMesh.add(tmpMesh);
        
        
        
        // create EdgesGeometry from deformed geometry
        var eGeom = new THREE.EdgesGeometry( geom );
        
        //add EdgesGeometry to geometries array
        _circleGeoms.push( eGeom );
        
        // subsurf geometry - does not work with edgesgeometry
        /*
        if( _smooth > 0){
            _modifier = (_modifier) ? _modifier : new THREE.SubdivisionModifier( _smooth );
            _modifier.modify( eGeom );
        }
        */
        
        //create Mesh
        var eMesh = new THREE.LineSegments( eGeom, _circleMat );
        
        //add mesh to parentgeometry
        _circleMesh.add( eMesh );
        
        // FUN
        //_circleMesh.add( new THREE.Points( geom, new THREE.PointsMaterial( { size: 0.05, color: Math.random()*0xffffff } ) ) );
        
        //TEMP
        //eMesh.scale.set(1,2,2);
        //eMesh.material.map = _textures[ $idx ];
        //eMesh.material.needsUpdate = true;

        //add Mesh to mesh array
        _circleMeshes.push( eMesh );
        
        //return mesh
        return eMesh;

    };
    
    var createIndicatorMesh = function(){
    
        //********* CREATES INDICATOR CIRCLE *********
        
        //CircleGeometry(radius, segments, thetaStart, thetaLength)
        _indicatorGeom = new THREE.CircleGeometry( 1, _geometryParams.rSegments, 0, TAU );
        _indicatorGeom.rotateY(-Math.PI/2);
        
        //http://stackoverflow.com/questions/20153705/three-js-wireframe-material-all-polygons-vs-just-edges
        // cwg stands for circleWireGeometry
        // cwls stands for circleWireLineSegments
        var cwg = new THREE.EdgesGeometry( _indicatorGeom );
        var cwg_3_4 = new THREE.EdgesGeometry( _indicatorGeom );
        cwg_3_4.scale( 0.75, 0.75, 0.75 );
        var cwg_1_2 = new THREE.EdgesGeometry( _indicatorGeom );
        cwg_1_2.scale( 0.5, 0.5, 0.5 );
        var cwg_1_4 = new THREE.EdgesGeometry( _indicatorGeom );
        cwg_1_4.scale( 0.25, 0.25, 0.25 );

        _indicatorMat = new THREE.LineBasicMaterial( {color: 0x0000ff, linewidth:2, linecap: 'round', linejoin:'round', side: THREE.DoubleSide} );

        var cwls = new THREE.LineSegments( cwg, _indicatorMat );
        var cwls_3_4 = new THREE.LineSegments( cwg_3_4, _indicatorMat );
        var cwls_1_2 = new THREE.LineSegments( cwg_1_2, _indicatorMat );
        var cwls_1_4 = new THREE.LineSegments( cwg_1_4, _indicatorMat );
        
        cwls.add( cwls_3_4 );
        cwls.add( cwls_1_2 );
        cwls.add( cwls_1_4 );
        
        _indicatorMesh = cwls;
        
    };
    
    
    var subsurf = function( $smooth ){
        /*
        if( _smooth > 0){
            _modifier = (_modifier) ? _modifier : new THREE.SubdivisionModifier( _smooth );
            _modifier.modify( _circleMesh.geometry );
        }
        
        */
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
        _circleMesh.translateX(_d);
    };

    this.update = function(){

        TWEEN.update();

    };
    
    
    
    this.moveToIndex = function( $index, $duration ){
        
        // check if $index is in valid range
        if( $index < 0 || $index > _data.length-1){ return 'invalid range'; }
        
        // calculate target position
        var posPercent = $index/(_data.length-1);
        console.log('pp',posPercent);
        
        this.moveToPercent( posPercent );
        
        /*
        //_animationParams.targetY = $index * _geometryParams.stretch;
        _animationParams.targetY = posPercent * _geometryParams.height;
        _animationParams.targetY += _geometryParams.stretch * 0.7;
        
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
        _animationParams.targetY = -$percent * _geometryParams.height;

        // init current Position
        _tweenData.y = _animationParams.previousY = _animationParams.currentY;

        //startTween
        initTween( $duration );
    
    };
    
    
    
    // GETTER + SETTER
    
    this.getIndicator = function(){
        return _indicatorMesh;
    };
    
    this.getCircles = function(){
        return _circleMesh;
    };

    this.getDemoData = function(){
        return [
            {
                label: '1990',
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
                label: '1991',
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
                label: '1992',
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
                label: '1990',
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
                label: '1990',
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


}