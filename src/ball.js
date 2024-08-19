export class Ball{
    static states = { DROPPING: 1, ROTATE: 2, FIRED: 3 };
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
        }else if (minus){
            context.fillStyle = "#f00";
        }else{
            context.fillStyle = "#0f0";
        }

        this.num = num; 
        this.speed = speed;

        context.fillRect(0, 0, 256, 128);

        context.fillStyle = "#fff";
        context.font = "48px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(String(num), 128, 64 );

        const tex = new THREE.CanvasTexture( Ball.canvas );

        const material = new THREE.MeshStandardMaterial( { map: tex, roughness: 0.1 } );

        this.mesh = new THREE.Mesh( Ball.geometry, material );
        this.mesh.position.set( xPos, 4, -20 );
        this.mesh.rotateY( Math.PI/2 );

        this.state = Ball.states.DROPPING;

        scene.add( this.mesh )
    }

    update(game){
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
                console.log( this.mesh.rotation.y );
                if (this.mesh.rotation.y < -Math.PI/2.1){
                    this.state = Ball.states.FIRED;
                }
                break;
            case Ball.states.FIRED:
                this.mesh.position.z += this.speed;
                break;
        }

        if (this.mesh.position.z > 2){
            this.mesh.material.map.dispose();
            if (game) game.removeBall( this );
        }
    }
}