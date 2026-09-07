/**
 * Blind-sketch reveal: the drawn avatar sits on top and fades out as the real
 * photo underneath un-blurs, driven by `progress` (0..100).
 */
export default function RevealAvatar({ drawn, photo, progress = 0, size = 64, className = "" }) {
  const blur = Math.max(0, (1 - progress / 100) * 18);
  const sketchOpacity = Math.max(0, 1 - progress / 100);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-base-200 ink-border-sm ${className}`}
      style={{ width: size, height: size }}
    >
      {photo && (
        <img
          src={photo}
          alt="photo"
          className="absolute inset-0 size-full object-cover"
          style={{ filter: `blur(${blur}px)` }}
        />
      )}
      {drawn && (
        <img
          src={drawn}
          alt="sketch"
          className="absolute inset-0 size-full object-cover transition-opacity duration-700"
          style={{ opacity: photo ? sketchOpacity : 1 }}
        />
      )}
    </div>
  );
}
