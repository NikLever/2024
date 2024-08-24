import { VRButton } from './VRButton.js';
import { Proxy } from './proxy.js';
import { Ball } from './ball.js';
import { Gun } from './gun.js';
import { Bullet } from './bullet.js';

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
        this.bullets = [];
        this.score = 0;
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

        count = 0;
        while( this.bullets.length > 0 ){
            count++;
            if (count>1000) break;
            this.removeBullet( this.bullets[0] );
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

        const scope = this;

        button.onClick = () => {
            //this.sfx.ball.play();
        }
        
        function onSelect() {
            console.log(`BulletTime:${this.userData.bulletTime.toFixed(2)}`);
            if (this.userData.bulletTime > 0.25 ){
                this.userData.bulletTime = 0;
                scope.bullets.push( new Bullet( scope, this ) );
            }   
        }

        function onSqueeze() { 
        }

        this.renderer.xr.addEventListener( 'sessionend', function ( event ) {
            scope.resetGame();
        } );

        this.renderer.xr.addEventListener( 'sessionstart', function ( event ) {
            scope.startGame();
        } );

        this.controllers = [];

        for (let i=0; i<=1; i++){
            const controller = this.renderer.xr.getController( i );
            this.scene.add( controller );

            controller.addEventListener( 'select', onSelect );
            controller.addEventListener( 'squeeze', onSqueeze );
            controller.addEventListener( 'connected', ( event ) => {
                event.target.add( new Gun() );
                event.target.handedness = event.data.handedness;
                event.target.userData.bulletTime = 0.5;
                this.controllers.push( event.target );   
            } );
            
            controller.addEventListener( 'disconnected', function () {
                
            } );

        }

    }
    
    handleController( controller, dt ){
        if (controller.handedness == 'right'){
            
        }else if (controller.handedness == 'left'){
            
        }
    }

    updateScore( num ){
        this.score += num;
        if (this.score < 0) this.score = 0;
        console.log(`Update score ${num} ${this.score}`);
    }

    removeBall( ball ){
        const index = this.balls.indexOf( ball );
        if (index != -1){
            ball.mesh.material.map.dispose();
            this.scene.remove( ball.group );
            this.balls.splice( index, 1 );
            //if (ball.num == 13) this.gameOver();
        }
    }

    removeBullet( bullet ){
        const index = this.bullets.indexOf( bullet );
        if (index != -1){
            this.scene.remove( bullet.mesh );
            this.bullets.splice( index, 1 );
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
                this.balls.forEach( ball => ball.update( this, dt ) );
            }
            this.controllers.forEach( controller => {
                if ( controller && controller.userData && controller.userData.bulletTime!=undefined){
                    controller.userData.bulletTime += dt;
                }
            });
            if (this.bullets && this.bullets.length > 0){
                this.bullets.forEach( bullet => bullet.update( dt ) );
            }
        }
       
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };

window.app = new App();  