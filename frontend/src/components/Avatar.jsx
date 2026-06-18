// CSS-only illustrated placeholder avatar, deterministic from person traits.
// PRODUCTION: replace with real employee photo (same rounded-square frame),
// keeping this as the initials/illustration fallback when a photo is missing.

const abs = { position: 'absolute' }

export default function Avatar({ person = {}, size = 96, photoUrl }) {
  const hue = person.hue != null ? person.hue : 205
  const skin = person.skin || '#e8b489'
  const hair = person.hair || 'short'
  const hc = person.hairColor || '#2b2b2b'

  const wrap = {
    width: size,
    height: size,
    borderRadius: size * 0.3,
    background: `hsl(${hue} 72% 90%)`,
    position: 'relative',
    overflow: 'hidden',
    flex: 'none',
  }

  if (photoUrl) {
    return (
      <div style={wrap} role="img" aria-label={person.name || 'employee photo'}>
        <img
          src={photoUrl}
          alt={person.name || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }

  return (
    <div style={wrap} role="img" aria-label={person.name || 'illustrated avatar'}>
      {hair === 'long' && (
        <>
          <div style={{ ...abs, width: '15%', height: '44%', left: '15%', top: '32%', borderRadius: '40%', background: hc }} />
          <div style={{ ...abs, width: '15%', height: '44%', left: '70%', top: '32%', borderRadius: '40%', background: hc }} />
        </>
      )}
      {hair !== 'bald' && (
        <div style={{ ...abs, width: '68%', height: '46%', left: '16%', top: '13%', borderRadius: '50% 50% 46% 46%', background: hc }} />
      )}
      <div style={{ ...abs, width: '58%', height: '58%', left: '21%', top: '30%', borderRadius: '50%', background: skin }} />
      {hair === 'bun' && (
        <div style={{ ...abs, width: '26%', height: '26%', left: '37%', top: '2%', borderRadius: '50%', background: hc }} />
      )}
      <div style={{ ...abs, width: '8%', height: '10%', left: '37%', top: '50%', borderRadius: '50%', background: '#33312f' }} />
      <div style={{ ...abs, width: '8%', height: '10%', left: '55%', top: '50%', borderRadius: '50%', background: '#33312f' }} />
      <div style={{ ...abs, width: '20%', height: '11%', left: '40%', top: '64%', borderRadius: '0 0 999px 999px', background: '#cf7066' }} />
    </div>
  )
}
