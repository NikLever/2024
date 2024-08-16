import { VRButton } from './VRButton.js';

class App{

	constructor(){
        const debug = false;

		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 200 );

		this.camera.position.set( 5.3, 10.5, 20 );
        this.camera.quaternion.set( -0.231, 0.126, 0.03, 0.964);
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x050505 );

		this.scene.add( new THREE.HemisphereLight( 0xffffff, 0x404040, 1.5) );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

       const light = new THREE.DirectionalLight(0xFFFFFF, 2);
       light.position.set(1,3,3);
       this.scene.add(light);
        
		container.appendChild( this.renderer.domElement );
        
        this.initScene();

        this.tmpVec = new THREE.Vector3();
        this.tmpEuler = new THREE.Euler();
        this.tmpMat4 = new THREE.Matrix4();
        this.raycaster = new THREE.Raycaster();

        this.force = new THREE.Vector3();
        this.speed = 3;
        //this.sfxInit = true;
        //this.useHeadsetOrientation = false;

        if (debug){
            this.debugControls = new DebugControls(this );
        }

        //this.setupVR();
        
        window.addEventListener('resize', this.resize.bind(this) );

        this.renderer.setAnimationLoop( this.render.bind(this) );
	}	

    startGame(){
        this.state = App.STATES.PLAYING;
        this.gameTime = 0;
        this.startTime = this.clock.elapsedTime;
        const panel = document.getElementById('openingPanel');
        panel.style.display = 'none';
        this.sfx.ball.play();
    }

    gameOver(options){
        if (options){
            const panel = document.getElementById('gameoverPanel');
            const details = document.getElementById('details');
            switch( options.state ){
                case App.STATES.DEAD:
                    details.innerHTML = `<P>You ran out of life ${this.player.position.distanceTo(this.grail.position).toFixed(0)} metres away from the Holy Grail</p>`
                    break;
                case App.STATES.COMPLETE:
                    const tm = this.clock.elapsedTime - this.startTime;
                    details.innerHTML = `<p>Congratulations</p><p>You found the grail in ${tm.toFixed(2)} seconds</p><p>Can you do better</p>`;
                    break;
            }
            panel.style.display = 'block';
        }
       
        this.vrButton.endSession();
    }

    random( min, max ){
        return Math.random() * (max-min) + min;
    }
    
    initScene(){

		this.scene.background = new THREE.Color( 0x0a0a0a );
		this.scene.fog = new THREE.Fog( 0x0a0a0a, 50, 100 );
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
            this.sfx.ball.play();
        }
        
        function onSelectStart() {
            scope.knight.playAnim('drawaction');    
        }

        function onSelectEnd() {
            scope.knight.stopAnims();    
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
        

        this.dolly = new THREE.Group();
        this.root = new THREE.Group();
        this.root.position.y = -3.4;
        this.dolly.add( this.root );

        this.controllers = [];

        for (let i=0; i<=1; i++){
            const controller = this.renderer.xr.getController( i );
            controller.addEventListener( 'selectstart', onSelectStart );
            controller.addEventListener( 'selectend', onSelectEnd );
            controller.addEventListener( 'squeezestart', onSqueezeStart );
            controller.addEventListener( 'squeezeend', onSqueezeEnd );
            controller.addEventListener( 'connected', ( event ) => {
                const mesh = this.buildController(event.data, i);
                mesh.scale.z = 0;
                controller.add( mesh );
                controller.gamepad = event.data.gamepad;
                controller.handedness = event.data.handedness;
                //console.log(`controller connected ${controller.handedness}`);
            } );
            
            controller.addEventListener( 'disconnected', function () {
                const grip = this.children[0];
                if (grip && grip.children && grip.children.length>0){
                    if (grip.children[0].isMesh) grip.children[0].geometry.dispose();
                    this.remove( grip );
                }
            } );

            this.root.add( controller );

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

	render( time, frame ) {  
        const dt = this.clock.getDelta();

        if (this.renderer.xr.isPresenting){
            this.gameTime += dt;
        }else{
            
        }
       
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };

window.app = new App();  