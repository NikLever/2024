import { VRButton } from './VRButton.js';
import { Proxy } from './proxy.js';
import { Ball } from './ball.js';

class App{
    static states = { INTRO: 1, GAME: 2, OVER: 3 }

	constructor(){
        const debug = false;

		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 200 );

		this.camera.position.set( 0, 1.3, 0 );
        
		this.scene = new THREE.Scene();
    
		this.scene.add( new THREE.HemisphereLight( 0xffffff, 0x404040, 1.5) );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

       const light = new THREE.DirectionalLight(0xFFFFFF, 3);
       light.position.set(1,3,3);
       this.scene.add(light);
        
		container.appendChild( this.renderer.domElement );
        
        this.initScene();

        this.tmpVec = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();

        this.setupVR();
        
        window.addEventListener('resize', this.resize.bind(this) );

        this.renderer.setAnimationLoop( this.render.bind(this) );
	}	

    startGame(){
        this.state = App.states.GAME;
        this.gameTime = 0;
        this.ballTime = 2.5;
        this.ballCount = 0;
        this.startTime = this.clock.elapsedTime;
        this.newBallTime = 3;
        this.balls = [];
        const panel = document.getElementById('openingPanel');
        panel.style.display = 'none';
       // this.sfx.ball.play();
    }

    gameOver(dead = true){
        const panel = document.getElementById('gameoverPanel');
        const details = document.getElementById('details');

        if (dead){
            details.innerHTML = `<P>You let a Ball 13 get passed you.</p>`
        }else{
            
        }
        panel.style.display = 'block';

        let count = 0;

        while( this.balls.length > 0 ){
            count++;
            if (count>1000) break;
            this.removeBall( this.balls[0] );
        }

        this.vrButton.endSession();

        this.state = App.states.OVER;
    }

    random( min, max, int = false ){
        let value = Math.random() * (max-min) + min;
        if (int) value = Math.floor( value );
        return value;
    }
    
    initScene(){
        this.proxy = new Proxy( this.scene );

		this.scene.background = new THREE.Color( 0x666666 );
		this.scene.fog = new THREE.Fog( 0x0a0a0a, 20, 50 );
    } 
    
    loadSound( snd, listener, vol=0.5, loop=false ){
        // create a global audio source
        const sound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( snd, ( buffer ) => {  
            sound.setBuffer( buffer );
            sound.setLoop(loop);
            sound.setVolume(vol);
        });

        return sound;
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }

    resetGame(){
        
    }

    setupVR(){
        this.renderer.xr.enabled = true;
        
        const button = new VRButton( this.renderer );
        this.vrButton = button;

        button.onClick = () => {
            //this.sfx.ball.play();
        }
        
        function onSelectStart() {
            //scope.knight.playAnim('drawaction');    
        }

        function onSelectEnd() {
           // scope.knight.stopAnims();    
        }

        function onSqueezeStart() {
            //scope.knight.playAnim('switchaction');  
        }

        function onSqueezeEnd() {
            //scope.knight.stopAnims();    
        }

        const scope = this;

        this.renderer.xr.addEventListener( 'sessionend', function ( event ) {
            scope.resetGame();
        } );

        this.renderer.xr.addEventListener( 'sessionstart', function ( event ) {
            scope.startGame();
        } );

        this.controllers = [];

        for (let i=0; i<=1; i++){
            const controller = this.renderer.xr.getController( i );
            controller.addEventListener( 'selectstart', onSelectStart );
            controller.addEventListener( 'selectend', onSelectEnd );
            controller.addEventListener( 'squeezestart', onSqueezeStart );
            controller.addEventListener( 'squeezeend', onSqueezeEnd );
            controller.addEventListener( 'connected', ( event ) => {
                /*const mesh = this.buildController(event.data, i);
                mesh.scale.z = 0;
                controller.add( mesh );
                controller.gamepad = event.data.gamepad;
                controller.handedness = event.data.handedness;*/
                //console.log(`controller connected ${controller.handedness}`);
            } );
            
            controller.addEventListener( 'disconnected', function () {
                /*const grip = this.children[0];
                if (grip && grip.children && grip.children.length>0){
                    if (grip.children[0].isMesh) grip.children[0].geometry.dispose();
                    this.remove( grip );
                }*/
            } );

            //this.root.add( controller );

            /*const grip = this.renderer.xr.getControllerGrip( i );
            grip.add( this.buildGrip( ) );
            controller.add( grip );*/

            this.controllers.push({controller});// grip});
        }

    }
    
    /*buildGrip(){
        const geometry = new THREE.CylinderGeometry(0.02, 0.015, 0.12, 16, 1);
        geometry.rotateX( -Math.PI/2 );
        const material = new THREE.MeshStandardMaterial( { color: 0xdddddd, roughness: 1 } );
        return new THREE.Mesh(geometry, material);
    }*/

    buildController( data ) {
        let geometry, material;
        
        

    }
    
    handleController( controller, dt ){
        if (controller.handedness == 'right'){
            
        }else if (controller.handedness == 'left'){
            
        }
    }

    removeBall( ball ){
        const index = this.balls.indexOf( ball );
        if (index != -1){
            ball.mesh.material.map.dispose();
            this.scene.remove( ball.mesh );
            this.balls.splice( index, 1 );
            if (ball.num == 13) this.gameOver();
        }
    }

    newBall(){
        this.ballTime = 0;
        this.ballCount++;

        const speed = Math.min(0.05 + 0.01 * this.ballCount, 0.3);
        let xPos = 1;

        if ( this.ballCount > 50 ){
            const r1 = Math.random();
            if (r1>0.7){
                xPos += 4;
            }else if (r1>0.3){
                xPos += 2;
            }
        }else if (this.ballCount > 10){
            if (Math.random()>0.5) xPos += 2;
        }

        if (Math.random()>0.5) xPos *= -1;


        if (this.newBallTime>0.8) this.newBallTime -= 0.05;
        const rand = Math.random();

        let num;
        const minus = Math.random() > 0.7;
        const scores = [ 10, 25, 50, 100, 250, 500 ];

        if ( rand > 0.9){
            num = 13;
        }else{
            num = scores[ this.random( 0, scores.length, true ) ];
        }

        return new Ball( this.scene, num, minus, xPos, speed )
    }

	render( time, frame ) {  
        const dt = this.clock.getDelta();

        if ( this.state == App.states.GAME ){
            this.gameTime += dt;
            this.ballTime += dt;
            if (this.ballTime > this.newBallTime){
                this.balls.push( this.newBall() );
            }
            if ( this.balls && this.balls.length > 0 ){
                this.balls.forEach( ball => ball.update( this ) );
            }
        }
       
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };

window.app = new App();  