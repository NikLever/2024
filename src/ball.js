export class Ball{
    static canvas = document.createElement('canvas');
    
    constructor( scene, num, minus = false ){
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

        context.fillRect(0, 0, 256, 128);

        context.fillStyle = "#fff";

        
    }
}