let history = [];
let zhistory = [];

function handleDeviceMotion(event) {
    
    //const acceleration = event.accelerationIncludingGravity;
    const acceleration = event.acceleration;

    const accelerationZ = acceleration.z.toPrecision(1);
    const accelerationX = acceleration.x.toPrecision(2);
    const accelerationY = acceleration.y.toPrecision(2);
    /*
    const zPercent = accelerationZ / 10 * 100;
    const xPercent = accelerationX / 10 * 100;
    const yPercent = accelerationY / 10 * 100;
    */

    //    history.unshift(`${accelerationZ} ${accelerationX} ${accelerationY}`);
    //    history.unshift(`${zPercent} ${xPercent} ${yPercent}`);
    //    history = history.slice(0,100);

    const container = document.getElementById('acceleration-container');
    
    //container.innerHTML = `Acceleration: ${direction} <hr/>`;

    const accelpercentage = (10+parseFloat(accelerationZ))/20*100;
    const direction = (accelpercentage > 60 ? 'up' : (accelpercentage < 40 ? 'down' : '-'))
    zhistory.unshift(direction);
    zhistory = zhistory.slice(0,100);
    
    const upIndex = zhistory.indexOf('up');
    const downIndex = zhistory.indexOf('down');

    finalDirection = 'static';
    if(upIndex > -1 &&  downIndex >-1) {
        if(downIndex > upIndex) {
            finalDirection = 'up';
        } else {
            finalDirection = 'down';
        }
    }

    const debug = JSON.stringify(finalDirection);

    button = direction;
    html = debug+'<hr/>';

    html += `Z:${accelerationZ}<div style="background-color: grey;width:100%;"><div style="background-color:red; height:30px;width:${accelpercentage}%"></div></div><hr/>`;
    //html += `X:${accelerationX}<div style="background-color: grey;width:100vw;"><div style="background-color:red; height:30px;width:${Math.floor(xPercent)}%"></div></div><hr/>`;
    //html += `Y:${accelerationY}<div style="background-color: grey;width:100vw;"><div style="background-color:red; height:30px;width:${Math.floor(yPercent)}%"></div></div><hr/>`;
//    html += zhistory.unique().join(',')+'<br/>';

    html += zhistory.join(`<br/>`);
    
    container.innerHTML = html;
    
}

window.addEventListener('devicemotion', handleDeviceMotion);
/*
handleDeviceMotion({acceleration:{z:-5,x:0,y:0}});
handleDeviceMotion({acceleration:{z:-5,x:0,y:0}});
handleDeviceMotion({acceleration:{z:-5,x:0,y:0}});
handleDeviceMotion({acceleration:{z:5,x:0,y:0}});
handleDeviceMotion({acceleration:{z:5,x:0,y:0}});
handleDeviceMotion({acceleration:{z:5,x:0,y:0}});

handleDeviceMotion({acceleration:{z:-5,x:0,y:0}});
handleDeviceMotion({acceleration:{z:-5,x:0,y:0}});
handleDeviceMotion({acceleration:{z:-5,x:0,y:0}});
*/
/*setInterval(()=> {
    handleDeviceMotion({acceleration:{z:-5,x:0,y:0}});
},500);
*/
