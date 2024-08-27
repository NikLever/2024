import { Ball } from "./ball.js";

export class Bullet{
    constructor( game, controller ){
        const geo1 = new THREE.CylinderGeometry( 0.008, 0.008, 0.07, 16 );
        geo1.rotateX( -Math.PI/2 );
        const material = new THREE.MeshBasicMaterial( { color: 0xFFAA00  });
        const mesh = new THREE.Mesh( geo1, material );

        const v = new THREE.Vector3();
        const q = new THREE.Quaternion();

        mesh.position.copy( controller.getWorldPosition( v ) );
        mesh.quaternion.copy( controller.getWorldQuaternion( q ) );

        game.scene.add( mesh );
        this.tmpVec = new THREE.Vector3();
        this.tmpVec2 = new THREE.Vector3();

        this.mesh = mesh;
        this.game = game;
    }

    update( dt ){
        let dist = dt * 15;
        let count = 0;

        while(count<1000){

            count++;
            if (dist > 0.5){
                dist -= 0.5;
                this.mesh.translateZ( -0.5 );
            }else{
                this.mesh.translateZ( -dist );
                dist = 0;
            }

            this.mesh.getWorldPosition( this.tmpVec );

            let hit = false;

            this.game.balls.forEach( ball => {
                if (!hit){
                    if (ball.state == Ball.states.FIRED ){
                        ball.mesh.getWorldPosition( this.tmpVec2 );
                        const offset = this.tmpVec.distanceTo( this.tmpVec2 );
                        if ( offset < 0.5 ){
                            hit = true;
                            ball.hit(this.game );
                            this.game.removeBullet( this );
                        }
                    }
                }
            });

            if (dist==0 || hit) break;
        }

        this.mesh.translateZ( dt * -2 );

        if ( this.mesh.position.length() > 20 ) this.game.removeBullet();
    }
}