import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TempleService } from '../../core/services/temple.service';
import * as THREE from 'three';
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

@Component({
  selector: 'app-darshan',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-screen bg-black overflow-hidden select-none" (window:resize)="onResize()">
      
      <!-- 3D Canvas Container -->
      <div #canvasContainer class="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_#5c1c1c_0%,_#1a0505_100%)]"></div>

      <!-- UI Overlay -->
      <div class="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        <!-- Header -->
        <div class="flex justify-between items-start pointer-events-auto">
           <div class="bg-[#2a0a0a]/80 backdrop-blur-md p-4 rounded-xl border border-amber-600/50 text-white shadow-lg animate-fade-in-up">
              <h2 class="text-2xl font-serif font-bold text-amber-400 drop-shadow-md">Divya Darshanam</h2>
              <p class="text-xs text-stone-300">Shri Venkateswara Swamy</p>
           </div>
           <button (click)="goBack()" class="bg-red-600/80 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-sm transition-all shadow-lg hover:shadow-red-500/50">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        <!-- Camera Controls (Right Side) -->
        <div class="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto bg-[#2a0a0a]/60 p-2 rounded-2xl backdrop-blur-md border border-amber-900/30 shadow-2xl">
            <!-- View Presets -->
            <div class="flex flex-col gap-2">
               <button (click)="setView('face')" class="w-10 h-10 rounded-full bg-[#4a0404] text-amber-200 border border-amber-900/50 hover:bg-amber-900 hover:border-amber-500 transition-all flex items-center justify-center shadow-lg" title="Netra Darshanam (Face)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clip-rule="evenodd" /></svg>
               </button>
               <button (click)="setView('feet')" class="w-10 h-10 rounded-full bg-[#4a0404] text-amber-200 border border-amber-900/50 hover:bg-amber-900 hover:border-amber-500 transition-all flex items-center justify-center shadow-lg" title="Pada Darshanam (Feet)">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>
               </button>
               <button (click)="setView('full')" class="w-10 h-10 rounded-full bg-[#4a0404] text-amber-200 border border-amber-900/50 hover:bg-amber-900 hover:border-amber-500 transition-all flex items-center justify-center shadow-lg" title="Full View">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM15.375 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clip-rule="evenodd" /></svg>
               </button>
            </div>
        </div>

        <!-- Divine Actions Bar -->
        <div class="flex flex-wrap justify-center items-center gap-6 pointer-events-auto pb-10">
           
           <!-- Harathi Button -->
           <button (click)="performArathi()" [disabled]="isArathiActive()" 
                   class="group relative flex flex-col items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
             <div class="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.6)] border-2 border-orange-300 group-hover:shadow-[0_0_50px_rgba(234,88,12,0.8)] transition-shadow">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-white"><path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" /></svg>
             </div>
             <span class="text-amber-200 font-serif font-bold text-sm tracking-widest uppercase drop-shadow-md">Harathi</span>
           </button>

           <!-- Pushpanjali Button -->
           <button (click)="performPushpanjali()" [disabled]="isRainingFlowers()" 
                   class="group relative flex flex-col items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
             <div class="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-[0_0_30px_rgba(244,114,182,0.6)] border-2 border-pink-300 group-hover:shadow-[0_0_50px_rgba(244,114,182,0.8)] transition-shadow">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-white"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
             </div>
             <span class="text-pink-200 font-serif font-bold text-sm tracking-widest uppercase drop-shadow-md">Pushpanjali</span>
           </button>
           
           <!-- Festival Mode Toggle -->
           <button (click)="toggleFestivalMode()"
                   class="group relative flex flex-col items-center gap-2 transition-transform active:scale-95">
             <div class="w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all"
                  [class.bg-gradient-to-br]="templeService.festivalMode()"
                  [class.from-yellow-400]="templeService.festivalMode()"
                  [class.to-amber-500]="templeService.festivalMode()"
                  [class.shadow-[0_0_30px_#facc15]"]="templeService.festivalMode()"
                  [class.border-yellow-200]="templeService.festivalMode()"
                  [class.bg-stone-800/50]="!templeService.festivalMode()"
                  [class.border-stone-600]="!templeService.festivalMode()">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 transition-colors"
                    [class.text-white]="templeService.festivalMode()"
                    [class.text-stone-400]="!templeService.festivalMode()">
                 <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.75.75l.04 1.705A1.99 1.99 0 0111.48 8.4l1.47-1.02a.75.75 0 011.02.247l.004.007a.75.75 0 01-.247 1.02l-1.02 1.47a1.99 1.99 0 011.485 1.695l1.705.04a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75l-1.705.04a1.99 1.99 0 01-1.485 1.695l1.02 1.47a.75.75 0 01-.247 1.02l-.004.007a.75.75 0 01-1.02-.247l-1.47-1.02a1.99 1.99 0 01-1.695 1.485l-.04 1.705a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75l-.04-1.705A1.99 1.99 0 018.52 15.6l-1.47 1.02a.75.75 0 01-1.02-.247l-.004-.007a.75.75 0 01.247-1.02l1.02-1.47A1.99 1.99 0 015.515 11.2l-1.705-.04a.75.75 0 01-.75-.75v-.01a.75.75 0 01.75-.75l1.705-.04A1.99 1.99 0 018.515 8.4l-1.02-1.47a.75.75 0 01.247-1.02l.004-.007a.75.75 0 011.02.247l1.47 1.02A1.99 1.99 0 0111.295 7l.04-1.705A.75.75 0 0112 4.5h.01zM12 15a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
               </svg>
             </div>
             <span class="font-serif font-bold text-sm tracking-widest uppercase drop-shadow-md" [class.text-yellow-200]="templeService.festivalMode()" [class.text-stone-400]="!templeService.festivalMode()">Festival</span>
           </button>

        </div>

      </div>

      @if (loading()) {
        <div class="absolute inset-0 z-20 flex items-center justify-center bg-[#1a0505]/95 backdrop-blur-sm text-amber-500">
           <div class="flex flex-col items-center animate-pulse">
              <div class="w-20 h-20 border-4 border-amber-600 border-t-amber-300 rounded-full animate-spin mb-6 shadow-[0_0_30px_#f59e0b]"></div>
              <p class="font-serif tracking-[0.2em] text-sm uppercase text-amber-300">Manifesting Deity...</p>
           </div>
        </div>
      }
    </div>
  `
})
export class DarshanComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef;
  
  templeService = inject(TempleService);
  
  // Signals
  loading = signal(true);
  isArathiActive = signal(false);
  isRainingFlowers = signal(false);

  // Three.js Variables
  private scene: any;
  private camera: any;
  private renderer: any;
  private idolGroup: any;
  private currentMesh: any; 
  private particles: any;
  private animationId: number | null = null;
  
  // Animation Objects
  private movingLight: any;
  private haloLight: any;
  private flowers: { mesh: any, speed: number, swayOffset: number }[] = [];
  private harathiObj: { light: any, angle: number, radius: number, height: number } | null = null;
  private festivalEffectFrameCount = 0;
  
  // Camera Control Variables
  targetDistance = 18; // Default Far
  targetY = 0;         // Default Center
  targetLookAtY = 0;
  
  private currentLookAtY = 0; // Current interpolated LookAt Y
  
  // Materials
  private goldMaterial: any;

  // Interaction
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private rotationSpeed = 0.005;
  private targetRotation = { x: 0, y: 0 };
  private currentRotation = { x: 0, y: 0 };
  private mouseDelta = { x: 0, y: 0 };

  // Camera Sway for Realism
  private cameraSway = { x: 0, y: 0 };
  private timeOffset = Math.random() * 100;

  constructor() {
    effect(() => {
      this.toggleFestivalVisuals(this.templeService.festivalMode());
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.initThreeJS();
      this.toggleFestivalVisuals(this.templeService.festivalMode());
    }, 500);

    // Safety timeout
    setTimeout(() => {
        if (this.loading()) {
            this.loading.set(false);
            if (this.idolGroup && this.idolGroup.children.length === 0) {
                this.createProceduralModels();
            }
        }
    }, 8000);
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    
    // Dispose of Three.js resources to prevent memory leaks
    if (this.scene) {
      this.scene.traverse((object: any) => {
        if (object.isMesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
             if (Array.isArray(object.material)) {
                object.material.forEach((m: any) => this.disposeMaterial(m));
             } else {
                this.disposeMaterial(object.material);
             }
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }

  private disposeMaterial(material: any) {
     if (material.map) material.map.dispose();
     material.dispose();
  }

  goBack() {
    window.history.back();
  }

  setView(view: 'face' | 'feet' | 'full') {
    switch(view) {
       case 'face':
          this.targetDistance = 6;
          this.targetY = 5.5; 
          this.targetLookAtY = 5.5;
          break;
       case 'feet':
          this.targetDistance = 6;
          this.targetY = -5.5;
          this.targetLookAtY = -5.5;
          break;
       case 'full':
          this.targetDistance = 18;
          this.targetY = 0;
          this.targetLookAtY = 0;
          break;
    }
  }

  createTexture(type: 'petal' | 'sparkle' | 'flame'): any {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (type === 'petal') {
        const pGrad = ctx.createLinearGradient(0, 0, 0, 64);
        pGrad.addColorStop(0, '#f472b6');
        pGrad.addColorStop(1, '#db2777');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.ellipse(32, 32, 12, 28, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#be185d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(32, 5);
        ctx.lineTo(32, 59);
        ctx.stroke();
    } else if (type === 'flame') {
         const gradient = ctx.createRadialGradient(32, 48, 0, 32, 32, 32);
         gradient.addColorStop(0, 'rgba(255, 255, 200, 1)'); 
         gradient.addColorStop(0.3, 'rgba(255, 150, 0, 0.9)'); 
         gradient.addColorStop(0.7, 'rgba(255, 50, 0, 0.5)'); 
         gradient.addColorStop(1, 'rgba(0,0,0,0)');
         ctx.fillStyle = gradient;
         ctx.beginPath();
         ctx.ellipse(32, 32, 15, 30, 0, 0, 2 * Math.PI);
         ctx.fill();
    } else {
         const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
         gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
         gradient.addColorStop(1, 'rgba(0,0,0,0)');
         ctx.fillStyle = gradient;
         ctx.fillRect(0,0,64,64);
    }
    return new THREE.CanvasTexture(canvas);
  }

  initThreeJS() {
    const width = this.containerRef.nativeElement.clientWidth;
    const height = this.containerRef.nativeElement.clientHeight;

    this.scene = new THREE.Scene();
    // Warm, dark maroon fog instead of black
    this.scene.fog = new THREE.FogExp2(0x1a0505, 0.02); 

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, this.targetDistance); 
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.containerRef.nativeElement.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.HemisphereLight(0xffeeb1, 0x2a0a0a, 0.5); 
    this.scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xffaa00, 2.0); 
    mainSpot.position.set(5, 15, 15);
    mainSpot.castShadow = true;
    mainSpot.shadow.bias = -0.0001;
    mainSpot.shadow.mapSize.width = 2048;
    mainSpot.shadow.mapSize.height = 2048;
    this.scene.add(mainSpot);
    
    this.movingLight = new THREE.PointLight(0xffd700, 1.0, 30); 
    this.scene.add(this.movingLight);

    this.haloLight = new THREE.PointLight(0xff6600, 2.0, 20); 
    this.haloLight.position.set(0, 5, -5); 
    this.scene.add(this.haloLight);

    // Enhanced Gold Material
    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc00, // Richer Gold
      roughness: 0.25, 
      metalness: 0.95,
      emissive: 0x442200,
      emissiveIntensity: 0.1,
      side: THREE.DoubleSide
    });

    this.idolGroup = new THREE.Group();
    this.scene.add(this.idolGroup);

    // Try loading model, if fail, create procedural
    const loader = new STLLoader();
    loader.load('tirupati.stl', (geometry: any) => {
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
        const box = geometry.boundingBox;
        const center = new THREE.Vector3();
        box.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 14.0 / maxDim : 1;
        
        this.currentMesh = new THREE.Mesh(geometry, this.goldMaterial);
        this.currentMesh.scale.set(scale, scale, scale);
        this.currentMesh.castShadow = true;
        this.currentMesh.receiveShadow = true;
        
        if (size.z > size.y) {
            this.currentMesh.rotation.x = -Math.PI / 2; 
        }
        
        this.idolGroup.add(this.currentMesh);
        this.loading.set(false);
    }, 
    undefined, 
    (error: any) => {
        console.warn("Could not load model, using procedural generation", error);
        this.createProceduralModels();
        this.loading.set(false);
    });

    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(300 * 3);
    for(let i=0; i<300; i++) {
        pPos[i*3] = (Math.random()-0.5)*25;
        pPos[i*3+1] = (Math.random()-0.5)*20;
        pPos[i*3+2] = (Math.random()-0.5)*15;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    this.particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        size: 0.15, map: this.createTexture('sparkle'), transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, color: 0xffd700
    }));
    this.scene.add(this.particles);

    const el = this.renderer.domElement;
    el.addEventListener('mousedown', (e: any) => this.onMouseDown(e));
    el.addEventListener('mousemove', (e: any) => this.onMouseMove(e));
    el.addEventListener('mouseup', () => this.isDragging = false);
    el.addEventListener('touchstart', (e: any) => this.onTouchStart(e), {passive: false});
    el.addEventListener('touchmove', (e: any) => this.onTouchMove(e), {passive: false});
    el.addEventListener('touchend', () => this.isDragging = false);
    
    el.addEventListener('wheel', (e: any) => {
        const delta = e.deltaY * 0.05;
        this.targetDistance = Math.min(Math.max(this.targetDistance + delta, 5), 30);
    });

    this.animate();
  }

  private toggleFestivalVisuals(isOn: boolean) {
    if (!this.scene || !this.particles) return;

    if (isOn) {
      this.particles.material.opacity = 0.7;
      this.particles.material.size = 0.2;
      this.particles.material.color.set(0xffe58f); // Warmer gold
    } else {
      this.particles.material.opacity = 0.4;
      this.particles.material.size = 0.15;
      this.particles.material.color.set(0xffd700);

      // Clean up any remaining festival flowers
      for (let i = this.flowers.length - 1; i >= 0; i--) {
        const f = this.flowers[i];
        if (f.mesh.userData.isFestivalFlower) {
          this.scene.remove(f.mesh);
          this.flowers.splice(i, 1);
        }
      }
    }
  }

  toggleFestivalMode() {
    this.templeService.setFestivalMode(!this.templeService.festivalMode());
  }

  createProceduralModels() {
    if (!this.idolGroup) return; // Safeguard if idolGroup is not initialized
    this.idolGroup.clear();
    const namamGroup = new THREE.Group();
    const uShape = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.3, 8, 20, Math.PI), this.goldMaterial);
    uShape.rotation.z = Math.PI;
    namamGroup.add(uShape);
    
    const cylGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
    const tilak = new THREE.Mesh(cylGeo, new THREE.MeshStandardMaterial({color: 0xff0000, roughness: 0.5}));
    tilak.position.y = -0.5;
    namamGroup.add(tilak);
    
    namamGroup.scale.set(3.5, 3.5, 3.5);

    this.idolGroup.add(namamGroup);
  }

  addFestivalFlowers(count: number) {
    const texture = this.createTexture('petal');
    const material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff, transparent: true, opacity: 0.8 });
    for (let i = 0; i < count; i++) {
        const sprite = new THREE.Sprite(material);
        sprite.userData.isFestivalFlower = true;
        const scale = 0.3 + Math.random() * 0.2;
        sprite.scale.set(scale, scale, 1);
        sprite.position.set((Math.random() - 0.5) * 12, 12 + Math.random() * 5, 3 + (Math.random() - 0.5) * 4);
        this.scene.add(sprite);
        this.flowers.push({
            mesh: sprite,
            speed: 0.03 + Math.random() * 0.05,
            swayOffset: Math.random() * 100
        });
    }
  }

  performPushpanjali() {
    this.isRainingFlowers.set(true);
    const texture = this.createTexture('petal');
    const material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
    for(let i=0; i<80; i++) {
        const sprite = new THREE.Sprite(material);
        const scale = 0.3 + Math.random() * 0.2;
        sprite.scale.set(scale, scale, 1);
        sprite.position.set((Math.random() - 0.5) * 8, 10 + Math.random() * 10, 3 + (Math.random() - 0.5) * 4);
        this.scene.add(sprite);
        this.flowers.push({
            mesh: sprite,
            speed: 0.05 + Math.random() * 0.1,
            swayOffset: Math.random() * 100
        });
    }
    setTimeout(() => { this.isRainingFlowers.set(false); }, 4000);
  }

  performArathi() {
      this.isArathiActive.set(true);
      const light = new THREE.PointLight(0xffaa00, 2, 8);
      const texture = this.createTexture('flame');
      const mat = new THREE.SpriteMaterial({ map: texture, blending: THREE.AdditiveBlending });
      const flameSprite = new THREE.Sprite(mat);
      flameSprite.scale.set(1.5, 1.5, 1);
      light.add(flameSprite);
      this.scene.add(light);
      this.harathiObj = { light, angle: -Math.PI/2, radius: 4, height: -2 };
      setTimeout(() => {
          this.scene.remove(light);
          this.harathiObj = null;
          this.isArathiActive.set(false);
      }, 8000);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    const time = Date.now() * 0.001;

    if (this.templeService.festivalMode()) {
        this.festivalEffectFrameCount++;
        if (this.festivalEffectFrameCount % 10 === 0 && this.flowers.length < 150) {
            this.addFestivalFlowers(2);
        }

        if (this.movingLight) {
            this.movingLight.intensity = 1.5 + Math.sin(time * 3) * 0.5; 
        }
        if (this.haloLight) {
            this.haloLight.intensity = 2.5 + Math.sin(time * 2.5) * 0.8;
            const hue = 0.08 + Math.sin(time * 0.5) * 0.03; 
            this.haloLight.color.setHSL(hue, 1.0, 0.55);
        }
    } else {
        if (this.movingLight) {
            this.movingLight.position.x = Math.sin(time * 0.5) * 10;
            this.movingLight.position.z = 10 + Math.cos(time * 0.5) * 5;
            this.movingLight.position.y = 2 + Math.sin(time) * 2;
            this.movingLight.intensity = 1.0 + Math.sin(time * 2) * 0.2; 
        }
        if (this.haloLight) {
            this.haloLight.intensity = 2.0 + Math.sin(time * 1.5) * 0.5;
            const hue = 0.08 + Math.sin(time * 0.2) * 0.02; 
            this.haloLight.color.setHSL(hue, 1.0, 0.5);
        }
    }
    
    if (this.camera) {
        // Smooth camera transitions
        this.camera.position.z += (this.targetDistance - this.camera.position.z) * 0.05;
        this.camera.position.y += (this.targetY - this.camera.position.y) * 0.05;
        this.currentLookAtY += (this.targetLookAtY - this.currentLookAtY) * 0.05;
        
        // Add subtle camera sway breathing effect for realism
        const swayX = Math.sin(time * 0.5 + this.timeOffset) * 0.2;
        const swayY = Math.cos(time * 0.3 + this.timeOffset) * 0.2;
        
        this.camera.position.x += (swayX - this.cameraSway.x) * 0.05;
        this.camera.position.y += (swayY - this.cameraSway.y) * 0.05;
        
        this.cameraSway = { x: swayX, y: swayY };

        this.camera.lookAt(0, this.currentLookAtY, 0);
    }
    
    if (this.isDragging) {
        this.targetRotation.y += this.mouseDelta.x * this.rotationSpeed;
        this.targetRotation.x += this.mouseDelta.y * this.rotationSpeed;
        this.targetRotation.x = Math.max(-0.5, Math.min(0.5, this.targetRotation.x));
        this.mouseDelta = { x: 0, y: 0 };
    } else {
        // Gentle auto rotation
        this.targetRotation.y = Math.sin(time * 0.2) * 0.05; 
    }
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;

    if (this.idolGroup) {
        this.idolGroup.rotation.y = this.currentRotation.y;
        this.idolGroup.rotation.x = this.currentRotation.x;
    }

    for (let i = this.flowers.length - 1; i >= 0; i--) {
         const f = this.flowers[i];
         f.mesh.position.y -= f.speed;
         f.mesh.position.x += Math.sin(time * 2 + f.swayOffset) * 0.02;
         f.mesh.material.rotation = Math.sin(time + f.swayOffset) * 0.5;
         if (f.mesh.position.y < -8) {
             this.scene.remove(f.mesh);
             this.flowers.splice(i, 1);
         }
    }

    if (this.harathiObj) {
         this.harathiObj.angle += 2.5 * 0.016;
         const h = this.harathiObj;
         h.height = Math.sin(h.angle * 0.5) * 3;
         h.light.position.set(Math.cos(h.angle) * h.radius, h.height, Math.sin(h.angle) * h.radius + 2);
         h.light.intensity = 2 + Math.random() * 0.5;
         h.light.children[0].material.opacity = 0.8 + Math.random() * 0.2;
    }

    if (this.particles) {
        this.particles.rotation.y = time * 0.05;
    }
    
    if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
    }
  }

  // Interaction Handlers
  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }
  onMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      this.mouseDelta = { x: e.clientX - this.previousMousePosition.x, y: e.clientY - this.previousMousePosition.y };
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  }
  onTouchStart(e: TouchEvent) {
     if (e.touches.length === 1) {
       this.isDragging = true;
       this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
     }
  }
  onTouchMove(e: TouchEvent) {
     if (this.isDragging && e.touches.length === 1) {
       e.preventDefault();
       this.mouseDelta = { x: e.touches[0].clientX - this.previousMousePosition.x, y: e.touches[0].clientY - this.previousMousePosition.y };
       this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
     }
  }
  onResize() {
     if(!this.camera || !this.renderer) return;
     const w = this.containerRef.nativeElement.clientWidth;
     const h = this.containerRef.nativeElement.clientHeight;
     this.camera.aspect = w/h;
     this.camera.updateProjectionMatrix();
     this.renderer.setSize(w, h);
  }
}