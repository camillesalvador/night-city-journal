/** Pan a scrollable map and zoom around a stable point, without changing selections. */
export function attachMapNavigation(viewport, {zoom, onZoom}) {
  const canvas = viewport.querySelector('.map-canvas');
  let currentZoom = zoom;
  let gesture = null;
  let dragged = false;
  function setZoom(value, point) {
    const next = Math.max(100, Math.min(1000, value));
    const bounds = viewport.getBoundingClientRect();
    const anchor = point || {x: bounds.width / 2, y: bounds.height / 2};
    const ratio = next / currentZoom;
    const left = (viewport.scrollLeft + anchor.x) * ratio - anchor.x;
    const top = (viewport.scrollTop + anchor.y) * ratio - anchor.y;
    canvas.style.width = `${next}%`;
    currentZoom = next;
    viewport.scrollLeft = left;
    viewport.scrollTop = top;
    onZoom(next);
  }
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.pointerType === 'touch') return;
    dragged = false;
    gesture = {x:event.clientX, y:event.clientY, left:viewport.scrollLeft, top:viewport.scrollTop};
  });
  viewport.addEventListener('pointermove', event => {
    if (!gesture) return;
    const dx=event.clientX-gesture.x, dy=event.clientY-gesture.y;
    if (!dragged && Math.hypot(dx,dy)<5) return;
    dragged=true;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('panning');
    viewport.scrollLeft=gesture.left-dx;
    viewport.scrollTop=gesture.top-dy;
  });
  const end=event=>{
    gesture=null;
    viewport.classList.remove('panning');
    if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
  };
  viewport.addEventListener('pointerup',end);
  viewport.addEventListener('pointercancel',end);
  viewport.addEventListener('pointerleave',event=>{if(!dragged)end(event);});
  viewport.addEventListener('click',event=>{
    if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}
  },true);
  viewport.addEventListener('wheel',event=>{
    if(!event.ctrlKey&&!event.metaKey)return;
    event.preventDefault();
    const bounds=viewport.getBoundingClientRect();
    setZoom(currentZoom*Math.exp(-event.deltaY*.005),{x:event.clientX-bounds.left,y:event.clientY-bounds.top});
  },{passive:false});
  viewport.addEventListener('keydown',event=>{
    if(event.key==='+'||event.key==='='){event.preventDefault();setZoom(currentZoom*1.25);}
    if(event.key==='-'){event.preventDefault();setZoom(currentZoom/1.25);}
  });
  return {setZoom};
}
