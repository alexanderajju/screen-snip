
import React, { useEffect,useState } from 'react';
import html2canvas from 'html2canvas';
import './App.css';


function ScreenSnip(props) {

  const [screen,setScreen]=useState({
        on: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        crossHairsTop: 0,
        crossHairsLeft: 0,
        isMouseDown: false,
        windowWidth: 0,
        windowHeight: 0,
        borderWidth: 0,
        cropPositionTop: 0,
        cropPositionLeft: 0,
        cropWidth: 0,
        cropHeigth: 0,
        imageURL: '',


    })


  const handleWindowResize = () => {
    const windowWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const windowHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

      setScreen({...screen,
      windowWidth,
      windowHeight,
    });
return (windowWidth,
windowHeight)
  };

    useEffect(()=>{
      handleWindowResize();
    window.removeEventListener('resize', handleWindowResize);

    return()=>{
        window.removeEventListener('resize', handleWindowResize);
    }
    },[])


  const handStartCapture = () => setScreen({...screen,on:true});

  const handleMouseMove = (e) => {
      console.log(e)
    const {
      isMouseDown,
      windowWidth,
      windowHeight,
      startX,
      startY,
      borderWidth
    } = screen;
    let cropPositionTop = startY;
    let cropPositionLeft = startX;
    const endX = e.clientX;
    const endY = e.clientY;
    const isStartTop = endY >= startY;
    const isStartBottom = endY <= startY;
    const isStartLeft = endX >= startX;
    const isStartRight = endX <= startX;
    const isStartTopLeft = isStartTop && isStartLeft;
    const isStartTopRight = isStartTop && isStartRight;
    const isStartBottomLeft = isStartBottom && isStartLeft;
    const isStartBottomRight = isStartBottom && isStartRight;
    let newBorderWidth = borderWidth;
    let cropWidth = 0;
    let cropHeigth = 0;

    if (isMouseDown) {
      if (isStartTopLeft) {
        newBorderWidth = `${startY}px ${windowWidth - endX}px ${windowHeight -
          endY}px ${startX}px`;
        cropWidth = endX - startX;
        cropHeigth = endY - startY;
      }

      if (isStartTopRight) {
        newBorderWidth = `${startY}px ${windowWidth - startX}px ${windowHeight -
          endY}px ${endX}px`;
        cropWidth = startX - endX;
        cropHeigth = endY - startY;
        cropPositionLeft = endX;
      }

      if (isStartBottomLeft) {
        newBorderWidth = `${endY}px ${windowWidth - endX}px ${windowHeight -
          startY}px ${startX}px`;
        cropWidth = endX - startX;
        cropHeigth = startY - endY;
        cropPositionTop = endY;
      }

      if (isStartBottomRight) {
        newBorderWidth = `${endY}px ${windowWidth - startX}px ${windowHeight -
          startY}px ${endX}px`;
        cropWidth = startX - endX;
        cropHeigth = startY - endY;
        cropPositionLeft = endX;
        cropPositionTop = endY;
      }
    }
    
    cropWidth *= window.devicePixelRatio;
    cropHeigth *= window.devicePixelRatio;

    setScreen({...screen,
      crossHairsTop: e.clientY,
      crossHairsLeft: e.clientX,
      borderWidth: newBorderWidth,
      cropWidth,
      cropHeigth,
      cropPositionTop: cropPositionTop,
      cropPositionLeft: cropPositionLeft,
    });
  };

  let handleMouseDown = (e) => {
    const startX = e.clientX;
    const startY = e.clientY;

    setScreen(prevState => ({...screen,
      startX,
      startY,
      cropPositionTop: startY,
      cropPositionLeft: startX,
      isMouseDown: true,
      borderWidth: `${prevState.windowWidth}px ${prevState.windowHeight}px`,
    }));
  };

  let handleMouseUp = () => {
    handleClickTakeScreenShot();
    setScreen({...screen,
      on: false,
      isMouseDown: false,
      borderWidth: 0,
    });
  };

 const handleClickTakeScreenShot = () => {
    const {
      cropPositionTop,
      cropPositionLeft,
      cropWidth,
      cropHeigth,
    } = screen
    const body = document.querySelector('body');

    if (body) {
      html2canvas(body).then(canvas => {
        const croppedCanvas = document.createElement('canvas');
        const croppedCanvasContext = croppedCanvas.getContext('2d');

        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeigth;
        
        if (croppedCanvasContext) {
          croppedCanvasContext.drawImage(
            canvas,
            cropPositionLeft,
            cropPositionTop,
            cropWidth,
            cropHeigth,
            0,
            0,
            cropWidth,
            cropHeigth,
          );
        }
        
        if (croppedCanvas) {
          props.endCapture(croppedCanvas.toDataURL());
        }
      });
    }

    setScreen({...screen,
      crossHairsTop: 0,
      crossHairsLeft: 0,
    });
  };

 const renderChild = () => {
    const { children } = props;
    // console.log(typeof(children))
    const prop = {
      capture: handStartCapture
    };

    if (typeof(children) === 'function') {
      return children(prop);
    }

    return children;
    // return ""
  };

    const {
      on,
      crossHairsTop,
      crossHairsLeft,
      borderWidth,
      isMouseDown,
    } = screen;
    
    if (!on) {
      return renderChild();
    }
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {renderChild()}
        <div
          className={`overlay ${isMouseDown && 'highlighting'}`}
          style={{ borderWidth: `${borderWidth}` }}
        />
        <div
          className='crosshairs'
          style={{left: crossHairsLeft + 'px', top: crossHairsTop + 'px'}}
        />
      </div>
    );
  
}
export {ScreenSnip};

