class Minimap {
    //3 coordinates per position = 3 floats
    COORDINATES = 3;
 
    constructor(resources) {
        this.width = 200;  //width of minimap
        this.height = 200; //height of minimap
        //--gl.canvas = browser window to find x and y for minimap screen
        this.x = gl.canvas.clientWidth -  this.width; //x coordinate of minimap 
        this.y = gl.canvas.clientHeight - this.height; //y coordinate of minimap
        this.size = 20; //size of scene in minimap
        
        this.program = createProgram(gl, resources.vs_minimap, resources.fs_minimap);
        this.buffer = gl.createBuffer();
      
        this.currentPosition = new Float32Array(30000);
        this.counter = 0;
    }
   
   getPosition() {
    let cameraPosition;

        if (camera.control.enabled) {
        cameraPosition = cameraPos;
        } else {
        cameraPosition = vec3.transformMat4(vec3.create(), vec3.fromValues(0, 0, 0), camera.matrix);
        }
        this.positions[this.counter] = cameraPosition?.[0];
        this.positions[this.counter + 1] = cameraPosition?.[1];
        this.positions[this.counter + 2] = cameraPosition?.[2];

        this.counter = (this.counter + this.COORDINATES) % this.positions.length;
      }
  
      /**
       * @returns {Float32Array} array of points
       */
      get positions() {
          return this.currentPosition;
      }
  
      /**
       * set positions
       */
      set positions(value) {
          this.currentPosition = value;
      }
  
      /**
       * @returns {number} returns amount of positions in buffer
       */
      get currSize() {
          return (this.buffer_full === true) ?  
              this.positions.length / this.COORDINATES
              : this.counter / this.COORDINATES;
      }

    
    cameraPath(context) {
        context.gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
        
        //give matrix to shader
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_projection"), false, context.projectionMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_modelView"), false, context.viewMatrix);
        
        //get position
        const attribPosition = gl.getAttribLocation(this.program, 'a_position');

        gl.enableVertexAttribArray(attribPosition);
        gl.vertexAttribPointer(attribPosition, this.COORDINATES, gl.FLOAT, false, 0, 0);

        //render array 
        var currentSize;
        if (this.buffer_full === true) {
            currentSize= this.positions.length / this.COORDINATES;
          } else {
            currentSize= this.counter / this.COORDINATES;
          }
          
        gl.drawArrays(gl.LINE_STRIP, 0, currentSize);
    }

    render(context) {
        //get position into buffer
        this.getPosition();

        //set viewport
        gl.viewport(this.x, this.y, this.width, this.height);
        //everthing outside should be rejected
        gl.enable(gl.SCISSOR_TEST);
        //draw only to minimap
        gl.scissor(this.x, this.y, this.width, this.height);
        gl.clearColor(0.9, 0.9, 0.9, 1.0); //light color
        //clear the buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //view matrix
        context.viewMatrix =  mat4.fromValues(
            -1,0,0,0, // x direction
            0,0,1,0,  // y direction
            0, 1,0,0, // z direction
            3,-18, -99,1); //positon
        //projection matrix
        context.projectionMatrix = mat4.ortho(mat4.create(),-this.size,this.size,-this.size,this.size,-10,100);
        
        //render minimap
        root.render(context);
        this.cameraPath(context);
        //do not cut away the outside of the minimap - show scene of main
        gl.disable(gl.SCISSOR_TEST);
    }
}