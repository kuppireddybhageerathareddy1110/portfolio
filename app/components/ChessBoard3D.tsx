'use client';
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SceneFallback, useWebGLAvailable } from './WebGLGuard';
import LazyCanvas from './LazyCanvas';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface PieceData {
  id: string;
  type: PieceType;
  color: PieceColor;
  gridX: number; // 0 to 7
  gridZ: number; // 0 to 7
  // Current 3D position for smooth animation interpolation
  x: number;
  y: number;
  z: number;
}

// Chess rule helpers
const inBounds = (x: number, z: number) => x >= 0 && x < 8 && z >= 0 && z < 8;

const getPieceAt = (x: number, z: number, pieces: PieceData[]) => 
  pieces.find(p => p.gridX === x && p.gridZ === z);

// Helper to calculate all legal moves for a given piece on the board
const getValidMoves = (piece: PieceData, pieces: PieceData[]): [number, number][] => {
  const validMoves: [number, number][] = [];
  const { gridX, gridZ, color, type } = piece;

  const addMoveIfValid = (x: number, z: number): boolean => {
    if (!inBounds(x, z)) return false;
    const target = getPieceAt(x, z, pieces);
    if (!target) {
      validMoves.push([x, z]);
      return true; // Empty square: can continue sliding path
    } else {
      if (target.color !== color) {
        validMoves.push([x, z]); // Enemy square: capture allowed
      }
      return false; // Path blocked by any piece
    }
  };

  if (type === 'pawn') {
    const dir = color === 'white' ? 1 : -1;
    const startRow = color === 'white' ? 1 : 6;

    // 1 step forward
    const f1X = gridX;
    const f1Z = gridZ + dir;
    if (inBounds(f1X, f1Z) && !getPieceAt(f1X, f1Z, pieces)) {
      validMoves.push([f1X, f1Z]);

      // 2 steps forward from initial pawn line
      const f2X = gridX;
      const f2Z = gridZ + 2 * dir;
      if (gridZ === startRow && !getPieceAt(f2X, f2Z, pieces)) {
        validMoves.push([f2X, f2Z]);
      }
    }

    // Diagonal captures
    const captureOffsets = [[-1, dir], [1, dir]];
    captureOffsets.forEach(([dx, dz]) => {
      const tx = gridX + dx;
      const tz = gridZ + dz;
      if (inBounds(tx, tz)) {
        const target = getPieceAt(tx, tz, pieces);
        if (target && target.color !== color) {
          validMoves.push([tx, tz]);
        }
      }
    });
  }

  else if (type === 'knight') {
    const offsets = [
      [1, 2], [1, -2], [-1, 2], [-1, -2],
      [2, 1], [2, -1], [-2, 1], [-2, -1]
    ];
    offsets.forEach(([dx, dz]) => {
      const tx = gridX + dx;
      const tz = gridZ + dz;
      if (inBounds(tx, tz)) {
        const target = getPieceAt(tx, tz, pieces);
        if (!target || target.color !== color) {
          validMoves.push([tx, tz]);
        }
      }
    });
  }

  else if (type === 'rook' || type === 'queen') {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    dirs.forEach(([dx, dz]) => {
      let tx = gridX + dx;
      let tz = gridZ + dz;
      while (inBounds(tx, tz)) {
        const canContinue = addMoveIfValid(tx, tz);
        if (!canContinue) break;
        tx += dx;
        tz += dz;
      }
    });
  }

  if (type === 'bishop' || type === 'queen') {
    const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    dirs.forEach(([dx, dz]) => {
      let tx = gridX + dx;
      let tz = gridZ + dz;
      while (inBounds(tx, tz)) {
        const canContinue = addMoveIfValid(tx, tz);
        if (!canContinue) break;
        tx += dx;
        tz += dz;
      }
    });
  }

  else if (type === 'king') {
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    offsets.forEach(([dx, dz]) => {
      const tx = gridX + dx;
      const tz = gridZ + dz;
      if (inBounds(tx, tz)) {
        const target = getPieceAt(tx, tz, pieces);
        if (!target || target.color !== color) {
          validMoves.push([tx, tz]);
        }
      }
    });
  }

  return validMoves;
};

