// Get the container for the 3D logo
const container = document.querySelector('.logo-3d-container');
        
// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0xffffff, 1); // Pure white background
container.appendChild(renderer.domElement);

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Brighter ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Stronger directional light
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add a second directional light from another angle
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight2.position.set(-1, -1, 1);
scene.add(directionalLight2);

// Create the 'b' shape
function createLetterB() {
    const group = new THREE.Group();

    // Vertical bar of the 'b'
    const verticalGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 32);
    const verticalMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333, // Lighter black for better visibility
        roughness: 0.5,
        metalness: 0.6,
        emissive: 0x222222, // Add some self-illumination
        emissiveIntensity: 0.2
    });
    const verticalBar = new THREE.Mesh(verticalGeometry, verticalMaterial);
    verticalBar.position.set(-0.8, 0, 0);
    group.add(verticalBar);

    // Curved part of the 'b' (full circle)
    const torusGeometry = new THREE.TorusGeometry(0.8, 0.2, 16, 100, Math.PI * 2);
    const torusMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333, // Lighter black for better visibility
        roughness: 0.5,
        metalness: 0.6,
        emissive: 0x222222, // Add some self-illumination
        emissiveIntensity: 0.2
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.rotation.z = Math.PI / 2;
    torus.position.set(0, -0.8, 0);
    group.add(torus);

    return group;
}

// Create sphere in the middle
function createSphere() {
    const sphereGeometry = new THREE.SphereGeometry(0.25, 32, 32); // Smaller sphere size
    const sphereMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff33cc,
        roughness: 0.3,
        metalness: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, -0.8, 0);
    return sphere;
}

const letterB = createLetterB();
scene.add(letterB);

const sphere = createSphere();
scene.add(sphere);

// Group for animation
const fullLogo = new THREE.Group();
fullLogo.add(letterB);
fullLogo.add(sphere);
scene.add(fullLogo);

// Animation function with mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;

// Track mouse position
document.addEventListener('mousemove', (event) => {
    // Calculate mouse position relative to the center of the container
    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;
    
    // Normalize mouse coordinates (-1 to 1)
    mouseX = (event.clientX - containerCenterX) / (containerRect.width / 2);
    mouseY = (event.clientY - containerCenterY) / (containerRect.height / 2);
    
    // Set target rotation based on mouse position (limited range)
    targetRotationY = mouseX * 0.3; // Horizontal movement
    targetRotationX = mouseY * 0.3; // Vertical movement
});

function animate() {
    requestAnimationFrame(animate);
    
    // Smooth interpolation for rotation (easing effect)
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;
    
    // Apply rotation
    fullLogo.rotation.x = currentRotationX;
    fullLogo.rotation.y = currentRotationY;
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    // Only update if container exists (prevents errors on page changes)
    if (container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});

// Initial animation
gsap.from(fullLogo.scale, {
    x: 0,
    y: 0,
    z: 0,
    duration: 1.5,
    ease: "elastic.out(1, 0.3)"
});

// Start the animation
animate();