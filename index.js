import { ARViewer } from './arsdk.js';

function showMessage(message, duration = 3000) {
    const notification = document.getElementById('arNotification');
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

export function launchSDK(mindFile, modelFile) {
    
    if (!mindFile || !modelFile) {
      alert('Mind file or model file missing!');
      return;
    }
  
    const arViewer = new ARViewer({
      mindFile,
      modelFile,
  
      onSDKInitialized: () => {
        showMessage('SDK has been initialized');
        enableModelControls();
      },
      onSDKPaused: () => {
        showMessage('SDK has been paused (browser minimized)');
      },
      onSDKResumed: () => {
        showMessage('SDK has resumed (browser restored)');
      },
      onSDKClosed: () => {
        showMessage('SDK has been closed');
      },
      onTargetFound: () => {
        showMessage('Target found!');
      },
      onTargetLost: () => {
        showMessage('Target lost!');
      }
    });
  
    arViewer.initialize();
  
    // Close SDK and navigate back to the previous page when the close button is clicked
    document.getElementById('close-sdk-button').addEventListener('click', () => {
      arViewer.stopAR();
      window.history.back(); // Navigate back to the previous page
    });
}

function enableModelControls() {
    let initialTouchX = 0;
    let initialTouchY = 0;
    let currentRotationY = 0; // Rotation around Y-axis (left-right)
    let currentRotationX = 0; // Rotation around X-axis (up-down)
    let initialDistance = 0;
    let currentScale = 1;
    const minScale = 1; // Define the minimum scale (default scale)
  
    const model = document.querySelector('a-gltf-model'); // Select the 3D model
  
    // Handle single touch (rotation)
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1) {
        // Single touch for rotation
        initialTouchX = event.touches[0].clientX;
        initialTouchY = event.touches[0].clientY;
      } else if (event.touches.length === 2) {
        // Two fingers for scaling
        initialDistance = getDistance(event.touches[0], event.touches[1]);
      }
    });
  
    document.addEventListener('touchmove', (event) => {
      if (event.touches.length === 1) {
        // Single touch (swipe for rotation)
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        
        // Calculate change in both X (horizontal) and Y (vertical) movement
        const deltaX = touchX - initialTouchX;
        const deltaY = touchY - initialTouchY;
  
        // Update rotations based on touch movement
        currentRotationY += deltaX * 0.1; // Rotate around Y-axis for horizontal swipe
        currentRotationX -= deltaY * 0.1; // Rotate around X-axis for vertical swipe
  
        // Apply the new rotation to the model
        model.setAttribute('rotation', `${currentRotationX} ${currentRotationY} 0`);
  
        // Update initial touch coordinates for continuous rotation
        initialTouchX = touchX;
        initialTouchY = touchY;
      } else if (event.touches.length === 2) {
        // Two fingers (pinch-to-zoom for scaling)
        const newDistance = getDistance(event.touches[0], event.touches[1]);
        const scaleChange = newDistance / initialDistance;
        currentScale *= scaleChange; // Adjust the scale based on pinch distance
  
        // Apply the scale but ensure it's not smaller than the minimum scale
        currentScale = Math.max(currentScale, minScale); // Limit the scale to the minimum value
        model.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
        initialDistance = newDistance; // Update the starting distance for continuous scaling
      }
    });
  
    // Helper function to calculate the distance between two touch points
    function getDistance(touch1, touch2) {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
}