// Initial chess board setup helper
const createInitialPieces = (): PieceData[] => {
  const pieces: PieceData[] = [];
  const majorOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  // White major pieces (Row 0)
  for (let c = 0; c < 8; c++) {
    pieces.push({
      id: `w_major_${c}`,
      type: majorOrder[c],
      color: 'white',
      gridX: c,
      gridZ: 0,
      x: c - 3.5,
      y: 0.1,
      z: -3.5,
    });
  }
  // White pawns (Row 1)
  for (let c = 0; c < 8; c++) {
    pieces.push({
      id: `w_pawn_${c}`,
      type: 'pawn',
      color: 'white',
      gridX: c,
      gridZ: 1,
      x: c - 3.5,
      y: 0.1,
      z: -2.5,
    });
  }

  // Black pawns (Row 6)
  for (let c = 0; c < 8; c++) {
    pieces.push({
      id: `b_pawn_${c}`,
      type: 'pawn',
      color: 'black',
      gridX: c,
      gridZ: 6,
      x: c - 3.5,
      y: 0.1,
      z: 2.5,
    });
  }
  // Black major pieces (Row 7)
  for (let c = 0; c < 8; c++) {
    pieces.push({
      id: `b_major_${c}`,
      type: majorOrder[c],
      color: 'black',
      gridX: c,
      gridZ: 7,
      x: c - 3.5,
      y: 0.1,
      z: 3.5,
    });
  }

  return pieces;
};

// Procedural chess piece geometry components
interface PieceMeshProps {
  type: PieceType;
  color: PieceColor;
  isHovered: boolean;
  isSelected: boolean;
}

const ChessPieceMesh: React.FC<PieceMeshProps> = ({ type, color, isHovered, isSelected }) => {
  const materialProps = useMemo(() => {
    const isWhite = color === 'white';
    return {
      color: isWhite 
        ? (isSelected ? '#ffdf00' : '#d4af37') // Gold / Gold highlight
        : (isSelected ? '#60a5fa' : '#1e3a8a'), // Metallic dark blue / highlight blue
      roughness: 0.15,
      metalness: 0.85,
      emissive: isSelected 
        ? (isWhite ? '#f59e0b' : '#3b82f6')
        : (isHovered ? (isWhite ? '#78350f' : '#1d4ed8') : '#000000'),
      emissiveIntensity: isSelected ? 0.6 : (isHovered ? 0.35 : 0),
    };
  }, [color, isHovered, isSelected]);

  switch (type) {
    case 'pawn':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.08, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.15, 0.25, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.38, 0]} castShadow>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case 'rook':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.08, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 0.32, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.44, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.18, 0.14, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case 'knight':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.08, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 0.2, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.38, 0.04]} rotation={[0.25, 0, 0]} castShadow>
            <boxGeometry args={[0.16, 0.26, 0.25]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.42, 0.16]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.12, 0.12, 0.14]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case 'bishop':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.08, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.19, 0.34, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.47, 0]} castShadow>
            <coneGeometry args={[0.15, 0.22, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case 'queen':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.27, 0.08, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.22, 0.44, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.54, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.14, 0.12, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.63, 0]} castShadow>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    case 'king':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.27, 0.08, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.22, 0.48, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.58, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.16, 0.15, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[0.04, 0.14, 0.04]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[0.12, 0.04, 0.04]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );

    default:
      return null;
  }
};

// Individual interactive ChessPiece wrapper component
interface ChessPieceProps {
  data: PieceData;
  isSelected: boolean;
  onSelect: () => void;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ data, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth position LERP & hover bobbing
  useFrame((state) => {
    if (!meshRef.current) return;

    // Target X and Z positions
    const targetX = data.gridX - 3.5;
    const targetZ = data.gridZ - 3.5;
    
    // LERP X and Z
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.15;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.15;

    // LERP Y with some float bobbing if hovered or selected
    let targetY = 0.1; // top of board
    if (isSelected) {
      targetY = 0.45 + Math.sin(state.clock.elapsedTime * 5.0) * 0.05;
    } else if (isHovered) {
      targetY = 0.28 + Math.sin(state.clock.elapsedTime * 3.5) * 0.03;
    }

    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.15;
  });

