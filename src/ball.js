export class Ball{
    static states = { DROPPING: 1, ROTATE: 2, FIRED: 3, HIT: 4 };
    static canvas = document.createElement('canvas');
    static geometry = new THREE.SphereGeometry( 0.5 );
    
    constructor( scene, num, minus = false, xPos = -1, speed = 0.1 ){
        if (Ball.canvas.width != 256 ){
		    Ball.canvas.width = 256;
            Ball.canvas.height = 128;
        }
        const context = Ball.canvas.getContext('2d');

        if (num == 13){
            context.fillStyle = "#000";
            this.color = 0x000000;
        }else if (minus){
            context.fillStyle = "#f00";
            this.color = 0xFF0000;
        }else{
            context.fillStyle = "#0f0";
            this.color = 0x00FF00;
        }

        this.num = num; 
        this.speed = speed * 60;

        context.fillRect(0, 0, 256, 128);

        context.fillStyle = "#fff";
        context.font = "48px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(String(num), 128, 64 );

        if (minus) this.num *= -1;

        const tex = new THREE.CanvasTexture( Ball.canvas );

        const material = new THREE.MeshStandardMaterial( { map: tex, roughness: 0.1 } );

        this.mesh = new THREE.Mesh( Ball.geometry, material );
        this.mesh.castShadow = true;
        this.mesh.position.set( xPos, 4, -20 );
        this.mesh.rotateY( Math.PI/2 );

        this.state = Ball.states.DROPPING;

        scene.add( this.mesh );

        this.scene = scene;
    }

    hit( game ){
        console.log( "Ball hit" );
        this.game = game;
        game.updateScore( this.num );
        game.SFX.hit();

        this.scene.remove( this.mesh );
        this.state = Ball.states.HIT;
        
        this.group = new THREE.Group();
        this.group.position.copy( this.mesh.position );
        this.scene.add( this.group );

        this.particles = [];

        for( let i=0; i<40; i++ ){
            const particle = new Particle( this );
            this.group.add( particle );
            this.particles.push( particle );
        }
    }

    removeParticle( particle ){
        const index = this.particles.indexOf( particle );
        if (index != -1){
            this.group.remove( particle );
            this.particles.splice( index, 1 );
            if (this.particles.length==0) this.game.removeBall( this );
        }
    }

    update(game, dt){
        switch(this.state){
            case Ball.states.DROPPING:
                this.mesh.position.y -= 0.1;
                if (this.mesh.position.y <= 1.6){
                    this.state = Ball.states.ROTATE;
                    this.mesh.position.y = 1.6;
                }
                break;
            case Ball.states.ROTATE:
                this.mesh.rotateY( -0.1 );
                if (this.mesh.rotation.y < -Math.PI/2.1){
                    this.state = Ball.states.FIRED;
                }
                break;
            case Ball.states.FIRED:
                this.mesh.position.z += this.speed * dt;
                break;
            case Ball.states.HIT:
                this.particles.forEach( particle => { particle.update( this, dt ) })
                break
        }

        if (this.mesh.position.z > 2){
            this.mesh.material.map.dispose();
            if (game) game.removeBall( this, this.num==13 );
        }
    }
}

class Particle extends THREE.Mesh{
    static geometry = new THREE.IcosahedronGeometry( 0.08, 1 );

    constructor( ball ){
        super( Particle.geometry, new THREE.MeshStandardMaterial( { color: ball.color }) );

        this.dir = new THREE.Vector3( ball.game.random( -1, 1 ), ball.game.random( -1, 1 ), ball.game.random( -1, 1 ) );
        this.dir.normalize();
        this.position.copy( this.dir ).multiplyScalar( 0.45 );

        this.time = 0;
        this.lifeTime = ball.game.random( 0.5, 1.5 );
        this.down = 0;
    }

    update( ball, dt ){
        this.position.add( this.dir.clone().multiplyScalar( dt ));
        this.position.y -= this.down * dt;
        this.down += 0.1;

        this.time += dt;
        if (this.time > this.lifeTime) ball.removeParticle( this );
    }
}