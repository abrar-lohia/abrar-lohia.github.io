export class ARViewer {
    constructor({
      mindFile,
      modelFile,
      scale = '1 1 1',
      position = '0 0 0.1',
      targetId = 'arContainer',
      onSDKInitialized = () => {},
      onSDKPaused = () => {},
      onSDKResumed = () => {},
      onSDKClosed = () => {},
      onTargetFound = () => {},
      onTargetLost = () => {},
    }) {
      this.mindFile = mindFile;
      this.modelFile = modelFile;
      this.scale = scale;
      this.position = position;
      this.targetId = targetId;
  
      // Custom event handlers (callbacks)
      this.onSDKInitialized = onSDKInitialized;
      this.onSDKPaused = onSDKPaused;
      this.onSDKResumed = onSDKResumed;
      this.onSDKClosed = onSDKClosed;
      this.onTargetFound = onTargetFound;
      this.onTargetLost = onTargetLost;
  
      this.currentModel = null;
      this.arSystem = null;
      this.sceneEl = null;
      this.init = false;
    }
  
    initialize() {
      this.createScene();
      this.attachEventListeners();
    }
  
    createScene() {
      const arContainer = document.querySelector(`#${this.targetId}`);
      arContainer.innerHTML = `
        <a-scene mindar-image="imageTargetSrc: ${this.mindFile}; autoStart: false; filterMinCF:0.0001; filterBeta: 0.001;" color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false">
          <a-assets>
            <a-asset-item id="dynamicModel" src="${this.modelFile}"></a-asset-item>
          </a-assets>
  
          <a-camera position="0 0 0" look-controls="enabled: false" cursor="fuse: false; rayOrigin: mouse;" raycaster="near: 10; far: 10000; objects: .clickable"></a-camera>
  
          <a-entity id="target" mindar-image-target="targetIndex: 0">
            <a-gltf-model src="#dynamicModel" scale="${this.scale}" position="${this.position}" rotation="0 0 0" animation="property: position; to: 0 0.1 0.1; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate"></a-gltf-model>
          </a-entity>
        </a-scene>
      `;
  
      this.sceneEl = document.querySelector('a-scene');
      this.sceneEl.addEventListener('loaded', () => {
        this.arSystem = this.sceneEl.systems['mindar-image-system'];
        this.onSDKInitialized();  // Call the user-defined callback for SDK initialized
        this.startAR();
      });
    }
  
    attachEventListeners() {
      window.addEventListener('blur', () => this.handleWindowMinimized());
      window.addEventListener('focus', () => this.handleWindowRestored());
  
      this.sceneEl.addEventListener("arReady", (event) => this.onSDKInitialized());
      this.sceneEl.addEventListener("arError", (event) => this.onSDKClosed());
  
      const target = document.querySelector("#target");
      target.addEventListener("targetFound", (event) => this.onTargetFound());
      target.addEventListener("targetLost", (event) => this.onTargetLost());

    }
  
    startAR() {
      if (!this.init) {
        this.arSystem.start();
        this.init = true;
      }
    }
  
    stopAR() {
      if (this.init) {
        this.arSystem.stop();
        this.onSDKClosed();  // Call the user-defined callback for SDK closed
        this.init = false;
      }
    }
  
    handleWindowMinimized() {
      if (this.init) {
        this.arSystem.pause(true);
        this.onSDKPaused();  // Call the user-defined callback for SDK paused
      }
    }
  
    handleWindowRestored() {
      if (this.init) {
        this.arSystem.unpause();
        this.onSDKResumed();  // Call the user-defined callback for SDK resumed
      }
    }
}