// Component ported and stabilized from https://codepen.io/JuanFuentes/full/rgXKGQ

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

const dist = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance, maxDist, minVal, maxVal) => {
  if (!isFinite(maxDist) || maxDist <= 0) return minVal;
  const ratio = Math.min(Math.max(distance / maxDist, 0), 1);
  const val = maxVal - (maxVal - minVal) * ratio;
  return Math.max(minVal, Math.min(maxVal, val));
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const TextPressure = ({
  text = 'Compressa',
  fontFamily = 'Roboto Flex',
  fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap',

  width = true,
  weight = true,
  italic = true,
  alpha = false,

  flex = true,
  stroke = false,
  scale = false,

  textColor = '#FFFFFF',
  strokeColor = '#FF0000',
  className = '',

  minFontSize = 48,
  minWidth = 42,
  maxWidth = 125,
  minWeight = 350,
  maxWeight = 800
}) => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const spansRef = useRef([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split('');

  // Mouse / Touch tracking
  useEffect(() => {
    const handleMouseMove = e => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = e => {
      const t = e.touches[0];
      if (t) {
        cursorRef.current.x = t.clientX;
        cursorRef.current.y = t.clientY;
      }
    };
    const handleTouchStart = e => {
      const t = e.touches[0];
      if (t) {
        cursorRef.current.x = t.clientX;
        cursorRef.current.y = t.clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    if (containerRef.current) {
      const { left, top, width: w, height: h } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + w / 2;
      mouseRef.current.y = top + h / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Robust sizing calculation that fits both width and height without visual blowout
  const setSize = useCallback(() => {
    if (!containerRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
    if (containerW <= 0 || containerH <= 0) return;

    // Detect actual letter spacing / gap
    let gapTotal = 0;
    if (titleRef.current) {
      const cs = window.getComputedStyle(titleRef.current);
      const gapVal = parseFloat(cs.gap || cs.columnGap);
      if (!isNaN(gapVal) && gapVal > 0) {
        gapTotal = gapVal * (chars.length - 1);
      }
    }
    if (gapTotal === 0) {
      gapTotal = Math.max(0, (chars.length - 1) * 32);
    }

    const availableW = Math.max(containerW - gapTotal, 60);
    // Dynamic width ratio based on minWidth setting
    const targetCharWidthRatio = Math.max(0.30, (minWidth / 100) * 0.62);
    const fontSizeFromWidth = availableW / (chars.length * targetCharWidthRatio);
    // Fill up to ~82% of container height for taller, elongated letter length
    const fontSizeFromHeight = containerH * 0.82;

    let targetFontSize = Math.min(fontSizeFromWidth, fontSizeFromHeight);
    const effectiveMinFontSize = Math.min(minFontSize, fontSizeFromWidth);
    targetFontSize = Math.max(targetFontSize, effectiveMinFontSize);

    setFontSize(Math.round(targetFontSize));
    setScaleY(1);
    setLineHeight(1);
  }, [chars.length, minFontSize, minWidth]);

  // ResizeObserver for rock-solid reactive resizing on container changes
  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver(() => {
      setSize();
    });
    ro.observe(containerRef.current);

    const debouncedSetSize = debounce(setSize, 60);
    window.addEventListener('resize', debouncedSetSize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', debouncedSetSize);
    };
  }, [setSize]);

  // Fonts ready listener to prevent fallback font measurement race conditions
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        setSize();
      });
      const onLoadingDone = () => setSize();
      document.fonts.addEventListener('loadingdone', onLoadingDone);
      return () => {
        document.fonts.removeEventListener('loadingdone', onLoadingDone);
      };
    }
  }, [setSize]);

  // Initial stabilization timers on mount
  useEffect(() => {
    setSize();
    const t1 = setTimeout(setSize, 50);
    const t2 = setTimeout(setSize, 150);
    const t3 = setTimeout(setSize, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [setSize]);

  // Animation frame loop for variable font pressure dynamics
  useEffect(() => {
    let rafId;
    const animate = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = Math.max(titleRect.width / 2, 1);

        spansRef.current.forEach(span => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
          };

          const d = dist(mouseRef.current, charCenter);

          // Full, expansive width and bold weight at rest; dynamically swells higher on proximity
          const wdth = width ? Math.floor(getAttr(d, maxDist, minWidth, maxWidth)) : minWidth;
          const wght = weight ? Math.floor(getAttr(d, maxDist, minWeight, maxWeight)) : minWeight;
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : 0;
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : 1;

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha, minWidth, maxWidth, minWeight, maxWeight]);

  const styleElement = useMemo(() => {
    return (
      <style>{`
        @import url('${fontUrl}');

        .flex {
          display: flex;
          justify-content: space-between;
        }

        .stroke span {
          position: relative;
          color: ${textColor};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: 3px;
          -webkit-text-stroke-color: ${strokeColor};
        }

        .text-pressure-title {
          color: ${textColor};
        }
      `}</style>
    );
  }, [fontFamily, fontUrl, textColor, strokeColor]);

  const dynamicClassName = [className, flex ? 'flex' : '', stroke ? 'stroke' : ''].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {styleElement}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${dynamicClassName}`}
        style={{
          fontFamily,
          textTransform: 'uppercase',
          fontSize: fontSize,
          lineHeight: 1,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center center',
          margin: 0,
          textAlign: 'center',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          fontWeight: minWeight,
          width: '100%'
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={el => {
              spansRef.current[i] = el;
            }}
            data-char={char}
            style={{
              display: 'inline-block',
              color: stroke ? undefined : textColor,
              fontVariationSettings: `'wght' ${minWeight}, 'wdth' ${minWidth}, 'ital' 0`
            }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;
