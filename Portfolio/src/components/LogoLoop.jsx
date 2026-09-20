import { useRef, useEffect, useState } from 'react';
import './LogoLoop.css';

export default function LogoLoop({
  logos = [],
  speed = 45,
  direction = 'left',
  width = '100%',
  gap = 84,
  logoHeight = 52,
  hoverSpeed = 0,
  fadeOut = true,
  scaleOnHover = true,
  renderItem,
  ariaLabel = 'Technologies and tools marquee',
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const offsetRef = useRef(0);
  const animFrameId = useRef(null);
  const lastTimeRef = useRef(performance.now());

  // Duplicate items to ensure seamless infinite loop
  const displayLogos = [...logos, ...logos, ...logos];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let currentOffset = offsetRef.current;

    const animate = (currentTime) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const currentSpeed = isHovered ? hoverSpeed : speed;
      const move = currentSpeed * dt * (direction === 'left' ? 1 : -1);

      currentOffset += move;

      const singleSetWidth = track.scrollWidth / 3;
      if (singleSetWidth > 0) {
        if (currentOffset >= singleSetWidth) {
          currentOffset -= singleSetWidth;
        } else if (currentOffset <= 0) {
          currentOffset += singleSetWidth;
        }
      }

      offsetRef.current = currentOffset;
      track.style.transform = `translate3d(${-currentOffset}px, 0, 0)`;

      animFrameId.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [speed, direction, hoverSpeed, isHovered, logos]);

  return (
    <div
      ref={containerRef}
      className={`logo-loop-container ${fadeOut ? 'logo-loop-fade' : ''} ${className}`}
      style={{ width, ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        ref={trackRef}
        className="logo-loop-track"
        style={{ gap: `${gap}px` }}
      >
        {displayLogos.map((item, idx) => {
          if (renderItem) {
            return renderItem(item, idx);
          }

          if (item.node || item.icon) {
            return (
              <div
                key={idx}
                className={`logo-loop-item ${scaleOnHover ? 'scale-hover' : ''}`}
                style={{
                  height: `${logoHeight}px`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={item.name || item.alt || ''}
              >
                {item.node || item.icon}
              </div>
            );
          }

          return (
            <img
              key={idx}
              src={typeof item === 'string' ? item : item.src}
              alt={item.alt || item.name || ''}
              className={`logo-loop-item ${scaleOnHover ? 'scale-hover' : ''}`}
              style={{
                height: `${logoHeight}px`,
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
