export function onSingleTouchStart( event: any ) {
    let startX = event.touches[0].pageX
    let startY = event.touches[0].pageY;
    return { startX, startY }
}

export function onSingleTouchMove( event: any, camera: any, startX: number, startY: number, speed: number ) {
    let deltaX = (event.touches[0].pageX - startX);
    let deltaY = (event.touches[0].pageY - startY);
    // camera.position.x += deltaX * speed
    camera.position.y += deltaY * speed
}

export function onDoubleTouchStart( event: any ) {
    let startZoom = event.touches[0].pageY;
    let startDist = Math.abs(event.touches[0].pageY - event.touches[1].pageY);
    return { startZoom, startDist }
}

export function onDoubleTouchMove( event: any, camera: any, startZoom: number, startDist: number, speed: number ) {
    let offsetZoom = Math.abs(event.touches[0].pageY - startZoom);
    let deltaDistance = Math.abs(event.touches[0].pageY - event.touches[1].pageY) - startDist;
    if (deltaDistance > 0){
        // zoom in
        let delta = offsetZoom * speed;
        if (camera.position.z >= -1 || (camera.position.z + delta) >= -1 ) {
            camera.position.z = -1
        } else {
            camera.position.z += delta;
        }
    } else if (deltaDistance < 0){
        // zoom out
        let delta = offsetZoom * speed;
        if (camera.position.z <= -100 || (camera.position.z - delta) <= -100) {
            camera.position.z = -100
        } else {
            camera.position.z -= delta;
        }
    }
}

/**
 * @summary Touch Helper ###############################################################################################
 */

/*
function onSingleTouchStart(event) {
    startX = event.touches[0].pageX
    startY = event.touches[0].pageY;
}

function onSingleTouchMove(event) {
    let deltaX = (event.touches[0].pageX - startX);
    let deltaY = (event.touches[0].pageY - startY);
    // camera.position.x += deltaX * speed
    camera.position.y += deltaY * speed

}

function onDoubleTouchStart(event) {
    startZoom = event.touches[0].pageX;
    startDist = Math.abs(event.touches[0].pageX - event.touches[1].pageX);
}

function onDoubleTouchMove(event) {
    let offsetZoom = Math.abs(event.touches[0].pageX - startZoom);
    let deltaDistance = Math.abs(event.touches[0].pageX - event.touches[1].pageX) - startDist;
    if (deltaDistance > 0){
        // zoom in
        let delta = offsetZoom * speed;
        if (camera.position.z >= -1 || (camera.position.z + delta) >= -1 ) {
            camera.position.z = -1
        } else {
            camera.position.z += delta;
        }
    } else if (deltaDistance < 0){
        // zoom out
        let delta = offsetZoom * speed;
        if (camera.position.z <= -100 || (camera.position.z - delta) <= -100) {
            camera.position.z = -100
        } else {
            camera.position.z -= delta;
        }
    }
}

function touchListener() {
    renderer.domElement.addEventListener( 'touchstart', function (event) {
        let touches = event.touches;
        // noinspection EqualityComparisonWithCoercionJS
        if (touches && touches.length == 1) {
            onSingleTouchStart(event);
        } else if (touches && touches.length >= 2) {
            onDoubleTouchStart(event);
        }
    }, false);

    renderer.domElement.addEventListener( 'touchmove', function (event) {
        let touches = event.touches;
        // noinspection EqualityComparisonWithCoercionJS
        if (touches && touches.length == 1) {
            onSingleTouchMove(event);
        } else if (touches && touches.length >= 2) {
            onDoubleTouchMove(event);
        }
    }, false);
}
*/
