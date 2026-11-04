import React, { useLayoutEffect, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import { Format, MONO } from '../brand';
import { easeIO, lerp, prog } from '../anim';

// Logical viewport sizes (CSS px the app is laid out at)
export const DESK = { vw: 1120, vh: 720, chrome: 46 };
export const PHONE = { vw: 390, vh: 640, bezel: 14, status: 44, url: 40 };

export const deviceSize = (format: Format) =>
  format === 'desktop'
    ? { w: DESK.vw, h: DESK.vh + DESK.chrome }
    : { w: PHONE.vw + PHONE.bezel * 2, h: PHONE.vh + PHONE.status + PHONE.url + PHONE.bezel * 2 };

export const Device: React.FC<{ format: Format; url: string; children: React.ReactNode; devRef?: React.Ref<HTMLDivElement> }> = ({ format, url, children, devRef }) => {
  const { w, h } = deviceSize(format);
  if (format === 'desktop') {
    return (
      <div ref={devRef} style={{ width: w, height: h, borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 40px 80px -20px rgba(15,23,42,.35), 0 0 0 1px rgba(15,23,42,.10)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: DESK.chrome, flexShrink: 0, background: '#eef2f7', borderBottom: '1px solid #dbe2ea', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
          <div style={{ marginLeft: 70, flex: 1, maxWidth: 560, height: 28, borderRadius: 8, background: '#fff', border: '1px solid #dbe2ea', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', fontFamily: MONO, fontSize: 13, color: '#334155' }}>
            <span style={{ fontSize: 11 }}>🔒</span>
            {url}
          </div>
        </div>
        <div style={{ position: 'relative', width: DESK.vw, height: DESK.vh, overflow: 'hidden' }}>{children}</div>
      </div>
    );
  }
  return (
    <div ref={devRef} style={{ width: w, height: h, borderRadius: 58, background: '#0f172a', padding: PHONE.bezel, boxShadow: '0 40px 80px -20px rgba(15,23,42,.45), inset 0 0 0 2px #334155' }}>
      <div style={{ width: PHONE.vw, height: h - PHONE.bezel * 2, borderRadius: 46, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ height: PHONE.status, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
          <span>9:41</span>
          <span style={{ position: 'absolute', left: '50%', top: 10, transform: 'translateX(-50%)', width: 110, height: 30, borderRadius: 20, background: '#0f172a' }} />
          <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              {[5, 7, 9, 11].map((hh) => (
                <span key={hh} style={{ width: 3, height: hh, background: '#0f172a', borderRadius: 1 }} />
              ))}
            </span>
            <span style={{ width: 24, height: 11, border: '1.5px solid #0f172a', borderRadius: 3, padding: 1 }}>
              <span style={{ display: 'block', width: '75%', height: '100%', background: '#0f172a', borderRadius: 1 }} />
            </span>
          </span>
        </div>
        <div style={{ height: PHONE.url, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 14px 6px' }}>
          <div style={{ width: '100%', height: 32, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#334155', fontFamily: MONO }}>
            <span style={{ fontSize: 10 }}>🔒</span>
            {url}
          </div>
        </div>
        <div style={{ position: 'relative', width: PHONE.vw, height: PHONE.vh, overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  );
};

export type CamKey = { at: number; target?: string; zoom?: number; dur?: number; dx?: number; dy?: number };

/**
 * Camera rig. Measures anchor elements ([data-a]) inside the device every frame
 * and moves/zooms the device so the target sits at stage centre. Clamped so the
 * device never leaves an empty gap inside the stage once zoomed past fit.
 */
export const Camera: React.FC<{ format: Format; stage: { w: number; h: number }; keys: CamKey[]; url: string; children: React.ReactNode }> = ({ format, stage, keys, url, children }) => {
  const f = useCurrentFrame();
  const wrap = useRef<HTMLDivElement>(null);
  const dev = useRef<HTMLDivElement>(null);
  const size = deviceSize(format);
  const pad = format === 'desktop' ? 40 : 30;
  const z0 = Math.min((stage.w - pad * 2) / size.w, (stage.h - pad * 2) / size.h);

  useLayoutEffect(() => {
    if (!wrap.current || !dev.current) return;
    const d = dev.current.getBoundingClientRect();
    const s = d.width / size.w;
    const resolve = (k: CamKey) => {
      const z = z0 * (k.zoom ?? 1);
      let x = size.w / 2;
      let y = size.h / 2;
      if (k.target) {
        const el = dev.current!.querySelector(`[data-a="${k.target}"]`);
        if (el) {
          const r = el.getBoundingClientRect();
          x = (r.left - d.left + r.width / 2) / s;
          y = (r.top - d.top + r.height / 2) / s;
        }
      }
      x += k.dx ?? 0;
      y += k.dy ?? 0;
      // clamp
      const hw = stage.w / 2 / z;
      const hh = stage.h / 2 / z;
      x = size.w * z <= stage.w ? size.w / 2 : Math.min(Math.max(x, hw), size.w - hw);
      y = size.h * z <= stage.h ? size.h / 2 : Math.min(Math.max(y, hh), size.h - hh);
      return { x, y, z };
    };
    let cur = resolve(keys[0]);
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i];
      if (f < k.at) break;
      const t = prog(f, k.at, k.at + (k.dur ?? 20), easeIO);
      const nxt = resolve(k);
      cur = { x: lerp(cur.x, nxt.x, t), y: lerp(cur.y, nxt.y, t), z: lerp(cur.z, nxt.z, t) };
      if (t < 1) break;
    }
    wrap.current.style.transform = `translate(${stage.w / 2}px, ${stage.h / 2}px) scale(${cur.z}) translate(${-cur.x}px, ${-cur.y}px)`;
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div ref={wrap} style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${(stage.w - size.w * z0) / 2}px, ${(stage.h - size.h * z0) / 2}px) scale(${z0})` }}>
        <Device format={format} url={url} devRef={dev}>
          {children}
        </Device>
      </div>
    </div>
  );
};