  return (
    <group
      ref={meshRef}
      position={[data.x, data.y, data.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <ChessPieceMesh 
        type={data.type} 
        color={data.color} 
        isHovered={isHovered} 
        isSelected={isSelected} 
      />
      
      {/* Light below selected piece */}
      {isSelected && (
        <pointLight 
          position={[0, -0.1, 0]} 
          intensity={0.9} 
          distance={1.5} 
          decay={0}
          color={data.color === 'white' ? '#f59e0b' : '#3b82f6'} 
        />
      )}
    </group>
  );
};

// Main Scene Component for board, coordinates, lighting
interface ChessBoardSceneProps {
  pieces: PieceData[];
  selectedPieceId: string | null;
  validMoves: [number, number][];
  onPieceSelect: (id: string) => void;
  onSquareClick: (x: number, z: number) => void;
}

const ChessBoardScene: React.FC<ChessBoardSceneProps> = ({
  pieces,
  selectedPieceId,
  validMoves,
  onPieceSelect,
  onSquareClick,
}) => {
  // Generate the checkerboard squares
  const boardSquares = useMemo(() => {
    const squares = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isDark = (r + c) % 2 === 0;
        squares.push({
          row: r,
          col: c,
          isDark,
          x: c - 3.5,
          z: r - 3.5,
        });
      }
    }
    return squares;
  }, []);

