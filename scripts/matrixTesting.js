"use strict";

// #--------------- glMatrix LIB ALIASES: ---------------#
// var vec2 = glMatrix.vec2;
// var vec3 = glMatrix.vec3;
// var vec4 = glMatrix.vec4;
// var mat2 = glMatrix.mat2;
// var mat4 = glMatrix.mat4;

function main() 
{
    var canvas = document.getElementById("cc");
    var gl = canvas.getContext("webgl2");
    if (!gl) 
    {
        return;
    }

    // script was deffered, so clientWidth exists and is determined by CSS display width
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    // Now we can set the size of the drawingbuffer to match this
    gl.canvas.width = width;
    gl.canvas.height = height;

    // Use our boilerplate utils to compile the shaders and link into a program
    var program = createProgramFromSources(gl, matrixTestVS, matrixTestFS);

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "vertexPos");

    // look up uniform locations
    var resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
    var timeUniformLocation = gl.getUniformLocation(program, "time");

    var modelUniformLocation = gl.getUniformLocation(program, "model");
    var viewUniformLocation = gl.getUniformLocation(program, "view");

    // Create a buffer
    var positionBuffer = gl.createBuffer();

    // Create a vertex array object (attribute state)
    var vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var testQuad = 
    [
        2.538, 0.606, 1.124,
        1.722, 2.239, 0.307,
        0.307, 2.239, 1.721,
        1.124, 0.606, 2.538
    ];
    var positions = 
    [
        -1, +1, 0,
        -1, -1, 0,
        +1, -1, 0,
        +1, +1, 0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(testQuad), gl.STATIC_DRAW);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer

    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
   

    // -------------- Index Buffer Init --------------
    // create the buffer
    const indexBuffer = gl.createBuffer();
    
    // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        
    // Fill the current element array buffer with data
    const indices = 
    [
        0, 1, 2,
        0, 2, 3
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // #------------------------------------#

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var drawOffset = 0;
    var vertCount = indices.length;
    var indexType = gl.UNSIGNED_SHORT;
    gl.drawElements(primitiveType, vertCount, indexType, drawOffset);

    // ----------------------------------------

    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // -------------- TIME INIT --------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;


    // -------------- Roll Your Own --------------
    var aMat4 = new myMatrix4x4();
    console.log(aMat4.myHardcodedInverse);
    // doesn't matter until it can dynamically change
    //var camPos = [2, 2, 2];


    // -------------- START GAME LOOP --------------
    window.requestAnimationFrame(renderLoop);

    function renderLoop(timeStamp)
    {
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // time update
        let deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        gl.uniform1f(timeUniformLocation, seconds);

        // Let's recreate this
        // let model = mat4.create();
        // mat4.scale(model, model, [0.5, 0.5, 0.5]);
        // mat4.rotateZ(model, model, seconds / 2);

        aMat4.translate([0.3 *  Math.sin(seconds), 0.3 * Math.cos(seconds), 0.]);
        let model = aMat4.matrix;
        let view = aMat4.myHardcodedInverse;
        gl.uniformMatrix4fv(modelUniformLocation, false, model);
        gl.uniformMatrix4fv(viewUniformLocation, false, view);

        // draw
        gl.drawElements(primitiveType, vertCount, indexType, drawOffset);

        // restart game loop
        window.requestAnimationFrame(renderLoop);
    }
}

main();
