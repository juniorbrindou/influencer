import React from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

const ForegroundAnimation: React.FC = () => {
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20"> {/* z-index élevé et ignore les clics */}
      <Particles
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          particles: {
            color: { value: "#d4af37" }, // Couleur or
            links: {
              color: "#d4af37",
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1
            },
            move: {
              enable: true,
              speed: 2,
              outModes: "out"
            },
            number: { 
              density: { enable: true }, 
              value: 50 // Réduit le nombre pour moins de surcharge
            },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } }
          },
          detectRetina: true
        }}
      />
    </div>
  );
};

export default ForegroundAnimation;