// CoreMod - Motor WebGL con Interconexión, Movimiento y Redimensionamiento
class CoreMod {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.modules = [];
        this.selectedModule = null;
        this.currentHabitat = 'leo';
        this.crewCount = 4;
        this.animationId = null;
        
        // Sistema de interconexión
        this.connections = [];
        this.selectedModuleIndex = -1;
        this.dragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizing = false;
        this.resizeHandle = null;
        
        // Datos de módulos
        this.moduleDatabase = {
            halo: {
                name: 'HALO',
                description: 'Módulo Habitacional',
                color: [0.2, 0.6, 1.0],
                baseVolume: 50,
                baseCapacity: 4,
                dockingPorts: 2,
                maxConnections: 4
            },
            eclss: {
                name: 'ECLSS',
                description: 'Sistema de Soporte Vital',
                color: [0.0, 0.8, 0.4],
                baseVolume: 30,
                baseCapacity: 0,
                dockingPorts: 3,
                maxConnections: 6
            },
            power: {
                name: 'Power',
                description: 'Módulo de Energía',
                color: [1.0, 0.8, 0.0],
                baseVolume: 20,
                baseCapacity: 0,
                dockingPorts: 2,
                maxConnections: 4
            }
        };

        // Datos de hábitats
        this.habitatDatabase = {
            leo: { name: 'LEO', gravity: 0.9, radiation: 0.3 },
            luna: { name: 'Luna', gravity: 0.16, radiation: 0.8 },
            marte: { name: 'Marte', gravity: 0.38, radiation: 0.5 }
        };

