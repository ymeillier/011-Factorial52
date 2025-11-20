import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html, Instance, Instances, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { create } from 'zustand';
import cardBackImage from './assets/cards-back.png';

// --- Configuration ---
const DOT_SIZE = 0.04; 

// Compressed Visual Scale for Visibility
// New Order: Humans -> Ants -> Seconds -> Sand -> Water -> Atoms -> MilkyWay -> Cards -> Sun
// Spacing increased significantly to avoid label overlap.

const STAGES = [
  {
    id: 'humans',
    label: 'Humans on Earth',
    scientific: '8 x 10^9',
    valueLabel: '8,000,000,000',
    value: 8e9,
    rotationAxis: [0, 1, 0],
    color: '#00ff44',
    emissive: '#004400',
    particleCount: 400
  },
  {
    id: 'trees',
    label: 'Trees on Earth',
    scientific: '3 x 10^12',
    valueLabel: '3,040,000,000,000',
    value: 3.04e12,
    rotationAxis: [0, 1, 0.5],
    color: '#228B22',
    emissive: '#004400',
    particleCount: 400
  },
  {
    id: 'cells',
    label: 'Cells in Human Body',
    scientific: '3.7 x 10^13',
    valueLabel: '37,200,000,000,000',
    value: 3.72e13,
    rotationAxis: [1, 1, 1],
    color: '#FF6347', // Tomato red
    emissive: '#550000',
    particleCount: 400
  },
  {
    id: 'ants',
    label: 'Ants on Earth',
    scientific: '2 x 10^16',
    valueLabel: '20,000,000,000,000,000',
    value: 2e16,
    rotationAxis: [1, 0, 0],
    color: '#a0522d',
    emissive: '#5a2d0c',
    particleCount: 400
  },
  {
    id: 'seconds',
    label: 'Seconds since Big Bang',
    scientific: '4 x 10^17',
    valueLabel: '430,000,000,000,000,000',
    value: 4e17,
    rotationAxis: [0, 0, 1],
    color: '#888888',
    emissive: '#444444',
    particleCount: 600
  },
  {
    id: 'sand',
    label: 'Grains of Sand',
    scientific: '7.5 x 10^18',
    valueLabel: '7,500,000,000,000,000,000',
    value: 7.5e18,
    rotationAxis: [0.5, 1, 0],
    color: '#ffcc00',
    emissive: '#664400',
    particleCount: 800
  },
  {
    id: 'water',
    label: 'Drops of Water in Oceans',
    scientific: '2.6 x 10^25',
    valueLabel: '26,000,000,000,000,000,000,000,000',
    value: 2.6e25,
    rotationAxis: [1, 1, 0],
    color: '#00aaff',
    emissive: '#004488',
    particleCount: 1600
  },
  {
    id: 'atoms',
    label: 'Atoms on Earth',
    scientific: '10^50',
    valueLabel: '100,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000',
    value: 1e50,
    rotationAxis: [0, 1, 1],
    color: '#0066ff',
    emissive: '#001133',
    particleCount: 5000
  },
  {
    id: 'milkyway',
    label: 'Atoms in Milky Way',
    scientific: '10^67',
    valueLabel: '10,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000',
    value: 1e67,
    rotationAxis: [1, 0, 1],
    color: '#aa88ff',
    emissive: '#220044',
    particleCount: 10000
  },
  {
    id: 'cards',
    label: '# of Shuffles in 52-cards deck',
    scientific: '8 x 10^67',
    valueLabel: '80,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000',
    value: 8e67,
    rotationAxis: [1, 0, 0],
    color: '#00ffff',
    emissive: '#004444',
    particleCount: 15000
  },
  {
    id: 'sun',
    label: 'The Sun',
    scientific: 'Reference',
    valueLabel: '',
    value: 0, // Special case
    radius: 400, // Fixed size for reference
    position: [0, 0, -400], // Will be adjusted or ignored by dynamic logic
    rotationAxis: [0, 1, 0],
    color: '#ffaa00',
    emissive: '#ff4400',
    particleCount: 0
  }
];

