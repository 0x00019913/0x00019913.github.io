/*
  HELPER CLASS - could have been embedded in stage.js, but separated for neatness.
  Usage: load(idx) to load the preset with index idx. A preset is just a function
  that adds stuff to the scene.
*/

SceneLoader = function(scene, container, camera, physics) {
  this.scene = scene;
  this.container = container;
  this.camera = camera;
  this.physics = physics;

  var _this = this;

  this.presets = [
    // sky scene
    function() {
      var sphereGeo = new THREE.SphereGeometry(20000, 32,15);
      var sphereMat = new THREE.ShaderMaterial({
        uniforms: {
          sunPos: { value: new THREE.Vector3(0,6680,-18851) },
          turbidity: { value: 10 },
          mieCoefficient: { value: 1 },
          g: { value: .8 },
          luminance: { value: 1.1 }
        },
        vertexShader: sun_vert,
        fragmentShader: sun_frag,
        side: THREE.BackSide
      });
      var sphere = new THREE.Mesh(sphereGeo, sphereMat);
      _this.scene.add(sphere);

      var player = new Entity("player", {
        camera: _this.camera,
        container: _this.container,
        controlParams: {
          type: "FreeCam",
          r: 10,
          rmax: 10,
          rmin:10,
          phi: Math.PI/2,
          theta: 3*Math.PI/5
        }
      });
      _this.physics.addEntity(player);
    },

    // stairwell
    function() {
      var envGenerator = new EnvGenerator(_this.scene);
      envGenerator.load('/assets/models/stairwell/stairwell.json');

      _this.scene.fog = new THREE.FogExp2(0x0, 0.0001);
      _this.scene.background = new THREE.Color(0x0);

      var player = new Entity("player", {
        camera: _this.camera,
        container: _this.container,
        controlParams: {
          type: "PlayerCam",
          phi: Math.PI/8,
          theta: 5*Math.PI/7
        }
      });
      _this.physics.addEntity(player);
    },

    // buildings
    function() {
      var envGenerator = new EnvGenerator(_this.scene);
      envGenerator.load('/assets/models/buildings/buildings.json');

      _this.scene.fog = new THREE.FogExp2(0xaaaaaa, 0.00022);
      _this.scene.background = new THREE.Color(0xaaaaaa);

      var player = new Entity("player", {
        camera: _this.camera,
        container: _this.container,
        controlParams: {
          type: "FreeCam",
          r: 2000,
          rmax: 2000,
          rmin: 2000,
          xPanRate: 0,
          yPanRate: 0,
          phiMin: Math.PI/2,
          phiMax: 3*Math.PI/2,
          phi: 7*Math.PI/8,
          theta: 7*Math.PI/10
        }
      });
      _this.physics.addEntity(player);
    },
    // chess piece scene
    function() {
      var skySize = 1000.0;
      var skyRate = 0.005;
      var noiseScale = new THREE.Vector2(120, 48);
      var offset = new THREE.Vector2();
      var subOffset = new THREE.Vector2(0.0, 1.0);
      var skyGeo = new THREE.PlaneGeometry(skySize,skySize);
      var skyMat = new THREE.ShaderMaterial({
        uniforms: {
          skySize: { value: skySize },
          noiseScale: { value: noiseScale },
          offset: { value: offset },
          subOffset: { value: subOffset }
        },
        vertexShader: noise_vert,
        fragmentShader: noise_frag,
        side: THREE.DoubleSide
      });
      skyMesh = new THREE.Mesh(skyGeo, skyMat);
      skyMesh.rotateX(Math.PI/2);
      skyMesh.rotateY(Math.PI);
      skyMesh.position.y += 80;
      skyMesh.position.z += 40;
      _this.scene.add(skyMesh);
      _this.physics.addAnimation(function() { offset.y += skyRate; subOffset.y += skyRate*0.51; });

      var loader = new THREE.OBJLoader();
      var kingMat = new THREE.MeshStandardMaterial({
        color: 0x181818,
        shading: THREE.SmoothShading,
        roughness: 0.5,
        metalness: 1
      });
      var kingMatFlat = kingMat.clone();
      kingMatFlat.shading = THREE.FlatShading;
      kingMatFlat.roughness = 0.1;
      kingMatFlat.metalness = 0.7;
      loader.load("/assets/models/king/body.obj", handleLoad.bind(null, true));
      loader.load("/assets/models/king/crown.obj", handleLoad.bind(null, false));
      function handleLoad(smoothShading, r) {
        var mesh;
        if (smoothShading) {
          // convert to normal geo because BufferGeometry doesn't have mergeVertices(),
          // which I need to do smooth shading
          var geo = new THREE.Geometry().fromBufferGeometry(r.children[0].geometry);
          geo.mergeVertices();
          geo.computeVertexNormals();
          mesh = new THREE.Mesh(geo, kingMat);
        }
        else {
          mesh = r.children[0];
          mesh.material = kingMatFlat;
        }
        mesh.scale.multiplyScalar(0.5);
        mesh.position.y -= 2;
        _this.scene.add(mesh);
      }

      var light0 = new THREE.PointLight(0xffff99, 10, 0, 2);
      light0.position.x += 4;
      light0.position.z -= 2;
      _this.scene.add(light0);
      var light1 = new THREE.PointLight(0x66ff66, 0.5, 0, 2);
      light1.position.x += 4;
      light1.position.z -= 2;
      _this.scene.add(light1);
      var light2 = new THREE.PointLight(0xaaffaa, 0.5, 0, 2);
      light2.position.x -= 4;
      _this.scene.add(light2);
      var light3 = new THREE.PointLight(0xaaaaff, 1, 0, 2);
      light3.position.x += 4;
      light3.position.z -= 2;
      _this.scene.add(light3);
      var light4 = new THREE.PointLight(0xffff99, 1, 0, 2);
      light4.position.x -= 4;
      light4.positionly += 4;
      light4.position.z -= 2;
      _this.scene.add(light4);
      var light5 = new THREE.PointLight(0xddddff, 0.5, 0, 2);
      light5.position.x -= 4;
      light5.position.y += 10;
      _this.scene.add(light5);
      var light6 = new THREE.PointLight(0xffbb99, 4, 0, 2);
      light6.position.x -= 2;
      light6.positionly += 4;
      light6.position.z -= 1;
      _this.scene.add(light6);

      _this.camera.fov = 30;
      _this.camera.updateProjectionMatrix();

      var player = new Entity("player", {
        camera: _this.camera,
        container: _this.container,
        controlParams: {
          type: "FreeCam",
          r: 5.3,
          phi: -Math.PI/2,
          theta: 5.5*Math.PI/8,
          phiRate: 0,
          thetaRate: 0,
          rRate: 0,
          xPanRate: 0,
          yPanRate: 0
        }
      });
      _this.physics.addEntity(player);
    },
    function() {
      var offset = new THREE.Vector3();
      var offsetRateY = 0.0005;

      _this.camera.position.set(0,1,0);
      _this.camera.lookAt(new THREE.Vector3());

      var geo = new THREE.PlaneGeometry(1,1);
      var mesh = new THREE.Mesh(geo);
      mesh.rotateX(3*Math.PI/2);
      mesh.scale.multiplyScalar(5);
      var vert = "\
      /* vertex shader */\n\
      varying vec3 vPos;\n\
      \n\
      void main() {\n\
        vPos = position;\n\
        vPos += 0.5; /* positions in unit plane go from -0.5 to 0.5 */\n\
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\
      }";
      var frag = "\
      /* fragment shader */\n\
      uniform vec3 offset;\n\
      \n\
      varying vec3 vPos;\n\
      \n\
      vec3 mod289(vec3 x) {  return x - floor(x * (1.0/289.0)) * 289.0;\n\
      }\n\
      \n\
      vec3 permute(vec3 x) {\n\
        return mod289(((x*34.0) + 1.0) * x);\n\
      }\n\
      \n\
      const float F2 = 0.5*(sqrt(3.0)-1.0);\n\
      const float G2 = (3.0-sqrt(3.0))/6.0;\n\
      \n\
      /* simplex noise shaders combine some of the code in the Gustavson paper,\n\
         http://weber.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf,\n\
         and the code in his repo,\n\
         https://github.com/stegu/webgl-noise/ */\n\
      float simplex(vec2 v) {\n\
        \n\
        /* base corner */\n\
        vec2 i = floor(v + (v.x+v.y)*F2);\n\
        vec2 x0 = v - i + (i.x+i.y)*G2;\n\
        \n\
        /* middle and far corners */\n\
        vec2 i1;\n\
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n\
        vec2 x1 = x0 - i1 + G2;\n\
        vec2 x2 = x0 - 1.0 + 2.0*G2;\n\
        \n\
        i = mod289(vec3(i, 0.0)).xy;\n\
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\n\
        \n\
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);\n\
        m = m*m;\n\
        m = m*m;\n\
        \n\
        vec3 x = 2.0 * fract(p / 41.0) - 1.0;\n\
        vec3 h = abs(x) - 0.5;\n\
        vec3 ox = floor(x + 0.5);\n\
        vec3 a0 = x-ox;\n\
        \n\
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);\n\
        \n\
        vec3 g;\n\
        g.x = a0.x*x0.x + h.x*x0.y;\n\
        g.y = a0.y*x1.x + h.y*x1.y;\n\
        g.z = a0.z*x2.x + h.z*x2.y;\n\
        \n\
        float intensity = 130.0 * dot(m,g);\n\
        return intensity*0.5+0.5;\n\
      }\n\
      float fbm(vec2 v, float lacunarity, float gain) {\n\
        const int octaves = 5;\n\
        float sum = 0.0;\n\
        float amp = 1.0;\n\
        float freq = 1.0;\n\
        /* Fun story. In my Ubuntu VM, putting the simplex() call in a loop causes\n\
           the shader to render black every time. Works fine on Windows. Why, GLSL,\n\
           why? So I unwrapped it to 7 octaves. */\n\
        sum += amp * simplex(v * freq);\n\
        freq *= lacunarity;\n\
        amp *= gain;\n\
        sum += amp * simplex(v * freq);\n\
        freq *= lacunarity;\n\
        amp *= gain;\n\
        sum += amp * simplex(v * freq);\n\
        freq *= lacunarity;\n\
        amp *= gain;\n\
        sum += amp * simplex(v * freq);\n\
        freq *= lacunarity;\n\
        amp *= gain;\n\
        sum += amp * simplex(v * freq);\n\
        freq *= lacunarity;\n\
        amp *= gain;\n\
        sum += amp * simplex(v * freq);\n\
        freq *= lacunarity;\n\
        amp *= gain;\n\
        sum += amp * simplex(v * freq);\n\
        freq *= lacunarity;\n\
        amp *= gain;\n\
        return sum;\n\
      }\n\
      \n\
      void main() {\n\
        vec2 p = (vPos.xy+offset.xy)*2.5;\n\
        float warpx = fbm(vPos.xy*2.0, 2.0, 0.5)*4.8;\n\
        float warpy = fbm(vPos.xy*2.0 + 1.0, 2.0, 0.5)*4.8;\n\
        p += vec2(warpx, warpy);\n\
        float intensity = 0.65*fbm(p, 2.0, 0.5)-0.1;\n\
        intensity = pow(intensity, 2.0);\n\
        vec3 level = clamp(vec3(intensity), 0.0, 1.0);\n\
        float greenLayer = clamp(abs(level.y-0.2), 0.0, 1.0)*0.15;\n\
        level.y += greenLayer;\n\
        gl_FragColor = vec4(level, 1.0);\n\
      }";
      var material = new THREE.ShaderMaterial({
        uniforms: {
          offset: { value: offset }
        },
        vertexShader: vert,
        fragmentShader: frag,
        side: THREE.DoubleSide
      });
      mesh.material = material;
      _this.scene.add(mesh);

      _this.physics.addAnimation(function() { offset.y += offsetRateY; });
    }
  ];
}

