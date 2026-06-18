// Prototype seed data — Grid Dynamics MX colleagues.
// PRODUCTION: replace with backend `/people` + `/leaderboard` endpoints.

const FIRST = [
  'Sofía', 'Mateo', 'Valentina', 'Diego', 'Camila', 'Santiago', 'Regina', 'Emiliano',
  'Ximena', 'Sebastián', 'Renata', 'Leonardo', 'Daniela', 'Ángel', 'Fernanda', 'Iker',
  'Andrea', 'Maximiliano', 'Paula', 'Adrián', 'Lucía', 'Bruno', 'Mariana', 'Carlos',
]
const LAST = [
  'García', 'Hernández', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez',
  'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Ortiz',
  'Gutiérrez', 'Chávez', 'Ramos', 'Ruiz', 'Vargas', 'Castillo', 'Jiménez', 'Mendoza',
]
const ROLES = [
  'Software Engineer', 'Senior Engineer', 'QA Engineer', 'Data Scientist', 'DevOps Engineer',
  'Product Manager', 'UX Designer', 'Engineering Manager', 'Scrum Master', 'Solutions Architect',
]
const DEPTS = ['Engineering', 'Data', 'Design', 'Product', 'QA', 'DevOps']
const SKINS = ['#f0c9a6', '#e8b489', '#d49a6a', '#a56c43', '#8d5524', '#fcd9b8']
const HAIRS = ['short', 'long', 'bun', 'bald']
const HAIR_COLORS = ['#2b2b2b', '#4a3320', '#6b4f2a', '#1a1a1a', '#7a5c3e']

export const PEOPLE = FIRST.map((first, i) => ({
  id: `emp_${i + 1}`,
  first,
  name: `${first} ${LAST[i]}`,
  role: ROLES[i % ROLES.length],
  dept: DEPTS[i % DEPTS.length],
  hue: (i * 37) % 360,
  skin: SKINS[i % SKINS.length],
  hair: HAIRS[i % HAIRS.length],
  hairColor: HAIR_COLORS[i % HAIR_COLORS.length],
  // seeded leaderboard points for colleagues (prototype only)
  points: 900 - i * 28 + (i % 5) * 13,
}))

export const DEPARTMENTS = [...new Set(PEOPLE.map((p) => p.dept))]