        this.init();
    }

    init() {
        console.log('🚀 Inicializando CoreMod con interconexión...');
        
        // Configurar canvas
        this.canvas = document.getElementById('canvas3d');
        if (!this.canvas) {
            console.error('❌ Canvas no encontrado');
            return;
        }

        // Inicializar WebGL
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('❌ WebGL no soportado');
            this.showError('WebGL no está soportado en este navegador');
            return;
        }

        console.log('✅ WebGL inicializado correctamente');

        // Configurar WebGL
        this.setupWebGL();
        
        // Crear shaders
        if (!this.createShaders()) {
            console.error('❌ Error al crear shaders');
            return;
        }
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Ocultar indicador de carga
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        console.log('✅ CoreMod inicializado correctamente');
        this.showNotification('CoreMod con interconexión inicializado', 'success');
        
        // Iniciar renderizado
        this.startRender();
    }

    setupWebGL() {
        const gl = this.gl;
        
        // Configurar viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // Habilitar profundidad
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        
        // Configurar culling
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        
        // Color de fondo
        gl.clearColor(0.05, 0.1, 0.2, 1.0);
    }

    createShaders() {
        const gl = this.gl;

        // Vertex Shader
        const vertexShaderSource = `
            attribute vec3 position;
            attribute vec3 color;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat4 transformMatrix;
            varying vec3 vColor;
            
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * transformMatrix * vec4(position, 1.0);
                vColor = color;
            }
        `;

        // Fragment Shader
        const fragmentShaderSource = `
            precision mediump float;
            varying vec3 vColor;
            
            void main() {
                gl_FragColor = vec4(vColor, 1.0);
            }
        `;

        // Crear shaders
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            return false;
        }

        // Crear programa
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('❌ Error al enlazar programa:', gl.getProgramInfoLog(this.program));
            return false;
        }

        // Usar programa
        gl.useProgram(this.program);

        // Obtener ubicaciones de atributos y uniforms
        this.positionLocation = gl.getAttribLocation(this.program, 'position');
        this.colorLocation = gl.getAttribLocation(this.program, 'color');
        this.modelViewMatrixLocation = gl.getUniformLocation(this.program, 'modelViewMatrix');
        this.projectionMatrixLocation = gl.getUniformLocation(this.program, 'projectionMatrix');
        this.transformMatrixLocation = gl.getUniformLocation(this.program, 'transformMatrix');

        console.log('✅ Shaders creados correctamente');
        return true;
    }

    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('❌ Error al compilar shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createCylinderGeometry(radius, height, segments = 16) {
        const vertices = [];
        const colors = [];
        const indices = [];

        // Crear vértices del cilindro
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Vértice inferior
            vertices.push(x, -height/2, z);
            colors.push(0.8, 0.8, 0.8);

            // Vértice superior
            vertices.push(x, height/2, z);
            colors.push(0.9, 0.9, 0.9);
        }

        // Crear índices para las caras
        for (let i = 0; i < segments; i++) {
            const i1 = i * 2;
            const i2 = i1 + 1;
            const i3 = ((i + 1) % segments) * 2;
            const i4 = i3 + 1;

            // Cara 1
            indices.push(i1, i2, i3);
            indices.push(i2, i4, i3);

            // Cara 2
            indices.push(i3, i4, i1);
            indices.push(i4, i2, i1);
        }

        return { vertices, colors, indices };
    }

    createBoxGeometry(width, height, depth) {
        const vertices = [
            // Cara frontal
            -width/2, -height/2,  depth/2,
             width/2, -height/2,  depth/2,
             width/2,  height/2,  depth/2,
            -width/2,  height/2,  depth/2,
            
            // Cara trasera
            -width/2, -height/2, -depth/2,
            -width/2,  height/2, -depth/2,
             width/2,  height/2, -depth/2,
             width/2, -height/2, -depth/2,
            
            // Cara superior
            -width/2,  height/2, -depth/2,
            -width/2,  height/2,  depth/2,
             width/2,  height/2,  depth/2,
             width/2,  height/2, -depth/2,
            
            // Cara inferior
            -width/2, -height/2, -depth/2,
             width/2, -height/2, -depth/2,
             width/2, -height/2,  depth/2,
            -width/2, -height/2,  depth/2,
            
            // Cara derecha
             width/2, -height/2, -depth/2,
             width/2,  height/2, -depth/2,
             width/2,  height/2,  depth/2,
             width/2, -height/2,  depth/2,
            
            // Cara izquierda
            -width/2, -height/2, -depth/2,
            -width/2, -height/2,  depth/2,
            -width/2,  height/2,  depth/2,
            -width/2,  height/2, -depth/2
        ];

        const colors = [];
        const color = [0.7, 0.7, 0.7];
        for (let i = 0; i < vertices.length / 3; i++) {
            colors.push(...color);
        }

        const indices = [
            0,  1,  2,    0,  2,  3,    // frontal
            4,  5,  6,    4,  6,  7,    // trasera
            8,  9,  10,   8,  10, 11,   // superior
            12, 13, 14,   12, 14, 15,   // inferior
            16, 17, 18,   16, 18, 19,   // derecha
            20, 21, 22,   20, 22, 23    // izquierda
        ];

        return { vertices, colors, indices };
    }

    createDockingPortGeometry(radius = 0.2) {
        const vertices = [];
        const colors = [];
        const indices = [];

        // Crear puerto de acoplamiento como un pequeño cilindro
        const segments = 8;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            vertices.push(x, -0.1, z);
            colors.push(1.0, 1.0, 0.0); // Amarillo

            vertices.push(x, 0.1, z);
            colors.push(1.0, 1.0, 0.0);
        }

        // Crear índices
        for (let i = 0; i < segments; i++) {
            const i1 = i * 2;
            const i2 = i1 + 1;
            const i3 = ((i + 1) % segments) * 2;
            const i4 = i3 + 1;

            indices.push(i1, i2, i3);
            indices.push(i2, i4, i3);
        }

        return { vertices, colors, indices };
    }

    generateModule3D(moduleType, parameters = {}) {
        const moduleData = this.moduleDatabase[moduleType];
        if (!moduleData) return null;

        const diameter = parameters.diameter || 3.0;
        const length = parameters.length || 7.0;
        const width = parameters.width || 2.0;
        const height = parameters.height || 2.0;
        const depth = parameters.depth || 2.0;

        let geometry;
        if (moduleType === 'halo') {
            geometry = this.createCylinderGeometry(diameter/2, length);
        } else {
            geometry = this.createBoxGeometry(width, height, depth);
        }

        // Crear buffers
        const gl = this.gl;
        const vertexBuffer = gl.createBuffer();
        const colorBuffer = gl.createBuffer();
        const indexBuffer = gl.createBuffer();

        // Configurar vértices
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), gl.STATIC_DRAW);

        // Configurar colores
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.colors), gl.STATIC_DRAW);

        // Configurar índices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);

        // Crear puertos de acoplamiento
        const dockingPorts = [];
        const portGeometry = this.createDockingPortGeometry();
        
        for (let i = 0; i < moduleData.dockingPorts; i++) {
            const portBuffer = gl.createBuffer();
            const portColorBuffer = gl.createBuffer();
            const portIndexBuffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, portBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(portGeometry.vertices), gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, portColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(portGeometry.colors), gl.STATIC_DRAW);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, portIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(portGeometry.indices), gl.STATIC_DRAW);

            dockingPorts.push({
                buffers: {
                    vertex: portBuffer,
                    color: portColorBuffer,
                    index: portIndexBuffer
                },
                indices: portGeometry.indices.length,
                position: this.calculateDockingPortPosition(i, moduleData.dockingPorts, diameter/2, length),
                connected: false
            });
        }

        return {
            type: moduleType,
            data: moduleData,
            geometry: geometry,
            buffers: {
                vertex: vertexBuffer,
                color: colorBuffer,
                index: indexBuffer
            },
            indices: geometry.indices.length,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            dockingPorts: dockingPorts,
            selected: false,
            connections: []
        };
    }

    calculateDockingPortPosition(index, totalPorts, radius, length) {
        const angle = (index / totalPorts) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return [x, 0, z];
    }

    startRender() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.render();
    }

    render() {
        const gl = this.gl;
        
        // Limpiar canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Configurar matrices
        this.setupMatrices();

        // Renderizar módulos
        this.modules.forEach((module, index) => {
            this.renderModule(module, index);
        });

        // Renderizar conexiones
        this.renderConnections();

        // Solicitar siguiente frame
        this.animationId = requestAnimationFrame(() => this.render());
    }

    setupMatrices() {
        const gl = this.gl;
        
        // Matriz de proyección
        const fov = 45 * Math.PI / 180;
        const aspect = this.canvas.width / this.canvas.height;
        const near = 0.1;
        const far = 100.0;
        
        const projectionMatrix = this.createPerspectiveMatrix(fov, aspect, near, far);
        gl.uniformMatrix4fv(this.projectionMatrixLocation, false, projectionMatrix);

        // Matriz de vista modelo
        const modelViewMatrix = this.createModelViewMatrix();
        gl.uniformMatrix4fv(this.modelViewMatrixLocation, false, modelViewMatrix);
    }

    createPerspectiveMatrix(fov, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        const rangeInv = 1.0 / (near - far);
        
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }

    createModelViewMatrix() {
        // Matriz de identidad con cámara en posición [0, 0, 10]
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, -10, 1
        ];
    }

    createTransformMatrix(module) {
        const [x, y, z] = module.position;
        const [sx, sy, sz] = module.scale;
        const [rx, ry, rz] = module.rotation;

        // Matriz de transformación combinada
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            x, y, z, 1
        ];
    }

    renderModule(module, index) {
        const gl = this.gl;
        
        // Configurar matriz de transformación
        const transformMatrix = this.createTransformMatrix(module);
        gl.uniformMatrix4fv(this.transformMatrixLocation, false, transformMatrix);
        
        // Configurar buffers del módulo
        gl.bindBuffer(gl.ARRAY_BUFFER, module.buffers.vertex);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, module.buffers.color);
        gl.enableVertexAttribArray(this.colorLocation);
        gl.vertexAttribPointer(this.colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, module.buffers.index);

        // Dibujar módulo
        gl.drawElements(gl.TRIANGLES, module.indices, gl.UNSIGNED_SHORT, 0);

        // Renderizar puertos de acoplamiento
        module.dockingPorts.forEach(port => {
            this.renderDockingPort(port, module);
        });

        // Renderizar handles de redimensionamiento si está seleccionado
        if (module.selected) {
            this.renderResizeHandles(module);
        }
    }

    renderDockingPort(port, module) {
        const gl = this.gl;
        
        // Configurar matriz de transformación para el puerto
        const [px, py, pz] = port.position;
        const [mx, my, mz] = module.position;
        
        const transformMatrix = [
            0.1, 0, 0, 0,
            0, 0.1, 0, 0,
            0, 0, 0.1, 0,
            mx + px, my + py, mz + pz, 1
        ];
        
        gl.uniformMatrix4fv(this.transformMatrixLocation, false, transformMatrix);
        
        // Configurar buffers del puerto
        gl.bindBuffer(gl.ARRAY_BUFFER, port.buffers.vertex);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, port.buffers.color);
        gl.enableVertexAttribArray(this.colorLocation);
        gl.vertexAttribPointer(this.colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, port.buffers.index);

        // Dibujar puerto
        gl.drawElements(gl.TRIANGLES, port.indices, gl.UNSIGNED_SHORT, 0);
    }

    renderResizeHandles(module) {
        // Implementar handles de redimensionamiento
        // Por ahora, solo marcar visualmente que está seleccionado
        const gl = this.gl;
        
        // Cambiar color del módulo seleccionado
        const originalColors = module.geometry.colors.slice();
        module.geometry.colors = module.geometry.colors.map((_, i) => {
            return i % 3 === 0 ? 1.0 : 0.5; // Rojo para seleccionado
        });
        
        // Actualizar buffer de colores
        gl.bindBuffer(gl.ARRAY_BUFFER, module.buffers.color);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(module.geometry.colors), gl.STATIC_DRAW);
        
        // Restaurar colores originales después del renderizado
        setTimeout(() => {
            module.geometry.colors = originalColors;
            gl.bindBuffer(gl.ARRAY_BUFFER, module.buffers.color);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(module.geometry.colors), gl.STATIC_DRAW);
        }, 0);
    }

    renderConnections() {
        const gl = this.gl;
        
        this.connections.forEach(connection => {
            // Crear geometría de línea para la conexión
            const lineGeometry = this.createLineGeometry(
                connection.from.position,
                connection.to.position
            );
            
            // Crear buffers temporales para la línea
            const lineBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineGeometry.vertices), gl.STATIC_DRAW);
            
            const lineColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineGeometry.colors), gl.STATIC_DRAW);
            
            // Configurar matriz de transformación
            const transformMatrix = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
            gl.uniformMatrix4fv(this.transformMatrixLocation, false, transformMatrix);
            
            // Renderizar línea
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
            gl.enableVertexAttribArray(this.positionLocation);
            gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
            gl.enableVertexAttribArray(this.colorLocation);
            gl.vertexAttribPointer(this.colorLocation, 3, gl.FLOAT, false, 0, 0);
            
            gl.drawArrays(gl.LINES, 0, 2);
            
            // Limpiar buffers temporales
            gl.deleteBuffer(lineBuffer);
            gl.deleteBuffer(lineColorBuffer);
        });
    }

    createLineGeometry(from, to) {
        const vertices = [
            from[0], from[1], from[2],
            to[0], to[1], to[2]
        ];
        
        const colors = [
            0.0, 1.0, 0.0, // Verde para conexiones
            0.0, 1.0, 0.0
        ];
        
        return { vertices, colors };
    }

    setupEventListeners() {
        // Selección de hábitat
        document.querySelectorAll('.habitat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.habitat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentHabitat = e.target.dataset.habitat;
                this.showNotification(`Hábitat cambiado a ${this.habitatDatabase[this.currentHabitat].name}`, 'info');
            });
        });

        // Selección de módulos
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedModule = e.target.dataset.module;
                this.showNotification(`Módulo seleccionado: ${this.moduleDatabase[this.selectedModule].name}`, 'info');
            });
        });

        // Generar módulo
        document.getElementById('generateModule').addEventListener('click', () => {
            this.generateParametricModule();
        });

        // Limpiar hábitat
        document.getElementById('clearHabitat').addEventListener('click', () => {
            this.clearHabitat();
        });

        // Eventos de mouse para interacción
        this.setupMouseEvents();

        // Actualizar parámetros
        this.setupParameterListeners();
    }

    setupMouseEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        });

        this.canvas.addEventListener('wheel', (e) => {
            this.handleWheel(e);
        });
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convertir coordenadas de pantalla a coordenadas 3D
        const worldPos = this.screenToWorld(x, y);
        
        // Verificar si se hizo clic en un módulo
        const clickedModule = this.getModuleAtPosition(worldPos);
        
        if (clickedModule !== -1) {
            this.selectedModuleIndex = clickedModule;
            this.modules[clickedModule].selected = true;
            this.dragging = true;
            
            // Calcular offset de arrastre
            this.dragOffset = {
                x: worldPos[0] - this.modules[clickedModule].position[0],
                y: worldPos[2] - this.modules[clickedModule].position[2]
            };
            
            this.showNotification(`Módulo ${this.modules[clickedModule].type.toUpperCase()} seleccionado`, 'info');
        } else {
            // Deseleccionar todos los módulos
            this.modules.forEach(module => module.selected = false);
            this.selectedModuleIndex = -1;
        }
    }

    handleMouseMove(e) {
        if (this.dragging && this.selectedModuleIndex !== -1) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const worldPos = this.screenToWorld(x, y);
            
            // Actualizar posición del módulo
            this.modules[this.selectedModuleIndex].position[0] = worldPos[0] - this.dragOffset.x;
            this.modules[this.selectedModuleIndex].position[2] = worldPos[2] - this.dragOffset.y;
            
            // Actualizar conexiones
            this.updateConnections();
        }
    }

    handleMouseUp(e) {
        this.dragging = false;
        this.resizing = false;
        this.resizeHandle = null;
    }

    handleWheel(e) {
        e.preventDefault();
        
        // Zoom con la rueda del mouse
        const delta = e.deltaY > 0 ? 1.1 : 0.9;
        
        if (this.selectedModuleIndex !== -1) {
            const module = this.modules[this.selectedModuleIndex];
            module.scale[0] *= delta;
            module.scale[1] *= delta;
            module.scale[2] *= delta;
            
            // Limitar escala
            module.scale[0] = Math.max(0.1, Math.min(5.0, module.scale[0]));
            module.scale[1] = Math.max(0.1, Math.min(5.0, module.scale[1]));
            module.scale[2] = Math.max(0.1, Math.min(5.0, module.scale[2]));
        }
    }

    screenToWorld(screenX, screenY) {
        // Conversión básica de coordenadas de pantalla a mundo 3D
        const x = (screenX / this.canvas.width) * 10 - 5;
        const z = (screenY / this.canvas.height) * 10 - 5;
        return [x, 0, z];
    }

    getModuleAtPosition(worldPos) {
        // Verificar colisión con módulos
        for (let i = 0; i < this.modules.length; i++) {
            const module = this.modules[i];
            const [mx, my, mz] = module.position;
            const [sx, sy, sz] = module.scale;
            
            // Verificación simple de colisión (círculo para cilindros, caja para otros)
            if (module.type === 'halo') {
                const distance = Math.sqrt(
                    Math.pow(worldPos[0] - mx, 2) + 
                    Math.pow(worldPos[2] - mz, 2)
                );
                if (distance < (1.5 * sx)) {
                    return i;
                }
            } else {
                if (Math.abs(worldPos[0] - mx) < sx && 
                    Math.abs(worldPos[2] - mz) < sz) {
                    return i;
                }
            }
        }
        return -1;
    }

    updateConnections() {
        // Actualizar posiciones de las conexiones cuando se mueven los módulos
        this.connections.forEach(connection => {
            const fromModule = this.modules[connection.from.moduleIndex];
            const toModule = this.modules[connection.to.moduleIndex];
            
            connection.from.position = [
                fromModule.position[0] + connection.from.portPosition[0],
                fromModule.position[1] + connection.from.portPosition[1],
                fromModule.position[2] + connection.from.portPosition[2]
            ];
            
            connection.to.position = [
                toModule.position[0] + connection.to.portPosition[0],
                toModule.position[1] + connection.to.portPosition[1],
                toModule.position[2] + connection.to.portPosition[2]
            ];
        });
    }

    connectModules(fromIndex, toIndex, fromPortIndex, toPortIndex) {
        const fromModule = this.modules[fromIndex];
        const toModule = this.modules[toIndex];
        
        if (!fromModule || !toModule) return false;
        
        // Verificar si ya están conectados
        const existingConnection = this.connections.find(conn => 
            (conn.from.moduleIndex === fromIndex && conn.to.moduleIndex === toIndex) ||
            (conn.from.moduleIndex === toIndex && conn.to.moduleIndex === fromIndex)
        );
        
        if (existingConnection) {
            this.showNotification('Los módulos ya están conectados', 'warning');
            return false;
        }
        
        // Verificar límites de conexiones
        if (fromModule.connections.length >= fromModule.data.maxConnections) {
            this.showNotification('Módulo origen ha alcanzado su límite de conexiones', 'warning');
            return false;
        }
        
        if (toModule.connections.length >= toModule.data.maxConnections) {
            this.showNotification('Módulo destino ha alcanzado su límite de conexiones', 'warning');
            return false;
        }
        
        // Crear conexión
        const connection = {
            from: {
                moduleIndex: fromIndex,
                portIndex: fromPortIndex,
                portPosition: fromModule.dockingPorts[fromPortIndex].position,
                position: [
                    fromModule.position[0] + fromModule.dockingPorts[fromPortIndex].position[0],
                    fromModule.position[1] + fromModule.dockingPorts[fromPortIndex].position[1],
                    fromModule.position[2] + fromModule.dockingPorts[fromPortIndex].position[2]
                ]
            },
            to: {
                moduleIndex: toIndex,
                portIndex: toPortIndex,
                portPosition: toModule.dockingPorts[toPortIndex].position,
                position: [
                    toModule.position[0] + toModule.dockingPorts[toPortIndex].position[0],
                    toModule.position[1] + toModule.dockingPorts[toPortIndex].position[1],
                    toModule.position[2] + toModule.dockingPorts[toPortIndex].position[2]
                ]
            }
        };
        
        this.connections.push(connection);
        fromModule.connections.push(connection);
        toModule.connections.push(connection);
        
        // Marcar puertos como conectados
        fromModule.dockingPorts[fromPortIndex].connected = true;
        toModule.dockingPorts[toPortIndex].connected = true;
        
        this.showNotification(`Módulos ${fromModule.type.toUpperCase()} y ${toModule.type.toUpperCase()} conectados`, 'success');
        return true;
    }

    setupParameterListeners() {
        const parameters = [
            'moduleDiameter', 'moduleLength', 'wallThickness',
            'crewCapacity', 'habitableVolume', 'windowCount',
            'solarPanels', 'dockingPorts'
        ];

        parameters.forEach(paramId => {
            const element = document.getElementById(paramId);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.updateParameterDisplay(paramId, e.target.value);
                });
            }
        });
    }

    updateParameterDisplay(paramId, value) {
        const valueElement = document.getElementById(paramId.replace('module', '').replace('Capacity', '').replace('Volume', '').replace('Count', '').replace('Panels', '').replace('Ports', '') + 'Value');
        if (valueElement) {
            switch (paramId) {
                case 'moduleDiameter':
                    valueElement.textContent = `${value}m`;
                    break;
                case 'moduleLength':
                    valueElement.textContent = `${value}m`;
                    break;
                case 'wallThickness':
                    valueElement.textContent = `${value}cm`;
                    break;
                case 'crewCapacity':
                    valueElement.textContent = `${value} personas`;
                    break;
                case 'habitableVolume':
                    valueElement.textContent = `${value}m³`;
                    break;
                case 'windowCount':
                    valueElement.textContent = `${value} ventanas`;
                    break;
                case 'solarPanels':
                    valueElement.textContent = `${value} paneles`;
                    break;
                case 'dockingPorts':
                    valueElement.textContent = `${value} puertos`;
                    break;
            }
        }
    }

    generateParametricModule() {
        if (!this.selectedModule) {
            this.showNotification('Selecciona un tipo de módulo primero', 'error');
            return;
        }

        const parameters = this.getDesignParameters();
        const module = this.generateModule3D(this.selectedModule, parameters);
        
        if (module) {
            // Posicionar módulo
            module.position = [this.modules.length * 4, 0, 0];
            
            // Aplicar color del módulo
            const moduleData = this.moduleDatabase[this.selectedModule];
            module.geometry.colors = module.geometry.colors.map((_, i) => {
                return moduleData.color[i % 3];
            });

            this.modules.push(module);
            this.updateHabitatSummary();
            this.evaluateHabitat();
            
            this.showNotification(`Módulo ${this.selectedModule.toUpperCase()} generado exitosamente`, 'success');
        }
    }

    getDesignParameters() {
        return {
            diameter: parseFloat(document.getElementById('moduleDiameter').value),
            length: parseFloat(document.getElementById('moduleLength').value),
            width: parseFloat(document.getElementById('moduleLength').value) * 0.8,
            height: parseFloat(document.getElementById('moduleLength').value) * 0.6,
            depth: parseFloat(document.getElementById('moduleLength').value) * 0.6
        };
    }

    updateHabitatSummary() {
        const moduleCount = this.modules.length;
        const totalVolume = this.modules.reduce((sum, module) => {
            const moduleData = this.moduleDatabase[module.type];
            return sum + (moduleData.baseVolume || 0);
        }, 0);
        const totalCapacity = this.modules.reduce((sum, module) => {
            const moduleData = this.moduleDatabase[module.type];
            return sum + (moduleData.baseCapacity || 0);
        }, 0);
        const totalConnections = this.connections.length;

        document.getElementById('moduleCount').textContent = moduleCount;
        document.getElementById('totalVolume').textContent = `${totalVolume} m³`;
        document.getElementById('totalCapacity').textContent = totalCapacity;
        
        // Mostrar conexiones si existe el elemento
        const connectionsElement = document.getElementById('totalConnections');
        if (connectionsElement) {
            connectionsElement.textContent = totalConnections;
        }
    }

    evaluateHabitat() {
        if (this.modules.length === 0) {
            document.getElementById('evaluationResults').innerHTML = `
                <div class="no-results">
                    <p>Añade módulos al hábitat para ver la evaluación</p>
                </div>
            `;
            return;
        }

        const totalVolume = this.modules.reduce((sum, module) => {
            const moduleData = this.moduleDatabase[module.type];
            return sum + (moduleData.baseVolume || 0);
        }, 0);
        
        const totalCapacity = this.modules.reduce((sum, module) => {
            const moduleData = this.moduleDatabase[module.type];
            return sum + (moduleData.baseCapacity || 0);
        }, 0);

        const volumeScore = Math.min(1, totalVolume / (this.crewCount * 50));
        const capacityScore = Math.min(1, totalCapacity / this.crewCount);
        const connectivityScore = Math.min(1, this.connections.length / Math.max(1, this.modules.length - 1));
        const finalScore = (volumeScore * 0.4 + capacityScore * 0.4 + connectivityScore * 0.2) * 100;

        let scoreClass = 'red';
        let scoreText = 'Crítico';
        if (finalScore >= 80) {
            scoreClass = 'green';
            scoreText = 'Excelente';
        } else if (finalScore >= 60) {
            scoreClass = 'amber';
            scoreText = 'Aceptable';
        }

        document.getElementById('evaluationResults').innerHTML = `
            <div class="evaluation-result ${scoreClass}">
                <div class="score ${scoreClass}">${scoreText}: ${finalScore.toFixed(1)}%</div>
                <div class="details">
                    <p><strong>Volumen:</strong> ${totalVolume} m³ (${(volumeScore * 100).toFixed(1)}%)</p>
                    <p><strong>Capacidad:</strong> ${totalCapacity} personas (${(capacityScore * 100).toFixed(1)}%)</p>
                    <p><strong>Conectividad:</strong> ${this.connections.length} conexiones (${(connectivityScore * 100).toFixed(1)}%)</p>
                    <p><strong>Hábitat:</strong> ${this.habitatDatabase[this.currentHabitat].name}</p>
                </div>
            </div>
        `;
    }

    clearHabitat() {
        this.modules.forEach(module => {
            const gl = this.gl;
            gl.deleteBuffer(module.buffers.vertex);
            gl.deleteBuffer(module.buffers.color);
            gl.deleteBuffer(module.buffers.index);
            
            // Limpiar buffers de puertos
            module.dockingPorts.forEach(port => {
                gl.deleteBuffer(port.buffers.vertex);
                gl.deleteBuffer(port.buffers.color);
                gl.deleteBuffer(port.buffers.index);
            });
        });
        
        this.modules = [];
        this.connections = [];
        this.selectedModuleIndex = -1;
        this.updateHabitatSummary();
        this.evaluateHabitat();
        this.showNotification('Hábitat limpiado', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 1000;
            text-align: center;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

// Inicializar CoreMod cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Página cargada, iniciando CoreMod con interconexión...');
    window.coreMod = new CoreMod();
});