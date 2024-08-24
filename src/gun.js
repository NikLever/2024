export class Gun extends THREE.Group{
    constructor(){
        super();

        this.createProxy();
    }

    createProxy(){
        const mat = new THREE.MeshStandardMaterial( { color: 0xAAAA22 } );
        const geo1 = new THREE.CylinderGeometry( 0.01, 0.01, 0.15, 20 );
        const barrel = new THREE.Mesh( geo1, mat ); 
        barrel.rotation.x = -Math.PI/2;
        barrel.position.z = -0.1;

        const geo2 = new THREE.CylinderGeometry( 0.025, 0.025, 0.06, 20 );
        const body = new THREE.Mesh( geo2, mat ); 
        body.rotation.x = -Math.PI/2;
        body.position.set( 0, -0.015, -0.042 );

        const geo3 = new THREE.BoxGeometry( 0.02, 0.08, 0.04 );
        const handle = new THREE.Mesh( geo3, mat ); 
        handle.position.set( 0, -0.034, 0);

        this.add( barrel );
        this.add( body );
        this.add( handle );
    }
}