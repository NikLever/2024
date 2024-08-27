export class Counter extends THREE.Group{
    static texture;
    static types = { SCORE: 0, TIMER: 1 };

    constructor( scene, pos = new THREE.Vector3(), rot = new THREE.Euler ){
        super();

        this.scale.set( 1.5, 1.5, 1.5 );

        scene.add( this );
        this.position.copy( pos );
        this.rotation.copy( rot );

        if ( Counter.texture == null ){
            const canvas = document.createElement('canvas');

            canvas.width = 1024;
            canvas.height = 64;

            const context = canvas.getContext( '2d' );

            context.fillStyle = "#000";
            context.fillRect( 0, 0, 1024, 64 );

            context.textAlign = "center";
            context.textBaseline = "middle";
            
            context.font = "48px Arial";

            context.fillStyle = "#fff";

            const inc = 1024/12;
            const chars = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", " " ];
            let x = inc/2;

            chars.forEach( char => {
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.rotate( -Math.PI/2 );
                context.translate( 0, x );
                context.fillText( char, -32, 34 );
                x += inc;
            });

            Counter.texture = new THREE.CanvasTexture( canvas );
            Counter.texture.needsUpdate = true;
        }

        const r = 1;
        const h = Math.PI * 2 * r;
        const w = h/12;

        const geometry = new THREE.CylinderGeometry( r, r, w );
        geometry.rotateZ( -Math.PI/2 );
        const material = new THREE.MeshStandardMaterial( { map: Counter.texture } );

        const inc = w * 1.1;
        const xPos = -inc * 2.5;
        const zPos = -r * 0.8;

        for( let i=0; i<5; i++ ){
            const mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( xPos + inc*i, 0, zPos );
            this.add( mesh );
        }

        this.type = Counter.types.SCORE;

        this.displayValue = 0;
        this.targetValue = 0;
    }

    set score(value){
        if ( this.type != Counter.types.SCORE ) this.type = Counter.type.SCORE;
        this.targetValue = value;
    }

    updateScore( ){
        const inc = Math.PI/6;
        let str = String( this.displayValue );
        while ( str.length < 5 ) str = "0" + str;
        const arr = str.split( "" );
        
        this.children.forEach( child => {
            const num = Number(arr.shift());
            if (!isNaN(num)){
                child.rotation.x = -inc*num - 0.4;
            }
        });
    }

    updateTime( ){
        const inc = Math.PI/6;
        let secs = this.displayValue;
        let mins = Math.floor( secs/60 );
        secs -= mins*60;
        let secsStr = String( secs );
        while( secsStr.length < 2 ) secsStr = "0" + secsStr;
        let minsStr = String( mins );
        while( minsStr.length < 2 ) minsStr = "0" + minsStr;
        let timeStr = minsStr + ":" + secsStr;
        let arr = timeStr.split( "" );
        
        this.children.forEach( child => {
            const num = Number(arr.shift());
            if (isNaN(num)){
                child.rotation.x = -inc*10 - 0.4;
            }else{
                child.rotation.x = -inc*num - 0.4;
            }
        });
    }

    set seconds(value){
        if ( this.type != Counter.types.TIMER ) this.type = Counter.types.TIMER;
        this.targetValue = value;
        this.update( 0 );
    }

    get time(){
        let secs = this.targetValue;
        let mins = Math.floor( secs/60 );
        secs -= mins*60;
        let secsStr = String( secs );
        while( secsStr.length < 2 ) secsStr = "0" + secsStr;
        let minsStr = String( mins );
        while( minsStr.length < 2 ) minsStr = "0" + minsStr;
        return minsStr + ":" + secsStr;
    }

    update( dt ){
        if ( this.targetValue != this.displayValue ){
            if ( this.targetValue > this.displayValue ){
                this.displayValue++;
            }else{
                this.displayValue--;
            }
        }

        switch( this.type ){
            case Counter.types.SCORE:
               this.updateScore();
                break;
            case Counter.types.TIMER:
                this.updateTime();
                break
        }
    }
}