SceneLoader.prototype.load = function(idx) {
  if (idx.length===undefined) {
    this.presets[idx]();
  }
  else {
    var randomIdx = idx[Math.floor(Math.random()*idx.length)];
    this.presets[randomIdx]();
  }
}

/* SHADERS */

/* simplex noise shaders combine some of the code in the Gustavson paper,
   http://weber.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf,
   and the code in his repo,
   https://github.com/stegu/webgl-noise/ */
var noise_vert = " \
uniform float skySize; \
uniform vec2 noiseScale; \
\
varying vec2 vPos; \
void main() { \
  vPos = position.xy/skySize; \
  vPos += 0.5;\
  vPos *= noiseScale; \
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); \
}";
var noise_frag = " \
uniform vec2 offset; \
uniform vec2 subOffset; \
uniform vec2 noiseScale; \
\
varying vec2 vPos; \
\
vec3 mod289(vec3 x) {\
  return x - floor(x * (1.0/289.0)) * 289.0; \
} \
\
vec3 permute(vec3 x) { \
  return mod289(((x*34.0) + 1.0) * x); \
} \
\
const float F2 = 0.5*(sqrt(3.0)-1.0); \
const float G2 = (3.0-sqrt(3.0))/6.0; \
\
float simplex(vec2 v) { \
  \
  /* base corner */ \
  vec2 i = floor(v + (v.x+v.y)*F2); \
  vec2 x0 = v - i + (i.x+i.y)*G2; \
  \
  /* middle and far corners */ \
  vec2 i1; \
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); \
  vec2 x1 = x0 - i1 + G2; \
  vec2 x2 = x0 - 1.0 + 2.0*G2; \
  \
  i = mod289(vec3(i, 0.0)).xy; \
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)); \
  \
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0); \
  m = m*m; \
  m = m*m; \
  \
  vec3 x = 2.0 * fract(p / 41.0) - 1.0; \
  vec3 h = abs(x) - 0.5; \
  vec3 ox = floor(x + 0.5); \
  vec3 a0 = x-ox; \
  \
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h); \
  \
  vec3 g; \
  g.x = a0.x*x0.x + h.x*x0.y; \
  g.y = a0.y*x1.x + h.y*x1.y; \
  g.z = a0.z*x2.x + h.z*x2.y; \
  \
  float intensity = 130.0 * dot(m,g); \
  return intensity; \
} \
float fbm(vec2 v, float lacunarity, float gain) { \
  const int octaves = 5; \
  float sum = 0.0; \
  float amp = 1.0; \
  float freq = 1.0; \
  /* Fun story. In my Ubuntu VM, putting the simplex() call in a loop causes \
     the shader to render black every time. Works fine on Windows. Why, GLSL, \
     why? So I unwrapped it to 7 octaves. */ \
  sum += amp * simplex(v * freq); \
  freq *= lacunarity; \
  amp *= gain; \
  sum += amp * simplex(v * freq); \
  freq *= lacunarity; \
  amp *= gain; \
  sum += amp * simplex(v * freq); \
  freq *= lacunarity; \
  amp *= gain; \
  sum += amp * simplex(v * freq); \
  freq *= lacunarity; \
  amp *= gain; \
  sum += amp * simplex(v * freq); \
  freq *= lacunarity; \
  amp *= gain; \
  sum += amp * simplex(v * freq); \
  freq *= lacunarity; \
  amp *= gain; \
  sum += amp * simplex(v * freq); \
  freq *= lacunarity; \
  amp *= gain; \
  return sum; \
} \
\
void main() { \
  float intensity = 0.70*fbm((vPos+offset)*0.15, 2.0, 0.5); \
  float noiseSub = 0.2*fbm(vPos+subOffset, 2.0, 0.5); \
  intensity -= noiseSub; \
  vec3 level = clamp(vec3(intensity), 0.0, 1.0); \
  /* sky color */ \
  vec3 color0 = 0.20*vec3(0.3, 0.08, 0.07); \
  /* cloud color */ \
  vec3 color1 = 0.5*vec3(0.94, 0.80, 0.60); \
  vec3 color = 3.0*mix(color0, color1, level); \
  color += 3.3*clamp(vPos.y/noiseScale.y * 7.0 - 4.0, 0.0, 1.0)*color0; \
  gl_FragColor = vec4(color, 0.0); \
}";

