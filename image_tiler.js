// Onload scripts

window.onload = function(){
    //// Setting up the file reader ////
    if(window.File && window.FileList && window.FileReader){
        image_input = document.getElementById("image_entry")

        image_input.addEventListener("change", function(event){
            // Image Lists
            images = []
            image_dims = []
            images_existing = 0
            cur_image = 0
            images_complete = 0

            // File List
            files = event.target.files
            console.log(files)
            files_complete = 0
            
            // Image creation loop
            for(i = 0; i < files.length; i+=1){
                file = files[i]

                // We only want images
                if(file.type.match('image')){
                    images_existing += 1
                    cur_image += 1
                    files_complete += 1


                    picReader = new FileReader();
                    picReader.addEventListener('load', function(kr){return function(event){
                        // Adding this image to the list
                        picFile = event.target
                        img = new Image()
                        images.push(img)
                        image_dims.push(0)

                        img.onload = (function(nr){return function(){
                            console.log(nr, images[nr])
                            image_dims[nr] = [images[nr].width, images[nr].height]
                            images_complete += 1

                            // Generate the canvas image
                            if(files_complete == files.length && images_complete == images_existing){
                                generateCanvasImage()
                            }
                        }}(kr-1));
                        img.src = picFile.result
                    }}(cur_image));
                    picReader.readAsDataURL(file)
                }

                else{
                    files_complete += 1
                }
            }
        })
    }
    else{
        this.console.log("Whoops, your browser doesn't support the file API")
    }
    
    //// Setting up the canvas options ////
    // Canvas Options
    width_entry = document.getElementById("width_entry")
    height_entry = document.getElementById("height_entry")
    
    // Reset Button
    reset_canvas_button = document.getElementById("reset_canvas_button")
    reset_canvas_button.addEventListener("click", function(){
        canvas.width = width_entry.value
        canvas.height = height_entry.value
    })



    //// Actually generating the canvas image ////
    function generateCanvasImage(){
        // What's our canvas?
        canvas = document.getElementById("tiledImage")
        ctx = canvas.getContext("2d")

        //// Properly adding an image to the canvas with overlap ////
        function addImage(image_index, x, y){
            ctx.drawImage(images[image_index], x, y)

            // Bounds checking
            if(x + image_dims[image_index][0]-1 >> canvas.width){
                // Finding the new x co-ordinate we start at, and printing to the canvas
                new_x = x-canvas.width
                ctx.drawImage(images[image_index], new_x, y)

                // What if both bounds are violated?
                if(y + image_dims[image_index][1]-1 >= canvas.height){
                    new_y = y-canvas.height
                    ctx.drawImage(images[image_index], new_x, new_y)
                }
            }
            if(y + image_dims[image_index][1]-1 >= canvas.height){
                new_y = y-canvas.height
                ctx.drawImage(images[image_index], x, new_y)
            }
        }

        //// Baseline background for the canvas ////
        // Finding the image with the smallest x co-ord as a proxy for finding the smallest image
        smallest_ind = -1
        smallest_width = Infinity
        for(i = 0; i < images.length; i += 1){
            if(image_dims[i][0] <= smallest_width){
                smallest_ind = i
            }
        }

        // Tiling that smallest image across the plane
        for(i = 0; i < Math.ceil(canvas.width/image_dims[smallest_ind][0]); i += 1){
            for(j = 0; j < Math.ceil(canvas.width/image_dims[smallest_ind][1]); j += 1){
                addImage(smallest_ind, i*image_dims[smallest_ind][0], j*image_dims[smallest_ind][1])
            }
        }

        //// Adding random images to the canvas ////
        for(i = 0; i < 1000; i += 1){
            // Random generation of image and coordinate
            image_index = Math.floor(Math.random()*images.length)
            x = Math.floor(Math.random()*canvas.width)
            y = Math.floor(Math.random()*canvas.height)

            // Placing the image
            addImage(image_index, x, y)
        }
        

    }
}