  return (
    <>
      <ambientLight intensity={0.7} color="#ffffff" />
      
      {/* Key directional light that does not decay with distance */}
      <directionalLight
        position={[6, 12, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Key spotlight casting shadows */}
      <spotLight
        position={[8, 12, 8]}
        angle={0.45}
        penumbra={0.5}
        intensity={2.2}
        decay={0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      
      {/* Dynamic fill lights to make the metals pop */}
      <pointLight position={[-8, 6, -8]} intensity={1.5} decay={0} color="#3b82f6" />
      <pointLight position={[6, 4, -8]} intensity={1.2} decay={0} color="#10b981" />
      
      {/* Grid Board Base */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[8.8, 0.2, 8.8]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Inner border trim */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[8.2, 0.02, 8.2]} />
        <meshStandardMaterial color="#1f2937" wireframe />
      </mesh>

      {/* Grid squares */}
      {boardSquares.map((sq) => {
        const isSelectedSquare = pieces.some(
          (p) => p.id === selectedPieceId && p.gridX === sq.col && p.gridZ === sq.row
        );

        return (
          <mesh
            key={`sq_${sq.col}_${sq.row}`}
            position={[sq.x, 0.02, sq.z]}
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              onSquareClick(sq.col, sq.row);
            }}
          >
            <boxGeometry args={[0.96, 0.06, 0.96]} />
            <meshStandardMaterial
              color={
                isSelectedSquare
                  ? '#34d399' // Highlight active square
                  : sq.isDark
                  ? '#181c24' // Slate charcoal
                  : '#10b981' // Emerald green
              }
              roughness={sq.isDark ? 0.3 : 0.1}
              metalness={sq.isDark ? 0.2 : 0.8}
              transparent
              opacity={isSelectedSquare ? 0.8 : 0.9}
            />
          </mesh>
        );
      })}

      {/* Render Chess Pieces */}
      {pieces.map((piece) => (
        <ChessPiece
          key={piece.id}
          data={piece}
          isSelected={selectedPieceId === piece.id}
          onSelect={() => onPieceSelect(piece.id)}
        />
      ))}

      {/* Highlight valid moves with glowy emerald markers */}
      {validMoves.map(([x, z], idx) => (
        <mesh
          key={`valid_${x}_${z}_${idx}`}
          position={[x - 3.5, 0.03, z - 3.5]}
          onClick={(e) => {
            e.stopPropagation();
            onSquareClick(x, z);
          }}
        >
          <cylinderGeometry args={[0.22, 0.22, 0.03, 16]} />
          <meshBasicMaterial color="#00ff66" transparent opacity={0.65} />
        </mesh>
      ))}

      {/* Orbit Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3.5}
        maxDistance={12}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  );
};

// Main ChessBoard3D Component
const ChessBoard3D: React.FC = () => {
  const webglAvailable = useWebGLAvailable();
  const [pieces, setPieces] = useState<PieceData[]>(() => createInitialPieces());
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [turn, setTurn] = useState<PieceColor>('white');
  
  // Game log and details
  const [moveList, setMoveList] = useState<string[]>(['Board Initialized. White to Move.']);
  const [aiThinking, setAiThinking] = useState(false);
  const [depth, setDepth] = useState(16);
  const [evalScore, setEvalScore] = useState('+0.35');

  // Pre-configured list of beautiful opening moves to playback
  const aiMoves = useMemo(() => [
    { from: [4, 1], to: [4, 3], label: '1. e4' },       // White pawn e4
    { from: [4, 6], to: [4, 4], label: '1... e5' },     // Black pawn e5
    { from: [6, 0], to: [5, 2], label: '2. Nf3' },     // White knight f3
    { from: [1, 7], to: [2, 5], label: '2... Nc6' },    // Black knight c6
    { from: [5, 0], to: [2, 3], label: '3. Bc4' },     // White bishop c4
    { from: [6, 7], to: [5, 5], label: '3... Nf6' },    // Black knight f6
    { from: [5, 2], to: [6, 4], label: '4. Ng5' },     // White knight g5
    { from: [3, 6], to: [3, 4], label: '4... d5' },     // Black pawn d5
    { from: [4, 3], to: [3, 4], label: '5. exd5' },    // White pawn takes d5
    { from: [0, 7], to: [0, 5], label: '5... Na5' },    // Black knight a5
  ], []);
  const [moveIndex, setMoveIndex] = useState(0);

  const resetGame = () => {
    setPieces(createInitialPieces());
    setSelectedPieceId(null);
    setTurn('white');
    setMoveIndex(0);
    setMoveList(['Board Reset. White to Move.']);
    setEvalScore('+0.15');
  };

  // Find the selected piece object
  const selectedPiece = useMemo(() => 
    pieces.find(p => p.id === selectedPieceId), 
    [pieces, selectedPieceId]
  );

  // Calculate legal moves for the selected piece
  const validMoves = useMemo(() => {
    if (!selectedPiece || selectedPiece.color !== turn) return [];
    return getValidMoves(selectedPiece, pieces);
  }, [selectedPiece, pieces, turn]);

  // Handle placing piece on square or capturing
  const executeMove = (activePiece: PieceData, targetX: number, targetZ: number) => {
    const obstacle = getPieceAt(targetX, targetZ, pieces);
    
    setPieces((prev) => {
      let nextPieces = prev;
      // Capture target if exists
      if (obstacle) {
        nextPieces = nextPieces.filter(p => p.id !== obstacle.id);
      }
      return nextPieces.map((p) => {
        if (p.id === activePiece.id) {
          return {
            ...p,
            gridX: targetX,
            gridZ: targetZ,
          };
        }
        return p;
      });
    });

    // Formatting move notation for log
    const file = String.fromCharCode(97 + targetX);
    const rank = targetZ + 1;
    const pieceSym = activePiece.type === 'pawn' ? '' : activePiece.type.toUpperCase().slice(0, 1);
    const captureMarker = obstacle ? 'x' : '';
    const turnName = turn === 'white' ? 'White' : 'Black';

    setMoveList(prev => [
      ...prev, 
      `${turnName}: ${pieceSym}${file}${rank} ${captureMarker ? `(Captured ${obstacle?.type.toUpperCase()})` : ''}`
    ]);

    setSelectedPieceId(null);
    setTurn(prev => prev === 'white' ? 'black' : 'white');
  };

  // Select piece handler with turn check and capture support
  const handlePieceSelect = (id: string) => {
    const piece = pieces.find(p => p.id === id);
    if (!piece) return;

    // Capture piece check
    if (selectedPiece && selectedPiece.color === turn && piece.color !== turn) {
      const isValid = validMoves.some(([vx, vz]) => vx === piece.gridX && vz === piece.gridZ);
      if (isValid) {
        executeMove(selectedPiece, piece.gridX, piece.gridZ);
        return;
      }
    }

    // Standard select
    if (piece.color === turn) {
      setSelectedPieceId(id);
    } else {
      setSelectedPieceId(null);
    }
  };

  // Move piece to empty square click
  const handleSquareClick = (x: number, z: number) => {
    if (!selectedPiece) return;
    const isValid = validMoves.some(([vx, vz]) => vx === x && vz === z);
    if (isValid) {
      executeMove(selectedPiece, x, z);
    }
  };

  // Trigger next step in the beautiful demonstration opening
  const triggerAiMove = async () => {
    if (moveIndex >= aiMoves.length) {
      setMoveList(prev => [...prev, 'Demo sequence complete. Reset to replay.']);
      return;
    }
    
    setAiThinking(true);
    await new Promise(r => setTimeout(r, 600));
    
    const move = aiMoves[moveIndex];
    const [fromX, fromZ] = move.from;
    const [toX, toZ] = move.to;

    // Find the piece at from grid coords
    const activePiece = pieces.find(p => p.gridX === fromX && p.gridZ === fromZ);
    if (activePiece) {
      const captureTarget = pieces.find(p => p.gridX === toX && p.gridZ === toZ);
      
      setPieces(prev => {
        let list = prev;
        if (captureTarget) {
          list = list.filter(p => p.id !== captureTarget.id);
        }
        return list.map(p => {
          if (p.id === activePiece.id) {
            return { ...p, gridX: toX, gridZ: toZ };
          }
          return p;
        });
      });

      const score = (Math.random() * 0.8 - 0.4) + (activePiece.color === 'white' ? 0.3 : -0.3);
      setEvalScore((score >= 0 ? '+' : '') + score.toFixed(2));
      setDepth(Math.floor(14 + Math.random() * 6));
      setMoveList(prev => [...prev, `AI Demo: ${move.label} ${captureTarget ? '(Captured!)' : ''}`]);
      setMoveIndex(prev => prev + 1);
      setTurn(prev => prev === 'white' ? 'black' : 'white');
    } else {
      setMoveList(prev => [...prev, 'Failed to resolve move target. Sync error.']);
    }
    
    setAiThinking(false);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #30363d',
      backgroundColor: '#0d1117',
      height: '560px'
    }}>
      <style>{`
        .chess-layout {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }
        .chess-canvas-container {
          position: relative;
          width: 100%;
          height: 360px;
          background: #03060f;
        }
        .chess-sidebar {
          display: flex;
          flex-direction: column;
          background: #0d1117;
          padding: 20px;
          height: 200px;
          border-top: 1px solid #30363d;
          overflow: hidden;
        }
        .chess-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 9px;
          font-family: monospace;
        }
        .chess-stat-card {
          background: #161b22;
          border: 1px solid #21262d;
          border-radius: 8px;
          padding: 10px;
        }
        .chess-log-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          background: #070a0f;
          border: 1px solid #21262d;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }
        .chess-buttons-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .chess-btn-primary {
          width: 100%;
          background: #10b981;
          border: none;
          color: #0d1117;
          font-weight: 600;
          font-size: 12px;
          font-family: monospace;
          padding: 8px 0;
          border-radius: 8px;
          transition: background-color 0.2s;
          cursor: pointer;
        }
        .chess-btn-primary:hover:not(:disabled) {
          background: #0fa673;
        }
        .chess-btn-primary:disabled {
          background: rgba(16,185,129,0.3);
          color: #555;
          cursor: not-allowed;
        }
        .chess-btn-secondary {
          width: 100%;
          background: transparent;
          border: 1px solid #30363d;
          color: #cbd5e1;
          font-weight: 600;
          font-size: 12px;
          font-family: monospace;
          padding: 8px 0;
          border-radius: 8px;
          transition: background-color 0.2s;
          cursor: pointer;
        }
        .chess-btn-secondary:hover {
          background: rgba(255,255,255,0.05);
        }
        @media (min-width: 1024px) {
          .chess-layout {
            flex-direction: row;
          }
          .chess-canvas-container {
            width: 70%;
            height: 100%;
          }
          .chess-sidebar {
            width: 30%;
            height: 100%;
            border-top: none;
            border-left: 1px solid #30363d;
          }
        }
      `}</style>

      <div className="chess-layout">
        {/* 3D Canvas side */}
        <div className="chess-canvas-container">
          
          {/* Floating overlays inside 3D viewer */}
          <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#10b981', letterSpacing: 3, opacity: 0.85, textTransform: 'uppercase' }}>3D Neural Chess Engine</div>
            <h4 style={{ fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5, color: '#e2e8f0', marginTop: 4 }}>
              Chess<span style={{ color: '#10b981', fontWeight: 600 }}>.AI</span>
            </h4>
          </div>

          <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, pointerEvents: 'none', display: 'flex', gap: 16, fontSize: 9, fontFamily: 'monospace', color: '#64748b' }}>
            <span>DRAG TO ROTATE</span>
            <span>•</span>
            <span style={{ color: turn === 'white' ? '#f59e0b' : '#3b82f6', fontWeight: 'bold' }}>
              {turn.toUpperCase()}&apos;S TURN
            </span>
          </div>

          {webglAvailable !== true ? (
            <SceneFallback 
              label="3D CHESS BOARD" 
              detail="WebGL is disabled or unavailable. Chess.AI neural interface requires hardware acceleration." 
            />
          ) : (
            <LazyCanvas className="w-full h-full" fallback={<div className="w-full h-full bg-[#03060f] animate-pulse" />}>
              <Canvas
                shadows
                camera={{ position: [0, 6, 7], fov: 48 }}
                style={{ background: '#03060f' }}
                gl={{ antialias: true }}
              >
                <ChessBoardScene
                  pieces={pieces}
                  selectedPieceId={selectedPieceId}
                  validMoves={validMoves}
                  onPieceSelect={handlePieceSelect}
                  onSquareClick={handleSquareClick}
                />
              </Canvas>
            </LazyCanvas>
          )}
        </div>

        {/* AI Controls & Move Log Sidebar */}
        <div className="chess-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #30363d', marginBottom: 16 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#8b949e', letterSpacing: 1 }}>ENGINE ANALYTICS</div>
            <span 
              className="chess-indicator" 
              style={{
                backgroundColor: aiThinking ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                color: aiThinking ? '#f59e0b' : '#10b981'
              }}
            >
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'currentColor'
              }} />
              {aiThinking ? 'THINKING' : 'ONLINE'}
            </span>
          </div>

          {/* Analytics stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="chess-stat-card">
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#8b949e' }}>DEPTH</div>
              <div style={{ fontSize: 14, fontWeight: 'semibold', color: '#e2e8f0', fontFamily: 'monospace', marginTop: 2 }}>{depth} plies</div>
            </div>
            <div className="chess-stat-card">
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#8b949e' }}>EVALUATION</div>
              <div style={{ fontSize: 14, fontWeight: 'semibold', color: '#10b981', fontFamily: 'monospace', marginTop: 2 }}>{evalScore}</div>
            </div>
          </div>

          {/* Move logs */}
          <div className="chess-log-container">
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Output Log</div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4, fontFamily: 'monospace', fontSize: 10, color: '#94a3b8' }}>
              {moveList.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: '#10b981', userSelect: 'none' }}>&gt;</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="chess-buttons-container">
            <button 
              onClick={triggerAiMove}
              disabled={aiThinking || moveIndex >= aiMoves.length}
              className="chess-btn-primary"
            >
              {aiThinking ? 'Thinking...' : 'AI Move'}
            </button>
            
            <button 
              onClick={resetGame}
              className="chess-btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard3D;
