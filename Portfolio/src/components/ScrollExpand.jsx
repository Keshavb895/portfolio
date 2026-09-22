import { useCallback, useEffect, useRef } from 'react';
import './ScrollExpand.css';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

const ScrollExpand = ({
  src = '',
  mediaType = 'image',
  poster = '',
  alt = '',
  title = '',
  scrollHint = '',
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  startBlur = 16,
  endBlur = 0,
  mediaZoom = 1.35,
  scrollDistance = 2.0,
  holdDistance = 1.0,
  smoothing = 0,
  overlayScrim = 0.5,
  useWindowScroll = false,
  enabled = true,
  children,
  className = '',
  style,
  ...rest
}) => {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const mediaRef = useRef(null);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);
  const scrimRef = useRef(null);
  const hintRef = useRef(null);

  const propsRef = useRef({});
  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    startBlur,
    endBlur,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled
  };

  const applyProgress = useCallback(p => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const c = propsRef.current;
    const e = smoothstep(0, 1, p);

    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const effectiveStartW = winW <= 600 ? 80 : winW <= 900 ? 64 : c.startWidth;
    const effectiveStartH = winW <= 600 ? 48 : winW <= 900 ? 52 : c.startHeight;

    const w = effectiveStartW + (100 - effectiveStartW) * e;
    const h = effectiveStartH + (100 - effectiveStartH) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

    const blurVal = Math.max(0, c.startBlur + (c.endBlur - c.startBlur) * e);
    media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;
    media.style.filter = blurVal > 0.2 ? `blur(${blurVal.toFixed(1)}px)` : 'none';

    if (scrimRef.current) {
      scrimRef.current.style.opacity = `${c.overlayScrim * e}`;
    }

    if (titleRef.current) {
      const out = smoothstep(0.3, 0.82, p);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-32 * out}px, 0) scale(${1 + 0.05 * out})`;
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.15, p);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${10 * gone}px, 0)`;
    }

    if (overlayRef.current) {
      const inn = smoothstep(0.65, 1, p);
      overlayRef.current.style.opacity = `${inn}`;
      overlayRef.current.style.transform = `translate3d(0, ${20 * (1 - inn)}px, 0)`;
      overlayRef.current.style.pointerEvents = inn > 0.5 ? 'auto' : 'none';
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;

    const measure = () => {
      const c = propsRef.current;
      stageH = c.useWindowScroll ? window.innerHeight : root.clientHeight;
      if (stageH <= 0) stageH = window.innerHeight || 800;

      stage.style.height = `${stageH}px`;
      const totalTrackHeight = stageH * (1 + Math.max(0.1, c.scrollDistance) + Math.max(0, c.holdDistance));
      track.style.height = `${totalTrackHeight}px`;

      const w = window.innerWidth || root.clientWidth || stageH;
      stage.style.setProperty('--se-title-size', `${clamp(w * 0.075, 24, 80)}px`);
    };

    const readProgress = () => {
      const c = propsRef.current;
      if (!c.enabled) return 1;
      const sH = stageH || window.innerHeight || 800;
      const span = sH * Math.max(0.01, c.scrollDistance);

      if (c.useWindowScroll) {
        if (!track) return 0;
        const top = track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const c = propsRef.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }
      applyProgress(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      if (propsRef.current.smoothing <= 0 || reduceMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      measure();
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    // Re-measure after initial layout settlement
    const t1 = setTimeout(measure, 60);
    const t2 = setTimeout(measure, 300);

    const scroller = useWindowScroll ? window : root;
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    let ro = null;
    if (!useWindowScroll) {
      ro = new ResizeObserver(onResize);
      ro.observe(root);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, [applyProgress, useWindowScroll]);

  const media =
    mediaType === 'video' ? (
      <video
        ref={mediaRef}
        className="scroll-expand__media"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
    ) : (
      <img ref={mediaRef} className="scroll-expand__media" src={src} alt={alt} draggable={false} />
    );

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${useWindowScroll ? '' : 'scroll-expand--scroller'} ${className}`.trim()}
      style={style}
      {...rest}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {media}
            <div ref={scrimRef} className="scroll-expand__scrim" />
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <div ref={titleRef} className="scroll-expand__title">
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;