// --- Store for UI State ---
const useStore = create((set) => ({
  stageIndex: -1, // -1 is Intro
  start: () => set({ stageIndex: 0 }),
  nextStage: () => set((state) => {
    const nextIndex = state.stageIndex + 1;
    if (nextIndex >= STAGES.length) return state;
    return { stageIndex: nextIndex };
  }),
  prevStage: () => set((state) => {
    const prevIndex = state.stageIndex - 1;
    if (prevIndex < 0) return state; 
    return { stageIndex: prevIndex };
  })
}));

// --- Sorting Game Component ---
function SortingGame({ onComplete }) {
    const [availableItems, setAvailableItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [gameState, setGameState] = useState('playing'); // playing, success, fail
    const [draggedItem, setDraggedItem] = useState(null);

    // We have 11 items total (0..10). Sun is 10.
    // Game sorts 0..9.
    const TOTAL_GAME_ITEMS = 10;

    useEffect(() => {
        // Initialize game with shuffled stages (excluding Sun)
        const gameStages = STAGES.slice(0, TOTAL_GAME_ITEMS).map(s => ({ id: s.id, label: s.label, value: s.value }));
        // Shuffle
        for (let i = gameStages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameStages[i], gameStages[j]] = [gameStages[j], gameStages[i]];
        }
        setAvailableItems(gameStages);
    }, []);

    // Click Handlers
    const handleSelect = (item) => {
        setAvailableItems(prev => prev.filter(i => i.id !== item.id));
        setSelectedItems(prev => [...prev, item]);
    };

    const handleDeselect = (item) => {
        setSelectedItems(prev => prev.filter(i => i.id !== item.id));
        setAvailableItems(prev => [...prev, item]);
    };

    // Drag and Drop Handlers
    const onDragStart = (e, item, source, index) => {
        setDraggedItem({ item, source, index });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: item.id, source, index })); 
        e.target.style.opacity = '0.5';
    };

    const onDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = (e, targetSource, targetIndex) => {
        e.preventDefault();
        
        let item, source, sourceIndex;
        
        if (draggedItem) {
            ({ item, source, index: sourceIndex } = draggedItem);
        } else {
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                source = data.source;
                sourceIndex = data.index;
                const list = source === 'available' ? availableItems : selectedItems;
                item = list.find(i => i.id === data.id);
            } catch (err) {
                return;
            }
        }

        if (!item) return;

        // Moving within same list
        if (source === targetSource) {
            if (source === 'selected') {
                const newList = [...selectedItems];
                
                let insertAt = targetIndex !== null ? targetIndex : newList.length;
                if (sourceIndex < insertAt) {
                    insertAt -= 1;
                }

                const [removed] = newList.splice(sourceIndex, 1);
                newList.splice(insertAt, 0, removed);
                setSelectedItems(newList);
            }
        } 
        // Moving Available -> Selected
        else if (source === 'available' && targetSource === 'selected') {
            setAvailableItems(prev => prev.filter(i => i.id !== item.id));
            const newList = [...selectedItems];
            const insertAt = targetIndex !== null ? targetIndex : newList.length;
            newList.splice(insertAt, 0, item);
            setSelectedItems(newList);
        }
        // Moving Selected -> Available
        else if (source === 'selected' && targetSource === 'available') {
            setSelectedItems(prev => prev.filter(i => i.id !== item.id));
            setAvailableItems(prev => [...prev, item]);
        }
        
        setDraggedItem(null);
    };

    const checkAnswer = () => {
        const correctOrder = STAGES.slice(0, TOTAL_GAME_ITEMS).map(s => s.id);
        const userOrder = selectedItems.map(s => s.id);
        
        const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
        
        if (isCorrect) {
            setGameState('success');
        } else {
            setGameState('fail');
        }
    };

    const resetGame = () => {
        setGameState('playing');
        setSelectedItems([]);
        const gameStages = STAGES.slice(0, TOTAL_GAME_ITEMS).map(s => ({ id: s.id, label: s.label, value: s.value }));
        for (let i = gameStages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameStages[i], gameStages[j]] = [gameStages[j], gameStages[i]];
        }
        setAvailableItems(gameStages);
    };

    if (gameState === 'success') {
        return (
            <div className="quiz-feedback">
                <p>Correct! You sorted them perfectly.</p>
                <button className="start-btn" onClick={onComplete}>START JOURNEY</button>
            </div>
        );
    }

    if (gameState === 'fail') {
        return (
            <div className="quiz-feedback">
                <p>Not quite right. Remember, we start from Humans and go up to the Universe!</p>
                <button className="retry-btn" onClick={resetGame}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="sorting-game" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px', pointerEvents: 'auto' }}>
            <p style={{ textAlign: 'center', color: '#ffcc00', fontSize: '1.2rem', textShadow: '0 0 10px rgba(255, 200, 0, 0.5)' }}>
                Sort Tiles from <strong>Smallest</strong> to <strong>Largest</strong> (left to right) and position the # of Shuffles in that list
            </p>
            
            {/* Selected Area */}
            <div 
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, 'selected', selectedItems.length)}
                style={{ minHeight: '160px', border: '1px dashed rgba(255,255,255,0.3)', padding: '10px', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-start', background: 'rgba(0,0,0,0.3)', pointerEvents: 'auto' }}
            >
                {selectedItems.length === 0 && <span style={{ color: '#666', alignSelf: 'center', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>Drag & Drop or Click items here</span>}
                {selectedItems.map((item, index) => (
                    <div 
                        key={item.id} 
                        draggable
                        onDragStart={(e) => onDragStart(e, item, 'selected', index)}
                        onDragEnd={onDragEnd}
                        onDragOver={onDragOver}
                        onDrop={(e) => {
                            e.stopPropagation(); // Prevent container drop
                            onDrop(e, 'selected', index);
                        }}
                        onClick={() => handleDeselect(item)} 
                        style={{
                            background: item.id === 'cards' ? '#0066ff66' : '#00ff4433', 
                            border: `1px solid ${item.id === 'cards' ? '#00aaff' : '#00ff44'}`, 
                            padding: '8px 12px', borderRadius: '5px', cursor: 'grab', fontSize: '0.9rem', color: 'white', pointerEvents: 'auto'
                        }}
                    >
                        {index + 1}. {item.label}
                    </div>
                ))}
            </div>

            {/* Available Area */}
            <div 
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, 'available', null)}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', minHeight: '100px', pointerEvents: 'auto' }}
            >
                {availableItems.map((item, index) => (
                    <div 
                        key={item.id} 
                        draggable
                        onDragStart={(e) => onDragStart(e, item, 'available', index)}
                        onDragEnd={onDragEnd}
                        onClick={() => handleSelect(item)} 
                        style={{
                            background: item.id === 'cards' ? '#0066ff66' : 'rgba(255,255,255,0.1)', 
                            border: `1px solid ${item.id === 'cards' ? '#00aaff' : 'rgba(255,255,255,0.3)'}`, 
                            padding: '8px 12px', borderRadius: '5px', cursor: 'grab', fontSize: '0.9rem', color: 'white', pointerEvents: 'auto'
                        }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>

            {availableItems.length === 0 && (
                <button className="start-btn" onClick={checkAnswer} style={{ alignSelf: 'center', marginTop: '10px', pointerEvents: 'auto' }}>
                    Check Order
                </button>
            )}
        </div>
    );
}

// --- Typewriter Text Component ---
function TypewriterText() {
    const text = "Unique Shuffles in a Deck of 52 Cards";
    const [displayedText, setDisplayedText] = useState("");
    const { viewport } = useThree();
    
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(text.substring(0, i));
            i++;
            if (i > text.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <Text 
            position={[0, 5, 0]} 
            color="white" 
            fontSize={1}
            maxWidth={viewport.width * 0.9} 
            textAlign="center"
            anchorX="center" 
            anchorY="middle"
        >
            {displayedText}
        </Text>
    );
}

// --- Intro Fanned Deck ---
function FannedDeck() {
    const texture = useLoader(THREE.TextureLoader, cardBackImage);
    
    const cards = useMemo(() => {
        return new Array(52).fill(0).map((_, i) => {
            // Fan 80 degrees total
            // Center around 0
            const totalAngle = (80 * Math.PI) / 180;
            const startAngle = -totalAngle / 2;
            const step = totalAngle / 51;
            const angle = startAngle + (i * step);
            
            const radius = 10;
            const x = Math.sin(angle) * radius;
            const y = Math.cos(angle) * radius - 8;
            const rotZ = -angle;
            return { x, y, rotZ };
        });
    }, []);

    return (
        <group position={[0, 1, 0]}>
            <TypewriterText />
            {cards.map((card, i) => (
                <mesh key={i} position={[card.x, card.y, i * 0.01]} rotation={[0, 0, card.rotZ]}>
                    <planeGeometry args={[1.5, 2.2]} />
                    <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
}

// --- Sun Component ---
function Sun({ visualData }) {
    const stage = STAGES.find(s => s.id === 'sun');
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (meshRef.current) meshRef.current.rotation.y += delta * 0.02;
    });
    
    // Sun is always background reference, keep it at fixed large distance/size relative to scene
    // or use passed position if we want it to move.
    // Current logic: fixed position.

    return (
        <group position={stage.position} ref={meshRef}>
            <mesh>
                <sphereGeometry args={[stage.radius, 64, 64]} />
                <meshBasicMaterial color={stage.color} />
            </mesh>
            <mesh scale={[1.05, 1.05, 1.05]}>
                <sphereGeometry args={[stage.radius, 32, 32]} />
                <meshBasicMaterial color={stage.emissive} transparent opacity={0.2} side={THREE.BackSide} />
            </mesh>
        </group>
    );
}

// --- Scientific Label Component ---
function ScientificLabel({ scientific }) {
    if (scientific === 'Reference') return <span>(Reference)</span>;
    
    // Handle "A x 10^B"
    if (scientific.includes('x 10^')) {
        const [base, exponent] = scientific.split('x 10^');
        return (
            <span>
                ({base.trim()} &times; 10<sup>{exponent.trim()}</sup>)
            </span>
        );
    }
    
    // Handle "10^B"
    if (scientific.startsWith('10^')) {
        const exponent = scientific.replace('10^', '');
        return (
            <span>
                (10<sup>{exponent.trim()}</sup>)
            </span>
        );
    }

    return <span>({scientific})</span>;
}

// --- Planet Sphere Component ---
function PlanetSphere({ stageData }) {
  const groupRef = useRef();
  const rotationRef = useRef();
  const { radius: targetRadius, particleCount, color, emissive, scientific, label, position: targetPos, rotationAxis, id, value } = stageData;
  
  // Refs for animation state
  const currentRadius = useRef(targetRadius);
  const currentPos = useRef(new THREE.Vector3(...targetPos));
  const initialized = useRef(false);

  // Initialize Scale/Position logic
  if (!initialized.current) {
      // If this is a newly added planet (Active), it should start Large and shrink.
      // We can approximate "Large" as, say, 20x Base Radius, or clamped to Max View.
      // Standard Base Radius is 4. Start at 50?
      // Existing planets start at their target (which will update to tiny).
      
      // Check if this planet is likely the "New" one.
      // In our logic, New planet has radius ~4.
      // Old planets have radius ~Tiny.
      if (targetRadius > 3) { // Heuristic: Active planet is large
          currentRadius.current = 60; // Start huge
      } else {
          // It's a previous planet being re-rendered or already small?
          // Actually, if it's Humans (0), it starts at 4.
          // If we move Humans -> Ants. Humans target becomes Tiny.
          // Humans component persists. currentRadius ref persists.
          // So we only need to set initial value on Mount.
          // On Mount: Humans is Active. Starts Huge?
          // User: "smoothly transition to showing the first planet...".
          // Maybe first planet starts normal.
          // Subsequent planets start huge.
          if (id !== 'humans') {
             currentRadius.current = 60; 
          }
      }
      initialized.current = true;
  }

  // Particles on Unit Sphere (Radius 1)
  // We scale the group to change size.
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360); 
      const phi = THREE.MathUtils.randFloatSpread(360); 
      // Unit sphere coordinates
      const x = Math.sin(theta) * Math.cos(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(theta);
      temp.push({ x, y, z });
    }
    return temp;
  }, [particleCount]);

  useFrame((state, delta) => {
    // Rotation
    if (rotationRef.current) {
        rotationRef.current.rotateOnAxis(new THREE.Vector3(...rotationAxis).normalize(), delta * 0.2);
    }

    // Animation Interpolation
    const lerpFactor = 2.0 * delta; // Adjust speed
    currentRadius.current = THREE.MathUtils.lerp(currentRadius.current, targetRadius, lerpFactor);
    
    // Position Interpolation
    currentPos.current.lerp(new THREE.Vector3(...targetPos), lerpFactor);

    // Apply to Group
    if (groupRef.current) {
        const r = currentRadius.current;
        groupRef.current.scale.set(r, r, r);
        groupRef.current.position.copy(currentPos.current);
    }
  });

  // Text Scale relative to Unit Sphere
  // If Scale is 1, Text should be visible.
  // In previous logic: textScale * 1.5 where textScale ~ 1.
  // So scale ~ 1.5.
  const labelScale = 1.5; 

  return (
    <group ref={groupRef}>
        <group ref={rotationRef}>
            <Instances limit={particleCount} range={particleCount}>
                <sphereGeometry args={[DOT_SIZE, 8, 8]} /> 
                <meshStandardMaterial 
                    emissive={emissive} 
                    emissiveIntensity={2} 
                    color={color} 
                    roughness={0.5}
                    metalness={0.6}
                />
                {particles.map((data, i) => (
                    <Instance key={i} position={[data.x, data.y, data.z]} />
                ))}
            </Instances>
            
            <mesh>
                <sphereGeometry args={[0.95, 32, 32]} /> 
                <meshBasicMaterial color={color} transparent opacity={0.4} />
            </mesh>
        </group>

         {/* Label Attached to Group (Scales with Group) */}
         {/* Position: Just above unit sphere (1.0). Offset 0.1 */}
         <Html
            position={[0, 1.1, 0]}
            transform
            scale={[labelScale, labelScale, labelScale]}
            style={{
                transform: 'translate(-50%, -100%)',
                color: color,
                fontSize: '32px', 
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                // Hide if too small?
                // Opacity can be controlled via state or just let it shrink to dot
            }}
         >
             <div>{label}</div>
             <div><ScientificLabel scientific={scientific} /></div>
         </Html>
    </group>
  );
}

// --- Camera Controller ---
function CameraController({ visualStages }) {
    const { camera, controls, size } = useThree(); 
    const stageIndex = useStore((state) => state.stageIndex);
    
    // Calculate bounding box of visible planets to fit them in view
    const targetInfo = useMemo(() => {
        if (stageIndex === -1) return { pos: new THREE.Vector3(0, 0, 15), look: new THREE.Vector3(0,0,0) };
        
        // Use dynamic visualStages
        const lastStage = STAGES[stageIndex];
        const currentVisual = visualStages[stageIndex];

        if (lastStage.id === 'sun') {
             // Sun view: same as before, Sun is static background
             const width = 1000;
             const fovRad = (60 * Math.PI) / 180;
             const aspect = size.width / size.height;
             let z = (width / aspect) / (2 * Math.tan(fovRad / 2));
             const height = 1000; 
             const zH = height / (2 * Math.tan(fovRad / 2));
             z = Math.max(z, zH) * 1.2;

             return {
                 pos: new THREE.Vector3(355, 0, z),
                 look: new THREE.Vector3(355, 0, 0)
             };
        }

        // For number planets, focus on the current one (largest) and previous ones
        if (!currentVisual) return { pos: new THREE.Vector3(0,0,10), look: new THREE.Vector3(0,0,0) };
        
        // We want to center on the current planet mostly, but show previous if they are close.
        // Since current is largest (radius 4), let's frame it nicely.
        // Center X = currentVisual.position[0].
        
        const centerX = currentVisual.position[0];
        const radius = currentVisual.radius;
        
        // Fit radius * 3 vertically?
        const fovRad = (60 * Math.PI) / 180;
        const height = radius * 4.0; 
        const z = height / (2 * Math.tan(fovRad / 2));
        
        // Ensure we look at center
        return {
            pos: new THREE.Vector3(centerX, radius * 0.5, z), 
            look: new THREE.Vector3(centerX, 0, 0)
        };

    }, [stageIndex, size.width, size.height, visualStages]);
    
    useEffect(() => {
       camera.far = 100000; 
       camera.updateProjectionMatrix();
    }, [camera]);
  
    // Create a stable vector for lookAt interpolation
    const currentLookAt = useRef(new THREE.Vector3(0,0,0));

    useFrame((state, delta) => {
      camera.position.lerp(targetInfo.pos, delta * 1.5);
      currentLookAt.current.lerp(targetInfo.look, delta * 1.5);
      camera.lookAt(currentLookAt.current);
    });
    return null;
}

// --- Main App Component ---
function App() {
  const { stageIndex, start, nextStage, prevStage } = useStore();
  const isIntro = stageIndex === -1;
  const currentStage = isIntro ? null : STAGES[stageIndex];

  // Dynamic Visuals Calculation
  const visualStages = useMemo(() => {
      if (stageIndex === -1) return [];
      
      const visuals = new Array(STAGES.length).fill(null);
      
      // Only scale up to Cards (index 10). Sun (11) is separate?
      // Wait, indices: 0..9 are Numbers. 10 is Sun.
      // So effectiveIndex <= 9.
      const effectiveIndex = Math.min(stageIndex, 9);
      
      const BASE_RADIUS = 4;
      const GAP = 1; // Reduced gap
      const MIN_RADIUS = 0.02; 

      // Set active planet properties
      visuals[effectiveIndex] = {
          ...STAGES[effectiveIndex],
          radius: BASE_RADIUS,
          position: [0, 0, 0] // Centered
      };
      
      // Calculate previous planets
      for (let i = effectiveIndex - 1; i >= 0; i--) {
          const nextVisual = visuals[i+1];
          const currStage = STAGES[i];
          const nextStage = STAGES[i+1];
          
          // Linear scaling relative to values
          const ratio = currStage.value / nextStage.value;
          let r = nextVisual.radius * ratio;
          
          // Clamp to pixel size
          if (r < MIN_RADIUS) r = MIN_RADIUS;
          
          // Position to the LEFT
          const x = nextVisual.position[0] - (nextVisual.radius + r + GAP);
          
          visuals[i] = {
              ...currStage,
              radius: r,
              position: [x, 0, 0]
          };
      }
      
      // Future planets (if any visible? Usually we show 0 to stageIndex).
      // If we are at stageIndex, planets > stageIndex are not shown by logic below.
      
      return visuals;
  }, [stageIndex]);

  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 15], fov: 60, far: 100000 }}>
        <color attach="background" args={['#000005']} />
        <Stars radius={50000} depth={100} count={20000} factor={50} saturation={0} fade speed={1} />
        <ambientLight intensity={0.3} />
        <pointLight position={[100, 100, 100]} intensity={1.5} />
        <pointLight position={[-100, -100, -100]} intensity={0.5} />

        {isIntro && <FannedDeck />}

        {!isIntro && (
            <group>
                {/* Render planets up to current stage using DYNAMIC visualStages */}
                {visualStages.slice(0, stageIndex + 1).map((stage, i) => {
                    if (!stage || stage.id === 'sun') return null;
                    return <PlanetSphere key={stage.id} stageData={stage} />;
                })}
                
                {/* Sun visible in final stage */}
                {stageIndex >= 10 && <Sun />}
            </group>
        )}

        {/* OrbitControls removed for "Pure 2D" fixed view experience */}
        <CameraController visualStages={visualStages} />
        <Environment preset="city" />
      </Canvas>

      {/* UI Overlay */}
      <div className="ui-overlay">
        {isIntro ? (
            <div className="intro-ui" style={{ padding: '20px', maxWidth: '95vw', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                <SortingGame onComplete={start} />
            </div>
        ) : (
            <>
                <div className="stage-title" style={{ 
                    color: currentStage?.color, 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem', 
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                    {currentStage?.label} <span style={{ fontSize: '0.8em', opacity: 0.9 }}><ScientificLabel scientific={currentStage?.scientific} /></span>
                </div>
                <div className="decimal-display" style={{ color: currentStage?.color }}>
                    {currentStage?.valueLabel}
                </div>
                <div className="scale-note" style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', marginBottom: '10px' }}>
                    {currentStage?.scaleNote}
                </div>
                <div className="controls">
                    <button className="toggle-btn" onClick={prevStage}>
                        Previous
                    </button>
                    {stageIndex < STAGES.length - 1 && (
                        <button className="toggle-btn" onClick={nextStage}>
                            Next Scale
                        </button>
                    )}
                </div>
            </>
        )}
        <div style={{ position: 'absolute', bottom: '10px', right: '20px', color: '#00aaff', fontSize: '0.8rem', pointerEvents: 'none' }}>
            Built with Gemini 3
        </div>
      </div>
    </div>
  );
}

export default App;
