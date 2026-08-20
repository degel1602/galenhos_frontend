import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component, inject, NgZone, ViewChild, } from '@angular/core';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { AuthService } from '../../../modulos/auth/aplicacion/auth.service';
import { BienvenidaService } from './bienvenida.service';
const CARD_WIDTH = 1.6;
const CARD_HEIGHT = 2.25;
const CARD_DEPTH = 0.06;
const STRAP_RADIUS = 0.055;
const CLIP_HEIGHT = 0.18;
const CLIP_DEPTH = 0.1;
const ANCHOR_Y = 4.0;
const SEGMENT_LENGTH = 1.3;
const CAMERA_FOV = 25;
const CAMERA_Z = 15;
let CredencialBienvenidaComponent = class CredencialBienvenidaComponent {
    contenedorRef;
    authService = inject(AuthService);
    bienvenidaService = inject(BienvenidaService);
    ngZone = inject(NgZone);
    nombreUsuario = this.authService.username() ?? 'Usuario';
    renderer;
    escena;
    camara;
    maillaCard;
    maillaClip;
    maillaCinta;
    mundo;
    cuerpoCard;
    cuerposSegmento = [];
    arrastrando = false;
    idPuntero = -1;
    offsetArrastre = new THREE.Vector3();
    planoArrastre = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    rayCaster = new THREE.Raycaster();
    posicionRaton = new THREE.Vector2();
    animacionId = 0;
    limpiadores = [];
    puntoAnclaje = new THREE.Vector3(0, ANCHOR_Y, 0);
    ngAfterViewInit() {
        this.ngZone.runOutsideAngular(() => {
            this.configurarRenderer();
            this.construirEscena();
            this.iniciarLoop();
            this.iniciarFisicas();
            this.vincularEventos();
        });
        setTimeout(() => this.ngZone.run(() => this.cerrarOverlay()), 4500);
    }
    configurarRenderer() {
        const esMobil = window.innerWidth < 768;
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !esMobil,
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, esMobil ? 1.5 : 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.display = 'block';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.outline = 'none';
        this.contenedorRef.nativeElement.appendChild(this.renderer.domElement);
    }
    construirEscena() {
        this.escena = new THREE.Scene();
        this.camara = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camara.position.set(0, 0, CAMERA_Z);
        this.escena.add(new THREE.AmbientLight(0xffffff, 1.0)); // Reducido de 2.5 a 1.0
        const luzTop = new THREE.DirectionalLight(0xffffff, 1.5); // Reducido de 4.5 a 1.5
        luzTop.position.set(3, 8, 12);
        this.escena.add(luzTop);
        const luzRelleno = new THREE.DirectionalLight(0xf0f5ff, 0.8); // Reducido de 1.8 a 0.8 y color más neutro
        luzRelleno.position.set(-4, -2, 7);
        this.escena.add(luzRelleno);
        const luzPuntual = new THREE.PointLight(0xffffff, 1.0, 25); // Reducido de 2.5 a 1.0
        luzPuntual.position.set(0, 4, 9);
        this.escena.add(luzPuntual);
        this.maillaCard = this.fabricarTarjeta();
        this.maillaClip = this.fabricarClip();
        this.maillaCinta = this.fabricarCintaInicial();
        this.escena.add(this.maillaCinta);
        this.escena.add(this.maillaCard);
        this.escena.add(this.maillaClip);
    }
    fabricarTarjeta() {
        const geometria = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);
        // El borde de la tarjeta debe ser plástico blanco/gris muy claro
        const materialBorde = new THREE.MeshPhysicalMaterial({
            color: 0xf8fafc,
            roughness: 0.6,
            metalness: 0.0,
            clearcoat: 0.1,
        });
        const materialFrente = new THREE.MeshPhysicalMaterial({
            map: this.pintarFrente(),
            roughness: 0.5, // Plástico normal, menos brillante
            metalness: 0.0,
            clearcoat: 0.1, // Menos clearcoat para evitar que refleje toda la luz blanca
            clearcoatRoughness: 0.2,
        });
        const materialDorso = new THREE.MeshPhysicalMaterial({
            map: this.pintarDorso(),
            roughness: 0.5,
            metalness: 0.0,
            clearcoat: 0.1,
        });
        return new THREE.Mesh(geometria, [
            materialBorde,
            materialBorde,
            materialBorde,
            materialBorde,
            materialFrente,
            materialDorso,
        ]);
    }
    pintarFrente() {
        const lienzo = document.createElement('canvas');
        lienzo.width = 512;
        lienzo.height = 720;
        const ctx = lienzo.getContext('2d');
        if (!ctx)
            return new THREE.CanvasTexture(lienzo);
        // Fondo blanco puro en la totalidad del canvas, evitando esquinas negras
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 720);
        // Acento superior corporativo (fondo azul)
        const bgHeader = ctx.createLinearGradient(0, 0, 512, 0);
        bgHeader.addColorStop(0, '#0284c7');
        bgHeader.addColorStop(1, '#0f172a');
        ctx.fillStyle = bgHeader;
        ctx.fillRect(0, 0, 512, 170);
        // Añadimos una curva inferior para diseño
        ctx.beginPath();
        ctx.moveTo(0, 170);
        ctx.quadraticCurveTo(256, 210, 512, 170);
        ctx.lineTo(512, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        // Logo / Texto corporativo limpio y GRANDE
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GALENOS PRO', 256, 100);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText('SISTEMA DE GESTIÓN CLÍNICA', 256, 135);
        // Dibujar un icono de "personita" por defecto (Avatar Genérico)
        const fotoX = 256, fotoY = 280, fotoR = 100;
        // Fondo del avatar
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(fotoX, fotoY, fotoR, 0, Math.PI * 2);
        ctx.fill();
        // Cabeza del avatar
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(fotoX, fotoY - 20, 38, 0, Math.PI * 2);
        ctx.fill();
        // Hombros del avatar
        ctx.beginPath();
        ctx.arc(fotoX, fotoY + 80, 75, Math.PI, 0);
        ctx.fill();
        // Borde sutil del avatar
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(fotoX, fotoY, fotoR, 0, Math.PI * 2);
        ctx.stroke();
        // Nombre principal MUY GRANDE Y NOTORIO
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(this.nombreUsuario.toUpperCase(), 256, 460);
        // Cargo MÁS GRANDE
        const cargo = this.authService.getIdEmpleado() > 0 ? 'MÉDICO TITULAR' : 'ADMINISTRADOR';
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(cargo, 256, 495);
        // Línea separadora
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(60, 535, 392, 2);
        // Datos inferiores MÁS NOTORIOS
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 13px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ID EMPLEADO', 160, 580);
        ctx.fillText('ESTADO', 352, 580);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(this.authService.getIdEmpleado().toString() || '001', 160, 610);
        ctx.fillStyle = '#059669'; // Verde fuerte
        ctx.fillText('ACTIVO', 352, 610);
        // Barra inferior
        ctx.fillStyle = '#2dd4bf';
        ctx.fillRect(0, 690, 512, 30);
        const t = new THREE.CanvasTexture(lienzo);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    }
    pintarDorso() {
        const lienzo = document.createElement('canvas');
        lienzo.width = 512;
        lienzo.height = 720;
        const ctx = lienzo.getContext('2d');
        if (!ctx)
            return new THREE.CanvasTexture(lienzo);
        // Fondo blanco puro en la totalidad del canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 720);
        // Banda magnética oscura, sin bordes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 70, 512, 90);
        // Texto legal limpio y corporativo MÁS GRANDE
        ctx.fillStyle = '#4b5563';
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('PROPIEDAD DE GALENOS PRO', 256, 220);
        ctx.font = '15px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('Esta credencial es personal e intransferible.', 256, 250);
        ctx.fillText('En caso de extravío, por favor devuélvalo a RRHH.', 256, 275);
        // Código de barras (limpio, simulado)
        ctx.fillStyle = '#1e293b';
        for (let i = 0; i < 40; i++) {
            const rand1 = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
            const rand2 = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
            const x = 110 + i * 7.5 + rand1 * 3;
            const w = 2 + rand2 * 4;
            ctx.fillRect(x, 400, w, 70);
        }
        // Firma autorizada (línea muy sutil)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(126, 580, 260, 2);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 14px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('FIRMA AUTORIZADA', 256, 615);
        const t = new THREE.CanvasTexture(lienzo);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    }
    fabricarClip() {
        const geo = new THREE.BoxGeometry(0.22, CLIP_HEIGHT, CLIP_DEPTH);
        const mat = new THREE.MeshPhysicalMaterial({
            color: 0xb2bac8,
            roughness: 0.2,
            metalness: 0.88,
            clearcoat: 0.55,
        });
        const clip = new THREE.Mesh(geo, mat);
        clip.position.set(0, CARD_HEIGHT / 2 + CLIP_HEIGHT / 2, 0);
        return clip;
    }
    fabricarCintaInicial() {
        const puntos = [
            new THREE.Vector3(0, ANCHOR_Y, 0),
            new THREE.Vector3(0, ANCHOR_Y - SEGMENT_LENGTH * 0.5, 0),
            new THREE.Vector3(0, ANCHOR_Y - SEGMENT_LENGTH, 0),
            new THREE.Vector3(0, ANCHOR_Y - SEGMENT_LENGTH * 1.5, 0),
            new THREE.Vector3(0, CARD_HEIGHT / 2 + CLIP_HEIGHT, 0),
        ];
        const curva = new THREE.CatmullRomCurve3(puntos);
        curva.tension = 0.5;
        const geo = new THREE.TubeGeometry(curva, 24, STRAP_RADIUS, 8, false);
        const mat = new THREE.MeshPhysicalMaterial({
            color: 0x1a1f36,
            roughness: 0.38,
            metalness: 0.06,
            clearcoat: 0.25,
        });
        return new THREE.Mesh(geo, mat);
    }
    reconstruirCinta(posCard, rotCard) {
        const puntoColgamiento = new THREE.Vector3(0, CARD_HEIGHT / 2 + CLIP_HEIGHT * 0.5, 0)
            .applyQuaternion(rotCard)
            .add(posCard);
        const puntos = [this.puntoAnclaje.clone()];
        for (const seg of this.cuerposSegmento) {
            const p = seg.translation();
            puntos.push(new THREE.Vector3(p.x, p.y, p.z));
        }
        puntos.push(puntoColgamiento);
        const curva = new THREE.CatmullRomCurve3(puntos);
        curva.tension = 0.5;
        const nuevaGeo = new THREE.TubeGeometry(curva, 24, STRAP_RADIUS, 8, false);
        this.maillaCinta.geometry.dispose();
        this.maillaCinta.geometry = nuevaGeo;
        const posClip = new THREE.Vector3(0, CARD_HEIGHT / 2 + CLIP_HEIGHT / 2, 0)
            .applyQuaternion(rotCard)
            .add(posCard);
        this.maillaClip.position.copy(posClip);
        this.maillaClip.quaternion.copy(rotCard);
    }
    iniciarFisicas() {
        RAPIER.init().then(() => {
            this.mundo = new RAPIER.World({ x: 0, y: -22, z: 0 });
            const anclajeBody = this.mundo.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(this.puntoAnclaje.x, this.puntoAnclaje.y, this.puntoAnclaje.z));
            this.mundo.createCollider(RAPIER.ColliderDesc.ball(0.02), anclajeBody);
            let cuerpoPrevio = anclajeBody;
            for (let i = 0; i < 2; i++) {
                const segY = ANCHOR_Y - (i + 1) * SEGMENT_LENGTH;
                const segBody = this.mundo.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(0, segY, 0)
                    .setLinearDamping(2.5)
                    .setAngularDamping(2.5));
                this.mundo.createCollider(RAPIER.ColliderDesc.ball(0.04), segBody);
                this.mundo.createImpulseJoint(RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: 0, y: SEGMENT_LENGTH, z: 0 }), cuerpoPrevio, segBody, true);
                this.cuerposSegmento.push(segBody);
                cuerpoPrevio = segBody;
            }
            const distanciaConexion = CARD_HEIGHT / 2 + CLIP_HEIGHT;
            const cardCenterY = ANCHOR_Y - 2 * SEGMENT_LENGTH - distanciaConexion;
            this.cuerpoCard = this.mundo.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(0, cardCenterY, 0)
                .setLinearDamping(2.0)
                .setAngularDamping(3.5));
            this.mundo.createCollider(RAPIER.ColliderDesc.cuboid(CARD_WIDTH / 2, CARD_HEIGHT / 2, CARD_DEPTH / 2), this.cuerpoCard);
            this.mundo.createImpulseJoint(RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: 0, y: distanciaConexion, z: 0 }), cuerpoPrevio, this.cuerpoCard, true);
            this.cuerpoCard.applyImpulse({ x: 1.2, y: 0, z: 0 }, true);
        });
    }
    iniciarLoop() {
        const tick = () => {
            this.animacionId = requestAnimationFrame(tick);
            if (this.mundo && this.cuerpoCard) {
                this.mundo.step();
                const p = this.cuerpoCard.translation();
                const r = this.cuerpoCard.rotation();
                const posVec = new THREE.Vector3(p.x, p.y, p.z);
                const rotQuat = new THREE.Quaternion(r.x, r.y, r.z, r.w);
                this.maillaCard.position.copy(posVec);
                this.maillaCard.quaternion.copy(rotQuat);
                this.reconstruirCinta(posVec, rotQuat);
            }
            this.renderer.render(this.escena, this.camara);
        };
        tick();
    }
    vincularEventos() {
        const canvas = this.renderer.domElement;
        const onDown = (e) => this.onPointerDown(e);
        const onMove = (e) => this.onPointerMove(e);
        const onUp = (e) => this.onPointerUp(e);
        const onCancel = (e) => this.onPointerUp(e);
        const onResize = () => {
            this.camara.aspect = window.innerWidth / window.innerHeight;
            this.camara.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };
        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onCancel);
        window.addEventListener('resize', onResize);
        this.limpiadores.push(() => canvas.removeEventListener('pointerdown', onDown), () => canvas.removeEventListener('pointermove', onMove), () => canvas.removeEventListener('pointerup', onUp), () => canvas.removeEventListener('pointercancel', onCancel), () => window.removeEventListener('resize', onResize));
    }
    onPointerDown(evento) {
        if (!this.cuerpoCard || !this.mundo)
            return;
        this.actualizarCursorRaton(evento.clientX, evento.clientY);
        this.rayCaster.setFromCamera(this.posicionRaton, this.camara);
        const hits = this.rayCaster.intersectObject(this.maillaCard);
        if (hits.length === 0)
            return;
        this.arrastrando = true;
        this.idPuntero = evento.pointerId;
        evento.target.setPointerCapture(evento.pointerId);
        const pos = this.cuerpoCard.translation();
        const puntoMundo = this.proyectarEnPlano(evento.clientX, evento.clientY);
        if (puntoMundo)
            this.offsetArrastre.set(pos.x - puntoMundo.x, pos.y - puntoMundo.y, 0);
        this.cuerpoCard.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
        this.renderer.domElement.style.cursor = 'grabbing';
    }
    onPointerMove(evento) {
        if (!this.cuerpoCard)
            return;
        if (!this.arrastrando || evento.pointerId !== this.idPuntero) {
            this.actualizarCursorRaton(evento.clientX, evento.clientY);
            this.rayCaster.setFromCamera(this.posicionRaton, this.camara);
            const hits = this.rayCaster.intersectObject(this.maillaCard);
            this.renderer.domElement.style.cursor =
                hits.length > 0 ? 'grab' : 'default';
            return;
        }
        const punto = this.proyectarEnPlano(evento.clientX, evento.clientY);
        if (!punto)
            return;
        this.cuerpoCard.setNextKinematicTranslation({
            x: punto.x + this.offsetArrastre.x,
            y: punto.y + this.offsetArrastre.y,
            z: 0,
        });
        for (const seg of this.cuerposSegmento)
            seg.wakeUp();
    }
    onPointerUp(evento) {
        if (!this.arrastrando ||
            evento.pointerId !== this.idPuntero ||
            !this.cuerpoCard)
            return;
        this.arrastrando = false;
        this.idPuntero = -1;
        this.cuerpoCard.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
        this.renderer.domElement.style.cursor = 'default';
    }
    actualizarCursorRaton(clienteX, clienteY) {
        this.posicionRaton.set((clienteX / window.innerWidth) * 2 - 1, -(clienteY / window.innerHeight) * 2 + 1);
    }
    proyectarEnPlano(clienteX, clienteY) {
        this.actualizarCursorRaton(clienteX, clienteY);
        this.rayCaster.setFromCamera(this.posicionRaton, this.camara);
        const destino = new THREE.Vector3();
        return this.rayCaster.ray.intersectPlane(this.planoArrastre, destino)
            ? destino
            : null;
    }
    cerrarOverlay() {
        this.bienvenidaService.desactivar();
    }
    ngOnDestroy() {
        cancelAnimationFrame(this.animacionId);
        for (const limpiar of this.limpiadores)
            limpiar();
        const canvas = this.renderer?.domElement;
        canvas?.remove();
        this.escena?.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.geometry?.dispose();
                if (Array.isArray(obj.material)) {
                    for (const m of obj.material)
                        m.dispose();
                }
                else {
                    obj.material?.dispose();
                }
            }
        });
        this.renderer?.dispose();
        this.mundo = undefined;
        this.cuerpoCard = undefined;
        this.cuerposSegmento = [];
    }
};
__decorate([
    ViewChild('contenedor')
], CredencialBienvenidaComponent.prototype, "contenedorRef", void 0);
CredencialBienvenidaComponent = __decorate([
    Component({
        selector: 'app-credencial-bienvenida',
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './credencial-bienvenida.html',
        styleUrl: './credencial-bienvenida.css',
    })
], CredencialBienvenidaComponent);
export { CredencialBienvenidaComponent };