var sun_vert = " \
uniform vec3 sunPos; \
uniform float turbidity; \
uniform float mieCoefficient; \
\
varying vec3 vWorldPos; \
varying vec3 vSunDir; \
varying float vSunfade; \
varying vec3 vBetaM; \
varying float vSunE; \
\
const vec3 up = vec3(0.0, 1.0, 0.0); \
\
const float e = 2.71828182845904523536028747135266249775724709369995957; \
const float pi = 3.141592653589793238462643383279502884197169; \
\
const float v = 4.0; \
const vec3 K = vec3(0.686, 0.678, 0.666); \
\
const vec3 lambda = vec3(60E-9, 550E-9, 850E-9); \
\
void main() { \
  vec4 worldPos = modelMatrix * vec4(position, 1.0); \
  vWorldPos = worldPos.xyz; \
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); \
  \
  vSunDir = normalize(sunPos); \
  \
  float sunTheta = acos(dot(vSunDir, up)); \
  vSunE = 1000.0 * max(0.0, 1.0 - pow(e, -(sunTheta/49.5))); \
  vSunfade = clamp(exp(sunPos.y / length(sunPos)), -1.0, 1.0); \
  \
  float c = (0.2 * turbidity) * 10E-18; \
  vBetaM = (0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v-2.0)) * K) * mieCoefficient; \
}";
var sun_frag = " \
\
varying vec3 vWorldPos; \
varying vec3 vSunDir; \
varying float vSunfade; \
varying vec3 vBetaM; \
varying float vSunE; \
\
uniform float luminance; \
uniform float g; \
\
const float pi = 3.141592653589793238462643383279502884197169; \
\
const float mieZenithLength = 1.25e3; \
const vec3 up = vec3(0.0, 1.0, 0.0); \
\
const float A = 0.15; \
const float B = 0.50; \
const float C = 0.10; \
const float D = 0.20; \
const float E = 0.02; \
const float F = 0.30; \
\
void main() { \
  float thetaZ = acos(max(0.0, dot(up, normalize(vWorldPos)))); \
  float sM = mieZenithLength / (cos(thetaZ) + 0.15 * pow(1.63860237 - thetaZ, -1.253)); \
  \
  vec3 Fex = exp(-vBetaM * sM); \
  \
  float cosTheta = dot(normalize(vWorldPos), vSunDir); \
  \
  float mPhase = (1.0 / (4.0*pi)) * (1.0-pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5); \
  vec3 betaMTheta = vBetaM * mPhase; \
  \
  vec3 Lin = pow(vSunE * mPhase * (1.0 - Fex),vec3(1.5)); \
  \
  vec3 x = (log2(2.0/pow(luminance,4.0))) * Lin * 0.04; \
  vec3 color = ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F; \
  \
  vec3 retColor = pow(color, vec3(1.0/(1.2+(1.2*vSunfade)))); \
  gl_FragColor.rgb = retColor + 0.1; \
  gl_FragColor.a = 1.0; \
}";
